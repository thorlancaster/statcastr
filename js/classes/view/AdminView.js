class AdminView extends View{
    constructor(model){
      super(model);
      var t = this;
      t.viewDisp = new AdminViewDisplay(model);
      t.header = new ScoreDisplayHeader();
      t.defaultStyle();
    }
  }
  