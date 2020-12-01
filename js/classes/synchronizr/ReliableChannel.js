class ReliableChannel {
    constructor() {
        this.connTarget = null; // Who we're connecting to
        this.connPort = null;
        this.rxCallback = null; // Function to call on rx
        this.dcCallback = null; // Function to call on conn lost
        this.opCallback = null; // Function to call on conn established

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
    setTarget(targ, port) {
        this.connTarget = targ;
        this.connPort = port;
        this.origConnPort = port;
        this.disconnect();
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
        t.ws = null;
        t.queue = [];
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
            if (typeof t.opCallback == "function")
                t.opCallback(t.connPort);
        });
        t.connAttemptTime = Date.now();
    }

    reconnect() {
        this.disconnect();
        this.connect();
    }

    handleWsClose(e) {
        var tm = Date.now();
        var t = this;
        if (t.dbgTryPorts && e.code == 1006 && !t.ws.rcEverConnected && t.connPort - t.origConnPort <= t.dbgTryPorts
            && tm < 1000 + t.connAttemptTime) {
            t.connPort++;
            t.disconnect();
            t.connect();
        }
    }

    disconnect() {
        if (this.ws)
            this.ws.close();
    }
}