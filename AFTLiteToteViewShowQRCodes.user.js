// ==UserScript==
// @name         AFTLiteToteViewShowQRCodes
// @namespace    https://github.com/Brikane/UFF_Tools
// @version      1.0
// @description  Shows Location and ASIN QR Codes
// @author       brikane@
// @match        https://aftlite-na.amazon.com/wms/view_tote_assignment*
// @downloadURL  https://github.com/Brikane/UFF_Tools/raw/main/AFTLiteToteViewShowQRCodes.user.js
// @updateURL    https://github.com/Brikane/UFF_Tools/raw/main/AFTLiteToteViewShowQRCodes.user.js
// @grant        none
// ==/UserScript==
// Vars



var asinTag = "h2";
var qrImgUrlStart = 'https://chart.apis.google.com/chart?cht=qr&chs=100x100&chld=L|0&chl=';
var asinLength = 10;
var ASINspaceing  = 7;

var ASINlinkStart = "https://aftlite-na.amazon.com/inventory/view_inventory_for_asin?asin=";
var endTableRowIgnore = 4;
var location_name_Id = 'location_name';

var localTag = "table";
var cellIndex = 0;

var spooTableRow = 3;
var spooTableCol = 1;
var qrAncClassName = "MediumLabel";

// Main
(function() {
    'use strict';
    addToteQRCode();
    addLinkForItems();
 
})();

// Functions

function addUnk(){

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const param_location_name = urlParams.get(location_name_Id);
    console.log(param_location_name);
    
    var titleEl = document.getElementsByTagName(asinTag);
    /** 
    var titleNameEl = titleEl[0] ;
    var itemName = titleNameEl.innerHTML;
     itemName = itemName.trim();
     itemName = itemName.slice(itemName.length-asinLength,itemName.length);
    //itemName = itemName.replace(/\s/g, '+');
    */

    var qrImage = createQRCode(param_location_name);
    titleEl[0].appendChild(qrImage);
}

function addToteQRCode(){
    var qrAnncor = document.getElementsByClassName(qrAncClassName)[0];
    var table = document.getElementsByTagName(localTag)[1];
    var numRows = table.rows.length;
    if(numRows >= spooTableRow){
        var row = table.rows[spooTableRow];
        var cell = row.cells[spooTableCol];
        var spoo = cell.innerHTML;
        console.log(spoo);
        var qrCode = createQRCode(spoo);
        //var newCell = row.insertCell(cellIndex);
        qrAnncor.appendChild(qrCode);

    }
}

function addLinkForItems(){
    console.log("FindingASINS...");
    var table = document.getElementsByTagName(localTag)[2];
    var numRows = table.rows.length;
    for(let row of table.rows) {
         if (row.rowIndex > 0   ){
            let cell = row.cells[1];
            var loc = cell.innerHTML.trim();
           
            //loc = loc.slice(loc.indexOf('>')+1,loc.length);
            //loc = loc.slice(0, loc.indexOf('<'));
            console.log(loc);
            cell.appendChild(createASINLink(loc));
             
             //var qrCode = createQRCode(loc);
           // var newCell = row.insertCell(cellIndex);
            //newCell.appendChild(qrCode);
        }else {
            //var newCell = row.insertCell(cellIndex);
           // newCell.appendChild(document.createTextNode(" "));
        }
    }
}

function createQRCode(qrCodeStr){
    var img = document.createElement("img");
    console.log("QR: " + qrCodeStr);
    img.src = qrImgUrlStart + encodeURIComponent(qrCodeStr);

    return img;

    }

function createButton(name) {
    var button = document.createElement('button');
    button.innerHTML = name;
    console.log("createButton success");
    return button;
}

function createASINLink(asinValue){
    var linkstr = document.createElement('a');
    var linkTitle =  document.createTextNode("Inv");
    linkstr.appendChild(linkTitle);
    linkstr.title = asinValue;
    linkstr.href = ASINlinkStart + asinValue;
    return linkstr;
}



