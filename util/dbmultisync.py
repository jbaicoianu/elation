#!/usr/bin/python -u

import sys
import getopt
import time
import threading

import _mysql # using _mysql C API wrapper functions is significantly faster/less memory intensive than MySQLdb

#import gc
#gc.set_debug(gc.DEBUG_STATS)

USAGE = 'Usage: dbsync.py -d <database> -t <tablename> -u <user> -p <password> -c <comparecol> [-w] [-q] [-v] <server1> <server2> [serverN...]'

class DBSync:
  """
  Performs an n-way sync of a table which resides on any number of hosts.  
  Works by fetching the primary key indexes from each host, picking the
  best copy based on the value of <comparecol>, and copying that data to
  all hosts which had stale or missing data.

  Steps:

    SHOW indexes FROM <tablename>, determine primary key columns
    foreach servers as server (in parallel):
      SET sql_log_bin = 0
      SELECT <primary key columns> FROM <tablename>

    correlate index lists from each server to generate list of rows which are stale or missing

    foreach changed row:
      from server with "best" copy: SELECT * FROM <tablename> WHERE <primary key>
      foreach servers as server: (in parallel)
        INSERT INTO <tablename> VALUES <values> ON DUPLICATE KEY UPDATE <values>=VALUES(values);

  """
  dbconn = {}
  primarykeys = None
  records = {}

  # logging level defines
  LOGLEVELS = {
      'ERROR': 0,
      'INFO': 1,
      'DEBUG':  2
  }

  def __init__(self, opts):
    self.appstart = time.time()
    self.loglevel = opts.get('loglevel', self.LOGLEVELS['INFO'])
    self.log_debug("Init database synchronization")
    self.hosts = opts.get('hosts', None)
    self.database = opts.get('database', None)
    self.tablename = opts.get('tablename', None)
    self.limit = opts.get('limit', None)
    self.write = opts.get('write', False)
    self.stopped = False

    connargs = {}
    for k in ('user', 'password', 'database', 'tablename'):
      if k in opts:
        connargs[k] = opts[k]
      else:
        connargs[k] = False

    try:
      if connargs['user'] and connargs['database'] and connargs['tablename']:
        self.connect(self.hosts, connargs)
        self.get_tableschema(opts)

        if self.primarykeys is not None:
          diffs = self.get_index_data()
          self.synchronize_diffs(diffs, 100)
        else:
          self.log_error("could not determine primary keys for table %s" % (self.tablename))
        self.disconnect()
      else:
        self.log_error("missing args")
    except KeyboardInterrupt:
      self.log_error('Ctrl+C pressed, terminating')
      self.stopped = True


  def connect(self, servers, connargs):
    """
    Establish SQL connection to all servers, and disable binary log replication for this session
    """
    for server in servers:
      self.dbconn[server] = _mysql.connect(server, connargs['user'], connargs['password'], connargs['database'])
      self.dbconn[server].query("SET sql_log_bin = 0")
      self.log_debug("connect: %s@%s:%s" % (connargs['user'], server, connargs['database']))

  def disconnect(self):
    """
    Close all SQL connections
    """
    for k in self.dbconn:
      self.dbconn[k].close()

  def get_comparecols(self, defaultcol=None):
    """
    Determine columns to be used for comparison of data
    """
    # TODO - determine compare column automatically by comparing the table's schema with its indexes, guessing potential timestamps, etc
    if defaultcol is not None:
      return defaultcol.split(',')

  def get_tableschema(self, opts):
    """
    Determine schema and indexes for the current table
    """
    sqlquery = "DESCRIBE %s" % (self.tablename)
    conn = self.dbconn[self.hosts[0]]
    cols = []
    conn.query(sqlquery)
    result = conn.use_result()
    row = result.fetch_row()
    while row:
      cols.append(row[0])
      row = result.fetch_row()

    self.tableschema = dict((col[0], dict(zip(['name', 'type', 'null', 'key', 'default', 'extra'], col))) for col in cols)
    self.columnnames = [col[0] for col in cols]
    self.comparecols = self.get_comparecols(opts['compare'])
    self.primarykeys = self.get_primarykeys()

  def get_primarykeys(self):
    """
    Determine primary key columns for current table
    """
    primarykeys = []
    sqlquery = "SHOW indexes FROM %s" % (self.tablename)
    conn = self.dbconn[self.hosts[0]]
    query = conn.query(sqlquery)
    result = conn.use_result()
    rows = result.fetch_row()
    while rows:
      for row in rows:
        if row[2] == 'PRIMARY':
          primarykeys.append(row[4])
      rows = result.fetch_row()
    return primarykeys

  def get_record_key(self, data):
    """
    Generate a record key from its raw data
    """
    try:
      return '.'.join([str(data[x]) for x in self.primarykeys])
    except:
      return ''
        
  def get_record(self, key):
    """
    Return a free DBSyncRecord object.  Uses object pooling to reduce memory thrashing
    """
    record = None
    if key in self.indexdata:
      record = self.indexdata[key]
    else:
      try:
        record = self.recordpool.pop()
      except IndexError:
        #self.log_debug('allocate record: %s' % (key))
        record = DBSyncRecord(keys=self.primarykeys, comparecols=self.comparecols, cols=self.columnnames, key=key, hosts=self.hosts)
      self.indexdata[key] = record
    return record

  def update_record(self, host, data):
    """
    Update the host-specific data for a given record. 
    Release records back to the pool as we go to keep memory usage reasonable.
    """
    key = self.get_record_key(data)
    record = self.get_record(key)
    record.set_hostdata(host, data)

    if record.complete:
      if not record.get_differences():
        # No differences, so no need to keep tracking this row
        try:
          record.clear()
          self.recordpool.append(record)
          #self.log_debug('deleted record: %s' % (key))
          del self.indexdata[key]
        except KeyError:
          pass

  def get_index_data(self):
    """
    Fetch the index data from each host in parallel
    """
    self.hostdata = dict((h, []) for h in self.hosts)
    self.indexdata = {}
    self.indexlock = threading.RLock()
    self.recordpool = []

    self.indexcols = self.primarykeys + self.comparecols
    query = "SELECT %s FROM %s" % (','.join(self.indexcols), self.tablename)
    if self.limit:
      query += " LIMIT %s" % (self.limit)

    # Launch threads to fetch index data for each server
    threads = []
    for host in self.dbconn:
      #self.get_host_data(host, query)
      thread = threading.Thread(target=self.get_host_data, args=(host, query))
      thread.start()
      threads.append(thread)

    while len(threading.enumerate()) > 1 or sum([len(self.hostdata[h]) for h in self.hosts]) > 0 and not self.stopped:
      # As long as we have running threads and haven't been forced to stop, 
      # pop any new hostdata that the threads have collected and process it

      for host in self.hosts:
        if len(self.hostdata[host]) > 0:
          data = self.hostdata[host].pop(0)
          self.update_record(host, data)
          
    # all threads completed
    self.log_debug("done!")

    # clean up any rows which had missing data
    for key in self.indexdata:
      if not self.indexdata[key].complete:
        self.indexdata[key].get_differences()

    return self.indexdata

  def get_host_data(self, host, query):
    """
    Get the index data for a specific host.  This is intended to be run in a thread
    """
    rows = []
    keylen = len(self.primarykeys)

    self.log_info("(%s) fetch index data for %s.%s..." % (host, self.database, self.tablename))
    total = 0
    chunkstart = 0
    chunksize = 10000
    conn = self.dbconn[host]
    conn.query(query)
    results = conn.use_result()
    rows = results.fetch_row(chunksize, 1)

    while rows:
      for row in rows:
        if self.stopped: 
          return
        total = total + 1
        record = None
        self.hostdata[host].append(row)
        # delay the thread slightly if we're getting ahead of the queue processor so we don't eat too much memory
        if len(self.hostdata[host]) > chunksize:
          time.sleep(.1)

      self.log_debug('(%s) loaded index chunk %d-%d' % (host, chunkstart, chunkstart + chunksize - 1))
      chunkstart = chunkstart + chunksize
      rows = results.fetch_row(chunksize, 1)
    self.log_info("(%s) done, loaded %d rows" % (host, total))
    return self.indexdata

  def dump_diffs(self, diffs):
    """
    Output the differences that were found between servers
    """
    diffkeys = diffs.keys()
    self.log_info("Diffs: %d" % (len(diffkeys)))
    for k in diffkeys:
      self.log_info("%40s\t%s" % (k, diffs[k].differences))

  def synchronize_diffs(self, diffs, chunksize):
    """
    Reconcile the differences between all servers
    """
    if not self.write:
      self.dump_diffs(diffs)
      return

    keys = diffs.keys()
    self.log_info("Synchronize %d diffs in chunks of %d" % (len(keys), chunksize))

    # group diffs by their valid hosts and break into chunks
    queue_select = self.group_diffs_by_host(diffs, chunksize)
    queue_insert = dict((host, []) for host in self.hosts)

    self.synchronizing = True

    # launch threads for handling selects and inserts for each server
    threads = []
    for host in self.hosts:
      thread = threading.Thread(target=self.synchronize_diffs_host, args=(host, queue_select, queue_insert, chunksize))
      thread.start()
      threads.append(thread)

    # wait until all threads are complete and no remaining data is left to fetch
    remaining_select = sum([len(queue_select[host]) for host in queue_select])
    while remaining_select > 0 and len(threading.enumerate()) > 1:
      time.sleep(.1)
      remaining_select = sum([len(queue_select[host]) for host in queue_select])

    # finish inserting any remaining items
    for host in queue_insert:
      self.batch_insert(host, queue_insert[host])

    self.synchronizing = False

  def synchronize_diffs_host(self, host, queue_select, queue_insert, chunksize):
    """
    Handle the SELECT and INSERT queues for a specific host.
    Each SELECT from one host generates INSERTs for one or more other hosts.

    This function is intended to be called within a thread
    """
    self.log_debug("(%s) started sync" % (host))
    try:
      while self.synchronizing:
        chunk = queue_select[host].pop(0)
        self.batch_select(host, chunk)

        for key in chunk:
          for mhost in self.indexdata[key].differences["missing"] + self.indexdata[key].differences["stale"]:
            if self.indexdata[key]:
              queue_insert[mhost].append(key)

        # if we have enough inserts queued to make a chunk, send 'em out
        while len(queue_insert[host]) > chunksize:
          batch = [queue_insert[host].pop(0) for x in range(0,chunksize)]
          self.batch_insert(host, batch)


        self.log_debug("(%s) %s" % (host, chunk))
    except (IndexError, KeyError):
      pass

    self.log_debug("(%s) done" % (host))

  def group_diffs_by_host(self, diffs, chunksize):
    """
    Sort diffs into chunks by host
    """
    hostdiffs = {}
    for k in diffs:
      # pick best host based on number of queries queued for each server
      validhosts = diffs[k].differences['valid']
      besthost = 0
      besthostcount = float('inf')
      for i in range(0,len(validhosts)):
        hostkeys = 0
        if validhosts[i] in hostdiffs:
          hostkeys = len(hostdiffs[validhosts[i]]) 
        else:
          hostdiffs[validhosts[i]] = []
        if hostkeys < besthostcount:
          besthost = i
          besthostcount = hostkeys
      hostdiffs[validhosts[besthost]].append(k)

    hostchunks = dict((host, [hostdiffs[host][x:x+chunksize] for x in xrange(0, len(hostdiffs[host]), chunksize)]) for host in hostdiffs)
    return hostchunks


  def sql_quote(self, val):
    """
    Make columns SQL-safe
    """
    if val is None:
      return 'NULL'
    elif isinstance(val, (int,long,float)) or val.isdigit():
      return str(val)
    else:
      return '"' + self.dbconn[self.hosts[0]].escape_string(val) + '"'

  def batch_select(self, host, chunk):
    """
    Perform a batch SELECT for the given chunk from the specified server
    """
    selectkeys = self.primarykeys
    columns = self.columnnames
    sqlwherevals = ') OR ('.join([' AND '.join([selectkeys[k]+'='+self.sql_quote(x[selectkeys[k]]) for k in range(0,len(selectkeys))]) for x in [self.indexdata[key].hostdata[host] for key in chunk]])
    sqlquery = "SELECT %s FROM %s WHERE (%s);" % (','.join(columns), self.tablename, sqlwherevals)
    self.log_debug("===== %s\t%s" % (host, sqlquery))
    conn = self.dbconn[host]
    conn.query(sqlquery)
    result = conn.use_result()
    rows = result.fetch_row(1, 1)
    while rows:
      for row in rows:
        key = self.get_record_key(row)
        self.indexdata[key].set_data(row)
      rows = result.fetch_row(1, 1)

  def batch_insert(self, host, chunk):
    """
    Perform a batch INSERT for the given chunk on the specified server
    """
    if len(chunk) > 0:
      columns = self.columnnames
      sqlinsert = "INSERT INTO %s (%s) VALUES (%s) ON DUPLICATE KEY UPDATE %s;" % (self.tablename, ','.join(columns), '),('.join([','.join([self.sql_quote(self.indexdata[key].data[x]) for x in columns]) for key in chunk]), ','.join(filter(None, [c+'=VALUES('+c+')' if c not in self.primarykeys else '' for c in columns])))
      self.log_debug("===== %s\t%s" % (host, sqlinsert))
      if self.write:
        conn = self.dbconn[host]
        conn.query(sqlinsert)

  def log_error(self, msg):
    self.log(self.LOGLEVELS['ERROR'], msg)
  
  def log_info(self, msg):
    self.log(self.LOGLEVELS['INFO'], msg)
  
  def log_debug(self, msg):
    self.log(self.LOGLEVELS['DEBUG'], msg)
  
  def log(self, loglevel, msg):
    if loglevel <= self.loglevel:
      logids = dict((self.LOGLEVELS[x], x) for x in self.LOGLEVELS)
      tdiff = time.time() - self.appstart
      fullmsg = "%12.4f [%s] %s" % (tdiff, logids[loglevel], msg)
      try:
        print fullmsg
      except IOError:
        sys.stderr.write(fullmsg)

