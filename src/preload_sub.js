const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
    // 受信
    start: (arg) => {ipcRenderer.send("start", arg)},
});