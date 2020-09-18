class ScoreDisplayHeader extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.setStyle("height", "5em").setStyle("background", "var(--main-bg2)");
    t.home = new ScoreboardDisplayHeaderTeam("TEAM", "resources/mascots/froidmedicinelake.png")
    .setStyle("width", "8em").setElasticity(0);
    t.guest = new ScoreboardDisplayHeaderTeam("OPPONENT", "resources/favicon/favicon-256.png")
    .setStyle("width", "8em").setElasticity(0);
    t.homeScore = new NumberField("xxX").setStyle("width", "9em").setElasticity(0.001).addClass("scoreboardHomeScore");
    t.guestScore = new NumberField("xxX").setStyle("width", "9em").setElasticity(0.001).addClass("scoreboardGuestScore");
    t.clock = new NumberField("PX  xX:XX").setStyle("width", "24em").setElasticity(0.001);
    t.appendChild(t.home);
    t.appendChild(t.homeScore);
    t.appendChild(new UIPanel());
    t.appendChild(t.clock);
    t.appendChild(new UIPanel());
    t.appendChild(t.guestScore);
    t.appendChild(t.guest);
  }
  calcSize(){
    super.calcSize();
  }
}

class ScoreboardDisplayHeaderTeam extends UIPanel{
  constructor(name, image){
    super();
    var t = this;
    t.setStyle("flexDirection", "column")
    t.image = new ImageField(image);
    t.name = new TextField(name);
    t.name.setStyle("height", "1em").setElasticity(0);
    t.appendChild(t.image);
    t.appendChild(t.name);
  }
}
