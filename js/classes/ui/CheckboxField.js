class CheckboxField extends UIPanel {
    constructor(initVal) {
        super();
        var t = this;
        var label = DCE("label", "switch");
        var input = DCE("input");
        t.box = input;
        input.type = "checkbox";
        if(initVal)
            input.checked = true;
        var span = DCE("span", "slider");
        label.appendChild(input);
        label.appendChild(span);
        t.element.appendChild(label);
        t.addClass('checkboxField');
    }
    setValue(bool){
        this.box.checked = bool;
    }
    getValue(){
        return this.box.checked;
    }
}