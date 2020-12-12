class BluetoothSerial {
	constructor() {
		var t = this;
		t.rxBuffer = [];
		t.device = null;
		t.rxCharacteristic = null;
		t.txCharacteristic = null;
		t.deviceName = null;
		t._isPairing = false;
		t._isConnected = false;
		t.serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; // Main
		t.characteristicUuid = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX
		t.characteristicUuid2 = "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // TX
	}
	connect() {
		var t = this;
		let serviceUuid = t.serviceUuid;

		let characteristicUuid = t.characteristicUuid;
		let characteristicUuid2 = t.characteristicUuid2;

		navigator.bluetooth.requestDevice({
			filters: [{
				services: [serviceUuid],
				optionalServices: [serviceUuid, characteristicUuid, characteristicUuid2]
			}]
		})
			.then(device => {
				t.device = device;
				t._isPairing = true;
				t._isConnected = false;
				t.log('Connecting...');
				t.deviceName = device.name;
				device.addEventListener('gattserverdisconnected', t.handleDisconnect.bind(t));
				return device.gatt.connect();
			})
			.then(server => {
				t.log('Getting Service...');
				return server.getPrimaryService(serviceUuid);
			})
			.then(service => {
				t.log('Getting RX characteristic...');
				return service.getCharacteristics();
			})
			.then(characteristics => {
				t.rxCharacteristic = characteristics.filter(function (x) { return x.uuid == t.characteristicUuid })[0];
				t.txCharacteristic = characteristics.filter(function (x) { return x.uuid == t.characteristicUuid2 })[0];
				if (!t.rxCharacteristic || !t.txCharacteristic)
					throw "RX and/or TX characteristics not found";
				return t.rxCharacteristic.startNotifications().then(_ => {
					t.log('> Notifications started');
					t.log("Connected to: " + t.deviceName);
					t.rxCharacteristic.addEventListener('characteristicvaluechanged', t.handleNotifications.bind(t));
					t._isPairing = false;
					t._isConnected = true;
					if(t._connCallback)
						t._connCallback();
				});
			})
			.catch(error => {
				t._isConnected = false;
				t._isPairing = false;
				console.error('BluetoothSerial error: ', error);
			});
	}

	isPairing() {
		return this._isPairing;
	}

	isConnected() {
		return this._isConnected;
	}

	disconnect() {
		var t = this;
		t._isConnected = false;
		if (t.device)
			t.device.gatt.disconnect();
		t.device = null;
		if(t._dconnCallback)
		t._dconnCallback();
	}
	handleDisconnect() {
		var t = this;
		t._isConnected = false;
		if(t._dconnCallback)
		t._dconnCallback();
	}

	handleNotifications(event) {
		let value = event.target.value;
		var rx = new Uint8Array(value.buffer);
		for(var x = 0; x < rx.length; x++)
			this.rxBuffer.unshift(String.fromCharCode(rx[x]));
		if(this._notifyCb){
			this._notifyCb();
		}
	}


	str2ab(str) {
		var buf = new ArrayBuffer(str.length);
		var bufView = new Uint8Array(buf);
		for (var i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	log(x) {
		console.log("BluetoothSerial: ", x);
	}

	// Standard UART interface

	// Function will be called whenever data arrives
	setNotifyCallback(cb){
		this._notifyCb = cb;
	}

	// Function will be called when pairing successful
	setConnectCallback(cb){
		this._connCallback = cb;
	}

	// Function will be called when pairing lost
	setDisconnectCallback(cb){
		this._dconnCallback = cb;
	}

	available(){
		return this.rxBuffer.length;
	}

	read(){
		var x = this.rxBuffer;
		var rtn = x[x.length - 1];
		x.length--;
		return rtn;
	}

	write(data) {
		if (!this._isConnected)
			throw "Not connected";
		// this.log("Wrote " + data);
		this.txCharacteristic.writeValue(this.str2ab(data));
	}
}