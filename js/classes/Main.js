class Main{
  constructor(){
    var t = this;
    t.appRoot = DGE(APP_ROOT);
    t.viewContainer = DCE("div","viewContainer");
    t.appRoot.appendChild(t.viewContainer);
    t.views = [];
    t.generateView("scoreboard", new Scoreboard());
    setTimeout(function(){t.onResize()}, 0);
  }

  init(){
    var t = this;
    t.setView("scoreboard");
  }

  generateView(name, obj){
    obj.element.classList.add("mainView");
    this.views.push(["scoreboard", obj]);
  }

  setView(vid){
    var t = this;
    CLEAR(t.viewContainer);
    var selView = null; // View that maps to given vid
    for(var x = 0; x < t.views.length; x++){
      var key = t.views[x][0];
      var val = t.views[x][1];
      if(key == vid){
        selView = val;
        break;
      }
    }
    if(selView == null)
      selView = new NullView();
    t.viewContainer.appendChild(selView.element);
  }

  test(){
    this.getSelectedView().applyStyle({scoreboardPFPPlayerNum: {litColor: "#F00"}});
    this.getSelectedView().update();
  }

  getSelectedView(){
    return this.views[0][1]; // TODO fix
  }

  onResize(){
    this.getSelectedView().resize();
  }

  onFocus(){

  }
  onBlur(){

  }
}
