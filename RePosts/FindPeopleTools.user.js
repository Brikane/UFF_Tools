// ==UserScript==
// @name         FindPeopleTools
// @namespace    https://github.com/Brikane/UFF_Tools/RePosts
// @version      10.0
// @description  Add auto refresh and highlight idle logins
// @author       grajef@ Repost by @brikane
// @match        https://aftlite-na.amazon.com/labor_tracking/find_people*
// @match        https://aftlite-portal.amazon.com/labor_tracking/find_people*
// @downloadURL  https://github.com/JGray0705/UserScripts/raw/master/FindPeopleTools.user.js
// @grant        none
// ==/UserScript==

(function() {
    if(window.location.href.match("aftlite-na")) {
        document.querySelector('input[name="user_message"]').size = "100";
        let table = document.getElementById("recent_event_table");
        searchTable(table);

        // auto refresh
        let cb = getCheckbox();
        let label = document.createElement("label");
        label.innerHTML = "Auto Refresh (2 Minutes)";
        let p = document.getElementsByTagName("table")[0];
        p.after(cb);
        p.after(label);

        // indirect action form
        var form = getIndirectForm();
        label.before(form);
        label.before(document.createElement("br"));
        form.before(document.createElement("br"));
    }
    else {
        let portalTable = document.getElementsByTagName("table")[0];
        searchTable(portalTable);
        let cbLabel = document.createElement("label");
        let check = getCheckbox();
        check.style.float = "left";
        check.style.marginLeft = "10px";
        check.style.marginRight = "4px";
        cbLabel.innerHTML = "Auto Refresh (2 Minutes)";
        let main = document.getElementById("main-content");
        main.before(check);
        check.after(cbLabel);
        //main.before(getIndirectForm());
    }
})();

function getCheckbox() {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onClick = autoReload(checkbox);
    checkbox.checked = true;
    return checkbox;
}

