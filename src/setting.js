document.getElementById("start_button").addEventListener("click", (e) => {
    var RT_URL = document.getElementById("RT_URL").value
    var zip_path = document.getElementById("zip_path").value
    var company_name = document.getElementById("bus_company_name").value
    var interval_time = document.getElementById("interval_time").value

    if (RT_URL && zip_path && company_name && Number(interval_time) >= 15) {
        window.api.add_RT_data({
            "RT_URL": RT_URL,
            "zip_path": zip_path,
            "company_name": company_name,
            "interval_time": interval_time
        })
        window.close();
    }

    if (!RT_URL) document.getElementById("validate_url").style.visibility = "visible"; else document.getElementById("validate_url").style.visibility = "hidden";
    if (!zip_path) document.getElementById("validate_zip").style.visibility = "visible"; else document.getElementById("validate_zip").style.visibility = "hidden";
    if (!company_name) document.getElementById("validate_name").style.visibility = "visible"; else document.getElementById("validate_name").style.visibility = "hidden";
    if (Number(interval_time) < 15) document.getElementById("validate_time").style.visibility = "visible"; else document.getElementById("validate_time").style.visibility = "hidden";
});

document.querySelector("#file_open_button").addEventListener("click", () => {
    window.api.send_gtfs_zip()
})

// 受信
window.api.on("send_zip_path", (arg) => {
    document.getElementById("zip_path").value = arg
});