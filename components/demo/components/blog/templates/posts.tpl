{dependency type="css" url="/css/components/blog/blog.css"}
{if !empty($header)}<h3>{$header|escape:html}</h3>{/if}
{if !empty($blog)}
  {if !empty($postcount)}
    <ul class="blog_posts_list">
     {foreach from=$posts item=post}
      <li class="blog_post">
       <h4>{$post->subject}</h4> 
       <h5>{$post->timestamp|date_format}</h5>
       <p>{$post->content|escape:html|nl2br}</p>
      </li>
     {/foreach}
    </ul>
  {else}
    No posts
  {/if}
{else}
  Blog not found
{/if}
