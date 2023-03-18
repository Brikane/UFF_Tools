// ==UserScript==
// @name         AFTLiteBinViewShowQRCodes
// @namespace    https://github.com/Brikane/UFF_Tools
// @version      1.1
// @description  Shows Location and ASIN QR Codes
// @author       brikane@
// @match        https://aftlite-na.amazon.com/inventory/view_inventory_at*
// @match        https://aftlite-portal.amazon.com/inventory/view_inventory_at*
// @downloadURL  https://github.com/Brikane/UFF_Tools/raw/master/AFTLiteShowQRCodes.user.js
// @grant        none
// ==/UserScript==
// Vars



var asinTag = "h2";
var qrImgUrlStart = 'https://chart.apis.google.com/chart?cht=qr&chs=100x100&chld=L|0&chl=';
var asinLength = 10;
var ASINspaceing  = 7

var altTitleStart = 22;
var altTitleEnd = '[';
var location_name_Id = 'location_name';

var localTag = "table";
var cellIndex = 0;

// Main
(function() {
    'use strict';
    addASIN_QRCode();
    addLocationQRCode();
 
})();

// Functions

function addLocationQRCode(){

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var param_location_name = urlParams.get(location_name_Id);
    console.log(param_location_name);
    
    var titleEl = document.getElementsByTagName(asinTag);
    
    if(param_location_name == null){
        var titleNameEl = titleEl[0] ;
        var itemName = titleNameEl.innerHTML;
        itemName = itemName.trim();
        itemName = itemName.slice(altTitleStart,itemName.indexOf(altTitleEnd)).trim();
        console.log("Alt: " + itemName);
        param_location_name = itemName
    }

    var qrImage = createQRCode(param_location_name);
    titleEl[0].appendChild(qrImage);
}

function addASIN_QRCode(){
    console.log("FindingASINS...");
    try{
        var table = document.getElementsByTagName(localTag)[1];
        for(let row of table.rows) {
            if (row.rowIndex % ASINspaceing == 0    ){
                let cell = row.cells[0];
                var loc = cell.innerHTML.trim();
                loc = loc.slice(loc.indexOf('>')+1,loc.length);
                loc = loc.slice(0, loc.indexOf('<'));
                console.log(loc);
                var qrCode = createQRCode(loc);
                var newCell = row.insertCell(cellIndex);
                newCell.appendChild(qrCode);
            }else {
                var newCell = row.insertCell(cellIndex);
                newCell.appendChild(document.createTextNode(" "));
            }
        }
    }catch(err) {
       console.log("Error: " + err);
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


