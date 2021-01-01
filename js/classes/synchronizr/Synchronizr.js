function SYNCHRONIZR_OPCODES() {
	var op = {};
	// General
	op.NULL = " ";
	op.EOF = "@";
	// Preconfiguration (Client sends these before sync)
	op.SET_ID = "$";
	op.SET_HASH = "#";
	op.BEGIN_SYNC = "!";
	op.CLEAR_ALL = "C";
	// List selection
	op.SELECT_STATIC = "S";
	op.SELECT_DYNAMIC = "D";
	op.SELECT_EVENT = "E";
	op.SET_ITEM = "s";
	op.APPEND_ITEM = "a";
	op.SET_RANGE = "r";
	op.SET_LENGTH = "l";
	op.START_DBL_BUFFER = "d";
	op.END_DBL_BUFFER = "e";
	op.REQUEST_ADMIN = "X";
	op.LEAVE_ADMIN = "U";
	op.VERIFY_PASSWORD_REQ = "W";
	op.VERIFY_PASSWORD_RESP = "w";
	op.VALIDATE_HASH_REQ = "H";
	op.VALIDATE_HASH_RESP = "h";
	op.TRUE = "T";
	op.FALSE = "F";
	op.ERROR = "R";
	op.ERROR_UNKNOWN = "?";
	op.ERROR_CREDENTIALS = "C";
	op.ERROR_NOTADMIN = "A";
	op.ERROR_NOTFOUND = "4";

	op.NULL_BT = op.NULL.charCodeAt(0);
	op.EOF_BT = op.EOF.charCodeAt(0);
	op.SET_ID_BT = op.SET_ID.charCodeAt(0);
	op.SET_HASH_BT = op.SET_HASH.charCodeAt(0);
	op.BEGIN_SYNC_BT = op.BEGIN_SYNC.charCodeAt(0);
	op.CLEAR_ALL_BT = op.CLEAR_ALL.charCodeAt(0);
	op.SELECT_STATIC_BT = op.SELECT_STATIC.charCodeAt(0);
	op.SELECT_DYNAMIC_BT = op.SELECT_DYNAMIC.charCodeAt(0);
	op.SELECT_EVENT_BT = op.SELECT_EVENT.charCodeAt(0);
	op.SET_ITEM_BT = op.SET_ITEM.charCodeAt(0);
	op.APPEND_ITEM_BT = op.APPEND_ITEM.charCodeAt(0);
	op.SET_RANGE_BT = op.SET_RANGE.charCodeAt(0);
	op.SET_LENGTH_BT = op.SET_LENGTH.charCodeAt(0);
	op.START_DBL_BUFFER_BT = op.START_DBL_BUFFER.charCodeAt(0);
	op.END_DBL_BUFFER_BT = op.END_DBL_BUFFER.charCodeAt(0);
	op.REQUEST_ADMIN_BT = op.REQUEST_ADMIN.charCodeAt(0);
	op.LEAVE_ADMIN_BT = op.LEAVE_ADMIN.charCodeAt(0);
	op.VALIDATE_HASH_REQ_BT = op.VALIDATE_HASH_REQ.charCodeAt(0);
	op.VALIDATE_HASH_RESP_BT = op.VALIDATE_HASH_RESP.charCodeAt(0);
	op.VERIFY_PASSWORD_REQ_BT = op.VERIFY_PASSWORD_REQ.charCodeAt(0);
	op.VERIFY_PASSWORD_RESP_BT = op.VERIFY_PASSWORD_RESP.charCodeAt(0);
	op.TRUE_BT = op.TRUE.charCodeAt(0);
	op.FALSE_BT = op.FALSE.charCodeAt(0);
	op.ERROR_BT = op.ERROR.charCodeAt(0);
	op.ERROR_UNKNOWN_BT = op.ERROR_UNKNOWN.charCodeAt(0);
	op.ERROR_CREDENTIALS_BT = op.ERROR_CREDENTIALS.charCodeAt(0);
	op.ERROR_NOTADMIN_BT = op.ERROR_NOTADMIN.charCodeAt(0);
	op.ERROR_NOTFOUND_BT = op.ERROR_NOTFOUND.charCodeAt(0);

	return op;
}

