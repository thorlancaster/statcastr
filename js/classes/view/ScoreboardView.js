
class ScoreboardView extends View{
  constructor(model, viewDisp){
    super(model, viewDisp);
    this.defaultStyle();
  }
  update(){
    var t = this;
    var m = t.model;
    var msc = t.viewDisp.mainScore;
    t.updatePFP(t.viewDisp.leftPFP, m.team.onCourt());
    t.updatePFP(t.viewDisp.rightPFP, m.opp.onCourt());
    msc.homeImage.setSrc(m.team.image);
    msc.homeName.setText(m.team.name);
    msc.guestImage.setSrc(m.opp.image);
    msc.guestName.setText(m.opp.name);
    var ms = t.viewDisp.mainScore;
    var time = m.clock.getTime();
    ms.clock.setValue(time.minutes*100 + time.seconds);
    ms.homeScore.setValue(m.team.getStat("points"));
    ms.guestScore.setValue(m.opp.getStat("points"));
    ms.period.number.setValue(m.clock.period);
    ms.homeFouls.setValue(m.team.getStat("fouls")); // TODO get stats since halftime
    ms.guestFouls.setValue(m.opp.getStat("fouls"));
    var lastFl = m.getLastPlayerFoul(60000);
    if(lastFl)
      ms.playerFoul.setValue(parseInt(lastFl.player)*10 + lastFl.fouls);
    else
      ms.playerFoul.setValue(null);
    t.viewDisp.update();

  }
  updatePFP(view, plyrs){
    var items = view.items;
    for(var x = 0; x < items.length; x++){
      var i = items[x];
      var p = plyrs[x];
      if(p){
        i.playerName.setText(p.name);
        i.playerNum.setValue(p.id);
        i.foulsNum.setValue(p.fouls);
        i.pointsNum.setValue(p.points);
      } else {
        i.playerName.setText("");
        i.playerNum.setValue(null);
        i.foulsNum.setValue(null);
        i.pointsNum.setValue(null);
      }
    }
  }
  defaultStyle(){
    this.applyStyle(Constants.defaultStyle);
    this.update();
  }
}
