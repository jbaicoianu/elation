{component name="html.header"}
{component name="notes" id="notes1" events=$events.notes1}
<ul>
  <li>
    <h2>ui.button</h2>
    {component name="ui.button" type="sprite_threestate" id="button1" events=$events.button1}
    {component name="ui.button" label="load page 2" id="button2" events=$events.button2}
  </li>
  <li>
    <h2>ui.list</h2>
    {component name="ui.list" id="list1" events=$events.list1 items=$listitems}
  </li>
</ul>
{component name="html.footer"}
{dependency name="ui"}