function searchTable(t) {
    let map = new Map();
    let directMap = new Map();
    let brkMap = new Map();
    let indirectMap = new Map();
    let zoneMap = new Map();
    let total = 0;
    for(let row of t.rows) {
        if(row.rowIndex < 1) continue; // first 2 rows of the table are not important
        let cell = row.cells[7].innerHTML.trim();
        if(cell == "Action") continue;
        addSchedule(row);
        if(!cell.includes("EOS/indirect")) {
            if(cell.includes("receive") || cell.includes("stow") || cell.includes("pack")) { // find the zone
                let bin = row.cells[4].innerHTML.trim();
                let zone = "";
                if(bin.startsWith("P-1-C")) zone = "Chilled";
                else if(bin.startsWith("P-1-F")) zone = "Frozen";
                else zone = "Ambient";
                let key = cell + "," + zone;
                if(zoneMap.has(key)) {
                zoneMap.set(key, zoneMap.get(key) + 1);
                } else {
                    zoneMap.set(key, 1);
                }
            }
            if(map.has(cell)) {
                map.set(cell, map.get(cell) + 1);
            } else {
                map.set(cell, 1);
            }
            total++;
            let timeSplit = row.cells[5].innerHTML.split("mins");
            let timeSinceScan = parseFloat(timeSplit[0]) + (parseFloat(timeSplit[1].split("secs")[0]) / 60);
            if(cell.includes("BRK") || cell.includes("START")) {
                brkMap.set(row.cells[2].getElementsByTagName('a')[0].innerHTML, [cell, timeSinceScan, row.cells[5].innerHTML]);
            }
            else if(!cell.includes("indirect")){
                directMap.set(row.cells[2].getElementsByTagName('a')[0].innerHTML, [cell, timeSinceScan, row.cells[5].innerHTML]);
            }
            else if(!cell.includes("EOS") && !cell.includes("ASM")){
                indirectMap.set(row.cells[2].getElementsByTagName('a')[0].innerHTML, [cell, timeSinceScan, row.cells[5].innerHTML]);
            }
        }
        let time = Number(row.cells[5].innerHTML.split("mins")[0]);
        if((time >= 15 && cell.includes("BRK")) || (time >= 10 && cell.includes("START"))) {
            row.cells[5].style.background = "#c730b8";
            row.cells[5].style.color = "white";
        }
        else if(time >= 10) {
            if(!cell.includes("indirect")) {
                row.cells[5].style.background = "red";
            }
        }
    }
    let div = document.createElement("div");
    t.before(div);
    // all functions table
    let head = document.createElement("tr");
    let table = document.createElement("table");
    table.style.float = "left";
    table.style.margin = "10px";
    div.appendChild(table);
    let entries = new Map([...map.entries()].sort((a,b) => b[1] - a[1]));
    let rowNum = 0;
    for(let m of entries) {
        let tr = document.createElement("tr");
        let action = document.createElement("td");
        let count = document.createElement("td");
        tr.id = m[0];
        tr.style.background = "#C2DFF0";
        action.innerHTML = m[0];
        count.innerHTML = m[1];
        action.style.width = "225px";
        count.style.width = "50px";
        tr.appendChild(action);
        tr.appendChild(count);
        table.appendChild(tr);
        rowNum++;
    }
    let tr = document.createElement("tr");
    let action = document.createElement("td");
    let count = document.createElement("td");
    tr.appendChild(action);
    tr.style.background = "#C2DFF0";
    tr.appendChild(count);
    table.appendChild(tr);
    action.innerHTML = "Total";
    count.innerHTML = total;
    table.classList.add("reportLayout");
    table.classList.add("a-bordered");
    table.classList.add("a-spacing-top-large");
    table.style.width = "275px";
    let zonesSorted = new Map([...zoneMap.entries()].sort((a, b) => String(b[0]).localeCompare(a[0])));
    for(let m of zonesSorted) {
        let a = m[0].split(",");
        let func = a[0];
        let zone = a[1];
        let tr = document.getElementById(func);
        let action = document.createElement("td");
        let count = document.createElement("td");
        let row = document.createElement("tr");
        row.style.background = "#DFFFC2";
        action.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + a[1];
        count.innerHTML = m[1];
        action.style.width = "225px";
        count.style.width = "50px";
        row.appendChild(action);
        row.appendChild(count);
        tr.after(row);
    }

    div.appendChild(createFunctionTable(directMap));
    div.appendChild(createFunctionTable(brkMap));
    div.appendChild(createFunctionTable(indirectMap));
}

function createFunctionTable(map) {
    let sorted = new Map([...map.entries()].sort((a,b) => b[1][1] - a[1][1]));
    let table = document.createElement("table");
    let head = document.createElement("tr")
    table.appendChild(head);
    let h1 = document.createElement("th");
    let h2 = document.createElement("th");
    let h3 = document.createElement("th");
    head.appendChild(h1);
    head.appendChild(h2);
    head.appendChild(h3);
    h1.innerHTML = "Login";
    h2.innerHTML = "Function";
    h3.innerHTML = "Time";
    let count = 0;
    for(let entry of sorted) {
        if(count >= 10) break;
        count++;
        let row = document.createElement("tr");
        let login = document.createElement("td");
        let action = document.createElement("td");
        let time = document.createElement("td");
        row.appendChild(login);
        row.appendChild(action);
        row.appendChild(time);
        table.appendChild(row);
        login.innerHTML = entry[0];
        action.innerHTML = entry[1][0];
        time.innerHTML = entry[1][2];
        login.style.width = "80px";
        action.style.width = "150px";
        time.style.width = "150px";
    }
    table.style.width = "380px";
    table.classList.add("reportLayout");
    table.classList.add("a-bordered");
    table.classList.add("a-spacing-top-large");
    table.style.float = "left";
    table.style.margin = "10px";
    return table;
}
function addSchedule(row) {
    let startDate = new Date();
    let endDate = new Date(startDate.getTime() + 3600000 * 24);
    let sMonth = startDate.getMonth() >= 9 ? startDate.getMonth() + 1 : "0" + (startDate.getMonth() + 1);
    let sDay = startDate.getDate() >= 10 ? startDate.getDate() : "0" + startDate.getDate();
    let sYear = startDate.getFullYear();
    let eMonth = endDate.getMonth() >= 9 ? endDate.getMonth() + 1 : "0" + (endDate.getMonth() + 1);
    let eDay = endDate.getDate() >= 10 ? endDate.getDate() : "0" + endDate.getDate();
    let eYear = endDate.getFullYear();
    let login = row.cells[2].getElementsByTagName('a')[0].innerHTML;
    let start = sYear + "-" + sMonth + "-" + sDay;
    let end = eYear + "-" + eMonth + "-" + eDay;
    let url = "<a href='http://precision.integ.amazon.com:8080/schedulelookup?login=" + login + "&start=" + start + "&end=" + end + "' target='_blank'>";
    row.cells[3].innerHTML = url + "Show Schedule</a>";
}

