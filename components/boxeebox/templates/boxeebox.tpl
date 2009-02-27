{component name="html.header"}

  <div id="sc_container">
   <div id="sc_header">
    {component name="boxeebox.content.header"}
   </div>
   <div id="sc_header_nav">
    <div class="sc_container_inner">
     {component name="boxeebox.content.nav"}
    </div>
   </div>
   <div id="sc_content">
    <div class="sc_content_main">
     <div class="sc_container_inner sc_utils_clear_after">
      {component name=$maincontent}
      {component name="boxeebox.content.flame"}
     </div>
    </div>
    <div class="sc_content_bottom">
     <div class="sc_container_inner sc_utils_clear_after">
      {component name="boxeebox.content.bottom"}
     </div>
    </div>
   </div>
  <div id="sc_footer">
   {component name="boxeebox.content.footer"}
  </div>

{component name="html.footer"}
