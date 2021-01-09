const Constants = {
	defaultStyle: [
		{ numberField: { litColor: "#F81" } },
		{
			scoreboardHomeScore: { litColor: "#F01" }, scoreboardGuestScore: { litColor: "#F01" }, scoreboardPFPPlayerNum: { litColor: "#F01" },
			scoreboardHomeFouls: { litColor: "#F01" }, scoreboardGuestFouls: { litColor: "#F01" }, scoreboardClock: { litColor: "#FD0" },
			scoreboardPeriod: { litColor: "#FD0" }
		}
	],
	mascotPath: "resources/mascots/",
	version: "1.2.0",
	copyright: "2020 Thor Lancaster, all rights reserved"
}

class StatcastrApp {
	/**
	 * 
	 * @param {Element} appRootEl Root element to place app in
	 * @param {Synchronizr} synchronizr Synchronizr instance
	 */
	constructor(appRootEl, synchronizr) {
		var t = this;
		assert(appRootEl != null, "App Root Element is required")
		assert(synchronizr != null, "Synchronizr is required")
		t.appRoot = appRootEl;
		t.appRoot.classList.add("appRoot");
		t.views = [];
		t.NULL_VIEW = new NullView();

		t.viewSelector = t.createViewSelector();
		t.selectedView = null;
		t.appRoot.appendChild(t.viewSelector.element);

		t.viewContainer = DCE("div", "viewContainer");
		t.viewContainer.style.flexShrink = "1";
		t.viewContainer.style.flexGrow = "1";
		t.appRoot.appendChild(t.viewContainer);

		t.model = t.createSportModel("basketball");
		BUS.publish(new MBMessage("req", "gameModel", t.model));
		// BUS.publish(new MBMessage("req", "admin", Credentials.isAdmin()));
		// window.MODEL = t.model;

		t.generateView("eventList", new EventListView(BUS));
		t.generateView("loadingFeed", new LoadingFeedView(BUS));
		t.generateView("scoreboard", new ScoreboardView(t.model));
		t.generateView("playByPlay", new PlayByPlayView(t.model));
		t.generateView("teamStats", new TeamStatsView(t.model, true));
		t.generateView("opponentStats", new TeamStatsView(t.model, false));
		t.generateView("admin", new AdminView(t.model, BUS));
		t.generateView("login", new LoginView(BUS));
		// t.setDisplayedView("scoreboard");
		t.applyPreferences();
		t.onResize();
		t.update();

		t.touchManager = new TouchManager(t.appRoot);
		t.touchManager.addGestureListener(t.onGesture.bind(t));
		t.touchManager.start();
		window.TOUCH = t.touchManager;

		console.log("EVENT IS " + BUS.getState().event);

		BUS.subscribe(function (e) {
			if (e.name == "feedReady" && e.type == "upd") {
				if (e.newVal) {
					t.setDisplayedView(BUS.getState().selView);
					t.onResize();
				}
				else
					t.setDisplayedView("loadingFeed");
			}
			if (e.name == "dialog" && e.type == "upd") {
				t.showBusDialog(e.newVal);
			}
			if (e.name == "admin" && e.type == "upd") {
				t.update();
			}
			if (e.name == "synchronizr" && e.type == "upd") {
				if (synchronizr.getEventType() == "list") {
					console.log("LD LIST", synchronizr.staticData[1]);
					BUS.publish(new MBMessage("req", "selView", "eventList"));
					t.model.clear();
					t.updateEvtSelAll(synchronizr.staticData.slice(1));
				} else { // Non list type
					if (BUS.getState().selView == "eventList") {
						BUS.publish(new MBMessage("req", "selView", "scoreboard"));
					}
					var n = e.newVal;
					var needsPbpRl = false;
					if (n.sChange) {
						t.model.updateStaticData(n.s);
						t.model.reloadRosters();
						needsPbpRl = true;
					} if (n.eChange === true) { // Event data modified beyond appending
						t.model.updateEventData(n.e);
						needsPbpRl = true;
					} else if (typeof n.eChange == "number") {
						t.model.updateEventData(n.e, n.eChange);
						for (var x = 0; x < n.eChange; x++)
							t.model.updateFromPBP(-1 - x);
					}
					if (needsPbpRl)
						t.model.reloadFromPBP();
					if (n.sChange || n.dChange || n.eChange) // Dynamic clock has highest priority, so is last
						t.model.updateDynamicData(n.d);
					t.update();

					// TODO update model
					// TODO update game
				}
			}
			if (e.name == "event" && e.type == "chg" && e.newVal != "null") {
				t.modifyURL("event", e.newVal);
			}
		});
		BUS.publish(new MBMessage("req", "selView", Preferences.defaultView));
	}

