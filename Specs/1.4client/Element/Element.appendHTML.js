/*
 ---
 name: Element.appendHTML Specs
 description: test for appendHTML feature
 requires: [Core/Element]
 provides: [Element.appendHTML.Specs]
 ...
 */

describe('Element.appendHTML', function(){

	var check, base, baseFallBack;
	var inserters = {

		before: function(context, element){
			var parent = element.parentNode;
			if (parent) parent.insertBefore(context, element);
		},

		after: function(context, element){
			var parent = element.parentNode;
			if (parent) parent.insertBefore(context, element.nextSibling);
		},

		bottom: function(context, element){
			element.appendChild(context);
		},

		top: function(context, element){
			element.insertBefore(context, element.firstChild);
		}

	};

	inserters.inside = inserters.bottom;

	beforeEach(function(){
		check = new Element('span', {
			html:   '<div>content</div><div>content</div>',
			styles: {
				display: 'none'
			}
		});

		check.inject(document.documentElement);
		base = $(check.getChildren()[0]);
		baseFallBack = $(check.getChildren()[1]);
		//ugly, but I must do this in order to check fallback method
		baseFallBack.appendHTML = function(html, where){
			var temp = new Element('div', {html: html}),
				children = temp.childNodes,
				fragment = temp.firstChild;

			if (!fragment) return this;
			if (children.length > 1) {
				fragment = document.createDocumentFragment();
				for (var i = 0, l = children.length; i < l; i++) {
					fragment.appendChild(children[i]);
				}
			}

			inserters[where || 'bottom'](fragment, this);
			return this;
		};
		base.set('rel', '0');
		baseFallBack.set('rel', '1');
	});

	afterEach(function(){
		baseFallBack = null;
		base = null;
		check = null;
	});

	it('should insert element before', function(){

		base.appendHTML('<span>HI!</span>', 'before');
		baseFallBack.appendHTML('<span>HI!</span>', 'before');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.innerText).toBe('HI!');
			expect(child.nextSibling.getAttribute('rel')).toBe('' + i);
		});
	});

	it('should insert element after', function(){
		base.appendHTML('<span>HI!</span>', 'after');
		baseFallBack.appendHTML('<span>HI!</span>', 'after');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.innerText).toBe('HI!')
			expect(child.previousSibling.getAttribute('rel')).toBe('' + i);
		});
	});

	it('should insert element on bottom', function(){
		base.appendHTML('<span>HI!</span>', 'bottom');
		baseFallBack.appendHTML('<span>HI!</span>', 'bottom');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		expect(children.each(function(child, i){
			expect(child.innerText).toBe('HI!');
			expect(child.parentNode.getAttribute('rel')).toBe('' + i);
			expect(child.parentNode.innerText).toBe('contentHI!');
		}))
	})

	it('should insert element on top', function(){
		base.appendHTML('<span>HI!</span>', 'top');
		baseFallBack.appendHTML('<span>HI!</span>', 'top');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.innerText).toBe('HI!');
			expect(child.parentNode.getAttribute('rel')).toBe('' + i);
			expect(child.parentNode.innerText).toBe('HI!content');
		});

	})

	it('should insert element on inside (bottom)', function(){
		base.appendHTML('<span>HI!</span>', 'inside');
		baseFallBack.appendHTML('<span>HI!</span>', 'inside');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.innerText).toBe('HI!');
			expect(child.parentNode.getAttribute('rel')).toBe('' + i);
			expect(child.parentNode.innerText).toBe('contentHI!');
		});
	});

});
