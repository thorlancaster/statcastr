class ReliableChannel {
	constructor() {
		var t = this;
		// t.connTarget = null; // Who we're connecting to
		// t.connPort = null;
		// t.rxCallback = null; // Function to call on rx
		// t.dcCallback = null; // Function to call on conn lost
		// t.opCallback = null; // Function to call on conn established
		// t.inCallback = null; // Function to call on conn initialized
		// t.staChgCallback = null; // Function to call on conn status change
		t._callback = null;
		t.autoReconnect = true;
		t.dbgTryPorts = 0; // How many ports up to try on failure
	}

	setCallback(cb){
		this._callback = cb;
	}
	onConnClick(){
		// By default does nothing. This is where privileged functions must be called from
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
	setStatusChangeCallback(cb) {
		this.staChgCallback = cb;
	}

	setTarget(targ, port) {
		this.disconnect();
		this.connTarget = targ;
		this.connPort = port;
		this.origConnPort = port;
	}
	setAutoReconnect(x) {
		this.autoReconnect = x;
	}
	// The following 2 functions have been replaced by a callback
    // /**
    //  * @returns length of read queue
    //  */
	// available() { throw "Abstract Method" }

    // /**
    //  * @returns next message in the read queue, or null if queue empty
    //  */
	// read() { throw "Abstract Method" }

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

class DelegateReliableChannel extends ReliableChannel {
	constructor(channels) {
		super();
		var t = this;
		t.channels = {};
		for (var kx in channels) {
			var v = channels[kx];
			// v.setInitCallback(function (x) { t.dInit(this, x) });
			// v.setReceiveCallback(function (x) { t.dReceive(this, x) });
			// v.setCloseCallback(function (x) { t.dClose(this, x) });
			// v.setOpenCallback(function (x) { t.dOpen(this, x) });
			// v.setStatusChangeCallback(function (x, y, z) { t.dStatusChange(this, x, y, z) });

			/**
			 * This function is called with an object with the following information
			 * 	status = readyState
			 *  type = "open" | "close" | "connect" | "receive"
			 */
			v.setCallback(function(x){ t.dCallback(this, x) });
			
			var ks = kx.split(' ');
			for (var kc in ks) {
				var k = ks[kc];
				t.channels[k] = v;
			}
		}
		this.selChannel = new NopReliableChannel();
	}
	log(x, y, z){
		return;
		if(z != null)
			console.log("DRC", x, y, z);
		else if(y != null)
			console.log("DRC", x, y);
		else
			console.log("DRC", x);
	}

	// Delegate Callback
	dCallback(chan, x){
		// If callback is from selected channel, send it up
		if(chan == this.getChannel() && this._callback)
			this._callback(x);
		this.log("Callback", x);
	}

	onConnClick(){ // Send control flow to execute privileged action
		this.getChannel().onConnClick();
	}

	setAutoReconnect(x) {
		this.autoReconnect = x;
		this.getChannel().setAutoReconnect(x);
	}

	setTarget(targ, port) {
		var t = this;
		t.getChannel().setAutoReconnect(false);
		t.getChannel().setTarget(targ, port);
		t.setChannel(t.channelForURL(targ));
		t.getChannel().setTarget(targ, port);
		t.getChannel().setAutoReconnect(t.autoReconnect);
	}

	channelForURL(str) {
		var protocol = str.substring(0, str.indexOf("://"));
		var rtn = this.channels[protocol];
		assert(rtn != null, "Unsupported protocol");
		return rtn;
	}

	getChannel() { return this.selChannel; }
	setChannel(ch) {this.log("Setting channel to", ch); this.selChannel = ch; }
	// available() { return this.getChannel().available(); }
	canWrite() { return this.getChannel().canWrite(); }
	// read() { return this.getChannel().read(); }
	write(x) {this.log("Writing", x); return this.getChannel().write(x); }
	isConnected() { return this.getChannel().isConnected(); }
	isClosed() { return this.getChannel().isClosed(); }
	connect() {this.log("Connecting"); return this.getChannel().connect(); }
	disconnect() {this.log("Disconnecting"); return this.getChannel().disconnect(); }
	reconnect() {this.log("Resconnecting"); return this.getChannel().reconnect(); }
}

class NopReliableChannel extends ReliableChannel {
	constructor() {
		super();
	}
    // /**
    //  * @returns length of read queue
    //  */
	// available() { return 0; }

    // /**
    //  * @returns next message in the read queue, or null if queue empty
    //  */
	// read() { return null; }

    /**
     * @returns number of bytes soft-allowed to write
     */
	canWrite() { return 0; }

	// The following are self-explanatory
	write() { }
	isConnected() { return false; }
	isClosed() { return true; }
	connect() { throw "Method not allowed" }
	disconnect() { }
	reconnect() { throw "Method not allowed" }
}