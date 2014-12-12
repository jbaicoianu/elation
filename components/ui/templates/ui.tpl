{dependency name="utils.dust"}
{dependency name="utils.template"}
{dependency name="ui"}
{dependency name="ui.themes.dark"}
{dependency name="ui.slider"}

<ul class="ui_examples">
  <li>
    <h2>ui.slider - simple</h2>
    <div data-elation-component="ui.slider" data-elation-name="example">
      <data class="elation-args" name="handles">
        {literal}[
          {"center":"true","input":"false"}
        ]{/literal}
      </data>
    </div>
  </li>
  <li>
    <h2>ui.slider - price range</h2>
    <div data-elation-component="ui.slider" 
          data-elation-name="pricerange"
          data-elation-args.max="599.99">
      <data class="elation-args" name="handles">
        {literal}[
          {
            "name":"min",
            "bounds":"max",
            "input":"true",
            "anchor":"right",
            "labelprefix":"price: $",
            "value":"129.99",
            "snap":"0.01",
            "toFixed":"2"
          },
          {
            "name":"max",
            "bounds":"min",
            "input":"true",
            "labelprefix":"to $",
            "value":"359.99",
            "snap":"0.01",
            "toFixed":"2"
          }
        ]{/literal}
      </data>
    </div>
  </li>
    <li>
    <h2>ui.slider - navigation dots</h2>
    <div data-elation-component="ui.slider" 
          data-elation-name="dots"
          data-elation-args.min="0"
          data-elation-args.max="4">
      <data class="elation-args" name="handles">
        {literal}[
          {
            "name":"one",
            "moveable":"false",
            "input":"false",
            "value":"0",
            "snap":"1"
          },
          {
            "name":"two",
            "moveable":"false",
            "input":"false",
            "value":"1",
            "snap":"1"
          },
          {
            "name":"three",
            "moveable":"false",
            "input":"false",
            "value":"2",
            "snap":"1"
          },
          {
            "name":"four",
            "moveable":"false",
            "input":"false",
            "value":"3",
            "snap":"1"
          },
          {
            "name":"five",
            "moveable":"false",
            "input":"false",
            "value":"4",
            "snap":"1"
          },
          {
            "name":"indicator",
            "input":"false",
            "value":"3",
            "snap":"1"
          }
        ]{/literal}
      </data>
    </div>
  </li>
    <li>
    <h2>ui.slider - progress bar</h2>
    <div data-elation-component="ui.slider" 
          data-elation-name="progressbar">
      <data class="elation-args" name="handles">
        {literal}[
          {
            "name":"progress",
            "input":"true",
            "anchor":"right",
            "moveable":"false",
            "append":"grabber",
            "labelsuffix":"%",
            "value":"0",
            "snap":"0.01",
            "toFixed":"0"
          }
        ]{/literal}
      </data>
    </div>
    <script>{literal}
      setInterval(function() {
        var slider = elation.component.get('progressbar', 'ui.slider');

        if (!slider)
          return;

        var value = slider.value,
            value = value >= 100 ? 0 : value,
            inc = Math.random() * 5;

        if (slider.value >= 100)
          slider.handles[0].container.style.transition = 'all 0 linear';
        
        slider.setPercent(slider.handles[0],{
          x: parseInt(value + inc) / 100,
          y: 0
        });
        
        slider.handles[0].container.style.transition = '';
      }, 333)
    {/literal}</script>
  </li>
    <li>
    <h2>ui.slider - input combo</h2>
    <div data-elation-component="ui.slider" 
          data-elation-name="adjuster">
      <data class="elation-args" name="handles">
        {literal}[
          {
            "name":"handle",
            "input":"true",
            "anchor":"right",
            "append":"container",
            "before":"track",
            "value":"20",
            "snap":"0.01",
            "toFixed":"2"
          }
        ]{/literal}
      </data>
    </div>
  </li>
  <li>
    <h2>ui.button</h2>
    {component name="ui.button" type="sprite_threestate" id="button1" events=$events.button1}
    {component name="ui.button" label="Submit" id="button2" events=$events.button2}
  </li>
  <li>
    <h2>ui.buttonbar</h2>
    {component name="ui.buttonbar" id="buttonbar1" items=$buttonbaritems}
  </li>
  <li>
    <h2>ui.input</h2>
    {component name="ui.input" id="input1" events=$events.input1}
  </li>
  <li>
    <h2>ui.combobox</h2>
    {component name="ui.combobox" id="combobox1" events=$events.combobox1}
  </li>
  <li>
    <h2>ui.breadcrumbs</h2>
    {component name="ui.breadcrumbs" id="breadcrumbs1" items="Apparel|Shoes|Indoor Footwear"}
  </li>
  <li>
    <h2>ui.pagination</h2>
    {component name="ui.pagination" id="pagination1"}
  </li>
  <li>
    <h2>ui.list</h2>
    {component name="ui.list" id="list1" events=$events.list1 items=$listitems}
  </li>
  <li>
    <h2>ui.accordion</h2>
    {component name="ui.accordion" id="accordion1" events=$events.accordion1 items=$accordionitems}
  </li>
  <li>
    <h2>ui.tabs</h2>
    {component name="ui.tabs" id="tabs1" events=$events.tabs1 items=$tabitems}
  </li>
  <li>
    <h2>ui.treeview</h2>
    {component name="ui.treeview" id="treeview1" events=$events.treeview1 items=$treeviewitems}
  </li>
  <li>
    <h2>ui.window</h2>
    {component name="ui.window" id="window1" events=$events.window1 title="Window 1" content="This is window 1, you can move me around"}
  </li>
</ul>
{component name="html.footer"}
{dependency name="ui"}
