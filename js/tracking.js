
// ================================
// CEK LOGIN PENGGUNA
// ================================

const currentUserId = localStorage.getItem("washupCurrentUser");
const users = JSON.parse(localStorage.getItem("washupUsers")) || [];

const currentUser = users.find(
    user => String(user.id) === String(currentUserId)
);

if (!currentUser) {
    window.location.href = "login.html";
}


// ================================
// MENGAMBIL DATA PESANAN
// ================================

function getOrders() {
    return JSON.parse(localStorage.getItem("washupOrders")) || [];
}

// Hanya mengambil pesanan milik pengguna yang login
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
    document.getElementById("trackingUserName").textContent =
        currentUser.name;

    document.getElementById("userAvatar").textContent =
        currentUser.name.charAt(0).toUpperCase();
}


// ================================
// DAFTAR TAHAPAN PESANAN
// ================================

const trackingSteps = [
    "Menunggu Konfirmasi",
    "Diproses",
    "Dalam Pengiriman",
    "Selesai"
];


// ================================
// MENAMPILKAN PILIHAN PESANAN
// ================================

function displayOrderOptions() {
    const select = document.getElementById("trackingOrderSelect");
    const orders = getMyOrders();

    select.innerHTML = `
        <option value="">-- Pilih pesanan --</option>
    `;

    orders.forEach(order => {
        const option = document.createElement("option");

        option.value = order.id;
        option.textContent = `${order.id} - ${order.service}`;

        select.appendChild(option);
    });

    if (orders.length === 0) {
        document.getElementById("trackingContent").innerHTML = `
            <div class="tracking-empty">
                <h3>Belum ada pesanan</h3>
                <p>Kamu belum memiliki pesanan laundry untuk dilacak.</p>
                <a href="pesan.html" class="primary-button">
                    Pesan Laundry
                </a>
            </div>
        `;
        select.disabled = true;
    }
}


// ================================
// FORMAT TANGGAL
// ================================

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ================================
// MENAMPILKAN DETAIL TRACKING
// ================================

function displayTracking(orderId) {
    const order = getMyOrders().find(
        item => String(item.id) === String(orderId)
    );

    const content = document.getElementById("trackingContent");

    if (!order) {
        content.innerHTML = `
            <div class="tracking-empty">
                <h3>Pesanan tidak ditemukan</h3>
                <p>Silakan pilih pesanan yang tersedia.</p>
            </div>
        `;
        return;
    }

    // Jika pesanan dibatalkan
    if (order.status === "Dibatalkan") {
        content.innerHTML = `
            <div class="tracking-detail-card">
                <h3>Detail Pesanan</h3>

                <div class="tracking-info">
                    <p><strong>ID Pesanan:</strong> ${escapeHTML(order.id)}</p>
                    <p><strong>Layanan:</strong> ${escapeHTML(order.service)}</p>
                    <p><strong>Total:</strong> ${formatRupiah(order.total)}</p>
                    <p><strong>Status:</strong>
                        <span class="tracking-cancelled">Dibatalkan</span>
                    </p>
                </div>

                <div class="tracking-notice">
                    Pesanan ini telah dibatalkan dan tidak dilanjutkan ke proses laundry.
                </div>
            </div>
        `;
        return;
    }

    const currentStatus = order.status || "Menunggu Konfirmasi";
    const currentIndex = trackingSteps.indexOf(currentStatus);

    // Menampilkan tahapan proses laundry
    const timelineHTML = trackingSteps.map((step, index) => {
        let className = "";

        if (currentIndex >= index) {
            className = "completed";
        }

        if (currentIndex === index) {
            className += " current";
        }

        return `
            <div class="tracking-step ${className}">
                <div class="tracking-circle">
                    ${currentIndex >= index ? "✓" : index + 1}
                </div>

                <div class="tracking-step-info">
                    <strong>${step}</strong>
                    <p>${getStepDescription(step)}</p>
                </div>
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <div class="tracking-detail-card">

            <div class="tracking-card-header">
                <div>
                    <h3>Detail Pesanan</h3>
                    <p>${escapeHTML(order.id)}</p>
                </div>

                <span class="tracking-current-status">
                    ${escapeHTML(currentStatus)}
                </span>
            </div>

            <div class="tracking-info">
                <div>
                    <span>Layanan</span>
                    <strong>${escapeHTML(order.service)}</strong>
                </div>

                <div>
                    <span>Berat</span>
                    <strong>${escapeHTML(order.weight)} kg</strong>
                </div>

                <div>
                    <span>Total Pembayaran</span>
                    <strong>${formatRupiah(order.total)}</strong>
                </div>

                <div>
                    <span>Status Pembayaran</span>
                    <strong>${escapeHTML(
                        order.paymentStatus || "Menunggu Pembayaran"
                    )}</strong>
                </div>

                <div>
                    <span>Tanggal Pemesanan</span>
                    <strong>${formatDate(order.createdAt)}</strong>
                </div>

                <div>
                    <span>Jadwal Penjemputan</span>
                    <strong>${formatDate(order.pickupDate)}</strong>
                </div>
            </div>

            <div class="tracking-timeline">
                <h3>Perkembangan Pesanan</h3>

                <div class="tracking-steps">
                    ${timelineHTML}
                </div>
            </div>

            <div class="tracking-notice">
                ${getTrackingMessage(currentStatus)}
            </div>

        </div>
    `;
}


// ================================
// DESKRIPSI SETIAP TAHAPAN
// ================================

function getStepDescription(step) {
    const descriptions = {
        "Menunggu Konfirmasi":
            "Pesanan sedang menunggu konfirmasi dari admin.",

        "Diproses":
            "Laundry sedang dikerjakan oleh pihak WashUp.",

        "Dalam Pengiriman":
            "Pesanan sedang dalam proses pengiriman kepada pengguna.",

        "Selesai":
            "Pesanan laundry telah selesai."
    };

    return descriptions[step] || "Status pesanan sedang diperbarui.";
}


// ================================
// PESAN BERDASARKAN STATUS
// ================================

function getTrackingMessage(status) {
    const messages = {
        "Menunggu Konfirmasi":
            "Pesanan berhasil dibuat. Silakan tunggu konfirmasi dari admin.",

        "Diproses":
            "Pesanan kamu sedang dikerjakan. Terima kasih telah menggunakan WashUp Laundry.",

        "Dalam Pengiriman":
            "Pesanan sedang dalam perjalanan menuju alamat kamu.",

        "Selesai":
            "Pesanan telah selesai. Terima kasih telah mempercayakan laundry kamu kepada WashUp!"
    };

    return messages[status] ||
        "Status pesanan belum tersedia. Silakan hubungi admin.";
}


// ================================
// EVENT PILIH PESANAN
// ================================

document.getElementById("trackingOrderSelect")
    .addEventListener("change", function () {

        if (this.value) {
            displayTracking(this.value);
        } else {
            document.getElementById("trackingContent").innerHTML = `
                <div class="tracking-empty">
                    <h3>Belum ada pesanan dipilih</h3>
                    <p>Silakan pilih salah satu pesanan untuk melihat statusnya.</p>
                </div>
            `;
        }
    });


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
// MENJALANKAN FUNGSI
// ================================

if (currentUser) {
    displayUser();
    displayOrderOptions();
}
