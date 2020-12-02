class TextField extends UIPanel{
    constructor(txt, useHtml){
      super();
      this.addClass("textField");
      if(txt != null){
        if(useHtml) this.setHtml(txt);
        else this.setText(txt);
      }
    }
    getHtml(){
      return this.element.innerHTML;
    }
    getText(){
      return this.element.textContent;
    }
    setText(txt){
      this.element.textContent = txt; return this;}
    setHtml(html){
      this.element.innerHTML = html; return this;}
  }

  class EditTextField extends UIPanel{
    constructor(txt, sz){
      super();
      var t = this;
      t.addClass("editTextField");
      t.input = DCE("input");
      t.input.type = "text";
      t.element.appendChild(t.input);
      if(txt != null)
        t.setText(txt);
      if(sz != null)
        t.setSize(sz);
    }
    getText(){
      return this.input.value;
    }
    setText(txt){
      this.input.value = txt; return this;
    }
    setSize(x){
      this.input.size = x;
    }
  }