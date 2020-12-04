class ReliableChannel {
    constructor() {
        this.connTarget = null; // Who we're connecting to
        this.connPort = null;
        this.rxCallback = null; // Function to call on rx
        this.dcCallback = null; // Function to call on conn lost
        this.opCallback = null; // Function to call on conn established
        this.inCallback = null; // Function to call on conn initialized
        this.staChgCallback = null; // Function to call on conn status change
        this.autoReconnect = true;
        this.dbgTryPorts = 0; // How many ports up to try on failure
    }
    setReceiveCallback(cb) {
        this.rxCallback = cb;
    }
    setCloseCallback(cb) {
        this.dcCallback = cb;
    }
    setOpenCallback(cb) {
        this.opCallback = cb;
    }
    setInitCallback(cb) {
        this.inCallback = cb;
    }

    /**
     * Whenever readyState or bufferedAmount changes, the implementation shall call
     * the provided function with the following parameters:
     * readyState: 0 for connecting, 1 for open, 2 for closing or closed
     * buffered: Number of bytes in buffer not yet sent over network
     * status: One of "Connecting", "Disconnected", or (int) buffered
     * 
     * @param cb Callbback function
     */
    setStatusChangeCallback(cb){
        this.staChgCallback = cb;
    }

    setTarget(targ, port) {
        this.connTarget = targ;
        this.connPort = port;
        this.origConnPort = port;
        this.disconnect();
    }
    setAutoReconnect(x){
        this.autoReconnect = x;
    }
    /**
     * @returns length of read queue
     */
    available() { throw "Abstract Method" }

    /**
     * @returns next message in the read queue, or null if queue empty
     */
    read() { throw "Abstract Method" }

    /**
     * @returns number of bytes soft-allowed to write
     */
    canWrite() { throw "Abstract Method" }

    // The following are self-explanatory
    write() { throw "Abstract Method" }
    isConnected() { throw "Abstract Method" }
    isClosed() { throw "Abstract Method" }
    connect() { throw "Abstract Method" }
    disconnect() { throw "Abstract Method" }
    reconnect() { throw "Abstract Method" }
}


class WebsocketReliableChannel extends ReliableChannel {
    constructor() {
        super();
        var t = this;
        t.MAX_BUFFER_SZ = 10000;
        t.TIMEOUT = 20000; // How often to ping server or consider conn dropped
        t.STA_INTERVAL = 500; // How often to check connection state
        t.ws = null;
        t.queue = [];
    }

    tick(){
        var t = this;
        if(!t.isConnected()){
            t.disconnect();
            if(t.timer) clearInterval(t.timer);
        } else {
            this.ws.send(' ');
        }
    }

    /**
     * Status tick function
     * 
     * Called once a second by a timer.
     * It is a good idea to call this function whenever you make a change to the ws
     */
    staTick(){
        var t = this, ws = t.ws;
        var rs = ws ? ws.readyState : 2;
        if(rs == 3) rs = 2;
        var ba = ws ? ws.bufferedAmount : 0;
        if(t._rs != rs || t._ba != ba){
            t._rs = rs;
            t._ba = ba;
            var desc = ba;
            if(rs == 2) desc = "Disconnected";
            if(rs == 0) desc = "Connecting";
            if(t.staChgCallback)
                t.staChgCallback(rs, ba, desc);
        }
    }

    available() {
        return this.queue.length;
    }
    
    read() {
        if (this.available())
            return this.queue.shift();
        return null;
    }
    
    canWrite() {
        if (!this.isConnected()) return 0;
        return Math.max(0, this.MAX_BUFFER_SZ - this.ws.bufferedAmount);
    }

    write(msg) {
        if (!this.canWrite())
            console.warn("Shouldn't write right now");
        this.ws.send(msg);
        this.staTick();
        console.info("[RC] TX " + msg);
    }

    isConnected() {
        if (!this.ws) return false;
        return this.ws.readyState == 1;
    }

    isClosed() {
        if (!this.ws) return false;
        var r = this.ws.readyState;
        return r == 2 || r == 3;
    }

    connect() {
        var t = this;
        t.ws = new WebSocket(t.connTarget + ':' + t.connPort);
        t.ws.rcEverConnected = false;
        t.ws.addEventListener("message", function (e) {
            console.info("[RC] RX " + e.data);
            t.queue.push(e.data);
            if (t.rxCallback)
                t.rxCallback();
        });
        t.ws.addEventListener("close", function (e) {
            if (t.dcCallback)
                t.dcCallback();
            t.handleWsClose(e);
        });
        // t.ws.addEventListener("error", t.handleWsError.bind(t));
        t.ws.addEventListener("open", function (e) {
            t.everConnected = true;
            t.staTick();
            if (t.opCallback)
                t.opCallback(t.connPort);
        });
        t.connAttemptTime = Date.now();
        if(t.staTimer) clearInterval(t.staTimer);
        t.staTimer = setInterval(t.staTick.bind(t), t.STA_INTERVAL);

        if(t.timer) clearInterval(t.timer);
        t.timer = setInterval(t.tick.bind(t), t.TIMEOUT);

        if (t.inCallback)
            t.inCallback();
        
        t.staTick();
    }

    reconnect() {
        this.disconnect();
        this.connect();
    }

    handleWsClose(e) {
        var tm = Date.now();
        var t = this;
        var portChanged = true;
        if(t.timer) clearInterval(t.timer);
        if (t.dbgTryPorts && e.code == 1006 && !t.everConnected && t.connPort - t.origConnPort <= t.dbgTryPorts) {
            t.connPort++;
            portChanged = true;
            t.disconnect();
        }
        if(t.autoReconnect){
            if(t.reconnTmr)
                clearTimeout(t.reconnTmr);
            t.reconnTmr = setTimeout(function(){
                if(t.autoReconnect)
                    t.connect();
            }, portChanged ? 0 :3000);
        }
        t.staTick();
    }

    disconnect() {
        if (this.ws)
            this.ws.close();
        this.staTick();
    }
}