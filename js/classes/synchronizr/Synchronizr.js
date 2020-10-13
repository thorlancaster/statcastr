function SYNCHRONIZR_OPCODES(){
    var op = {};
    op.SELECT_STATIC = "S".charCodeAt(0);
    op.SELECT_DYNAMIC = "D".charCodeAt(0);
    op.SELECT_EVENT = "E".charCodeAt(0);
    op.SET_ITEM = "s".charCodeAt(0);
    return op;
}

class Synchronizr{
    CONSTANTS(){
        var t = this;
        t.op = SYNCHRONIZR_OPCODES();
        t.OP_PING = "P"; // Message to send to server to check if still connected. Server should reply with same opcode.
        t.OP_SYNC = "S"; // .. To instruct the server to begin synchronizing. Send current state hashes along for more efficient sync.
                         // If no current hashes are sent, server will send all data to get in sync
        t.OP_SETEVENT = "E"; // Set event to listen to (by id)
        
    }

    constructor(){
        var t = this;
        t.CONSTANTS();
        t.setLocalData(null, null, null);
        t.setLocalDataClasses(null, null, null);

        // Current event to connect to. If null, a list of events will be requested.
        t.event = null;
    }

    setLocalData(s, d, e){
        this.staticData = s;
        this.dynamicData = d;
        this.eventData = e;
    }
    setLocalDataClasses(s, d, e){
        this.staticDataClass = s;
        this.dynamicDataClass = d;
        this.eventDataClass = e;
    }
    setUpdateCallback(f){
        this.updCbFn = f;
    }


    /**
     * Try to connect (and stay connected) to a given URL.
     * On failure, will retry periodically until destroy() ed.
     * @param {String} url 
     */
    connect(url){
        var t = this;
        t.url = url;
        t.resetTimer();
        t.initWebsocket();
    }

    setEvent(evt){
        t.event = evt;
    }

    /********************************** STATE MANAGEMENT **********************************/

    sync(){
        var t = this;
        t.state = t.SYNCHRONIZING; console.log("Synchronizing");
        t.ws.send(t.OP_SETEVENT + t.event);
        t.ws.send(t.OP_SYNC);
    }

    /********************************** (DE)SERIALIZATION **********************************/

    getSerializedFull(){
        var t = this;
        var s = t.getSerialized(t.staticData);
        var d = t.getSerialized(t.dynamicData);
        var e = t.getSerialized(t.eventData);
        var rtn = new Uint8Array(s.length + d.length + e.length + 9);
        var ptr = 0;
        ptr = PUTARR(rtn, s, ptr, 3);
        ptr = PUTARR(rtn, d, ptr, 3);
        ptr = PUTARR(rtn, e, ptr, 3);
        return rtn;
    }

    applySerializedFull(arr){
        var ptr = 0;
        var whichDat = 0;
        var s, d, e, t = this;
        while(ptr < arr.length){
            var len = arr[ptr++] * 65536 + arr[ptr++]*256 + arr[ptr++];
            var dat = new Uint8Array(len);
            for(var x = 0; x < len; x++)
                dat[x] = arr[ptr++];
            if(whichDat == 0) s = dat;
            if(whichDat == 1) d = dat;
            if(whichDat == 2) e = dat;
            whichDat++;
        }
        var sChange = t.applySerialized(t.staticData, 0, s, t.staticDataClass);
        var dChange = t.applySerialized(t.dynamicData, 0, d, t.dynamicDataClass);
        var eChange = t.applySerialized(t.eventData, 0, e, t.eventDataClass);
        t.updateTarget(sChange, dChange, eChange);
    }

    applyOpcodes(arr){
        var ptr = 0, t = this, curArr, curASym, curCls;
        var change = {"S": false, "D": false, "E": false};
        while(ptr < arr.length){
            var op = arr[ptr++];
            switch(op){
                case t.op.SELECT_STATIC:
                    curArr = t.staticData; curASym = 'S'; curCls = t.staticDataClass; break;
                case t.op.SELECT_DYNAMIC:
                    curArr = t.dynamicData; curASym = 'D'; curCls = t.dynamicDataClass; break;
                case t.op.SELECT_EVENT:
                    curArr = t.eventData; curASym = 'E'; curCls = t.eventDataClass; break;
                case t.op.SET_ITEM:
                    var idx = arr[ptr++] * 255 + arr[ptr++];
                    var len = arr[ptr++] * 255 + arr[ptr++];
                    var subArr = arr.subarray(ptr, ptr += len);
                    if(idx == curArr.length){
                        curArr[idx] = new curCls();
                        if(change[curASym] !== true)
                            change[curASym]++;
                    }
                    else{
                        if(idx > curArr.length)
                            curArr[idx] = new curCls();
                        change[curASym] = true;
                    }
                    curArr[idx].fromByteArray(subArr);
                break;
            }
        }
        t.updateTarget(change['S'], change['D'], change['E']);
    }

    updateTarget(sChange, dChange, eChange){
        this.updCbFn(sChange, dChange, eChange);
    }