/**
 * Class to keep two sets of lists synchronized over a reliable transport channel
 * There are three lists: Static, Dynamic, and Event
 *  Static is used for information that won't change often, such as team names
 *  Dynamic is used for information that can change almost constantly, such as clock status
 *  Event is used for primarily append-only information, often just the play-by-play
 */
class Synchronizr {
	CONSTANTS() {
		this.op = SYNCHRONIZR_OPCODES();
	}

	constructor() {
		var t = this;
		t.CONSTANTS();
		t.remoteState = { staticData: [], dynamicData: [], eventData: [] };
		t.isAdmin = false;
		t.setLocalData([], [], []);
		// t.setLocalDataClasses(null, null, null);
		t.setChannel(null);
		// t.setEventId(null);

		t.txTimer = null;
		t.autoSend = true; // If true, auto-send data on a timer if necessary
	}
	end() {
		stopTimer();
	}

    /**
     * Set whether the client is an admin or not
     * @param {Boolean} adm 
     */
	setAdmin(adm) {
		var t = this;
		if (t.isAdmin != adm) {
			t.isAdmin = adm;
			if (adm) {
				t.channel.write(t.op.REQUEST_ADMIN + t.getCredential());
			} else {
				t.channel.write(t.op.LEAVE_ADMIN);
			}
		}
	}

	/**
	 * Get Credential bytecode, used for the setEvent and beginVerifyPassword functions
	 * @param {String} uname Username. If blank / null, stored username is used
	 * @param {String} pw Password. If blank / null, stored password is used
	 */
	getCredential(uname, pw) {
		var cred = Credentials;
		var u = uname ? uname : cred.username;
		var p = pw ? pw : cred.password;
		if (u.length > 255) u = u.substring(0, 255);
		if (p.length > 255) p = p.substring(0, 255);
		return "\x00" + String.fromCharCode(u.length) + u + '\x00' + String.fromCharCode(p.length) + p;
	}

	startTxTimer() {
		var t = this;
		if (!t.txTimer)
			t.txTimer = setInterval(function () {
				if (t.pushToTarget(t.txTimerBytes))
					t.stopTxTimer();
			}, 100);
	}
	stopTxTimer() {
		var t = this;
		if (t.txTimer)
			clearInterval(t.txTimer);
		t.txTimer = null;
	}

	// Set the ReliableChannel to use
	setChannel(c) {
		var t = this;
		t.channel = c;
		if (c) {
			c.setInitCallback(t.onChannelInit.bind(t));
			c.setReceiveCallback(t.onChannelReceive.bind(t));
			c.setCloseCallback(t.onChannelClose.bind(t));
			c.setOpenCallback(t.onChannelOpen.bind(t));
			c.setStatusChangeCallback(t.onChannelStaChg.bind(t));
		}
	}

	// Event handlers
	onChannelReceive() {
		while (this.channel.available()) {
			this.onChannelMessage(this.channel.read())
		}
	}
	onChannelMessage(txt) {
		this.applyOpcodes(txt);
	}
	onChannelStaChg(x, y, z){
		if(this.staChgCallback)
			this.staChgCallback(x, y, z);
	}
	onChannelClose() {
		var t = this;
		console.log("Channel Closed");
		// When the channel dies, get set up for a reconnection
		t.setEventIdPending = true;
		if (t.isAdmin)
			t.hashValidationPending = true;
	}
	onChannelInit() {
		console.log("Channel Init");
	}
	onChannelOpen() {
		var t = this;
		var seip = false;
		if (t.setEventIdPending || t.hashValidationPending) { // Set event ID if pending
			seip = true;
			t.setEventIdPending = false;
			t.setEventId(t.eventId, t.isAdmin);
		}
		if (t.verifyPasswordPending) {
			// t.verifyPasswordPending = false;
			t.beginVerifyPassword(t._vp_un, t._vp_pw);
		}
		if (t.hashValidationPending) { // Perform hash validation if pending
			// t.hashValidationPending = false;
			// TODO was using true but it resulted in Hundefinedundefinedundefined
			t.beginHashValidation(false);
		}
	}

