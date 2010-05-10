<!DOCTYPE html>
<html>
  <head>
    <title>Elation Framework - Error</title>
    <style type="text/css">
      * { margin: 0; padding: 0; }
      body {
        background: #933;
        font-family: sans-serif;
        padding: .5em;
      }
      #elation_init_error {
        background: #eee;
        border: 1px solid black;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        max-width: 50em;
        margin: 8em auto 0 auto;
        padding: 2em;
      }
      #elation_init_error img {
        float: left;
        margin-right: .5em;
      }
      #elation_init_error h1 {
        font-size: 1.4em;
        color: #900;
      }
      #elation_init_error p {
        clear: left;
        padding-top: 1em;
      }
    </style>
  </head>
  <body>
    <div id="elation_init_error">
      <img src="/images/stop.png" />
      <h1>Elation Framework - Initialization Error</h1>
      <p>Initialization of the Elation Framework directory failed.  Please review the installation instructions, and run <code>./elation web init</code> from the command line.</p>
    </div>
  </body>
</html>
<!-- IMPORTANT NOTE: this template is intended to be served as a static file, since it's called in only in the worst of error cases.  Keep it simple. -->
