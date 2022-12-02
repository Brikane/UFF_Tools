// ==UserScript==
// @name         AFTLiteTabTitles
// @namespace    https://github.com/Brikane/UFF_Tools/RePosts
// @version      2.0
// @description  Change tab title to better reflect page
// @author       grajef@ repost by @brikane
// @match        https://aftlite-na.amazon.com/*
// @grant        none
// ==/UserScript==

(function() {
    let spl = document.title.split('>');
    document.title = spl[spl.length - 1].replace('View ', ' ');
    if(location.href.includes('outbound_dashboard')) document.title = "Outbound Dashboard";
})();
