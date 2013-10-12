{dependency name="ui"}
<ul>
  <li>
    <h2>ui.button</h2>
    {component name="ui.button" type="sprite_threestate" id="button1" events=$events.button1}
    {component name="ui.button" label="load page 2" id="button2" events=$events.button2}
  </li>
  <li>
    <h2>ui.buttonbar</h2>
    {component name="ui.buttonbar" id="buttonbar1" items=$buttonbaritems}
  </li>
  <li>
    <h2>ui.list</h2>
    {component name="ui.list" id="list1" events=$events.list1 items=$listitems}
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
    <h2>ui.accordion</h2>
    {component name="ui.accordion" id="accordion1" events=$events.accordion1 items=$accordionitems}
  </li>
  <li>
    <h2>ui.window</h2>
    {component name="ui.window" id="window1" events=$events.window1 title="Window 1" content="This is window 1, you can move me around"}
  </li>
</ul>
{component name="html.footer"}
{dependency name="ui"}
