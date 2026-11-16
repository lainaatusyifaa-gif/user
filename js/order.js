
// ======================================
// 1. CEK USER YANG SEDANG LOGIN
// ======================================

const currentUserId = localStorage.getItem("washupCurrentUser");
const users = JSON.parse(localStorage.getItem("washupUsers")) || [];

const currentUser = users.find(user =>
    String(user.id) === String(currentUserId)
);

if (!currentUser) {
    window.location.href = "login.html";
}


// ======================================
// 2. DATA HARGA LAYANAN
// ======================================

const servicePrices = {
    "Laundry Kiloan": 7000,
    "Setrika": 5000,
    "Laundry Express": 12000
};


// ======================================
// 3. MENGAMBIL DAN MENYIMPAN PESANAN
// ======================================

function getOrders() {
    return JSON.parse(localStorage.getItem("washupOrders")) || [];
}

function saveOrders(orders) {
    localStorage.setItem("washupOrders", JSON.stringify(orders));
}

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}


// ======================================
// 4. MENAMPILKAN INFORMASI USER
// ======================================

function displayUser() {
    if (!currentUser) return;

    const name = currentUser.name || "User WashUp";

    const nameElement = document.getElementById("dashboardUserName");
    const avatarElement = document.getElementById("userAvatar");

    if (nameElement) nameElement.textContent = name;

    if (avatarElement) {
        avatarElement.textContent = name.charAt(0).toUpperCase();
    }
}


// ======================================
// 5. MENGHITUNG ESTIMASI HARGA
// ======================================

const serviceInput = document.getElementById("service");
const weightInput = document.getElementById("weight");
const totalElement = document.getElementById("estimatedTotal");

function calculateTotal() {
    const service = serviceInput.value;
    const weight = Number(weightInput.value);

    const price = servicePrices[service] || 0;
    const total = price * weight;

    totalElement.textContent = formatRupiah(total);
}

serviceInput.addEventListener("change", calculateTotal);
weightInput.addEventListener("input", calculateTotal);


// ======================================
// 6. MENGATUR MODE EDIT
// ======================================

const orderForm = document.getElementById("orderForm");
const submitButton = document.getElementById("submitOrderBtn");
const cancelEditButton = document.getElementById("cancelEditBtn");

const params = new URLSearchParams(window.location.search);
const editId = params.get("edit");

let editingOrder = null;

function resetEditMode() {
    editingOrder = null;
    orderForm.reset();
    calculateTotal();

    submitButton.textContent = "Buat Pesanan";
    cancelEditButton.hidden = true;

    window.history.replaceState({}, "", "pesan.html");
}

if (editId) {
    const orders = getOrders();

    editingOrder = orders.find(order =>
        String(order.id) === String(editId) &&
        String(order.userId) === String(currentUser.id)
    );

    if (!editingOrder) {
        alert("Pesanan tidak ditemukan.");
        window.location.href = "riwayat.html";
    } else if (editingOrder.status !== "Menunggu Konfirmasi") {
        alert("Pesanan ini sudah dikonfirmasi dan tidak dapat diedit.");
        window.location.href = "riwayat.html";
    } else {
        serviceInput.value = editingOrder.service;
        weightInput.value = editingOrder.weight;
        document.getElementById("phone").value = editingOrder.phone;
        document.getElementById("address").value = editingOrder.address;
        document.getElementById("pickupDate").value = editingOrder.pickupDate;
        document.getElementById("notes").value = editingOrder.notes || "";

        submitButton.textContent = "Simpan Perubahan";
        cancelEditButton.hidden = false;

        calculateTotal();
    }
}


// ======================================
// 7. MEMBATALKAN MODE EDIT
// ======================================

cancelEditButton.addEventListener("click", function() {
    resetEditMode();
});


// ======================================
// 8. CREATE DAN UPDATE PESANAN
// ======================================

orderForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!currentUser) return;

    const service = serviceInput.value;
    const weight = Number(weightInput.value);
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const pickupDate = document.getElementById("pickupDate").value;
    const notes = document.getElementById("notes").value.trim();

    if (!servicePrices[service]) {
        alert("Silakan pilih layanan laundry.");
        return;
    }

    if (!Number.isFinite(weight) || weight < 1) {
        alert("Berat minimal adalah 1 kg.");
        return;
    }

    if (!phone || !address || !pickupDate) {
        alert("Mohon lengkapi semua data wajib.");
        return;
    }

    const selectedDate = new Date(pickupDate);

    if (Number.isNaN(selectedDate.getTime()) ||
        selectedDate.getTime() <= Date.now()) {
        alert("Jadwal penjemputan harus di waktu mendatang.");
        return;
    }

    const total = servicePrices[service] * weight;
    const orders = getOrders();

    // UPDATE PESANAN
    if (editingOrder) {
        const index = orders.findIndex(order =>
            String(order.id) === String(editingOrder.id) &&
            String(order.userId) === String(currentUser.id)
        );

        if (index === -1 ||
            orders[index].status !== "Menunggu Konfirmasi") {
            alert("Pesanan tidak dapat diubah.");
            return;
        }

        orders[index] = {
            ...orders[index],
            service,
            weight,
            phone,
            address,
            pickupDate,
            notes,
            total,
            updatedAt: new Date().toISOString()
        };

        saveOrders(orders);

        alert("Pesanan berhasil diperbarui!");
    }

    // CREATE PESANAN BARU
    else {
        const newOrder = {
            id: "WU" + Date.now(),
            userId: currentUser.id,
            service,
            weight,
            phone,
            address,
            pickupDate,
            notes,
            total,
            status: "Menunggu Konfirmasi",
            paymentStatus: "Menunggu Pembayaran",
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        saveOrders(orders);

        alert("Pesanan berhasil dibuat!");
    }

    window.location.href = "riwayat.html";
});


// ======================================
// 9. LOGOUT
// ======================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function(event) {
        event.preventDefault();

        if (confirm("Apakah kamu yakin ingin logout?")) {
            localStorage.removeItem("washupCurrentUser");
            window.location.href = "login.html";
        }
    });
}


// ======================================
// 10. JALANKAN FUNGSI
// ======================================

if (currentUser) {
    displayUser();
    calculateTotal();
}
