/**
 * db.js - Abstraksi untuk localStorage
 * File ini berisi fungsi-fungsi untuk berinteraksi dengan localStorage
 */

// Namespace untuk database
const db = {
    // Fungsi untuk mendapatkan data dari localStorage
    get: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting data from localStorage: ${error}`);
            return null;
        }
    },
    
    // Fungsi untuk menyimpan data ke localStorage
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting data to localStorage: ${error}`);
            return false;
        }
    },
    
    // Fungsi untuk menghapus data dari localStorage
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing data from localStorage: ${error}`);
            return false;
        }
    },
    
    // Fungsi untuk membersihkan semua data dari localStorage
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error(`Error clearing localStorage: ${error}`);
            return false;
        }
    },
    
    // Fungsi untuk mendapatkan semua pengguna
    getUsers: function() {
        return this.get('users') || [];
    },
    
    // Fungsi untuk menyimpan data pengguna
    saveUsers: function(users) {
        return this.set('users', users);
    },
    
    // Fungsi untuk mendapatkan pengguna berdasarkan username
    getUserByUsername: function(username) {
        const users = this.getUsers();
        return users.find(user => user.username === username) || null;
    },
    
    // Fungsi untuk mendapatkan pengguna berdasarkan ID
    getUserById: function(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id) || null;
    },
    
    // Fungsi untuk menambah pengguna baru
    addUser: function(user) {
        const users = this.getUsers();
        
        // Cek apakah username sudah ada
        if (users.find(u => u.username === user.username)) {
            return { success: false, message: 'Username sudah digunakan' };
        }
        
        // Generate ID untuk user baru
        user.id = Date.now().toString();
        user.createdAt = new Date().toISOString();
        user.profilePic = 'https://via.placeholder.com/150';
        user.bio = '';
        user.role = 'user';
        
        users.push(user);
        this.saveUsers(users);
        
        return { success: true, user };
    },
    
    // Fungsi untuk memperbarui data pengguna
    updateUser: function(id, userData) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Pengguna tidak ditemukan' };
        }
        
        // Cek apakah username baru sudah digunakan oleh pengguna lain
        if (userData.username && userData.username !== users[index].username) {
            const existingUser = users.find(u => u.username === userData.username);
            if (existingUser) {
                return { success: false, message: 'Username sudah digunakan' };
            }
        }
        
        // Update data pengguna
        users[index] = { ...users[index], ...userData };
        this.saveUsers(users);
        
        return { success: true, user: users[index] };
    },
    
    // Fungsi untuk menghapus pengguna
    deleteUser: function(id) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== id);
        
        if (filteredUsers.length === users.length) {
            return { success: false, message: 'Pengguna tidak ditemukan' };
        }
        
        this.saveUsers(filteredUsers);
        
        // Hapus semua snippet milik pengguna
        const snippets = this.getSnippets();
        const filteredSnippets = snippets.filter(snippet => snippet.authorId !== id);
        this.saveSnippets(filteredSnippets);
        
        // Hapus semua komentar milik pengguna
        const comments = this.getComments();
        const filteredComments = comments.filter(comment => comment.userId !== id);
        this.saveComments(filteredComments);
        
        // Hapus semua likes milik pengguna
        const likes = this.getLikes();
        const filteredLikes = likes.filter(like => like.userId !== id);
        this.saveLikes(filteredLikes);
        
        // Hapus semua following milik pengguna
        const following = this.getFollowing();
        const filteredFollowing = following.filter(f => f.followerId !== id || f.followingId !== id);
        this.saveFollowing(filteredFollowing);
        
        return { success: true };
    },
    
    // Fungsi untuk mendapatkan semua snippet
    getSnippets: function() {
        return this.get('snippets') || [];
    },
    
    // Fungsi untuk menyimpan data snippet
    saveSnippets: function(snippets) {
        return this.set('snippets', snippets);
    },
    
    // Fungsi untuk mendapatkan snippet berdasarkan ID
    getSnippetById: function(id) {
        const snippets = this.getSnippets();
        return snippets.find(snippet => snippet.id === id) || null;
    },
    
    // Fungsi untuk menambah snippet baru
    addSnippet: function(snippet) {
        const snippets = this.getSnippets();
        
        // Generate ID untuk snippet baru
        snippet.id = Date.now().toString();
        snippet.createdAt = new Date().toISOString();
        snippet.likes = 0;
        snippet.comments = 0;
        
        snippets.push(snippet);
        this.saveSnippets(snippets);
        
        return { success: true, snippet };
    },
    
    // Fungsi untuk memperbarui data snippet
    updateSnippet: function(id, snippetData) {
        const snippets = this.getSnippets();
        const index = snippets.findIndex(snippet => snippet.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Snippet tidak ditemukan' };
        }
        
        // Update data snippet
        snippets[index] = { ...snippets[index], ...snippetData };
        this.saveSnippets(snippets);
        
        return { success: true, snippet: snippets[index] };
    },
    
    // Fungsi untuk menghapus snippet
    deleteSnippet: function(id) {
        const snippets = this.getSnippets();
        const filteredSnippets = snippets.filter(snippet => snippet.id !== id);
        
        if (filteredSnippets.length === snippets.length) {
            return { success: false, message: 'Snippet tidak ditemukan' };
        }
        
        this.saveSnippets(filteredSnippets);
        
        // Hapus semua komentar pada snippet
        const comments = this.getComments();
        const filteredComments = comments.filter(comment => comment.snippetId !== id);
        this.saveComments(filteredComments);
        
        // Hapus semua likes pada snippet
        const likes = this.getLikes();
        const filteredLikes = likes.filter(like => like.snippetId !== id);
        this.saveLikes(filteredLikes);
        
        return { success: true };
    },
    
    // Fungsi untuk mendapatkan semua komentar
    getComments: function() {
        return this.get('comments') || [];
    },
    
    // Fungsi untuk menyimpan data komentar
    saveComments: function(comments) {
        return this.set('comments', comments);
    },
    
    // Fungsi untuk mendapatkan komentar berdasarkan snippet ID
    getCommentsBySnippetId: function(snippetId) {
        const comments = this.getComments();
        return comments.filter(comment => comment.snippetId === snippetId);
    },
    
    // Fungsi untuk menambah komentar baru
    addComment: function(comment) {
        const comments = this.getComments();
        
        // Generate ID untuk komentar baru
        comment.id = Date.now().toString();
        comment.createdAt = new Date().toISOString();
        
        comments.push(comment);
        this.saveComments(comments);
        
        // Update jumlah komentar pada snippet
        const snippet = this.getSnippetById(comment.snippetId);
        if (snippet) {
            this.updateSnippet(comment.snippetId, { comments: snippet.comments + 1 });
        }
        
        return { success: true, comment };
    },
    
    // Fungsi untuk menghapus komentar
    deleteComment: function(id) {
        const comments = this.getComments();
        const commentIndex = comments.findIndex(comment => comment.id === id);
        
        if (commentIndex === -1) {
            return { success: false, message: 'Komentar tidak ditemukan' };
        }
        
        const comment = comments[commentIndex];
        const filteredComments = comments.filter(c => c.id !== id);
        this.saveComments(filteredComments);
        
        // Update jumlah komentar pada snippet
        const snippet = this.getSnippetById(comment.snippetId);
        if (snippet && snippet.comments > 0) {
            this.updateSnippet(comment.snippetId, { comments: snippet.comments - 1 });
        }
        
        return { success: true };
    },
    
    // Fungsi untuk mendapatkan semua likes
    getLikes: function() {
        return this.get('likes') || [];
    },
    
    // Fungsi untuk menyimpan data likes
    saveLikes: function(likes) {
        return this.set('likes', likes);
    },
    
    // Fungsi untuk mengecek apakah user sudah like snippet
    isLiked: function(userId, snippetId) {
        const likes = this.getLikes();
        return likes.some(like => like.userId === userId && like.snippetId === snippetId);
    },
    
    // Fungsi untuk menambah atau menghapus like
    toggleLike: function(userId, snippetId) {
        const likes = this.getLikes();
        const existingLikeIndex = likes.findIndex(like => like.userId === userId && like.snippetId === snippetId);
        
        if (existingLikeIndex !== -1) {
            // Hapus like
            likes.splice(existingLikeIndex, 1);
            this.saveLikes(likes);
            
            // Update jumlah likes pada snippet
            const snippet = this.getSnippetById(snippetId);
            if (snippet && snippet.likes > 0) {
                this.updateSnippet(snippetId, { likes: snippet.likes - 1 });
            }
            
            return { success: true, liked: false };
        } else {
            // Tambah like
            likes.push({
                id: Date.now().toString(),
                userId,
                snippetId,
                createdAt: new Date().toISOString()
            });
            this.saveLikes(likes);
            
            // Update jumlah likes pada snippet
            const snippet = this.getSnippetById(snippetId);
            if (snippet) {
                this.updateSnippet(snippetId, { likes: snippet.likes + 1 });
            }
            
            return { success: true, liked: true };
        }
    },
    
    // Fungsi untuk mendapatkan semua following
    getFollowing: function() {
        return this.get('following') || [];
    },
    
    // Fungsi untuk menyimpan data following
    saveFollowing: function(following) {
        return this.set('following', following);
    },
    
    // Fungsi untuk mengecek apakah user sudah follow user lain
    isFollowing: function(followerId, followingId) {
        const following = this.getFollowing();
        return following.some(f => f.followerId === followerId && f.followingId === followingId);
    },
    
    // Fungsi untuk menambah atau menghapus follow
    toggleFollow: function(followerId, followingId) {
        const following = this.getFollowing();
        const existingFollowIndex = following.findIndex(f => f.followerId === followerId && f.followingId === followingId);
        
        if (existingFollowIndex !== -1) {
            // Hapus follow
            following.splice(existingFollowIndex, 1);
            this.saveFollowing(following);
            return { success: true, following: false };
        } else {
            // Tambah follow
            following.push({
                id: Date.now().toString(),
                followerId,
                followingId,
                createdAt: new Date().toISOString()
            });
            this.saveFollowing(following);
            return { success: true, following: true };
        }
    },
    
    // Fungsi untuk mendapatkan jumlah follower user
    getFollowerCount: function(userId) {
        const following = this.getFollowing();
        return following.filter(f => f.followingId === userId).length;
    },
    
    // Fungsi untuk mendapatkan jumlah following user
    getFollowingCount: function(userId) {
        const following = this.getFollowing();
        return following.filter(f => f.followerId === userId).length;
    },
    
    // Fungsi untuk mendapatkan semua follower user
    getFollowers: function(userId) {
        const following = this.getFollowing();
        const followers = following.filter(f => f.followingId === userId);
        
        // Dapatkan data user untuk setiap follower
        const users = this.getUsers();
        return followers.map(f => {
            const user = users.find(u => u.id === f.followerId);
            return user ? { ...f, user } : null;
        }).filter(Boolean);
    },
    
    // Fungsi untuk mendapatkan semua following user
    getUserFollowing: function(userId) {
        const following = this.getFollowing();
        const userFollowing = following.filter(f => f.followerId === userId);
        
        // Dapatkan data user untuk setiap following
        const users = this.getUsers();
        return userFollowing.map(f => {
            const user = users.find(u => u.id === f.followingId);
            return user ? { ...f, user } : null;
        }).filter(Boolean);
    },
    
    // Fungsi untuk mendapatkan semua snippet yang disukai user
    getLikedSnippets: function(userId) {
        const likes = this.getLikes();
        const userLikes = likes.filter(like => like.userId === userId);
        
        // Dapatkan data snippet untuk setiap like
        const snippets = this.getSnippets();
        return userLikes.map(like => {
            const snippet = snippets.find(s => s.id === like.snippetId);
            return snippet ? { ...like, snippet } : null;
        }).filter(Boolean);
    },
    
    // Fungsi untuk mendapatkan semua snippet user
    getUserSnippets: function(userId) {
        const snippets = this.getSnippets();
        return snippets.filter(snippet => snippet.authorId === userId);
    },
    
    // Fungsi untuk mendapatkan total likes user
    getUserTotalLikes: function(userId) {
        const snippets = this.getUserSnippets(userId);
        return snippets.reduce((total, snippet) => total + snippet.likes, 0);
    },
    
    // Fungsi untuk inisialisasi database dengan data default
    init: function() {
        // Cek apakah sudah ada data users
        const users = this.getUsers();
        if (users.length === 0) {
            // Tambahkan admin default
            this.addUser({
                username: 'dapsz1',
                password: '082197',
                role: 'admin'
            });
        }
        
        // Cek apakah sudah ada data snippets
        const snippets = this.getSnippets();
        if (snippets.length === 0) {
            // Tambahkan contoh snippet
            const adminUser = this.getUserByUsername('dapsz1');
            if (adminUser) {
                this.addSnippet({
                    title: 'Contoh Snippet JavaScript',
                    language: 'javascript',
                    code: 'function helloWorld() {\n  console.log("Hello, World!");\n}',
                    description: 'Ini adalah contoh snippet JavaScript sederhana.',
                    authorId: adminUser.id,
                    isPrivate: false
                });
                
                this.addSnippet({
                    title: 'Contoh Snippet Python',
                    language: 'python',
                    code: 'def hello_world():\n    print("Hello, World!")',
                    description: 'Ini adalah contoh snippet Python sederhana.',
                    authorId: adminUser.id,
                    isPrivate: false
                });
            }
        }
    }
};

// Inisialisasi database saat file dimuat
db.init();
