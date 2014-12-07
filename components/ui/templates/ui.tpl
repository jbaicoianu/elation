{dependency name="utils.dust"}
{dependency name="utils.template"}
{dependency name="ui"}
{dependency name="ui.themes.dark"}
{dependency name="ui.slider"}

<ul class="ui_examples">
  <li>
    <h2>ui.slider one handle</h2>
    {component name="ui.slider" id="two"}
  </li>
  <li>
    <h2>ui.slider two handles</h2>
    <div data-elation-component="ui.slider" data-elation-name="one">
      <data class="elation-args" name="handles">
        {literal}[
          {"name":"one","bounds":"two","labelprefix":"left:","value":"25"},
          {"name":"two","bounds":"one","labelprefix":"right:","value":"75"}
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
