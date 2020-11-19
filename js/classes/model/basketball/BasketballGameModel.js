class BasketballGameModel extends GameModel{
  constructor(){
    super();
    var t = this;
    t.clock = new BasketballGameClock();
    // t.team = new TestBasketballTeam(
    //   { town: "Froid Medicine-Lake", 
    //     abbr: "FML",
    //     name: "Redhawks",
    //     image: "resources/mascots/froidmedicinelake.png"});
    // t.opp = new TestBasketballTeam(
    //   { town: "Bozeman",
    //     abbr: "STC",
    //     name: "StatCastrs",
    //     image: "resources/favicon/favicon-256.png"}
    // );
    t.team = new BasketballTeam();
    t.opp = new BasketballTeam();
    t.pbp = new BasketballPlayByPlay();
    t.PBP_CLASS = BasketballPBPItem;
    t.pbpCacheLength = 0; // For debugging assert() and sanity checks
    t.initSubStats();
  }
  initSubStats(){
    var t = this;
    t.subStats = [];
    for(var x = 0; x < 9; x++){
      t.subStats.push(new BasketballSubStats(t.team, t.opp, {period: x+1}));
    }
  }

  // dbgCreatePlayByPlay(){
  //   var p = this.pbp;
  //   this.team.starters = ["1", "3", "21", "24", "44"];
  //   this.opp.starters = ["1", "3", "21", "24", "44"];
  //   p.addPlay(new BasketballPBPItem(1, 480 * 1000, 1, null, BasketballPlayType.SET_CLOCK));
  //   p.addPlay(new BasketballPBPItem(1, 477 * 1000, "1", true, BasketballPlayType.REB_UNK));
  //   p.addPlay(new BasketballPBPItem(1, 475 * 1000, "3", true, BasketballPlayType.FOUL_P));
  //   p.addPlay(new BasketballPBPItem(1, 470 * 1000, "21", true, BasketballPlayType.P2_MADE));
  //   p.addPlay(new BasketballPBPItem(1, 465 * 1000, "24", true, BasketballPlayType.TURNOVER));
  //   p.addPlay(new BasketballPBPItem(1, 460 * 1000, "44", true, BasketballPlayType.STEAL));

  //   p.addPlay(new BasketballPBPItem(1, 400 * 1000, "44", true, BasketballPlayType.SUB_OUT));
  //   p.addPlay(new BasketballPBPItem(1, 400 * 1000, "45", true, BasketballPlayType.SUB_IN));

  //   p.addPlay(new BasketballPBPItem(1, 355 * 1000, "1", false, BasketballPlayType.P3_MADE));
  //   p.addPlay(new BasketballPBPItem(1, 350 * 1000, "3", false, BasketballPlayType.FT_MADE));
  //   p.addPlay(new BasketballPBPItem(1, 345 * 1000, "21", false, BasketballPlayType.ASSIST));
  //   p.addPlay(new BasketballPBPItem(1, 340 * 1000, "24", false, BasketballPlayType.DUNK_MADE));
  //   p.addPlay(new BasketballPBPItem(1, 335 * 1000, "44", false, BasketballPlayType.DUNK_MISS));
  //   p.addPlay(new BasketballPBPItem(1, 0         , 1, null, BasketballPlayType.SET_CLOCK));
  //   p.addPlay(new BasketballPBPItem(2, 480 * 1000, 2, null, BasketballPlayType.SET_CLOCK));
  //   p.addPlay(new BasketballPBPItem(2, 475 * 1000, "3", true, BasketballPlayType.DUNK_MADE));
  // }
  /**
   * Get human-readable information on a Play-by-Play
   * @param {*} pbp PBPItem object
   * @param {*} obj Optional object returned from last invocation. Improves performance.
   */
  getPBPInfo(pbp, obj){
    if (!obj) obj = {team: {}};
    var tm = pbp.team==null ? null : (pbp.team ? this.team : this.opp);
    var T = BasketballPlayType;
    var timeStr = pbp.getTimeStr();
    if(tm){
      obj.team.name = tm.name;
      obj.team.abbr = tm.abbr;
      obj.team.img = tm.image;
    } else{
      obj.team.name = obj.team.abbr = "--";
    }
    obj.time = "P"+pbp.period+" "+timeStr;
    obj.score = pbp.rTeamScore + "-" + pbp.rOppScore;
    if(pbp.type == T.SET_CLOCK){
      if(pbp.millis == 0)
        obj.play = "End of period "+pbp.period;
      else
       obj.play = "Clock set: P"+pbp.period+ " "+pbp.getTimeStr();
    }
    else if(pbp.type == T.SUB_IN)
      obj.play = "Substitution IN: "+tm.players[pbp.pid].name;
    else if(pbp.type == T.SUB_OUT)
      obj.play = "Substitution OUT: "+tm.players[pbp.pid].name;
    else
      obj.play = T.toLongStr(pbp.type)+" by "+tm.players[pbp.pid].name;
    // TYPE by #N Name
    return obj;
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


  /**
   * Reloads all of the team scoring data from the play-by-play
   * This rebuilds all cached data and takes quite a while.
   * Use updateFromPBP() instead if possible
   */
  reloadFromPBP(){
    // console.warn("PBP cache blown. Must reload " + this.pbp.plays.length);
    var t = this;
    t.team.reset();
    t.opp.reset();
    for(var y = 0; y < t.subStats.length; y++)
      t.subStats[y].reset();
    t.pbpCacheLength = 0;
    for(var x = 0; x < t.pbp.plays.length; x++){
      t.updateFromPBP(x);
    }
  }

  /**
   * Reloads all roster-related data.
   * Call this function after the roster changes
   * and BEFORE calling reloadFromPBP();
   */
  reloadRosters(){
    this.initSubStats();
  }

  /**
   * Loads the last play in pbp into the cache
   * @param {Integer} playNum Overrides "last play in pbp". If negative, is relative to length.
   */
  updateFromPBP(playNum){
    var t = this;
    var x = playNum;
    if(playNum == null){
      x = t.pbp.plays.length-1;
    } else if(playNum < 0){
      x = t.pbp.plays.length + playNum;
    }
    t.pbpCacheLength++;
    if(playNum == null){
      assert(t.pbpCacheLength == t.pbp.length, "PBP cache length mismatch");
    }
    var p = t.pbp.plays[x]; // Current Play
    var lp = t.pbp.plays[x-1]; // Last Play
    if(p.millis)t.clock.millisLeft = p.millis;
    if(p.period)t.clock.period = p.period;

    for(var y = 0; y < t.subStats.length; y++)
      t.subStats[y].doPlay(p);

    t.team.doPlay(p, p.team != true, false);
    t.opp.doPlay(p, p.team != false, false);

    if(p.team == true){
      p.rTeamScore = (lp?lp.rTeamScore:0) + BasketballPlayType.pointsOf(p.type);
      p.rOppScore = lp?lp.rOppScore:0;
    }else if(p.team == false){
      p.rTeamScore = lp?lp.rTeamScore:0;
      p.rOppScore = (lp?lp.rOppScore:0) + BasketballPlayType.pointsOf(p.type);
    }
    else{ // Play does not belong to either team, must be game mgmt
      p.rTeamScore = lp?lp.rTeamScore:0;
      p.rOppScore = lp?lp.rOppScore:0;

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

  /* Stuff for Synchronizr compatibliity */
  // getStaticData(){
  //   return [this.team, this.opp];
  // }
  // getDynamicData(){
  //   var t = this;
  //   return [this.clock];
  // }
  // getEventData(){
  //   return this.pbp.plays;
  // }
  updateStaticData(d){
    // Set the rosters, names, etc.
    this.parseSportsBallRosterBytecode(d);
  }
  updateDynamicData(d){
    // TODO set the clock, etc from d
  }
  updateEventData(d, n){
    // Set the last n PBPs from the last n of d
    if(!n) n = d.length;
    this.parseSportsBallPBPBytecode(d, n);
  }
}

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
  // Format: period ms ms ms
  toByteArray(){
    var ms = this.millisLeft;
    var rtn = new Uint8Array(4);
    rtn[0] = this.period;
    rtn[1] = ms >> 16;
    rtn[2] = ms >> 8;
    rtn[3] = ms;
    return rtn;
  }
  fromByteArray(arr){
    this.period = arr[0];
    this.millisLeft = arr[1] * 65536 + arr[2] * 256 + arr[3];
  }
}