function autoReload(checkbox) {
    setInterval(function() {
        if(checkbox.checked) {
            location.reload();
        }
    }, 120000);
}

function getIndirectForm() {
    let loginInput = document.createElement("input");
    let codeInput = document.createElement("input");
    let submitButton = document.createElement("button");
    loginInput.type = "text";
    loginInput.name = "name";
    codeInput.type = "text";
    codeInput.name = "code";
    submitButton.innerHTML = "signin";

    let table = document.createElement("table");
    let row1 = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    td1.innerHTML = "Scan Badge/Enter Login";
    td2.appendChild(loginInput);
    row1.appendChild(td1);
    row1.appendChild(td2);
    table.appendChild(row1);

    let row2 = document.createElement("tr");
    let td3 = document.createElement("td");
    let td4 = document.createElement("td");
    td3.innerHTML = "Scan Activity Code";
    td4.appendChild(codeInput);
    row2.appendChild(td3);
    row2.appendChild(td4);
    var td5 = document.createElement("td");
    td5.appendChild(submitButton);
    row2.appendChild(td5);
    table.appendChild(row2);

    submitButton.onclick = function() {
        let data = new FormData();
        data.append("name", loginInput.value);
        data.append("code", codeInput.value);
        data.append("utf8", "x2713");

        let request = new XMLHttpRequest();
        let action = window.location.href.match("aftlite-na") ? '/indirect_action/signin_indirect_action' : '/indirect_action/validate_name_and_code';
        request.open('POST', action);
        request.responseType = "document";
        request.onload = function() {
            let f = document.getElementById("Flash");
            if(f !== null) { f.innerHTML = this.responseXML.getElementById("Flash").innerHTML; }
            else { table.before(this.responseXML.getElementById("Flash")); }
        }
        request.send(data);
        loginInput.value = "";
        codeInput.value = "";
    }
    // add event to submit form when enter key is pressed
    codeInput.addEventListener("keydown", function(e) {
        if(e.keyCode == 13) {
            submitButton.click();
        }
    });
    return table;
}

function submitIndirectForm(login, code, indirectForm) {
    let data = new FormData();
    data.append("name", login);
    data.append("code", code);
    data.append("utf8", "x2713");

    let request = new XMLHttpRequest();
    let action = window.location.href.match("aftlite-na") ? '/indirect_action/signin_indirect_action' : '/indirect_action/validate_name_and_code';
    request.open('POST', action);
    request.responseType = "document";
    request.onload = function() {
        let f = document.getElementById("Flash");
        if(f !== null) { f.innerHTML = this.responseXML.getElementById("Flash").innerHTML; }
        else { indirectForm.before(this.responseXML.getElementById("Flash")); }
    }
    request.send(data);
}
