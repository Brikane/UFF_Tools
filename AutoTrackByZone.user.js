
// ==UserScript==
// @name         AutoTrackByZone
// @namespace    http://tampermonkey.net/
// @version      1.0 (11/20/2022)
// @description  auto tracks AA by path and zone
// @author       Brikane @ UIL1
// @match        https://aftlite-na.amazon.com/labor_tracking/find_people*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_addStyle
// ==/UserScript==


// -------- Vars -------------------------------

//--- User Settings
var retrackSettings = [
    ["ZONE_Letter", "PATH", 999, "NEW_CODE"]
    ,["f", "pack", 10, "OBINDIRECT" ]
    //,["c", "pack", 10, "OBINDIRECT" ]
    //,["a", "pack", 10, "T_OBINDIRECT" ]
    //,["b", "pack", 10, "T_OBINDIRECT" ]
];
/* 
    ZONES:
    "f" frozen
    "c" chilled/chilled produce
    "b" bigs (only if in bis section does not work for bigs in ambient)
    "a" ambient wil include anything in ambient
*/

var reloadSecondsTime = 120; // seconds

// var zoneCodes = [["ambient", "a"], ["chilled", "c"], ["bigs", "b"], ["frozen", "f"]];

// --- HTML Ids and tag code 
var table_id = "recent_event_table";

var aaLoginTextboxID = "name"; // input with name tag
var laborCodeTextboxID = "code"; // inout with name tag
var submitButtonID = "button"; // just a button 

// --- Data Storage and capture 
var tableReadIn = [];
var reCodeArr = [];
// --- Timing 
var baseWaitTime = 5;
var milliToSeconds = 1000;

// ---------------- MAIN FUNCTION-----------------------------

(function() {
    'use strict';

    // Your code here...
    setTimeout(function(){
        tableReadIn = table_to_array(table_id);
        console.log("Table: " + tableReadIn.length);
        parseReCodes();
        implementRecode();
    }, (baseWaitTime*milliToSeconds));

    setTimeout(function(){   document.location.reload();}, (reloadSecondsTime*milliToSeconds));
})();

// --------------------- Script Specific FUNCTIONS -----------------

function parseReCodes(){
    reCodeArr = [];
    var tLogin = "";
    var tCode = "";
    var tLocal = "";
    var tTime = 0;
    var doRecode = false;
    for (let i = 0; i < tableReadIn.length; i++) {
        const el = tableReadIn[i];
        try {
            doRecode = false;
            tLogin = strStripLowercase(el[2]);
            tLocal = strStripLowercase(el[4].substr(4,1));
            tCode = strStripLowercase(el[7]);
            tTime = parseInt(parseFirstWord(el[5]),10); 
            
            for (let j = 0; j < retrackSettings.length; j++) {
             
                const jEl = retrackSettings[j];
                if(jEl[0]== tLocal && jEl[1] == tCode && jEl[2] < tTime){
                       doRecode = true;
                       reCodeArr.push(tLogin,jEl[3]);
                }
            }

            /*
            var doRecode = true;
            if(tLogin.length < 1) doRecode = false;
            if(tLocal !== "c") doRecode = false;
            if(tCode.localeCompare("pack") != 0) doRecode = false;
            if(tTime < 1) doRecode = false;
             if(doRecode){
                reCodeArr.push([tLogin,"ERROR_TEST_NA"]);
            }
            */

            console.log(doRecode +"_Recode:" + tLogin + "_Zone:" + tLocal + "_Code:" + tCode + "_Time:"+tTime);
           
        } catch (error) {
            console.log("Parse: " + error);
        }
        
    }
}

function implementRecode(){

    console.log("Recode: " + reCodeArr );
    try {
        reCodeArr.forEach(el => {
             recode(el[0], el[1]);
        });
    } catch (error) {
        console.log("Recode: " + error);
    }
    
}

function recode(aaLogin, laborCode){
    console.log("Recoding: "+ aaLogin + " to " + laborCode);
    document.getElementsByName(aaLoginTextboxID)[0].value = aaLogin;
    document.getElementsByName(laborCodeTextboxID)[0].value = laborCode;

    var targetNode =  document.getElementsByTagName(submitButtonID)[0];
    triggerMouseEvent (targetNode, "click");
}

// --------------- Agnostic Functions -------------------
function table_to_array(table_id) {
    var myData = document.getElementById(table_id).rows
     //console.log(myData)
     var my_liste = []
     for (var i = 0; i < myData.length; i++) {
             el = myData[i].children
             my_el = []
             for (var j = 0; j < el.length; j++) {
                     my_el.push(el[j].innerText);
             }
             my_liste.push(my_el)
 
     }
     return my_liste
 }

 function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}
 
function strStripLowercase(tStr){
    tStr = tStr.trim();
    tStr = tStr.toLowerCase();
    return tStr;
}

function parseFirstWord(inText){
    var rtnStr = "";
    inText = inText.trim();
    var index = inText.indexOf(' ');
    if(index > 0 && index < inText.length){
      inText = inText.substring(0,index);
  }
  return inText;
}
 /*

ReaD IN Table strucure
2: login code -> Clean ans store
4: location code
5: time since event 
7: action code 


*/
