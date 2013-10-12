<ul>
{foreach from=$ormcfg->classes key=classname item=ormclass}
 <li>
  {component name="elation.orm.view_class" model=$model classname=$classname ormcfg=$ormclass}
 </li>
{/foreach}
</ul>
