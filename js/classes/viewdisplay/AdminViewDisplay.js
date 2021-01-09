
class AdminViewDisplay extends ViewDisplay {
	constructor(model, bus) {
		super();
		var t = this;
		t.model = model;
		t.selTeam = null;
		t.entryBusy = false;
		t.setStyle("margin-top", "1px");
		t.addClass("adminViewDisplay");
		t.setStyle("flexDirection", "column");
		t.wdg = new AdminWidget(model, bus);
		t.appendChild(t.wdg);
	}

	// resize() {
	// 	super.resize();
	// }

	// update() {
	// 	super.update();
	// 	this.wdg.updateCkBtnSelState();
	// }

	onKey(char, down) {
		this.wdg.onKey(char, down);
	}

	onGesture(obj) {
		this.wdg.onGesture(obj);
	}
}

class AdminWidget extends UIPanel {
	constructor(model, bus) {
		super();
		var t = this;
		t.SPACER_SZ = "0.3em";
		t.VIBE_SUCCESS = [400];
		t.VIBE_BTN_HOLD = [60];
		t.VIBE_FAILURE = [150, 100, 150, 100, 150];
		t.VIBE_CANCEL = [70, 60, 70];
		t.VIBE_CLOCK_START = [30, 100, 30, 70, 30, 65, 30, 45, 30, 30, 20, 20, 10, 10];
		t.VIBE_CLOCK_STOP = [10, 10, 20, 20, 30, 30, 30, 45, 30, 60, 30, 80, 30, 120, 20];
		t.model = model;
		t.bus = bus;
		t.bus.subscribe(t.onBusMessage.bind(t));
		t.addClass("adminWidget");
		t.setStyle("flexDirection", "column");
		t.setStyle("fontSize", "1.3em");
		t.element.style.setProperty("--btnh", "2.2em");
		// PDT - PBP display table for viewing recent plays
		t.pdt = new PBPDisplayTable(3);
		t.pdt.table.enableClickListener(t.onPDTClick.bind(t));
		t.pdt.setStyle("fontSize", "0.769em");
		t.pdt.setStyle("lineHeight", "1.5em");
		t.pdt.filter = {}; // Most recent last
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
		t.gameEditBtn = new ButtonField("Edit");
		t.gameEditBtn.addClickListener(t.onGameEditBtn.bind(t));
		t.topPanel.appendChild(t.gameEditBtn);
		t.switchTeamBtn = new ButtonField("Switch");
		t.switchTeamBtn.addClickListener(t.onSwitchTeam.bind(t));
		t.topPanel.appendChild(t.switchTeamBtn);
		t.topPanel.appendChild(new UIPanel().setStyle("width", t.SPACER_SZ)
			.setStyle("background", "var(--main-bg2").setElasticity(0));
		t.connStatus = new ProgressBarField("Conn Status");
		t.connStatus.addClickListener(t.onConnClick.bind(t));
		t.connStatus.setColors("#555", "var(--main-bg2)");
		t.connStatus.setProgress(75);
		t.connStatus.setStyle("width", "30%");
		t.connStatus.setStyle("flexGrow", "0");
		t.topPanel.appendChild(t.connStatus);
		// Spacer1
		t.spacer1 = new UIPanel().setStyle("background", "var(--main-bg2)")
			.setStyle("height", t.SPACER_SZ).setElasticity(0);
		t.appendChild(t.spacer1);
		t.actionBtns = []; // Array with all the action buttons in it
		var ab = t.actionBtns;
		ab.push(t.gameRosBtn, t.gameEditBtn, t.switchTeamBtn);

		// Player selection buttons. Kept out of the way of drunken fingers
		t.playerSelLbNum = new UIPanel().setStyle("flexDirection", "row").setStyle("fontSize", "1.2em");
		// Two TextFields for current play and #
		t.playReplacementLbl = new TextField("").setStyle("fontSize", "1.2em");
		// TextField to describe play that's going to be replaced
		t.playerSelLbl = new TextField("").setStyle("width", "100%");
		t.playerSelNum = new TextField("").setStyle("marginRight", "0.5em");
		t.playerSel = new PlayerSelectionWidget(5, 5, "var(--btnh)");
		t.playerSel.setOnSelection(t.onPSWSelect.bind(t));
		t.playerSel.setOnSelectionMulti(t.onPSWSelectMulti.bind(t));
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
		t.subBtn = t.createBtn('SU<u>B</u>', true);
		t.playSel.appendChild(t.subBtn);
		t.appendChild(t.playSel);
		// Action Selection Panel - Select Other action
		t.actSel = new UIPanel();
		t.rbBtn = t.createBtn('RB'); t.actSel.appendChild(t.rbBtn);
		t.stlBtn = t.createBtn('ST'); t.actSel.appendChild(t.stlBtn);
		t.toBtn = t.createBtn('TO<u>V</u>', true); t.actSel.appendChild(t.toBtn);
		t.chBtn = t.createBtn('C<u>H</u>ARGE', true).setFontSize("0.8em");
		t.actSel.appendChild(t.chBtn);
		t.ckBtn = t.createBtn('CLOCK').setFontSize("0.8em");
		t.actSel.appendChild(t.ckBtn);
		t.appendChild(t.actSel);
		// Action Selection panel 2 - Select other action or game management
		t.actSel2 = new UIPanel();
		t.delBtn = t.createBtn("DEL"); t.actSel2.appendChild(t.delBtn);
		t.repBtn = t.createBtn("REP"); t.actSel2.appendChild(t.repBtn);
		t.xxBtn2 = t.createBtn("--"); t.actSel2.appendChild(t.xxBtn2);
		t.xxBtn3 = t.createBtn("--"); t.actSel2.appendChild(t.xxBtn3);
		t.xxBtn4 = t.createBtn("LOG OUT").setFontSize("0.8em"); t.actSel2.appendChild(t.xxBtn4);
		t.xxBtn4.addClickListener(function () { new Toast("Hold to log out"); });
		t.xxBtn4.addLongClickListener(function () {
			t.vibrate(t.VIBE_BTN_HOLD);
			t.logout();
		});
		ab.push(t.p1Btn, t.p2Btn, t.p3Btn, t.pfBtn, t.subBtn);
		ab.push(t.rbBtn, t.stlBtn, t.toBtn, t.chBtn, t.ckBtn);
		ab.push(t.delBtn, t.repBtn, t.xxBtn2, t.xxBtn3, t.xxBtn4);

		t.appendChild(t.actSel2);

		t.p1Btn.addClickListener(function () { t.onPlayX(1); });
		t.p2Btn.addClickListener(function () { t.onPlayX(2); });
		t.p3Btn.addClickListener(function () { t.onPlayX(3); });
		t.pfBtn.addClickListener(function () { t.onPlayX('foul'); });
		t.ckBtn.addClickListener(t.onClockX.bind(t));
		t.ckBtn.addLongClickListener(function () {
			t.onClockXLong();
			t.vibrate(t.VIBE_BTN_HOLD);
		});
		t.ckBtn.setAdjustDivider(2);
		t.ckBtn.addAdjustListener(t.onClockNudgeX.bind(t));

		t.rbBtn.addClickListener(function () { t.onPlayX('rebound'); });
		t.stlBtn.addClickListener(function () { t.onPlayX('steal'); });
		t.toBtn.addClickListener(function () { t.onPlayX('turnover'); });
		t.chBtn.addClickListener(function () { t.onPlayX('charge'); });
		t.subBtn.addClickListener(t.onSubX.bind(t));

		t.delBtn.addClickListener(t.onDelX.bind(t));
		t.repBtn.addClickListener(t.onReplaceX.bind(t));

		t.setEntryBusy(false);
	}

