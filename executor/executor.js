const {remote} = require('webdriverio');
const csv = require('csvtojson')
const {ActionFactory} = require("./dto/action_factory");
var fs = require('fs').promises;


const READ_FROM_SOURCE_PLACEHOLDER = '#READ_FROM_SOURCE#';

//let's keep this commented code here, will be useful in future for cross platform support
//const TEMP_FILE_NAME = 'test.json';
// (async (args) => {
//
//     let rawdata = fs.readFileSync(TEMP_FILE_NAME);
//     let actionList = JSON.parse(rawdata);
//     let siteUrl = process.argv[2];
//
//     console.log('here I am');
//
//     execute(siteUrl, actionList);
// })(process.argv);

const execute = async (siteUrl, actionList) => {

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

    var outputFilename = `./${new Date().toJSON().replaceAll('-', '').replaceAll(':', '').split('.')[0]}-output.txt`;

    await log(outputFilename, 'Started Executing');

    await executeAnAction(actionGraph.get(startAction.nextAction), null, null, outputFilename);

    async function executeAnAction(action, dataSource, index, outputFilename) {
        if (!action) {
            return;
        }

        await log(outputFilename, `Executing action : ${action.name}, type: ${action.type}`);

        if (action.type === 'GROUP') {
            let actionFromList = findActionFromList(action.startAction, actionList);

            if (!actionFromList) {
                throw 'Invalid action name';
            }

            let actionFromGraph = actionGraph.get(actionFromList.id);

            for (let count = 0; count < parseInt(action.repeat); count++) {
                try {
                    await executeAnAction(actionFromGraph, action.dataSourcePath, count, outputFilename);
                } catch (error) {

                    await log(outputFilename, error);
                }
            }

        } else {
            var needDataReset = false;

            if (dataSource && (index !== undefined) && action.value === READ_FROM_SOURCE_PLACEHOLDER) {
                action.value = await getDataFromSource(index, action.name, dataSource);
                needDataReset = true;
            }

            try {
                await action.execute(browser);
            } catch (error) {
                await log(outputFilename, error);

                throw error;
            }

            if (needDataReset) {
                action.value = READ_FROM_SOURCE_PLACEHOLDER;
            }
        }

        await executeAnAction(actionGraph.get(action.nextAction), dataSource, index, outputFilename);
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

    async function log(fileName, data) {
        await fs.appendFile(fileName, `${new Date().toISOString()} :: ${data}\n`);
    }
}

exports.execute = execute;

