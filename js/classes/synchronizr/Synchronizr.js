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
        var t = this;
        t.op = SYNCHRONIZR_OPCODES();
    }

    constructor() {
        var t = this;
        t.CONSTANTS();
        t.setLocalData([], [], []);
        // t.setLocalDataClasses(null, null, null);
        t.setChannel(null);
        // t.setEventId(null);
    }

    // Set the ReliableChannel to use
    setChannel(c) {
        var t = this;
        t.channel = c;
        if (c) {
            c.setReceiveCallback(t.onChannelReceive.bind(t));
            c.setCloseCallback(t.onChannelClose.bind(t));
            c.setOpenCallback(t.onChannelOpen.bind(t));
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
    onChannelClose() {
        var t = this;
    }
    onChannelOpen() {
        var t = this;
        if (t.setEventIdPending) { // Set event ID if pending
            t.setEventIdPending = false;
            t.channel.write(t.op.SET_ID + t.toStr(t.eventId == null ? "" : t.eventId) + t.op.BEGIN_SYNC);
        }
    }

    // Set the sources for the Static, Dynamic, and Event lists
    setLocalData(s, d, e) {
        this.staticData = s;
        this.dynamicData = d;
        this.eventData = e;
    }

    reconnect(){
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


    // Set the eventID to use (or NULL for a list) and begin synchronization
    setEventId(id) {
        var t = this;
        t.eventId = id;
        if (!t.channel || !t.channel.isConnected())
            t.setEventIdPending = true;
        else
            t.channel.write(t.op.SET_ID + t.toStr(id == null ? "" : id) + t.op.BEGIN_SYNC);
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
        var ptr = 0, t = this, curArr, curASym, curCls;
        var change = { "S": false, "D": false, "E": false };
        while (ptr < arr.length) {
            var op = arr[ptr++];
            var opc = String.fromCharCode(op);
            switch (op) {
                case t.op.CLEAR_ALL_BT:
                    t.staticData.length = 0; t.dynamicData.length = 0; t.eventData.length = 0;
                    change["S"] = true; change["D"] = true; change["E"] = true;
                    break;
                case t.op.SELECT_STATIC_BT:
                    curArr = t.staticData; curASym = 'S'; break;
                case t.op.SELECT_DYNAMIC_BT:
                    curArr = t.dynamicData; curASym = 'D'; break;
                case t.op.SELECT_EVENT_BT:
                    curArr = t.eventData; curASym = 'E'; break;
                case t.op.APPEND_ITEM_BT:
                    var len = arr[ptr++] * 255 + arr[ptr++];
                    var idx = curArr.length;
                    var subArr = arr.subarray(ptr, ptr += len);
                    if (change[curASym] !== true)
                        change[curASym]++;
                    curArr[idx] = subArr;
                    break;
                case t.op.SET_ITEM_BT:
                    var idx = arr[ptr++] * 255 + arr[ptr++];
                    var len = arr[ptr++] * 255 + arr[ptr++];
                    var subArr = arr.subarray(ptr, ptr += len);
                    if (idx == curArr.length) {
                        if (change[curASym] !== true)
                            change[curASym]++;
                    }
                    else {
                        if (idx > curArr.length)
                            curArr[idx] = [];
                        change[curASym] = true;
                    }
                    curArr[idx] = subArr;
                    break;
            }
        }
        t.updateTarget(change['S'], change['D'], change['E']);
    }

    updateTarget(sChange, dChange, eChange){
        var t = this;
        t.updCbFn(sChange, dChange, eChange, t.staticData, t.dynamicData, t.eventData);
    }


    // Utility Functions
    // Convert a String into a length-prefixed string for sending
    toStr(s) {
        var l = s.length;
        if (l > 65533) throw "Input string too long"
        return String.fromCharCode(l >> 8) + String.fromCharCode(l & 0xFF) + s;
    }

    static byteArrToStr(ba){
        if(!ba) return;
        var rtn = "";
        for(var x = 0; x < ba.length; x++)
            rtn += String.fromCharCode(ba[x]);
        return rtn;
    }

    // Parse a field from a Uint8Array of Bytecode, given a by-reference pointer (ptra)
    static parseField(haystack, ptra){
        var ptr = ptra[0];
        var len = haystack[ptr++] * 256 + haystack[ptr++] & 0xFF;
        ptr += len;
        ptra[0] = ptr;
        return haystack.subarray(ptr-len, ptr);
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