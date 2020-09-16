// This file contains the classes that comprise the Scoreboard VIEW.
// These classes are not a model and not a controller. This is just a VIEW.

class Scoreboard extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.leftPFP = new ScoreboardPFP();
    t.rightPFP = new ScoreboardPFP();
    t.mainScore = new ScoreboardMain();
    t.element = DCE("div", "scoreboard", "uiPanel");
    t.element.style.setProperty("--border-large", "4px");
    t.element.style.setProperty("--border-small", "2px");
    t.element.style.setProperty("--border-color", "#AAA");
    t.leftPFP.setStyle("width", "20%");
    t.mainScore.setStyle("width", "60%");
    t.rightPFP.setStyle("width", "20%");
    t.appendChild(t.leftPFP);
    t.appendChild(t.mainScore);
    t.appendChild(t.rightPFP);
  }
}

class ScoreboardPFP extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.element = DCE("div", "scoreboardPFP", "uiPanel");
    t.setStyle("flexDirection", "column");
    t.items = [];
    var header = new ScoreboardPFPHeader();
    header.setStyle("height", "2em");
    header.setElasticity(0);
    t.appendChild(header);
    for(var x = 0; x < 5; x++){
      t.items[x] = new ScoreboardPFPItem();
      t.appendChild(t.items[x]);
    }
  }
}

class ScoreboardPFPHeader extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.element = DCE("div", "scoreboardPFPHeader", "uiPanel");
    t.plLabel = new TextField("PLYR").setStyle("fontSize", "2em").setStyle("width","33.34%").setElasticity(0);
    t.flLabel = new TextField("FLS").setStyle("fontSize", "2em").setStyle("width","33.34%").setElasticity(0);
    t.ptLabel = new TextField("PTS").setStyle("fontSize", "2em").setStyle("width","33.34%").setElasticity(0);
    t.appendChild(t.plLabel);
    t.appendChild(t.flLabel);
    t.appendChild(t.ptLabel);
  }
}

class ScoreboardPFPItem extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.element = DCE("div", "scoreboardPFPItem", "uiPanel");
    t.setStyle("flexDirection", "column");
    t.setStyle("border-top", "var(--border-small) solid var(--border-color)");
    t.playerName = new TextField("Player Name");
    t.playerName.setElasticity(0).setStyle("fontSize", "1.5em");
    t.playerName.setStyle("height", "1em").setStyle("justifyContent", "left").setStyle("paddingLeft", "0.3em");
    t.playerNum = new NumberField("XX").addClass("scoreboardPFPPlayerNum");
    t.foulsNum = new NumberField("XX").addClass("scoreboardPFPPlayerFouls");
    t.pointsNum = new NumberField("XX").addClass("scoreboardPFPPlayerPoints");
    var nums = new UIPanel();
    t.appendChild(t.playerName);
    t.appendChild(nums);
    nums.appendChild(t.playerNum);
    nums.appendChild(t.foulsNum);
    nums.appendChild(t.pointsNum);
  }
}

class ScoreboardPeriodArea extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.setStyle("flexDirection", "column");
    t.setStyle("fontSize", "2em");
    t.label = new TextField("PERIOD")
    t.label.setStyle("height", "1.1em");
    t.label.setElasticity(0);
    t.number = new NumberField("X");
    t.appendChild(t.label);
    t.appendChild(t.number);
  }
}

class ScoreboardMain extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.element = DCE("div", "scoreboardMain", "uiPanel");
    t.setStyle("flexDirection", "column");
    t.setStyles("border-left", "border-right", "var(--border-large) solid var(--border-color)");
    t.homeImage = new ImageField("resources/mascots/froidmedicinelake.png");
    t.guestImage = new ImageField("resources/favicon/favicon-256.png");
    t.clock = new NumberField("XX:XX");
    t.homeName = new TextField("TEAM").setStyle("fontSize", "1.5em");
    t.guestName = new TextField("OPPONENT").setStyle("fontSize", "1.5em");
    t.homeScore = new NumberField("1XX");
    t.period = new ScoreboardPeriodArea();
    t.guestScore = new NumberField("1XX");
    t.homeFouls = new NumberField("1X").setElasticity(0).setStyle("width", "20%");
    t.playerFoul = new NumberField("XX X").setStyle("width", "30%");
    t.guestFouls = new NumberField("1X").setElasticity(0).setStyle("width", "20%");

    t.row1 = new UIPanel(); // HomeImage Clock GuestImage
    t.row1.element.classList.add("scoreboardRow1");
    t.homeImage.setStyle("width", "30%");
    t.clock.setStyle("width", "40%");
    t.guestImage.setStyle("width", "30%");
    t.row1.setStyle("height", "25%");
    t.row1.appendChild(t.homeImage);
    t.row1.appendChild(t.clock);
    t.row1.appendChild(t.guestImage);

    t.row2 = new UIPanel();
    t.row2.element.classList.add("scoreboardRow2");
    var row2Sep = new UIPanel();
    t.homeName.setStyle("width", "30%");
    t.guestName.setStyle("width", "30%");
    row2Sep.setStyle("width", "40%");
    t.row2.setStyle("height", "5%");
    t.row2.appendChild(t.homeName);
    t.row2.appendChild(row2Sep);
    t.row2.appendChild(t.guestName);

    t.row3 = new UIPanel(); // HomeScore Period GuestScore
    t.row3.element.classList.add("scoreboardRow3");
    t.row3.setStyle("height", "30%");
    t.row3.appendChild(t.homeScore);
    t.row3.appendChild(t.period);
    t.row3.appendChild(t.guestScore);

    t.row4 = new UIPanel();
    t.row4.element.classList.add("scoreboardRow4");
    t.row4.setStyle("height", "10%");

    t.row5 = new UIPanel();
    t.row5.element.classList.add("scoreboardRow5");
    t.row5.setStyle("height", "5%");
    t.row5.appendChild(new TextField("FOULS").setStyle("fontSize", "1.5em"));
    t.row5.appendChild(new UIPanel().setElasticity(0).setStyle("width", "15%"));
    t.row5.appendChild(new TextField("PLAYER-FOUL").setStyle("fontSize", "1.5em"));
    t.row5.appendChild(new UIPanel().setElasticity(0).setStyle("width", "15%"));
    t.row5.appendChild(new TextField("FOULS").setStyle("fontSize", "1.5em"));

    t.row6 = new UIPanel(); // HomeFouls [EMPTY] Player-Foul [EMPTY] GuestFouls
    t.row6.element.classList.add("scoreboardRow6");
    t.row6.setStyle("height", "20%");
    t.row6.appendChild(t.homeFouls);
    t.row6.appendChild(new UIPanel().setElasticity(0).setStyle("width", "15%"));
    t.row6.appendChild(t.playerFoul);
    t.row6.appendChild(new UIPanel().setElasticity(0).setStyle("width", "15%"));
    t.row6.appendChild(t.guestFouls);

    t.appendChild(t.row1);
    t.appendChild(t.row2);
    t.appendChild(t.row3);
    t.appendChild(t.row4);
    t.appendChild(t.row5);
    t.appendChild(t.row6);
  }
}
