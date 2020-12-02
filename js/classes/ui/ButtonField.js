class ButtonField extends UIPanel {
	constructor(btnText, fullSize, useHtml) {
		super();
		var t = this;
		t.LONG_PRESS_TIME = 500;
		t.clickListeners = [];
		t.longClickListeners = [];
		t.setFullSize(fullSize);
		t.btn = DCE("button");
		t.mouseTmr = 0; // Timer for long press - mouse
		t.touchTmr = 0; // Timer for long press - touch
		t.addClass("buttonField");
		t.appendChild(t.btn);
		if (useHtml)
			t.setHtml(btnText);
		else
			t.setText(btnText);
		t.btn.addEventListener("click", t.click.bind(t));
		t.btn.addEventListener("mousedown", function (e) {
			t.mouseTmr = setTimeout(t.longClickMouse.bind(t), t.LONG_PRESS_TIME);
			t.mouseLKD = false;
		});
		t.btn.addEventListener("mouseleave", t.LCMCancel.bind(t));
		t.btn.addEventListener("mouseup", t.LCMCancel.bind(t));

		t.btn.addEventListener("touchstart", function(e){
			t.touchTmr = setTimeout(t.longClickTouch.bind(t), t.LONG_PRESS_TIME);
			t.touchLKD = false;
		});
		t.btn.addEventListener("touchmove", function(e){
			// console.log("TouchMove", e);
			if(e.targetTouches.length > 1)
				t.LCTCancel();
			else {
				var touch = e.targetTouches[0];
				var el = document.elementFromPoint(touch.clientX, touch.clientY);
				if(touch.target != el)
					t.LCTCancel();
			}
		});
		t.btn.addEventListener("touchend", function (e) {
			// console.log("TouchEnd");
			t.LCTCancel();
			if (!t.enabled) return;
			e.uCanceledBy = t;
		});
		t.enabled = true;
	}
	LCMCancel(){ // Long Click - Mouse - Cancel
		var t = this;
		if (t.mouseTmr) clearTimeout(t.mouseTmr); t.mouseTmr = 0;
	}

	LCTCancel(){ // Long Click - Touch - Cancel
		var t = this;
		if (t.touchTmr) clearTimeout(t.touchTmr); t.touchTmr = 0;
	}

	longClickMouse(){
		if(this.mouseLKD) return;
		this.mouseLKD = true;
		this.longClick();
	}
	longClickTouch(){
		if(this.touchLKD) return;
		this.touchLKD = true;
		this.longClick();
	}

	longClick(){
		for (var x = 0; x < this.longClickListeners.length; x++)
		this.longClickListeners[x](this);
	}

	click(e) {
		var t = this;
		if (!t.kbSupported && e && e.offsetX == 0 && e.offsetY == 0 && e.pageX == 0 && e.pageY == 0
			&& e.screenX == 0 && e.screenY == 0)
			return;
		if (!t.enabled)
			return; // Disabled
		if(t.mouseLKD) // Long Click disable
			return;
		// console.log("Click");
		for (var x = 0; x < t.clickListeners.length; x++)
			t.clickListeners[x](this);
		t.btn.classList.add("click");
		if (t.timeout)
			clearTimeout(t.timeout);
		t.timeout = setTimeout(function () {
			t.btn.classList.remove("click");
		}, 100);
	}
	setKeyboardSupport(x) {
		t.kbSupported = x;
	}
	setBorderColor(col) {
		this.btn.style.borderColor = col;
		return this;
	}
	setBgColor(col) {
		this.btn.style.background = col;
		return this;
	}
	setfgColor(col) {
		this.btn.style.color = col;
		return this;
	}
	setBorder(bd) {
		this.btn.style.border = bd;
		return this;
	}
	setEnabled(e) {
		var t = this;
		t.enabled = e;
		if (!e) t.btn.classList.add("disabled");
		else t.btn.classList.remove("disabled");
	}
	setSelected(sel) {
		var c = this.btn.classList;
		if (sel) c.add("sel");
		else c.remove("sel");
	}
	setFullSize(sz) {
		if (sz) this.addClass("fullSize");
		else this.removeClass("fullSize");
		return this;
	}
	setText(t) {
		this.btn.innerText = t;
		return this;
	}
	getText() {
		return this.btn.innerText;
	}
	setHtml(t) {
		this.btn.innerHTML = t;
		return this;
	}
	setFontSize(sz) {
		this.btn.style.fontSize = sz;
		return this;
	}
	addClickListener(f) {
		if (!this.clickListeners.includes(f))
			this.clickListeners.push(f);
		return this;
	}
	addLongClickListener(f) {
		if (!this.longClickListeners.includes(f))
			this.longClickListeners.push(f);
		return this;
	}
}