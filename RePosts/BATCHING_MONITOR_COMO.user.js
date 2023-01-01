// ==UserScript==
// @name         [ BATCHING MONITOR ] COMO
// @namespace    https://github.com/Brikane/UFF_Tools/RePosts
// @version      2.1
// @description  MONITOR BATCHING TASKS: SET RECOMMENDED BATCHERS. SET TASKS PER BATCHER. SHOW ELAPSED TIME (ET) PER TASK W/ 40 SEC BUFFER.
// @author       jeyartil repost brikane
// @match        https://como-operations-dashboard-iad.iad.proxy.amazon.com/store/*/dash
// @downloadURL  https://raw.githubusercontent.com/Brikane/UFF_Tools/RePosts/master/batchingMonitor_como.user.js
// @updateURL    https://raw.githubusercontent.com/Brikane/UFF_Tools/RePosts/master/batchingMonitor_como.user.js
// @icon         https://www.google.com/s2/favicons?domain=amazon.com-update-test
// @grant        none
// @require      https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// ==/UserScript==

const STORE_ID = window.location.href.split("store/")[1].split("/")[0];

sessionStorage.tasksPerBatcher = 4;
sessionStorage.maxTimePerTaskInMinutes = 9;

hotkeys('shift+b,shift+t,r,f', function (event, handler){
    switch (handler.key) {
        case 'shift+b': {
            const tasksPerBatcher = prompt("Enter desired tasks per batcher:", 4);
            if(!tasksPerBatcher) return;
            setTasksPerBatcher(tasksPerBatcher);
        };
            break;
        case 'shift+t': {
            const maxTimePerTaskInMinutes = prompt("Enter maximum time per task:", 9);
            if(!maxTimePerTaskInMinutes) return;
            setMaxTimePerTaskInMinutes(maxTimePerTaskInMinutes);
        };
            break;
        default: break;
    }
});

const setTasksPerBatcher = (number) => { sessionStorage.tasksPerBatcher = number; };
const setMaxTimePerTaskInMinutes = (number) => { sessionStorage.maxTimePerTaskInMinutes = number; };

setTimeout(() => {
    updateTasks();
}, 500);

const fetchData = async () => {
    const response = await fetch(
        `https://como-operations-dashboard-iad.iad.proxy.amazon.com/api/store/${STORE_ID}/activeJobSummary`
    );

    const data = await response.json();
    const tasks = {};
    tasks.total = data.length;
    tasks.inProgress = data.filter(({operationState}) => operationState == "IN_PROGRESS").length;
    tasks.current = data.filter(({operationState}) => operationState == "NONE" || operationState == "IN_PROGRESS").length;
    tasks.partial = data.filter(({operationState, fulfillmentComplete}) => operationState == "COMPLETED" && fulfillmentComplete == false).length;
    tasks.complete = data.filter(({operationState}) => operationState == "COMPLETED").length - tasks.partial;

    sessionStorage.tasks = JSON.stringify(tasks);

    //console.log(sessionStorage.tasks)
}

setInterval(() => { fetchData(); updateTasks(sessionStorage.tasks); }, 1000);

let debugUpdating = 0;
const updateTasks = (task) => {
    const tasks = JSON.parse(task);

    const DOM = {};
    DOM.tasks = document.querySelector("h1[data-dtk-test-id='job-grid-title']");
    let recommendedBatchers = (tasks.current / sessionStorage.tasksPerBatcher).toFixed(2);

    //if((tasks.total - tasks.current) / sessionStorage.tasksPErBatcher > tasks.current) recommendedBatchers = (tasks.current / sessionStorage.tasksPerBatcher).toFixed(1);

    //if (recommendedBatchers > tasks.inProgress) recommendedBatchers = tasks.current;
    if (recommendedBatchers < tasks.inProgress) recommendedBatchers = tasks.inProgress;

    debugUpdating++;
    DOM.tasks.innerHTML = `Tasks (${tasks.current})
            <span id="recommendedBatchers" style="margin-left: 1em">BATCHERS:
            <span id="batchers">${tasks.inProgress} / ${recommendedBatchers}</span></span>
            <span id="action"></span> <span style="margin: 1em" hidden>Update Debugger: ${debugUpdating}</span>`;

    DOM.recommendedBatchers = document.querySelector('#recommendedBatchers');
    DOM.batchers = document.querySelector('#batchers');

    DOM.action = document.querySelector('#action');

    if(tasks.inProgress == 0) DOM.recommendedBatchers.style.visibility = "hidden";
}

const batchingTime = (allRoutes) => {
    const routes = JSON.parse(allRoutes);
    const inProgressRoutes = routes.inProgress;

    const DOM = {};
    DOM.batchingTasks = [...document.querySelectorAll(`job-card.job-card-container`)];

    const batchingTasks = DOM.batchingTasks.map(tasks => {
        const children = tasks.children[0].children;
        //children[0].innerHTML = "test"
        const cells = {};
        cells.dom = tasks.children[0];
        cells.jobId = { root: children[0] };
        cells.jobId.value = cells.jobId.root.innerText.trim()
        cells.destination = { root: children[1] };
        cells.destination.value = cells.destination.root.innerText.trim();
        cells.carts = { root: children[2] };
        cells.carts.value = cells.carts.root.innerText.trim();
        cells.batcher = { root: children[3] };
        cells.batcher.value = cells.batcher.root.innerText.trim();
        cells.ppst = { root: children[4] };
        cells.ppst.value = cells.ppst.root.innerText.trim();

        return cells
    })

    const matchedTasksInProgress = inProgressRoutes.map(route => {
        const matchedTasks = batchingTasks.find(task => route.associateId == task.batcher.value);
        const matchedRoutes = inProgressRoutes.find(route => route.associateId == matchedTasks.batcher.value);

        matchedRoutes.batchingTime = matchedRoutes.batchingTime / 100;

        const ppstSpan = matchedTasks.ppst.root.children[0].children[1];
        ppstSpan.innerText = `${matchedTasks.ppst.root.innerText.split(" [")[0]} [ ET : ${matchedRoutes.batchingTime.toFixed(2)} ] `;

        if (matchedRoutes.batchingTime < (sessionStorage.maxTimePerTaskInMinutes - 600)) {
            ppstSpan.style.color = "#65a765";
            matchedTasks.batcher.root.style.color = "#65a765";

            ppstSpan.style.fontWeight = "bold";
            matchedTasks.batcher.root.style.fontWeight = "bold";
        }

        if (matchedRoutes.batchingTime > sessionStorage.maxTimePerTaskInMinutes) {
            ppstSpan.style.color = "orange";
            matchedTasks.batcher.root.style.color = "orange";


            ppstSpan.style.fontWeight = "bold";
            matchedTasks.batcher.root.style.fontWeight = "bold";

            ppstSpan.style.fontSize = ".85em";

        }

        if (matchedRoutes.batchingTime > Number(sessionStorage.maxTimePerTaskInMinutes) + 4) {
            ppstSpan.style.color = "red";
            matchedTasks.batcher.root.style.color = "red";

        }

        return matchedTasks
    })

    }

const stagedForPickup = (allRoutes) => {
    const routes = JSON.parse(allRoutes);
    const inProgressRoutes = routes.inProgress;

    const DOM = {};
    DOM.batchingTasks = [...document.querySelectorAll(`job-card.job-card-container`)];
}

setInterval(() => batchingTime(sessionStorage.allRoutes), 150);
