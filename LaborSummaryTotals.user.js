// ==UserScript==
// @name         LaborSummaryTotals
// @namespace    http://tampermonkey.net/
// @version      0.2 3/2/2022
// @description  Roll up Labor Summery into totals, OB, IB< Indirect, UPH
// @author       brikane @ UIL1
// @match        https://aftlite-na.amazon.com/labor_tracking/labor_summary*
// @icon         https://www.google.com/s2/favicons?domain=amazon.com
// @grant        GM_addStyle
// ==/UserScript==

//--------------- Data Vars
var myTableArray = [];
var displayTableArray = [];
var totalIBUnitsValue = 0;
var totalOBUnitsValue = 0;
var totalHoursValue = 0;
var ibRateValue = 0;
var totalOBHours = 0;
var totalIBHours = 0;
var obRateValue = 0;

var bccUnitsValue = 0;
var bccHoursValue = 0;

var downtimeHours = 0;
var obIndirectHours = 0;
var ibIndirectHours = 0;
var stnIndirectHours = 0;
var totalExtraHours = 0;

var totalDPMOUnits = 0;


//-------------- Keys
var tableKey = "labor_summary_table";
var nextElementAfterDisplayIDKey = "labor_summary_table";
var nextElementAfterDisplayTagKey = "b";
var displayInsertKey = "beforeBegin";
var hoursIndexKey = 3;
var unitsIndexKey = 2;
var unitOBidKey = ["pack"];
var unitIBidKeys = ["stow", "receive2_direct", "receive_direct", "receive_ced" ];

var ibFunctionKeys = ["stow", "receive2_direct", "receive_direct", "IBINDIRECT", "SPECINDIRECT", "receive2" ];
var obFunctionKeys = ["pack", "BATCHING", "pack_problem", "OB", "OBINDIRECT"];
var ibIndirectFunctionKeys = ["IBINDIRECT", "adjust", "bulk_move", "cubiscan", "move-to", "receive_transfer", "stow_move", "update expiry"];
var obIndirectFunctionKeys = ["BATCHING", "pack_problem", "OB", "OBINDIRECT"];
var bccFunctionKeys = ["bcc"];
var indirectFunctionKeys = ["SPECINDIRECT", "ICQA", "ICQAINDIRECT", "BRK", "ADMN", "IDLE", "START", "WWHUDDLE", "damage", "dispose", "inventory", "unpack", "TRN", "TOINDIRECT", "ASM"];
var downtimeFunctionKeys = ["DOWNTIME"];
var extraHoursKeys = ["DOWNTIME", "ALTBIZ", "RENOPROJECTS"];

// pack NA case
var packNAKey = "n/a";
var packKey = "pack";
var packNAIndex = 1;

// --------------- Timing and Sequnecing
var milliToSeconds = 1000;
var dpmoMultiplier = 1000000;
var readTableDelay = 3;

// ----------------- Math Vars
var ibZeroRate = 150;
var numDecimals = 1;
var noDecimals = 0

//--------- display Vars
var zNode;
var totalsTableNode;
var reDoTotalsTableButton;

var totalsTableID = "uphTotalsTable";
var totalsTableClass = "totalsTableClass";

var tableEnd = "</table>";

var tableRowStart = "<tr class=\"totalsTableClass\">";
var tableRowEnd = "</tr>";

var tableDataStart = "<td class=\"totalsTableClass\">";
var tableDataEnd = "</td>";

var tableHeaderStart = "<th class=\"totalsTableClass\">";
var tableHeaderEnd = "</th>";

var newLineKey = "\n";
var quoteInString = "\"";
//-------------------------------------------------- Main Fuctions

(function() {
    'use strict';
    // addSettingsBox();

    setTimeout(function(){ initLoadData(); }, (readTableDelay*milliToSeconds));


    // Your code here...
})();

// --------------------- Sequencign and Timeing

function initLoadData(){
    collectArrays();
    parseInfo();

    insertDisplayTable();
}

