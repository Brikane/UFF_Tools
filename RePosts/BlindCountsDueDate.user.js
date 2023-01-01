// ==UserScript==
// @name         BlindCountsDueDate
// @namespace    https://github.com/Brikane/UFF_Tools/RePosts
// @version      19.0
// @description  Show the date/time that blind counts are due
// @author       grajef@ Repost @brikane
// @match        https://aftlite-na.amazon.com/bcc/assign*
// @match        https://aftlite-portal.amazon.com/bcc_admin/assign*
// @downloadURL  https://raw.githubusercontent.com/Brikane/UFF_Tools/RePosts/master/BlindCountsDueDate.user.js
// @updateURL    https://raw.githubusercontent.com/Brikane/UFF_Tools/RePosts/master/BlindCountsDueDate.user.js
// @grant        none
// ==/UserScript==

(function() {
    let table = window.location.href.match("aftlite-na") ? document.querySelectorAll("table")[1] : document.querySelectorAll("table")[0];
    let head = document.createElement("th");
    head.innerHTML = "Due By";
    table.children[0].children[0].appendChild(head);
    let head2 = document.createElement("th");
    head2.innerHTML = "Bins";
    table.children[0].children[0].appendChild(head2);

    let map = new Map();
    let today = new Date();
    for(let row of table.rows) {
        try{
            if(row.rowIndex == 0) continue;
            // Second_AdHoc_2020-11-16_04-33-21
            let title = row.cells[0].innerHTML.split(">")[1].split("<")[0];
            title = title.replace("Second_", "").replace("Third_", "");
            if(title.includes("AdHoc")) {
                // AdHoc_2020-11-16_04-33-21
                title = title.replace("Second_", "").replace("Third_", "");
                // AdHoc 2020-11-16 04-33-21
                let date = title.split("_");
                // 04 33 21
                let d2 = date[2].split("-");
                // 2020-11-16T04:33:21.000Z
                let d = new Date(date[1] + "T" + d2.join(":") + ".000Z"); // create date as UTC and it will convert to local time
                d = new Date(d.getTime() + 60 * 60 * 24 * 1000);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);

            }
            else if(title.includes("Ad_Hoc_2_") || title.includes("Ad_Hoc_3_")) {
                // AdHoc 2020-11-16 04-33-21
                let date = title.split("_");
                // 04 33 21
                // 2020-11-16T04:33:21.000Z
                let d = new Date(date[4] + "-" + date[5] + "-" + date[6]); // create date as UTC and it will convert to local time
                d = new Date(d.getTime() + 60 * 60 * 48 * 1000);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else if(title.includes("Ad_Hoc")) {
                // AdHoc 2020-11-16 04-33-21
                let date = title.split("_");
                // 04 33 21
                // 2020-11-16T04:33:21.000Z
                let d = new Date(date[3] + "-" + date[4] + "-" + date[5]); // create date as UTC and it will convert to local time
                d = new Date(d.getTime() + 60 * 60 * 48 * 1000);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else if(title.includes("I_RDR")) {
                // I_RDR_{FC}_MM_DD_YYYY_{n}
                let date = title.split("_");
                let l = date.length;
                let year = date[l - 2];
                let day = date[l - 3];
                let month = date[l - 4];
                let d = new Date(month + "/" + day + "/" + year);
                d.setDate(d.getDate() + 6);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else if(title.includes("MachineLearning")) {
                let date = title.split("_");
                // 04 33 21
                // 2020-11-16T04:33:21.000Z
                let dateSplit = date[date.length-1].split("-");
                let d = new Date(dateSplit[2] + "-" + dateSplit[0] + "-" + dateSplit[1] + "T01:01:01.000Z"); // create date as UTC and it will convert to local time
                console.log(d);
                d = new Date(d.getTime() + 60 * 60 * 48 * 1000);
                d.setDate(d.getDate() + 5);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else if(title.includes("VirtuallyEmpty")) {
                // I_RDR_{FC}_MM_DD_YYYY_{n}
                let date = title.split("_");
                date = date[date.length - 1].split("-");
                let d = new Date(date[0] + "/" + date[1] + "/" + date[2]);
                d.setDate(d.getDate() + 1);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else if(title.includes("TurkeyAsins")) {
                // {FC}_TurkeyAsins_tempzone_mm_dd_yyyy_{n}
                let date = title.split("_");
                date = date[date.length - 1].split("-");
                let l = date.length;
                let d = new Date(date[0] + "/" + date[1] + "/" + date[2]);
                d.setHours(12);
                d.setMinutes(0);
                d.setSeconds(0);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else if(title.includes("W2W_SOX")) {
                // I_RDR_{FC}_MM_DD_YYYY_{n}
                let date = title.split("_");
                let l = date.length;
                let year = date[l - 1];
                let day = date[l - 2];
                let month = date[l - 3];
                let d = new Date(month + "/" + day + "/" + year);
                d.setDate(d.getDate() + 1);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            else {
                let date = title.split("_");
                date = date[date.length - 1].split("-");
                let d = new Date(date[0] + "/" + date[1] + "/" + date[2]);
                d.setDate(d.getDate() + 1);
                SetTimes(d);
                let data = document.createElement("td");
                data.innerHTML = d.toLocaleString();
                row.appendChild(data);
                SetTimes(today);
                HighlightDate(data, today, d);
            }
            // Check status of users assigned to count
            let assignedUsers = row.cells[2].querySelectorAll("a");
            for(let user of assignedUsers) {
                let login = window.location.href.match("aftlite-portal") ? user.innerHTML.split(" ")[2].replace(")", "") : user.innerHTML.split(" ")[1].replace(")", "");
                // get last action
                if(!map.has(login)) {
                    let request = new XMLHttpRequest();
                    request.open("GET", "/labor_tracking/lookup_history?user_name=" + login);
                    request.responseType = "document";
                    request.onloadend = function() {
                        let lastAction = "";
                        if(window.location.href.match("aftlite-portal")) {
                            let table = request.responseXML.getElementsByTagName("table")[1];
                            lastAction = table.rows[1].cells[1].lastChild.textContent.trim();
                        } else {
                            let table = request.responseXML.getElementsByClassName("reportLayout")[0];
                            lastAction = table.rows[1].cells[1].innerHTML.trim();
                        }
                        let cell = row.cells[2];
                        map.set(login, lastAction);
                        if(lastAction == "EOS") {
                            cell.innerHTML = cell.innerHTML.replace(login, `<span style="background-color:red;">${login}(${lastAction})</span>`);
                        } else cell.innerHTML = cell.innerHTML.replace(login, `${login}(${lastAction})`);
                    }
                    request.send();
                }
                else {
                    let cell = row.cells[2];
                    let lastAction = map.get(login);
                    if(lastAction == "EOS") {
                        cell.innerHTML = cell.innerHTML.replace(login, `<span style="background-color:red;">${login}(${lastAction})</span>`);
                    } else cell.innerHTML = cell.innerHTML.replace(login, `${login}(${lastAction})`);
                }
            }
        } catch(e) {
            console.log(e);
        }
    }
    let btn = document.createElement("button");
    btn.innerHTML = "Load bins";
    head2.after(btn);
    btn.onclick = function() {
        for(let row of table.rows) {
        // check the time for due date
            try{
                let listLink = row.children[0].getElementsByTagName("a")[0].href.replace("https://aftlite-na.amazon.com", "");
                let req = new XMLHttpRequest();
                req.open("GET", listLink);
                req.responseType = "document";
                req.onload = function() {
                    let total = 0;
                    let complete = 0;
                    var bins = 0;
                    if(window.location.href.match("aftlite-na")) {
                        bins = this.responseXML.getElementsByClassName("reportLayout")[0].children[1]; // tbody of the table
                    } else {
                        bins = this.responseXML.querySelector("table");
                        total = -1;
                        complete = -1;
                    }
                    for(let bin of bins.rows) {
                        total++;
                        if(!bin.cells[2].innerHTML.includes("Incomplete")) {
                            complete++;
                        }
                    }
                    let d = document.createElement("td");
                    d.innerHTML = complete + "/" + total;
                    if(total > 1000) d.style.backgroundColor = "red";
                    row.appendChild(d);
                }
                req.send();
            } catch(error) {
                console.log(error);
            }
        }
    }
    // sort the table
    // a.	Any IRDR Counts
    // b.	Oldest 2nd and 3rd AdHocs
    // c.	Oldest 2nd and 3rd strategics
    // d.	Newest 1st AdHocs
    // e.	Newest 1st Strategic
    var rows, i, x, y;
    var switching = true;
    let td = new Date();
    SetTimes(td);
    while (switching) {
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
    first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            x = rows[i];
            y = rows[i + 1];
            let priorityX = 0;
            let priorityY = 0;
            let xDue = new Date(x.cells[3].textContent);
            let yDue = new Date(y.cells[3].textContent);
            if (isNaN(xDue)) priorityY -= 30;
            if (isNaN(yDue)) priorityX -= 30;
            if(xDue.getTime() < td.getTime()) priorityX += 15;
            if(yDue.getTime() < td.getTime()) priorityY += 15;
            if(xDue.getTime() === td.getTime()) priorityX += 5;
            if(yDue.getTime() === td.getTime()) priorityY += 5;
            if(x.cells[0].textContent.includes("Third")) priorityX += 4;
            if(y.cells[0].textContent.includes("Third")) priorityY += 4;
            if(x.cells[0].textContent.includes("Second")) priorityX += 3;
            if(y.cells[0].textContent.includes("Second")) priorityY += 3;
            if(x.cells[0].textContent.includes("Ad_Hoc")) priorityX += 2;
            if(y.cells[0].textContent.includes("Ad_Hoc")) priorityY += 2;
            if(x.cells[0].textContent.includes("I_RDR")) priorityX += 1;
            if(y.cells[0].textContent.includes("I_RDR")) priorityY += 1;
            if(x.cells[0].textContent.includes("AdHoc")) priorityX -= 1;
            if(y.cells[0].textContent.includes("AdHoc")) priorityY -= 1;
            priorityX += DaysPastDue(xDue, td);
            priorityY += DaysPastDue(yDue, td);

            if(priorityY > priorityX) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
})();

function HighlightDate(cell, today, dueDate) {
    if(today.getDate() == dueDate.getDate() && today.getMonth() == dueDate.getMonth() && today.getFullYear() == dueDate.getFullYear()) {
                // count is due today
                cell.style.backgroundColor = "yellow";
            }
            else if(today.getFullYear() > dueDate.getFullYear() || today.getMonth() > dueDate.getMonth() || (today.getMonth() == dueDate.getMonth() && today.getDate() > dueDate.getDate())) {
                // count is late
                cell.style.backgroundColor = "red";
            }
}

function DaysPastDue(date, today) {
    if(isNaN(date)) return -3000;
    if(today.getTime() == date.getTime()) return 0;
    return (((today.getTime() - date.getTime()) / (1000 * 3600 * 24)) * 5); // 5 points for every day past due, +16 to guarantee it always has a higher priority than on time lists
}

function SetTimes(date) {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(0);
}
