var company_id_dict = {}

window.api.on("send_RT_data", (arg) => {
    show_gtfs_realtime_table(arg)
});

window.api.on("start_update", (arg) => {
    setInterval(update_gtfs_realtime, Number(arg["interval_time"]) * 1000, arg["RT_URL"]);

    // タブ作成
    var tabs = document.getElementById("tabs")
    var tab_count = tabs.childElementCount
    company_id_dict[arg["RT_URL"]] = "item" + String(tab_count + 1)

    var child_tab_li = document.createElement("li")
    child_tab_li.className = "nav-item"

    var child_tab_a = document.createElement("a")
    child_tab_a.classList.add("nav-link")
    child_tab_a.setAttribute("id", "item" + String(tab_count + 1) + "-tab")
    child_tab_a.setAttribute("data-toggle", "tab")
    child_tab_a.setAttribute("href", "#item" + String(tab_count + 1))
    child_tab_a.setAttribute("role", "tab")
    child_tab_a.setAttribute("aria-contrils", "item" + String(tab_count + 1))
    child_tab_a.setAttribute("aria-selected", "false")
    child_tab_a.innerHTML = arg["company_name"]

    child_tab_li.appendChild(child_tab_a)
    tabs.appendChild(child_tab_li)

    // タブ中身作成
    var tab_content = document.getElementById("tab-content")

    var child_content_div = document.createElement("div")
    child_content_div.classList.add("tab-pane")
    child_content_div.classList.add("fade")
    child_content_div.setAttribute("id", "item" + String(tab_count + 1))
    child_content_div.setAttribute("role", "tabpanel")
    child_content_div.setAttribute("aria-labelledby", "item" + String(tab_count + 1) + "-tab")

    var content_table = document.createElement("table")
    content_table.setAttribute("id", "item" + String(tab_count + 1) + "-table")
    content_table.classList.add("table")
    content_table.classList.add("table-striped")

    child_content_div.appendChild(content_table)
    tab_content.appendChild(child_content_div)

    // 表示・非表示作成
    var tab1 = document.getElementById("item1")
    // table作成
    var visible_table = document.createElement("table")
    // 会社名作成
    var header_tr = document.createElement("tr")
    header_tr.setAttribute("align", "center")
    var header_th = document.createElement("th")
    header_th.setAttribute("colspan", "2")
    header_th.innerText = arg["company_name"]
    header_tr.appendChild(header_th)
    visible_table.appendChild(header_tr)
    // チェックボックスの行
    var checkbox_tr = document.createElement("tr")
    checkbox_tr.setAttribute("align", "center")
    // バス停セル
    var bus_stop_td = document.createElement("td")
    bus_stop_td.setAttribute("width", "300")
    // バス停チェックボックス
    var bus_stop_label = document.createElement("label")
    var bus_stop_t = document.createElement("t")
    bus_stop_t.innerText = "バス停"
    var bus_stop_checkbox = document.createElement("input")
    bus_stop_checkbox.setAttribute("type", "checkbox")
    bus_stop_checkbox.setAttribute("class", "checkbox")
    bus_stop_checkbox.setAttribute("id", "item" + String(tab_count + 1) + "-stop")
    bus_stop_checkbox.setAttribute("onchange", "change_show_hidden()")
    var bus_stop_span = document.createElement("span")
    bus_stop_span.setAttribute("class", "checkbox-fontas")
    bus_stop_label.appendChild(bus_stop_checkbox)
    bus_stop_label.appendChild(bus_stop_span)
    bus_stop_label.appendChild(bus_stop_t)
    bus_stop_td.appendChild(bus_stop_label)
    checkbox_tr.appendChild(bus_stop_td)
    // リアルタイムセル
    var realtime_td = document.createElement("td")
    realtime_td.setAttribute("width", "300")
    // リアルタイムチェックボックス
    var realtime_label = document.createElement("label")
    var realtime_t = document.createElement("t")
    realtime_t.innerText = "リアルタイム"
    var realtime_checkbox = document.createElement("input")
    realtime_checkbox.setAttribute("type", "checkbox")
    realtime_checkbox.setAttribute("class", "checkbox")
    realtime_checkbox.setAttribute("id", "item" + String(tab_count + 1) + "-realtime")
    realtime_checkbox.setAttribute("onchange", "change_show_hidden()")
    var realtime_span = document.createElement("span")
    realtime_span.setAttribute("class", "checkbox-fontas")
    realtime_label.appendChild(realtime_checkbox)
    realtime_label.appendChild(realtime_span)
    realtime_label.appendChild(realtime_t)
    realtime_td.appendChild(realtime_label)
    checkbox_tr.appendChild(realtime_td)
    visible_table.appendChild(checkbox_tr)
    tab1.appendChild(visible_table)
});

function update_gtfs_realtime(RT_URL) {
    window.api.update_marker(RT_URL);
    console.log("update")
}

document.getElementById("add_gtfs_button").addEventListener("click", (e) => {
    window.api.open_child_window()
});

function show_gtfs_realtime_table([RT_URL, RT_data]) {
    console.log(company_id_dict[RT_URL])
    var table = document.getElementById(company_id_dict[RT_URL] + "-table")

    while (table.firstChild) {
        table.removeChild(table.firstChild)
    }

    var colum_name = ["id", "lat", "lon"]
    var thead = document.createElement("thead")
    var tr = document.createElement("tr")
    for (var i = 0; i < colum_name.length; i++) {
        var th = document.createElement("th")
        th.textContent = colum_name[i]
        tr.appendChild(th)
    }
    thead.appendChild(tr)
    table.appendChild(thead)

    for (var i = 0; i < Object.keys(RT_data.entity).length; i++) {
        var tr = document.createElement("tr")

        var th = document.createElement("th")
        th.textContent = RT_data.entity[i].id
        tr.appendChild(th)

        var td = document.createElement("td")
        td.textContent = RT_data.entity[i].vehicle.position.latitude;
        tr.appendChild(td)

        var td = document.createElement("td")
        td.textContent = RT_data.entity[i].vehicle.position.longitude;
        tr.appendChild(td)

        table.appendChild(tr)
    }
}

function change_show_hidden() {
    var obj = event.target
    // console.log(obj.id)
    var markers = document.querySelectorAll("div#" + obj.id)
    for (var i = 0; i < markers.length; i++) {
        console.log(markers[i])
        if (markers[i].style.visibility == "visible" || !markers[i].style.visibility) markers[i].style.visibility = "hidden"
        else if (markers[i].style.visibility == "hidden") markers[i].style.visibility = "visible"
    }
}