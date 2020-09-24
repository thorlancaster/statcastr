
class BasketballTeam extends Team{
    constructor(info){
      super(info);
    }
    doPlayForTime(p){
      var t = this;
      // debugger;
      var dTime = t.lastPlayTime.ms - p.millis;
      if(dTime > 0){
        for(var x in t.players){
          var pl = t.players[x];
          if(pl.onCourt)
            pl.playMs += dTime;
          // if(pl.id == '1'){
          //   console.log(pl.playMs)
          // }
        }
      }
      t.lastPlayTime.ms = p.millis;
      t.lastPlayTime.pd = p.period;
    }
  
    /**
     * Apply a PBP play to this team's status
     * @param {*} p Play to apply
     * @param {*} otherTeam True if play is for other team
     * @param {*} otherFilter True if play does not match the filter.
     * In this case it would only be used for SUB_IN and SUB_OUT
     */
    doPlay(p, otherTeam, otherFilter){
      var t = this;
      if(!otherFilter){
        t.doPlayForTime(p);
      }
      if(!otherTeam){
        var pl = t.players[p.pid];
        assert(pl != null, "Player for doPlay DNE");
        const T = BasketballPlayType;
        if(!otherFilter){
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
            case T.SUB_IN: pl.onCourt = true; break;
            case T.SUB_OUT: pl.onCourt = false; break;
            default: assert(false, "Unrecognized play type");
          }
        } else {
          switch(p.type){
            case T.SUB_IN: pl.onCourt = true; break;
            case T.SUB_OUT: pl.onCourt = false; break;
          }
        }
      }
    }
    copyRoster(srcTeam){
      this.players.length = 0;
      for(var x in srcTeam.players){
        var p = srcTeam.players[x];
        this.addPlayer(new BasketballPlayer(p.id, p.name));
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
    constructor(info){
      super(info);
      var t = this;
      var p1 = new BasketballPlayer("1", "Isaac Johnson");
      var p2 = new BasketballPlayer("3", "Javonne Nesbit");
      var p3 = new BasketballPlayer("21", "Colt Miller");
      var p4 = new BasketballPlayer("24", "Mason Dethman");
      var p5 = new BasketballPlayer("44", "Bode Miller");
      var p6 = new BasketballPlayer("45", "Brett Stentoft");
      p6.onCourt = false;
      t.addPlayer(p1);
      t.addPlayer(p2);
      t.addPlayer(p3);
      t.addPlayer(p4);
      t.addPlayer(p5);
      t.addPlayer(p6);
    }
  }