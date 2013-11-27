<div id="flipbuttons">
  <div data-elation-component="ui.button">
    <data class="elation-args">{literal} {
     "events": { 
      "click": "elation.html.flippable('foo').toggle();"
     } 
    } {/literal}
    </data>
    flip #1!
  </div>
  <div data-elation-component="ui.button">
    <data class="elation-args">{literal} {
     "events": { 
      "click": "elation.html.flippable('bar').toggle();"
     } 
    } {/literal}
    </data>
    flip #2!
  </div>
  <div data-elation-component="ui.button">
    <data class="elation-args">{literal} {
     "events": { 
      "click": "elation.html.flippable('bar').toggle();elation.html.flippable('foo').toggle();"
     } 
    } {/literal}
    </data>
    flip both!
  </div>
</div>
<div id="flipelements">
  <div id="foo" data-elation-component="html.flippable">
    <data class="elation-args">{literal} {
     "events": { 
      "flipstart": "console.log('foo got flipped', ev);",
      "flipend": "console.log('foo unflipped', ev);"
     } 
    } {/literal}
    </data>
    <div class="html_flippable_side1">
      <h2>hello!</h2>
      <p>this is side 1</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
    </div>
{*
    <div class="html_flippable_side2">
      <h2>side 2 is cooler</h2>
      <ul>
        <li>side 1 is a poser</li>
        <li>awesome</li>
        <li>so much better than side 1</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
      </ul>
    </div>
*}
  </div>
  <div id="bar" data-elation-component="html.flippable">
    <data class="elation-args">{literal} {
     "events": { 
      "flipstart": "console.log('bar got flipped', ev);",
      "flipend": "console.log('bar unflipped', ev);"
     } 
    } {/literal}
    </data>
    <div class="html_flippable_side1">
      <h2>Flipper 2</h2>
      <p>I am my own unique entity, with a purpose in life</p>
    </div>
    <div class="html_flippable_side2">
      <h2>side 2 is cooler</h2>
      <ul>
        <li>side 1 is a poser</li>
        <li>awesome</li>
        <li>so much better than side 1</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
        <li>really</li>
      </ul>
    </div>
  </div>
</div>
<p>I'm some other shit on the page, I'm not very useful or informative but I'm here to make sure everything works fine.  I hope it does, because then it will justify having typed this long filler paragraph instead of just grabbing some lorem ipsum bullshit.  I'll be pissed if I type all this out and it doesn't even take up enough space to test layout with.</p>
{dependency name="html.flippable"}
