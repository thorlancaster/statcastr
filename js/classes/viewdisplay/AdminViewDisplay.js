
class AdminViewDisplay extends ViewDisplay {
	constructor(model, synchronizrPtr, scoreboardUpdateCb) {
		super();
		var t = this;
		t.model = model;
		t.selTeam = null;
		t.entryBusy = false;
		t.setStyle("margin-top", "1px");
		t.addClass("adminViewDisplay");
		t.setStyle("flexDirection", "column");
		t.wdg = new AdminWidget(model, synchronizrPtr, scoreboardUpdateCb);
		t.appendChild(t.wdg);
	}

	// resize() {
	// 	super.resize();
	// }

	// update() {
	// 	super.update();
	// }

	onKey(char, down) {
		this.wdg.onKey(char, down);
	}

	onGesture(obj) {
		this.wdg.onGesture(obj);
	}
}

class AdminWidget extends UIPanel {
	constructor(model, synchronizrPtr, scoreboardUpdateCb) {
		super();
		var t = this;
		t.SPACER_SZ = "0.3em";
		t.VIBE_SUCCESS = [400];
		t.VIBE_FAILURE = [150, 100, 150, 100, 150];
		t.VIBE_CANCEL = [70, 60, 70];
		t.model = model;
		t.synchronizrPtr = synchronizrPtr;
		t.scoreboardUpdateCb = scoreboardUpdateCb;
		t.addClass("adminWidget");
		t.setStyle("flexDirection", "column");
		t.setStyle("fontSize", "1.3em");
		t.element.style.setProperty("--btnh", "3em");
		// PDT - PBP display table for viewing recent plays
		t.pdt = new PBPDisplayTable(4);
		t.pdt.table.enableClickListener(t.onPDTClick.bind(t));
		t.pdt.setStyle("fontSize", "0.769em");
		t.pdt.setStyle("lineHeight", "1.5em");
		t.pdt.label.hide();
		t.pdt.table.clearHighlightsOnUpdate = true;
		t.appendChild(t.pdt);
		// Top panel - contains miscellaneous buttons
		t.topPanel = new UIPanel();
		t.appendChild(t.topPanel);
		t.topPanel.setStyle("transition", "background 0.15s");;
		t.gameRosBtn = new ButtonField("Rosters");
		t.gameRosBtn.addClickListener(t.onGameRosBtn.bind(t));
		t.topPanel.appendChild(t.gameRosBtn);
		t.switchTeamBtn = new ButtonField("<-Switch->");
		t.switchTeamBtn.addClickListener(t.onSwitchTeam.bind(t));
		t.topPanel.appendChild(t.switchTeamBtn);
		t.topPanel.appendChild(new UIPanel().setStyle("width", t.SPACER_SZ)
			.setStyle("background", "var(--main-bg2").setElasticity(0));
		t.connStatus = new ProgressBarField("Conn Status");
		t.connStatus.setColors("#555", "var(--main-bg2)");
		t.connStatus.setProgress(75);
		t.topPanel.appendChild(t.connStatus);
		// Spacer1
		t.spacer1 = new UIPanel().setStyle("background", "var(--main-bg2)")
			.setStyle("height", t.SPACER_SZ).setElasticity(0);
		t.appendChild(t.spacer1);
		t.actionBtns = []; // Array with all the action buttons in it
		var ab = t.actionBtns;
		ab.push(t.gameRosBtn, t.switchTeamBtn);

		// Player selection buttons. Kept out of the way of drunken fingers
		t.playerSelLbNum = new UIPanel().setStyle("flexDirection", "row").setStyle("fontSize", "1.2em");
		// Two TextFields for current play and #
		t.playReplacementLbl = new TextField("").setStyle("fontSize", "1.2em");
		// TextField to describe play that's going to be replaced
		t.playerSelLbl = new TextField("").setStyle("width", "100%");
		t.playerSelNum = new TextField("").setStyle("marginRight", "0.5em");
		t.playerSel = new PlayerSelectionWidget(5, 5, "var(--btnh)");
		t.playerSel.onSelection = t.onPSWSelect.bind(t);
		t.playerSelLbNum.appendChild(t.playerSelLbl);
		t.playerSelLbNum.appendChild(t.playerSelNum);
		t.appendChild(t.playReplacementLbl);
		t.appendChild(t.playerSelLbNum);
		t.appendChild(t.playerSel);

		// Play Selection Panel - Select play or Foul
		t.playSel = new UIPanel();
		t.p1Btn = t.createBtn(1); t.playSel.appendChild(t.p1Btn);
		t.p2Btn = t.createBtn(2); t.playSel.appendChild(t.p2Btn);
		t.p3Btn = t.createBtn(3); t.playSel.appendChild(t.p3Btn);
		t.pfBtn = t.createBtn('F'); t.playSel.appendChild(t.pfBtn);
		t.ckBtn = t.createBtn('CLOCK').setFontSize("0.8em");
		ab.push(t.p1Btn, t.p2Btn, t.p3Btn, t.pfBtn);
		t.playSel.appendChild(t.ckBtn);
		t.appendChild(t.playSel);
		// Action Selection Panel - Select Other action
		t.actSel = new UIPanel();
		t.rbBtn = t.createBtn('RB'); t.actSel.appendChild(t.rbBtn);
		t.stlBtn = t.createBtn('ST'); t.actSel.appendChild(t.stlBtn);
		t.toBtn = t.createBtn('TO<u>V</u>', true); t.actSel.appendChild(t.toBtn);
		t.chBtn = t.createBtn('C<u>H</u>ARGE', true).setFontSize("0.8em");
		t.actSel.appendChild(t.chBtn);
		t.subBtn = t.createBtn('SU<u>B</u>', true); t.actSel.appendChild(t.subBtn);
		ab.push(t.rbBtn, t.stlBtn, t.toBtn, t.chBtn, t.subBtn);
		t.appendChild(t.actSel);

		t.p1Btn.addClickListener(function () { t.onPlayX(1); });
		t.p2Btn.addClickListener(function () { t.onPlayX(2); });
		t.p3Btn.addClickListener(function () { t.onPlayX(3); });
		t.pfBtn.addClickListener(function () { t.onPlayX('foul'); });
		t.ckBtn.addClickListener(t.onClockX.bind(t));
		// TODO long press to set clock, drag to change clock

		t.rbBtn.addClickListener(function () { t.onPlayX('rebound'); });
		t.stlBtn.addClickListener(function () { t.onPlayX('steal'); });
		t.toBtn.addClickListener(function () { t.onPlayX('turnover'); });
		t.chBtn.addClickListener(function () { t.onPlayX('charge'); });
		t.subBtn.addClickListener(t.onSubX.bind(t));

		t.setEntryBusy(false);
		// setTimeout(function () {
		// 	t.onGameRosBtn(); // TODO XXX debug
		// }, 500);
	}