	/**
	 * Call every 100ms or so to tick the clock
	 * If anything changed, updates automatically
	 */
	tick() {
		var t = this;
		var r1 = t.model.tick();
		if (r1) {
			t.update();
		}
	}

	logout() {
		var t = this;
		// TODO pubSub admin = false
		BUS.publish(new MBMessage("req", "admin", false));
		BUS.publish(new MBMessage("updreq", "synchronizr", "reconnect"));
		Credentials.admin = false;
		Credentials.password = "";
		Credentials.save();
		BUS.publish(new MBMessage("req", "selView", Preferences.defaultView));
		// TODO if PubSub view is admin, set it to scoreboard
	}

	onGesture(obj) { // Touch gestures are delegated to the selected view
		// TODO what if there's a dialog in the way?
		var v = this.getSelectedView();
		if (v.onGesture)
			v.onGesture(obj);
	}

	onKey(e) { // Key presses are delegated to the selected view if not repeat and no dialog is in the way
		if (e.repeat)
			return;
		if (Dialog.isOpen())
			return;
		var v = this.getSelectedView();
		var k = e.key.length > 1 ? e.key.toLowerCase() : e.key;
		if (v.onKey)
			v.onKey(k, e.type == "keydown");
	}

	createViewSelector() {
		var vs = new TabSelector();
		var t = this;
		vs.setAutoSelect(false);
		vs.addClass("mainTabSelector");
		vs.setStyle("flexShrink", "0");
		vs.setStyles("top", "left", "0px");
		vs.addIcon("favicon.ico");
		vs.addTab("<u>E</u>VENTS", "eventList", true);
		vs.addTab("<u>S</u>COREBOARD", "scoreboard");
		// vs.addTab("SPLIT&nbsp;<u>B</u>OX", "splitBox");
		vs.addTab("<u>T</u>EAM STATS", "teamStats");
		vs.addTab("<u>O</u>PPONENT STATS", "opponentStats");
		vs.addTab("<u>P</u>LAY-BY-PLAY", "playByPlay");
		// vs.addTab("S<u>C</u>ORING", "scoring");
		// vs.addTab("SHOOTIN<u>G</u>", "shooting");
		vs.addTab("<u>H</u>ELP", "help", true);
		vs.addTab("<u>A</u>DMIN", "admin");
		BUS.subscribe(function (e) {
			if (e.name == "selView" && e.type == "chg") {
				vs.setHighlighted(e.newVal);
				t.setDisplayedView(e.newVal);
				t.onResize();
				setTimeout(function(){
					t.onResize(); // TODO not sure why this is needed
				}, 1);
				t.update();
				if (e.newVal == "events")
					BUS.publish(new MBMessage("req", "event", null));
			}
		});
		vs.addSelectionListener(function (e) {
			BUS.publish(new MBMessage("req", "selView", e));
		});
		return vs;
	}

	createSportModel(name) {
		switch (name) {
			case "basketball":
				var rtn = new BasketballGameModel();
				return rtn;
				break;
			default:
				throw "Unsupported sport name: " + name;
		}
	}

	generateView(name, obj) {
		this.views.push([name, obj]);
	}

	createLoadingField() {
		console.warn("Deprecated method. Should call 'new LoadingField()' instead");
		return new TextField("<div class='lds-ring'><div></div><div></div><div></div><div></div></div>", true).setStyle("textAlign", "center");
	}

