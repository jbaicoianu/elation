elation.require(['ui.base', 'window.window'], function() {
	elation.component.add("ui.example_dialog", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_example_dialog' };

		this.init = function() {
			var parent = elation.utils.arrayget(this.args, 'parent.container');
			var args = elation.utils.arrayget(this.args, 'parent.args');

			this.container.innerHTML = 'This is a test';

			this.window = elation.window.dialog(args.name, null, {
				append: document.body,
				parent: parent,
				content: this.container,
				title: args.name
			})
		}
	}, elation.ui.base);

	elation.component.add("ui.example_infobox", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_example_infobox' };

		this.init = function() {
			var parent = elation.utils.arrayget(this.args, 'parent.container');
			var args = elation.utils.arrayget(this.args, 'parent.args');
			
			this.container.innerHTML = 'This is a test<br><br>of an infobox!';

			this.window = elation.window.infobox(args.name, null, {
				append: document.body,
				parent: this.args.parent.picture,
				content: this.container,
				align: 'right'
			})
		}
	}, elation.ui.base);
	
	elation.component.add("ui.example_window", function() {
    this.defaultcontainer = { tag: 'div', classname: 'ui_example_infobox' };

 		this.init = function() {

 		}
	}, elation.ui.base);
});