	getSynchronizr() { return this.synchronizrPtr[0] }

	update() {
		super.update();
		var t = this;
		t.pdt.setStateFromModel(t.model);
	}

	vibrate(pattern) {
		window.navigator.vibrate(pattern);
	}

	setEntryBusy(b) {
		var t = this;
		t.entryBusy = b;
		for (var x = 0; x < t.actionBtns.length; x++)
			t.actionBtns[x].setEnabled(!b);
		if (b) {
			t.entryNum1 = null;
			t.entryNum2 = null;
		}
	}

	updateSelTeam() {
		var t = this;
		var bgc = null;
		if (t.selTeam == true) {
			bgc = "var(--team-color1)";
		} else if (t.selTeam == false) {
			bgc = "var(--opp-color1)";
		}
		t.topPanel.setStyle("background", bgc);
	}

	onGesture(obj) {
		var t = this;
		if (obj.direction == "") {
			if ((obj.touches == 1 && obj.taps == 0) || (obj.touches == 2 && obj.taps != 0)) {
				// Tap number entry
				if (obj.taps <= 5) {
					console.log("NBR " + obj.taps);
					t.onNumberX(obj.taps);
				}
			}
			else { // Multi-fingered number entry for numbers >= 2
				if (obj.touches <= 5) {
					console.log("NBR " + obj.touches);
					t.onNumberX(obj.touches);
				}
			}
		} else {
			if (!t.entryBusy) { // Not busy entering, swipes act as taps on buttons
				if (obj.direction.includes("up")) { // 1, 2, 3, F
					switch (obj.touches) {
						case 1: t.p1Btn.click(); break;
						case 2: t.p2Btn.click(); break;
						case 3: t.p3Btn.click(); break;
						case 4: t.pfBtn.click(); break;
					}
				}
				else if (obj.direction.includes("down")) { // RB, ST, TO, CHARGE
					switch (obj.touches) {
						case 1: t.rbBtn.click(); break;
						case 2: t.stlBtn.click(); break;
						case 3: t.toBtn.click(); break;
						case 4: t.chBtn.click(); break;
					}
				} else if (obj.direction.includes("left")) {
					t.onSelTeam(false);
				}
				else if (obj.direction.includes("right")) {
					t.onSelTeam(true);
				}
			} else { // If busy entering, swipes act as cancel/commit
				if (obj.touches == 1) { // Messy multi-finger taps can be mistakenly counted as swipes
					if (obj.direction.includes("down")) {
						t.onExpandAction();
					}
					else if (obj.direction.includes("left")) {// Cancel action
						t.onBackAction();
					} else if (obj.direction.includes("right")) { // Commit action
						t.onCommitNewPlay();
					}
				}
			}
		}
	}
	onKey(char, down) {
		var t = this;
		if (down) {
			// console.log(char);
			if (t.entryBusy) {
				switch (char) {
					case '0': case '1': case '2': case '3': case '4': case '5':
						t.onNumberX(parseInt(char)); break;
					case 'tab':
						t.onExpandAction(); break;
					case "enter":
						t.onCommitNewPlay(); break;
					case "escape":
						t.onBackAction(); break;
				}
			} else {
				switch (char) {
					case 't': case 'o':
						t.onSelTeam(char == 't'); break;

					case '1': t.p1Btn.click(); break;
					case '2': t.p2Btn.click(); break;
					case '3': t.p3Btn.click(); break;
					case 'f': t.pfBtn.click(); break;
					case 'c': t.ckBtn.click(); break;

					case 'r': t.rbBtn.click(); break;
					case 's': t.stlBtn.click(); break;
					case 'v': t.toBtn.click(); break;
					case 'h': t.chBtn.click(); break;
					case 'b': t.subBtn.click(); break;
				}
			}
		}
	}

