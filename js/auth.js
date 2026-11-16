
// Mengambil data akun yang tersimpan
function getUsers() {
    return JSON.parse(localStorage.getItem("washupUsers")) || [];
}

// Menyimpan data akun
function saveUsers(users) {
    localStorage.setItem("washupUsers", JSON.stringify(users));
}

// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (password !== confirm) {
            alert("Konfirmasi password tidak sesuai!");
            return;
        }

        const users = getUsers();

        const emailExists = users.some(user => user.email === email);

        if (emailExists) {
            alert("Email sudah terdaftar!");
            return;
        }

        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            phone: "",
            address: ""
        };

        users.push(newUser);
        saveUsers(users);

        alert("Registrasi berhasil! Silakan login.");
        window.location.href = "login.html";
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = getUsers();

        const user = users.find(item =>
            item.email === email && item.password === password
        );

        if (!user) {
            alert("Email atau password salah!");
            return;
        }

        localStorage.setItem("washupCurrentUser", user.id);

        alert("Login berhasil!");
        window.location.href = "index.html";
    });
}

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const confirmLogout = confirm("Apakah kamu yakin ingin logout?");

        if (confirmLogout) {
            localStorage.removeItem("washupCurrentUser");
            window.location.href = "login.html";
        }
    });
}
