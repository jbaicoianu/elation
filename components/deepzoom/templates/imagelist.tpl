<ul class="deepzoom_imagelist multizoom_controls">
  {foreach from=$images item=img}
    <li><a href="{$webapp->request.basedir}/deepzoom?img={$img}">{$img}</a></li>
  {/foreach}
</ul>
