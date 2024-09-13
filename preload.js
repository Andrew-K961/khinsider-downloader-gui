/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('API', {
    runIndexer: (urlInput) => ipcRenderer.send('runIndexer', urlInput),
    runDownloader: (jsonOutput) => ipcRenderer.send('runDownloader', jsonOutput),
    receiveUpdate: (callback) => ipcRenderer.on('receiveUpdate', (_event, jsonResponse) => callback(jsonResponse)),
    openFile: () => ipcRenderer.invoke('dialog:openFile')
})