	onPDTClick(rowNum) { // Called when a play in the PBP Display Table is clicked
		var t = this;
		var tbl = t.pdt.table;
		var oh = tbl.getHighlight(rowNum);
		tbl.clearHighlights();
		tbl.setHighlight(rowNum, !oh);
		t.playReplacementLbl.setText("");
		t.playToReplace = null;
		if (!oh) { // If the old play wasn't already highlighted
			var r = t.model.pbp.plays[tbl.getRow(rowNum).dataset.playIdx];
			t.playToReplace = r;
			var ifo = t.model.getPBPInfo(r);
			var team = r.team == null ? null : (r.team == true ? t.model.team : t.model.opp);
			var abbr = team ? team.abbr : "";
			t.playReplacementLbl.setText("Replacing @[" + ifo.time + "]");
		}
		new Toast("PDT clicked " + rowNum);
	}

	onGameRosBtn() {
		// TODO the underlying entry shouldn't be being manipulated when a dialog is present
		var t = this;
		var dlg = new Dialog("Edit Rosters");
		var txt1 = new TextField("Team Rosters");
		var txt2 = new TextField("Opponent Rosters");
		var tbl1 = new EditableTableField(["#", "[*] Name"], [4, null]);
		var tbl2 = new EditableTableField(["#", "[*] Name"], [4, null]);
		var submit = new ButtonField("Submit");
		submit.addClickListener(function () {
			var valid = (tbl1.isAllValid() && tbl2.isAllValid());
			if (!valid) {
				new Toast("Some entries are invalid");
				return;
			}
			var chk1 = t.rosSvFn(tbl1, null, t.model.pbp, true);
			var chk2 = t.rosSvFn(tbl2, null, t.model.pbp, false);
			if (chk1 || chk2) {
				if (chk1)
					new Toast(chk1);
				else
					new Toast(chk2);
				return;
			}
			console.log(tbl1.getCell(1, 0));
			t.rosSvFn(tbl1, t.model.team);
			t.rosSvFn(tbl2, t.model.opp);
			var s = t.getSynchronizr();
			t.model.reloadRosters(); // Reload everything
			t.model.reloadFromPBP();
			t.scoreboardUpdateCb(); // Update the scoreboard
			t.model.invalidateStatic();
			// debugger;
			s.updateFromModel(t.model); // Have synchronizr update its local state
			s.pushToTarget(); // Send it down the wire
			t.vibrate(t.VIBE_SUCCESS);
			dlg.remove();
			new Toast("Submitted rosters");
		});
		dlg.body.appendChild(txt1);
		dlg.body.appendChild(tbl1);
		dlg.body.appendChild(new UIPanel().setStyle("height", "1em"));
		dlg.body.appendChild(txt2);
		dlg.body.appendChild(tbl2);
		dlg.body.appendChild(submit);
		tbl1.setValidator(t.rosValFn);
		tbl2.setValidator(t.rosValFn);
		t.rosLdFn(tbl1, t.model.team);
		t.rosLdFn(tbl2, t.model.opp);
		dlg.show();
	}
	/**
	 * Roster save function. Checks table or saves table to team.
	 * If check fails, returns a String. Otherwise, returns false.
	 * @param {TableField} tbl 
	 * @param {Object} team 
	 * @param {Object} pbp
	 * @param {Boolean} isTeam Which team is being validated, used for PBP foreign key validation
	 */
	rosSvFn(tbl, team, pbp, isTeam) {
		var t = this;
		var len = tbl.getLength();
		var arr = [];
		var ids = [];
		var numSta = 0;
		var badNum = false;
		for (var x = 0; x < len; x++) {
			if (tbl.isRowBlank(tbl.getRow(x)))
				continue;
			var nbr = tbl.getCell(0, x);
			var iNbr = parseInt(nbr);
			if (nbr.length == 0 || nbr.length > 2 || iNbr > 55 || iNbr % 10 > 5)
				badNum = true;
			var nam = tbl.getCell(1, x);
			var sta = false;
			if (nam.startsWith("*")) {
				nam = nam.substring(1);
				sta = true;
				numSta++;
			}
			arr.push({ nbr, nam, sta });
			if (ids.includes(nbr))
				return "Duplicate player #" + nbr;
			ids.push(nbr);
		}
		if (badNum)
			return "Player numbers must be 0-55";
		if (numSta != 5)
			return "5 starters per team required";
		if(pbp){
			for(var x = 0; x < pbp.plays.length; x++){
				var p = pbp.plays[x];
				if(isTeam != null && p.team == isTeam && !ids.includes(p.pid)){
					return "Cannot remove player #" + p.pid + " that has plays";
				}
			}
		}
		if (team) {
			var pls = team.players;
			var sts = team.starters;
			pls.length = 0;
			sts.length = 0;
			for (var x = 0; x < arr.length; x++) {
				pls[arr[x].nbr] = new team.PLAYER_CLASS(arr[x].nbr, arr[x].nam);
				sts.push(arr[x].nbr);
			}
		}
		return false;
	}
	rosLdFn(tbl, team) { // Roster load function. Loads rosters into table
		var t = this;
		var pls = team.players;
		var ptr = 0;
		for (var x in pls) {
			var ply = pls[x];
			var sta = team.starters.includes(ply.id);
			tbl.setCell(0, ptr, ply.id);
			tbl.setCell(1, ptr, sta ? "*" + ply.name : ply.name);
			ptr++;
		}
		tbl.setCell(0, ptr, "");
		tbl.validateAll();
	}
	rosValFn(x, y, txt) { // Roster validation function. See EditableTableField in TableField.js
		if (x == 0) { // Player #
			var t = txt.replace(/\D/g, '');
			if (t.length > 2) {
				return t.substring(t.length - 2);
			}
			return txt.length > 0 ? t : false;
		} else if (x == 1) { // Player name
			return txt.length > 0;
		}
	}