	// Receives messages of the type DialogType|DialogSubType[|DialogInfo1...[|...]]
	showBusDialog(dlgCmd) {
		var t = this;
		var args = dlgCmd.split("|");
		console.log("DLG ARGS", args);
		switch (args[0]) { // Dialog type
			case "noSelView":
				var d = new OkayDialog("Cannot select view", "Select an event first<br/>from the 'events' tab");
				d.show();
				break;
			case "help":
				var d = new Dialog("Help");
				d.appendChild(new TextField("Select \"Events\" From the top menu to select a feed to watch." +
					"<br/>To view the feed in different ways, select one of the tabs at the top.", true)
					.setStyle("whiteSpace", "initial"));
				var aboutBtn = new ButtonField("About Statcastr");
				aboutBtn.addClickListener(function () {
					d.close();
					BUS.publish(new MBMessage("upd", "dialog", "about"));
				});
				var prefsBtn = new ButtonField("Preferences");
				prefsBtn.addClickListener(function () {
					d.close();
					BUS.publish(new MBMessage("upd", "dialog", "preferences"));
				});
				var btns = new UIPanel();
				btns.appendChild(aboutBtn);
				btns.appendChild(prefsBtn);
				d.appendChild(new UIPanel().setStyle("height", "3em"));
				d.appendChild(btns);
				d.show();
				break;
			case "about":
				var d = new Dialog("About Statcastr");
				d.appendChild(new ImageField("resources/favicon/favicon-256.png").setStyle("height", "5em"));
				d.appendChild(new TextField("Statcastr version " + Constants.version + "<br/>&#169;" + Constants.copyright +
					"<br/>", true).setStyle("whiteSpace", "initial"));
				d.show();
				break;
			case "preferences":
				var d = new Dialog("Preferences");
				var prefs = new PreferencesField(Preferences, Preferences.renameFn);
				d.appendChild(prefs);
				var submitBtn = new ButtonField("Submit");
				submitBtn.addClickListener(function () {
					if (!prefs.isValid()) {
						new Toast("Invalid values");
						return;
					}
					d.close();
					Preferences.setFrom(prefs.getState());
					Preferences.save();
					t.applyPreferences();
					new Toast("Preferences saved");
				});
				d.appendChild(submitBtn);
				d.show();
				break;
		}
	}


	/**
	 * Modify a URL parameter without reloading the page
	 * @param {String} k Key
	 * @param {String} v Value
	 */
	modifyURL(k, v) {
		var url = new URL(location.href);
		var params = url.searchParams;
		params.set(k, v);
		url.search = params.toString();
		history.replaceState("Statcastr", document.title, url.toString());
	}

	// TODO handle updating the event selection view (not table anymore)
	// TODO maybe some databases should be managed by Synchronizr
	// XXX Event list of ids is not part of Synchronizer and should be managed here. (Currently is)
	1;

	// Update the event selection table and the event list database entry
	// given a response from Synchronizr
	updateEvtSelAll(arr) {
		var t = this;
		t.getSelectedView().updateEvtSelTbl(arr); // We're assuming the event list view is selected here
		t.updateEvtSelDb(arr);
	}

	updateEvtSelDb(arr) {
		var list = [];
		for (var x = 0; x < arr.length; x++) {
			var arrx = arr[x];
			var r = Synchronizr.parseSingleEventListing(arrx);
			list.push(r.id);
		}
		EventListPrefs.events = list;
		EventListPrefs.save();
	}

	// Set the View to be displayed in the View Container
	setDisplayedView(vid) {
		var t = this;
		t.selectedView = vid;
		CLEAR(t.viewContainer);
		var selView = null; // View that maps to given vid
		for (var x = 0; x < t.views.length; x++) {
			var key = t.views[x][0];
			var val = t.views[x][1];
			if (key == vid) {
				selView = val;
				break;
			}
		}
		if (selView == null)
			selView = t.NULL_VIEW;
		if(selView.reset){
			selView.reset();
		}
		var h = selView.getHeaderElement();
		if (h) t.viewContainer.appendChild(h);
		t.viewContainer.appendChild(selView.getMainElement());
	}

	// Get the ID of the view in the view container
	// TODO rename to getDisplayedView()
	getSelectedView() {
		for (var v in this.views) {
			if (this.views[v][0] == this.selectedView)
				return this.views[v][1];
		}
		return this.NULL_VIEW;
	}

