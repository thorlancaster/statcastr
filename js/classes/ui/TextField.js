class TextField extends UIPanel{
    constructor(txt){
      super();
      this.addClass("textField");
      if(txt != null)
        this.setText(txt);
    }
    setText(txt){
      this.element.textContent = txt; return this;}
    setHTML(html){
      this.element.innerHTML = html; return this;}
  }