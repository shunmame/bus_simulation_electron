document.getElementById("start_button").addEventListener("click", (e) => {
    var RT_URL = document.getElementById("RT_URL").value
    window.api.set_RT_URL(RT_URL)
    window.close();
});

document.querySelector("#file_open_button").addEventListener("click", async () => {
    window.api.send_gtfs_zip()
})

// 受信
window.api.on("send_zip_path", (arg) => {
    document.getElementById("zip_path").textContent = arg
});