<ul>
{foreach from=$ormcfg->classes key=classname item=ormclass}
 <li>
  {component name="elation.orm.view_class" ormcfg=$ormclass model=$model classname=$classname}
 </li>
{/foreach}
</ul>
