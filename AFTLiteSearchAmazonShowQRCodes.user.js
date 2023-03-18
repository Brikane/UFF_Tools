// ==UserScript==
// @name         AFTLiteSearchAmazonShowQRCodes
// @namespace    https://github.com/Brikane/UFF_Tools
// @version      2.1
// @description  Shows Location and ASIN QR Codes
// @author       brikane@
// @match        https://aftlite-na.amazon.com/inventory/view_inventory_for_asin*
// @match        https://aftlite-portal.amazon.com/inventory/view_inventory_for_asin_display*
// @downloadURL  https://github.com/Brikane/UFF_Tools/raw/master/AFTLiteShowQRCodes.user.js
// @updateURL    https://github.com/Brikane/UFF_Tools/raw/master/AFTLiteShowQRCodes.user.js
// @grant        none
// ==/UserScript==
// Vars

var titleTagID = "strong";
var baseURL = "https://www.amazon.com/s?k=";
var endURL = "&i=amazonfresh";

var asinTag = "h2";
var qrImgUrlStart = 'https://chart.apis.google.com/chart?cht=qr&chs=100x100&chld=L|0&chl=';
var asinLength = 10;

var localTag = "table";
var cellIndex = 0;

var endTableRowIgnore = 5;

// Main
(function() {
    'use strict';
    addASIN_QRCode();
    addLocationQRCodes();
    addSearchButton();
})();

// Functions

function addASIN_QRCode(){
    var titleEl = document.getElementsByTagName(asinTag);
    var titleNameEl = titleEl[0] ;
    var itemName = titleNameEl.innerHTML;
     itemName = itemName.trim();
     itemName = itemName.slice(itemName.length-asinLength,itemName.length);
    //itemName = itemName.replace(/\s/g, '+');

    var qrImage = createQRCode(itemName);
    titleEl[0].appendChild(qrImage);
}

function addLocationQRCodes(){
    console.log("FIndingLocations...");
    var table = document.getElementsByTagName(localTag)[1];
    var numRows = table.rows.length;
    for(let row of table.rows) {
        if (row.rowIndex > numRows-endTableRowIgnore){
            var newCell = row.insertCell(cellIndex);
            newCell.appendChild(document.createTextNode(" "));
        } else if (row.rowIndex > 0   ){
            let cell = row.cells[0];
            var loc = cell.innerHTML.split("[")[0].trim();
            loc = loc.slice(loc.lastIndexOf('>')+1,loc.length);
            console.log(loc);
            var qrCode = createQRCode(loc);
            var newCell = row.insertCell(cellIndex);
            newCell.appendChild(qrCode);
        }else if (row.rowIndex == 0){
            var newCell = row.insertCell(cellIndex);
            newCell.appendChild(document.createTextNode("QRCode"));
        }
    }
}

function createQRCode(qrCodeStr){
    var img = document.createElement("img");
    console.log("QR: " + qrCodeStr);
    img.src = qrImgUrlStart + encodeURIComponent(qrCodeStr);

    return img;

    }

function addSearchButton(){
    var titleEl = document.getElementsByTagName(titleTagID);
    var titleNameEl = titleEl[0].nextSibling;
    var itemName = titleNameEl.nodeValue;
    itemName = itemName.trim();
    itemName = itemName.replace(/\s/g, '+');
    console.log("Title: " + itemName);
    var openURL = baseURL + itemName + endURL;
    console.log("URL: " + openURL);

    var button_Search = createButton("Search Amamzon ");
    button_Search.onclick = function () {
        window.open(openURL);
    };

    titleEl[0].appendChild(button_Search);
}

function createButton(name) {
    var button = document.createElement('button');
    button.innerHTML = name;
    console.log("createButton success");
    return button;
}