	onCommitNewPlay() {
		// Commit new current play to game state.
		// This will also result in the play getting sent down the pipe.
		var t = this;
		if (!t.selPlayers || t.selPlayers.length == 0) {
			new Toast("No Players Selected");
			t.vibrate(t.VIBE_FAILURE);
			return;
		}
		else if (t.selPlayers.length > 1) {
			new Toast("Multiple Players Selected");
			t.vibrate(t.VIBE_FAILURE);
			return;
		}
		var s = t.getSynchronizr();
		t.model.pbp.addPlay(new BasketballPBPItem(t.entryPd, t.entryMs, t.selPlayers[0], t.selTeam, t.lastPlaySelection));
		t.model.updateFromPBP(); // Update last play in PBP to model
		t.scoreboardUpdateCb(); // Update the scoreboard
		t.model.invalidateEvent(1); // Mark 1 event invalidated for Synchronizr
		s.updateFromModel(t.model); // Have synchronizr update its local state
		s.pushToTarget(); // Send it down the wire
		new Toast("Action Submitted: " + BasketballPlayType.toLongStr(t.lastPlaySelection) + " " + t.selPlayers[0]);
		t.vibrate(t.VIBE_SUCCESS);
		t.clearAction();
	}
	onExpandAction() {
		// TODO Expand options for this action, e.g. allow bench players to be chosen for stats.
		// Actions using expand() may produce multiple PBP plays and should set linked=true on second play
	}
	onBackAction() {
		this.clearAction();
		t.vibrate(t.VIBE_CANCEL);
	}
	clearAction() {
		var t = this;
		t.setEntryBusy(false);
		t.selPlayers = null;
		t.setPlayerEntry(null);
		t.playerSelLbl.setText("");
		t.playerSelNum.setText("");
		t.playReplacementLbl.setText("");
		t.playToReplace = null;
	}
	onPSWSelect(num2, num1) {
		// Called when a player selection button is pressed
		this.onNumberX(num2);
		this.onNumberX(num1);
	}
	onNumberX(num) {
		// Called when a number gesture happens
		var t = this;
		if (!t.entryBusy)
			return;
		t.entryNum2 = t.entryNum1;
		t.entryNum1 = num;
		t.playerSelNum.setText((t.entryNum2 == null ? "_" : t.entryNum2) + "" + t.entryNum1);
		t.selPlayers = t.playerSel.setFilter(t.entryNum2, t.entryNum1);
	}
	onPlayX(sc) {
		// Called when a play selection button is pressed
		var t = this;
		if (t.selTeam == null) {
			t.vibrate(t.VIBE_FAILURE);
			return;
		}
		var tdesc = t.selTeam ? t.model.team.abbr : t.model.opp.abbr;
		var desc = "?";
		var lps = null;

		var made = true; // TODO XXX FIXME support makes and misses
		var bpt = BasketballPlayType;
		switch (sc) {
			case 1: desc = "1 point"; lps = made ? bpt.FT_MADE : bpt.FT_MISS; break;
			case 2: desc = "2 points"; lps = made ? bpt.P2_MADE : bpt.P2_MISS; break;
			case 3: desc = "3 points"; lps = made ? bpt.P3_MADE : bpt.P3_MISS; break;
			case "foul": desc = "Foul"; lps = bpt.FOUL_P; break;
			case "rebound": desc = "rebound"; lps = bpt.REB_UNK; break;
			case "steal": desc = "steal"; lps = bpt.STEAL; break;
			case "turnover": desc = "turnover"; lps = bpt.TURNOVER; break;
			case "charge": desc = "charge"; lps = bpt.CHARGE_TAKEN; break;
			default: console.warn("Invalid play type for onPlayX: " + sc);
				return;
		}
		var plyrs = t.selTeam ? t.model.team.players : t.model.opp.players;
		var color = t.selTeam ? "var(--team-color1)" : "var(--opp-color1)";
		t.setPlayerEntry(plyrs, color, false);
		t.playerSelLbl.setHtml('[' + tdesc + ' ' + desc + "]&emsp;Enter Player #");
		t.playerSelNum.setText("__");
		t.lastPlaySelection = lps;
		t.entryPd = 1; // TODO XXX FIXME implement these
		t.entryMs = 100000;
		t.setEntryBusy(true);
	}

