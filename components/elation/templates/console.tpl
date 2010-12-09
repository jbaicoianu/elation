 <ul id="tf_debug_menu">
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('logger',true);">Logger</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('profiler',true);">Profiler</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('settings',true,'/debug/settings');">Settings</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('memcache',true,'/debug/memcache');">Memcache</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('apc',true,'/debug/apc');">APC</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('abtests',true,'/debug/abtests');">ABTests</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('performance',true,'/debug/performance');">Performance</a></li>
  <li class="tf_debug_link"><a class="tf_debug_link" href="#" onclick="return elation.debug.setTab('admin',true,'/admin/main');">Admin</a></li>
 </ul>
 <ul id="tf_debug_tabs">
  <li class="tf_debug_tab tf_debug_tab_default" id="tf_debug_tab_logger">{component name="elation.logger"}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_profiler">{* component name="debug.profiler" *}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_settings">{* component name="debug.settings" *}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_memcache">{* component name="debug.memcache" *}</li>
  <li class="tf_debug_tab" id="tf_debug_tab_apc"></li>
  <li class="tf_debug_tab" id="tf_debug_tab_abtests"></li>
  <li class="tf_debug_tab" id="tf_debug_tab_performance"></li>
  <li class="tf_debug_tab" id="tf_debug_tab_session">{component name="debug.session"}</li>
 </ul>
 <script type="text/javascript">
	var tf_debugconsolewindow,tf_state;
	initDebugTools();
 </script>
{dependency type="component" name="admin.admin"}
{dependency type="component" name="utils.window"}
