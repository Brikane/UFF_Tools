// ==UserScript==
// @name         AutoASM
// @namespace    https://github.com/Brikane/UFF_Tools
// @version      1.0
// @description  Signs user in to ASM every minute
// @downloadURL  https://github.com/jgray0705/UserScripts/raw/master/AutoASM.user.js
// @author       grajef@
// @match        https://aftlite-na.amazon.com/indirect_action/signin_indirect_action*
// @grant        none
// ==/UserScript==


var reloadMSFast= 5000;
(function() {
    setInterval(function() {
        let login = document.getElementsByTagName("span")[0].innerHTML.match(/\(([^)]+)\)/)[1]; // get login from top of page
        let xhr = new XMLHttpRequest();
        xhr.reponseType = "document";
        xhr.overrideMimeType('text/xml');
        xhr.open("POST", "/indirect_action/signin_indirect_action");
        let data = new FormData();
        data.append("name", login);
        data.append("code", "ASM");
        xhr.onreadystatechange = function() {
            if(xhr.readyState != xhr.DONE) return;
            let msg = xhr.responseXML.getElementsByClassName("Positive")[0].innerHTML;
            let d = new Date();
            try {
                let flash = document.getElementsByClassName("Positive")[0];
                flash.innerHTML = msg.substring(0, msg.length - 2) + " at " + d.toLocaleTimeString();
            } catch {
                let flash = document.createElement("div");
                flash.id = "Flash";
                flash.classList.add("Flash");
                let pos = document.createElement("div");
                pos.classList.add("Positive");
                flash.appendChild(pos);
                let head = document.getElementsByTagName("h1")[0];
                pos.innerHTML = msg.substring(0, msg.length - 2) + " at " + d.toLocaleTimeString() + ".";
                head.before(flash);
            }
        };
        xhr.send(data);
    }, reloadMSFast);
    
})();
