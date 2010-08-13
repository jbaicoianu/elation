{component name="html.header"}
{literal}
<style type="text/css">
#article {
  xmax-width: 40em;
  width: 100%;
  margin: 2em auto;
  border: 1px solid black;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-box-shadow: 0px 0px 8px 4px #333;
  -webkit-box-shadow: 0px 0px 8px 4px #333;
  padding: 1em;
  background: white;
  color: black;
}
#article p {
  margin-top: 1em;
}
#article_image_frame {
  display: block;
  margin: 0 auto;
  position: relative;
  width: 500px;
  xheight: 390px;
  max-width: 100%;
  white-space: nowrap;
}
#article_image_frame img {
  display: block;
  max-width: 100%;
  width: 100%;
}
</style>
{/literal}

{dependency type="javascript" url="/scripts/components/html/imagescale.js"}
{dependency type="javascript" url="/scripts/components/html/multizoom.js"}

<div id="article">
 <div id="article_image_frame">
  {literal}
  <img src="http://farm5.static.flickr.com/4028/4298034064_db789233e1.jpg" onload="elation.zoom.replace('article_image_frame', {size: [11057, 8630], tilesize: 256, overlap: 1, url: '/images/components/deepzoom/buttermilkcreek_files/{level}/{column}_{row}.jpg'})" />
{/literal}
 </div>
 <p>The photo above is a high-resolution photo of Butter Milk Creek Falls, and is being used as an example of DeepZoom inline image replacement.  This image was stitched together from 19 images totalling 11,057x8630 (91 Megapixels).  The original is available at <a href="http://www.flickr.com/photos/31599474@N04/4298034064/in/pool-extremelylargepanoramas">Butter Milk Creek Falls on Flickr</a>.</p>

 <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non lacus massa, eget semper nunc. Integer vel elit iaculis enim aliquam sollicitudin. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Pellentesque posuere euismod dictum. Nam purus sem, mattis eu molestie laoreet, iaculis sed orci. Sed lectus augue, sodales quis lacinia eu, tempor et mauris.</p>

<p>Integer elementum congue sagittis. Integer ultricies aliquam leo, et egestas nisi elementum ut. Nunc at sem eget massa egestas tincidunt. Ut ultricies pretium orci ac semper. Nullam tristique pulvinar lorem sit amet viverra. Vivamus ultrices pulvinar felis nec suscipit. Aliquam fermentum pellentesque tellus, sed elementum tortor vehicula eu. Integer lacus risus, pellentesque at convallis id, imperdiet quis justo. Nullam leo purus, molestie a accumsan a, aliquam auctor eros. Nunc sit amet ante eget tellus consequat tempor quis vitae mauris. Aliquam bibendum lacus sit amet eros lobortis adipiscing. Nullam eget elit neque. Mauris laoreet bibendum elementum. Morbi quis dolor eget leo dignissim faucibus at ut dolor. Etiam pretium mauris non tellus pellentesque vel tempor magna rutrum. Donec feugiat aliquam feugiat.</p>

<p>In et nulla purus, at aliquet leo. Pellentesque feugiat, lectus consequat vulputate dapibus, magna nibh aliquet mauris, in feugiat purus turpis ac arcu. Quisque dapibus lorem eu nunc commodo tincidunt. Nunc mattis turpis eu lorem fermentum ac tincidunt quam pellentesque. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas felis velit, lobortis vitae molestie quis, gravida id erat. Praesent pellentesque nisl condimentum sem aliquam non blandit tortor lacinia. Etiam bibendum, mauris sed scelerisque feugiat, enim nisi laoreet lectus, nec ullamcorper mi ligula et libero. Vestibulum id sapien neque. Aliquam erat volutpat. Pellentesque sed nibh dolor, ut molestie neque. Morbi nec arcu et erat tincidunt rhoncus. Sed consequat commodo pulvinar.</p>


</div>

{component name="html.footer"}
