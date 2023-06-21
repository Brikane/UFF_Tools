    // ==UserScript==
    // @name         PickedPercents_V1_0
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @description  Adds up the % picked for each widnow to see where you are at a glance
    // @author       brikane
    // @match        https://helm-iad.iad.proxy.amazon.com/*
    // @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
    // @grant        none
    // ==/UserScript==

    //------------ Control Vars

    var doDebug = true;

    //----------- Under the hood controls -----------
    var selectionTimeSec = 5.0;
    var checkReloadTimerSec = 10.0; 

    //-------------- HTML Tag Vars
    var dataTableClassKey = "table";
    var dataTableIndex = 3;
   

     // Button controls 
    var buttonInjectionKey  = "";
    var reloadButtonId = "Reload";
    var controlHTMLInjection = '<button id="Reload" type="button" > Reload </button>';

    // Data table 

    var expandButtonTagKey = "ant-table-row-expand-icon ant-table-row-collapsed";
    var collapseButtonTagKey = "ant-table-row-expand-icon ant-table-row-expanded";
    var baseRowCount = 12;
    var rowToCount = 1;

    var expandTableKey = "ant-table-fixed";
    var expandedRowDataIndex = 2; 
    var expandedCellOrderedIndexs = [6, 10, 14, 18, 22, 26, 30];
    var expandedCellPickedIndexs = [7, 11, 15, 19, 23, 27, 31];



    // --------- Data Vars
    var parsedDats;

    var expandTableData;


    // --------- MAIN FUNCTION ------------------------------------------------------
    (function() {
        'use strict';
        setTimeout(function(){ initPageAddOns(); }, (selectionTimeSec)*1000);

    
        // Your code here...
    })();

    // -------------------- High Level Functions ------------------------------------
    function initPageAddOns(){
       // addRefreshButton();
       injectPickedDataTitles();
       parseDataTable();
       refeshData();
    }
    
    function refeshData(){
        debugStm("Checking...");
        setInterval(function() {
            if(!doesTableHaveInjectedData()){
                debugStm("refeshing table");
                parseDataTable();
            }
            else{
                debugStm("Table does not need refresh");
            }
         }, checkReloadTimerSec * 1000);
        
    }
        
    function parseDataTable(){
        debugStm("Starting table parsing...");
        
        expandAllTables();
        getExpandedTableData();

        collapseAllTables();
        injectPickedData();
    }

    


    // ------------ data parsing/scrapping functions ----------------------------------
   

    function expandAllTables(){
        var table = document.getElementsByTagName(dataTableClassKey)[dataTableIndex];

        debugStm("Expanding " + document.getElementsByClassName(expandButtonTagKey).length);

        for (let iRow = 0; iRow < table.rows.length; iRow++) {
            try {
                clickFirstButtonOfClass(expandButtonTagKey);
            } catch (error) {
                
            }
        
        }
    }
    function collapseAllTables(){
        var table = document.getElementsByTagName(dataTableClassKey)[dataTableIndex];
        debugStm("Collapsing " + document.getElementsByClassName(collapseButtonTagKey).length);
        for (let iRow = 0; iRow < table.rows.length; iRow++) {
            try {
                clickFirstButtonOfClass(collapseButtonTagKey);
            } catch (error) {
                
            }
        
        }
    }


    function getExpandedTableData(){
        var expandTables = document.getElementsByClassName(expandTableKey);
        debugStm("Exp Table Count: "+ expandTables.length);
        var tTable;
        var tRow;
        var tCell;
        var tData;
        var tNum;
        var tPickedNum = 0;
        var tOrderedNum = 0;
        var tArray;
        expandTableData = [];

        for (let iTable = 0; iTable < expandTables.length; iTable++) {
            tTable = expandTables[iTable];
            tData = "Data: ";
            tPickedNum = 0;
            tOrderedNum = 0;
            tArray = [iTable-2]; // 0
            try {
                tRow = tTable.rows[expandedRowDataIndex];
                expandedCellPickedIndexs.forEach(tEl => {
                    tCell = tRow.cells[tEl];
                    tNum =  parseFloat(tCell.innerHTML);
                    if(Number.isFinite(tNum)){
                        tPickedNum += tNum ;
                    //  debugStm("Picked is number: " + tNum + ":" + tPickedNum);
                        //tArray.push(tNum);
                    }else{
                    // tArray.push(0);
                    }
                    //tData = tData + "; " + tNum;
                });
                tArray.push(tPickedNum); // 1

                expandedCellOrderedIndexs.forEach(tEl => {
                    tCell = tRow.cells[tEl];
                    tNum =  parseFloat(tCell.innerHTML);
                    if(Number.isFinite(tNum)){
                        tOrderedNum += tNum ;
                    // debugStm("Order is number: " + tNum + ":" + tPickedNum);
                        //tArray.push(tNum);
                    }else{
                    // tArray.push(0);
                    }
                    //tData = tData + "; " + tNum;
                });
                tArray.push(tOrderedNum); //2
                var tPercent = 0.0;
                if(tOrderedNum > 0){
                    if(tPickedNum >0){
                        tPercent = tPickedNum/tOrderedNum;
                    }else{
                        tPercent = 0.0;
                    }
                }else{
                    tPercent = 0.0;
                }
                tPercent = tPercent*100.0;
                tArray.push(tPercent); //3
                expandTableData.push(tArray);

               // debugStm("Table: " + iTable +" row: " + expandedRowDataIndex + " cells: " + tRow.cells.length + " data: " + tData + "Total: " + tArray.toString());
            } catch (error) {
                debugStm("expanded Table does not have 3 rows");
            }
            
        } 
    } 

    function clickAllButtonsOfClass(classId){
        var els = document.getElementsByClassName(expandButtonTagKey);
        var hardLimit = 48;
        var i = 0;
        var isNotDone = true
        while( isNotDone){
            
            if(i < hardLimit){
                if(clickFirstButtonOfClass(classId) > 0){
                    isNotDone = true;
                }else{
                    isNotDone = false;
                }
            }else{
                isNotDone = false;
            }

            i++;
        }
    }

    function clickFirstButtonOfClass(classId){
        try {
            var els = document.getElementsByClassName(classId);
            els[0].click();
            return els.length-1;
        } catch (error) {
            return -1;
        }
    
    }

    function checkReload(){
        var table = document.getElementsByTagName(dataTableClassKey)[dataTableIndex];
        var tRow = table.rows[0];
        var numCol = tRow.cells.length;
        //debugStm("Col: " + numCol);
    }

    function doesTableHaveInjectedData(){
        var table = document.getElementsByTagName(dataTableClassKey)[dataTableIndex];
        var tRow = table.rows[rowToCount];
        var numCol = tRow.cells.length;
        debugStm("Tabel has " + numCol + " col");
        if(numCol > baseRowCount){
            return true;
        }else{
            return false;
        }
    }


    // ------------------ Dispaly Fucntions -----------------------------------------
    function injectPickedDataTitles(){
        var table = document.getElementsByTagName(dataTableClassKey)[dataTableIndex];
        /**
        for (let iRow = 0; iRow < table.rows.length; iRow++) {
            tRow = table.rows[iRow].cells;
        }*/
        // title 
        var newCell;
       
            newCell = table.rows[0].insertCell(0);
            newCell.innerHTML = "Picked: ";
        
    }

    function injectPickedData(){
        debugStm("Injecting percent Picked Data...");
        var table = document.getElementsByTagName(dataTableClassKey)[dataTableIndex];
        /**
        for (let iRow = 0; iRow < table.rows.length; iRow++) {
            tRow = table.rows[iRow].cells;
        }*/
        // title 
        var newCell;
        var tNum = 0.0;
        expandTableData.forEach(tEl => {
            try {
                var newCell = table.rows[tEl[0]*2+1].insertCell(0);
                tNum = tEl[3];
                tNum = parseFloat(tNum.toFixed(1));
                tNum = tNum.toLocaleString("en-US");
                newCell.innerHTML = "" + tEl[1] + " (" + tNum + "%)";
                //debugStm("Row: " + tEl.toString());
            } catch (error) {
                //debugStm("Picked Data Injection failed");
            }
        });
    }

    function addRefreshButton(){
      //  document.getElementById(buttonInjectionKey).insertAdjacentHTML(displayInsertKey, controlHTMLInjection );
  

    document.getElementById (runTodayGraphButtonID).addEventListener (
        "click", runTodayButtonAction, false
    );
    }
    // ----------- suport functions -------------------------------------------------------


    function debugStm(printStm){
        if(doDebug){
            console.log(printStm);
        }
    }

    function tableToArray(tTable){
        var tArray;

    }

    // Notes --------------------------------------------------------------------
    /*

    Core concept is to pull values form sub table and display 
    Step 1: Detemrine if and how to parse the data 
        - added parsedData Var to hold will mod if neeed
        - 


    */
