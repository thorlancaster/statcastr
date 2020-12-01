class GameModel {
  constructor(team, opp, pbp) {
    this.team = team;
    this.opp = opp;
    this.pbp = pbp;
    this.PBP_CLASS = null;
    this.gender = null;
    this.location = null;
    this.desc = null;
  }

  /**
  * Parse an array of bytecode (Synchronizr.EVENT for PBP)
  * and apply the result to this model.
  * @param {Array} arrs Bytecode as Synchronizr.EVENT
  */
  parsePBPBytecode(arrs, limit) {
    var t = this;
    var l = arrs.length;
    var pls = t.pbp.plays;
    for (var x = l - 1; x >= l - limit; x--) {
      if (!pls[x])
        pls[x] = new t.PBP_CLASS();
      pls[x].fromByteArray(arrs[x]);
    }
  }
  genPBPBytecode(limit) {
    var t = this;
    var rtn = [];
    var pls = t.pbp.plays;
    for (var x = 0; x < pls.length; x++) {
      rtn[x] = pls[x].toByteArray();
    }
    return rtn;
  }

  /**
   * Parse an array of bytecode (Synchronizr.STATIC for events)
   * and apply the result to this model. Data contains team names, game
   * description (tournaments etc.) and rosters.
   * @param {Array} arrs Bytecode as Synchronizr.STATIC
   */
  parseEventBytecode(arrs) {
    var t = this;
    // Parse the bytecode
    var ptr = [0];
    t.type = Synchronizr.byteArrToStr(arrs[0]);
    var hTown = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[1], ptr));
    var hMascot = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[1], ptr));
    var hAbbr = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[1], ptr));
    var hImg = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[1], ptr));
    ptr[0] = 0;
    var gTown = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[2], ptr));
    var gMascot = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[2], ptr));
    var gAbbr = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[2], ptr));
    var gImg = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[2], ptr));

    t.location = Synchronizr.byteArrToStr(arrs[3]);
    t.desc = Synchronizr.byteArrToStr(arrs[4]);
    t.startTime = Synchronizr.byteArrToStr(arrs[5]);
    t.gender = Synchronizr.byteArrToStr(arrs[6]);

    ptr[0] = 0;
    var hPlyrs = [], gPlyrs = [];
    while (true) {
      var s = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[8], ptr));
      if (s) hPlyrs.push(s); else break;
    }
    ptr[0] = 0;
    while (true) {
      var s = Synchronizr.byteArrToStr(Synchronizr.parseField(arrs[9], ptr));
      if (s) gPlyrs.push(s); else break;
    }
    // Apply the results

    t.team.town = hTown;
    t.team.name = hMascot;
    t.team.abbr = hAbbr;
    t.team.image = hImg;
    t.opp.town = gTown;
    t.opp.name = gMascot;
    t.opp.abbr = gAbbr;
    t.opp.image = gImg;

    t.team.setPlayers(hPlyrs);
    t.opp.setPlayers(gPlyrs);

    // console.log(type, { hTown, hMascot, hAbbr }, { gTown, gMascot, gAbbr }, location, desc, startTime, gender, hPlyrs, gPlyrs);
    // debugger;
  }

  genEventBytecode() {
    var t = this;
    var rtn = [];
    rtn[0] = Synchronizr.strToByteArr(t.type);
    rtn[1] = t.genEventBytecode0(t.team);
    rtn[2] = t.genEventBytecode0(t.opp);
    rtn[3] = Synchronizr.strToByteArr(t.location);
    rtn[4] = Synchronizr.strToByteArr(t.desc);
    rtn[5] = Synchronizr.strToByteArr(t.startTime);
    rtn[6] = Synchronizr.strToByteArr(t.gender);
    rtn[8] = t.genRosterBytecode0(t.team);
    rtn[9] = t.genRosterBytecode0(t.opp);
    return rtn;
  }
  genRosterBytecode0(team) {
    var len = 0;
    for (var x in team.players) {
      var ply = team.players[x];
      var sta = team.starters.includes(ply.id);
      len += ("" + ply.id).length;
      len += ply.name.length + 1 + 2 + (sta ? 1 : 0);
    }
    var rtn = new Uint8Array(len);
    var ptr = 0;
    for (var x in team.players) {
      var ply = team.players[x];
      var sta = team.starters.includes(ply.id);
      var itm = Synchronizr.strToByteArr((sta ? "S" : "") + ply.id + " " + ply.name);
      rtn[ptr++] = itm.length >> 8;
      rtn[ptr++] = itm.length & 0xFF;
      Synchronizr.memcpy(rtn, itm, ptr, itm.length);
      ptr += itm.length;
    }
    return rtn;
  }
  genEventBytecode0(team) {
    var town = Synchronizr.strToByteArr(team.town);
    var name = Synchronizr.strToByteArr(team.name);
    var abbr = Synchronizr.strToByteArr(team.abbr);
    var img = Synchronizr.strToByteArr(team.image);
    return Synchronizr.joinArrs([town, name, abbr, img]);
  }

  /* Stuff for Synchronizr compatibliity */
  getStaticData() {
    this.synSInvalid = false;
    return this.genEventBytecode();
  }
  getDynamicData() {
    this.synDInvalid = false;
    return [];
  }
  getEventData() {
    var e = this.synEInvalid;
    this.synEInvalid = false;
    return this.genPBPBytecode(e);
  }
  isStaticInvalid() {
    return this.synSInvalid;
  }
  isDynamicInvalid() {
    return this.synDInvalid;
  }
  isEventInvalid() {
    return this.synEInvalid;
  }
  invalidateStatic() {
    this.synSInvalid = true;
  }
  invalidateDynamic() {
    this.synDInvalid = true;
  }
  invalidateEvent(e) {
    var t = this;
    if (e === true)
      t.synSInvalid = e;
    else if (t.synSInvalid !== true) {
      t.synEInvalid |= 0;
      t.synEInvalid += e;
    }
  }
  revalidateStatic() {
    this.synSInvalid = false;
  }
  revalidateDynamic() {
    this.synDInvalid = false;
  }
  revalidateEvent(e) {
    this.synEInvalid = false;
  }
  updateStaticData(d) {
    // Set the rosters, names, etc.
    this.parseEventBytecode(d);
  }
  updateDynamicData(d) {
    // TODO set the clock, etc from d
  }
  updateEventData(d, n) {
    // Set the last n PBPs from the last n of d
    if (!n) n = d.length;
    this.parsePBPBytecode(d, n);
  }
}

