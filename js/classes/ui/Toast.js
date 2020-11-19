// Toast objects are created to inform the user that something has happened.
// The constructor attaches the toast to the end of the DOM, shows automatically,
// and deletes itself when done.
class Toast {
    constructor(message, delay1) {
        if(!delay1) delay1 = 2500;
        var delay2 = 500;
        // console.info("Toast: " + message);
        var el = DCE("div", "toast");
        el.innerText = message;
        if (!window.Toast_ToastRoot)
            document.body.appendChild(el);
        else
            window.Toast_ToastRoot.appendChild(el);
        setTimeout(function(){
            el.classList.add("ending");
            setTimeout(function(){
                el.parentElement.removeChild(el);
            }, delay2);
        }, delay1);
    }
}

function ToastSetRoot(id) {
    window.Toast_ToastRoot = DGE(id);
}