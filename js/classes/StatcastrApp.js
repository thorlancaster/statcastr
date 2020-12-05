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
	version: "0.9.9",
	copyright: "2020 Thor Lancaster, all rights reserved"
}

class StatcastrApp {
	/**
	 * 
	 * @param {Element} appRootEl Root element to place app in
	 * @param {Synchronizr} synchronizr Synchronizr instance
	 * @param {String} eventId Id of event to listen to. Can be null
	 */
	constructor(appRootEl, synchronizr, eventId) {
		var t = this;
		assert(appRootEl != null, "App Root Element is required")
		assert(synchronizr != null, "Synchronizr is required")
		t.appRoot = appRootEl;
		t.synchronizrPtr = [];
		t.setSynchronizr(synchronizr);
		t.appRoot.classList.add("appRoot");
		t.views = [];
		t.NULL_VIEW = new NullView();
		t.eventId = eventId;
		t.isAdmin = Credentials.isAdmin();

		t.viewSelector = t.createViewSelector();
		t.viewSelector.addSelectionListener(function (sel) { t.onViewSelectedDirect(sel) });
		t.appRoot.appendChild(t.viewSelector.element);

		t.viewContainer = DCE("div", "viewContainer");
		t.viewContainer.style.flexShrink = "1";
		t.viewContainer.style.flexGrow = "1";
		t.appRoot.appendChild(t.viewContainer);

		t.model = t.createSportModel("basketball");
		// t.model.dbgCreatePlayByPlay();
		// t.testPerfPBPReload();
		t.model.reloadFromPBP();
		window.MODEL = t.model;

		t.generateView("scoreboard", new ScoreboardView(t.model));
		t.generateView("playByPlay", new PlayByPlayView(t.model));
		t.generateView("teamStats", new TeamStatsView(t.model, true));
		t.generateView("opponentStats", new TeamStatsView(t.model, false));
		t.generateView("admin", new AdminView(t.model, t.synchronizrPtr, t.onAdminScoreboardUpdate.bind(t)));
		// t.setView("scoreboard");
		t.setView(Preferences.defaultView, true);
		t.update();
		if (eventId == null) // If no event is selected, ask the user to choose one
			t.onViewSelected("eventList");
		else {
			synchronizr.setEventId(eventId, t.isAdmin); // Otherwise, begin syncing to the current event
			if (t.isAdmin) { // Admin must manually pull stats if they want to, otherwise they just push
				setTimeout(function () {
					synchronizr.loadFromStorage(eventId, true, t.model.getTemplate());
					synchronizr.beginHashValidation();
				}, 0);
			} else // Fans must wait for the feed to load
				t.showMainDialog("loadingStatsFeed", "Event Id: " + eventId);
		}

		// Allow the page to render before finishing
		t.applyCSSPreferences();
		setTimeout(function () {
			t.onResize();
			t.viewSelector.setSelected(t.selectedView);
			t.getSelectedView().resize();
		}, 0);

		t.touchManager = new TouchManager(t.appRoot);
		t.touchManager.addGestureListener(t.onGesture.bind(t));
		t.touchManager.start();
		window.TOUCH = t.touchManager;

	}

	/**
	 * Call every 100ms or so to tick the clock
	 * If anything changed, updates automatically
	 */
	tick() {
		var t = this;
		var r1 = t.model.tick();
		if (r1 || false) {
			t.update();
		}
		if (t.model.clock.running) {
			t.model.invalidateDynamic(); // Make sure the clock stays in sync
			t.synchronizr.updateFromModel(t.model, true);
		}
	}

	logout(){
		var t = this;
		this.isAdmin = false;
		Credentials.admin = false;
		Credentials.password = "";
		Credentials.save();
		t.synchronizr.setEventId(t.eventId, t.isAdmin);
		if(t.selectedView == "admin"){
			t.onViewSelected("scoreboard");
			t.viewSelector.setSelected(t.selectedView);
		}
	}

	setSynchronizr(s) {
		this.synchronizr = s;
		this.synchronizrPtr[0] = s;
	}

	onGesture(obj) {
		var v = this.getSelectedView();
		if (v.onGesture)
			v.onGesture(obj);
	}

