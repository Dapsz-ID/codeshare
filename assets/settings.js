document.addEventListener('DOMContentLoaded', () => {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Load current data
    loadCurrentData(currentUser);

    // Setup avatar upload
    setupAvatarUpload(currentUser);

    // Setup change password form
    setupChangePasswordForm(currentUser);

    // Setup change username form
    setupChangeUsernameForm(currentUser);

    // Setup edit bio form
    setupEditBioForm(currentUser);

    // Setup delete account
    setupDeleteAccount(currentUser);

    // Show admin link if admin
    if (currentUser.role === 'admin') {
        document.getElementById('adminLink').classList.remove('hidden');
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Auth.logout();
        window.location.href = 'index.html';
    });
});

function loadCurrentData(user) {
    // Load avatar
    if (user.avatar) {
        document.getElementById('avatarPreview').src = user.avatar;
    }

    // Load bio
    document.getElementById('bioText').value = user.bio || '';
}

function setupAvatarUpload(user) {
    const avatarInput = document.getElementById('avatarInput');
    const uploadBtn = document.getElementById('uploadAvatarBtn');
    const avatarPreview = document.getElementById('avatarPreview');

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                avatarPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    uploadBtn.addEventListener('click', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarData = event.target.result;
                DB.updateUser(user.id, { avatar: avatarData });
                alert('Foto profil berhasil diperbarui');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Pilih file terlebih dahulu');
        }
    });
}

function setupChangePasswordForm(user) {
    const form = document.getElementById('changePasswordForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validasi password lama
        if (oldPassword !== user.password) {
            alert('Password lama salah');
            return;
        }
        
        // Validasi password baru
        if (newPassword !== confirmPassword) {
            alert('Konfirmasi password baru tidak cocok');
            return;
        }
        
        // Update password
        DB.updateUser(user.id, { password: newPassword });
        alert('Password berhasil diperbarui');
        form.reset();
    });
}

function setupChangeUsernameForm(user) {
    const form = document.getElementById('changeUsernameForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newUsername = document.getElementById('newUsername').value;
        
        // Cek jika username sudah ada
        if (DB.getUserByUsername(newUsername) && newUsername !== user.username) {
            alert('Username sudah digunakan');
            return;
        }
        
        // Update username di semua data terkait
        const data = DB.getData();
        
        // Update di user
        const userIndex = data.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            data.users[userIndex].username = newUsername;
        }
        
        // Update di snippets
        data.snippets.forEach(snippet => {
            if (snippet.authorId === user.id) {
                snippet.author = newUsername;
            }
        });
        
        // Update di comments
        data.comments.forEach(comment => {
            if (comment.authorId === user.id) {
                comment.author = newUsername;
            }
        });
        
        // Update session
        const session = JSON.parse(localStorage.getItem('codeshare_session'));
        session.username = newUsername;
        localStorage.setItem('codeshare_session', JSON.stringify(session));
        
        DB.saveData(data);
        alert('Username berhasil diperbarui');
        form.reset();
    });
}

function setupEditBioForm(user) {
    const form = document.getElementById('editBioForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const bio = document.getElementById('bioText').value;
        DB.updateUser(user.id, { bio });
        alert('Bio berhasil diperbarui');
    });
}

function setupDeleteAccount(user) {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    deleteBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin menghapus akun? Semua data Anda akan dihapus permanen.')) {
            DB.deleteUser(user.id);
            Auth.logout();
            window.location.href = 'index.html';
        }
    });
}
