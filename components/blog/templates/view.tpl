{component name="html.header"}

<div class="blog ui_clear_after">
 <h2>{$blog->title}</h2>
 <h3>{$blog->subtitle}</h3>

 <div class="blog_posts">
  {component name="blog.posts" blog=$blog}
 </div>
 <div class="blog_posts_create">
  {component name="blog.posts.create" blog=$blog header="Add a New Post"}
 </div>
 <a class="blog_backlink" href="/blog">&laquo; back</a>
</div>

{component name="html.footer"}