//--------------------------- Core Functions
function collectArrays(){
    myTableArray = [];
    var tKey = "table#" + tableKey + " tr";
    $(tKey).each(function() {
        var arrayOfThisRow = [];
        var tableData = $(this).find('td');
        if (tableData.length > 0) {
            tableData.each(function() { arrayOfThisRow.push($(this).text()); });
            myTableArray.push(arrayOfThisRow);
        }
    });
}

function parseInfo(){
    resetValues();

    var firstEl = "";
    var lastFirstElNoBlank = "";
    for (let i = 0; i < myTableArray.length; i++) {
        firstEl = myTableArray[i][0];
        if(firstEl.length > 0){
            totalHoursValue += parseFloat(myTableArray[i][hoursIndexKey]);
            lastFirstElNoBlank = firstEl;
            // totalUnitsValue += parseFloat(myTableArray[i][unitsIndexKey]);
        }

        if(unitOBidKey.includes(firstEl)){
            totalOBUnitsValue += parseFloat(myTableArray[i][unitsIndexKey]);
        }

        if(unitIBidKeys.includes(firstEl)){
            totalIBUnitsValue += parseFloat(myTableArray[i][unitsIndexKey]);
        }

        if(obFunctionKeys.includes(firstEl)){
            totalOBHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }

        if(ibFunctionKeys.includes(firstEl)){
            totalIBHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }

        // BCC
        if(bccFunctionKeys.includes(firstEl)){
            bccHoursValue += parseFloat(myTableArray[i][hoursIndexKey]);
            bccUnitsValue += parseFloat(myTableArray[i][unitsIndexKey]);
        }

        // Downtime
        if(downtimeFunctionKeys.includes(firstEl)){
            downtimeHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }

        // Indirect Hours
        if(ibIndirectFunctionKeys.includes(firstEl)){                       // IB
            ibIndirectHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }
        if(obIndirectFunctionKeys.includes(firstEl)){                       // OB
            obIndirectHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }

        if(indirectFunctionKeys.includes(firstEl)){                         // Other Indirect
            stnIndirectHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }

        if(extraHoursKeys.includes(firstEl)){                         // Extra Hours
            totalExtraHours += parseFloat(myTableArray[i][hoursIndexKey]);
        }

        // Add up Pack-NA
        if(lastFirstElNoBlank == packKey){
            if(myTableArray[i][packNAIndex] == packNAKey){
                totalOBUnitsValue -= parseFloat(myTableArray[i][unitsIndexKey]);
                totalDPMOUnits += parseFloat(myTableArray[i][unitsIndexKey]);
            }
        }

    }

    totalHoursValue -= totalExtraHours;
    if(totalOBHours > 0) obRateValue = totalOBUnitsValue / totalOBHours;
    if(totalIBHours > 0) ibRateValue = totalIBUnitsValue / totalIBHours;
}

function buildDisplayTable(){
    displayTableArray = [];
    var tRate = 0;
    // UPH
    tRate = calcUPH(totalHoursValue,totalOBUnitsValue,totalIBUnitsValue,ibRateValue);
    tRate = tRate.toFixed(numDecimals);
    displayTableArray.push(["UPH", tRate]);

    // DPMO
    tRate = 0;
    if(totalOBUnitsValue > 0){
        tRate = (totalDPMOUnits/totalOBUnitsValue)* dpmoMultiplier;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["DPMO", tRate]);
	// BCC
    tRate = 0;
    if(bccHoursValue > 0){
        tRate = bccUnitsValue/bccHoursValue;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["BCC", tRate]);

    // Total Indirect
    tRate = 0;
    var tHours = stnIndirectHours + ibIndirectHours + obIndirectHours;
    if(tHours > 0){
        tRate = totalOBUnitsValue/tHours;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["Indirect", tRate]);

    // OB Indirect
    tRate = 0;
    if(obIndirectHours >0){
        tRate = totalOBUnitsValue/obIndirectHours;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["OB Indirect", tRate]);

    // OB Total
    tRate = 0;

    if(totalOBHours >0){
        tRate = totalOBUnitsValue/totalOBHours;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["OB Total", tRate]);

    // IB Indirect
    tRate = 0;
    if(ibIndirectHours >0){
        tRate = totalIBUnitsValue/ibIndirectHours;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["IB Indirect", tRate]);

    // IB Total
    tRate = 0;
    if(totalIBHours >0){
        tRate = totalIBUnitsValue/totalIBHours;
    }
    tRate = tRate.toFixed(noDecimals);
    displayTableArray.push(["IB Total", tRate]);

    // Downtime
    tRate = 0;
    tRate = downtimeHours;
    tRate = tRate.toFixed(numDecimals);
    displayTableArray.push(["Downtime", tRate]);

    // OB Unitsx
    tRate = 0;
    tRate = totalOBUnitsValue;
    tRate = tRate.toLocaleString("en-US");
    displayTableArray.push(["OB Vol.", tRate]);
}