	setPlayerEntry(plyrs, c, b) {
		// Set the player entry fields with {players, color, includeBench}
		this.playerSel.setPlayers(plyrs, c, b);
	}
	onSubX() {
		// Called when the player substitution button is pressed
		console.log("Sub");
	}
	onClockX() {
		// Called when the clock toggle button is pressed
		// Starts/Stops the clock
		var t = this;
		t.clockRunning = !t.clockRunning;
		t.updateCkBtnSelState();
	}
	updateCkBtnSelState() {
		this.ckBtn.setSelected(this.clockRunning);
	}
	createBtn(txt, useHTML) {
		return new ButtonField(txt, true, useHTML)
			.setStyle("height", "var(--btnh)").setStyle("width", "3em");
	}
	onSwitchTeam() {
		this.onSelTeam(!this.selTeam);
	}
	onSelTeam(tm) {
		var t = this;
		t.selTeam = tm;
		t.updateSelTeam();
	}
}

class PlayerSelectionWidget extends UIPanel {
	constructor(rows, cols, h) {
		super();
		var t = this;
		t.setStyle("flexDirection", "column");
		t.rows = [];
		t.bptr = 0;
		t.width = rows;
		t.height = cols;
		t.onSelection = null;
		for (var x = 0; x < rows; x++) {
			t.rows[x] = t.generateRow(cols, h);
			t.appendChild(t.rows[x]);
		}
		t.setPlayers(null);
	}
	generateRow(cols, h) {
		var t = this;
		var row = new UIPanel();
		for (var x = 0; x < cols; x++) {
			var b = new ButtonField("XX").addClass("fullSize")
				.setStyle("height", h).setStyle("width", "3em");
			b.addClickListener(t.onBtn.bind(t));
			row.appendChild(b);
		}
		return row;
	}

