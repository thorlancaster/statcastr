// This class's constructer is called by the loader after everything is loaded.
class Main{
    // Like public static void main(String[] args)
    constructor(){
        var t = this;
        window.MAIN = this;
        t.MOBILE_WIDTH = 780; // If narrower, mobile layout is used
        t.mobile = (window.innerWidth < t.MOBILE_WIDTH);
        // ToastSetRoot(APP_ROOT);
        var eventId = new URL(location.href).searchParams.get("event");
        var s = new Synchronizr();
        t.sc = new StatcastrApp(DGE(APP_ROOT), s, eventId);
        // s.setLocalData(t.sc.getStaticData(), t.sc.getDynamicData(), t.sc.getEventData());
        // s.setLocalDataClasses(t.sc.getStaticDataClass(), t.sc.getDynamicDataClass(), t.sc.getEventDataClass());
        s.setUpdateCallback(t.sc.onSynchronizrUpdate.bind(t.sc));

        t.channel = new WebsocketReliableChannel();
        t.channel.setTarget("ws://localhost", 1234);
        s.setChannel(t.channel);
        t.channel.connect();
        console.log("SynchronizrMain: Channel started");
        window.CHANNEL = t.channel;
        window.SC  = t.sc;
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