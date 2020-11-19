class TextField extends UIPanel{
    constructor(txt, useHtml){
      super();
      this.addClass("textField");
      if(txt != null){
        if(useHtml) this.setHtml(txt);
        else this.setText(txt);
      }
    }
    setText(txt){
      this.element.textContent = txt; return this;}
    setHtml(html){
      this.element.innerHTML = html; return this;}
  }