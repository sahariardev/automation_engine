const {remote} = require('webdriverio');
const csv = require('csvtojson')
const fs = require('fs');
const {ActionFactory} = require("./dto/action_factory");
const TEMP_FILE_NAME = 'test.json';

const READ_FROM_SOURCE_PLACEHOLDER = '#READ_FROM_SOURCE#';

(async (args) => {

    let rawdata = fs.readFileSync(TEMP_FILE_NAME);
    let actionList = JSON.parse(rawdata);

    let siteUrl = process.argv[2];

    const actionGraph = new Map();
    let startAction = null;

    let dataSource = {};

    actionList.forEach(function (actionObj) {
        let action = ActionFactory.getAction(actionObj);

        if ((!startAction || action.type === 'START') && !action.previousAction) {
            startAction = action;
        }

        actionGraph.set(action.id, action);
    });

    const browser = await remote({
        capabilities: {
            browserName: 'chrome'
        }
    });

    await browser.url(siteUrl);

    await executeAnAction(actionGraph.get(startAction.nextAction));

    async function executeAnAction(action, dataSource, index) {
        if (!action) {
            return;
        }

        if (action.type === 'GROUP') {
            let actionFromList = findActionFromList(action.startAction, actionList);

            if (!actionFromList) {
                throw 'Invalid action name';
            }

            let actionFromGraph = actionGraph.get(actionFromList.id);

            for (let count = 0; count < parseInt(action.repeat); count++) {
                try {
                    await executeAnAction(actionFromGraph, action.dataSourcePath, count);
                } catch (error) {
                    console.log(error);
                }
            }

        } else {
            var needDataReset = false;
            if (dataSource && (index !== undefined) && action.value === READ_FROM_SOURCE_PLACEHOLDER) {
                action.value = await getDataFromSource(index, action.name, dataSource);
                needDataReset = true;
            }

            await action.execute(browser);

            if (needDataReset) {
                action.value = READ_FROM_SOURCE_PLACEHOLDER;
            }
        }

        await executeAnAction(actionGraph.get(action.nextAction), dataSource, index);
    }

    function findActionFromList(name, list) {
        var filteredActionList = list.filter(action => action.name.trim() === name.trim());

        if (filteredActionList.length === 1) {
            return filteredActionList[0];
        }

        return null;
    }

    async function loadFromDataSource(fileName) {
        return csv().fromFile(fileName);
    }

    async function getDataFromSource(index, header, dataSourceFileName) {
        if (!dataSource[dataSourceFileName]) {
            dataSource[dataSourceFileName] = await loadFromDataSource(dataSourceFileName);
        }

        if (dataSource[dataSourceFileName].length <= index) {
            throw  'Invalid data address';
        }

        if (!dataSource[dataSourceFileName][index][header]) {
            throw  'Invalid data address';
        }

        return dataSource[dataSourceFileName][index][header];
    }
})(process.argv);

