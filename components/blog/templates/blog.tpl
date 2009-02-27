<div class="blog html_util_clear_after">
 <h2>{$blog->title}</h2>
 <h3>{$blog->subtitle}</h3>

 <div class="blog_posts">
  {component name="blog.posts" blog=$blog}
 </div>
 <div class="blog_posts_create">
  {component name="blog.posts.create" blog=$blog header="Add a New Post"}
 </div>
</div>
