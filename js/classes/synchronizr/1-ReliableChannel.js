class ReliableChannel {
	constructor() {
		var t = this;
		t.connTarget = null; // Who we're connecting to
		t.connPort = null;
		t.rxCallback = null; // Function to call on rx
		t.dcCallback = null; // Function to call on conn lost
		t.opCallback = null; // Function to call on conn established
		t.inCallback = null; // Function to call on conn initialized
		t.staChgCallback = null; // Function to call on conn status change
		t.autoReconnect = true;
		t.dbgTryPorts = 0; // How many ports up to try on failure
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

class DelegateReliableChannel extends ReliableChannel {
	constructor(channels) {
		super();
		var t = this;
		t.channels = {};
		for (var kx in channels) {
			var v = channels[kx];
			v.setInitCallback(function (x) { t.dInit(this, x) });
			v.setReceiveCallback(function (x) { t.dReceive(this, x) });
			v.setCloseCallback(function (x) { t.dClose(this, x) });
			v.setOpenCallback(function (x) { t.dOpen(this, x) });
			v.setStatusChangeCallback(function (x, y, z) { t.dStatusChange(this, x, y, z) });
			var ks = kx.split(' ');
			for (var kc in ks) {
				var k = ks[kc];
				t.channels[k] = v;
			}
		}
		this.selChannel = new NopReliableChannel();
	}
	dInit(chan, x) {
		if (chan == this.getChannel() && this.inCallback)
			this.inCallback(x);
	}
	dReceive(chan, x) {
		if (chan == this.getChannel() && this.rxCallback)
			this.rxCallback(x);
	}
	dClose(chan, x) {
		if (chan == this.getChannel() && this.dcCallback)
			this.dcCallback(x);
	}
	dOpen(chan, x) {
		if (chan == this.getChannel() && this.opCallback)
			this.opCallback(x);
	}
	dStatusChange(chan, res, ba, desc) {
		if (chan == this.getChannel() && this.staChgCallback)
			this.staChgCallback(res, ba, desc);
	}

	onConnClick(){
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
	setChannel(ch) { this.selChannel = ch; }
	available() { return this.getChannel().available(); }
	canWrite() { return this.getChannel().canWrite(); }
	read() { return this.getChannel().read(); }
	write(x) { return this.getChannel().write(x); }
	isConnected() { return this.getChannel().isConnected(); }
	isClosed() { return this.getChannel().isClosed(); }
	connect() { return this.getChannel().connect(); }
	disconnect() { return this.getChannel().disconnect(); }
	reconnect() { return this.getChannel().reconnect(); }
}

class NopReliableChannel extends ReliableChannel {
	constructor() {
		super();
	}
    /**
     * @returns length of read queue
     */
	available() { return 0; }

    /**
     * @returns next message in the read queue, or null if queue empty
     */
	read() { return null; }

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