	onKey(e) {
		if (e.repeat)
			return;
		if (Dialog.isOpen())
			return;
		var v = this.getSelectedView();
		var k = e.key.length > 1 ? e.key.toLowerCase() : e.key;
		if (v.onKey)
			v.onKey(k, e.type == "keydown");
	}

	testPerfPBPReload() {
		var perf = performance.now(); // Testing code for performance
		for (var x = 0; x < 1000; x++)
			this.model.reloadFromPBP();
		console.log("1000 PBP reloads: " + (performance.now() - perf) + "ms");
	}

	onViewSelectedDirect(sel) { // Called by the TabSelector and nothing else
		this.onViewSelected(sel);
		if (sel != "eventList" && sel != "help") {
			Preferences.defaultView = sel;
			Preferences.save();
		}
	}

	onViewSelected(sel) {
		switch (sel) {
			case "eventList":
			case "help":
				this.showMainDialog(sel);
				break;
			default:
				this.setView(sel);
		}

		this.getSelectedView().resize();
		this.getSelectedView().resize();
		this.update();
	}

	createViewSelector() {
		var vs = new TabSelector();
		vs.addClass("mainTabSelector");
		vs.setStyle("flexShrink", "0");
		vs.setStyles("top", "left", "0px");
		vs.addIcon("favicon.ico");
		vs.addIcon("favicon.ico");
		vs.addIcon("favicon.ico");
		vs.addTab("<u>E</u>VENTS", "eventList", true);
		vs.addTab("<u>S</u>COREBOARD", "scoreboard");
		// vs.addTab("SPLIT&nbsp;<u>B</u>OX", "splitBox");
		vs.addIcon("favicon.ico");
		vs.addTab("<u>T</u>EAM STATS", "teamStats");
		vs.addTab("<u>O</u>PPONENT STATS", "opponentStats");
		vs.addTab("<u>P</u>LAY-BY-PLAY", "playByPlay");
		// vs.addTab("S<u>C</u>ORING", "scoring");
		// vs.addTab("SHOOTIN<u>G</u>", "shooting");
		vs.addTab("<u>H</u>ELP", "help", true);
		vs.addTab("<u>A</u>DMIN", "admin");
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
		return new TextField("<div class='lds-ring'><div></div><div></div><div></div><div></div></div>", true).setStyle("textAlign", "center");
	}

