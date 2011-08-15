 <ul id="tf_debug_menu">
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('logger',true);">Logger</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('profiler',true);">Profiler</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('settings',true,'/elation/settings.snip');">Settings</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('memcache',true,'/elation/memcache.snip');">Memcache</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('apc',true,'/elation/apc.snip');">APC</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('abtests',true,'/elation/abtests.snip');">ABTests</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('performance',true,'/elation/performance.snip');">Performance</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('anal',true);">Analytics</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('admin',true,'/admin/.snip');">Admin</a></li>
 </ul>
 <ul id="tf_debug_tabs">
  <li class="tf_debug_tab tf_debug_tab_default" id="tf_debug_tab_logger">{component name="elation.logger"}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_profiler">{component name="elation.profiler"}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_settings">{* component name="elation.settings" *}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_memcache">{* component name="elation.memcache" *}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_apc"></li>
  <li class="tf_debug_tab" id="tf_debug_tab_abtests"></li>
  <li class="tf_debug_tab" id="tf_debug_tab_performance"></li>
  <li class="tf_debug_tab" id="tf_debug_tab_anal">{component name="admin.gatool"}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_admin">{* component name="elation.session" *}</li>
 </ul>
 <script type="text/javascript">
	var tf_debugconsolewindow,tf_state;
	initDebugTools();
 </script>
{dependency type="component" name="admin.admin"}
{dependency type="component" name="utils.window"}
