const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs');
const {execute} = require("./executor/executor");
let mainWindow = null;

function createWindow() {

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
    mainWindow.loadFile('index.html')
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

    var fileContent = JSON.parse(fs.readFileSync(filePath));

    if (fileContent) {
        mainWindow.webContents.send('fileLoaded', {fileContent: fileContent});
    }

});

ipcMain.on('clicked', async (event, arg) => {
    var props = JSON.parse(arg);
    await execute(props.siteUrl, props.actions);
});

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