class GameClock {
  constructor() {
    this.period = 0;
    this.numPeriods = 0;
  }
}

/**
 * Class to hold a list of plays
 */
class PlayByPlay {
  constructor() {
    this.plays = [];
  }
  addPlay(p) {
    throw "Abstract Method";
  }
  removePlay(x) {
    throw "Abstract Method";
  }
  /**
   * Get plays from this list
   * @param {Integer} length Maximum number of plays to return
   * @param {Object} args Filter that plays must match to be returned
   * @returns an Array where the first item is an array of plays and the second item is an array of indices
   */
  getPlays(length, args) {
    var t = this;
    var rtn = [];
    var idxs = [];
    if (args != null) {
      var keys = Object.keys(args);
      for (var x = t.plays.length - 1; x >= 0; x--) {
        var play = t.plays[x];
        var add = true;
        for (var y = 0; y < keys.length; y++) {
          if (play[keys[y]] !== args[keys[y]]) {
            add = false; break;
          }
        }
        if (add) {
          rtn.push(play);
          idxs.push(x);
        }
        if (length > 0 && rtn.length == length)
          break;
      }
      return [rtn, idxs];
    }
    if (length > 0) {
      for (var x = t.plays.length - 1; x >= 0; x--) {
        rtn.push(t.plays[x]);
        idxs.push(x);
        if (rtn.length == length)
          return [rtn, idxs];
      }
    }
    idxs.length = t.plays.length;
    for (var x = 0; x < idxs.length; x++)
      idxs[x] = x;
    return [t.plays, idxs];
  }
}

class PBPItem {
  /**
  * @param period Period of in the game (Integer)
  * @param millis Milliseconds since start of Period / until end of Period (Integer)
  * @param pid Player jersey # (String), or Period (Integer), when setting time
  * @param team true if Team, false if Opponent, null if neither
  * @param linked true if this was created at the same time as the last one.
  *     Used by Admin for keeping track of undo, not serialized or stored persistently
  */
  constructor(period, millis, pid, team, linked) {
    this.period = period;
    this.millis = millis;
    this.pid = pid;
    this.team = team;
    this.rTeamScore = 0; // Running team and Opponent scores after this play
    this.rOppScore = 0; // These are to be computed by sport-specific Game Models
    this.linked = (linked == true);
  }
  getTime() {
    return {
      minutes: Math.floor(this.millis / 60000),
      seconds: Math.floor((this.millis / 1000) % 60),
      millis: this.millis % 1000
    };
  }
  getTimeStr() {
    var t = this.getTime();
    return "" + t.minutes + (t.seconds < 10 ? ":0" + t.seconds : ":" + t.seconds);
  }
}


