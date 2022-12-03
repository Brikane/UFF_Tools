// ==UserScript==
// @name         [ FIND BAGS ] AFTLITE
// @namespace    https://github.com/Brikane/UFF_Tools/RePosts
// @version      0.4
// @description  Get Routes
// @author       jeyartil repost brikane
// @match        https://aftlite-na.amazon.com/wms*
// @downloadURL  https://raw.githubusercontent.com/JeysonArtiles/amzn/master/findBags_aftlite.user.js
// @updateURL    https://raw.githubusercontent.com/JeysonArtiles/amzn/master/findBags_aftlite.user.js
// @icon         https://www.google.com/s2/favicons?domain=amazon.com-update-test
// @grant        none
// @require      https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// @require      https://code.jquery.com/jquery-3.6.0.slim.min.js
// ==/UserScript==

(function () {
    "use strict";
    $(function () {
        $('input[name=value]').blur();
    });

    hotkeys('shift+f', function() {
        const TRACKING_NUMBER = prompt("ENTER TRACKING NUMBER:");
        if (TRACKING_NUMBER == null) return;
        findMissingBags(TRACKING_NUMBER);
    });

    const findMissingBags = async (TRACKING_NUMBER) => {
        const AUTHENTICITY_TOKEN = document.querySelector("meta[name=csrf-token]").content;
        const response = await fetch(
            `https://aftlite-na.amazon.com/wms/view_order?utf8=%E2%9C%93&authenticity_token=${AUTHENTICITY_TOKEN}%2FhKNSHmkAI%3D&id=${TRACKING_NUMBER}&view=view`
		);
        const data = await response.text();
        const page = new DOMParser().parseFromString(data, "text/html");

        const findPicker = (DOCUMENT, TRACKING_NUMBER) => {
            console.log(TRACKING_NUMBER);
            const DOM = {};
            DOM.picklists = [
                ...DOCUMENT.querySelector("#picklists_table").children[0].children,
            ];
            DOM.picklists.shift();
            DOM.allTotes = [...DOCUMENT.querySelectorAll("tr")[13].cells];

            const orders = [];

            const allTotes = DOM.allTotes.map((totes) => {
                const tote = {};

                tote.spoo = {};
                tote.spoo.root = totes.childNodes[1];
                tote.spoo.link = totes.childNodes[1].href;
                tote.spoo.value = tote.spoo.root.innerText.trim();

                tote.tracking = {};
                tote.tracking.root = totes.childNodes[5];
                tote.tracking.value = tote.tracking.root.textContent.trim().split(" ")[1];

                tote.numOfItems = {};
                tote.numOfItems.root = totes.childNodes[7];
                tote.numOfItems.value = Number(
                    tote.numOfItems.root.textContent.trim().split(" ")[0]
                );

                return tote;
            });

            const picklists = DOM.picklists.map((picks) => {
                const p = [...picks.cells];

                const picklist = {};
                picklist.id = {};
                picklist.id.root = p[0];
                picklist.id.value = picklist.id.root.innerText.trim();

                picklist.zone = {};
                picklist.zone.root = p[1];
                picklist.zone.value = picklist.zone.root.innerText.trim();

                picklist.status = {};
                picklist.status.root = p[2];
                picklist.status.value = picklist.status.root.innerText.trim();

                picklist.tote = {};
                picklist.tote.root = p[3];
                picklist.tote.value = picklist.tote.root.innerText.trim();

                picklist.lastUser = {};
                picklist.lastUser.root = p[4];
                picklist.lastUser.value = picklist.lastUser.root.innerText.trim();
                picklist.lastUser.link =
                    picklist.lastUser.value !== "Unknown"
                    ? picklist.lastUser.root.childNodes[1].href
                : "-";

                return picklist;
            });

            allTotes.map(({ spoo, tracking }) => {
                picklists.map(({ zone, status, tote, lastUser }) => {
                    if (tote.value == spoo.value) {
                        const matched = {};
                        matched.zone = zone.value;
                        matched.status = status.value;
                        matched.spoo = spoo.value;
                        matched.user = { name: lastUser.value, link: lastUser.link };
                        matched.tracking = tracking.value;

                        orders.push(matched);
                    }
                });
            });

            const picker = {};
            picker.missingBag = orders.find((order) => order.tracking == TRACKING_NUMBER);
            picker.name = picker.missingBag.user.name;
            picker.laborTrackLink = picker.missingBag.user.link;
            picker.knownBags = {};
            picker.knownBags.inSameOrderAsMissingBag = orders.filter(
                (order) =>
                order.user.name == picker.name &&
                order.tracking !== picker.missingBag.tracking
            );

            delete picker.missingBag.user;

            return picker;
        };

        const picker = findPicker(page, TRACKING_NUMBER);

        const getBagsFromPicker = async (MATCHED_USER) => {
            const AUTHENTICITY_TOKEN = document.querySelector(
                "meta[name=csrf-token]"
            ).content;
            const response = await fetch(
                `https://aftlite-na.amazon.com/labor_tracking/lookup_history?user_name=${MATCHED_USER.name}`
			);
            const data = await response.text();
            const page = new DOMParser().parseFromString(data, "text/html");

            const table = [
                ...page.querySelector("table.reportLayout").childNodes[1].children,
            ];
            table.shift();

            const userHistory = [];
            table.map(({ cells }) => {
                const cell = [...cells];

                const history = {};
                history.timestamp = {};
                history.timestamp.full = cell[0].innerText;

                const date = history.timestamp.full.split(" ")[0];
                history.timestamp.month = date.split("-")[1];
                history.timestamp.day = date.split("-")[2];
                history.timestamp.year = date.split("-")[0];

                const time = history.timestamp.full.split(" ")[1];
                history.timestamp.hours = time.split(":")[0];
                history.timestamp.minutes = time.split(":")[1];
                history.timestamp.seconds = time.split(":")[2];

                history.timestamp.date = new Date(
                    history.timestamp.year,
                    history.timestamp.month,
                    history.timestamp.day,
                    history.timestamp.hours,
                    history.timestamp.minutes,
                    history.timestamp.seconds
                );

                history.action = cell[1].innerText;
                history.tool = cell[2].innerText;
                history.asin = cell[3].innerText;
                history.bin = cell[4].innerText;
                history.quantity = { from: cell[6].innerText, to: cell[7].innerText };
                history.spoo = cell[10].innerText;
                history.user = cell[12].innerText;
                history.picklistId = cell[13].innerText;

                userHistory.push(history);
            });

            const unique = [...new Set(userHistory.map((history) => history.spoo))];
            const uniqueHistory = unique.map((tote) =>
                                             userHistory.find((history) => history.spoo == tote)
                                            );
            const userHistoryFiltered = uniqueHistory.filter(
                (history) => history.action == "pack"
            );

            const MATCHED_USER_SPOO = userHistoryFiltered.find(
                (history) => history.spoo == MATCHED_USER.missingBag.spoo
            );

            const spoosWithinHourBefore = userHistoryFiltered.filter((history) => {
                const diff = history.timestamp.date - MATCHED_USER_SPOO.timestamp.date;
                return diff <= 2400000 && diff >= 0;
            });

            const spoosWithinHourAfter = userHistoryFiltered.filter((history) => {
                const diff = history.timestamp.date - MATCHED_USER_SPOO.timestamp.date;
                return diff <= 0 && diff >= -2400000;
            });

            const hourBefore = spoosWithinHourBefore.map((history) => history.spoo);
            const hourAfter = spoosWithinHourAfter.map((history) => history.spoo);

            const spoosWithinHour = [...new Set([...hourBefore, ...hourAfter])];

            return spoosWithinHour;
        };

        const pickerSpoosWithinHour = await getBagsFromPicker(picker);

        const convertSpooToTracking = async (SPOO) => {
            const _AUTH_ = document.querySelector("meta[name=csrf-token]").content;
            const response = await fetch(
                `https://aftlite-na.amazon.com/wms/pack_by_picklist?utf8=%E2%9C%93&authenticity_token=${_AUTH_}%3D&picklist_id=${SPOO}&pack=Pack`
			);
            const data = await response.text();
            const page = new DOMParser().parseFromString(data, "text/html");

            const DOM = {};
            DOM.orderId = [...page.querySelectorAll("tr")][1].cells[1].children[0];

            const orderId = {};
            orderId.root = DOM.orderId;
            orderId.link = orderId.root.href;
            orderId.value = orderId.root.innerText.trim();

            const findBagFromSpoo = async (LINK, SPOO) => {
                const response = await fetch(LINK);
                const data = await response.text();
                const page = new DOMParser().parseFromString(data, "text/html");

                const findBag = (DOCUMENT, SPOO) => {
                    //console.log(SPOO)
                    const DOM = {};
                    DOM.picklists = [
                        ...DOCUMENT.querySelector("#picklists_table").children[0].children,
                    ];
                    DOM.picklists.shift();
                    DOM.allTotes = [...DOCUMENT.querySelectorAll("tr")[13].cells];

                    const orders = [];

                    const allTotes = DOM.allTotes.map((totes) => {
                        const tote = {};

                        tote.spoo = {};
                        tote.spoo.root = totes.childNodes[1];
                        tote.spoo.link = totes.childNodes[1].href;
                        tote.spoo.value = tote.spoo.root.innerText.trim();

                        tote.tracking = {};
                        tote.tracking.root = totes.childNodes[5];
                        tote.tracking.value = tote.tracking.root.textContent.trim().split(" ")[1];

                        tote.numOfItems = {};
                        tote.numOfItems.root = totes.childNodes[7];
                        tote.numOfItems.value = Number(
                            tote.numOfItems.root.textContent.trim().split(" ")[0]
                        );

                        return tote;
                    });

                    const picklists = DOM.picklists.map((picks) => {
                        const p = [...picks.cells];

                        const picklist = {};
                        picklist.id = {};
                        picklist.id.root = p[0];
                        picklist.id.value = picklist.id.root.innerText.trim();

                        picklist.zone = {};
                        picklist.zone.root = p[1];
                        picklist.zone.value = picklist.zone.root.innerText.trim();

                        picklist.status = {};
                        picklist.status.root = p[2];
                        picklist.status.value = picklist.status.root.innerText.trim();

                        picklist.tote = {};
                        picklist.tote.root = p[3];
                        picklist.tote.value = picklist.tote.root.innerText.trim();

                        picklist.lastUser = {};
                        picklist.lastUser.root = p[4];
                        picklist.lastUser.value = picklist.lastUser.root.innerText.trim();
                        picklist.lastUser.link =
                            picklist.lastUser.value !== "Unknown"
                            ? picklist.lastUser.root.childNodes[1].href
                        : "-";

                        return picklist;
                    });

                    allTotes.map(({ spoo, tracking }) => {
                        picklists.map(({ zone, status, tote, lastUser }) => {
                            if (tote.value == spoo.value) {
                                const matched = {};
                                matched.zone = zone.value;
                                matched.status = status.value;
                                matched.spoo = spoo.value;
                                matched.user = { name: lastUser.value, link: lastUser.link };
                                matched.tracking = tracking.value;

                                orders.push(matched);
                            }
                        });
                    });

                    const bag = orders.find((order) => order.spoo == SPOO);

                    return bag;
                };

                return findBag(page, SPOO);
            };

            const orders = await findBagFromSpoo(orderId.link, SPOO);
            return orders;
        };

        const relatedBags = await Promise.all(
            pickerSpoosWithinHour.map(async (spoo) => convertSpooToTracking(spoo))
        );
        const relatedBagsFiltered = relatedBags
        .map((bag) => bag.tracking)
        .filter((tracking) => tracking !== undefined);

        picker.knownBags.relatedBags = relatedBags;
        picker.knownBags.foundBags = relatedBagsFiltered;

        prompt(
            "COPY THEN GO TO COMO & PRESS ( SHIFT + F ) THEN PASTE & PRESS ENTER",
            JSON.stringify(picker)
        );
    };
})();