	// Set the sources for the Static, Dynamic, and Event lists
	setLocalData(s, d, e) {
		this.staticData = s;
		this.dynamicData = d;
		this.eventData = e;
	}

	// Clear hash validation pending. Call after getting and error and before reconnecting
	// To avoid a never-ending stream of errors
	clearHashValidationPending() {
		this.hashValidationPending = false;
	}

	reconnect() {
		this.channel.reconnect();
	}

	// // Set the deserialization Classes for the Static, Dynamic, and Event lists
	// setLocalDataClasses(s, d, e) {
	//     this.staticDataClass = s;
	//     this.dynamicDataClass = d;
	//     this.eventDataClass = e;
	// }

	// Set the function that will be called when we have new data
	setUpdateCallback(f) {
		this.updCbFn = f;
	}

	// Set the function that will be called when password is verified (good or bad)
	setVerificationCallback(f) {
		this.verCbFn = f;
	}

	// Set the function that will be called immediately after the connection opens, but before the hash comparison
	setPreConnectionCallback(f) {
		this.precCbFn = f;
	}

	setHashValidationDoneCallback(f){
		this.hvDoneCbFn = f;
	}

	// See ReliableChannel
    setStatusChangeCallback(cb){
        this.staChgCallback = cb;
	}

	// Set the function that will be called when an error occurs
	setErrorCallback(f) {
		this.errCbFn = f;
	}


    /**
     * Set the event to listen to. If null, a list of events will be requested
     * @param {String} id 
     * @param {Boolean} isAdmin If true, connect as an administrator instead of a guest
     */
	setEventId(id, isAdmin) {
		var t = this;
		t.eventId = id;
		t.isAdmin = isAdmin;
		if (!t.channel || !t.channel.isConnected())
			t.setEventIdPending = true;
		else {
			if (isAdmin) {
				t.channel.write(
					t.op.REQUEST_ADMIN + t.getCredential() +
					t.op.SET_ID +
					t.toStr(id == null ? "" : id));
			} else {
				t.channel.write(t.op.SET_ID + t.toStr(id == null ? "" : id) + t.op.BEGIN_SYNC);
			}
		}
	}

	/**
	 * Call this function when the connection status widget is clicked.
	 * Some connections (Bluetooth) require user interaction for permission
	 * to access priviliged functionality
	 */
	onConnClick(){
		this.channel.onConnClick();
	}

