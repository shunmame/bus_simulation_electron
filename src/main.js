const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')

const createWindow = () => {
    const mainWindow = new BrowserWindow(
        {
            width: 1000,
            height: 1000,
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

ipcMain.on("keyword", function (event, args) {
    // event.sender.send("keyword");
})