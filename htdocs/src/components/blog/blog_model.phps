<?
class Blog extends Model {
  public $blogname;
  public $title;
  public $subtitle;
  public $owner;
  private $blogposts = array();

  public function getBlogposts() {
    return $this->blogposts;
  }
  public function setBlogposts($blogposts) {
    $this->blogposts = $blogposts;
  }
  public function addBlogpost(BlogPost $blogpost) {
    $this->blogposts[$blogpost->blogpostid] = $blogpost;
  }
}
class BlogPost extends Model {
  public $blogpostid;
  public $blogname;
  public $subject;
  public $content;
  public $timestamp;

  private $blog;

  public function generatePostId() {
    $this->blogpostid = rand(); // TODO - real IDs based on timestamp and subject
    return $this->blogpostid;
  }
  public function getBlog() {
    return $this->blog;
  }
  public function setBlog(Blog $blog) {
    $this->blog = $blog;
  }

  function isValid() {
    $this->generatePostId();
    return true;
  }
}