	// State parsing
	// Apply a sequence of opcodes from server to this instance
	applyOpcodes(str) {
		var buf = new Uint8Array(str.length);
		for (var x = 0; x < str.length; x++)
			buf[x] = str.charCodeAt(x);
		this.parseBytecode(buf);
	}
	parseBytecode(arr) {
		var ptr = 0, t = this, curArr, curASym, curRemArr;
		var change = { "S": false, "D": false, "E": false };
		while (ptr < arr.length) {
			var op = arr[ptr++];
			var r = t.remoteState;
			switch (op) {
				case t.op.ERROR_BT:
					t.invokeErrorCallback(arr[ptr++]);
					break;
				case t.op.VALIDATE_HASH_RESP_BT:
					var hRes = arr[ptr++]; // Hash comparison result. 1 byte res, 16 byte id
					var hId = Synchronizr.byteArrToStr(arr.subarray(ptr, ptr += 16));
					t.finishHashValidation(hRes, hId);
					break;
				case t.op.VERIFY_PASSWORD_RESP_BT:
					var result = arr[ptr++] == t.op.TRUE_BT;
					var len = arr[ptr++] * 255 + arr[ptr++];
					var uname = Synchronizr.byteArrToStr(arr.subarray(ptr, ptr += len));
					len = arr[ptr++] * 255 + arr[ptr++];
					var pw = Synchronizr.byteArrToStr(arr.subarray(ptr, ptr += len));
					t.finishVerifyPassword(result, uname, pw);
					break;
				case t.op.CLEAR_ALL_BT:
					t.staticData.length = 0; t.dynamicData.length = 0; t.eventData.length = 0;
					r.staticData.length = 0; r.dynamicData.length = 0; r.eventData.length = 0;
					change["S"] = true; change["D"] = true; change["E"] = true;
					break;
				case t.op.SELECT_STATIC_BT:
					curArr = t.staticData; curASym = 'S'; curRemArr = r.staticData; break;
				case t.op.SELECT_DYNAMIC_BT:
					curArr = t.dynamicData; curASym = 'D'; curRemArr = r.dynamicData; break;
				case t.op.SELECT_EVENT_BT:
					curArr = t.eventData; curASym = 'E'; curRemArr = r.eventData; break;
				case t.op.APPEND_ITEM_BT:
					var len = arr[ptr++] * 255 + arr[ptr++];
					var idx = curArr.length;
					var subArr = arr.subarray(ptr, ptr += len);
					if (change[curASym] !== true)
						change[curASym]++;
					curArr[idx] = subArr;
					curRemArr[idx] = subArr; // TODO might need to copy array. Probably not
					break;
				case t.op.SET_LENGTH_BT:
					var len = arr[ptr++] * 255 + arr[ptr++];
					curArr.length = len;
					curRemArr.length = len;
					change[curASym] = true;
					break;
				case t.op.SET_ITEM_BT:
					var idx = arr[ptr++] * 255 + arr[ptr++];
					var len = arr[ptr++] * 255 + arr[ptr++];
					var subArr = arr.subarray(ptr, ptr += len);
					if (idx == curArr.length) { // TODO might be a bug here from not doing curRemArr. Probably not.
						if (change[curASym] !== true)
							change[curASym]++;
					}
					else {
						if (idx > curArr.length)
							curArr[idx] = [];
						change[curASym] = true;
					}
					curArr[idx] = subArr;
					curRemArr[idx] = subArr;
					break;
				case t.op.EOF_BT: // EOF to signal end of sync
					break;
				default:
					console.warn("Invalid opcode: " + op);
			}
		}
		if (change['S'] || change['D'] || change['E'])
			t.updateLocalAndStorage(change['S'], change['D'], change['E']);
	}

	updateLocalAndStorage(sChange, dChange, eChange) {
		this.updateLocal(sChange, dChange, eChange);
		this.updateStorage(this.eventId, sChange, dChange, eChange);
	}
	updateStorage(eventId, sChange, dChange, eChange) {
		var t = this;
		if (sChange) { t.updateStorage0(eventId + "-s", t.staticData, sChange); }
		if (dChange) { t.updateStorage0(eventId + "-d", t.dynamicData, dChange); }
		if (eChange) { t.updateStorage0(eventId + "-e", t.eventData, eChange); }
	}

