class ReliableChannel {
    constructor() {
        this.connTarget = null; // Who we're connecting to
        this.connPort = null;
        this.rxCallback = null; // Function to call on rx
        this.dcCallback = null; // Function to call on conn lost
        this.opCallback = null; // Function to call on conn established
        this.inCallback = null; // Function to call on conn initialized
        this.autoReconnect = true;
        this.dbgTryPorts = 6; // How many ports up to try on failure
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
        t.TIMEOUT = 20000;
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
            if (typeof t.rxCallback == "function")
                t.rxCallback();
        });
        t.ws.addEventListener("close", function (e) {
            if (typeof t.dcCallback == "function")
                t.dcCallback();
            t.handleWsClose(e);
        });
        // t.ws.addEventListener("error", t.handleWsError.bind(t));
        t.ws.addEventListener("open", function (e) {
            t.everConnected = true;
            if (typeof t.opCallback == "function")
                t.opCallback(t.connPort);
        });
        t.connAttemptTime = Date.now();
        if(t.timer) clearInterval(t.timer);
        t.timer = setInterval(t.tick.bind(t), t.TIMEOUT);
        if (typeof t.inCallback == "function")
            t.inCallback();
    }

    reconnect() {
        this.disconnect();
        this.connect();
    }

    handleWsClose(e) {
        var tm = Date.now();
        var t = this;
        if(t.timer) clearInterval(t.timer);
        if (t.dbgTryPorts && e.code == 1006 && !t.everConnected && t.connPort - t.origConnPort <= t.dbgTryPorts) {
            t.connPort++;
            t.disconnect();
        }
        if(t.autoReconnect){
            if(t.reconnTmr)
                clearTimeout(t.reconnTmr);
            t.reconnTmr = setTimeout(function(){
                if(t.autoReconnect)
                    t.connect();
            }, 3000);
        }
    }

    disconnect() {
        if (this.ws)
            this.ws.close();
    }
}