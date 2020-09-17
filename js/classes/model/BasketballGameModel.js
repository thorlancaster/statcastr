

class BasketballGameClock extends GameClock{
  constructor(){
    super();
    this.period = 0;
    this.millisLeft = 0;
  }
  getTime(){
    var ml = this.millisLeft;
    return{
      minutes: Math.floor(ml/60000),
      seconds: Math.floor(ml/1000) % 60,
      millis: ml%1000};
  }
}


const BasketballPlayType = {
  FOUL_P: 1,
  FOUL_T: 2,
  FT_MADE: 3,
  FT_MISS: 4,
  P2_MADE: 5,
  P2_MISS: 6,
  DUNK_MADE: 7,
  DUNK_MISS: 8,
  P3_MADE: 9,
  P3_MISS: 10,
  REB_OFF: 11,
  REB_DEF: 12,
  REB_UNK: 13,
  ASSIST: 14,
  BLOCK: 15,
  STEAL: 16,
  TURNOVER: 17,
  SET_CLOCK: 18,
  SUB_IN: 19,
  SUB_OUT: 20,
  isValid: function(x){
    return x >= 1 && x <= 20;
  }
}

class BasketballPBPItem extends PBPItem{
  /**
  * @param period see PBPItem
  * @param millis see PBPItem
  * @param pid see PBPItem
  * @param team see PBPItem
  * @param type a valid play type (from BasketballPlayType)
  */
  constructor(period, millis, pid, team, type){
    super(period, millis, pid, team);
    assert(BasketballPlayType.isValid(type), "Invalid Play Type");
    this.type = type;
  }
}

class BasketballPlayByPlay extends PlayByPlay{
  constructor(){
    super();
  }
  addPlay(p){
    assert(p.constructor.name == "BasketballPBPItem");
    this.plays.push(p);
  }
  removePlay(x){
    this.plays.remove(x);
  }
}

class BasketballGameModel extends GameModel{
  constructor(){
    super();
    var t = this;
    t.clock = new BasketballGameClock();
    t.team = new TestBasketballTeam();
    t.opp = new TestBasketballTeam();
    t.pbp = new BasketballPlayByPlay();
  }
  dbgCreatePlayByPlay(){
    var p = this.pbp;
    p.addPlay(new BasketballPBPItem(1, 480 * 1000, 1, null, BasketballPlayType.SET_CLOCK));
    p.addPlay(new BasketballPBPItem(1, 477 * 1000, "1", true, BasketballPlayType.REB_UNK));
    p.addPlay(new BasketballPBPItem(1, 475 * 1000, "3", true, BasketballPlayType.FOUL_P));
    p.addPlay(new BasketballPBPItem(1, 470 * 1000, "21", true, BasketballPlayType.P2_MADE));
    p.addPlay(new BasketballPBPItem(1, 465 * 1000, "24", true, BasketballPlayType.TURNOVER));
    p.addPlay(new BasketballPBPItem(1, 460 * 1000, "44", true, BasketballPlayType.STEAL));
    p.addPlay(new BasketballPBPItem(1, 455 * 1000, "1", false, BasketballPlayType.P3_MADE));
    p.addPlay(new BasketballPBPItem(1, 450 * 1000, "3", false, BasketballPlayType.FT_MADE));
    p.addPlay(new BasketballPBPItem(1, 445 * 1000, "21", false, BasketballPlayType.ASSIST));
    p.addPlay(new BasketballPBPItem(1, 440 * 1000, "24", false, BasketballPlayType.DUNK_MADE));
    p.addPlay(new BasketballPBPItem(1, 435 * 1000, "44", false, BasketballPlayType.DUNK_MISS));
  }
  /**
  * Update a roster
  * @param team true for Team, false for Opponent
  * @param pid id of player. (Upsert)
  * @param name name of player, or null to remove
  */
  updateRoster(team, pid, name){
    // TODO implement this
  }

  getLastPlayerFoul(millisBack){
    var t = this;
    var pls = t.pbp.plays;
    var lastPlay = pls[pls.length-1];
    for(var x = pls.length-1; x >= 0; x--){
      var p = pls[x];
      if(Math.abs(p.millis - lastPlay.millis) > millisBack || p.period != lastPlay.period)
        break;

      if(p.type == BasketballPlayType.FOUL_P || p.type == BasketballPlayType.FOUL_T){
        var fls =(p.team?t.team:t.opp).players[p.pid].fouls;
        return{player: p.pid, fouls: fls};
      }
    }
    return null;
  }

