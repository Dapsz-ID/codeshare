/**
 * auth.js - Otentikasi dan Manajemen Sesi
 * File ini berisi fungsi-fungsi untuk login, register, dan manajemen sesi pengguna
 */

// Namespace untuk otentikasi
const auth = {
    // Fungsi untuk login
    login: function(username, password) {
        // Validasi input
        if (!username || !password) {
            return { success: false, message: 'Username dan password harus diisi' };
        }
        
        // Cari user berdasarkan username
        const user = db.getUserByUsername(username);
        
        // Cek apakah user ada dan password cocok
        if (!user || user.password !== password) {
            return { success: false, message: 'Username atau password salah' };
        }
        
        // Buat sesi
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        
        // Simpan sesi ke localStorage
        db.set('session', session);
        
        return { success: true, user };
    },
    
    // Fungsi untuk register
    register: function(username, password) {
        // Validasi input
        if (!username || !password) {
            return { success: false, message: 'Username dan password harus diisi' };
        }
        
        if (password.length < 6) {
            return { success: false, message: 'Password minimal 6 karakter' };
        }
        
        // Validasi username (hanya huruf, angka, dan underscore)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, message: 'Username hanya boleh berisi huruf, angka, dan underscore' };
        }
        
        // Tambah user baru
        const result = db.addUser({
            username,
            password
        });
        
        if (!result.success) {
            return result;
        }
        
        // Login otomatis setelah register
        return this.login(username, password);
    },
    
    // Fungsi untuk logout
    logout: function() {
        db.remove('session');
        return { success: true };
    },
    
    // Fungsi untuk mendapatkan sesi saat ini
    getCurrentSession: function() {
        return db.get('session');
    },
    
    // Fungsi untuk mendapatkan user yang sedang login
    getCurrentUser: function() {
        const session = this.getCurrentSession();
        if (!session) {
            return null;
        }
        
        return db.getUserById(session.userId);
    },
    
    // Fungsi untuk mengecek apakah user sudah login
    isLoggedIn: function() {
        return this.getCurrentSession() !== null;
    },
    
    // Fungsi untuk mengecek apakah user adalah admin
    isAdmin: function() {
        const session = this.getCurrentSession();
        return session && session.role === 'admin';
    },
    
    // Fungsi untuk mengecek apakah user adalah moderator
    isModerator: function() {
        const session = this.getCurrentSession();
        return session && (session.role === 'admin' || session.role === 'moderator');
    },
    
    // Fungsi untuk memerbarui password
    changePassword: function(userId, currentPassword, newPassword) {
        // Validasi input
        if (!currentPassword || !newPassword) {
            return { success: false, message: 'Password saat ini dan password baru harus diisi' };
        }
        
        if (newPassword.length < 6) {
            return { success: false, message: 'Password baru minimal 6 karakter' };
        }
        
        // Dapatkan user
        const user = db.getUserById(userId);
        if (!user) {
            return { success: false, message: 'Pengguna tidak ditemukan' };
        }
        
        // Verifikasi password saat ini
        if (user.password !== currentPassword) {
            return { success: false, message: 'Password saat ini salah' };
        }
        
        // Update password
        const result = db.updateUser(userId, { password: newPassword });
        
        if (!result.success) {
            return result;
        }
        
        return { success: true, message: 'Password berhasil diubah' };
    },
    
    // Fungsi untuk memerbarui username
    changeUsername: function(userId, newUsername) {
        // Validasi input
        if (!newUsername) {
            return { success: false, message: 'Username baru harus diisi' };
        }
        
        // Validasi username (hanya huruf, angka, dan underscore)
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            return { success: false, message: 'Username hanya boleh berisi huruf, angka, dan underscore' };
        }
        
        // Update username
        const result = db.updateUser(userId, { username: newUsername });
        
        if (!result.success) {
            return result;
        }
        
        // Update session dengan username baru
        const session = this.getCurrentSession();
        if (session) {
            session.username = newUsername;
            db.set('session', session);
        }
        
        return { success: true, message: 'Username berhasil diubah' };
    },
    
    // Fungsi untuk memerbarui foto profil
    changeProfilePic: function(userId, profilePic) {
        // Update foto profil
        const result = db.updateUser(userId, { profilePic });
        
        if (!result.success) {
            return result;
        }
        
        return { success: true, message: 'Foto profil berhasil diubah' };
    },
    
    // Fungsi untuk memerbarui bio
    changeBio: function(userId, bio) {
        // Update bio
        const result = db.updateUser(userId, { bio });
        
        if (!result.success) {
            return result;
        }
        
        return { success: true, message: 'Bio berhasil diubah' };
    },
    
    // Fungsi untuk menghapus akun
    deleteAccount: function(userId, password) {
        // Validasi input
        if (!password) {
            return { success: false, message: 'Password harus diisi' };
        }
        
        // Dapatkan user
        const user = db.getUserById(userId);
        if (!user) {
            return { success: false, message: 'Pengguna tidak ditemukan' };
        }
        
        // Verifikasi password
        if (user.password !== password) {
            return { success: false, message: 'Password salah' };
        }
        
        // Hapus user
        const result = db.deleteUser(userId);
        
        if (!result.success) {
            return result;
        }
        
        // Logout
        this.logout();
        
        return { success: true, message: 'Akun berhasil dihapus' };
    },
    
    // Fungsi untuk mempromosikan/demote user
    changeUserRole: function(userId, newRole) {
        // Validasi role
        if (!['user', 'moderator', 'admin'].includes(newRole)) {
            return { success: false, message: 'Role tidak valid' };
        }
        
        // Update role
        const result = db.updateUser(userId, { role: newRole });
        
        if (!result.success) {
            return result;
        }
        
        // Update session jika user yang diubah adalah user yang sedang login
        const session = this.getCurrentSession();
        if (session && session.userId === userId) {
            session.role = newRole;
            db.set('session', session);
        }
        
        return { success: true, message: `Role pengguna berhasil diubah menjadi ${newRole}` };
    },
    
    // Fungsi untuk mengecek apakah user memiliki badge verified
    isVerified: function(userId) {
        const followerCount = db.getFollowerCount(userId);
        return followerCount >= 50;
    }
};
