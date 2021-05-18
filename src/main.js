const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const node_zip = require('node-zip')
const fs = require("fs")
const iconv = require('iconv-lite')

var mainWindow, subWindow;
var stops_list = []
var RT_URL

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

    // subWindow.webContents.openDevTools({ mode: "detach" });
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

ipcMain.handle("get_RT_URL", function () {
    return RT_URL
})

ipcMain.on("set_RT_URL", function (event, arg) {
    RT_URL = arg
})

ipcMain.on("send_gtfs_zip", function (event) {
    dialog.showOpenDialog(
        subWindow,
        {
            filters: [{
                name: "zip",
                extensions: ["zip"]
            }],
            properties: [
                'openFile' // ファイルの選択を許可
            ]
        }).then((result) => {
            if (result.canceled) return
            event.sender.send("send_zip_path", result.filePaths[0])
            // console.log(result.filePaths)

            fs.readFile(result.filePaths[0], "binary", function (err, data) {
                if (err) throw err
                var zip = new node_zip(data, { base64: false, checkCRC32: true })
                for (var fname in zip.files) {
                    if (fname == "stops.txt") {
                        var buf = new Buffer.from(zip.files["stops.txt"]._data, 'binary');
                        var retStr = iconv.decode(buf, "utf8");
                        var columns
                        retStr.split("\n").forEach(function (row, index) {
                            if (index == 0) {
                                columns = row.split(",")
                            }
                            else if (index != 0 && columns.length != 0) {
                                var row_split = row.split(",")
                                var stops_dict = {}
                                for (var i = 0; i < columns.length; i++) {
                                    if (row_split[i]) stops_dict[columns[i].replace(/^\s+|\s+$/g, '')] = row_split[i].replace(/^\s+|\s+$/g, '')
                                    else stops_dict[columns[i].replace(/^\s+|\s+$/g, '')] = ""
                                }
                                stops_list.push(stops_dict)
                            }
                        })
                        // console.log(stops_list)
                    }
                }
            })

        }).catch((err) => console.log(err))
})

ipcMain.handle("get_gtfs_list", function () {
    return stops_list
})

ipcMain.on("open_child_window", function () {
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

    // subWindow.webContents.openDevTools({ mode: "detach" });
    subWindow.loadFile('setting.html')
})