const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onSendMetadata: (callback) => ipcRenderer.on('send-metadata', callback)
})