function resetValues(){
    totalHoursValue = 0;
    totalOBUnitsValue = 0;
    totalIBUnitsValue = 0;
    totalOBHours = 0;
    totalIBHours = 0;
    ibRateValue = 0;
    obRateValue = 0;
    bccUnitsValue = 0;
    bccHoursValue = 0;

    downtimeHours = 0;
    obIndirectHours = 0;
    ibIndirectHours = 0;
    stnIndirectHours = 0;
    totalExtraHours = 0;

    totalCYSBuggedHours = 0;
    totalCYSBuggedUnits = 0;

    totalDPMOUnits = 0;
}

//------------------------ Util Fuctions
function calcUPH(hours, obVol, ibVol, ibRate){
    if (ibRate == 0 ) ibRate = ibZeroRate;
    return  obVol / (hours -( (ibVol-obVol) /ibRate));
}

//-------------- Diplay Fuctions
function insertDisplayTable(){
    try{
        totalsTableNode = document.getElementById(totalsTableID);
        totalsTableNode.remove();
    }catch(err){}

    buildDisplayTable();
    document.getElementsByTagName(nextElementAfterDisplayTagKey)[0].insertAdjacentHTML(displayInsertKey,
        buildTableFromArray(totalsTableID,displayTableArray,false) );
}

//--------- Display

function buildTableFromArray(tableId, tableArray, hasHeaders){
    var rtnHTML = "";
    rtnHTML = "<table id=\"" + tableId + "\">" + newLineKey;

    for (var i = 0; i < tableArray.length; i++) {
        rtnHTML += tableRowStart + newLineKey;
        var element = tableArray[i];
        if(Array.isArray(element)){
            for (let j = 0; j < element.length; j++) {
                var elJ = element[j];
                if(i == 0 && hasHeaders){
                    rtnHTML += tableHeaderStart ;
                    rtnHTML += elJ ;
                    rtnHTML += tableHeaderEnd + newLineKey;
                }else{
                    rtnHTML += tableDataStart ;
                    rtnHTML += elJ ;
                    rtnHTML += tableDataEnd + newLineKey;
                }
            }
        }else{
            if(i == 0 && hasHeaders){
                rtnHTML += tableHeaderStart ;
                rtnHTML += element ;
                rtnHTML += tableHeaderEnd + newLineKey;
            }else{
                rtnHTML += tableDataStart ;
                rtnHTML += element ;
                rtnHTML += tableDataEnd + newLineKey;
            }
        }
        rtnHTML += tableRowEnd + newLineKey;
    }

    rtnHTML += tableEnd;
    return rtnHTML;
}


// ----- CSS Style
    //--- Style our newly added elements using CSS.
    GM_addStyle ( `
        #uphTotalsTable, .totalsTableClass {
            border: 1px solid black;
            border-collapse: collapse;
            padding-left: 25px;
            padding-right: 25px;
            padding-top: 3px;
            padding-bottom: 3px;
            text-align: center;
        }

        tr.totalsTableClass:nth-child(even) {
            background-color: #D6EEEE;
          }
    ` );


    /*

        Rates to Display
        o	BCC
            DPMO
        o	Total indirect
        o	UPH
        o	OB Indirect
        o	OB Total
        o	IB Indirect
        o	IB Total
        o	Downtime
        o	OB Units

    */