    /**
     * Loads an event from storage, and then optionally reloads the local state via updateLocal()
     * @param {String} eventId 
     * @param {Boolean} updateLocal True to update the local state. If omitted, defaults to true
	 * @param {Object} template [Optional] If the event is not found, [static, dynamic, event] data will be copied from this object
     */
	loadFromStorage(eventId, updateLocal, template) {
		var t = this;
		t.staticData = t.loadFromStorage0(eventId + "-s");
		t.dynamicData = t.loadFromStorage0(eventId + "-d");
		t.eventData = t.loadFromStorage0(eventId + "-e");
		if(t.staticData.length == 0 && t.dynamicData.length == 0 && t.eventData.length == 0 && template){
			t.staticData = [...template.static];
			t.dynamicData = [...template.dynamic];
			t.eventData = [...template.event];
		}
		if (updateLocal != false)
			t.updateLocal(true, true, true);
	}
	canLoadFromStorage(eventId){
		var t = this;
		return t.loadFromStorage0(eventId + "-s",  true)
		|| t.loadFromStorage0(eventId + "-d",  true)
		|| t.loadFromStorage0(eventId + "-e",  true);
	}
    /**
     * Save an array to local storage.
     * Array will be sharded into a series of chunks named {key}-0, {key}-1, etc.
     * @param {String} key 
     * @param {Array<Uint8Array>} arr 
     * @param {*} chg 
     */
	updateStorage0(key, arr, chg) {
		var t = this;
		var lim = 1024; // Bytes per entry
		var shardNum = 0;
		var shardArr = [];
		var shardPtr = 0;
		for (var x = 0; x < arr.length; x++) {
			var itm = arr[x];
			var len = itm.length;
			if (shardArr.length > 0 && len + shardArr.length + 2 > lim) {
				localStorage.setItem(key + shardNum++, Synchronizr.byteArrToStr(shardArr));
				shardArr.length = 0;
				shardPtr = 0;
			}
			shardArr[shardPtr++] = len >> 8;
			shardArr[shardPtr++] = len & 0xFF;
			Synchronizr.memcpy(shardArr, itm, shardPtr, len);
			shardPtr += len;
			// console.log(arr[x]);
		}
		if (shardArr.length > 0) {
			localStorage.setItem(key + shardNum++, Synchronizr.byteArrToStr(shardArr));
		}
		while (1) {
			if (!localStorage.getItem(key + shardNum))
				break;
			localStorage.removeItem(key + shardNum++);
		}
		// console.log(key, arr, chg);
	}
    /**
     * Load and return an array from local storage
     * @param {String} key
	 * @param {Boolean} test True to test if loading is possible, but not load
     */
	loadFromStorage0(key, test) {
		var shardNum = 0;
		var rtn = [];
		while (1) {
			var shard = localStorage.getItem(key + shardNum++);
			if (!shard) break;
			else if(test) return true;
			var shardPtr = 0;
			while (shardPtr < shard.length) {
				var len = shard.charCodeAt(shardPtr++) + shard.charCodeAt(shardPtr++);
				var arr = new Uint8Array(len);
				for (var x = 0; x < len; x++) {
					arr[x] = shard.charCodeAt(shardPtr++);
				}
				rtn.push(arr);
			}
		}
		return rtn;
	}

	invokeErrorCallback(errCode) {
		if (this.errCbFn)
			this.errCbFn(errCode);
	}
	invokeHashValDoneCallback(){
		if (this.hvDoneCbFn)
			this.hvDoneCbFn();
	}
	invokePreConnectionCallback() {
		if (this.precCbFn)
			this.precCbFn();
	}

	/**
	 * Begin the process of password validation with the server. The server will (eventually) return
	 * the result of the verify operation, along with what the credentials were.
	 */
	beginVerifyPassword(uname, pw) {
		var t = this;
		if (!t.channel || !t.channel.isConnected()) {
			t.verifyPasswordPending = true;
			t._vp_un = uname;
			t._vp_pw = pw;
		}
		else {
			t.channel.write(t.op.VERIFY_PASSWORD_REQ + t.getCredential(uname, pw));
		}
	}

	finishVerifyPassword(result, username, password) {
		var t = this;
		t.verifyPasswordPending = false;
		if (t.verCbFn)
			t.verCbFn(result, username, password);
	}