class Team {
  constructor(info) {
    var t = this;
    t.PLAYER_CLASS = null;
    if (info) {
      t.town = info.town; // Ex. "Froid-Lake"
      t.name = info.name; // Ex. "Redhawks"
      t.abbr = info.abbr; // Ex. "FML";
      t.image = info.image; // "Ex resources/mascots/froidmedicinelake.png"
    } else {
      t.town = "--";
      t.name = "--";
      t.abbr = "--";
      t.image = "";
    }
    t.players = []; // Associative array by player #
    t.starters = []; // Array of player #s (ids) who are starters
    t.lastPlayTime = {};
    t.lastPlayTime.pd = 0;
    t.lastPlayTime.ms = 0;
  }
  addPlayer(p) {
    this.players[p.id] = p;
  }
  removePlayer(p) {
    this.players[p.id] = null;
  }
  /**
   * Set this team's roster and starters
   * @param {Array} rostArr Array of Strings in format [S=Starter]<ID> <First>[ <Middle>[ <Last>]]
   */
  setPlayers(rostArr) {
    this.players.length = 0;
    this.starters.length = 0;
    for (var x = 0; x < rostArr.length; x++) {
      var p = rostArr[x];
      var i = p.indexOf(" ");
      var pid = p.substring(0, i);
      var n = p.substring(i + 1);
      var ply = new this.PLAYER_CLASS();
      var st = false;
      if (pid[0] == 'S') { st = true; pid = pid.substring(1); }
      ply.id = pid;
      ply.name = n;
      ply.onCourt = true;
      if (st)
        this.starters.push(pid);
      this.addPlayer(ply);
    }
  }
  copyRoster(srcTeam) {
    assert(false, "Abstract Method");
  }
  /**
   * Reset the state of this team to the beginning of the game
   */
  reset() {
    for (var p in this.players) {
      this.players[p].reset();
      this.players[p].onCourt = this.starters.includes(this.players[p].id);
    }
  }
  /**
   * Return how many of a stat the team has
   * @param {String} name name of stat to get
   */
  getStat(name) {
    var rtn = 0;
    for (var x in this.players) {
      rtn += this.players[x][name];
    }
    return rtn;
  }
  // DEPRECATED. Byte array conversion is now performed on the GameModel instead
  // // Format: town name abbr image players[name BYTE(starting number)]
  // toByteArray() {
  //   var t = this;
  //   var len = t.town.length + t.name.length + t.abbr.length + t.image.length + 8;
  //   var p = t.players;
  //   for (var x in p)
  //     len += (2 + p[x].name.length + 1);
  //   var ptr = 0;
  //   var rtn = new Uint8Array(len);
  //   ptr = PUTSTR(rtn, t.town, ptr);
  //   ptr = PUTSTR(rtn, t.name, ptr);
  //   ptr = PUTSTR(rtn, t.abbr, ptr);
  //   ptr = PUTSTR(rtn, t.image, ptr);
  //   for (var x in p) {
  //     ptr = PUTSTR(rtn, p[x].name, ptr);
  //     var isStart = t.starters.includes(p[x].id);
  //     var ifo = (p[x].id == "00" ? 127 : parseInt(p[x].id)) + (isStart ? 128 : 0);
  //     rtn[ptr++] = ifo;
  //   }
  //   return rtn;
  // }
  // fromByteArray(arr) {
  //   var ptr = 0, t = this, p = t.players;
  //   t.town = GETSTR(arr, ptr);
  //   ptr += (2 + t.town.length);
  //   t.name = GETSTR(arr, ptr);
  //   ptr += (2 + t.name.length);
  //   t.abbr = GETSTR(arr, ptr);
  //   ptr += (2 + t.abbr.length);
  //   t.image = GETSTR(arr, ptr);
  //   ptr += (2 + t.image.length);

  //   var pids = [];
  //   t.starters = [];
  //   while (ptr < arr.length) {
  //     var name = GETSTR(arr, ptr);
  //     if (name.length == 0)
  //       debugger;
  //     ptr += (2 + name.length);
  //     var b3 = arr[ptr++];
  //     var pid = b3 & 127;
  //     pid = pid == 127 ? "00" : "" + pid;
  //     var start = (b3 & 128) > 0 ? true : false;
  //     pids[pid] = true;
  //     var ply = t.players[pid];
  //     if (ply == null) {
  //       ply = new t.PLAYER_CLASS();
  //       t.players[pid] = ply;
  //     }
  //     ply.name = name;
  //     ply.id = pid;
  //     if (start)
  //       t.starters.push(pid);
  //   }
  // }
}


class Player {
  constructor(number, name) {
    var t = this;
    t.id = number; // Per-team Player ID. (Jersey #);
    if (name == null) t.name = "[Player]"
    else t.name = name;
    // Milliseconds of playing time
    t.playMs = 0;
    // Is the player currently playing
    t.onCourt = true;
  }

  // When extending make sure to call super.reset();
  reset() {
    this.playMs = 0;
  }

  /**
   * Return how long this player has been on the court, 
   * EXCLUDING the time that has elapsed from the most recent
   * play
   */
  getPlayTime() {
    return {
      minutes: Math.floor(this.playMs / 60000),
      seconds: Math.floor((this.playMs / 1000) % 60),
      millis: this.playMs % 1000
    };
  }
  getPlayTimeStr() {
    var t = this.getPlayTime();
    return "" + t.minutes + (t.seconds < 10 ? ":0" + t.seconds : ":" + t.seconds);
  }
}
