const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')

const createWindow = () => {
    const mainWindow = new BrowserWindow(
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
    

    const subWindow = new BrowserWindow({
        width: 600,
        height: 500,
        parent: mainWindow,
        resizable: false,
        webPreferences: {
            preload: __dirname + '/preload_sub.js',
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    // subWindow.on('close', () => console.log('BrowserWindow.close'));

    // subWindow.webContents.openDevTools({ mode: "detach" });
    subWindow.loadFile('setting.html');mainWindow.loadFile('index.html')
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

ipcMain.on("gtfs_RT_data", function (event, args) {
    event.sender.send("gtfs_RT_data", args);
})

ipcMain.on("start", function (event, arg) {
    event.sender.send("start", arg)
})