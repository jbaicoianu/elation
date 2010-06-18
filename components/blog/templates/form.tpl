Below is a handmade form ... ok well at least copy and pasted ... 
The two fields only accept alpha characters (no num / symbols)
<br /><br />
<form id="create_post" method="get" class="html_form" action="">
    <dl class="zend_form">
        <dt id="subject-label">
            <label for="blogpost-subject" class="optional">
                Subject
            </label>
        </dt>
        <dd id="subject-element">
            <input type="text" name="blogpost[subject]" id="blogpost-subject" value="{$subject}" />
        </dd>
        <dt id="content-label">
            <label for="blogpost-content" class="optional">
                Content
            </label>
        </dt>
        <dd id="content-element">
            <textarea name="blogpost[content]" id="blogpost-content" rows="10" cols="40">{$content}</textarea>
        </dd>
        <dt id="add_post-label">
            &nbsp;
        </dt>
        <dd id="add_post-element">
            <input type="submit" name="add_post" id="add_post" value="Add Post" />
        </dd>
    </dl>
		<input type="hidden" name="blogname" value="{$blogname}" />
</form>