  updateFromPBP(){
    var t = this;
    t.team.reset();
    t.opp.reset();
    for(var x = 0; x < t.pbp.plays.length; x++){
      var p = t.pbp.plays[x];
      if(p.millis)
        t.clock.millisLeft = p.millis;
      if(p.team == true)
        t.team.doPlay(p);
      else if(p.team == false)
        t.opp.doPlay(p);
      else{ // Play does not belong to either team, must be game mgmt
        switch(p.type){
          case BasketballPlayType.SET_CLOCK:
            t.clock.period = p.pid;
          break;
          default:
            assert(false, "Unrecognized null-team play type");
          break;
        }
      }
    }
  }
}

class BasketballTeam extends Team{
  constructor(){
    super();
  }
  doPlay(p){
    var t = this;
    var pl = t.players[p.pid];
    assert(pl != null, "Player for doPlay DNE");
    const T = BasketballPlayType;
    switch(p.type){
      case T.FOUL_P: pl.pFouls++; break;
      case T.FOUL_T: pl.tFouls++; break;
      case T.FT_MADE: pl.ftMade++; break;
      case T.FT_MISS: pl.ftMiss++; break;
      case T.P2_MADE: pl.p2NormMade++; break;
      case T.P2_MISS: pl.p2NormMiss++; break;
      case T.DUNK_MADE: pl.dunkMade++; break;
      case T.DUNK_MISS: pl.dunkMiss++; break;
      case T.P3_MADE: pl.p3Made++; break;
      case T.P3_MISS: pl.p3Miss++; break;
      case T.REB_OFF: pl.offReb++; break;
      case T.REB_DEF: pl.defReb++; break;
      case T.REB_UNK: pl.unkReb++; break;
      case T.ASSIST: pl.assists++; break;
      case T.BLOCK: pl.blocks++; break;
      case T.STEAL: pl.steals++; break;
      case T.TURNOVER: pl.turnovers++; break;
      case T.SUB_IN: break;
      case T.SUB_OUT: break;
      default: assert(false, "Unrecognized play type");
    }
  }
  onCourt(){
    var rtn = [];
    for(var x in this.players){
      if(this.players[x].onCourt)
        rtn.push(this.players[x]);
    }
    return rtn;
  }
}


class TestBasketballTeam extends BasketballTeam{
  constructor(){
    super();
    var t = this;
    var p4 = new BasketballPlayer("1", "Isaac Johnson");
    var p1 = new BasketballPlayer("3", "Javonne Nesbit");
    var p2 = new BasketballPlayer("21", "Colt Miller");
    var p3 = new BasketballPlayer("24", "Mason Dethman");
    var p5 = new BasketballPlayer("44", "Bode Miller");
    t.addPlayer(p1);
    t.addPlayer(p2);
    t.addPlayer(p3);
    t.addPlayer(p4);
    t.addPlayer(p5);
  }
}


class BasketballPlayer extends Player{
  constructor(number, name){
    super(number, name);
    this.reset();
  }
  reset(){
    var t = this;
    t.onCourt = true;

    t.pFouls = 0;
    t.tFouls = 0;

    t.ftMade = 0;
    t.ftMiss = 0;
    t.p2NormMade = 0;
    t.p2NormMiss = 0;
    t.dunkMade = 0;
    t.dunkMiss = 0;
    t.p3Made = 0;
    t.p3Miss = 0;

    t.offReb = 0;
    t.defReb = 0;
    t.unkReb = 0;
    t.assists = 0;
    t.blocks = 0;
    t.steals = 0;
    t.turnovers = 0;
  }
  get p2Made(){return this.p2NormMade + this.dunkMade}
  get p2Miss(){return this.p2NormMiss + this.dunkMiss}
  get points(){return this.ftMade + this.p2Made * 2 + this.p3Made * 3}
  get fouls(){return this.pFouls + this.tFouls}
  get rebounds(){return this.offReb + this.defReb + this.unkReb}
  get fgMade(){return this.p2Made + this.p3Made}
  get fgMiss(){return this.p2Miss + this.p3Miss}
  get fgTotal(){return this.fgMade + this.fgMiss}
  get shotsMade(){return this.ftMade + this.fgMade}
  get shotsMiss(){return this.ftMiss + this.fgMiss}
  get shotsTotal(){return this.shotsMade + this.shotsMiss}
  get fgPercentage(){return this.fgMade / this.fgTotal * 100}
  get ftPercentage(){return this.ftMade / this.ftTotal * 100}
  get nbaEfficiency(){
    var t = this;
    return t.points + t.rebounds + t.assists + t.steals + t.blocks - (t.fgMiss + t.ftMiss + t.turnovers);
  }
}
