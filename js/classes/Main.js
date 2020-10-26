// This class's constructer is called by the loader after everything is loaded.
class Main{
    // Like public static void main(String[] args)
    constructor(){
        var t = this;
        window.MAIN = this;
        t.MOBILE_WIDTH = 780; // If narrower, mobile layout is used
        t.mobile = (window.innerWidth < t.MOBILE_WIDTH);
        t.sc = new StatcastrApp(DGE(APP_ROOT));
        t.syn = new Synchronizr();
        t.syn.setLocalData(t.sc.getStaticData(), t.sc.getDynamicData(), t.sc.getEventData());
        t.syn.setLocalDataClasses(t.sc.getStaticDataClass(), t.sc.getDynamicDataClass(), t.sc.getEventDataClass());
        t.syn.setUpdateCallback(function(s, d, e){t.sc.onSynchronizrUpdate(s, d, e)});

        var initBa = t.u8FromB64("AAFKAKsAE0Zyb2lkIE1lZGljaW5lLUxha2UACFJlZGhhd2tzAANGTUwAJ3Jlc291cmNlcy9tYXNjb3RzL2Zyb2lkbWVkaWNpbmVsYWtlLnBuZwANSXNhYWMgSm9obnNvboEADkphdm9ubmUgTmVzYml0gwALQ29sdCBNaWxsZXKVAA1NYXNvbiBEZXRobWFumAALQm9kZSBNaWxsZXKsAA5CcmV0dCBTdGVudG9mdC0AmwAHQm96ZW1hbgAKU3RhdENhc3RycwADU1RDACFyZXNvdXJjZXMvZmF2aWNvbi9mYXZpY29uLTI1Ni5wbmcADUlzYWFjIEpvaG5zb26BAA5KYXZvbm5lIE5lc2JpdIMAC0NvbHQgTWlsbGVylQANTWFzb24gRGV0aG1hbpgAC0JvZGUgTWlsbGVyrAAOQnJldHQgU3RlbnRvZnQtAAAGAAQCBz94AACQAAcBB1MAARIAAAcBB0dIAY0AAAcBBz94A4EAAAcBByvwFYUAAAcBBxhoGJEAAAcBBwTgLJAAAAcBBhqALJQAAAcBBhqALZMAAAcBBWq4AUkAAAcBBVcwA0MAAAcBBUOoFU4AAAcBBTAgGEcAAAcBBRyYLEgAAAcBAAAAARIAAAcCB1MAAhIAAAcCBz94A4cA");

        var opcodeBa = t.u8FromB64("");

        t.syn.applySerializedFull(initBa);

        // t.syn.applyOpcodes(opcodeBa);
        

        var st = new SynchronizrState();

        var sba = t.syn.getSerializedArray(t.syn.staticData);
        var dba = t.syn.getSerializedArray(t.syn.dynamicData);
        var eba = t.syn.getSerializedArray(t.syn.eventData);

        var codez = st.update(sba, dba, eba);
        console.log(t.u8ToString(codez));

        console.log(st);

        // Player 24 of the Home team scores a Dunk at Period 2 6:34
        // All this info fits in only 13 measly bytes!!!
        var tst = [];
        tst.push("E".charCodeAt(0)); // Command: Set array to Events
        tst.push("s".charCodeAt(0)); // Command: Set item
        tst.push(0);
        tst.push(16); // Index
        tst.push(0);
        tst.push(7); // Payload Length
        tst.push(2) // Period
        tst.push(6) // Millis MSB
        tst.push(6) // Millis
        tst.push(6) // Millis LSB
        tst.push(24) // Player ID
        tst.push(128 + BasketballPlayType.DUNK_MADE); // Team Flag (2 MSB) and play type (6 LSB)
        tst.push(0); // Play flags
        tst = new Uint8Array(tst);
        console.log(tst);
        setTimeout(function(){ // Apply the new play in 5 seconds
            t.syn.applyOpcodes(tst);
        }, 5000);
    }

    onResize(){
        var t = this;
        t.mobile = (window.innerWidth < t.MOBILE_WIDTH);
        t.sc.onResize();
    }


    u8ToB64(ba){
        var str = "";
        for(var x = 0; x < ba.length; x++)
            str += String.fromCharCode(ba[x]);
        return window.btoa(str);
    }

    u8ToString(ba){
        return window.atob(this.u8ToB64(ba));
    }

    u8FromB64(b64){
        var str = window.atob(b64);
        var rtn = new Uint8Array(str.length);
        for(var x = 0; x < rtn.length; x++)
            rtn[x] = str.charCodeAt(x);
        return rtn;
    }
}