
const currentUserId = localStorage.getItem("washupCurrentUser");
const users = JSON.parse(localStorage.getItem("washupUsers")) || [];

const currentUser = users.find(
    user => String(user.id) === String(currentUserId)
);

if (!currentUser) {
    window.location.href = "login.html";
}

const orderSelect = document.getElementById("orderSelect");
const paymentMethod = document.getElementById("paymentMethod");
const paymentProof = document.getElementById("paymentProof");
const paymentForm = document.getElementById("paymentForm");

function getOrders() {
    return JSON.parse(localStorage.getItem("washupOrders")) || [];
}

function saveOrders(orders) {
    localStorage.setItem("washupOrders", JSON.stringify(orders));
}

function getPayments() {
    return JSON.parse(localStorage.getItem("washupPayments")) || [];
}

function savePayments(payments) {
    localStorage.setItem("washupPayments", JSON.stringify(payments));
}

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

// Menampilkan informasi pengguna
function displayUser() {
    if (!currentUser) return;

    document.getElementById("paymentUserName").textContent =
        currentUser.name;

    document.getElementById("userAvatar").textContent =
        currentUser.name.charAt(0).toUpperCase();
}

// Mengambil pesanan milik pengguna yang belum selesai dibayar
function getUnpaidOrders() {
    return getOrders().filter(order =>
        String(order.userId) === String(currentUser.id) &&
        order.status !== "Dibatalkan" &&
        order.paymentStatus !== "Berhasil" &&
        order.paymentStatus !== "Menunggu Verifikasi"
    );
}

// Menampilkan daftar pesanan
function displayPaymentOrders() {
    const orders = getOrders().filter(order =>
        String(order.userId) === String(currentUser.id) &&
        order.status !== "Dibatalkan"
    );

    const unpaidOrders = getUnpaidOrders();

    const orderList = document.getElementById("paymentOrderList");

    if (orders.length === 0) {
        orderList.innerHTML = `
            <p class="empty-row">Kamu belum memiliki pesanan laundry.</p>
        `;
    } else {
        orderList.innerHTML = orders.map(order => `
            <div class="payment-order-item">
                <div>
                    <strong>${escapeHTML(order.id)}</strong>
                    <p>${escapeHTML(order.service)}</p>
                    <small>${escapeHTML(order.paymentStatus || "Menunggu Pembayaran")}</small>
                </div>
                <strong>${formatRupiah(Number(order.total) || 0)}</strong>
            </div>
        `).join("");
    }

    orderSelect.innerHTML = `
        <option value="">-- Pilih pesanan --</option>
    `;

    unpaidOrders.forEach(order => {
        const option = document.createElement("option");

        option.value = order.id;
        option.textContent =
            `${order.id} - ${order.service} (${formatRupiah(order.total)})`;

        orderSelect.appendChild(option);
    });

    const hasUnpaidOrders = unpaidOrders.length > 0;

    orderSelect.disabled = !hasUnpaidOrders;
    paymentMethod.disabled = !hasUnpaidOrders;
    paymentProof.disabled = !hasUnpaidOrders;
    document.getElementById("submitPaymentBtn").disabled = !hasUnpaidOrders;

    if (!hasUnpaidOrders) {
        document.getElementById("paymentInstruction").textContent =
            "Tidak ada pesanan yang perlu dibayar saat ini.";
    }
}

// Menampilkan total tagihan berdasarkan pesanan
function displayPaymentTotal() {
    const selectedId = orderSelect.value;

    const order = getUnpaidOrders().find(
        item => String(item.id) === String(selectedId)
    );

    document.getElementById("paymentTotal").textContent =
        order ? formatRupiah(Number(order.total) || 0) : "Rp0";
}

