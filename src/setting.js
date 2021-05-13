// 送信
document.getElementById("start_button").addEventListener("click", (e) => {
    var RT_URL = document.getElementById("RT_URL").value
    window.api.set_RT_URL(RT_URL)
    window.close();
});