const { app, BrowserWindow, ipcMain, dialog } = require('electron')

var mainWindow, subWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow(
        {
            width: 1400,
            height: 1000,
            resizable: false,
            webPreferences: {
                preload: __dirname + '/preload.js',
                nodeIntegration: false,
                contextIsolation: true
            }
        }
    )

    // 開発ツールを有効化
    mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.loadFile('index.html')

    subWindow = new BrowserWindow({
        width: 600,
        height: 500,
        parent: mainWindow,
        resizable: false,
        webPreferences: {
            preload: __dirname + '/preload_setting.js',
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    subWindow.on('close', () => mainWindow.webContents.send("close_child_win"));

    subWindow.webContents.openDevTools({ mode: "detach" });
    subWindow.loadFile('setting.html')
}

app.whenReady().then(() => {
    createWindow()
    app.on(
        'activate',
        () => !BrowserWindow.getAllWindows().length && createWindow()
    )
})

app.on(
    'window-all-closed',
    () => process.platform !== 'darwin' && app.quit()
)

ipcMain.on("get_RT_data", function (event, args) {
    event.sender.send("send_RT_data", args);
})

ipcMain.on("start_update", function (event, args) {
    event.sender.send("start_update");
})

ipcMain.handle("get_RT_URL", function (event, arg) {
    return global.RT_URL
})

ipcMain.on("set_RT_URL", function (event, arg) {
    global.RT_URL = arg
})

ipcMain.on("send_gtfs_zip", function (event) {
    dialog.showOpenDialog(
        subWindow,
        {
        filters: [{
            name: "zip",
            extensions: ["zip"]
        }],
        properties:[
            'openFile' // ファイルの選択を許可
        ]
    }).then((result) => {
        if(result.canceled) return
        event.sender.send("send_zip_path", result.filePaths[0])
        console.log(result.filePaths)
    }).catch((err) => console.log(err))
})