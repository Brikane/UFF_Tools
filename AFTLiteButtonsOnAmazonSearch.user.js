// ==UserScript==
// @name         AFTLiteButtonsOnAmazonSearch
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  adds buttons to open amazon search items in AFTLite
// @author       brikane
// @match        https://www.amazon.com/*
// @icon         https://www.google.com/s2/favicons?domain=codepen.io
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @grant       GM_addStyle
// @grant       GM_openInTab
// ==/UserScript==



var asinTag = "a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal";
var asinSplit = "dp/";
var asinLength = 10;
var baseURL = "https://aftlite-na.amazon.com/inventory/view_inventory_for_asin?asin=";

var linkList = [];
//var buttonList;
//---------------------- MAIN
(function() {
    'use strict';
    idASINS();
})();

function idASINS(){
    var elList = document.getElementsByClassName(asinTag);

    console.log("El Count:" , elList.length);
    var button_Search ="";
    for (let index = 0; index < elList.length; index++) {
        var element = elList[index].getAttribute("href");
        var asinStr = element.split(asinSplit).pop().substring(0,asinLength);
        // console.log("Link:" + asinStr);
        var openURL = baseURL + asinStr;
        linkList.push(openURL);
        button_Search = createButton("AFTLite: " + asinStr);
        console.log("Link:" + openURL);
        button_Search.onclick = function () {
            console.log("Link:" + linkList[index]);
            window.open(linkList[index]);
        };
        //buttonList.append(button_Search);
        elList[index].parentElement.append(button_Search);
    }
}

function createButton(name) {
    var button = document.createElement('button');
    button.innerHTML = name;
    //console.log("createButton success");
    return button;
}


