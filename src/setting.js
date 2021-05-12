// 送信
document.getElementById("start_button").addEventListener("click", (e) => {
    var RT_URL = document.getElementById("RT_URL").value
    console.log(RT_URL)
    window.api.send("start", RT_URL)
    window.close();
});