class DBSyncRecord:
  """
  Represents one row of data, as seen on each server
  """
  keys = {}
  data = None
  complete = False
  differences = None

  def __init__(self, key, keys, comparecols, cols, data=None, hosts=None):
    self.key = key
    self.keys = keys
    self.comparecols = comparecols
    self.hosts = hosts
    self.cols = cols
    self.clear()
    self.data = data

  def clear(self):
    """
    Reset the object so it can be reused
    """
    self.data = None
    self.complete = False
    self.differences = None
    self.hostdata = dict((h, None) for h in self.hosts)

  def compare(self, item1, item2):
    """
    Perform sorting based on compare columns
    """
    for col in self.comparecols:
      if item1[col] < item2[col]:
        return -1
      elif item1[col] > item2[col]:
        return 1
    # all columns were equal
    return 0

  def set_hostdata(self, host, data, fieldnames=None):
    """
    Update the metadata about this row as it exists on the specified server
    """
    if fieldnames is not None:
      self.hostdata[host] = {}
      for x in range(0,len(fieldnames)):
        self.hostdata[host][fieldnames[x]] = data[x] 
    else:
      self.hostdata[host] = data
    self.check_complete()

  def check_complete(self):
    """
    Determine whether we have information from all servers about this row yet
    If we do, reconcile the differences automatically
    """
    if not self.complete:
      self.complete = all([self.hostdata[x] is not None for x in self.hosts])
      if self.complete:
        self.different = self.get_differences()
    return self.complete

  def set_data(self, data):
    """
    Sets the full row data for this row
    """
    self.data = data

  def get_differences(self):
    """
    Determine if this record is stale or missing on any servers
    """
    if (self.differences):
      return self.differences

    different = False
    missing = []
    stale = []
    valid = []
    besthost = None
    for i in range(0, len(self.hosts)):
      if self.hosts[i] in self.hostdata and self.hostdata[self.hosts[i]] != None:
        currhost = self.hosts[i]

        if besthost is None:
          besthost = currhost
          valid.append(besthost)
        else:
          compare = self.compare(self.hostdata[currhost], self.hostdata[besthost])
          if compare == 1:
            different = True
            stale.extend(valid)
            besthost = currhost
            valid = [currhost]
          elif compare == -1:
            different = True
            stale.append(currhost)
          else:
            valid.append(currhost)
      else:
        different = True
        missing.append(self.hosts[i])

    if different:
      self.differences = {'valid': valid, 'missing': missing, 'stale': stale}

    return self.differences