// Menampilkan instruksi pembayaran
function displayPaymentInstruction() {
    const method = paymentMethod.value;
    const instruction = document.getElementById("paymentInstruction");

    if (method === "Transfer Bank") {
        instruction.textContent =
            "Silakan transfer ke rekening Bank WashUp (nomor rekening dan nama pemilik rekening perlu disesuaikan dengan data resmi kelompok).";
    } else if (method === "E-Wallet") {
        instruction.textContent =
            "Silakan lakukan pembayaran melalui E-Wallet WashUp (nomor atau akun tujuan perlu disesuaikan dengan data resmi kelompok).";
    } else {
        instruction.textContent =
            "Pilih metode pembayaran untuk melihat instruksi.";
    }
}

// Mengamankan teks sebelum ditampilkan ke HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Menampilkan riwayat pembayaran
function displayPaymentHistory() {
    const payments = getPayments().filter(payment =>
        String(payment.userId) === String(currentUser.id)
    );

    const table = document.getElementById("paymentHistoryTable");

    if (payments.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="empty-row">
                    Belum ada riwayat pembayaran.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = payments.map(payment => `
        <tr>
            <td>${escapeHTML(payment.orderId)}</td>
            <td>${escapeHTML(payment.method)}</td>
            <td>${formatRupiah(Number(payment.total) || 0)}</td>
            <td>
                <span class="status-label">
                    ${escapeHTML(payment.status)}
                </span>
            </td>
        </tr>
    `).join("");
}

// Menampilkan nama file yang dipilih
paymentProof.addEventListener("change", function () {
    const file = this.files[0];

    document.getElementById("proofFileName").textContent =
        file ? `File dipilih: ${file.name}` : "";
});

// Memproses pembayaran
paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const orderId = orderSelect.value;
    const method = paymentMethod.value;
    const file = paymentProof.files[0];

    if (!orderId || !method || !file) {
        alert("Lengkapi semua data pembayaran terlebih dahulu.");
        return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
        alert("Bukti pembayaran harus berupa gambar JPG atau PNG.");
        return;
    }

    if (file.size > 500 * 1024) {
        alert("Ukuran bukti pembayaran maksimal 500 KB.");
        return;
    }

    const orders = getOrders();

    const order = orders.find(item =>
        String(item.id) === String(orderId) &&
        String(item.userId) === String(currentUser.id)
    );

    if (!order || order.status === "Dibatalkan") {
        alert("Pesanan tidak ditemukan atau sudah dibatalkan.");
        return;
    }

    if (
        order.paymentStatus === "Berhasil" ||
        order.paymentStatus === "Menunggu Verifikasi"
    ) {
        alert("Pembayaran untuk pesanan ini sudah dikirim atau selesai.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        const payments = getPayments();

        const payment = {
            id: "PAY" + Date.now(),
            orderId: order.id,
            userId: currentUser.id,
            method: method,
            total: Number(order.total) || 0,
            proofName: file.name,
            proofData: reader.result,
            status: "Menunggu Verifikasi",
            createdAt: new Date().toISOString()
        };

        payments.push(payment);
        savePayments(payments);

        order.paymentStatus = "Menunggu Verifikasi";
        order.paymentMethod = method;

        saveOrders(orders);

        alert("Bukti pembayaran berhasil dikirim. Silakan tunggu verifikasi admin.");

        paymentForm.reset();
        document.getElementById("proofFileName").textContent = "";
        document.getElementById("paymentTotal").textContent = "Rp0";

        displayPaymentOrders();
        displayPaymentHistory();
    };

    reader.onerror = function () {
        alert("File bukti pembayaran gagal dibaca. Silakan coba lagi.");
    };

    reader.readAsDataURL(file);
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", function (event) {
    event.preventDefault();

    const confirmation = confirm("Apakah kamu yakin ingin logout?");

    if (confirmation) {
        localStorage.removeItem("washupCurrentUser");
        window.location.href = "login.html";
    }
});

// Event ketika pilihan pesanan atau metode berubah
orderSelect.addEventListener("change", displayPaymentTotal);
paymentMethod.addEventListener("change", displayPaymentInstruction);

// Jalankan fungsi
if (currentUser) {
    displayUser();
    displayPaymentOrders();
    displayPaymentHistory();
}
