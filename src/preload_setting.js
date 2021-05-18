const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
    // 受信
    set_RT_URL: (arg) => ipcRenderer.send("set_RT_URL", arg),
    send_gtfs_zip: () => ipcRenderer.send("send_gtfs_zip"),

    //送信
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});