    /**
     * Deserialize a Uint8Array into an array of Serializable Objects.
     * @param {Array} arr Array of Serializeable objects
     * @param {*} start First object to deserialize into. If null, appends
     * @param {Uint8Array} data Array of array-encoded serializations
     * @param {*} clazz Class to instantiate when creating new objects in arr
     * @returns true if any existing items modified, integer if items were appended, false otherwise
     */
    applySerialized(arr, start, data, clazz){
        if(start == null) start = arr.length;
        var ptr = 0;
        var nonAppend = false;
        var newObjCnt = 0;
        for(var x = start; ptr < data.length; x++){
            var itm = arr[x];
            var itmIsNew = false;
            if(itm == null){
                itm = new clazz();
                itmIsNew = true;
                if(arr[x-1] == null)
                    nonAppend = true;
                arr[x] = itm;
            }
            var len = data[ptr++] * 256 + data[ptr++];
            ptr += len;
            assert(ptr <= data.length, "Serialized array too short");
            itm.fromByteArray(data.subarray(ptr-len, ptr));
            if(!itmIsNew)
                nonAppend = true;
            else
                newObjCnt++;
        }
        if(nonAppend)
            return true;
        if(newObjCnt == 0)
            return false;
        return newObjCnt;
    }

    /**
     * Return the full serialized state of an Array of Serializable Objects.
     * NOTE: Each object has a max serialized size of 65535 bytes, going over will result
     * in corruption
     * @param {Array} arr Array of Serializeable objects
     * @param {Integer} start First object to serialize
     * @param {Integer} end Last object to serialize
     * @returns Uint8Array of array-encoded serializations of each object
     */
    getSerialized(arr, start, end){
        var rtnx = [];
        var len = 0;
        if(start == null) start = 0;
        if(end == null) end = arr.length;
        for(var x = start; x < end; x++){
            var ba = arr[x].toByteArray();
            len += ba.length;
            len += 2;
            rtnx.push(ba);
        }
        var rtn = new Uint8Array(len);
        var ptr = 0;
        for(var x = 0; x < rtnx.length; x++){
            var itm = rtnx[x];
            rtn[ptr++] = itm.length >> 8;
            rtn[ptr++] = itm.length;
            for(var y = 0; y < itm.length; y++){
                rtn[ptr++] = itm[y];
            }
        }
        return rtn;
    }
    /**
     * Return an Array of Uint8Arrays for an array of Serializable Objects.
     * Same as getSerialized() but returns an Array of Arrays instead of a concatenation.
     * @param {Array} arr Array of Serializeable objects
     * @param {Integer} start First object to serialize
     * @param {Integer} end Last object to serialize
     * @returns Uint8Array of array-encoded serializations of each object
     */
    getSerializedArray(arr, start, end){
        var rtnx = [];
        if(start == null) start = 0;
        if(end == null) end = arr.length;
        for(var x = start; x < end; x++){
            var ba = arr[x].toByteArray();
            rtnx.push(ba);
        }
        return rtnx;
    }

    getDeserialized(arr, clazz){
        var rtn = [];
        var ptr = 0;
        while(ptr < arr.length){
            var len = arr[ptr++]*256 + arr[ptr++];
            rtn.push(this.getDeserializedObject(arr.slice(ptr, ptr+len), clazz));
            ptr += len;
        }
        return rtn;
    }
    getDeserializedObject(ser, clazz){
        var rtn = new clazz();
        rtn.fromByteArray(ser);
        return rtn;
    }
}

class SynchronizrState{
    constructor(){
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
    update(s, d, e){
        var t = this;
        var sa = t.updateSub(s, t.static, t.op.SELECT_STATIC);
        var sd = t.updateSub(d, t.dynamic, t.op.SELECT_DYNAMIC);
        var se = t.updateSub(e, t.event, t.op.SELECT_EVENT);
        var rtn = new Uint8Array(sa.length + sd.length + se.length);
        var ptr = 0;
        for(var x = 0; x < sa.length; x++) rtn[ptr++] = sa[x];
        for(var x = 0; x < sd.length; x++) rtn[ptr++] = sd[x];
        for(var x = 0; x < se.length; x++) rtn[ptr++] = se[x];
        return rtn;
    }
    updateSub(srcArr, destArr, listSelOp){
        var t = this;
        var bytecode = [];
        bytecode.push(listSelOp);
        for(var x = 0; x < srcArr.length; x++){
            var same = true;
            var srcEl = srcArr[x];
            var destEl = destArr[x];
            if(destEl == null)
                same = false;
            else if(srcEl.length != destEl.length)
                same = false;
            else for(var y = 0; y < srcEl.length; y++){
                if(srcEl[y] != destEl[y]){
                    same = false;
                    break;
                }
            }
            if(same == false){
                destArr[x] = new Uint8Array(srcEl);
                var addr = x;
                var len = srcEl.length;
                bytecode.push(t.op.SET_ITEM);
                bytecode.push(addr >> 8, addr);
                bytecode.push(len >> 8, len);
                for(var i = 0; i < len; i++){
                    bytecode.push(srcEl[i]);
                }
            }
        }
        if(bytecode.length > 1)
            return new Uint8Array(bytecode);
        return new Uint8Array(0);
    }
}

// setTimeout(function(){
//     var p1 = new BasketballPBPItem(1, 1234, "21", false, BasketballPlayType.DUNK_MADE);
//     var p2 = new BasketballPBPItem(1, 420, "12", true, BasketballPlayType.P3_MADE);
//     var p3 = new BasketballPBPItem(1, 69, "11", false, BasketballPlayType.DUNK_MADE);
//     var plays = [p1, p2, p3];
//     var sc = new Synchronizr();
//     console.log(plays);
//     console.log(sc.getSerialized(plays));
//     console.log(sc.getDeserialized(sc.getSerialized(plays), BasketballPBPItem));
//   }, 1);