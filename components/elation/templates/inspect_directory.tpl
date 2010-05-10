<ul>
  {foreach from=$dir key=filename item=file}
    {if is_array($file)}
      <li class="elation_directory">{$filename}/{component name="elation.inspect_directory" parentdir=$fullname dirname=$filename dir=$file}</li>
    {else}
      <li class="elation_file"><a href="?inspect={$component}&amp;file={$fullname}/{$filename}#elation_fileview">{$file}</a></li>
    {/if}
  {/foreach}
</ul>