	showMainDialog(dlg, arg2, arg3) {
		var t = this;
		if (dlg == "adminLogin") {
			var d = new Dialog("Log in");
			d.setId("adminLoginDlg");

			var errStr = "";
			if (arg2 == 1) errStr = "Incorrect Username / Password";
			if (arg2 == 2) errStr = "Remote authentication failure<br/>Please log in again";
			var badLbl = new TextField(errStr, true).setStyle("color", "#F00");
			if (arg2) // arg2 = bad credentials
				d.appendChild(badLbl);

			var form = new PreferencesField(arg2 ? { username: "", password: "" } : Credentials, Credentials.renameFn);
			d.appendChild(form);
			var submitBtn = new ButtonField("Submit");
			submitBtn.addClickListener(function () {
				if (!form.isValid()) {
					new Toast("Invalid values");
					return;
				}
				badLbl.setStyle("display", "none");
				form.setStyle("display", "none");
				submitBtn.setStyle("display", "none");
				d.body.prependChild(new TextField("Verifying password...<br/><br/>", true));
				d.body.prependChild(t.createLoadingField());
				var overrideBtn = new ButtonField("Override Verification");
				overrideBtn.addClickListener(function () {
					Credentials.setFrom(form.getState());
					Credentials.save();
					t.onAdminLoginDone();
					d.close();
				});
				d.appendChild(overrideBtn);
				// d.close();
				var creds = form.getState();
				t.synchronizr.beginVerifyPassword(creds.username, creds.password);
				console.log(creds);
			});
			d.appendChild(submitBtn);
			d.show();
		}
		else if (dlg == "loadingStatsFeed") {
			var d = new Dialog("Loading stats feed...");
			d.setId("loadingStatsDlg");
			d.appendChild(new TextField("Please wait a few seconds<br/>Or press 'X' to choose another event", true).setStyle("textAlign", "center"));
			d.loading = t.createLoadingField();
			d.appendChild(d.loading);
			if (arg2 && arg3)
				d.appendChild(new TextField(arg2 + " &nbsp;-vs-&nbsp; " + arg3, true));
			else if (arg2)
				d.appendChild(new TextField(arg2, true));

			if (t.isAdmin) {
				var cancel = new ButtonField("Override and go to admin");
				cancel.addClickListener(function () {
					d.remove();
				});
				d.appendChild(cancel);
			}

			d.onClose = function () {
				t.synchronizr.reconnect();
				t.showMainDialog("eventList");
			}
			d.show();
		}
		else if (dlg == "createNewEvent") {
			var exList = EventListPrefs.events;
			var exStr = exList ? ("" + exList).replace(',', ", ") : "None";
			var d = new Dialog("Create / Goto Event");
			var form = new PreferencesField({ eventId: "" }).setStyle("marginBottom", "0.5em");
			var label = new TextField("Existing events: <br/>" + exStr, true).setStyle("marginBottom", "0.5em");
			var submit = new ButtonField("Submit");
			submit.addClickListener(function () {
				var res = form.getState().eventId;
				d.close();
				t.evtSelDlg.remove();
				t.eventId = res;
				t.modifyURL("event", t.eventId);
				if (!exList.includes(res)) {
					t.eventTeam = "Unknown";
					t.eventOpp = "Unknown";
				} else {
					t.synchronizr.loadFromStorage(t.eventId, true, t.model.getTemplate());
				}
				t.synchronizr.setEventId(t.eventId, t.isAdmin);
			});
			d.appendChild(form);
			d.appendChild(label);
			d.appendChild(submit);
			d.show();
		}
		else if (dlg == "eventList") {
			var d = new Dialog("Loading event list...");
			var tbl = new TableField(["ID", "Type", "Team", "Opponent", "Location", "Time", "Info"]);
			var ovrBtn = new ButtonField("Create New Event");

			var errStr = "";
			if (arg2 == 1) errStr = "The event provided does not exist";
			var badLbl = new TextField(errStr, true).setStyle("color", "#F00");
			if (arg2) // arg2 = bad event
				d.appendChild(badLbl);

			d.appendChild(tbl);
			d.loading = t.createLoadingField();
			d.appendChild(d.loading);
			if (t.isAdmin)
				d.appendChild(ovrBtn);

			if (!t.eventId) {
				d.closeBtn.setBgColor("var(--disabled-fg)");
			}

			t.evtSelTbl = tbl;
			t.evtSelDlg = d;

			var sd = t.synchronizr.staticData;
			if (Synchronizr.byteArrToStr(sd[0]) == "list") {
				t.updateEvtSelAll(sd.slice(1));
			} else {
				t.synchronizr.setEventId(null, false);
			}

			tbl.enableClickListener(function (row) {
				tbl.clearHighlights();
				tbl.setHighlight(row, true);
				t.eventId = tbl.getCell(0, row, false);
				t.eventTeam = tbl.getCell(2, row, false);
				t.eventOpp = tbl.getCell(3, row, false);
				t.synchronizr.setEventId(t.eventId, t.isAdmin);
				if (t.isAdmin) {
					t.synchronizr.loadFromStorage(t.eventId);
					t.synchronizr.beginHashValidation();
				}
				t.evtSelDlg.remove();
				t.modifyURL("event", t.eventId);
				t.showMainDialog("loadingStatsFeed", t.eventTeam, t.eventOpp);
			});

			ovrBtn.addClickListener(function () {
				t.evtSelDlg.remove();
				t.showMainDialog("createNewEvent");
			});

			d.onClose = function () {
				if (!t.eventId) {
					new Toast("No Event Selected");
					return false;
				} else {
					t.synchronizr.setEventId(t.eventId, t.isAdmin);
					t.showMainDialog("loadingStatsFeed", t.eventTeam, t.eventOpp);
				}
			}
			d.show();
		} else if (dlg == "help") {
			var d = new Dialog("Help");
			d.appendChild(new TextField("Select \"Events\" From the top menu to select a feed to watch." +
				"<br/>To view the feed in different ways, select one of the tabs at the top.", true)
				.setStyle("whiteSpace", "initial"));
			var aboutBtn = new ButtonField("About Statcastr");
			aboutBtn.addClickListener(function () {
				d.close();
				t.showMainDialog("about");
			});
			var prefsBtn = new ButtonField("Preferences");
			prefsBtn.addClickListener(function () {
				d.close();
				t.showMainDialog("preferences");
			});
			var btns = new UIPanel();
			btns.appendChild(aboutBtn);
			btns.appendChild(prefsBtn);
			d.appendChild(new UIPanel().setStyle("height", "3em"));
			d.appendChild(btns);
			d.show();
		}
		else if (dlg == "about") {
			var d = new Dialog("About Statcastr");
			d.appendChild(new ImageField("resources/favicon/favicon-256.png").setStyle("height", "5em"));
			d.appendChild(new TextField("Statcastr version " + Constants.version + "<br/>&#169;" + Constants.copyright +
				"<br/>", true).setStyle("whiteSpace", "initial"));
			d.show();
		}
		else if (dlg == "preferences") {
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
		}
		else console.warn("Unsupported ShowMainDialog " + dlg);
	}

