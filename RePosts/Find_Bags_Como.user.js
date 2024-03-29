// ==UserScript==
// @name         [ FIND BAGS ] COMO
// @namespace    https://github.com/Brikane/UFF_Tools/RePosts
// @version      0.9
// @description  INSERT FOUND BAGS INTO FOOTER COMO LABOR PAGE
// @author       jeyartil reposted by brikane 
// @match        https://como-operations-dashboard-iad.iad.proxy.amazon.com/store/*/labor*
// @downloadURL  https://raw.githubusercontent.com/Brikane/UFF_Tools/RePosts/master/Find_Bags_Como.user.js
// @updateURL    https://raw.githubusercontent.com/Brikane/UFF_Tools/RePosts/master/Find_Bags_Como.user.js
// @icon         https://www.google.com/s2/favicons?domain=amazon.com-update-test
// @grant        none
// @require      https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// ==/UserScript==


const STORE_ID = window.location.href.split("store/")[1].split("/")[0];
localStorage.STORE_ID = STORE_ID;

//alert(STORE_ID);

hotkeys('shift+f', function() {
    const knownBags = JSON.parse(prompt("COPY FROM AFTLITE"));
    if(!knownBags) return;
    showStagedBags(knownBags);
});

const showStagedBags = async ({
    name,
    missingBag: { tracking, zone },
    knownBags: { foundBags },
}) => {
    const allPackages = await comoPackages();
    let temp = "";
    const stagedBags = allPackages.filter(({ scannableId, temperatureZone }) => {
        temp = zone.toUpperCase();

        const match = foundBags.filter((trackingNumber) => trackingNumber == scannableId);
        return match == scannableId;
    });

    //console.log(stagedBags);

    const missingBagTrackingNumber = tracking.slice(0, -4);
    const missingBagLastFour = tracking.substr(tracking.length - 4);

    const footerRoot = document.querySelector("footer");
    footerRoot.innerHTML = `
        <h3 style="text-align: center; font-weight: bold;">VERIFY BAGS NOT IN PROBLEM-SOLVE, WITH PICKER, ETC.</h3>
        <h1 style="text-align: center">Check near these bins for <span style="font-weight: 999; padding: 5px;">${temp}</span> missing bag: ${missingBagTrackingNumber}<span style="font-weight: 999; padding: 5px;">${missingBagLastFour}</span> - <a href=https://adapt-iad.amazon.com/#/employee-dashboard/${name}><span style="font-weight: 999; padding: 5px;">${name.toUpperCase()}</span></a></h1>

        <div id="stagedLocations"></div>`;

    const footer = document.querySelector("#stagedLocations");

    let footerHTML = "";
    const stagedLocations = stagedBags.map(
        ({ scannableId, lastKnownLocation, locationId, temperatureZone }) => {
            if (!/ZONE/.test(lastKnownLocation)) {
                console.log(scannableId);
                if (scannableId == tracking) footerHTML = footerHTML.concat(`<span style="font-size: 25px; background-color: #0bda51; color: white; padding: 5px; font-weight: bold; text-align: center; min-width: 650px; display: inline-block; margin: 10px;">${scannableId} : ${lastKnownLocation}</span> &nbsp;`);
                footerHTML = footerHTML.concat(`<span style="font-size: 25px; background-color: black; color: white; padding: 5px; font-weight: bold; text-align: center; min-width: 650px; display: inline-block; margin: 10px;">${scannableId} : ${lastKnownLocation}</span> &nbsp;`);
            }
        }
    );

    footer.innerHTML = footerHTML;
    footer.style.textAlign = "center";

    //if (!footer.innerText.includes("_")) footer.innerHTML = "<h1>NO BAGS COULD BE FOUND</1>";
};

const comoPackages = async () => {
    const response = await fetch(
        `https://como-operations-dashboard-iad.iad.proxy.amazon.com/api/store/${STORE_ID}/packages`
    );
    const data = await response.json();
    let pkgs = [];

    data.map((pkg) => {
        const route = {};
        pkgs.push(pkg);
    });

    return pkgs;
};

comoPackages();

const comoMissingBags = async () => {
    const response = await fetch(
        `https://como-operations-dashboard-iad.iad.proxy.amazon.com/api/store/${STORE_ID}/handoffTasks`
    );

    const { tasks } = await response.json();

    const missingBags = [];
    const missingScannableIds = [];

    tasks.map(({ identifier, packages, tempZone }) => {
        const missingBag = {};
        missingBag.identifier = identifier;
        missingBag.zone = tempZone;

        let pkgs = packages.map(
            ({
                lastKnownLocation,
                locationClass,
                locationId,
                orderId,
                scannableId,
                status,
                temperatureZone,
            }) => {
                const pkg = {
                    lastKnownLocation,
                    locationClass,
                    locationId,
                    orderId,
                    _scannableId: scannableId,
                    status,
                    temperatureZone,
                };
                missingScannableIds.push(scannableId);

                return pkg;
            }
        );

        missingBag.pkgs = pkgs;
        missingBags.push(missingBag);
    });

    return missingScannableIds;
};
