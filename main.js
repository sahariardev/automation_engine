const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const fs = require('fs');
const {execute} = require("./executor/executor");
const {base64decode, base64encode} = require("nodejs-base64");
let mainWindow = null;
const key = "7q7aIcQKp&6X?MU%h8]:(-?G\"nICmX";

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        maximizable: false,
        webPreferences: {
            devTools: true,
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
    var savedFileInfo = await dialog.showSaveDialog(
        {
            filters: [
                {name: 'Automation files', extensions: ['sakr']}
            ]
        }
    );

    if (!savedFileInfo || savedFileInfo.canceled) {
        return;
    }

    var data = JSON.parse(arg);

    var fileName = savedFileInfo.filePath;

    if (!fileName) {
        return;
    }

    if (!fileName.endsWith('.sakr')) {
        fileName = fileName + '.sakr';
    }

    var encoded = base64encode(arg) + key;

    fs.writeFile(fileName, encoded, err => {
        if (err) {
            console.error(err);
        }
    });

});

ipcMain.on('loadFile', async (event, arg) => {

    var selectedFile = await dialog.showOpenDialog({
        properties: ['openFile'], filters: [
            {name: 'Automation files', extensions: ['sakr']}
        ]
    });

    if (!selectedFile || selectedFile.canceled) {
        return;
    }
    if (!selectedFile.filePaths || !selectedFile.filePaths[0].endsWith('.sakr')) {
        return;
    }

    var filePath = selectedFile.filePaths[0],
        enconded = fs.readFileSync(filePath),
        decodedContent = base64decode(enconded.toString().replace(key, '')),
        fileContent = JSON.parse(decodedContent);

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

