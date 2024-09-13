const { ipcMain } = require('electron')
const { app, BrowserWindow, dialog } = require('electron/main')
const path = require('node:path')
const {PythonShell} = require('python-shell')

let urlIndexer = new PythonShell('./indexer.py', {mode: 'json'});
let downloader = new PythonShell('./downloader.py', {mode: 'json'});

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

async function handleFileOpen () {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (!canceled) {
      return filePaths[0]
    }
}

function runDownloader (_event, downloadInput) {
    //PythonShell.run('downloader.py', {mode: 'json', args: jsonOut})
    downloader.send(JSON.parse(downloadInput));
}

function runUrlIndexer (_event, urlInput) {
    urlIndexer.send({ input: urlInput });
}
