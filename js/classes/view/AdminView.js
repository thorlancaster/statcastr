class AdminView extends View{
    constructor(model, BUS){
      super(model);
      var t = this;
      t.viewDisp = new AdminViewDisplay(model, BUS);
      t.header = new ScoreDisplayHeader();
      t.defaultStyle();
    }
    onGesture(obj){
      this.viewDisp.onGesture(obj);
    }
    onKey(char, down){
      this.viewDisp.onKey(char, down);
    }
  }
  