    /**
     * Begin the process of hash validation with the server. If hash validation fails,
     * failing parts will be force-updated from the client to the server.
     * You should only call this function if you are admin.
     * If not connected, hash validation will start when the connection opens
     * @param noUpdate True to not update internal hash state; sends a duplicate of the last attempt
     */
	beginHashValidation(noUpdate) {
		var t = this;
		if(!t.isAdmin){
			console.warn("Must be admin for beginHashValidation");
			return;
		}
		if (!noUpdate) {
			t._hv_sh = t.getHash(t.staticData).substring(0, 16);
			t._hv_dh = t.getHash(t.dynamicData).substring(0, 16);
			t._hv_eh = t.getHash(t.eventData).substring(0, 16);
			t._hv_id = t.getHash(Math.random()).substring(0, 16);
		}
		if (!t.channel || !t.channel.isConnected())
			t.hashValidationPending = true;
		else {
			t.channel.write(t.op.VALIDATE_HASH_REQ + t._hv_sh + t._hv_dh + t._hv_eh + t._hv_id);
		}
	}
    /**
     * Called by parseBytecode() when a hash validation response packet is received.
     * Updates the [static, dynamic, event] data if it doesn't match.
     * @param {Byte} flags Byte with highest bits set for [static, dynamic, event] data match
     * @param {String} id To ensure that the received packet came from the last sent one
     */
	finishHashValidation(flags, id) {
		var t = this;
		t.hashValidationPending = false;
		if (id != t._hv_id)
			return;
		var r = t.remoteState;
		var sSame = (flags & 128) > 0;
		var dSame = (flags & 64) > 0;
		var eSame = (flags & 32) > 0;
		console.log("[SYN] Hash Validation sSame=" + sSame + ", dSame=" + dSame + ", eSame=" + eSame);
		if (!sSame) r.staticData.length = 0;
		else r.staticData = [...t.staticData];
		if (!dSame) r.dynamicData.length = 0;
		else r.dynamicData = [...t.dynamicData];
		if (!eSame) r.eventData.length = 0;
		else r.eventData = [...t.eventData];
		t.pushToTarget(0);
		t.invokeHashValDoneCallback();
	}
	getHash(arr) {
		var all = [];
		for (var x = 0; x < arr.length; x++) {
			for (var y = 0; y < arr[x].length; y++) {
				all.push(arr[x][y]);
			}
			all.push(0);
		}
		return md5(Synchronizr.byteArrToStr(all));
	}

	updateLocal(sChange, dChange, eChange) {
		var t = this;
		t.updCbFn(sChange, dChange, eChange, t.staticData, t.dynamicData, t.eventData);
	}

    /**
     * Update internal state to match state of an object (such as a GameModel).
     * Also saves state to LocalStorage
     * @param {Object} model Object that implements the Synchronizr Compatibility interface
	 * @param {Boolean} skipLocalStorage Defaults to false
     */
	updateFromModel(model, skipLocalStorage) {
		var t = this, si = false, di = false, ei = false;
		if (model.isStaticInvalid()) {
			si = true;
			t.mergeArrs(t.staticData, model.getStaticData());
			model.revalidateStatic();
		}
		if (model.isEventInvalid()) {
			ei = true;
			t.mergeArrs(t.eventData, model.getEventData());
			model.revalidateEvent();
		}
		if (model.isDynamicInvalid()) {
			di = true;
			t.mergeArrs(t.dynamicData, model.getDynamicData());
			model.revalidateDynamic();
		}
		// TODO handle partial saves more efficiently
		if(skipLocalStorage != true)
			t.updateStorage(t.eventId, si, di, ei);
	}
	mergeArrs(dest, src) {
		for (var x = 0; x < src.length; x++) {
			if (src[x] != null)
				dest[x] = src[x];
		}
		if (dest.length > src.length)
			dest.length = src.length;
	}

    /**
     * Push the difference between this and the simulated target up the channel.
     * If auto-send is enabled (default), additional chunks will be sent automatically
     * @param {Integer} limBytes Max number of bytes soft-allowed to send.
     *      If omitted it will be strategically chosen. If zero, it means infinity.
     * @returns {Boolean} true if the synchronization is complete, false if the
     *      synchronization needs to send more, null if the channel is full
     */
	pushToTarget(limBytes) {
		var t = this;
		if (!t.channel.canWrite()) {
			new Toast("Can't write, channel full / broken");
			return null;
		}
		if (limBytes == null)
			limBytes = t.channel.canWrite();
		var x = t.generateBytecode(t.remoteState, limBytes);
		var dirty = x[0];
		var msg = x[1];
		if (msg.length)
			t.channel.write(Synchronizr.byteArrToStr(msg));
		if (t.autoSend && dirty) {
			t.txTimerBytes = limBytes;
			t.startTxTimer();
		}
		return !dirty;
	}

