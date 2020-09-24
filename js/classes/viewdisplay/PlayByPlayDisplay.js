
class PlayByPlayDisplay extends TabbedViewDisplay{
  constructor(model, numRecent){
    super(model, "<u>R</u>ecent");
    var t = this;
    t.addClass("playByPlayDisplay");
    t.numRecent = numRecent==null?32:numRecent;
    t.pdt = new PBPDisplayTable();
    t.pdt.setStyle("width", "100%");
    t.pdt.limit = t.numRecent;
    t.appendChild(t.pdt);
  }

  update(){
    super.update();
    var t = this;
    t.pdt.setStateFromModel(this.model);
  }

  onSelect(txt){
    var t = this;
    var ls = "";
    switch(txt){
      case "*": ls = "Most Recent"; break;
      case "1": ls = "1st Period"; break;
      case "2": ls = "2nd Period"; break;
      case "3": ls = "3rd Period"; break;
      default: ls = txt + "th Period";
    }
    var tbl = t.pdt;
    tbl.label.setText(ls + " Plays");
    tbl.limit = txt=="*"?t.numRecent:0;
    tbl.filter = txt=="*"?null:{period: parseInt(txt)};
    t.update();
  }
}