if __name__ == "__main__":
  syncopts = {}

  opts, args = getopt.getopt(sys.argv[1:], "d:t:u:p:c:l:wvq", ["database=", "table=", "user=", "password=", "compare=", "limit=", "write", "verbose", "quiet"])
  for o, a in opts:
    if o in ("-d", "--database"):
      syncopts['database'] = a
    if o in ("-t", "--table"):
      syncopts['tablename'] = a
    elif o in ("-u", "--user"):
      syncopts['user'] = a
    elif o in ("-p", "--password"):
      syncopts['password'] = a
    elif o in ("-c", "--compare"):
      syncopts['compare'] = a
    elif o in ("-l", "--limit"):
      syncopts['limit'] = a
    elif o in ("-v", "--verbose"):
      syncopts['loglevel'] = DBSync.LOGLEVELS['DEBUG']
    elif o in ("-q", "--quiet"):
      syncopts['loglevel'] = DBSync.LOGLEVELS['ERROR']
    elif o in ("-w", "--write"):
      syncopts['write'] = True

  syncopts['hosts'] = args

  # FIXME - DBSync class should handle its own arg parsing, error checking, etc
  if len(syncopts) == 0 or 'tablename' not in syncopts or 'database' not in syncopts:
    print USAGE
  else:
    sync = DBSync(syncopts)
