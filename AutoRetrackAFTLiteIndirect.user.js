    // ==UserScript==
    // @name         AutoRetrackAFTLiteV1_5
    // @namespace    https://github.com/Brikane/UFF_Tools
    // @version      1.5 11/10/2022 @UIL1
    // @description  Auto re-labor tracks AA at specific time points
    // @author       brikane @UIL1 for UFF Amazon.com
    // @match        https://aftlite-na.amazon.com/labor_tracking/find_people*
    // @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
    // @grant        none
    // ==/UserScript==

    // Setting Vars
    // Code to trigger, time to trigger after in mins, and code to recode to
    var recodeDefs = [                          // Delete the "//" in front of the ones you wish to activate
                         ["ERROR",999,"ERROR"] // Leave alone
                      ,["pack", 20, "OBINDIRECT" ]
                      ,["pack_problem", 9, "OBINDIRECT" ]//
                      //,["receive/receive2_direct", 9, "IBINDIRECT" ]
                    //  ,["receive_direct", 9, "IBINDIRECT" ]
                     // ,["stow", 9, "IBINDIRECT" ]
                     // ,["stow_move", 9, "IBINDIRECT" ]
                      //,["receive/receive_direct", 9, "IBINDIRECT" ]
                    ];

    var reloadSecondsTime = 60; // seconds

    // Timing Vars

    var readTableDelay = 3;
    var milliToSeconds = 1000;
    // UI vars

    // Data vars
    var directRateTableArray  = "";

    // HTML Hooks var
    var infoTableID = "direct"; // class "reportLayout a-bordered a-spacing-top-large"
    var infoTableClass = "reportLayout a-bordered a-spacing-top-large"; 
    var aaLoginTextboxID = "name"; // input with name tag
    var laborCodeTextboxID = "code"; // inout with name tag
    var submitButtonID = "button"; // just a button 

    // Methods ----------------------------------------------------------------------------
    (function() {
        'use strict';
        setTimeout(function(){   parseTableForRecode();}, (readTableDelay*milliToSeconds));
        //recode("brikane", "asm");
        // Your code here...
    })();

    function parseTableForRecode(){
        var el = document.getElementsByClassName(infoTableClass)[1];
        var tTable = tableToArray(el);
        var tTime = 0;
        tTable.forEach(element => {
            recodeDefs.forEach(singleDef => {
                if (element[1] == singleDef[0]){
                    tTime = parseInt(parseFirstWord(element[2]),10);
                    if(tTime >= singleDef[1] ) {
                        console.log("Recodable: " + element[0] + " at " + tTime + " to " + singleDef[2]);
                        recode(element[0], singleDef[2]);
                    }
                }
           });
        });
        setTimeout(function(){   document.location.reload();}, (reloadSecondsTime*milliToSeconds));
       // recode("brikane", "asm"); test 
    }


    function recode(aaLogin, laborCode){
        console.log("Recoding: ");
        document.getElementsByName(aaLoginTextboxID)[0].value = aaLogin;
        document.getElementsByName(laborCodeTextboxID)[0].value = laborCode;

        var targetNode =  document.getElementsByTagName(submitButtonID)[0];
        triggerMouseEvent (targetNode, "click");
    }

    function addIdsToTables(){
        var el = document.getElementsByClassName(infoTableClass)[1];
        el.setAttribute('id', infoTableID);
    }

    // Util Functions
    function triggerMouseEvent (node, eventType) {
        var clickEvent = document.createEvent ('MouseEvents');
        clickEvent.initEvent (eventType, true, true);
        node.dispatchEvent (clickEvent);
    }

    function collectArrayFromTable(nodeID){
        var myTableArray = [];
        var tKey = "table#" + nodeID + " tr";
        $(tKey).each(function() {
            var arrayOfThisRow = [];
            var tableData = $(this).find('td');
            if (tableData.length > 0) {
                tableData.each(function() { arrayOfThisRow.push($(this).text()); });
                myTableArray.push(arrayOfThisRow);
            }
        });

        return myTableArray;
    }

    function tableToArray(table) {
        var result = []
        var rows = table.rows;
        var cells, t;
      
        // Iterate over rows
        for (var i=0, iLen=rows.length; i<iLen; i++) {
          cells = rows[i].cells;
          t = [];
      
          // Iterate over cells
          for (var j=0, jLen=cells.length; j<jLen; j++) {
            t.push(cells[j].textContent);
          }
          result.push(t);
        }
        return result; 
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
      

    /* Dev Notes
        Requires the find people tools scripts 
            https://github.com/JGray0705/UserScripts/raw/master/FindPeopleTools.user.js 
        Page Loads
        Table is selected and convered to multi dim array
        Array is parsed
            If path is in path defs check time
            if time is > recode time call recode methos
        
        Wait for X time and reload page

        Recode method -> AALogin, LaborCode
            Enters AA login into AA login textbox
            Enters Labro Code into Labor COde text box
            Clicks Submit button which will not reload the page
        
        MVP Version (1.0) is set by global vars to allow later additosn with UI or other features

        Console logs each time (console does nto save between reloads)

        May be deployed at any site with AFTLite that matchs labor code 
    */
