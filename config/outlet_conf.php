<?
require_once("outlet/Outlet.php");

Outlet::init(array(
  'connection' => array(
    'dsn' => 'mysql:host=localhost;dbname=supercritical',
    'username' => 'supercritical',
    'password' => 'h4xm3',
    'dialect' => 'mysql'
  ),
  'classes' => array(
    "Blog" => array(
      'table' => 'blog',
      'props' => array(
        'blogname' => array('blogname', 'varchar', array('pk' => true)),
        'title' => array('title', 'varchar'),
        'subtitle' => array('subtitle', 'varchar'),
        'owner' => array('owner', 'varchar')
      ),
      'form' => array(
        'subject' => array('type' => 'input', 'name' => 'subject', 'label' => 'Subject', 'value' => '(no subject)'),
        'content' => array('type' => 'textarea', 'name' => 'content', 'label' => 'Content'),
      ),
      'associations' => array(
        array('one-to-many', 'BlogPost', array('key' => 'blogname'))
      )
    ),
    "BlogPost" => array(
      'table' => 'blog_post',
      'props' => array(
        'blogpostid' => array('blogpostid', 'varchar', array('pk' => true)),
        'blogname' => array('blogname', 'varchar'),
        'subject' => array('subject', 'varchar'),
        'content' => array('content', 'text'),
        'timestamp' => array('timestamp', 'datetime')
      ),
      'associations' => array(
        array('many-to-one', 'Blog', array('key' => 'blogname'))
      )
    ),
    "AudioPlaylist" => array(
      'table' => 'audio_playlist',
      'props' => array(
        'name' => array('name', 'varchar', array('pk' => true)),
        'title' => array('title', 'varchar'),
        'description' => array('description', 'varchar'),
        'logourl' => array('logourl', 'varchar'),
        'streamurl' => array('streamurl', 'varchar'),
        'last_listened' => array('last_listened', 'datetime'),
      ),
      'associations' => array()
    ),
    "NavigationLocation" => array(
      'table' => 'navigation_location',
      'props' => array(
        'locationid' => array('locationid', 'int', array('pk' => true)),
        'name' => array('name', 'varchar'),
        'address' => array('address', 'text'),
        'lat' => array('lat', 'double'),
        'lon' => array('lon', 'double'),
        'type' => array('type', 'varchar'),
        'zoom_min' => array('zoom_min', 'int'),
        'zoom_max' => array('zoom_max', 'int'),
      ),
      'associations' => array()
    ),
    "NavigationLocationCategory" => array(
      'table' => 'navigation_location_category',
      'props' => array(
        'categoryid' => array('categoryid', 'varchar', array('pk' => true)),
        'name' => array('name', 'varchar'),
        'parent' => array('parent', 'varchar'),
      ),
      'associations' => array()
    ),
    "TwitterFollow" => array(
      'table' => 'twitter_follow',
      'props' => array(
        'twitterid' => array('twitterid', 'varchar', array('pk' => true)),
        'updated' => array('updated', 'datetime'),
        'lastid' => array('lastid', 'int'),
      ),
      'associations' => array()
    ),

  )
));

/*
<outlet>
  <connection dsn="mysql:host=localhost;dbname=supercritical" username="supercritical" password="aCp_n9ll" dialect="mysql" />
  <classes>
    <Blog>
      <table>blog</table>
      <props>
        <blogid dbname="blogid" type="int">
          <pk>true</pk>
          <autoIncrement>true</autoIncrement>
        </blogid>
        <name dbname="blogname" type="varchar">
        <title dbname="title" type="varchar">
        <subtitle dbname="subtitle" type="varchar">
        <owner dbname="owner" type="int">
      </props>
      <associations>
        <one-to-many with="BlogPost"><key>blogid</key></one-to-many>
      </associations>
    </Blog>
  </classes>
</outlet>
 */
