
const currentUserId = localStorage.getItem("washupCurrentUser");
const users = JSON.parse(localStorage.getItem("washupUsers")) || [];

const currentUser = users.find(user =>
    String(user.id) === String(currentUserId)
);

if (!currentUser) {
    window.location.href = "login.html";
}

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

// Menampilkan informasi user
document.getElementById("dashboardUserName").textContent =
    currentUser.name || "User";

document.getElementById("userAvatar").textContent =
    (currentUser.name || "U").charAt(0).toUpperCase();

// Mengamankan teks yang ditampilkan
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// READ: Menampilkan pesanan milik user
function displayOrders() {
    const table = document.getElementById("orderTable");

    const orders = getOrders().filter(order =>
        String(order.userId) === String(currentUser.id)
    );

    if (orders.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    Kamu belum memiliki pesanan laundry.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = [...orders].reverse().map(order => {
        const canManage = order.status === "Menunggu Konfirmasi";

        return `
            <tr>
                <td>${escapeHTML(order.id)}</td>
                <td>${escapeHTML(order.service)}</td>
                <td>${Number(order.weight) || 0} kg</td>
                <td>${formatRupiah(Number(order.total) || 0)}</td>
                <td>
                    <span class="status-label">
                        ${escapeHTML(order.status)}
                    </span>
                </td>
                <td>
                    <button
                        class="action-button detail-button"
                        data-action="detail"
                        data-id="${escapeHTML(order.id)}">
                        Detail
                    </button>

                    ${canManage ? `
                        <button
                            class="action-button edit-button"
                            data-action="edit"
                            data-id="${escapeHTML(order.id)}">
                            Edit
                        </button>

                        <button
                            class="action-button delete-button"
                            data-action="cancel"
                            data-id="${escapeHTML(order.id)}">
                            Batalkan
                        </button>
                    ` : ""}
                </td>
            </tr>
        `;
    }).join("");
}

// Menangani tombol aksi
document.getElementById("orderTable").addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    const orders = getOrders();

    const order = orders.find(item =>
        String(item.id) === String(id) &&
        String(item.userId) === String(currentUser.id)
    );

    if (!order) {
        alert("Pesanan tidak ditemukan.");
        return;
    }

    // DETAIL PESANAN
    if (action === "detail") {
        const detail = `
ID Pesanan: ${order.id}
Layanan: ${order.service}
Berat: ${order.weight} kg
Nomor HP: ${order.phone}
Alamat: ${order.address}
Jadwal Penjemputan: ${order.pickupDate}
Catatan: ${order.notes || "-"}
Total: ${formatRupiah(order.total)}
Status: ${order.status}
        `;

        alert(detail);
    }

    // UPDATE: Mengedit pesanan
    if (action === "edit") {
        if (order.status !== "Menunggu Konfirmasi") {
            alert("Pesanan sudah dikonfirmasi dan tidak dapat diedit.");
            return;
        }

        window.location.href =
            "pesan.html?edit=" + encodeURIComponent(order.id);
    }

    // DELETE: Membatalkan pesanan
    if (action === "cancel") {
        if (order.status !== "Menunggu Konfirmasi") {
            alert("Pesanan ini tidak bisa dibatalkan langsung.");
            return;
        }

        const confirmation = confirm(
            "Apakah kamu yakin ingin membatalkan pesanan " + order.id + "?"
        );

        if (!confirmation) return;

        const updatedOrders = orders.filter(item =>
            !(String(item.id) === String(id) &&
              String(item.userId) === String(currentUser.id))
        );

        saveOrders(updatedOrders);

        alert("Pesanan berhasil dibatalkan.");
        displayOrders();
    }
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", function(event) {
    event.preventDefault();

    if (confirm("Apakah kamu yakin ingin logout?")) {
        localStorage.removeItem("washupCurrentUser");
        window.location.href = "login.html";
    }
});

// Jalankan
displayOrders();
