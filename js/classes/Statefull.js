// Single source of truth for the application
class Statefull {
    constructor() {
        var t = this;
        t.event = null; // "null" = access event list
        t.gameModel = null;
        t.feedReady = false;
        t.admin = false;
        t.connUrl = null; // URL that Synchronizr connects to
        t.selView = null; // View that is selected
    }
}

class MessageBus {
    constructor(statefull) {
        var t = this;
        t.statefull = statefull;
        t.subscribers = [];
        // Events that are allowed to be selected when event == "null" (no game loaded)
        t.viewEvtWhitelist = ["help", "login", "eventList"];
    }
    // Used to act on req messages and rebroadcast chg messages
    internalCb(e) {
        var t = this;
        var s = t.statefull;
        if (e.type == "upd") {
            if (e.name == "synchronizr" && !s.feedReady && s.event != "null") {
                s.feedReady = true;
                t.publish(new MBMessage("upd", "feedReady", true)); // Cancel the "Loading Stats Feed" page
            }
        }
        if (e.type == "req") {
            var act = s[e.name];
            var event = new URL(location.href).searchParams.get("event");
            if (e.name == "selView" && s.event == "null" && t.viewRequiresEvent(e.newVal)) {
                if (event) { // If there is an event in the URL bar to fall back on
                    t.publish(new MBMessage("req", "event", event)); // Switch to that event
                    t.publish(new MBMessage("req", "selView", e.newVal)); // Rebroadcast the request to the back of the queue
                    return;
                } else {
                    console.warn("Cannot select view " + e.newVal + ". No event selected");
                    t.publish(new MBMessage("upd", "dialog", "noSelView|NoEvent")); // Show a dialog to tell user to select event
                    return;
                }
            }
            if (e.name == "selView" && !s.feedReady && t.viewRequiresEvent(e.newVal)) {
                s.selView = e.newVal;
                t.publish(new MBMessage("chg", "selView", e.newVal)); // Go to the desired view
                if(s.admin) // If admin, feed is always ready
                    s.feedReady = true;
                t.publish(new MBMessage("upd", "feedReady", s.feedReady)); // "Loading Stats Feed" page will be shown until loaded
                return;
            }
            if (e.name == "selView" && e.newVal == "admin" && !s.admin) { // On admin view select, check login status
                s.selView = "login";
                t.publish(new MBMessage("chg", "selView", "login", act));
                return;
            }
            if (e.name == "selView" && e.newVal == "eventList") {
                t.publish(new MBMessage("req", "event", "null"));
                t.publish(new MBMessage("updreq", "synchronizr", "reconnect"));
            }
            if (e.name == "selView" && e.newVal == "help") { // Help is a dialog, not a view
                t.publish(new MBMessage("upd",  "dialog", "help"));
                return;
            }
            if (act != e.newVal) { // Change value and rebroadcast change message if we haven't returned yet
                s[e.name] = e.newVal;
                t.publish(new MBMessage("chg", e.name, e.newVal, act));
            }
        } else if (e.type == "chg") {
            if (e.name == "event" && e.newVal == "null") {
                s.feedReady = false;
                t.publish(new MBMessage("req", "selView", "eventList"));
            }
            if (e.name == "event" && e.newVal != "null" && s.selView == "eventList") {
                // On event selection, away from the list and BACK TO THE GAME!
                t.publish(new MBMessage("req", "selView", Preferences.defaultView));
            }
        }
    }
    viewRequiresEvent(name) {
        return !this.viewEvtWhitelist.includes(name);
    }
    publish(obj) {
        var t = this;
        console.log("MessageBus: ", obj);
        t.internalCb(obj);
        for (var a in t.subscribers) {
            t.subscribers[a](obj);
        }
    }
    subscribe(fun) {
        var t = this;
        if (t.subscribers.includes(fun))
            return;
        t.subscribers.push(fun);
    }
    getState() {
        return this.statefull;
    }
}

class MBMessage {
    /**
     * 
     * @param {String} type Type of message (req = Request change, chg = Change happened, upd = Update (non-variable) occurred, updreq = request for Update)
     * @param {*} name Name of variable that is changing
     * @param {*} newVal Intended value for the variable
     * @param {*} oldVal Old value for the variable (upd only)
     */
    constructor(type, name, newVal, oldVal) {
        var t = this;
        t.type = type;
        t.name = name;
        t.newVal = newVal;
        t.oldVal = oldVal;
        // #IFNDEF production
        t.trace = new Error().stack.split("\n"); // TODO remove for production
        // #ENDIF
    }
}

// Test code

// var mb = new MessageBus(new Statefull());

// mb.subscribe(function(e){
//     console.log("Statefull Test: " , e);
// });

// mb.publish(new MBMessage("req", "eventId", "237"));
// mb.publish(new MBMessage("req", "eventId", "238"));
// mb.publish(new MBMessage("req", "eventId", "238"));
