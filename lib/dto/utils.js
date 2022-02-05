const Task = require('./task');
const {remote} = require("webdriverio");
const {SelectAction, PutAction} = require('./action');
const puppeteer = require('puppeteer');


const actionContainer = {
    SELECT: {
        actionParser: function (action) {
            return new SelectAction(action['selector'])
        },
        name: 'SELECT'
    },
    'WAIT': 'SELECT',
    'CLICK': 'SELECT',
    PUT: {
        actionParser: function (action) {
            return new PutAction(action['value'])
        },
        name: 'PUT'
    },
    'GO': 'SELECT',
}

const parseAction = function (action) {
    return actionContainer[action['type'].toUpperCase()].actionParser(action)
}

const parse = function (json) {
    let taskMap = {};

    for (let i = 0; i < json.length; i++) {

        let current = json[i];
        let task = new Task(current['id'], current['prev'], current['next'], parseAction(current['action']));

        taskMap[task.id] = task;
    }

    return taskMap;
}

const actionExecutor = async function (taskMap, browserName, homeUrl, startTaskId) {
    console.log("here I am");
    const browser = await puppeteer.launch({ headless: false });
    console.log('launched');
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({ path: 'example.png' });

    await browser.close();

    // browserName = browserName || 'chrome';
    // startTaskId = startTaskId || '1';
    //
    // console.log(startTaskId);
    //
    // if (!taskMap || !taskMap[startTaskId]) {
    //     throw "Unable to parse. Action Map is not properly defined";
    // }
    //
    // const browser = await remote({
    //     capabilities: {
    //         browserName: 'chrome'
    //     }
    // });
    //
    // await browser.url('https://www.google.com/');
    //
    // await executeAction(browser, taskMap, startTaskId);
    // await browser.deleteSession();

    //
    // const apiLink = await browser.$('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input');
    // await apiLink.addValue('Hello World');
    //
    // const btn = await browser.$('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.FPdoLc.lJ9FBc > center > input.gNO89b');
    //
    // await btn.click();
    //
    // await browser.pause(30000)
    //
    // await browser.saveScreenshot('./screenshot.png')
    // await browser.deleteSession()
}

const executeAction = async function (browser, taskMap, taskId, lastSelectedElem) {
    if (!taskId) {
        return;
    }

    if (!taskMap[taskId]) {
        throw `Action id ${taskId} is not defined`;
    }

    console.log(taskMap[taskId])
    console.log(taskMap[taskId].name)
    if (taskMap[taskId].action.name === 'SELECT') {
        console.log("asdasd");
        lastSelectedElem = await browser.$(taskMap[taskId].action.selector);
        await lastSelectedElem.addValue('Hello World');
    }

    if (taskMap[taskId].name === 'PUT') {
        if (!lastSelectedElem) {
            throw "Please select an element first";
        }

        await lastSelectedElem.addValue('Hello World');
    }

    //await executeAction(browser, taskMap, taskMap[taskId].next, lastSelectedElem);
}

exports.parseAction = parseAction;
exports.parse = parse;
exports.actionExecutor = actionExecutor;
