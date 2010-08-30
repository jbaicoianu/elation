{dependency type="component" name="elation"}

<h2>Elation Installation Successful</h2>
<p>If you are seeing this message, it means Elation is installed correctly, and you're ready to start developing!</p>

<h3>Next Steps</h3>
<ul>
  <li class="ui_clear_after">
    <h4>Create your own component</h4>
    <p>An Elation web application is made up of any number of different components.  Components can be as general-purpose or as specific to the task you want.  To create your own component, run the command <code>./elation component create &lt;componentname&gt;</code> from your webroot.  This will create a basic component under the <code>./components/&lt;componentname&gt;/</code> directory.  Components generally consist of a main component PHP file, some templates, a model descriptor and model class files, CSS, JavaScript, and images.  These components can return either raw data or rendered HTML snippets, and can be called from within templates, inside PHP functions, or directly by URL as JSON or XML objects via the REST API.</p>
    <p>Elation comes with a few sample components which show off how to make use of various parts of the system.  Feel free to explore them and use them as the basis of your own apps.</p>
    <ul id="elation_demo_apps">
      <li class="elation_demo_app">
        <h4>Blog</h4>
        <p>A simple blog to demonstrate ORM functionality.</p>
        <ul>
          <li><a href="{$webapp->request.basedir}/blog">demo</a></li>
          <li><a href="?inspect=blog#elation_codeview">code</a></li>
        </ul>
      </li>
      <li class="elation_demo_app">
        <h4>HTML Games</h4>
        <p>A collection of gaming experiments using HTML/JS/CSS instead of Flash</p>
        <ul>
          <li>demos: <a href="{$webapp->request.basedir}/games/airhockey">air hockey</a> <a href="{$webapp->request.basedir}/games/scrapple">scrapple</a>  <a href="{$webapp->request.basedir}/games/arkanoid">arkanoid</a> </li>
          <li><a href="?inspect=games#elation_codeview">code</a></li>
        </ul>
      </li>
      <li class="elation_demo_app">
        <h4>BoxeeBox</h4>
        <p>A product demo page for a fictional product</p>
        <ul>
          <li><a href="{$webapp->request.basedir}/supercritical/boxeebox">demo</a></li>
          <li><a href="?inspect=boxeebox#elation_codeview">code</a></li>
        </ul>
      </li>
      <li class="elation_demo_app">
        <h4>DeepZoom</h4>
        <p>A JavaScript Zooming User Interface (<a href="http://en.wikipedia.org/wiki/ZUI">ZUI</a>) experiment</p>
        <ul>
          <li><a href="{$webapp->request.basedir}/deepzoom">demo</a></li>
          <li><a href="?inspect=deepzoom#elation_codeview">code</a></li>
        </ul>
      </li>
    </ul>
    <div id="elation_codeview" class="ui_clear_after">
      {component name="elation.inspect" component=$inspect file=$file}
    </div>
  </li>
</ul>
{component name="html.footer"}
