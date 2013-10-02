  {dependency name="elation.homepage"}

  <section class="elation_homepage_section elation_homepage_main elation_clear_after">
    <div class="panel_left">
      <h1>Elation Framework</h1>
      <h2>Create &middot; Deploy &middot; Grow</h2>

      <p>Create world-class interactive websites with ease.  Scale them to reach millions.  Elation makes it a breeze and can grow at your pace, no matter how fast you move.</p>

      <ul>
        <li>Reusable component-based architecture makes building rich experiences easy</li>
        <li>SQL, NoSQL, REST, or any other data backend, with caching out the wazoo</li>
        <li>Powerful frontend library helps you tap into all that HTML5 has to offer</li>
      </ul>

      <a class="elation_button_large" href="http://github.com/jbaicoianu/elation/tree/next">Get it Now</a>
      
    </div>
    <div class="panel_right">
      <h1>Fancy image of something goes here</h1>
    </div>
  </section>

  <section class="elation_homepage_demos elation_clear_after">
    {component name="elation.demo" demo="apps" image="/images/demos/demo-apps-glimpse-medium.png" url="/demos/category-apps"}
    {component name="elation.demo" demo="games" image="/images/demos/demo-games-quake-medium.png" url="/demos/category-games"}
    {component name="elation.demo" demo="visualizations" image="/images/demos/demo-visualizations-medium.png" url="/demos/category-visualizations"}
  </section>

  <section class="elation_homepage_section elation_homepage_whatis elation_clear_after">
      <h3>What is Elation?</h3>
      <p>Elation is an MVC client/server framework for PHP and JavaScript which helps you build rich content out of reusable components.  Elation is designed to be lightweight and flexible, providing unified access and caching to any number of SQL, NoSQL, REST, and other data sources.  On the server side, Elation follows the principles of <a href="http://en.wikipedia.org/wiki/Linked_data">Linked Data</a> and encourages developers to think of their site in terms of entities with relationships, rather than just flat pages full of links.  On the client side, it makes it easy to add interaction and depth to those entities, wherever they may be displayed on your page.  
      <p>Whether you're building an eCommerce site, a web application, or a social game, Elation makes it easy to bring your vision to life.  Elation can fit any size needs, anywhere from personal VPS/shared hosting up to geographically-distributed multi-datacenter environment.  Yes, even the cloud.</p>

    <h3>How can I help?</h3>
    <p>Elation is a work in progress, and there's still a lot to be done!  Even if it's just feedback on your experiences installing and working with Elation, it's useful to me to know how people are using it, so I know where to focus my efforts.  Follow me on <a href="http://github.com/jbaicoianu">GitHub</a> or join <a href="https://webchat.freenode.net/?channels=%23elation">#elation</a> on <a href="http://freenode.net">Freenode</a>
  </section>

{*
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
            <li><a href="{$webapp->request.basedir}/demo/blog">demo</a></li>
            <li><a href="?inspect=demo.blog#elation_codeview">code</a></li>
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
*}
