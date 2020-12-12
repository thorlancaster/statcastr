class LoFiReliableChannel extends ReliableChannel {
    constructor() {
        super();
        var t = this;
        // 0=CONNECTING, 1=CONNECTED, 2=UNPAIRED, 3=PAIRED_DISCONNECTED
        t.readyState = 2;
        t.readQueue = []; // Array of messages sent/received, separated by framing protocol
        t.writeQueue = [];
        // Contents of leftovers or partials of read/write queues
        t.readBuffer = ""; // For Serial
        t.frameReadBuffer = "" // For partial frames
        t.writeBuffer = "";
        t.writeLastSend = ""; // Last encoded partial sent over BT, used to retry on TEF (TRANSMIT_ERR_FULL)
        t.nextTxAttMs = null; // When to try the next send attempt (usually after TRANSMIT_ERR_FULL)
        t.lastCmdSendMs = null; // Date.now() when last command was sent. Set to NULL on receipt of command
        t.lastTxSuccess = true; // Set to false on send attempt, true when receive TS 
        t.MAX_PACKET_LEN = 120; // Max PHY packet length minus a bit of overhead
        t.STA_INTERVAL = 200; // Status tick is called every x milliseconds
        t.QUEUE_FULL_DELAY = 100; // On receipt of TRANSMIT_ERR_FULL, wait this long until sending again
        t.port = new BluetoothSerial();
        t.port.setNotifyCallback(t.onPortAvailable.bind(t));
        t.port.setConnectCallback(t.onPortConnect.bind(t))
        t.port.setDisconnectCallback(t.onPortDisconnect.bind(t))
        t.beginStaTmr();
    }

    onPortConnect() {
        var t = this;
        t.readyState = 3;
        if (t.inCallback)
            t.inCallback();
        t.readyState = 1;
        if (t.opCallback)
            t.opCallback(); // TODO this maybe probably be called from here
    }
    onPortDisconnect() {
        var t = this;
        t.readyState = 2;
        if (t.dcCallback)
            t.dcCallback();
    }

    onPortAvailable() {
        var t = this, p = t.port;
        while (p.available()) {
            var nextChar = p.read();
            if (nextChar == "\n") {
                t.onPortMessage(t.readBuffer);
                t.readBuffer = "";
            }
            else
                t.readBuffer += nextChar;
        }
    }
    // Called by onPortAvailable() after newline
    onPortMessage(msg) {
        var t = this;
        if (msg.startsWith("R ")) { // Received data
            if (msg.startsWith("R P")) { // Partial
                t.frameReadBuffer += msg.substring(3);
                console.log("LoFi Rx partial");
            } else {
                var fullRx = (t.frameReadBuffer + msg.substring(3));
                fullRx = t.phyUnescape(fullRx);
                if(fullRx.startsWith("10-4 XXX"))
                    t.testResp(fullRx); // TODO XXX
                else
                    t.readQueue.unshift(fullRx);
                // TODO call on available callback
                console.log("LoFi Rx: " + fullRx);
                t.frameReadBuffer = "";
            }
            t.lastCmdSendMs = null;
        }
        else if (msg.startsWith("TS ")) {
            t.lastCmdSendMs = null;
            t.lastTxSuccess = true;
            // console.log("LoFi Tx was successfull");
        }
        else if (msg.startsWith("TEF ")) {
            t.lastCmdSendMs = null;
            // console.log("LoFi Tx failed - channel full")
        }
        else if (msg.startsWith("TE ")) {
            t.lastCmdSendMs = null;
            console.error("LoFi tx failed - UNKNOWN ERROR");
            console.warn("Full error: " + msg);
        } else {
            console.log("BT> " + msg);
        }
    }

    getTestStr(){
        var t = this;
        if(t._testStr)
            return t._testStr;

        var str = "XXXTEST";
        for(var x = 0; x < 255; x++){
            str += String.fromCharCode(x);
            str += String.fromCharCode(x);
            str += String.fromCharCode(x+1);
        }
        for(var x = 0; x <= 255; x++){
            str += String.fromCharCode(255-x);
        }
        for(var x = 0; x < 40000; x++){
            str += String.fromCharCode(Math.floor(Math.random() * 255.9999));
        }

        t._testStr = str;
        return str;
    }
    testResp(resp){
        console.log("Test response: " + resp);
        var str = "10-4 " + this.getTestStr();
        if(resp == str){
            console.log("Test PASSED");
        } else {
            console.log("Test FAILED");
            console.log("EXPECTED : RECEIVED");
            for(var x = 0; x < str.length; x++){
                console.log(str.charCodeAt(x) + "  " + resp.charCodeAt(x) + (str.charCodeAt(x) == resp.charCodeAt(x) ? "" : ">ERR<"));
            }
        }
    }
    test(){
        var str = "T" + this.getTestStr();
        console.log("Sending test string: " + str);
        this.write(str);
    }


    beginStaTmr() {
        var t = this;
        if (t.staTimer) clearInterval(t.staTimer);
        t.staTimer = setInterval(t.staTick.bind(t), t.STA_INTERVAL);
    }
    /**
     * Status tick function.
     * 
     * Called periodically by a timer.
     * It is a good idea to call this function whenever you make a change to the connection
     */
    staTick() {
        var t = this;
        t.txTick(); // Handle outstanding TX before updating status
        if (!t.port.isConnected()) {
            if (t.port.isPairing())
                t.readyState = 0;
            else
                t.readyState = 2;
        } else {
            t.readyState = 1;
        }
        var rs = t.readyState;
        var ba = 0;
        if (t._rs != rs || t._ba != ba) {
            t._rs = rs;
            t._ba = ba;
            var desc = ba;
            if (rs == 3) desc = "Disconnected"
            if (rs == 2) desc = "Unpaired";
            if (rs == 0) desc = "Connecting";
            if (t.staChgCallback)
                t.staChgCallback(rs == 3 ? 2 : rs, ba, desc);
        }
    }

    /**
     * Transmit tick function.
     * Called whenever the endpoint sends TS (TRANSMIT_SUCCESS)
     * and whenever write() is called
     */
    txTick() {
        var t = this;
        if (!t.lastTxSuccess) {
            if (t.lastCmdSendMs == null) { // If command has already been received
                if (t.nextTxAttMs != null) {
                    if (Date.now() > t.nextTxAttMs) {
                        t.nextTxAttMs = null;
                        // If it's been long enough, try re-sending it
                        t.port.write(t.writeLastSend);
                        t.lastTxSuccess = false;
                        t.lastCmdSendMs = Date.now();
                    }
                }
                else {
                    t.nextTxAttMs = Date.now() + t.QUEUE_FULL_DELAY;
                }
            }
            return;
        }

        // TODO this is where we handle station identification auto-command-sending

        if (t.writeBuffer.length == 0 && t.writeQueue.length > 0)
            t.writeBuffer = t.createWriteBuffer(t.writeQueue.pop())

        if (t.writeBuffer.length > 0) {
            var toSend = t.writeBuffer;
            if (t.writeBuffer.length > t.MAX_PACKET_LEN) {
                toSend = t.writeBuffer.substring(0, t.MAX_PACKET_LEN);
                t.writeBuffer = t.writeBuffer.substring(t.MAX_PACKET_LEN);
                if(toSend.endsWith("\xFF") && toSend.charAt(toSend.length - 2) != "\xFF"){
                    toSend = toSend.slice(0, -1); // if toSend ends with a single 255, stuff it back in writeBuffer
                    t.writeBuffer = "\xFF" + t.writeBuffer;
                }
            } else {
                t.writeBuffer = "";
            }
            // Escaping of spaces doesn't change the LoRa packet length, so is performed here
            t.writeLastSend = "T " + toSend.replaceAll("\\", "\\\\").replaceAll(' ', "\\ ") + "\n";
            t.port.write(t.writeLastSend);
            t.lastTxSuccess = false;
            t.lastCmdSendMs = Date.now();
        }
    }

    /**
     * Create the write buffer from an element in the write queue,
     * applying shift encoding (see lofiFramingProtocol.txt) and
     * adding an End of Frame opcode at the end.
     * 
     * The returned data is guaranteed to be free of null and newline characters but may contain spaces
     */
    createWriteBuffer(data) {
        var rtn = "";
        for (var x = 0; x < data.length; x++) {
            var c = data.charCodeAt(x);
            if(c <= 8){
                rtn += String.fromCharCode(c + 1); // 0-8 => 1-9
            }
            else if (c <= 252) { // 9-252 => 11-254
                rtn += String.fromCharCode(c + 2);
            }
            else if(c == 253) {
                rtn += "\xFF\xFD"; // 253 => 255, 253
            } else if (c == 254) {
                rtn += "\xFF\xFE"; // 254 => 255, 254
            } else if (c == 255) {
                rtn += "\xFF\xFF"; // 255 => 255, 255
            }
        }
        return rtn + "\xFF\x01"; // End of frame
    }

    /**
     * Opposite of the escaping used in createWriteBuffer
     * See lofiFramingProtocol.txt
     * @param {String} str 
     */
    phyUnescape(str){
        var rtn = "";
        for(var x = 0; x < str.length; x++){
            var inChar = str.charCodeAt(x);
            if(inChar == 0){
                console.warn("Incoming Strings should be null-terminated, found null char in string");
                continue;
            }
            var outChar = inChar - 1;
            if(inChar == 255){
                rtn += str.charAt(++x);
            } else {
                if(inChar < 10)
                    rtn += String.fromCharCode(inChar - 1);
                else if(inChar > 10 && inChar < 255)
                    rtn += String.fromCharCode(inChar - 2);
                else
                    rtn += String.fromCharCode(inChar);
            }
        }
        return rtn;
    }

    /**
	 * Called when connection status widget is clicked
     * Used to execute privileged functionality
	 */
    onConnClick() {
        if (!this.port.isConnected() && !this.port.isPairing())
            this.port.connect();
        else
            this.port.disconnect();
    }

    /**
    * @returns length of read queue
    */
    available() { return readQueue.length; }

    /**
     * @returns next message in the read queue, or null if queue empty
     */
    read() { return readQueue.pop(); }

    /**
     * @returns number of bytes soft-allowed to write
     */
    canWrite() { return 10000000; }

    // The following are self-explanatory
    write(data) {
        console.info("[LFRC] TX " + data);
        this.writeQueue.unshift(data); this.txTick();
    }
    isConnected() { return this.readyState == 1 }
    isClosed() { return this.readyState == 2 || this.readyState == 3 }
    connect() {
        // TODO send a reinit
        if (this.readyState != 2) {
            this.readyState = 1;
            this.opCallback();
        }
    }
    disconnect() { if (this.readyState != 2) this.readyState = 3; }
    reconnect() { this.disconnect(); this.connect(); }
}