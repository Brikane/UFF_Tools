// ==UserScript==
// @name         AFTLiteSearchAmazon
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  opens a new tab with an Amazon fresh search for the item
// @author       brikane @ UIL1
// @match        https://aftlite-na.amazon.com/inventory/view_inventory_for_asin*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


// Vars

var titleTagID = "strong";
var baseURL = "https://www.amazon.com/s?k=";
var endURL = "&i=amazonfresh";
// Main
(function() {
    'use strict';
    addSearchButton();

})();

// Functions

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
