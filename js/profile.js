
// ================================
// CEK LOGIN PENGGUNA
// ================================

const currentUserId = localStorage.getItem("washupCurrentUser");
let users = JSON.parse(localStorage.getItem("washupUsers")) || [];

let currentUser = users.find(
    user => String(user.id) === String(currentUserId)
);

// Jika pengguna belum login, arahkan ke halaman login
if (!currentUser) {
    window.location.href = "login.html";
}


// ================================
// MENGAMBIL ELEMEN HTML
// ================================

const profileForm = document.getElementById("profileForm");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");

const profileHeaderName = document.getElementById("profileHeaderName");
const profileDisplayName = document.getElementById("profileDisplayName");
const userAvatar = document.getElementById("userAvatar");
const profilePreview = document.getElementById("profilePreview");
const profileMessage = document.getElementById("profileMessage");


// ================================
// MENAMPILKAN DATA PROFIL
// ================================

function displayProfile() {
    if (!currentUser) return;

    profileName.value = currentUser.name || "";
    profileEmail.value = currentUser.email || "";
    profilePhone.value = currentUser.phone || "";
    profileAddress.value = currentUser.address || "";

    updateProfileDisplay();
}


// ================================
// MEMPERBARUI TAMPILAN PROFIL
// ================================

function updateProfileDisplay() {
    const name = currentUser.name || "Pengguna";
    const initial = name.charAt(0).toUpperCase();

    profileHeaderName.textContent = name;
    profileDisplayName.textContent = name;
    userAvatar.textContent = initial;
    profilePreview.textContent = initial;
}


// ================================
// MENYIMPAN PERUBAHAN PROFIL
// ================================

profileForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = profileName.value.trim();
    const email = profileEmail.value.trim().toLowerCase();
    const phone = profilePhone.value.trim();
    const address = profileAddress.value.trim();

    // Validasi data
    if (!name || !email || !phone || !address) {
        showMessage("Semua data profil wajib diisi.", "error");
        return;
    }

    // Memeriksa format email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showMessage("Format email tidak valid.", "error");
        return;
    }

    // Memeriksa apakah email sudah digunakan akun lain
    const emailExists = users.some(user =>
        user.email.toLowerCase() === email &&
        String(user.id) !== String(currentUser.id)
    );

    if (emailExists) {
        showMessage("Email sudah digunakan oleh akun lain.", "error");
        return;
    }

    // Memperbarui data pengguna
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.address = address;

    // Memperbarui data di dalam array users
    users = users.map(user =>
        String(user.id) === String(currentUser.id)
            ? currentUser
            : user
    );

    // Menyimpan perubahan ke localStorage
    localStorage.setItem("washupUsers", JSON.stringify(users));

    // Memperbarui tampilan
    updateProfileDisplay();

    showMessage("Profil berhasil diperbarui!", "success");
});


// ================================
// MENAMPILKAN PESAN
// ================================

function showMessage(message, type) {
    profileMessage.textContent = message;
    profileMessage.className = "profile-message " + type;
}


// ================================
// TOMBOL BATAL
// ================================

document.getElementById("resetProfileBtn")
    .addEventListener("click", function() {

        setTimeout(() => {
            displayProfile();
            profileMessage.textContent = "";
        }, 0);
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
    displayProfile();
}