	// State unparsing
    /**
     * Generate bytecode to bring another state in sync with this Synchronizr
     * @param {Object} otherState Simulated state of other end, gets modified during call
     * @param {Integer} limBytes Max number of bytes soft-allowed to send. If omitted or zero, it means infinity.
     * @returns a Tuple of (SyncDirty, Bytecode)
     */
	generateBytecode(otherState, limBytes) {
		var o = otherState;
		var t = this;
		var rtn = [];
		var sLen = o.staticData.length;
		var dLen = o.dynamicData.length;
		var eLen = o.eventData.length;
		var x = t._generateBytecode0(t.staticData, o.staticData, limBytes, rtn.length);
		var db1 = x[0], sDiff = x[1];
		if (sDiff.length) {
			rtn.push(t.op.SELECT_STATIC_BT);
			if (sLen == 0)
				rtn.push(t.op.SET_LENGTH_BT, 0, 0);
			rtn = rtn.concat(sDiff);
		}
		x = t._generateBytecode0(t.eventData, o.eventData, limBytes, rtn.length);
		var db2 = x[0], eDiff = x[1];
		if (eDiff.length) {
			rtn.push(t.op.SELECT_EVENT_BT);
			if (eLen == 0)
				rtn.push(t.op.SET_LENGTH_BT, 0, 0);
			rtn = rtn.concat(eDiff);
		}
		x = t._generateBytecode0(t.dynamicData, o.dynamicData, limBytes, rtn.length);
		var db3 = x[0], dDiff = x[1];
		if (dDiff.length) {
			rtn.push(t.op.SELECT_DYNAMIC_BT);
			if (dLen == 0)
				rtn.push(t.op.SET_LENGTH_BT, 0, 0);
			rtn = rtn.concat(dDiff);
		}
		return [db1 || db2 || db3, rtn];
	}

    /**
     * Generate bytecode for the difference on one corresponding array
     * @param {Array} data Synchronizr Data array (typically Static, Dynamic, or Event)
     * @param {Array} otherData Synchronizr Data array that represents target
     * @param {Integer} limBytes Max number of bytes soft-allowed to send
     * @param {Integer} usedBytes Bytes already consumed
     * @returns a Tuple of (SyncDirty, Bytecode)
     */
	_generateBytecode0(data, otherData, limBytes, usedBytes) {
		var t = this;
		var rtn = [];
		var dirtyBreak = false; // True = had to break early because byte limit exceeded
		for (var x = 0; x < data.length; x++) {
			var datum = data[x];
			var oDatum = otherData[x];
			var len = datum.length;
			if (t._arreq(datum, oDatum)) continue;
			if (x == otherData.length) { // Append
				if (!t._genBChk(usedBytes + rtn.length, 3 + len, limBytes)) {
					dirtyBreak = true;
					break;
				}
				rtn.push(t.op.APPEND_ITEM_BT);
				rtn.push((len >> 8));
				rtn.push((len & 0xFF));
				for (var i = 0; i < len; i++)
					rtn.push(datum[i]);
				otherData[x] = datum;
			} else { // Set item
				if (!t._genBChk(usedBytes + rtn.length, 5 + len, limBytes)) {
					dirtyBreak = true;
					break;
				}
				rtn.push(t.op.SET_ITEM_BT);
				rtn.push((x >> 8));
				rtn.push((x & 0xFF));
				rtn.push((len >> 8));
				rtn.push((len & 0xFF));
				for (var i = 0; i < len; i++)
					rtn.push(datum[i]);
				otherData[x] = datum;
			}
		}
		if (!dirtyBreak && otherData.length != data.length) {
			otherData.length = data.length;
			rtn.push(t.op.SET_LENGTH_BT);
			rtn.push(data.length >> 8);
			rtn.push(data.length & 0xFF);
		}
		return [dirtyBreak, rtn];
	}
	_arreq(arr1, arr2) {
		if (arr1 == null && arr2 == null)
			return true;
		if (arr1 == null || arr2 == null || arr1.length != arr2.length)
			return false;
		for (var x = 0; x < arr1.length; x++)
			if (arr1[x] != arr2[x])
				return false;
		return true;
	}
	_genBChk(used, alloc, limit) {
		if (used == 0 || limit == 0)
			return true;
		if (used + alloc > limit)
			return false;
		return true;
	}


