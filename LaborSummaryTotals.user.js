    // ==UserScript==
    // @name         LaborSummary Totals V1.4
    // @namespace    https://github.com/Brikane/UFF_Tools/*
    // @version      1.2 04/06/2022
    // @description  Shows totals table for current pull, pull by X hours, graphing with a totals table and an ICQA graph, porject rate if end time is after NOW
    // @author       brikane @ UIL1
    // @match        https://aftlite-na.amazon.com/labor_tracking/labor_summary*
    // @icon         https://www.google.com/s2/favicons?domain=amazon.com
    // @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js
    // @resource     CHART_JS_CSS https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.css
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

    // Multi plull vars
    var totalsMultiTableArray = [];
    var totalsMultiRawDataArray = [];

    //-------------- Keys
    var tableKey = "labor_summary_table";
    var nextElementAfterDisplayIDKey = "labor_summary_table";
    var nextElementAfterDisplayTagKey = "b";
    var anchorElementIds = ["myAnchor1ID", "myAnchor2ID"]; // used to anchor the injected HTML

    var displayInsertKey = "beforeBegin";
    var displayInsertKeyEnd = "afterend";
    var hoursIndexKey = 3;
    var unitsIndexKey = 2;
    var unitOBidKey = ["pack"];
    var unitIBidKeys = ["stow", "receive2_direct", "receive_direct", "receive_ced", "transform", "transform_pick", "receive2"]; //"transform", "transform_pick"

    var ibFunctionKeys = ["stow", "receive2_direct", "receive_direct", "IBINDIRECT", "SPECINDIRECT", "receive2", "transform", "transform_pick" ];
    var obFunctionKeys = ["pack", "BATCHING", "pack_problem", "OB", "OBINDIRECT", "skip", "SORTER" ];
    var ibIndirectFunctionKeys = ["IBINDIRECT", "adjust", "bulk_move", "cubiscan", "move-to", "receive_transfer", "stow_move", "update expiry"];
    var obIndirectFunctionKeys = ["BATCHING", "pack_problem", "OB", "OBINDIRECT","skip", "SORTER", "BATCHING"];
    var bccFunctionKeys = ["bcc"];
    var indirectFunctionKeys = ["SPECINDIRECT", "ICQA", "ICQAINDIRECT", "BRK", "ADMN", "IDLE", "START", "WWHUDDLE", "damage", "dispose", "inventory", "unpack", "TRN", "TOINDIRECT", "ASM", "src", "removal"];
    var downtimeFunctionKeys = ["DOWNTIME"];
    var extraHoursKeys = ["DOWNTIME", "ALTBIZ", "RENOPROJECTS"];

    // pack NA case
    var packNAKey = "n/a";
    var packKey = "pack";
    var packNAIndex = 1;

    // --------------- Timing and Sequnecing
    var milliToSeconds = 1000;
    var dpmoMultiplier = 1000000;
    var readTableDelay = 0.75;

    var isRunningValue = "";

    // ---------------- Param Keys and Values

    var isRunningParamKey = "isRunning";
    var currentIndexParamKey = "index";
    var isRunningDisplayOnly = "display";
    var isRunningRunData = "data";
    var isRunningNotRunning = "";
    var includeDateParamKey = "showDate";
    var includeDateParamValue = false;

    // ----------------- Math Vars
    var ibZeroRate = 150;
    var numDecimals = 1;
    var noDecimals = 0
    var nnumRatioDecimals = 2;

    //--------- display Vars
    var zNode;
    var totalsTableNode;
    var reDoTotalsTableButton;

    var separatorLineID = "separatorLineID";

    var totalsTableID = "uphTotalsTable";
    var totalsTableClass = "totalsTableClass";
    var icqaTableID = "ICQATable";
    var icqaShowTableButtonID = "ICQAButton";
    var hourSegmentDropDownID = "hourSelectionID";

    var totalsMultiTableID = "uphMultiTotalsTable";
    var totalsMultiTableClass = "uphMultiTotalsTable";
    var graphSelectionBoxId = "graphSelectionBoxID";


    var tableEnd = "</table>";

    var tableRowStart = "<tr class=\"totalsTableClass\">";
    var tableRowEnd = "</tr>";

    var tableDataStart = "<td class=\"totalsTableClass\">";
    var tableDataEnd = "</td>";

    var tableHeaderStart = "<th class=\"totalsTableClass\">";
    var tableHeaderEnd = "</th>";

    var hrCodeStart = '<hr id="';
    var hrCodeEnd = '">';

    var newLineKey = "\n";
    var quoteInString = "\"";

    var timeTickArray = [];
    var startTimeIndex = 0;
    var endTimeIndex = 2;
    var currentTimeIndex = 0;
    var timeTickSegment = 1;

    var startYearElID = "date_start_year";
    var endYearElID = "date_end_year";

    var startMonthElID = "date_start_month";
    var endMonthElID = "date_end_month";

    var startDayElID = "date_start_day";
    var endDayElID = "date_end_day";

    var startHourElID = "date_start_hour";
    var endHourElID = "date_end_hour";

    // graphing
    var chartID = "myChart";
    var htmlInjection = '<canvas id="myChart" width="400" height="100"></canvas>';

    // controls

    var controlHTMLInjection = '<button id="runTodayButton" type="button" > Graph By Hour(s) </button>';
    var runTodayGraphButtonID = "runTodayButton";

    // UI/UX Controls
    var toggleLaborSumTable = ["laborSumToggleID", false];
    var toggleICQATable = ["ICQATableToggleID", false];
    var toggleHisGraph =["historicGraphToggleID", false];
    var toggleHisTable = ["historicTableToggleID", false];

    var tabGroupDefs = [["laborSumToggleID", totalsTableID],
                        ["ICQATableToggleID", icqaTableID],
                        ["historicGraphToggleID", chartID],
                        ["historicTableToggleID", totalsMultiTableID]];



    // Data Storage Vars
    var multiTableStoreKey = "aftLiteTotalsKey";
    var multiRawDataStoreKey = "aftLiteRawDataKey";

    var currentIndexKey = "currentIndexKey";

    var startDateTimeKey = "startDateTimeKey";
    var endDateTimeKey = "endDateTimeKey";
    var timeBlockLengthKey = "timeBLockLengthKey";
    var timeBLockArrayKey = "timeBlockArray";

    var startDateTimeValue = "";
    var endDateTimeValue = "";
    var timeBlockLengthValue = "";

    var currentStartDateValue;
    var currentEndDateValue;

    // build url vars
    var baseURl = "https://aftlite-na.amazon.com/labor_tracking/labor_summary?";
    var baseEndConditionsParms = "&filter%5" + "B0%5D=function&filter%5B1%5D=zone&filter%5B2%5D=--&ignore%5Bagency%5D=unchecked&ignore%5Bindirect%5D=unchecked&utf8=%E2%9C%93";
    var urlParamJoin = "&";

    var startDayParam = ["date%5Bstart_day%5D=", 12];
    var startHourParam = [ "date%5Bstart_hour%5D=", 0];
    var startMonthParam = ["date%5Bstart_month%5D=", 3];
    var startYearParam = ["date%5Bstart_year%5D=", 2022];

    var endDayParam = ["date%5Bend_day%5D=", 12];
    var endMonthParam = ["date%5Bend_month%5D=", 3];
    var endHourParam = ["date%5Bend_hour%5D=", 0];
    var endYearParam = ["date%5Bend_year%5D=", 2022];
    //                              0/4/9             1/5/10             2/6/11           3/7 /12          8
    var rawDataLabelArray = ["Total Hours",     "IB Hours",         "OB Hours",      "Extra Hours",
                            "OB Units",         "IB Units",         "Skip Units",       "BCC Hours",    "BCC Units",
                            "IB Indirect Hours","OB Indirect Hours", "Indirect Hours", "Downtime Hours"  ];

    var rawDataBCCHRIndex = 7;
    var rawDataBCCUnitsIndex = 8;
    var rawDataPickSkipsIndex = 6;
    var rawDataOBUnitsIndex = 4;
    var multiTableDPMOIndex = 2;
    var multiTableBCCRateIndex = 3;


    // Progress Indicati


    //-------------------------------------------------- Main Fuctions

    (function() {
        'use strict';
        // addSettingsBox();
        console.log("Init");
        readParams();
        console.log("Index: " + currentTimeIndex);

        setTimeout(function(){ initLoadData(); }, (readTableDelay*milliToSeconds));


        // Your code here...
    })();

    // --------------------- Sequencign and Timeing

    function initLoadData(){
        injectAnchors(anchorElementIds);
        insertControls();
        collectArrays();
        parseInfo();

        insertDisplayTable();
        //readParams();
        if(isRunningValue.length > 0) runDataScrape();
    }


    function runDataScrape(){
        readTimeTickData();
        currentStartDateValue = new Date(timeTickArray[currentTimeIndex][0]);
        currentEndDateValue = new Date(timeTickArray[currentTimeIndex][1]);
        if(isRunningValue == isRunningRunData){
            var timeLabel = "";
            if(includeDateParamValue){
                timeLabel = "" +currentStartDateValue.getMonth() + "/" + currentStartDateValue.getDate() + " - " ;
                timeLabel += "" +currentEndDateValue.getMonth() + "/" + currentEndDateValue.getDate() + newLineKey ;
                timeLabel +=  currentStartDateValue.getHours() + ":00 - " +( currentEndDateValue.getHours()+1) + ":00";
            }else{
                timeLabel = "" + currentStartDateValue.getHours() + ":00 - " +( currentEndDateValue.getHours()+1) + ":00";
            }
            if(currentTimeIndex == 0) {
                insertValuesIntoMultiArray(displayTableArray,timeLabel, 1, true);
                saveRawData(true, timeLabel);
                console.log("First Time");
            } else{
                retrieveData();
                insertValuesIntoMultiArray(displayTableArray,timeLabel, 1, false);
                saveRawData(false, timeLabel);
                console.log("X Time");

            }
            currentTimeIndex++;
            console.log("Index2: " + currentTimeIndex);
            if(currentTimeIndex < (timeTickArray.length)){
                saveData();
                console.log("Index before call: " + currentTimeIndex + " -> TimeTickArray: " + timeTickArray.length);
                setTimeToDates(new Date(timeTickArray[currentTimeIndex][0]), new Date(timeTickArray[currentTimeIndex][1]), 0);
                location.assign(constructURL());

            }else{
                isRunningValue = isRunningDisplayOnly;

                saveData();
                currentTimeIndex = 0;
                setTimeToDates(new Date(timeTickArray[0][0]), new Date(timeTickArray[timeTickArray.length-1][1]), 0);
                location.assign(constructURL());
            // location.reload();
            }
        }else if (isRunningValue == isRunningDisplayOnly){
            retrieveData();
            createToggleControls();
            insertGraphControls();
            insertChart(getChartDataPoints(1), getChartDataPoints(0), "UPH");
            displayMultiTable();
            displayICQATable();
            hideInjectedDataElements();
            enableAllTabButtons();
            doToggleLaborSumTable();
            // tabGroupSelection(toggleLaborSumTable[0], tabGroupDefs)
        }
    }

    function displayMultiTable(){
        document.getElementById(anchorElementIds[1]).insertAdjacentHTML(displayInsertKey,
            buildTableFromArray(totalsMultiTableID,totalsMultiTableArray,false) );
    }



    //------------------------ Save and Read Functions

    function saveData(){

        localStorage.setItem(multiTableStoreKey, JSON.stringify(totalsMultiTableArray));
        localStorage.setItem(multiRawDataStoreKey, JSON.stringify(totalsMultiRawDataArray));

    }

    function retrieveData(){
        totalsMultiTableArray = JSON.parse(localStorage.getItem(multiTableStoreKey) || "[]");
        totalsMultiRawDataArray = JSON.parse(localStorage.getItem(multiRawDataStoreKey) || "[]");
    }

    function readTimeTickData(){
        timeTickArray = JSON.parse(localStorage.getItem(timeBLockArrayKey) || "[]");
    }


    function readParams(){
        var url = new URL(window.location.href);

        var tParms = [];


            tParms = url.searchParams.getAll(currentIndexParamKey);
            console.log("IndexRead: " + parseInt(tParms,10));
            if(tParms.length > 0){
                currentTimeIndex = parseInt(tParms,10);
            } else{
                currentTimeIndex = 0;
            }

            tParms =  url.searchParams.getAll(isRunningParamKey);
            if(tParms.length > 0){
                isRunningValue = tParms;
            } else{
                isRunningValue = "";
            }

            tParms =  url.searchParams.getAll(includeDateParamKey);
            if(tParms == "true"){
                includeDateParamValue = true;
            } else{
                includeDateParamValue = false;
            }

    }

    function saveDataAtStartOfDataScrape(){
        localStorage.setItem(timeBLockArrayKey, JSON.stringify(timeTickArray));
        localStorage.setItem(startDateTimeKey, JSON.stringify(startDateTimeValue));
        localStorage.setItem(endDateTimeKey, JSON.stringify(endDateTimeValue));
        localStorage.setItem(timeBlockLengthKey, timeBlockLengthValue);
    }

    // Button actions

    function runForTimePageFrame(){
        isRunningValue = isRunningRunData;
        timeTickArray =  createTimeBlockArray(timeTickSegment);
        currentTimeIndex = 0;
        endTimeIndex = (timeTickArray.length-1);
        saveDataAtStartOfDataScrape();
        if(timeTickArray.length > 0){
            setTimeToDates(timeTickArray[0][0],timeTickArray[0][1], 0);
            location.assign(constructURL());
        }
    }

    function runTodayButtonAction(){
        runForTimePageFrame();
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
            firstEl = firstEl.trim();
            // console.log("Code:" + firstEl + " +hr: " + myTableArray[i][hoursIndexKey]);

            if(firstEl.length > 0){
                totalHoursValue += parseFloat(myTableArray[i][hoursIndexKey]);
                lastFirstElNoBlank = firstEl;
                // totalUnitsValue += parseFloat(myTableArray[i][unitsIndexKey]);
                console.log("Code:" + firstEl + " +hr: " + myTableArray[i][hoursIndexKey]);
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
            if(obIndirectFunctionKeys.includes(firstEl)){                   // OB

                obIndirectHours += parseFloat(myTableArray[i][hoursIndexKey]);
                console.log("OB Add:" + firstEl + " +hr: " + obIndirectHours);
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

        // formating fixs
        bccHoursValue = bccHoursValue.toFixed(1);
    }

    function saveRawData(doReset, entryLabel){
        var entryArray = [];

        if(doReset) {
            totalsMultiRawDataArray = [];
            entryArray.push("Labels");
            // build labels array
            rawDataLabelArray.forEach(element => {
                entryArray.push(element);
            });
            totalsMultiRawDataArray.push(entryArray);
            entryArray = [];
        }

        entryArray.push(entryLabel);
        // build entry Array
        entryArray.push(totalHoursValue);
        entryArray.push(totalIBHours);
        entryArray.push(totalOBHours);
        entryArray.push(totalExtraHours);
        entryArray.push(totalOBUnitsValue);
        entryArray.push(totalIBUnitsValue);
        entryArray.push(totalDPMOUnits);
        entryArray.push(bccHoursValue);
        entryArray.push(bccUnitsValue);
        entryArray.push(ibIndirectHours);
        entryArray.push(obIndirectHours);
        entryArray.push(stnIndirectHours);
        entryArray.push(downtimeHours);

        totalsMultiRawDataArray.push(entryArray);
    }

    // Current pull table
    function buildDisplayTable(){
        displayTableArray = [];
        var tRate = 0;
        var doProject = false;
        var projectionNum = 0.0;

        // if()

        var tElement = document.getElementById(endHourElID);
        var eHour = parseInt(tElement.value, 10)+1;
        var tElement = document.getElementById(startHourElID);
        var sHour = parseInt(tElement.value, 10);
        var nowHour = new Date().getHours();
        var nowMin = new Date().getMinutes();
        var postMins = 0.0;
         if( eHour > nowHour){
            doProject = true;
            postMins = 60.0;
            console.log("End after now " + eHour + " to " + nowHour + " from " + sHour + " min: " + nowMin + " after:" + postMins);
         }else{
            doProject = false; 
            postMins = 0.0;
            console.log("End before now " + eHour + " to " + nowHour+ " from " + sHour+ " min: " + nowMin);
         }

         var estVal = 0.0;
         var preHours = (nowHour - sHour)*60.0;
         
         var curPercent = ((nowMin+preHours)/(preHours+postMins)); 
         if(curPercent == 0.0) curPercent = 0.000001;
         console.log("Percent: " + curPercent);
          
         // Titles
         displayTableArray.push(["Category", "Actual", "Trending"]);

        // UPH
        tRate = calcUPH(totalHoursValue,totalOBUnitsValue,totalIBUnitsValue,ibRateValue);
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(numDecimals);

        tRate = tRate.toFixed(numDecimals);
        displayTableArray.push(["UPH", tRate, estVal]);

        // DPMO
        tRate = 0;
        if(totalOBUnitsValue > 0){
            tRate = (totalDPMOUnits/totalOBUnitsValue)* dpmoMultiplier;
        }
        
        tRate = parseInt(tRate.toFixed(noDecimals));
        tRate = tRate.toLocaleString("en-US");
        displayTableArray.push(["DPMO", tRate, "-"]);


        // Pack
        tRate = 0;
        tRate = totalOBUnitsValue/ (totalOBHours-obIndirectHours);

        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["Pack", tRate, estVal]);


        // BCC
        tRate = 0;
        if(bccHoursValue > 0){
            tRate = bccUnitsValue/bccHoursValue;
        }
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["BCC", tRate, estVal]);

        // Total Indirect
        tRate = 0;
        var tHours = stnIndirectHours + ibIndirectHours + obIndirectHours;
        if(tHours > 0){
            tRate = totalOBUnitsValue/tHours;
        }
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["Indirect", tRate, estVal]);

        // OB Indirect
        tRate = 0;
        if(obIndirectHours >0){
            tRate = totalOBUnitsValue/obIndirectHours;
            console.log("OB Indirect: " + tRate + " hr: " + obIndirectHours + " units: " + totalOBUnitsValue);
        }
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["OB Indirect", tRate, estVal]);

        // OB Total
        tRate = 0;

        if(totalOBHours >0){
            tRate = totalOBUnitsValue/totalOBHours;
        }
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["OB Total", tRate, estVal]);

        // IB Indirect
        tRate = 0;
        if(ibIndirectHours >0){
            tRate = totalIBUnitsValue/ibIndirectHours;
        }
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["IB Indirect", tRate, estVal]);

        // IB Total
        tRate = 0;
        if(totalIBHours >0){
            tRate = totalIBUnitsValue/totalIBHours;
        }
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["IB Total", tRate, estVal]);

        // Downtime
        /*
        tRate = 0;
        tRate = downtimeHours;
        tRate = tRate.toFixed(numDecimals);
        displayTableArray.push(["Downtime", tRate, "-"]);
        */
        // Pack
        tRate = 0;
        tRate = totalOBUnitsValue/ (totalOBHours-obIndirectHours);

        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        tRate = tRate.toFixed(noDecimals);
        displayTableArray.push(["Pack", tRate, estVal]);

        // OB Unitsx
        tRate = 0;
        tRate = totalOBUnitsValue;
        
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        estVal = estVal.toLocaleString("en-US");
        tRate = tRate.toLocaleString("en-US");
       
        displayTableArray.push(["OB Vol.", tRate, estVal]);

        // IB Units
        tRate = 0;
        tRate = totalIBUnitsValue;
        
        estVal = tRate
        if(doProject){
            estVal = tRate/curPercent;
        }
        estVal = Number(estVal).toFixed(noDecimals);
        estVal = estVal.toLocaleString("en-US");
        tRate = tRate.toLocaleString("en-US");
        displayTableArray.push(["IB Vol.", tRate, estVal]);

        // IB/OB Ratio
        tRate = 0;
        if(totalOBUnitsValue >0){
            tRate = totalIBUnitsValue/totalOBUnitsValue;
        }
        tRate = tRate.toFixed(nnumRatioDecimals);
        displayTableArray.push(["IB:OB Ratio", tRate, "-"]);

        // total Hours
        tRate = 0;
        tRate = totalHoursValue;

        tRate = tRate.toFixed(nnumRatioDecimals);
        
        displayTableArray.push(["Total Hrs", tRate, tRate]);
        //displayTableArray.push(["Trending is ", "time left in ", "current hour"]);
    }

    function insertValuesIntoMultiArray(entryArray, firstValue, pushIndex, isFirstEntry){

        if(isFirstEntry) {
            totalsMultiTableArray = [];
            totalsMultiTableArray.push(["Labels", firstValue])
        }else{
            totalsMultiTableArray[0].push(firstValue);
        }
    // tArray.push(firstValue);
        for (let i = 0; i < entryArray.length; i++) {
            if(isFirstEntry){
                totalsMultiTableArray.push(entryArray[i]);
            }else{
                totalsMultiTableArray[i+1].push(entryArray[i][pushIndex]);
            }
        }

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


    function setTimeToToday(startHour, endHour){
        const d = new Date();

        startHourParam[1] = startHour;
        startDayParam[1] = d.getDate();
        startMonthParam[1] = d.getMonth+1(); // js does 0-11
        startYearParam[1] = d.getFullYear();

        endHourParam[1] = endHour;
        endDayParam[1] = d.getDate();
        endMonthParam[1] = d.getMonth()+1; // js does 0-11
        endYearParam[1] = d.getFullYear();
    }

    function setTimeToDates(sDate, eDate, eHourAdjust){

        startHourParam[1] = sDate.getHours();
        startDayParam[1] = sDate.getDate();
        startMonthParam[1] = sDate.getMonth(); // js does 0-11
        startYearParam[1] = sDate.getFullYear();

        if((eDate.getHours()-eHourAdjust) < sDate.getHours()){
            endHourParam[1] = sDate.getHours();
        }else{
            endHourParam[1] = (eDate.getHours()-eHourAdjust);
        }
        endDayParam[1] = eDate.getDate();
        endMonthParam[1] = eDate.getMonth(); // js does 0-11
        endYearParam[1] = eDate.getFullYear();
    }
    //------------------------ Util Fuctions

    function doCodesMatch(code1,code2){
        code1 = code1.toLowerCase();
        code2 = code2.toLowerCase();

        code1 = code1.trim();
        code2 = code2.trim();

        return code1 == code2;
    }

    function arrayStringInclude(array, str){

        array.forEach(element => {
            if(doCodesMatch(element, str)){
                return true;
            }
        });

        return false;
    }

    function calcUPH(hours, obVol, ibVol, ibRate){
        if (ibRate == 0 ) ibRate = ibZeroRate;
        return  obVol / (hours -( (ibVol-obVol) /ibRate));
    }

    Array.prototype.insert = function ( index, item ) {
        this.splice( index, 0, item );
    };


    function constructURL(){
        var rtnSTR = baseURl;

        rtnSTR += startDayParam[0]  + startDayParam[1] + urlParamJoin;
        rtnSTR += startMonthParam[0]  + startMonthParam[1] + urlParamJoin;
        rtnSTR += startYearParam[0]  + startYearParam[1] + urlParamJoin;
        rtnSTR += startHourParam[0]  + startHourParam[1] + urlParamJoin;

        rtnSTR += endDayParam[0]  + endDayParam[1] + urlParamJoin;
        rtnSTR += endMonthParam[0]  + endMonthParam[1] + urlParamJoin;
        rtnSTR += endYearParam[0]  + endYearParam[1] + urlParamJoin;
        rtnSTR += endHourParam[0]  + endHourParam[1] + urlParamJoin;

        rtnSTR += baseEndConditionsParms + urlParamJoin;
        rtnSTR += currentIndexParamKey + "=" + currentTimeIndex + urlParamJoin;
        rtnSTR += isRunningParamKey + "=" +  isRunningValue;

        if(includeDateParamValue){
            rtnSTR += urlParamJoin + includeDateParamKey + "=" +  includeDateParamValue;
        }else{
            rtnSTR += urlParamJoin + includeDateParamKey + "=" +  "";
        }
        console.log("Set Index: " + currentTimeIndex);

        return rtnSTR;
    }

    function getChartDataPoints(rowIndex){
        var rtnArr = [];
        for (let i = 1; i < totalsMultiTableArray[rowIndex].length; i++) {
            rtnArr.push(totalsMultiTableArray[rowIndex][i]);
        }

        return rtnArr;
    }

    function getChartLabelPoints(){
        var rtnArr = [];
        if(totalsMultiTableArray.length > 0){
            for (let i = 1; i < totalsMultiTableArray[0].length; i++) {
                rtnArr.push(totalsMultiTableArray[0][i]);
            }
        }
        return rtnArr;
    }

    function getTotalsDataPoints(rowIndex){
        var rtnArr = [];
        for (let i = 0; i < totalsMultiTableArray[rowIndex].length; i++) {
            rtnArr.push(totalsMultiTableArray[rowIndex][i]);
        }

        return rtnArr;
    }

    function getRawDataRow(rowIndex){
        var rtnArr = [];

        for (let i = 0; i < totalsMultiRawDataArray.length; i++) {
            rtnArr.push(totalsMultiRawDataArray[i][rowIndex]);
        }

        return rtnArr;
    }

    function createTimeBlockArray(numHoursPer){
        var timeTicks = [];

        var tElement = document.getElementById(startYearElID);
        var sYear = tElement.value;
        tElement = document.getElementById(endYearElID);
        var eYear = tElement.value;

        tElement = document.getElementById(startMonthElID);
        var sMonth = tElement.value;
        tElement = document.getElementById(endMonthElID);
        var eMonth = tElement.value;

        tElement = document.getElementById(startDayElID);
        var sDay = tElement.value;
        tElement = document.getElementById(endDayElID);
        var eDay = tElement.value;

        tElement = document.getElementById(startHourElID);
        var sHour = tElement.value;
        tElement = document.getElementById(endHourElID);
        var eHour = tElement.value;


        // timeTickSegment = numHoursPer;
        startDateTimeValue = new Date(sYear, sMonth, sDay, sHour, 0,0,0);
        endDateTimeValue = new Date(eYear, eMonth, eDay, eHour, 59, 59, 0);
        endDateTimeValue.setMinutes(endDateTimeValue.getMinutes()-2);

        if(startDateTimeValue.getDate() !=  endDateTimeValue.getDate() ) {
            includeDateParamValue = true;
        }else{
            includeDateParamValue = false;
        }

        console.log("Hours Per: " + numHoursPer + " Set To: " + timeTickSegment);

        //Creates time blocks startign with start time then every block value
        var nextDate = new Date(startDateTimeValue.getTime());
        var nextDateEnd = new Date(startDateTimeValue.getTime());
        nextDateEnd.setHours(nextDate.getHours() + numHoursPer);
        nextDateEnd.setMinutes(nextDateEnd.getMinutes()-1);

        do{
            timeTicks.push([nextDate, nextDateEnd]);

            nextDate = new Date(nextDate.getTime());
            nextDate.setHours(nextDate.getHours() + numHoursPer);
            nextDateEnd =  new Date(nextDate.getTime());
            nextDateEnd.setHours(nextDate.getHours() + numHoursPer);
            nextDateEnd.setMinutes(nextDateEnd.getMinutes()-1);
            // console.log("NextEndMins: "  + nextDateEnd.getMinutes() + " EndMins: " + endDateTimeValue.getMinutes());
        } while(nextDateEnd <= endDateTimeValue);

        //endDateTimeValue.setHours(endDateTimeValue.getHours());
        timeTicks.push([nextDate,endDateTimeValue]);
        return timeTicks;
    }

    function cleanDataToNumber(tArray){

        for (let index = 0; index < tArray.length; index++) {
            tArray[index] = parseFloat(tArray[index].replace(/,/g, ''));
        }

        return tArray;

    }

    //-------------- Diplay Fuctions
    function insertDisplayTable(){
        //document.getElementById(anchorElementIds[1]).insertAdjacentHTML(displayInsertKey, hrHTMLCodeFor(separatorLineID) );
        try{
            totalsTableNode = document.getElementById(totalsTableID);
            totalsTableNode.remove();
        }catch(err){}

        buildDisplayTable();
        document.getElementById(anchorElementIds[1]).insertAdjacentHTML(displayInsertKey,
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

    function insertChart(dataPoints, tLabels, tTitle){
        document.getElementById(anchorElementIds[1]).insertAdjacentHTML(displayInsertKey,
            htmlInjection );

        var chartData = {
            labels: tLabels,
            datasets: [{
                label: tTitle,
                data: dataPoints,
            }]
        };

        var chartOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
        const ctx = document.getElementById(chartID)

        const myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });

    }



    function createGraphDropDownHTML(){
        var rtnHTML = '<select name="'+ graphSelectionBoxId + '" id="' + graphSelectionBoxId + '">';
        rtnHTML +=  newLineKey;

        for (let i = 1; i < totalsMultiTableArray.length; i++) {
            rtnHTML += '<option value="' + i + '">'+ totalsMultiTableArray[i][0] + '</option>' + newLineKey;
        }
        rtnHTML +=" </select>";

        return rtnHTML;
    }


    function createDropDownFromArray(selectionID, valueArray, labelsArray){
        var rtnHTML = '<select name="'+ selectionID + '" id="' + selectionID + '">';
        rtnHTML +=  newLineKey;

        for (let i = 0; i < valueArray.length; i++) {
            rtnHTML += '<option value="' + valueArray[i] + '">'+ labelsArray[i] + '</option>' + newLineKey;
        }
        rtnHTML +=" </select>";

        return rtnHTML;
    }

    function insertControls(){


        document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey,
            controlHTMLInjection );


        document.getElementById (runTodayGraphButtonID).addEventListener (
            "click", runTodayButtonAction, false
        );

        var tArray = [];
        for (let index = 1; index < 25; index++) {
            tArray.push(index);

        }

        document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey,  createDropDownFromArray(hourSegmentDropDownID, tArray, tArray) );

        document.getElementById (hourSegmentDropDownID).addEventListener (
        "change", hourSegmentDidChange, false
        );




    }

    function insertGraphControls(){
        if (isRunningValue == isRunningDisplayOnly){
            document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey, createGraphDropDownHTML() );

            document.getElementById (graphSelectionBoxId).addEventListener (
            "change", graphSelectionDidChange, false
            );


        }


    }

    function graphSelectionDidChange(){
        var tValue = document.getElementById (graphSelectionBoxId).value;
        //document.getElementById (chartID).remove();
        insertChart(cleanDataToNumber(getChartDataPoints(tValue)), getChartDataPoints(0), totalsMultiTableArray[tValue][0]);
    }

    function hourSegmentDidChange(){
        var tValue = document.getElementById (hourSegmentDropDownID).value;
        timeTickSegment = parseInt(tValue,10);
    }

    function displayICQATable(){
        var tTableArray = [];
        var entryArray = [];

        tTableArray.push(getTotalsDataPoints(0));
        tTableArray.push(getTotalsDataPoints(multiTableDPMOIndex));
        //tTableArray.push(getRawDataRow(rawDataPickSkipsIndex));
        tTableArray.push(getTotalsDataPoints(multiTableBCCRateIndex));
        tTableArray.push(getRawDataRow(rawDataBCCUnitsIndex));
        tTableArray.push(getRawDataRow(rawDataBCCHRIndex));

        document.getElementById(anchorElementIds[1]).insertAdjacentHTML(displayInsertKey,
            buildTableFromArray(icqaTableID, tTableArray, true) );
    }

    // UI/UX Controls Toggle

    function createToggleControls(){
        var tHTML = "";
        // Labor Sum Table
        document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey,
            toggleButtonHTML(toggleLaborSumTable[0], "Show Totals"));
        document.getElementById (toggleLaborSumTable[0]).addEventListener (
            "click", doToggleLaborSumTable, false
            );

        // ICQA Table
        document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey,
        toggleButtonHTML(toggleICQATable[0], "Show ICQA"));
        document.getElementById (toggleICQATable[0]).addEventListener (
            "click", doToggleICQATable, false
            );

        // Historic Graph
        document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey,
        toggleButtonHTML(toggleHisGraph[0], "Show Graph"));
        document.getElementById (toggleHisGraph[0]).addEventListener (
            "click", doToggleHisLaborGraph, false
            );


        // Historic Table
        document.getElementById(anchorElementIds[0]).insertAdjacentHTML(displayInsertKey,
        toggleButtonHTML(toggleHisTable[0], "Show Historic Table"));
        document.getElementById (toggleHisTable[0]).addEventListener (
            "click", doToggleHisLaborTable, false
            );


    }

    function toggleButtonHTML(elID, elLabel){
        var rtnHTML = '<button id="'; // '<button id="runTodayButton" type="button" > Graph By Hour(s) </button>';
        rtnHTML +=  elID;
        rtnHTML += '" type="button" >';
        rtnHTML += elLabel;
        rtnHTML += '</button>';

        return rtnHTML;
    }

    function doToggleICQATable(){
        hideInjectedDataElements();
        enableAllTabButtons();
       /* if(toggleICQATable[1]){
            toggleICQATable[1] = false;
            document.getElementById(toggleICQATable[0]).innerHTML = "Show ICQA Table";
            document.getElementById(icqaTableID).hidden = true;
        }else{*/
            toggleICQATable[1] = true;
           // document.getElementById(toggleICQATable[0]).innerHTML = "Hide ICQA Table";
            document.getElementById(icqaTableID).hidden = false;
            document.getElementById(toggleICQATable[0]).disabled = true;
        //}
    }

    function doToggleLaborSumTable(){
        hideInjectedDataElements();
        enableAllTabButtons();
       /* if(toggleLaborSumTable[1]){
            toggleLaborSumTable[1] = false;
            document.getElementById(toggleLaborSumTable[0]).innerHTML = "Show Labor Sum Table";
            document.getElementById(totalsTableID).hidden = true;
        }else{*/
            toggleLaborSumTable[1] = true;
          //  document.getElementById(toggleLaborSumTable[0]).innerHTML = "Hide Labor Sum Table";
            document.getElementById(totalsTableID).hidden = false;
            document.getElementById(toggleLaborSumTable[0]).disabled = true;
       // }
    }

    function doToggleHisLaborGraph(){
        hideInjectedDataElements();
        enableAllTabButtons();
        /*if(toggleHisGraph[1]){
            toggleHisGraph[1] = false;
            document.getElementById(toggleHisGraph[0]).innerHTML = "Show Graphs";
            document.getElementById(chartID).remove();
        }else{*/
            toggleHisGraph[1] = true;
            document.getElementById(graphSelectionBoxId).hidden = false;
            //document.getElementById(toggleHisGraph[0]).innerHTML = "Hide Graphs";
            document.getElementById(toggleHisGraph[0]).disabled = true;
            graphSelectionDidChange();
        //}
    }

    function doToggleHisLaborTable(){
        hideInjectedDataElements();
        enableAllTabButtons();
        /*if(toggleHisTable[1]){
            toggleHisTable[1] = false;
            document.getElementById(toggleHisTable[0]).innerHTML = "Show Historic Table";
            document.getElementById(totalsMultiTableID).hidden = true;
        }else{*/
            toggleHisTable[1] = true;
            //document.getElementById(toggleHisTable[0]).innerHTML = "Hide Historic Table";
            document.getElementById(totalsMultiTableID).hidden = false;
            document.getElementById(toggleHisTable[0]).disabled = true;
        //}
    }

    function hideInjectedDataElements(){
        // Hide all elements
       // document.getElementById(chartID).hidden = true;
        document.getElementById(totalsTableID).hidden = true;
        document.getElementById(totalsMultiTableID).hidden = true;
        document.getElementById(icqaTableID).hidden = true;
        if ( document.getElementById(chartID) != null) document.getElementById(chartID).remove();

    }

    function enableAllTabButtons(){
        // document.getElementById(toggleHisTable[0]).disabled = false;
        document.getElementById(toggleLaborSumTable[0]).disabled = false;
        document.getElementById(toggleICQATable[0]).disabled = false;
        document.getElementById(toggleHisGraph[0]).disabled = false;
        document.getElementById(toggleHisTable[0]).disabled = false;
        document.getElementById(graphSelectionBoxId).hidden = true;
    }

    function tabGroupSelection(tabIdSelected, tDefs){
        // hide all element
        // enable all buttons
        tDefs.forEach(element => {
            document.getElementById(element[0]).disabled = false;
            document.getElementById(element[1]).hidden = true;
        });
        // remove chart
        document.getElementById(chartID).remove();

        // diable current button and enable current element
        tDefs.forEach(element => {
            if(element[0] == tabIdSelected){
                document.getElementById(element[1]).hidden = false;
                if(tabIdSelected == chartID)  graphSelectionDidChange();
                document.getElementById(element[0]).disabled = true;
            }
        });
    }

    function hrHTMLCodeFor(elementId){
        return hrCodeStart + elementId + hrCodeEnd ;
    }

    function injectAnchors(tIds){

        document.getElementsByTagName(nextElementAfterDisplayTagKey)[0].insertAdjacentHTML(displayInsertKey,
            hrHTMLCodeFor(tIds[0]));

        for (let i = 1; i < tIds.length; i++) {
            document.getElementById(tIds[i-1]).insertAdjacentHTML(displayInsertKeyEnd,
                hrHTMLCodeFor(tIds[i]));
        }
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