	// Called when admin login is complete
	// (either verified or overridden)
	onAdminLoginDone() {
		var t = this;
		t.isAdmin = true;
		Credentials.admin = true;
		Credentials.save();
		t.onViewSelected("admin");
		t.viewSelector.setSelected(t.selectedView); // Select the "Admin" tab
		t.synchronizr.setEventId(t.eventId, true); // Log in and become the admin
		t.synchronizr.beginHashValidation(); // Make sure everything is correct
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

	// Update the event selection table and the event list database entry
	// given a response from Synchronizr
	updateEvtSelAll(arr) {
		var t = this;
		t.updateEvtSelTbl(arr);
		t.updateEvtSelDb(arr);
	}

	updateEvtSelDb(arr) {
		var list = [];
		for (var x = 0; x < arr.length; x++) {
			var arrx = arr[x];
			var r = this.parseSingleEventListing(arrx);
			list.push(r.id);
		}
		EventListPrefs.events = list;
		EventListPrefs.save();
	}

	// Update the event selection table in the event selection dialog,
	// given a response from Synchronizr
	updateEvtSelTbl(arr) {
		var t = this;
		if (!t.evtSelDlg) return;
		t.evtSelDlg.setTitle("Choose an event");
		t.evtSelDlg.body.removeChild(t.evtSelDlg.loading);
		var tbl = t.evtSelTbl;
		if (tbl) {
			tbl.setLength(arr.length);
			for (var x = 0; x < arr.length; x++) {
				var arrx = arr[x];
				var r = t.parseSingleEventListing(arrx);
				// console.log(id, type, {hTown, hMascot, hAbbr}, {gTown, gMascot, gAbbr}, location, comments, startTime, gender);
				tbl.setCell(0, x, "<span class='link'>" + r.id + "</a>", true);
				tbl.setCell(1, x, r.gender + " " + r.type);
				tbl.setCell(2, x, r.hAbbr + " " + r.hMascot);
				tbl.setCell(3, x, r.gAbbr + " " + r.gMascot);
				tbl.setCell(4, x, r.location);
				tbl.setCell(5, x, r.startTime);
				tbl.setCell(6, x, r.comments.length ? r.comments : "--");
			}
		}
	}

	parseSingleEventListing(arrx) {
		var ptr = [0];
		var id = Synchronizr.byteArrToStr(Synchronizr.parseField(arrx, ptr));
		var type = Synchronizr.byteArrToStr(Synchronizr.parseField(arrx, ptr));
		var hInfo = Synchronizr.parseField(arrx, ptr);
		var gInfo = Synchronizr.parseField(arrx, ptr);
		var hPtr = [0];
		var gPtr = [0];
		var hTown = Synchronizr.byteArrToStr(Synchronizr.parseField(hInfo, hPtr));
		var hMascot = Synchronizr.byteArrToStr(Synchronizr.parseField(hInfo, hPtr));
		var hAbbr = Synchronizr.byteArrToStr(Synchronizr.parseField(hInfo, hPtr));

		var gTown = Synchronizr.byteArrToStr(Synchronizr.parseField(gInfo, gPtr));
		var gMascot = Synchronizr.byteArrToStr(Synchronizr.parseField(gInfo, gPtr));
		var gAbbr = Synchronizr.byteArrToStr(Synchronizr.parseField(gInfo, gPtr));

		var location = Synchronizr.byteArrToStr(Synchronizr.parseField(arrx, ptr));
		var comments = Synchronizr.byteArrToStr(Synchronizr.parseField(arrx, ptr));
		var startTime = Synchronizr.byteArrToStr(Synchronizr.parseField(arrx, ptr));
		var gender = Synchronizr.byteArrToStr(Synchronizr.parseField(arrx, ptr));
		return { id, type, hTown, hMascot, hAbbr, gTown, gMascot, gAbbr, location, comments, startTime, gender };
	}

	setView(vid, dontLogon) {
		var t = this;
		if (vid == "admin" && !t.isAdmin) {
			if (!t.selectedView) {
				t.setView("scoreboard");
			}
			t.viewSelector.setSelected(t.selectedView);
			if (!dontLogon) {
				new Toast("Login required");
				t.showMainDialog("adminLogin");
			}
			return;
		}
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
		var h = selView.getHeaderElement();
		if (h) t.viewContainer.appendChild(h);
		t.viewContainer.appendChild(selView.getMainElement());
	}

	getSelectedView() {
		for (var v in this.views) {
			if (this.views[v][0] == this.selectedView)
				return this.views[v][1];
		}
		return this.NULL_VIEW;
	}

	onAdminScoreboardUpdate() {
		this.update();
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
	onSynchronizrVerification(result, uname, pw) {
		console.log(result, uname, pw);
		var bad = false;
		if (Dialog.isOpenById("adminLoginDlg")) {
			if (result) {
				Credentials.username = uname;
				Credentials.password = pw;
				Credentials.save();
				this.onAdminLoginDone();
			} else {
				bad = true;
			}
		}
		Dialog.removeById("adminLoginDlg");
		if (bad)
			this.showMainDialog("adminLogin", 1);
	}

	onSynchronizrPreConn() {

	}

	onSynchronizrStatusChange(readyState, buffered, status){
		var t = this;
		t.model.connStatus = {readyState, buffered, status};
		t.update();
	}

	onSynchronizrError(op) {
		var t = this, s = t.synchronizr;
		if (op == s.op.ERROR_CREDENTIALS_BT || op == s.op.ERROR_NOTADMIN_BT) {
			t.synchronizr.clearHashValidationPending();
			if (op != s.op.ERROR_CREDENTIALS_BT) // On credential error, don't blindly try and log on again
				t.synchronizr.reconnect();
			if (!Dialog.isOpenById("adminLoginDlg"))
				t.showMainDialog("adminLogin", 2);
		}
		else if (op == s.op.ERROR_NOTFOUND_BT) {
			Dialog.removeById("loadingStatsDlg");
			t.showMainDialog("eventList", 1);
		}
	}

	onSynchronizrHvDone() {
		Dialog.removeById("loadingStatsDlg");
	}

	onSynchronizrUpdate(s, d, e, sd, dd, ed) {
		var t = this;
		var type = Synchronizr.byteArrToStr(sd[0]);
		if (type == "list") {
			t.updateEvtSelAll(sd.slice(1));
		}
		else if (type == "bbgame") {
			Dialog.removeById("loadingStatsDlg");
			var needsPbpRl = false;
			if (s) {
				t.model.updateStaticData(sd);
				t.model.reloadRosters();
				needsPbpRl = true;
			} if (e === true) { // Event data modified beyond appending
				t.model.updateEventData(ed);
				needsPbpRl = true;
			} else if (typeof e == "number") {
				t.model.updateEventData(ed, e);
				for (var x = 0; x < e; x++)
					t.model.updateFromPBP(-1 - x);
			}
			if (needsPbpRl)
				t.model.reloadFromPBP();
			if (s || d || e) // Dynamic clock has highest priority, so is last
				t.model.updateDynamicData(dd);
			t.update();
		}
		// console.log(s, d, e);
	}
}