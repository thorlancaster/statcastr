// Toast objects are created to inform the user that something has happened.
// The constructor attaches the toast to the end of the DOM, shows automatically,
// and deletes itself when done.
class Toast {
    constructor(message, delay1) {
        if(!delay1) delay1 = 2500;
        var delay2 = 500;
        var oldEl = DGE("toastEl");
        if(oldEl){
            oldEl.parentElement.removeChild(oldEl);
            clearTimeout(oldEl.tTmrId);
        }
        var el = DCE("div", "toast");
        el.id = "toastEl";
        var el2 = DCE("span");
        el2.innerText = message;
        el.appendChild(el2);
        if (!window.Toast_ToastRoot)
            document.body.appendChild(el);
        else
            window.Toast_ToastRoot.appendChild(el);
        el.tTmrId = setTimeout(function(){
            el.classList.add("ending");
            setTimeout(function(){
                if(el.parentElement)
                    el.parentElement.removeChild(el);
            }, delay2);
        }, delay1);
    }
}

function ToastSetRoot(id) {
    window.Toast_ToastRoot = DGE(id);
}