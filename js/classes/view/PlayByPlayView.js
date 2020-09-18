class PlayByPlayView extends View{
  constructor(model, viewDisp){
    super(model, viewDisp);
    var t = this;
    t.defaultStyle();
  }

  update(){
    // Update the ViewDisp to reflect the Model
  }

  defaultStyle(){
    this.applyStyle(Constants.defaultStyle);
    this.update();
  }
}
