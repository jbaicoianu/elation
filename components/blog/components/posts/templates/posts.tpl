{if !empty($header)}<h3>{$header|escape:html}</h3>{/if}
<ul class="blog_posts_list">
 {foreach from=$posts item=post}
  <li>
   <h4>{$post->subject}</h4> 
   <h5>{$post->timestamp}</h5>
   <p>{$post->content}</p>
  </li>
 {/foreach}
</ul>
