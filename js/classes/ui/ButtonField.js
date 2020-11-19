class ButtonField extends UIPanel{
	constructor(btnText, fullSize){
		super();
		var t = this;
		t.clickListeners = [];
		t.setFullSize(fullSize);
		t.btn = DCE("button");
		t.addClass("buttonField");
		t.appendChild(t.btn);
		t.setText(btnText);
		t.btn.addEventListener("click", t.click.bind(t));
		t.btn.addEventListener("touchend", function(e){
			if(!t.enabled) return;
			e.uCanceledBy = t;
		});
		t.enabled = true;
	}
	click(){
		var t = this;
		if(!t.enabled)
			return; // Disabled
		for(var x = 0; x < t.clickListeners.length; x++)
			t.clickListeners[x](this);
		t.btn.classList.add("click");
		if(t.timeout)
			clearTimeout(t.timeout);
		t.timeout = setTimeout(function(){
			t.btn.classList.remove("click");
		}, 100);
	}
	setBorderColor(col){
		this.btn.style.borderColor = col;
		return this;
	}
	setBgColor(col){
		this.btn.style.background = col;
		return this;
	}
	setfgColor(col){
		this.btn.style.color = col;
		return this;
	}
	setBorder(bd){
		this.btn.style.border = bd;
		return this;
	}
	setEnabled(e){
		var t = this;
		t.enabled = e;
		if(!e) t.btn.classList.add("disabled");
		else t.btn.classList.remove("disabled");
	}
	setSelected(sel){
		var c = this.btn.classList;
		if(sel) c.add("sel");
		else c.remove("sel");
	}
	setFullSize(sz){
		if(sz) this.addClass("fullSize");
		else this.removeClass("fullSize");
		return this;
	}
	setText(t){
		this.btn.innerText = t;
		return this;
	}
	getText(){
		return this.btn.innerText;
	}
	setHtml(t){
		this.btn.innerHTML = t;
		return this;
	}
	setFontSize(sz){
		this.btn.style.fontSize = sz;
		return this;
	}
	addClickListener(f){
		if(!this.clickListeners.includes(f))
			this.clickListeners.push(f);
		return this;
	}
}