
class PlayByPlayDisplay extends UIPanel{
  constructor(model){
    super();
    var t = this;
    this.model = model;
    t.numRecent = 32;
    // TODO are all the below style declarations necessary?
    t.addClass("playByPlayDisplay").addClass("viewDisp");
    t.setStyle("flexDirection", "column");
    t.setStyle("alignItems", "center").setStyle("overflow", "auto");
    t.selector = new TabSelector();
    t.selector.addTab("<u>R</u>ecent", "recent");
    for(var x = 1; x < 10; x++){
      t.selector.addTab("P<u>"+x+"</u>", ""+x);
    }
    t.selector.setSelected("recent");
    t.selector.setMaxVisible(5);
    t.selector.addSelectionListener(t.onSelect.bind(t));
    var pdt = new PBPDisplayTable();
    t.pbpDisplayTable = pdt;
    pdt.setStyle("width", "100%");
    pdt.limit = t.numRecent;
    t.appendChild(t.selector);
    t.appendChild(pdt);
  }

  setRow(x, team, time, score, play){
    // this.main.table.setRow(x, [team, time, score, play]);
  }

  update(){
    var t = this;
    t.selector.setMaxVisible(t.model.clock.period + 1);
    t.pbpDisplayTable.setStateFromModel(this.model);
    t.pbpDisplayTable.update();
  }

  onSelect(txt){
    var t = this;
    var ls = "";
    switch(txt){
      case "recent": ls = "Most Recent"; break;
      case "1": ls = "1st Period"; break;
      case "2": ls = "2nd Period"; break;
      case "3": ls = "3rd Period"; break;
      default: ls = txt + "th Period";
    }
    var tbl = t.pbpDisplayTable;
    tbl.label.setText(ls + " Plays");
    tbl.limit = txt=="recent"?t.numRecent:0;
    tbl.filter = txt=="recent"?null:{period: parseInt(txt)};
    t.update();
  }
}

// class PlayByPlayMain extends UIPanel{
//   constructor(){
//     super();
//     var t = this;
//     t.selected = "recent";
//     t.setElasticity(0).addClass("playByPlayMain").setStyle("width", "80%");
//     t.setStyle("minHeight", "3em").setStyle("flexDirection", "column");
//     t.setStyle("background", "var(--gradient-bg)").setStyle("border", "1px solid #000");
//     t.selector = new TabSelector();
//     t.selector.addTab("<u>R</u>ecent", "recent");
//     for(var x = 1; x < 10; x++){
//       t.selector.addTab("P<u>"+x+"</u>", ""+x);
//     }
//     t.selector.setSelected("recent");
//     t.selector.setMaxVisible(5);
//     t.selector.addSelectionListener(t.onSelect.bind(t));
//     t.label = new TextField("Most Recent Plays").setStyle("justifyContent", "left")
//     .setStyle("marginLeft", "0.2em").setStyle("fontWeight", "bold").setStyle("fontSize", "1.5em");
//     t.table = new TableField(["Team", "  Time  ", "Score", "Play"]);
//     t.appendChild(t.selector);
//     t.appendChild(t.label);
//     t.appendChild(t.table);
//   }
//   onSelect(txt){
//     var ls = "";
//     switch(txt){
//       case "recent": ls = "Most Recent"; break;
//       case "1": ls = "1st Period"; break;
//       case "2": ls = "2nd Period"; break;
//       case "3": ls = "3rd Period"; break;
//       default: ls = txt + "th Period";
//     }
//     this.label.setText(ls + " Plays");
//   }
// }
