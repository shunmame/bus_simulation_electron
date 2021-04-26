window.onload = function () {
    setInterval(update_gtfs_realtime, 15000);
}

const gtfs_RT_textfield = document.getElementById("gtfs_RT_data");

// 送信
// button1.addEventListener("click", (e) => {
//     window.api.send("add_marker");
// });

// 受信
window.api.on("gtfs_RT_data", (arg) => {
    console.log(arg);
    gtfs_RT_textfield.textContent = arg
});

function update_gtfs_realtime() {
    window.api.send("update_marker");
    console.log("update")
}