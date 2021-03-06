// This class's constructer is called by the loader after everything is loaded.
class Main {
    // Like public static void main(String[] args)
    constructor() {
        var t = this;
        window.BUS = new MessageBus(new Statefull());
        window.STATE = BUS.getState();
        window.MAIN = this;
        window.Preferences = new MainPreferencesClass("Statcastr");
        window.Credentials = new CredentialsPreferencesClass("Statcastr.credentials");
        window.EventListPrefs = new EventListPreferencesClass("Statcastr.eventList");
        Preferences.load();
        Credentials.load();
        EventListPrefs.load();
        t.MOBILE_WIDTH = 780; // If narrower, mobile layout is used
        t.mobile = (window.innerWidth < t.MOBILE_WIDTH);
        // ToastSetRoot(APP_ROOT);
        var params = new URL(location.href).searchParams;
        var s = new Synchronizr(BUS);
        
        t.channel = new DelegateReliableChannel({"ws wss": new WebsocketReliableChannel(), "lfi": new LoFiReliableChannel()});
        if(Preferences.useLofi && Credentials.isAdmin()){
            // TODO dynamic channel target switching
            t.channel.setTarget("lfi://localhost");
        } else {
            if (window.location.hostname == "localhost")
                t.channel.setTarget("ws://localhost", 1234);
            else
                t.channel.setTarget("wss://" + window.location.hostname, 1234);
        }
        if(window.location.hostname == "localhost")
            document.title = "StatCastr@localhost";
        s.setChannel(t.channel);
        
        t.sc = new StatcastrApp(DGE(APP_ROOT), s);
        // s.setLocalData(t.sc.getStaticData(), t.sc.getDynamicData(), t.sc.getEventData());
        // s.setLocalDataClasses(t.sc.getStaticDataClass(), t.sc.getDynamicDataClass(), t.sc.getEventDataClass());
        // s.setUpdateCallback(t.sc.onSynchronizrUpdate.bind(t.sc));
        // s.setVerificationCallback(t.sc.onSynchronizrVerification.bind(t.sc));
        // s.setErrorCallback(t.sc.onSynchronizrError.bind(t.sc));
        // s.setPreConnectionCallback(t.sc.onSynchronizrPreConn.bind(t.sc));
        // s.setStatusChangeCallback(t.sc.onSynchronizrStatusChange.bind(t.sc));
        // s.setHashValidationDoneCallback(t.sc.onSynchronizrHvDone.bind(t.sc));

        // t.channel.connect();
        // console.log("SynchronizrMain: Channel started");
        window.CHANNEL = t.channel;
        window.SC = t.sc;
        window.SYN = s;

        setInterval(t.sc.tick.bind(t.sc), 100);

        if (params.get("standalone") == "true") {
            console.log("Standalone mode, back button disabled");
            t.disableBackButton();
        }

        var eventId = params.get("event");
        if(eventId){
            BUS.publish(new MBMessage("req", "event", eventId));
        } else {
            BUS.publish(new MBMessage("req", "event", "null"));
        }
        BUS.publish(new MBMessage("updreq", "synchronizr", "reconnect"));
    }

    disableBackButton() {
        window.history.pushState({}, '')

        window.addEventListener('popstate', function (event) {
            window.history.pushState({}, '')
        })
    }

    onResize() {
        var t = this;
        t.mobile = (window.innerWidth < t.MOBILE_WIDTH);
        t.sc.onResize();
    }

    onKey(e) {
        this.sc.onKey(e);
    }

    u8ToB64(ba) {
        var str = "";
        for (var x = 0; x < ba.length; x++)
            str += String.fromCharCode(ba[x]);
        return window.btoa(str);
    }

    u8ToString(ba) {
        return window.atob(this.u8ToB64(ba));
    }

    u8FromB64(b64) {
        var str = window.atob(b64);
        var rtn = new Uint8Array(str.length);
        for (var x = 0; x < rtn.length; x++)
            rtn[x] = str.charCodeAt(x);
        return rtn;
    }
}