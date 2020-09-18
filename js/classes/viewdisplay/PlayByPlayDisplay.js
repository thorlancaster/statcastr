class PlayByPlayDisplay extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.setStyle("height", "100%").setStyle("flexDirection", "column");
    t.setStyle("alignItems", "center").setStyle("overflow", "auto");
    t.dispHeader = new ScoreDisplayHeader();
    t.dispHeader.setStyle("position", "sticky").setStyle("width", "100%")
    .setStyle("top", "0").setElasticity(0);
    t.appendChild(t.dispHeader);
    t.main = new PlayByPlayMain();
    t.main.setStyles("marginTop", "marginBottom", "2em");
    t.appendChild(t.main);
  }
}

class PlayByPlayMain extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.selected = "recent";
    t.setElasticity(0).addClass("playByPlayMain").setStyle("width", "80%");
    t.setStyle("minHeight", "3em").setStyle("flexDirection", "column");
    t.setStyle("background", "var(--gradient-bg)").setStyle("border", "1px solid #000");
    t.selector = new TabSelector();
    t.selector.addTab("<u>R</u>ecent", "recent");
    for(var x = 1; x < 10; x++){
      t.selector.addTab("P<u>"+x+"</u>", ""+x);
    }
    t.selector.setSelected("recent");
    t.selector.setMaxVisible(5);
    t.selector.addSelectionListener(t.onSelect.bind(t));
    t.label = new TextField("Recent Plays").setStyle("justifyContent", "left")
    .setStyle("marginLeft", "0.2em").setStyle("fontWeight", "bold").setStyle("fontSize", "1.5em");
    t.table = new TableField(["Team", "Time", "Score", "Play"]);
    t.appendChild(t.selector);
    t.appendChild(t.label);
    t.appendChild(t.table);
  }
  onSelect(txt){
    var ls = "";
    switch(txt){
      case "recent": ls = "Most Recent"; break;
      case "1": ls = "1st Period"; break;
      case "2": ls = "2nd Period"; break;
      case "3": ls = "3rd Period"; break;
      default: ls = txt + "th Period";
    }
    this.label.setText(ls + " Plays");
  }
}