	applyPreferences() {
		this.applyCSSPreferences();
		this.onResize();
		this.update();
	}
	applyCSSPreferences() {
		var ars = this.appRoot.style;
		var big = Preferences.enlargeFonts;
		ars.setProperty("--mobile-font-sz", big ? "1em" : "0.75em");
		ars.setProperty("--desktop-font-sz", big ? "1.1em" : "0.9em");
	}

	update() {
		// var t1 = performance.now();
		this.getSelectedView().update();
		// console.log("Update() took ms: " + (performance.now() - t1));
	}

	onResize() {
		var t = this;
		var m = MAIN.mobile;
		if (m)
			t.appRoot.classList.add("mobile");
		else
			t.appRoot.classList.remove("mobile");

		if (m != t._mobile) {
			// Some elements need resize()d twice when mobile changes as well
			t._mobile = m;
			t.getSelectedView().resize();
			t.update();
		}
		t.getSelectedView().resize();
		t.viewSelector.resize();
	}

	/* Stuff for Synchronizr compatibliity */
	// TODO this should all be PubSub
	// onSynchronizrVerification(result, uname, pw) {
	// 	console.log(result, uname, pw);
	// 	var bad = false;
	// 	if (Dialog.isOpenById("adminLoginDlg")) {
	// 		if (result) {
	// 			Credentials.username = uname;
	// 			Credentials.password = pw;
	// 			Credentials.save();
	// 			this.onAdminLoginDone();
	// 		} else {
	// 			bad = true;
	// 		}
	// 	}
	// 	Dialog.removeById("adminLoginDlg");
	// 	if (bad)
	// 		this.showMainDialog("adminLogin", 1);
	// }

	// onSynchronizrPreConn() {

	// }

	// onSynchronizrStatusChange(readyState, buffered, status){
	// 	var t = this;
	// 	t.model.connStatus = {readyState, buffered, status};
	// 	t.update();
	// }

	// onSynchronizrError(op) {
	// 	var t = this, s = t.synchronizr;
	// 	if (op == s.op.ERROR_CREDENTIALS_BT || op == s.op.ERROR_NOTADMIN_BT) {
	// 		t.synchronizr.clearHashValidationPending();
	// 		if (op != s.op.ERROR_CREDENTIALS_BT) // On credential error, don't blindly try and log on again
	// 			t.synchronizr.reconnect();
	// 		if (!Dialog.isOpenById("adminLoginDlg"))
	// 			t.showMainDialog("adminLogin", 2);
	// 	}
	// 	else if (op == s.op.ERROR_NOTFOUND_BT) {
	// 		Dialog.removeById("loadingStatsDlg");
	// 		t.showMainDialog("eventList", 1);
	// 	}
	// }

	// onSynchronizrHvDone() {
	// 	Dialog.removeById("loadingStatsDlg");
	// }

	// onSynchronizrUpdate(s, d, e, sd, dd, ed) { // TODO this needs to be in PubSub handler
	// 	var t = this;
	// 	var type = Synchronizr.byteArrToStr(sd[0]);
	// 	if (type == "list") {
	// 		t.updateEvtSelAll(sd.slice(1));
	// 	}
	// 	else if (type == "bbgame") {
	// 		Dialog.removeById("loadingStatsDlg");
	// 		var needsPbpRl = false;
	// 		if (s) {
	// 			t.model.updateStaticData(sd);
	// 			t.model.reloadRosters();
	// 			needsPbpRl = true;
	// 		} if (e === true) { // Event data modified beyond appending
	// 			t.model.updateEventData(ed);
	// 			needsPbpRl = true;
	// 		} else if (typeof e == "number") {
	// 			t.model.updateEventData(ed, e);
	// 			for (var x = 0; x < e; x++)
	// 				t.model.updateFromPBP(-1 - x);
	// 		}
	// 		if (needsPbpRl)
	// 			t.model.reloadFromPBP();
	// 		if (s || d || e) // Dynamic clock has highest priority, so is last
	// 			t.model.updateDynamicData(dd);
	// 		t.update();
	// 	}
	// 	// console.log(s, d, e);
	// }

}