	logout() {
		var sc = SC; // TODO better way to get StatCastrApp instance
		var d = new ConfirmationDialog("Log Out", function () {
			sc.logout();
			d.remove();
		});
		d.prependChild(new TextField("Are you sure?"))
		d.show();
	}

	onBusMessage(e){
		var t = this;
		if(t.bus.getState().admin){
			if(e.type == "upd" && e.name == "channel"){ // Connection status messages
				t.updateConnStatus(e.newVal.status, null, 0);
			}
		}
	}

	getSynchronizr() {throw "Deprecated: AdminViewDisplay does not manipulate Synchronizr directly"; return this.synchronizrPtr[0] }

	update() {
		super.update();
		var t = this;
		t.pdt.setStateFromModel(t.model);
		t.updateCkBtnSelState();
	}

	updateConnStatus(readyState, status, bytes) {
		var el = this.connStatus;
		if(status == null)
			status = "Disconnected";
		if (readyState == 0) {
			el.setColors("#932", "var(--main-bg2)");
			el.setProgress(100);
			el.setText(status);
		}
		else if (readyState != 1) {
			el.setColors("#932", "var(--main-bg2)");
			el.setProgress(100);
			el.setText(status);
		}
		else {
			el.setColors("#293", "var(--main-bg2)");
			if (bytes)
				el.setText(bytes + " bytes left");
			else
				el.setText("Connected");
			el.setProgress((500 - bytes) / 5);
		}
	}

