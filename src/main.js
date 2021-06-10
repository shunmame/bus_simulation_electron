const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const node_zip = require('node-zip')
const fs = require("fs")
const iconv = require('iconv-lite')

require('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
});

var mainWindow, subWindow;
var stopsList = []
var tmp_GtfsRTData
var gtfsRTDataList = []
var staticGtfsDataDict = {}

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
        height: 600,
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
    event.sender.send("start_update", args);
})

ipcMain.handle("get_new_RT_info", function () {
    if (tmp_GtfsRTData) {
        gtfsRTDataList.push(tmp_GtfsRTData)
        var returnData = tmp_GtfsRTData
        tmp_GtfsRTData = null
        return returnData
    }
    else {
        return false
    }
})

ipcMain.on("add_RT_data", function (event, args) {
    tmp_GtfsRTData = args
})

function convert_stops_for_plot(stopsData) {
    var buf = new Buffer.from(stopsData, 'binary');
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
            stopsList.push(stops_dict)
        }
    })
    return stopsList
}

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

            fs.readFile(result.filePaths[0], "binary", function (err, data) {
                if (err) throw err
                var zip = new node_zip(data, { base64: false, checkCRC32: true })
                staticGtfsDataDict[result.filePaths[0]] = zip.files
            })
        }).catch((err) => console.log(err))
})

ipcMain.handle("get_stops_list", function (event, zipPath) {
    return convert_stops_for_plot(staticGtfsDataDict[zipPath]["stops.txt"]._data)
})

ipcMain.on("open_child_window", function () {
    subWindow = new BrowserWindow({
        width: 600,
        height: 600,
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