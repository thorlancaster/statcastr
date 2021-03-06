class UIPanel {
	constructor() {
		this.element = DCE("div", "uiPanel");
		this.children = [];
	}

	appendChild(el) {
		if (el instanceof UIPanel) {
			this.element.appendChild(el.element);
			if (!this.children.includes(el))
				this.children.push(el);
		}
		else
			this.element.appendChild(el);
		return this;
	}

	prependChild(el) {
		if (el instanceof UIPanel) {
			this.element.prepend(el.element);
			if (!this.children.includes(el))
				this.children.unshift(el);
		}
		else
			this.element.prepend(el);
		return this;
	}

	removeChild(el) {
		try {
			if (el instanceof UIPanel) {
				this.element.removeChild(el.element);
				var idx = this.children.indexOf(el);
				if (idx != -1)
					this.children.splice(idx, 1);
			}
			else
				this.element.removeChild(el);
			return this;
		} catch (e) {
			return this;
		}
	}

	removeAll() {
		this.children.length = 0;
		var e = this.element;
		while (e.firstChild) {
			e.firstChild.remove();
		}
	}

	/**
	* Function to call when this element's size changes
	* @caution To avoid layout thrashing, call this function on the root if possible
	*/
	resize() {
		this.calcSize();
		this.applySize();
	}

	/**
	* Apply a JSON-based style to this object and its children.
	* The style can either be a JSON object in the form of
	* {class: {key1: value1, key2:value2...}, class2...}
	* or an array of such objects.
	* @param obj JSON style object
	*/
	applyStyle(obj) {
		if (Array.isArray(obj)) {
			for (var i = 0; i < obj.length; i++) {
				for (var x = 0; x < this.children.length; x++) {
					this.children[x].applyStyle(obj[i]);
				}
			}
		} else {
			for (var x = 0; x < this.children.length; x++) {
				this.children[x].applyStyle(obj);
			}
		}
	}
	update() {
		for (var x = 0; x < this.children.length; x++) { this.children[x].update(); }
	}
	calcSize() {
		for (var x = 0; x < this.children.length; x++) { this.children[x].calcSize(); }
	}
	applySize() {
		for (var x = 0; x < this.children.length; x++) { this.children[x].applySize(); }
	}

	/**
	* Get a property from a style object
	* @param obj style object
	* @param property name of property to get
	* @param oldVal value to return if style not found
	*/
	getApplyStyle(obj, property, oldVal) {
		var cls = this.element.classList;
		for (var x = 0; x < cls.length; x++) {
			var c = cls[x];
			if (obj[c] && obj[c][property]) {
				return obj[c][property];
			}
		}
		return oldVal;
	}

	getElement() {
		return this.element;
	}

	addClass(name) {
		this.element.classList.add(name); return this;
	}
	removeClass(name) {
		this.element.classList.remove(name); return this;
	}
	hasClass(name) {
		return this.element.classList.contains(name);
	}

	hide() { this.setStyle("display", "none"); }
	show() { this.setStyle("display", null); }

	setStyle(name, value) { this.element.style[name] = value; return this; }
	setStyles(n1, n2, v) {
		this.setStyle(n1, v);
		this.setStyle(n2, v);
		return this;
	}
	// Shortcut to set flex-grow and flex-shrink.
	// Higher values makes the element more stretchy
	setElasticity(x) {
		this.setStyle("flexGrow", x);
		this.setStyle("flexShrink", x);
		return this;
	}
}