	onConnClick(){
		// TODO BUS broadcast "UPD" "synClick" message
		// this.getSynchronizr().onConnClick();
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
		// console.log(obj);
		var d = obj.direction;
		var t = this;
		if (obj.fromEnd) // Swiping from top/bottom is for system UI, not this app
			return;
		if(t.entryBusy && obj.touches == 4 &&  (d.includes("up") || d.includes("down"))) t.onNumberX(5); // 4 dragged = 5
		else if(t.entryBusy && obj.touches == 1 && d.includes("wiggle")) t.onNumberX(0); // 1 wiggled = 0
		else if (d == "") {
			if (t.entryBusy) {
				if ((obj.touches == 2 && obj.taps != 0)) {
					// Tap number entry
					if (obj.taps <= 5) {
						// console.log("NBR " + obj.taps);
						t.onNumberX(obj.taps);
					}
				}
				else { // Multi-fingered number entry for numbers >= 2
					if (obj.touches <= 5) {
						// console.log("NBR " + obj.touches);
						t.onNumberX(obj.touches);
					}
				}
			} else {
				if (obj.touches == 2 && obj.taps == 0)
					t.onClockX(); // Two finger tap when idle toggles clock
			}
		} else {
			if (!t.entryBusy) { // Not busy entering, swipes act as taps on buttons
				if (d.includes("up")) { // 1, 2, 3, F
					switch (obj.touches) {
						case 1: t.p1Btn.click(); break;
						case 2: t.p2Btn.click(); break;
						case 3: t.p3Btn.click(); break;
						case 4: t.pfBtn.click(); break;
					}
				}
				else if (d.includes("down")) { // RB, ST, TO, CHARGE
					switch (obj.touches) {
						case 1: t.rbBtn.click(); break;
						case 2: t.stlBtn.click(); break;
						case 3: t.toBtn.click(); break;
						case 4: t.chBtn.click(); break;
					}
				} else if (d.includes("left")) {
					t.onSelTeam(false);
				}
				else if (d.includes("right")) {
					t.onSelTeam(true);
				}
			} else { // If busy entering, swipes act as cancel/commit
				if (obj.touches == 1) { // Messy multi-finger taps can be mistakenly counted as swipes
					if (d.includes("down")) {
						t.onExpandAction();
					}
					else if (d.includes("up")) {
						t.onToggleMade();
					}
					else if (d.includes("left")) {// Cancel action
						t.onBackAction();
					} else if (d.includes("right")) { // Commit action
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
					case "m":
						t.onToggleMade();
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
					case 'C': t.onClockXLong(); break;

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
		return;
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
	}

	onCommitNewPlay() {
		// Commit new current play to game state.
		// This will also result in the play getting sent down the pipe.
		var t = this;
		var lps = t.lastPlaySelection;
		if (lps == "Sub") {
			if (!t.selPlayers || t.selPlayers.length < 5) {
				new Toast("Not Enough Players");
				t.vibrate(t.VIBE_FAILURE);
				return;
			}
			if (t.selPlayers.length > 5) {
				new Toast("Too Many Players");
				t.vibrate(t.VIBE_FAILURE);
				return;
			}
		} else {
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
		}
		var playType = null;
		var bpt = BasketballPlayType;
		var made = this.lastPlayMade;
		switch (lps) {
			case "1": playType = made ? bpt.FT_MADE : bpt.FT_MISS; break;
			case "2": playType = made ? bpt.P2_MADE : bpt.P2_MISS; break;
			case "3": playType = made ? bpt.P3_MADE : bpt.P3_MISS; break;
			case "Foul": playType = made ? bpt.FOUL_P : bpt.FOUL_T; break;
			case "Rebound": playType = bpt.REB_UNK; break;
			case "Steal": playType = bpt.STEAL; break;
			case "Turnover": playType = bpt.TURNOVER; break;
			case "Charge": playType = bpt.CHARGE_TAKEN; break;
			case "Sub":
				break;
			default:
				assert(false, "lastPlaySelection invalid");
		}
		var clk = t.model.clock;
		if (lps == "Sub") {
			// Calculate pOld and pNew, representing the existing and new onCourt player ids
			var onCourt = t.selTeam ? t.model.team.onCourt() : t.model.opp.onCourt();
			var pOld = [];
			for (var c in onCourt) pOld.push(onCourt[c].id);
			var pNew = t.selPlayers;

			// Calculate plays required to make pOld = pNew
			var subOut = []; // Players to sub out
			var subIn = []; // ... in
			for (var x = 0; x < pOld.length; x++)
				if (!pNew.includes(pOld[x]))
					subOut.push(pOld[x]);
			for (var x = 0; x < pNew.length; x++)
				if (!pOld.includes(pNew[x]))
					subIn.push(pNew[x]);

			if (subIn.length != subOut.length) { // I can just see a bug coming. This will prevent it from being a game-ender.
				// TODO remove this jank after a couple of games without problems
				console.error("Number of players to sub in does not match number of players to sub out. " +
					"\nAttempting to fix the issue\n----THIS SHOULD NEVER HAPPEN----");
				new Toast("Internal substitution error, attempting fix");
			}
			var cpd = clk.period;
			var cms = clk.millisLeft;
			// Submit subs and update PBP after all but last play
			var totLen = Math.max(subIn.length, subOut.length);
			for (var x = 0; x < totLen; x++) {
				var numIn = subIn[Math.min(x, subIn.length - 1)];
				var numOut = subOut[Math.min(x, subOut.length - 1)];
				var pItm = new BasketballPBPItem(t.entryPd, t.entryMs, numIn, t.selTeam, bpt.SUB, numOut);
				if (x > 0) pItm.setLinked(true);
				t.model.pbp.addPlay(pItm);
				if (x < totLen - 1)
					t.model.updateFromPBP(); // Update last PBP before adding another
			}
			clk.period = cpd;
			clk.millisLeft = cms;
			new Toast("Subs Submitted");
			t.updateAll(3);
		}
		else {
			var sub = false;
			var plyr = t.selPlayers[0];
			var team = t.selTeam ? t.model.team : t.model.opp;
			if (!team.onCourtIds().includes(plyr)) {
				sub = true;
				var numOut = team.getLeastActive(t.model.pbp.plays, t.selTeam).id;
				var subPlay = new BasketballPBPItem(t.entryPd, t.entryMs, plyr, t.selTeam, bpt.SUB, numOut);
				t.model.pbp.addPlay(subPlay);
				t.model.updateFromPBP();
			}
			var play = new BasketballPBPItem(t.entryPd, t.entryMs, plyr, t.selTeam, playType);
			if (sub)
				play.setLinked(true);
			t.model.pbp.addPlay(play);
			new Toast("Submitted: " + BasketballPlayType.toLongStr(playType) + " " + plyr + (sub ? " [SUB REQUIRED]" : ""));
			t.updateAll(3);
		}

		t.vibrate(t.VIBE_SUCCESS);
		t.clearAction();
	}
	onExpandAction() {
		var t = this;
		var plyrs = t.selTeam ? t.model.team.players : t.model.opp.players;
		var color = t.selTeam ? "var(--team-color1)" : "var(--opp-color1)";
		t.setPlayerEntry(plyrs, color, true, false);
		t.selPlayers = t.playerSel.setFilter(t.entryNum2, t.entryNum1);
	}
	onBackAction() {
		this.clearAction();
		this.vibrate(this.VIBE_CANCEL);
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
	onPSWSelectMulti(plyrs) {
		this.selPlayers = plyrs;
	}
	onDelX() { // Called when delete button is pressed
		var t = this;
		var m = t.model;
		var d = new ConfirmationDialog("Delete last play?", function () {
			d.remove();
			m.pbp.removePlay(null, true);
			new Toast("Last play deleted");
			t.updateAll(2);
			t.vibrate(t.VIBE_SUCCESS);
		});
		var pbpInfo = m.getPBPInfo(m.pbp.plays[m.pbp.plays.length - 1], Preferences.playersAreColored, true);
		while (pbpInfo) {
			d.body.prependChild(new TextField(pbpInfo.time + "&emsp;" + pbpInfo.play, true));
			pbpInfo = pbpInfo.linked;
		}
		d.show();
	}
	onReplaceX() { // Called when replace button is pressed

	}
	onNumberX(num) {
		// Called when a number gesture happens
		var t = this;
		if (!t.entryBusy)
			return;
		if (!t.playerSel.isMulti()) {
			t.entryNum2 = t.entryNum1;
			t.entryNum1 = num;
			t.playerSelNum.setText((t.entryNum2 == null ? "_" : t.entryNum2) + "" + t.entryNum1);
			t.selPlayers = t.playerSel.setFilter(t.entryNum2, t.entryNum1);
		}
	}
	onPlayX(sc) {
		// Called when a play selection button is pressed or gestured
		var t = this;
		if (t.selTeam == null) {
			t.vibrate(t.VIBE_FAILURE);
			return;
		}
		var lps = null; // Last Play Type
		var lpm = null; // Last play made?
		switch (sc) {
			case 1: lps = "1"; lpm = true; break;
			case 2: lps = "2"; lpm = true; break;
			case 3: lps = "3"; lpm = true; break;
			case "foul": lps = "Foul"; lpm = true; break;
			case "rebound": lps = "Rebound"; break;
			case "steal": lps = "Steal"; break;
			case "turnover": lps = "Turnover"; break;
			case "charge": lps = "Charge"; break;
			default: console.warn("Invalid play type for onPlayX: " + sc);
				return;
		}
		var plyrs = t.selTeam ? t.model.team.players : t.model.opp.players;
		var color = t.selTeam ? "var(--team-color1)" : "var(--opp-color1)";
		t.setPlayerEntry(plyrs, color, false, false);
		t.playerSelNum.setText("__");
		t.lastPlaySelection = lps;
		t.lastPlayMade = lpm;
		t.entryPd = t.model.clock.period;
		t.entryMs = t.model.clock.millisLeft;
		t.updatePlayerSelLbl();
		t.setEntryBusy(true);
	}
	updatePlayerSelLbl() {
		var t = this;
		var tdesc = t.selTeam ? t.model.team.abbr : t.model.opp.abbr;
		var lps = t.lastPlaySelection;
		var mm = t.lastPlayMade == null ? '' : t.lastPlayMade ? " made" : " miss";
		if (lps == "Foul") mm = t.lastPlayMade ? '' : " TECH";
		t.playerSelLbl.setHtml('[' + tdesc + ' ' + lps + mm + "]&emsp;Enter Player #");
	}
	onToggleMade() {
		var t = this;
		if (t.lastPlayMade == true || t.lastPlayMade == false) {
			this.lastPlayMade = !this.lastPlayMade;
			new Toast("Made: " + this.lastPlayMade);
			if (t.lastPlayMade)
				t.vibrate(t.VIBE_SUCCESS);
			else
				t.vibrate(t.VIBE_FAILURE);
			t.updatePlayerSelLbl();
		}
	}

	setPlayerEntry(plyrs, c, b, multi, multis) {
		// Set the player entry fields with {players, color, includeBench, allowMulti, existingSelectionForMulti}
		this.playerSel.setPlayers(plyrs, c, b, multi, multis);
	}
	onSubX() {
		// Called when the player substitution button is pressed
		var t = this;
		if (t.selTeam == null) {
			t.vibrate(t.VIBE_FAILURE);
			return;
		}
		var onCourt = t.selTeam ? t.model.team.onCourt() : t.model.opp.onCourt();
		var plyrs = t.selTeam ? t.model.team.players : t.model.opp.players;
		var color = t.selTeam ? "var(--team-color1)" : "var(--opp-color1)";
		var courtArr = [];
		for (var c in onCourt) courtArr[onCourt[c].id] = true;
		t.setPlayerEntry(plyrs, color, true, true, courtArr);
		t.lastPlaySelection = "Sub";
		t.entryPd = t.model.clock.period;
		t.entryMs = t.model.clock.millisLeft;

		var tdesc = t.selTeam ? t.model.team.abbr : t.model.opp.abbr;
		t.playerSelLbl.setHtml('[' + tdesc + "] Substitutions");
		t.setEntryBusy(true);
	}
	onClockX() {
		// Called when the clock toggle button is pressed
		// Starts/Stops the clock
		var t = this, c = t.model.clock;
		c.running = !c.running;
		t.updateCkBtnSelState();
		if (c.running)
			t.vibrate(t.VIBE_CLOCK_START);
		else
			t.vibrate(t.VIBE_CLOCK_STOP);
		t.updateAll(4);
	}
	onClockNudgeX(x, amt, done, diff, dTime) { // Called when the clock toggle button is nudged
		var t = this, c = t.model.clock;
		if (done) {
			c.millisLeft = Math.max(0, c.millisLeft + c.nudge);
			c.nudge = 0;
			t.updateAll(4);
		}
		else {
			var scale = -0.5 * (Math.tanh((dTime-150)/100)) + 0.7;
			c.nudge += -200 * diff * scale;
			// TODO scoreboard update calback via BUS
		}
	}
	onClockXLong() {
		// Called when the clock toggle button is held
		// Shows dialog for setting the clock
		var t = this, c = this.model.clock;
		t.showSetClockDialog(function (pd, ms, addPlay) {
			c.period = pd;
			c.millisLeft = ms;
			// TODO add new play and (4)
			if (addPlay) {
				var pItm = new BasketballPBPItem(pd, ms, 0, null, BasketballPlayType.SET_CLOCK);
				t.model.pbp.addPlay(pItm);
				t.updateAll(3);
			} else {
				t.updateAll(4);
			}
		}, c);
	}

	updateCkBtnSelState() {
		this.ckBtn.setSelected(this.model.clock.running);
	}

	/**
	 * Update the scoreboard, the synchronizr, and everything else after changing state
	 * Update type:
	 * 1: EVERYTHING
	 * 2: All PBP data
	 * 3: Append PBP data
	 * 4: Just the clock
	 * @param {Integer} type 
	 */
	updateAll(type) {
		var t = this, b = t.bus, m = this.model;
		var ms = m.clock.millisLeft, pd = m.clock.period;
		switch (type) {
			case 1:
				try {
					m.reloadRosters(); // Reload everything
					m.reloadFromPBP();
				} catch (e) { console.error("Error while admin updating", e); }
				m.clock.millisLeft = ms; m.clock.period = pd;
				b.publish(new MBMessage("upd", "admin")); // Update the local scoreboard
				m.invalidateStatic();
				m.invalidateDynamic(); // Never hurts to update the clock too
				m.invalidateEvent();
				b.publish(new MBMessage("updreq", "synchronizr", "updateAndPush"));
				// s.updateFromModel(m); // Have synchronizr update its local state
				// s.pushToTarget(); // Send it down the wire
				break;
			case 2:
				try {
					m.reloadFromPBP(); // Update all plays in PBP to model
				} catch (e) { console.error("Error while admin updating", e); }
				m.clock.millisLeft = ms; m.clock.period = pd; // Save clock so it doesn't change
				b.publish(new MBMessage("upd", "admin")); // Update the local scoreboard
				m.invalidateDynamic(); // Never hurts to update the clock too
				m.invalidateEvent(); // Mark all events invalidated for Synchronizr
				b.publish(new MBMessage("updreq", "synchronizr", "updateAndPush"));
				// s.updateFromModel(m); // Have synchronizr update its local state
				// s.pushToTarget(); // Send it down the wire
				break;
			case 3:
				try {
					m.updateFromPBP(); // Update last play in PBP to model
				} catch (e) { console.error("Error while admin updating", e); }
				m.clock.millisLeft = ms; m.clock.period = pd; // Save clock so it doesn't change
				b.publish(new MBMessage("upd", "admin")); // Update the local scoreboard
				m.invalidateDynamic(); // Never hurts to update the clock too
				m.invalidateEvent(1); // Mark 1 event invalidated for Synchronizr
				b.publish(new MBMessage("updreq", "synchronizr", "updateAndPush"));
				// s.updateFromModel(m); // Have synchronizr update its local state
				// s.pushToTarget(); // Send it down the wire
				break;
			case 4:
				m.invalidateDynamic(); // Invalidate the clock for synchronizr
				// s.updateFromModel(m);
				b.publish(new MBMessage("upd", "admin")); // Update the local scoreboard
				// s.pushToTarget();
				b.publish(new MBMessage("updreq", "synchronizr", "updateAndPush"));
				break;
			default:
				assert(false, "Invalid type for updateAll()");
		}
	}

	showSetClockDialog(callback, clk) { // TODO check the box if the period is changing
		var t = this;
		var time = clk.getTime();
		var ms0 = clk.millisLeft;
		console.log(time);
		var tStr = time.minutes + ":" + (time.seconds < 10 ? '0' : '') + (time.seconds + Math.round(time.millis / 100) / 10);
		var d = new Dialog("Set Clock");
		d.body.setStyle("fontSize", "1.3em");
		var pd = new UIPanel();
		pd.appendChild(new TextField("Period").setStyle("width", "40%").setStyle("flexGrow", "0"));
		var f1 = new EditTextField(clk.period, 9);
		pd.appendChild(f1);
		var tm = new UIPanel();
		tm.appendChild(new TextField("Time").setStyle("width", "40%").setStyle("flexGrow", "0"));
		var f2 = new EditTextField(tStr, 9);
		tm.appendChild(f2);
		var chkh = new UIPanel().setStyle("marginTop", "0.5em");
		var chk = new CheckboxField();
		chkh.appendChild(new TextField("Add play"))
		chkh.appendChild(chk);
		var bth = new UIPanel().setStyle("marginTop", "0.5em");
		var btn = new ButtonField("Submit");
		bth.appendChild(btn);
		d.appendChild(pd);
		d.appendChild(tm);
		d.appendChild(chkh);
		d.appendChild(bth);
		btn.addClickListener(function () {
			var pd = parseInt(f1.getText());
			var ms = ms0;
			if (f2.getText() != tStr)
				ms = t.parseTime(f2.getText());
			if (pd < 0 || pd > 9 || isNaN(ms) || ms < 0) {
				new Toast("Invalid time");
				return;
			}
			callback(pd, ms, chk.getValue());
			d.remove();
		});
		d.show();
	}

	parseTime(str) {
		console.log(str);
		var idx = str.indexOf(':');
		if (idx == -1) return NaN;
		var s1 = str.substring(0, idx);
		var s2 = str.substring(idx + 1);
		return Math.round(1000 * (parseInt(s1) * 60 + parseFloat(s2)));
	}

	onGameEditBtn() {
		var t = this;
		var dlg = new Dialog("Edit Game");
		var form = new PreferencesField(t.model.getEditData(), t.model.editDataRenameFunction);
		var submit = new ButtonField("Submit");
		submit.addClickListener(function () {
			dlg.close();
			t.model.putEditData(form.getState());
			t.updateAll(1);
		});
		dlg.appendChild(form);
		dlg.appendChild(submit);
		dlg.show();
	}

	onGameRosBtn() {
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
			if (chk1 || chk2) { // Check for errors
				if (chk1)
					new Toast(chk1);
				else
					new Toast(chk2);
				return;
			}
			console.log(tbl1.getCell(1, 0));
			t.rosSvFn(tbl1, t.model.team);
			t.rosSvFn(tbl2, t.model.opp);
			new Toast("Submitted rosters");
			t.updateAll(1);
			t.vibrate(t.VIBE_SUCCESS);
			dlg.remove();
		});
		dlg.appendChild(txt1);
		dlg.appendChild(tbl1);
		dlg.appendChild(new UIPanel().setStyle("height", "1em"));
		dlg.appendChild(txt2);
		dlg.appendChild(tbl2);
		dlg.appendChild(submit);
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
		if (pbp) {
			for (var x = 0; x < pbp.plays.length; x++) {
				var p = pbp.plays[x];
				if (isTeam != null && p.team == isTeam && !ids.includes(p.pid)) {
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
				if (arr[x].sta)
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
		t.selMulti = false;
		t.width = rows;
		t.height = cols;
		t._onSelection = null;
		t._onMSelection = null;
		for (var x = 0; x < rows; x++) {
			t.rows[x] = t.generateRow(cols, h);
			t.appendChild(t.rows[x]);
		}
		t.setPlayers(null);
	}
	setOnSelection(fun) {
		this._onSelection = fun;
	}
	setOnSelectionMulti(fun) {
		this._onMSelection = fun;
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
		var x = btn.getText();
		var t = this;
		if (this.selMulti) {
			var s = t.sels;
			s[x] = !s[x];
			if (t._onMSelection)
				t._onMSelection(t.setFilter(s));
			else
				t.setFilter(s);
		}
		else {
			if (x.length == 0) return;
			var num1 = parseInt(x.charAt(x.length - 1));
			var num2 = x.length == 2 ? parseInt(x.charAt(x.length - 2)) : null;
			// this.setFilter(num2, num1);
			if (t._onSelection)
				t._onSelection(num2, num1);
		}
	}

	setFilter(num2, num1) {
		var t = this;
		var rtn = [];
		if (t.selMulti) { // Multi-select mode uses a list of players
			for (var x = 0; x < t.bptr; x++) {
				var btn = t.rows[Math.floor(x / 5)].children[x % 5];
				var txt = btn.getText();
				if (num2[txt]) {
					btn.setSelected(true);
					rtn.push(txt);
				}
				else {
					btn.setSelected(false);
				}
			}
		}
		else { // Single-select mode uses two numbers to select one player
			var nStr = "";
			if (num2 == 0 && num1 != 0)
				num2 = null;
			if (num2 != null) nStr += num2;
			if (num1 != null) nStr += num1;
			for (var x = 0; x < t.bptr; x++) {
				var btn = t.rows[Math.floor(x / 5)].children[x % 5];
				var txt = btn.getText();
				if (txt == nStr) {
					btn.setSelected(true);
					rtn.push(txt);
				}
				else {
					btn.setSelected(false);
				}
			}
		}
		return rtn;
	}

	isMulti() {
		return this.selMulti;
	}

	setPlayers(players, color, includeBench, selMulti, sels) {
		var t = this;
		if (players == null) {
			for (var x = 0; x < t.rows.length; x++)
				t.rows[x].setStyle("display", "none");
			return;
		}
		t.selMulti = selMulti;
		t.sels = sels ? [...sels] : null;
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
		if (selMulti) {
			if (t._onMSelection)
				t._onMSelection(t.setFilter(t.sels));
			else
				t.setFilter(t.sels);
		}
	}
}