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