	// Utility Functions
	// Convert a String into a length-prefixed string for sending
	toStr(s) {
		var l = s.length;
		if (l > 65533) throw "Input string too long"
		return String.fromCharCode(l >> 8) + String.fromCharCode(l & 0xFF) + s;
	}

	static byteArrToStr(ba) {
		if (!ba) return;
		var rtn = "";
		for (var x = 0; x < ba.length; x++)
			rtn += String.fromCharCode(ba[x]);
		return rtn;
	}

	static strToByteArr(str) {
		if (!str) return new Uint8Array(0);
		var rtn = new Uint8Array(str.length);
		for (var x = 0; x < str.length; x++)
			rtn[x] = str.charCodeAt(x);
		return rtn;
	}

	static joinArrs(arrs) {
		var len = 0;
		for (var x = 0; x < arrs.length; x++)
			len += (arrs[x].length + 2);
		var rtn = new Uint8Array(len);
		len = 0;
		for (var x = 0; x < arrs.length; x++) {
			var llen = arrs[x].length;
			rtn[len++] = llen >> 8;
			rtn[len++] = llen & 0xFF;
			for (var i = 0; i < llen; i++)
				rtn[len++] = arrs[x][i];
		}
		return rtn;
	}

    /**
     * Implementation (sort of) of std::memcpy()
     * @param {Array} dest Destination array
     * @param {Array} src Source array
     * @param {Integer} start Offset
     * @param {Integer} sz Length
     */
	static memcpy(dest, src, start, sz) {
		for (var x = 0; x < sz; x++)
			dest[start + x] = src[x];
	}

	// Parse a field from a Uint8Array of Bytecode, given a by-reference pointer (ptra)
	static parseField(haystack, ptra) {
		var ptr = ptra[0];
		var len = haystack[ptr++] * 256 + haystack[ptr++] & 0xFF;
		ptr += len;
		ptra[0] = ptr;
		return haystack.subarray(ptr - len, ptr);
	}
}

class SynchronizrState {
	constructor() {
		var t = this;
		t.static = [];
		t.dynamic = [];
		t.event = [];

		t.op = SYNCHRONIZR_OPCODES();
	}
    /**
     * Update the state of this object to match the provided states.
     * @param {Array} s Array of Static items, each is a Uint8Array
     * @param {Array} d Array of Dynamic items, ...
     * @param {Array} e Array of Event items, ...
     * @returns Uint8Array of Statcastr Opcodes and commands
     */
	update(s, d, e) {
		var t = this;
		var sa = t.updateSub(s, t.static, t.op.SELECT_STATIC);
		var sd = t.updateSub(d, t.dynamic, t.op.SELECT_DYNAMIC);
		var se = t.updateSub(e, t.event, t.op.SELECT_EVENT);
		var rtn = new Uint8Array(sa.length + sd.length + se.length);
		var ptr = 0;
		for (var x = 0; x < sa.length; x++) rtn[ptr++] = sa[x];
		for (var x = 0; x < sd.length; x++) rtn[ptr++] = sd[x];
		for (var x = 0; x < se.length; x++) rtn[ptr++] = se[x];
		return rtn;
	}
	updateSub(srcArr, destArr, listSelOp) {
		var t = this;
		var bytecode = [];
		bytecode.push(listSelOp);
		for (var x = 0; x < srcArr.length; x++) {
			var same = true;
			var srcEl = srcArr[x];
			var destEl = destArr[x];
			if (destEl == null)
				same = false;
			else if (srcEl.length != destEl.length)
				same = false;
			else for (var y = 0; y < srcEl.length; y++) {
				if (srcEl[y] != destEl[y]) {
					same = false;
					break;
				}
			}
			if (same == false) {
				destArr[x] = new Uint8Array(srcEl);
				var addr = x;
				var len = srcEl.length;
				bytecode.push(t.op.SET_ITEM);
				bytecode.push(addr >> 8, addr);
				bytecode.push(len >> 8, len);
				for (var i = 0; i < len; i++) {
					bytecode.push(srcEl[i]);
				}
			}
		}
		if (bytecode.length > 1)
			return new Uint8Array(bytecode);
		return new Uint8Array(0);
	}
}