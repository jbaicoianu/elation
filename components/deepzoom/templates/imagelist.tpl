<ul class="deepzoom_imagelist multizoom_controls">
  {foreach from=$images item=img}
    <li><a href="{$webapp->request.basedir}{$deepzoompath}?img={$img}">{$img}</a></li>
  {/foreach}
</ul>
{dependency name="deepzoom.imagelist"}
