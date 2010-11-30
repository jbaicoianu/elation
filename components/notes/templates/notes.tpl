<!DOCTYPE html>
<html>
 <head>
  <meta name="viewport" content="initial-scale = 1.0, user-scalable = no, minimum-scale = 1.0, maximum-scale = 1.0" />

{literal}
  <style type="text/css">
    * { margin: 0; padding: 0; }
    #notes ul {
      list-style: none;
      margin: 0;
      padding: 0 .3em;
    }
    #notes ul li {
      white-space: nowrap;
    }
    #notes label {
      font-weight: bold;
      width: 8em;
    }
    #notes #notes_note {
      display: block;
      width: 100%;
      height: 10em;
    }
  </style>
  <script type="text/javascript">
    notes = new function() {
      this.localnotes = false;
      this.activenote = false;

      this.init = function() {
        this.db = openDatabase("elation", 0.1, "Elation Notes offline access", 5*1024*1024);
        if (this.db) {
          (function(self) { 
            self.db.transaction(function(tx) { 
              tx.executeSql("CREATE TABLE IF NOT EXISTS notes (id unique, note, updated)");
            });
          })(this);
          this.populate_notes();
        } else {
          console.log("Failed to open client-side database: " + this.dbname);
        }
      }
      this.populate_notes = function() {
console.log('load notes from db');
        (function(self) {
          self.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM notes ORDER BY updated DESC", [], function(tx, results) { 
              self.localnotes = {};
              var selecthtml = '';
              if (results.rows.length > 0) {
                for (var i = 0; i < results.rows.length; i++) {
                  var note = results.rows.item(i);
console.log(note);
                  self.localnotes[note.id] = note;
                  if (!self.activenote || !self.localnotes[self.activenote]) {
                    self.activenote = note.id; 
                    self.load_note(note.id);
console.log("AAAA");
                  }
                  selecthtml += '<option value="' + note.id + '"' + (note.id == self.activenote ? ' selected="selected"' : '') + '>' + note.id + '</option>';
                }
              } else {
                var note = {id: 'default', note: ''}
                self.localnotes[note.id] = note;
                self.load_note(note.id);
                selecthtml += '<option value="' + note.id + '"' + (note.id == self.activenote ? ' selected="selected"' : '') + '>' + note.id + '</option>';
              }
              selecthtml += '<option value="_NEW_">-- New Note --</option>';
              document.getElementById('notes_name').innerHTML = selecthtml;
              console.log(self.localnotes);
            });
          });
        })(this);
      }
      this.add_note = function(id, note) {
        console.log("Adding note '" + id + "': " + note);
        (function(self) {
          self.db.transaction(function(tx) {
            // I could have sworn "ON CONFLICT UPDATE" was working but then it started giving a SQLError
            tx.executeSql("INSERT INTO notes VALUES(?, ?, datetime('now'))", [id, note], null, function(tx, err) {
              if (err.code == 1)
                tx.executeSql("UPDATE notes SET note=?, updated=datetime('now') WHERE id=?", [note, id]);
            });
          });
        })(this);
        this.activenote = id;
        this.populate_notes();
        return false;
      }
      this.load_note = function(id) {
/*
        (function(self) {
          self.db.transaction(function(tx) {
            tx.executeSql("INSERT INTO notes VALUES(?, ?, datetime('now')) ON CONFLICT REPLACE", [id, note]);
          });
        })(this);
*/
        console.log('Load note: ' + id);
        var formelement = document.getElementById('notes_note');
        if (id == "_NEW_") {
          var newname = prompt("New note name?");
          notes.add_note(newname, "");
          this.activenote = id = newname;
          formelement.value = "";
          formelement.focus();
          this.changed = false;
        } else if (notes.localnotes[id]) {
          formelement.value = notes.localnotes[id].note;
          formelement.focus();
          this.activenote = id;
          this.changed = false;
        } else {
          console.log("Can't find note '" + id + "'", notes.localnotes);
        }
      }
      this.remove_note = function(id) {
console.log(id);
        if (id && this.localnotes[id]) {
          (function(self) {
            self.db.transaction(function(tx) {
              tx.executeSql("DELETE FROM notes WHERE id=?", [id], function(tx, results) { 
                console.log('Remove note "' + id + '"');
                self.populate_notes();
              });
            });
          })(this);
        }
      }
      this.clear_notes = function() {
        (function(self) {
          self.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM notes", [], function(tx, results) { 
              console.log('clear all notes');
              self.populate_notes();
            });
          });
        })(this);
      }
    }
{/literal}
  </script>
 </head>
 <body>
  <div id="notes">
   <form onsubmit="return notes.add_note(this.notes_name.value, this.notes_note.value)">
    <ul>
     <li>
      <select id="notes_name" name="notes_name" onchange="notes.load_note(this.value)" ontouchstart="if (notes.changed) this.form.onsubmit()"></select> 
      <button onclick="notes.remove_note(this.form.notes_name.value); return false">Remove</button>
      <button onclick="notes.clear_notes(); return false">Clear All</button>
     </li>
     <li><textarea id="notes_note" name="notes_note" onblur="if (notes.changed) this.form.onsubmit()" onkeydown="notes.changed = true"></textarea></li>
    </ul>
  </form>
  <script type="text/javascript">notes.init()</script>
 </body>
</html>
