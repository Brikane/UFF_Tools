    // ==UserScript==
    // @name         LaborSummaryTotals MultiPulls V0_2
    // @namespace    http://tampermonkey.net/
    // @version      0.2 3/16/2022
    // @description  Roll up Labor Summery into totals, OB, IB< Indirect, UPH and over multiple time periods
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

    //-------------- Keys
    var tableKey = "labor_summary_table";
    var nextElementAfterDisplayIDKey = "labor_summary_table";
    var nextElementAfterDisplayTagKey = "b";
    var displayInsertKey = "beforeBegin";
    var hoursIndexKey = 3;
    var unitsIndexKey = 2;
    var unitOBidKey = ["pack"];
    var unitIBidKeys = ["stow", "receive2_direct", "receive_direct", "receive_ced", "transform", "transform_pick"]; //"transform", "transform_pick"

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
    var readTableDelay = 0.75;

    var isRunningValue = "";
    var isRunningKey = "inProgress";

    // ---------------- Param Keys and Values

    var isRunningParamKey = "isRunning";
    var currentIndexParamKey = "index";
    var isRunningDisplayOnly = "display";
    var isRunningRunData = "data";
    var isRunningNotRunning = "";

    // ----------------- Math Vars
    var ibZeroRate = 150;
    var numDecimals = 1;
    var noDecimals = 0
    var nnumRatioDecimals = 2;

    //--------- display Vars
    var zNode;
    var totalsTableNode;
    var reDoTotalsTableButton;

    var totalsTableID = "uphTotalsTable";
    var totalsTableClass = "totalsTableClass";

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

    var newLineKey = "\n";
    var quoteInString = "\"";

    var timeTickArray = [];
    var startTimeIndex = 0;
    var endTimeIndex = 2;
    var currentTimeIndex = 0;

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

    var controlHTMLInjection = '<button id="runTodayButton" type="button" > Graph By Hour </button>';
    var runTodayGraphButtonID = "runTodayButton";

    // Data Storage Vars
    var multiTableStoreKey = "aftLiteTotalsKey";
    var isRunningKey = "isRunningMultiKey";
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
        insertControls();
        collectArrays();
        parseInfo();

        insertDisplayTable();
        //readParams();
        if(isRunningValue.length > 0) runDataScrape();
    }


    function runDataScrape(){
        readTimeTickData();
        currentStartDateValue = new Date(timeTickArray[currentTimeIndex]);
        currentEndDateValue = new Date(timeTickArray[currentTimeIndex+1]);
        if(isRunningValue == isRunningRunData){
            var timeLabel = "" +currentStartDateValue.getHours() + ":00 - " + currentEndDateValue.getHours() + ":00";
            if(currentTimeIndex == 0) {
                insertValuesIntoMultiArray(displayTableArray,timeLabel, 1, true);
                console.log("First Time");
            } else{
                retrieveData();
                insertValuesIntoMultiArray(displayTableArray,timeLabel, 1, false);
                console.log("X Time");

            }
            currentTimeIndex++;
            console.log("Index2: " + currentTimeIndex);
            if(currentTimeIndex >= (timeTickArray.length-1)){
                isRunningValue = isRunningDisplayOnly;
                saveData();
                currentTimeIndex = 0;
                setTimeToDates(new Date(timeTickArray[0]), new Date(timeTickArray[timeTickArray.length-1]));
                location.assign(constructURL());
                // saveData();
            }else{
                saveData();
                //setTimeout(function(){  location.assign(constructURL()); }, (readTableDelay*milliToSeconds));
                console.log("Index before call: " + currentTimeIndex + " -> TimeTickArray: " + timeTickArray.length);
                setTimeToDates(currentEndDateValue, new Date(timeTickArray[currentTimeIndex+1]));
                location.assign(constructURL());
            // location.reload(); 
            }
        }else if (isRunningValue == isRunningDisplayOnly){
            retrieveData();
            insertGraphControls();
            insertChart(getChartDataPoints(1), getChartDataPoints(0), "UPH");
            displayMultiTable();
        }
    }

    function displayMultiTable(){
        document.getElementsByTagName(nextElementAfterDisplayTagKey)[0].insertAdjacentHTML(displayInsertKey,
            buildTableFromArray(totalsMultiTableID,totalsMultiTableArray,false) );
    }



    //------------------------ Save and Read Functions

    function saveData(){
        if(totalsMultiTableArray == null) {
            console.log("Write Table is NULL");
        }else{
            console.log("Write TableSize: " + totalsMultiTableArray.length);
        }
        localStorage.setItem(multiTableStoreKey, JSON.stringify(totalsMultiTableArray));
        if(isRunningKey){
            localStorage.setItem(isRunningKey, "YES");
        }else{
            localStorage.setItem(isRunningKey, "NO");
        }

        //localStorage.setItem(currentIndexKey, currentTimeIndex);
    }

    function retrieveData(){
        totalsMultiTableArray = JSON.parse(localStorage.getItem(multiTableStoreKey) || "[]");
        if(totalsMultiTableArray == null) {
            console.log("Read Table is NULL");
        }else{
            console.log("Read TableSize: " + totalsMultiTableArray.length);
        }
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
        
    }

    function saveDataAtStartOfDataScrape(){
        localStorage.setItem(timeBLockArrayKey, JSON.stringify(timeTickArray));
        localStorage.setItem(startDateTimeKey, JSON.stringify(startDateTimeValue));
        localStorage.setItem(endDateTimeKey, JSON.stringify(endDateTimeValue));
        localStorage.setItem(timeBlockLengthKey, timeBlockLengthValue);
    }

    function appendParams(){

    }

    // Button actions

    function runForTimePageFrame(){
        isRunningValue = isRunningRunData;
        timeTickArray =  createTimeBlockArray(1);
        currentTimeIndex = 0;
        endTimeIndex = (timeTickArray.length-1);
        saveDataAtStartOfDataScrape();
        if(timeTickArray.length > 0){
            setTimeToDates(startDateTimeValue,timeTickArray[0]);
            location.assign(constructURL());
        }
    }

    function runTodayButtonAction(){
        runForTimePageFrame();
        /*
        isRunningValue = isRunningRunData;
        currentTimeIndex = 0;
        endTimeIndex = 23;
        setTimeToToday(0,0);
        location.assign(constructURL());
        */
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
        tRate = parseInt(tRate.toFixed(noDecimals));
        tRate = tRate.toLocaleString("en-US");
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

        // IB Units
        tRate = 0;
        tRate = totalIBUnitsValue;
        tRate = tRate.toLocaleString("en-US");
        displayTableArray.push(["IB Vol.", tRate]);

        // IB/OB Ratio
        tRate = 0;
        if(totalOBUnitsValue >0){
            tRate = totalIBUnitsValue/totalOBUnitsValue;
        }
        tRate = tRate.toFixed(nnumRatioDecimals);
        displayTableArray.push(["IB:OB Ratio", tRate]);

        // total Hours
        tRate = 0;
        tRate = totalHoursValue;

        tRate = tRate.toFixed(nnumRatioDecimals);
        displayTableArray.push(["Total Hrs", tRate]);
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

    function setTimeToDates(sDate, eDate){
    
        startHourParam[1] = sDate.getHours();
        startDayParam[1] = sDate.getDate();
        startMonthParam[1] = sDate.getMonth(); // js does 0-11
        startYearParam[1] = sDate.getFullYear();

        endHourParam[1] = eDate.getHours();
        endDayParam[1] = eDate.getDate();
        endMonthParam[1] = eDate.getMonth(); // js does 0-11
        endYearParam[1] = eDate.getFullYear();
    }
    //------------------------ Util Fuctions
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

        // endDateTimeValue = createTimeBlock(sYear, eYear, sMonth, eMonth, sDay, eDay, sHour, eHour);

        startDateTimeValue = new Date(sYear, sMonth, sDay, sHour);
        endDateTimeValue = new Date(eYear, eMonth, eDay, eHour);

        var nextDate = new Date(startDateTimeValue.getTime());
        nextDate.setHours(nextDate.getHours() + numHoursPer);


        // max anything but will fail auto load all over 7 days 
        // pull/ make rt data
        timeTicks.push(startDateTimeValue);
        do{
            timeTicks.push(nextDate);
            nextDate = new Date(nextDate.getTime());
            nextDate.setHours(nextDate.getHours() + numHoursPer);
        } while(nextDate <= endDateTimeValue);

        timeTicks.push(endDateTimeValue);

        return timeTicks;
    }


    function createTimeBlock( sDate, eDate){
    
        var timeBlock = {
            "startYear": sDate.getFullYear(),
            "endYear": eDate.getFullYear(),
            "startMonth": sDate.getMonth(),
            "endMonth": eDate.getMonth(),
            "startDay": sDate.getDate(),
            "endDay": eDate.getDate(),
            "startHour": sDate.getHours(),
            "endHour": eDate.getHours()
        }

        return timeBlock;
    }

    function cleanDataToNumber(tArray){
        
        for (let index = 0; index < tArray.length; index++) {
            tArray[index] = parseFloat(tArray[index].replace(/,/g, ''));
        }

        return tArray;

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

    function insertChart(dataPoints, tLabels, tTitle){
        document.getElementsByTagName(nextElementAfterDisplayTagKey)[0].insertAdjacentHTML(displayInsertKey,
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

    function insertControls(){
        

        document.getElementsByTagName(nextElementAfterDisplayTagKey)[0].insertAdjacentHTML(displayInsertKey,
            controlHTMLInjection );
        
        
        document.getElementById (runTodayGraphButtonID).addEventListener (
            "click", runTodayButtonAction, false
        );


    }

    function insertGraphControls(){
        if (isRunningValue == isRunningDisplayOnly){
            document.getElementsByTagName(nextElementAfterDisplayTagKey)[0].insertAdjacentHTML(displayInsertKey, createGraphDropDownHTML() );
    
            document.getElementById (graphSelectionBoxId).addEventListener (
             "change", graphSelectionDidChange, false
            );
        }
    }

    function graphSelectionDidChange(){
        var tValue = document.getElementById (graphSelectionBoxId).value; 
        insertChart(cleanDataToNumber(getChartDataPoints(tValue)), getChartDataPoints(0), totalsMultiTableArray[tValue][0]);
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
