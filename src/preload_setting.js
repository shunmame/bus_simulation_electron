const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
    // 受信
    set_RT_URL: (arg) => {ipcRenderer.send("set_RT_URL", arg)},
});