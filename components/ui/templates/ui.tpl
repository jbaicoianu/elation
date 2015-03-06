{dependency name="ui"}
{dependency name="ui.themes.dark"}
{dependency name="ui.slider"}

<ul class="ui_examples">
  <li>
    <h2>ui.slider</h2>
    <div data-elation-component="ui.slider"
         data-elation-name="example"></div>
  </li>
  <li>
    <h2>ui.range</h2>
    <div data-elation-component="ui.range" 
         data-elation-name="price"
         data-elation-args.left.value="129.99"
         data-elation-args.left.prefix="$"
         data-elation-args.right.value="359.99"
         data-elation-args.right.prefix="to $"
         data-elation-args.min="9.59"
         data-elation-args.max="599.99">
    </div>
  </li>
  <li>
    <h2>ui.navdots</h2>
    <div data-elation-component="ui.navdots" 
         data-elation-name="pagination"
         data-elation-args.selected="3"
         data-elation-args.max="5">
    </div>
  </li>
  <li>
    <h2>ui.progressbar</h2>
    <div data-elation-component="ui.progressbar" 
         data-elation-name="download">

    </div>
    <script>
    {literal}
      var progress_timer = setInterval(function() {
        var pegboard = elation.ui.progressbar('download');

        if (!pegboard)
          return;

        var value = pegboard.value,
            value = value >= 100 ? 0 : value,
            inc = Math.random() * 5;

        if (pegboard.value >= 100)
          return clearInterval(progress_timer);

        pegboard.set(parseInt(value + inc) / 100);
        
        pegboard.pegs[0].container.style.transition = '';
      }, 333)
    {/literal}
    </script>
  </li>
  <li>
    <h2>ui.inputslider</h2>
    <div class="ui_inputslider_container">
      <div data-elation-component="ui.inputslider"
           data-elation-name="hue"
           data-elation-args.max="360"
           data-elation-args.handle.prefix="hue"
           data-elation-args.handle.value="120"></div>

      <div data-elation-component="ui.inputslider"
           data-elation-name="saturation"
           data-elation-args.max="100"
           data-elation-args.handle.prefix="saturation"
           data-elation-args.handle.value="75"></div>

      <div data-elation-component="ui.inputslider"
           data-elation-name="lightness"
           data-elation-args.max="100"
           data-elation-args.handle.prefix="lightness"
           data-elation-args.handle.value="50"></div>

      <div id="colorsquare"></div>
    </div>
    <script>
    {literal}
      elation.events.add(null, 'ui_inputslider_change', function(event) {
        var hue = elation.ui.inputslider('hue'),
            saturation = elation.ui.inputslider('saturation'),
            lightness = elation.ui.inputslider('lightness'),
            square = elation.id('#colorsquare');

        square.style.backgroundColor = 'hsl('+hue.value+','+saturation.value+'%,'+lightness.value+'%)';
      });
    {/literal}
    </script>
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
