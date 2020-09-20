class View{
  constructor(model){
    this.model = model;
    this.viewDisp = null; // Mandatory for subclasses to set
    this.header = null; // Optional for subclasses to set
  }
  update(){
    this.viewDisp.update();
    if(this.header){
      this.header.setStateFromModel(this.model);
      this.header.update();
    }
  }
  defaultStyle(){
    this.applyStyle(Constants.defaultStyle);
    this.update();
  }
  getHeaderElement(){
    if(this.header)
      return this.header.getElement();
  }
  getMainElement(){
      return this.viewDisp.getElement();
  }
  resize(){
    this.viewDisp.resize();
    if(this.header)
      this.header.resize();
  }
  applyStyle(a){
    this.viewDisp.applyStyle(a);
    if(this.header)
      this.header.applyStyle(a);
  }
}

class NullView extends View{
  constructor(){
    super(null);
    this.viewDisp = new TextField()
    .setHTML("This view is not available yet.<br/>We apologize for the inconvenience.")
    .setStyle("textAlign", "center").setStyle("height", "100%").setStyle("fontSize", "1.5em");
  }
}
