class View{
  constructor(model, viewDisp){
    this.model = model;
    this.viewDisp = viewDisp;
  }
  update(){
    throw "Abstract Method";
  }
  defaultStyle(){
    throw "Abstract Method";
  }
  getElement(){return this.viewDisp.getElement()}
  resize(){this.viewDisp.resize()}
  applyStyle(a){this.viewDisp.applyStyle(a)}
}

class NullView extends View{
  constructor(){
    super(null, new TextField().setHTML("This view is not available yet.<br/>We apologize for the inconvenience.")
    .setStyle("textAlign", "center").setStyle("height", "100%").setStyle("fontSize", "1.5em"));
  }
  update(){}
  defaultStyle(){};
}
