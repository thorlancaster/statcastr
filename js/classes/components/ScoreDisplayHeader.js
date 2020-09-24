/**
 * The header at the top of most views that shows:
 * The home team name and icon,
 * The home team score,
 * The clock,
 * The guest team score,
 * and finally the guest team name and icon.
 */
class ScoreDisplayHeader extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.addClass("scoreDisplayHeader");
    t.setStyle("height", "5em").setStyle("background", "var(--main-bg2)");
    t.home = new ScoreDisplayHeaderTeam("TEAM", "")
    .setStyle("width", "8em").setElasticity(0);
    t.guest = new ScoreDisplayHeaderTeam("OPPONENT", "")
    .setStyle("width", "8em").setElasticity(0);
    t.homeScore = new NumberField("xxX").setStyle("width", "9em").setElasticity(0.001).addClass("scoreboardHomeScore");
    t.guestScore = new NumberField("xxX").setStyle("width", "9em").setElasticity(0.001).addClass("scoreboardGuestScore");
    t.clock = new NumberField("PX  nX:XX").setStyle("width", "24em").setElasticity(0.001);
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
  setStateFromModel(m){
    var t = this;
    var gTime = m.clock.getTime();
    t.home.image.setSrc(m.team.image);
    t.home.name.setText(m.team.name);
    t.guest.image.setSrc(m.opp.image);
    t.guest.name.setText(m.opp.name);
    t.clock.setValue(m.clock.period * 10000 + gTime.minutes * 100 + gTime.seconds);
    t.homeScore.setValue(m.team.getStat("points"));
    t.guestScore.setValue(m.opp.getStat("points"));
  }
}
class ScoreDisplayHeaderTeam extends UIPanel{
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

