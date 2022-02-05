// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const {actionExecutor} = require("./lib/dto/utils");
const {parse} = require("./lib/dto/utils");
const {remote} = require('webdriverio');
const puppeteer = require('puppeteer');
const execSh = require("exec-sh");
const fs = require('fs');
let mainWindow = null;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),

        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.setResizable(false);
    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

ipcMain.on('saveFile', async (event, arg) => {
    var data = JSON.parse(arg);

    var fileName = data.fileName;

    if (!fileName) {
        return;
    }

    if (!fileName.endsWith('.sakr')) {
        fileName = fileName + '.sakr';
    }

    fs.writeFile(fileName, arg, err => {
        if (err) {
            console.error(err);
        }
    });

});

ipcMain.on('loadFile', async (event, arg) => {

    var filePath = arg.endsWith('.sakr') ? arg : arg + '.sakr';

   // var fileContent = JSON.stringify(JSON.parse(fs.readFileSync(filePath)));
    var fileContent = JSON.parse(fs.readFileSync(filePath));

    if (fileContent) {
        mainWindow.webContents.send('fileLoaded', {fileContent: fileContent});
    }

});

ipcMain.on('clicked', async (event, arg) => {
    var props = JSON.parse(arg);

    var siteUrl = 'https://www.w3schools.com/html/tryit.asp?filename=tryhtml_form_submit';

    fs.writeFile('test.json', JSON.stringify(props.actions), err => {
        if (err) {
            console.error(err);
            return;
        }
    });

    execSh("node ./executor/executor.js" + " " + props.siteUrl, {}, function (err) {
        if (err) {
            console.log("Exit code: ", err.code);
        }
    });

    // console.log('clicked');
    //
    //
    // console.log(arg);
    // let json = JSON.parse(arg);
    // let map = parse(json);
    // console.log(map);
    //
    // await actionExecutor();

    // const browser = await remote({
    //     capabilities: {
    //         browserName: 'chrome'
    //     }
    // })
    //
    // await browser.url('https://www.google.com/');
    // const apiLink = await browser.$('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input');
    // await apiLink.addValue('Hello World');
    // await browser.deleteSession();
    // await browser.url('https://ahfarmer.github.io/calculator/');
    // const appWrapper = await browser.$('div#root')
    //
    // await browser.react$('t', {
    //     props: { name: '7' }
    // }).click()
    // await browser.react$('t', {
    //     props: { name: 'x' }
    // }).click()
    // await browser.react$('t', {
    //     props: { name: '6' }
    // }).click()
    // await browser.react$('t', {
    //     props: { name: '=' }
    // }).click()

// prints "42"
    //console.log(await $('.component-display').getText());
    //
    // const browser = await remote({
    //     capabilities: {
    //         browserName: 'chrome'
    //     }
    // })
    //
    // await browser.url('https://www.google.com/')
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
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
