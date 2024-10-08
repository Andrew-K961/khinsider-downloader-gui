const { ipcMain } = require('electron')
const { app, BrowserWindow, dialog } = require('electron/main')
const path = require('node:path')
const { PythonShell } = require('python-shell')
const fs = require("fs");

let urlIndexer = new PythonShell(findIndexer(), { mode: 'json', pythonPath: findPython()});
let downloader = new PythonShell(findDownloader(), { mode: 'json', pythonPath: findPython()});

// Used this: https://til.simonwillison.net/electron/python-inside-electron but with hood tech workarounds
function findPython() {
    const possibilities = [
        // In packaged app
        path.join(process.resourcesPath, process.platform, "python", "python.exe"),
        // In development
        path.join('win32', "python", "python.exe"),
    ];
    for (const path of possibilities) {
        if (fs.existsSync(path)) {
            return path;
        }
    }
    return 'python';
}

function findIndexer() {
    const possibilities = [
        // In packaged app
        path.join(process.resourcesPath, 'indexer.py'),
        // In development
        './indexer.py'
    ];
    for (const path of possibilities) {
        if (fs.existsSync(path)) {
            return path;
        }
    }
    throw new Error('script not found');
}

function findDownloader() {
    const possibilities = [
        // In packaged app
        path.join(process.resourcesPath, 'downloader.py'),
        // In development
        './downloader.py'
    ];
    for (const path of possibilities) {
        if (fs.existsSync(path)) {
            return path;
        }
    }
    throw new Error('script not found');
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')

    urlIndexer.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
        win.webContents.send('receiveUpdate', JSON.stringify(message));
    });
    downloader.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
        win.webContents.send('receiveUpdate', JSON.stringify(message));
    });

    let shell = require('electron').shell
    win.webContents.on('will-navigate', function (e, url) {
        if (url != win.webContents.getURL()) {
            e.preventDefault()
            shell.openExternal(url)
        }
    });
}

app.whenReady().then(() => {
    createWindow()

    ipcMain.on('runIndexer', runUrlIndexer)
    ipcMain.on('runDownloader', runDownloader)
    ipcMain.handle('dialog:openFile', handleFileOpen)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (!canceled) {
        return filePaths[0]
    }
}

function runDownloader(_event, downloadInput) {
    //PythonShell.run('downloader.py', {mode: 'json', args: jsonOut})
    downloader.send(JSON.parse(downloadInput));
}

function runUrlIndexer(_event, urlInput) {
    urlIndexer.send({ input: urlInput });
}
