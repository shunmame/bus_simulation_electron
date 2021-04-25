window.onload = function () {
    setInterval(update_gtfs_realtime_ipc, 15000);
}

//適当なプログラム
const button1 = document.getElementById("button1");

// 送信
button1.addEventListener("click", (e) => {
    window.api.send("add_marker");
});

// 受信
window.api.on("async-reply", (arg) => {
    console.log(arg);
});

function update_gtfs_realtime_ipc() {
    window.api.send("update_marker");
    console.log("update")
}