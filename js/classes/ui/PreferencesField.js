class PreferencesField extends UIPanel {
	/**
	 * Field for editing properties of an object
	 * @param {Object} obj Object to edit properties of
	 * @param {Function} renameFn Optional function to rename the object's keys.
	 * 		If the function returns null for a key, that key will not be shown.
	 */
	constructor(obj, renameFn) {
		super();
		var t = this;
		t.addClass("preferencesField");
		t.setStyle("flexDirection", "column");
		t.table = new TableField(["Setting", "Value"]);
		t.table.setHeaderVisible(false);
		t.appendChild(t.table);
		t.keys = []; // Keys
		t.ctrls = []; // Controls
		for (var k in obj) {
			if (k.startsWith('_'))
				continue;
			if (renameFn){
				var ren = renameFn(k);
				if(ren){
					t.ctrls.push(t.addRow(ren, obj[k]));
					t.keys.push(k);
				}
			}
			else{
				t.ctrls.push(t.addRow(k, obj[k]));
				t.keys.push(k);
			}
		}
	}
	addRow(k, v) {
		var t = this.table;
		var vObj = v;
		switch(typeof v){
			case "boolean":
				vObj = new CheckboxField(v).setStyle("fontSize", "1.3em"); break;
			case "number": case "string":
				vObj = new EditTextField(v); break;
		}
		t.setRow(t.getLength(), [k, vObj], false);
		return vObj;
	}
	/**
	 * @returns False if there are any errors, True otherwise
	 */
	isValid(){
		return true;
	}
	getState(){
		var t = this, rtn = {};
		for(var x = 0; x < t.keys.length; x++){
			var k = t.keys[x];
			var vObj = t.ctrls[x];
			rtn[k] = vObj.getValue();
		}
		return rtn;
	}
}