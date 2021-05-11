const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
    //rendererからの送信用//
    send: (channel, data) => {
        if (channel == "start") {
            console.log(data)
        }
        else {
            ipcRenderer.send(channel, data);
        }
    },
    //rendererでの受信用, funcはコールバック関数//
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});