    // ==UserScript==
    // @name         OBPSHelperNA
    // @namespace    https://github.com/dvglenn/TMScripts
    // @version      0.3 05/14/2022
    // @description  Print out pick list IDs for Manual bigs assignments
    // @author       dvglenn@ Brikane adapted for aftlite-na
    // @match        https://aftlite-na.amazon.com/wms/pack_by_picklist*
    // @grant        none
    // ==/UserScript==

    (function() {
        'use strict';

        //**Only Add the "COPY SPOO" button if we have "Scan sp00" on the screen **
        var content = document.body.textContent || document.body.innerText;
        var hasScanSp00 = content.indexOf("Scan sp00")!==-1;
        console.log("HasScanSpoo: " + hasScanSp00);
        var hasScanASIN = content.indexOf("Scan or enter ASIN/UPC to pack:")!==-1;
        console.log("hasScanASIN: " + hasScanASIN);
        if (hasScanSp00) {

            //**Check to see if we already have a sp00 assigned. If so, add the "COPY SPOO" button **
            var spoo = document.links[5].text;
            console.log("spoo: " + spoo);
            var sp = spoo.substring(0,2);
            //console.log("sp: " + sp);
            if(sp == "Sp") {
                console.log("Add the SPOO button");

                var button_addSP00 = createButton("Add " + spoo);
                button_addSP00.onclick = function () {
                    document.getElementsByName("tote_code")[0].value = spoo;
                };

                var spans = document.getElementsByTagName("form");

                //buttons.appendChild(button_copySP00);
                spans[1].appendChild(button_addSP00);
            }
        } else if (hasScanASIN) {
            console.log("Add the ASIN button");
            var tables = document.getElementsByTagName("table");
            var tableASIN = tables[3];
            var tds = tableASIN.getElementsByTagName("td");
            var ASIN = tds[2].getElementsByTagName("a")[0].innerHTML;
            console.log("ASIN: " + ASIN);

            //asin_or_upc
            var button_addASIN = createButton("Add:" + ASIN );
            button_addASIN.onclick = function () {
                document.getElementsByName("asin_or_upc")[0].value = ASIN;
            };

            var pickListQuantity = tds[5].innerHTML;
            var packedQuantity = tds[6].innerHTML;
            console.log("pickListQuantity: " + pickListQuantity);
            console.log("packedQuantity: " + packedQuantity);
            if (pickListQuantity>packedQuantity) {
                var spans2 = document.getElementsByTagName("form");
                spans2[1].appendChild(button_addASIN);
            }


        }

        function createButton(name) {
            var button = document.createElement('button');
            button.innerHTML = name;
            console.log("createButton success");
            return button;
        }

        //NEW CODE - Add AA login to the page to be easier to see who picked this list
        /*
                //Get the Picklist from the top of the current page
                const stringToFind = "Problem Solve:Pack picklist "; //
                const stringToFindOld = "Problem Solve: Pack picklist ";
                //console.log(stringToFind);
                var PickListPS;
                let HTML = document.documentElement.outerHTML;
                //console.log("we got past HTML");
                let position = HTML.search(stringToFind);
                if(position <1 ){
                    position = HTML.search(stringToFindOld);
                }
                //console.log("we got past position");
                //console.log("Position: " + position);
                //console.log(position);
                if(position>0) {
                    console.log("DEBUG: this is a PS, continue with code")
                    //console.log(stringToFind.length);
                    position = position + stringToFind.length;
                    //console.log("Current position: " + position);
                    PickListPS = HTML.substr(position, 7).trim();
                    //console.log("PickListPS: " + PickListPS);
                } else {
                    console.log("DEBUG: Not a problem solve, exiting code");
                    return;
                }

                console.log("Picklist to check: " + PickListPS);

                let request = new XMLHttpRequest();
                request.open("GET", "/view_dwell_time/picklist?value=problem-solve", true);
                request.responseType = "document";
                request.onloadend = function() {
                    if(request.readyState == 4 && request.status == 200) {

                        var userName = "";
                        var PickListFromTable = "";
                        //var PickListPS = "4821367";

                        let xtable = request.responseXML.getElementsByClassName("a-bordered a-vertical-stripes a-spacing-top-large")[0];

                        //console.log(xtable);
                        var cnt=0;
                        for(let row of xtable.rows) {
                            if (cnt>0) {
                                userName = row.cells[6].getElementsByTagName("p")[0].innerHTML;
                                PickListFromTable = row.cells[5].getElementsByTagName("p")[0].innerHTML;
                                console.log("UserName: " + userName);
                                console.log("PickListPS: " + PickListPS);

                                if (PickListFromTable==PickListPS) {
                                    //alert("This is the Picker: " + userName);
                                    var ptag = document.createElement("p");
                                    var ptext = document.createTextNode("Picked by: " + userName);
                                    console.log("1");
                                    ptag.appendChild(ptext);
                                    console.log("2");
                                    var element = document.getElementsByTagName("h3")[0];
                                    console.log("3");
                                    element.appendChild(ptag);
                                    console.log("4");
                                }
                            }
                            cnt++;
                        }



                    }
                }
                request.send();




*/
    })();




