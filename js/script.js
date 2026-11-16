
// ================================
// CEK LOGIN PENGGUNA
// ================================

const currentUserId = localStorage.getItem("washupCurrentUser");
const users = JSON.parse(localStorage.getItem("washupUsers")) || [];

const currentUser = users.find(
    user => String(user.id) === String(currentUserId)
);

// Jika belum login, arahkan ke halaman login
if (!currentUser) {
    window.location.href = "login.html";
}


// ================================
// MENGAMBIL DATA PESANAN
// ================================

function getOrders() {
    return JSON.parse(localStorage.getItem("washupOrders")) || [];
}

// Mengambil pesanan khusus pengguna yang sedang login
function getMyOrders() {
    return getOrders().filter(
        order => String(order.userId) === String(currentUser.id)
    );
}


// ================================
// FORMAT RUPIAH
// ================================

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(Number(number) || 0);
}


// ================================
// MENGAMANKAN TEKS HTML
// ================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// ================================
// MENAMPILKAN DATA PENGGUNA
// ================================

function displayUser() {
    document.getElementById("dashboardUserName").textContent =
        currentUser.name;

    document.getElementById("welcomeUserName").textContent =
        currentUser.name;

    document.getElementById("userAvatar").textContent =
        currentUser.name.charAt(0).toUpperCase();
}


// ================================
// MENAMPILKAN TANGGAL
// ================================

function displayDate() {
    const dateElement = document.getElementById("currentDate");

    const today = new Date();

    dateElement.textContent = today.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// ================================
// MENAMPILKAN RINGKASAN PESANAN
// ================================

function displaySummary() {
    const orders = getMyOrders();

    // Total seluruh pesanan
    document.getElementById("totalOrders").textContent =
        orders.length;

    // Pesanan yang sedang diproses
    document.getElementById("processingOrders").textContent =
        orders.filter(order =>
            order.status === "Diproses"
        ).length;

    // Pesanan dalam pengiriman
    document.getElementById("deliveryOrders").textContent =
        orders.filter(order =>
            order.status === "Dalam Pengiriman"
        ).length;

    // Pesanan yang sudah selesai
    document.getElementById("completedOrders").textContent =
        orders.filter(order =>
            order.status === "Selesai"
        ).length;
}


// ================================
// MENAMPILKAN PESANAN TERBARU
// ================================

function displayRecentOrders() {
    const table = document.getElementById("dashboardOrderTable");

    const orders = getMyOrders()
        .slice()
        .sort((a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 5);

    if (orders.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    Belum ada pesanan laundry.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = orders.map(order => `
        <tr>
            <td>${escapeHTML(order.id)}</td>
            <td>${escapeHTML(order.service)}</td>
            <td>${formatRupiah(order.total)}</td>
            <td>${escapeHTML(order.status)}</td>
            <td>${escapeHTML(
                order.paymentStatus || "Menunggu Pembayaran"
            )}</td>
        </tr>
    `).join("");
}


// ================================
// LOGOUT
// ================================

document.getElementById("logoutBtn").addEventListener(
    "click",
    function(event) {
        event.preventDefault();

        const confirmation = confirm(
            "Apakah kamu yakin ingin logout?"
        );

        if (confirmation) {
            localStorage.removeItem("washupCurrentUser");
            window.location.href = "login.html";
        }
    }
);


// ================================
// MENJALANKAN SEMUA FUNGSI
// ================================

if (currentUser) {
    displayUser();
    displayDate();
    displaySummary();
    displayRecentOrders();
}