	onBtn(btn) {
		var t = btn.getText();
		if (t.length == 0) return;
		var num1 = parseInt(t.charAt(t.length - 1));
		var num2 = t.length == 2 ? parseInt(t.charAt(t.length - 2)) : null;
		// this.setFilter(num2, num1);
		if (this.onSelection)
			this.onSelection(num2, num1);
	}

	setFilter(num2, num1) {
		var t = this;
		var rtn = [];
		for (var x = 0; x < t.bptr; x++) {
			var btn = t.rows[Math.floor(x / 5)].children[x % 5];
			var txt = btn.getText();
			if ((!num2 && txt.startsWith(num1)) || (num2 && txt.endsWith(num1) && txt.startsWith(num2) && txt.length == 2)) {
				btn.setSelected(true);
				rtn.push(txt);
			}
			else {
				btn.setSelected(false);
			}
		}
		return rtn;
	}

	setPlayers(players, color, includeBench) {
		var t = this;
		if (players == null) {
			for (var x = 0; x < t.rows.length; x++)
				t.rows[x].setStyle("display", "none");
			return;
		}
		t.bptr = 0; // Button Pointer
		var rptr = 0; // Row pointer
		var cptr = 0; // Col pointer
		for (var x = 0; x < players.length; x++) {
			var p = players[x];
			if (!p || !(p.onCourt || includeBench)) continue;
			var rptr = Math.floor(t.bptr / 5);
			var cptr = t.bptr % 5;
			var btn = t.rows[rptr].children[cptr];
			if (cptr == 0) // Avoid needless style sets
				t.rows[rptr].setStyle("visibility", null).setStyle("display", null);
			btn.setStyle("visibility", null);
			btn.setSelected(false);
			btn.setBorderColor(color);
			btn.setText(p.id);
			t.bptr++;
		}
		for (var x = cptr + 1; x < t.width; x++) {
			var btn = t.rows[rptr].children[x];
			btn.setStyle("visibility", "hidden");
		}
		for (var x = rptr + 1; x < t.height; x++) {
			t.rows[x].setStyle("display", "none");
		}
	}
}