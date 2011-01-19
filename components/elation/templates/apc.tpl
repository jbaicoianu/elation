<h2>APC Console ({$webapp->cfg->hostname})</h2>

<ul class="tf_debug_actions">
 <li><a href="/elation/apc" onclick="return elation.ajax.link(this);">Refresh</a></li>
 <li><a href="/elation/apc?flush=1" onclick="return elation.ajax.link(this);">Flush APC Cache</a></li>
 <li><a href="/_apc.php" target="_blank">APC Admin Tool</a></li>
</ul>

<h3 id="tf_debug_message">{$message}</h3>

<ul id="tf_debug_apc_graphs">
 <li class="tf_debug_apc_graph_memory">
  <h3>Memory Usage</h3>

  <img src="/_apc.php?IMG=1&{$time}" />
  <ul class="tf_debug_legend">
   <li><span class="tf_debug_legend_box tf_debug_legend_box_green"></span> Free: {$apc.smainfo.avail_mem/1024/1024|number_format:1}MB ({$apc.smainfo.avail_mem/$apc.smainfo.seg_size*100|number_format:1}%)</li>
   <li><span class="tf_debug_legend_box tf_debug_legend_box_red"></span> Used: {math equation="(total - avail) / 1024 / 1024" total=$apc.smainfo.seg_size avail=$apc.smainfo.avail_mem format="%.1f"}MB ({math equation="(total - avail) / total * 100" total=$apc.smainfo.seg_size avail=$apc.smainfo.avail_mem format="%.1f"}%)</li>
  </ul>
 </li>
 <li class="tf_debug_apc_graph_hits">
  <h3>Hits &amp; Misses</h3>

  <img src="/_apc.php?IMG=2&{$time}" />
  <ul class="tf_debug_legend">
   <li><span class="tf_debug_legend_box tf_debug_legend_box_green"></span> Hits: {$apc.cacheinfo.num_hits} ({math equation="(hits / (hits + misses)) * 100" hits=$apc.cacheinfo.num_hits misses=$apc.cacheinfo.num_misses format="%.1f"}%)</li>
   <li><span class="tf_debug_legend_box tf_debug_legend_box_red"></span> Misses: {$apc.cacheinfo.num_misses} ({math equation="(misses / (hits + misses)) * 100" hits=$apc.cacheinfo.num_hits misses=$apc.cacheinfo.num_misses format="%.1f"}%)</li>
  </ul>
 </li>
 <li class="tf_debug_apc_graph_fragmentation">
  <h3>Memory Fragmentation</h3>
  <img src="/_apc.php?IMG=3&{$time}" />
  <ul class="tf_debug_legend">
   <li>Fragmentation: {$frag}</li>
  </ul>
 </li>
</ul>
{* printpre var=$apc *}
