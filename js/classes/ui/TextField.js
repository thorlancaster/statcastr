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