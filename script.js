// カタカナをひらがなに変換
function toHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, function(ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0x60);
    });
}

// ===== データ =====
let allData = [];
let allShops = [];
let favorites = [];

// ===== 初期読み込み =====
window.onload = async function () {

    const res = await fetch("data.json");
    const rawData = await res.json();

    allShops = rawData;
    allData = flattenData(rawData);

    render(allData);

    document.getElementById("searchBtn").onclick = search;
    document.getElementById("resetBtn").onclick = reset;

    setupLiveSearch();

    document.getElementById("closeModal").onclick = closeModal;

    document.getElementById("modal").onclick = function (e) {
        if (e.target.id === "modal") closeModal();
    };
};

// ===== フラット化 =====
function flattenData(data) {

    let result = [];

    data.forEach(shop => {

        shop.menus.forEach(menu => {

            result.push({
                shopId: shop.id,
                shopName: shop.name,
                area: shop.area, //配列になる
                menuName: menu.name,
                price: menu.price,
                priceText: menu.priceText
            });

        });

    });

    return result;
}

// ===== 検索 =====
function search() {

    let keyword = toHiragana(
        document.getElementById("keyword").value.trim());
    let minPrice = document.getElementById("minPrice").value;
    let maxPrice = document.getElementById("maxPrice").value;
    let sort = document.getElementById("sort").value;

    let areas = [];
    document.querySelectorAll(".sidebar input[type=checkbox]").forEach(cb => {
        if (cb.checked) areas.push(cb.value);
    });

    let keywords = keyword.split(" ").filter(k => k !== "");

    let result = allData.filter(item => {

        let matchKeyword = true;

        if (keywords.length > 0) {
            matchKeyword = keywords.every(k =>
                toHiragana(item.shopName).includes(k) ||
                toHiragana(item.menuName).includes(k)
            );
        }

        let matchArea =
            areas.length === 0 || areas.some(a => item.area.includes(a));

        let matchPrice =
            (!minPrice || item.price >= Number(minPrice)) &&
            (!maxPrice || item.price <= Number(maxPrice));

        return matchKeyword && matchArea && matchPrice;
    });

    if (sort === "low") {
        result.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
        result.sort((a, b) => b.price - a.price);
    } else {
        result.sort((a, b) => Math.abs(a.price - 800) - Math.abs(b.price - 800));
    }

    render(result);
}

// ===== 表示 =====
function render(data) {

    let content = document.querySelector(".content");
    content.innerHTML = "";

    if (data.length === 0) {
        content.innerHTML = `<div class="card"><h3>該当なし</h3></div>`;
        return;
    }

    data.forEach(item => {

        content.innerHTML += `
            <div class="card" onclick="openModal(${item.shopId})">
                <h3>${item.shopName}</h3>
                <p>🍴 ${item.menuName}</p>
                <p class="price">💴 ${item.priceText ?? item.price + "円"}</p>
                <p>📍 ${item.area}</p>
            </div>
        `;
    });
}

// ===== モーダル =====
function openModal(shopId) {

    let shop = allShops.find(s => s.id === shopId);

    document.getElementById("modalShopName").innerText = shop.name;
    document.getElementById("modalArea").innerText = "📍 " + shop.area;

    let html = "";

    shop.menus.forEach(m => {
        html += `<p>🍴 ${m.name}：💴 ${m.price}円</p>`;
    });

    document.getElementById("modalMenus").innerHTML = html;

    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

// ===== リアルタイム検索 =====
function setupLiveSearch() {

    document.getElementById("keyword").addEventListener("input", search);
    document.getElementById("minPrice").addEventListener("input", search);
    document.getElementById("maxPrice").addEventListener("input", search);

    document.querySelectorAll(".sidebar input[type=checkbox]").forEach(cb => {
        cb.addEventListener("change", search);
    });

    document.getElementById("sort").addEventListener("change", search);
}

// ===== リセット =====
function reset() {

    document.getElementById("keyword").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";

    document.querySelectorAll(".sidebar input[type=checkbox]").forEach(cb => {
        cb.checked = false;
    });

    document.getElementById("sort").value = "recommend";

    render(allData);

}

// ===== 簡易パスワード =====
function checkPass() {

    const pass = document.getElementById("pass").value;

    if (pass === "belluna20260804") {

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

    } else {

        alert("パスワードが違います");

    }

}
