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
     * Called periodically by a timer.
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
        console.info("[WSRC] TX " + msg);
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