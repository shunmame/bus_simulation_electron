document.getElementById("start_button").addEventListener("click", (e) => {
    var RT_URL = document.getElementById("RT_URL").value
    var zip_path = document.getElementById("zip_path").value
    if (RT_URL && zip_path) {
        window.api.set_RT_URL(RT_URL)
        window.close();
    }
    
    if (!RT_URL) document.getElementById("validate_url").style.visibility = "visible"; else document.getElementById("validate_url").style.visibility = "hidden";
    if (!zip_path) document.getElementById("validate_zip").style.visibility = "visible"; else document.getElementById("validate_zip").style.visibility = "hidden";
});

document.querySelector("#file_open_button").addEventListener("click", async () => {
    window.api.send_gtfs_zip()
})

// 受信
window.api.on("send_zip_path", (arg) => {
    document.getElementById("zip_path").value = arg
});