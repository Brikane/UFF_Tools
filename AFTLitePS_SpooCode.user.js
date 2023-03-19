// ==UserScript==
// @name         AFTLitePS_SpooCode
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://aftlite-na.amazon.com/wms/tote_slam_prompt*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

// REQUIRES OBPS Helper Script to Function 
var spooStoreKey = "AFTSpooKey"; // store an array of arrays {[picklistId, spoo, datetime]}
var spooStoreValue = [[0,"0",0]];
var picklistLength = 8;
var picklistOffSet = 19;

var qrImgUrlStart = 'https://chart.apis.google.com/chart?cht=qr&chs=100x100&chld=L|0&chl=';

var doDebug = true;

var timeInDay = 24*60*60*1000;

(function() {
    'use strict';
    addSpooCodes();
    cleanSpooStorage();
    // var spoo = readStorage(spooStoreKey);
   //  if(doDebug) console.log("Spoo: " + spoo);
   //  document.body.append(document.createTextNode(spoo));
    // Your code here...
})();
    // Util Func --------------------------------------------

function addSpooCodes(){
   // var spoo = readStorage(spooStoreKey, picklistId);
    //console.log("SpooStore: " + spoo);

    var content = document.body.textContent || document.body.innerText;
    var picklistIndex  = content.indexOf("Finished picklist [");
    if(doDebug) console.log("PL Index: " + picklistIndex);
    var picklistId = "ERROR";
    if (picklistIndex >= 0) {
        picklistId = content.substring(picklistIndex+picklistOffSet,picklistOffSet+ picklistIndex+ picklistLength);
    }

    if(doDebug) console.log("PL ID: " + picklistId);

    var spoo = readStorage(spooStoreKey, picklistId).trim();
    console.log("SpooStore: " + spoo);
    document.body.append(document.createTextNode(spoo));
    var qrImage = createQRCode(spoo);
    document.body.appendChild(qrImage);
    for(let index = 0; index < spoo.length; index++) {
        var spooRow = spoo[index];

    }



}


 function setStorage(sKey, sValue){
    localStorage.setItem(sKey, sValue);
 }

 function readStorage(sKey, pickId){
     var rtnValue = "ERROR";
     var tArray = JSON.parse(localStorage.getItem(sKey) || "[]");
     if(Array.isArray(tArray)){
        if(doDebug) console.log("StorageIsArray");
        tArray.forEach(element => {
            if(Array.isArray(element)){
                if(doDebug) console.log("Second Level Array: " + element[0] + " and " + pickId);
                if( element[0] == pickId){
                    if(doDebug) console.log("Spoo Returned: " + element[1]);
                    rtnValue = element[1];
                    return rtnValue;
                }
            }
        });
     }else{
        if(doDebug) console.log("No Array Stright Spoo");
        rtnValue = tArray;
     }
     return rtnValue;
 }

 function cleanSpooStorage(){
    var tArray = localStorage.getItem(spooStoreKey);
    var removalsList = [];
    if(tArray.isArray()){
        for (let index = 0; index < tArray.length; index++) {
            var element = tArray[index];
            if(element.isArray()){
                if(element[2] < Date.now()-timeInDay){
                    if(doDebug) console.log("AddIndex: " +index);
                    removalsList.push(index);
                }
            }
        }

    }
   for (let index = removalsList.length-1; index >= 0; index) {
       const element = removalsList[index];
       if(element == index){
           tArray.splice(index);
       }
   }
 }

function createQRCode(qrCodeStr){
    var img = document.createElement("img");
    console.log("QR: " + qrCodeStr);
    img.src = qrImgUrlStart + encodeURIComponent(qrCodeStr);

    return img;

    }
