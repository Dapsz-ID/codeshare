// UI helper functions
const UI = {
    // Escape HTML untuk mencegah XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    // Render snippet card
    renderSnippetCard(snippet, currentUser) {
        const author = DB.getUserById(snippet.authorId);
        const isLiked = currentUser && snippet.likes.includes(currentUser.id);
        const isFollowing = currentUser && author && currentUser.following.includes(author.id);
        
        return `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="font-bold text-lg mb-2">${snippet.title}</h3>
                <div class="flex items-center mb-2">
                    <img src="${author?.avatar || 'https://via.placeholder.com/40'}" alt="Avatar" class="w-6 h-6 rounded-full mr-2">
                    <a href="profile.html" class="text-sm font-medium">${snippet.author}</a>
                    ${author && author.followers >= 50 ? '<span class="text-blue-600 ml-1">✔</span>' : ''}
                </div>
                <div class="text-sm text-gray-500 mb-2">
                    <span class="bg-gray-200 px-2 py-1 rounded">${snippet.language}</span>
                    <span class="ml-2">${new Date(snippet.createdAt).toLocaleDateString()}</span>
                </div>
                <pre class="bg-gray-100 p-3 rounded mb-3 overflow-x-auto"><code class="language-${snippet.language}">${this.escapeHtml(snippet.code.substring(0, 100))}${snippet.code.length > 100 ? '...' : ''}</code></pre>
                <p class="text-gray-600 mb-3">${snippet.description || 'Tidak ada deskripsi'}</p>
                <div class="flex justify-between items-center">
                    <div class="flex space-x-3">
                        <button onclick="toggleLike('${snippet.id}')" class="flex items-center ${isLiked ? 'text-red-600' : 'text-gray-600'}">
                            <span class="mr-1">❤️</span>
                            <span>${snippet.likes.length}</span>
                        </button>
                        <a href="snippet.html?id=${snippet.id}" class="flex items-center text-gray-600">
                            <span class="mr-1">💬</span>
                            <span>${snippet.comments.length}</span>
                        </a>
                        <button onclick="toggleFollow('${snippet.authorId}')" class="flex items-center ${isFollowing ? 'text-blue-600' : 'text-gray-600'}">
                            <span class="mr-1">${isFollowing ? 'Following' : 'Follow'}</span>
                        </button>
                    </div>
                    <a href="snippet.html?id=${snippet.id}" class="text-blue-600 hover:underline">Lihat Detail</a>
                </div>
            </div>
        `;
    },

    // Setup auth UI
    setupAuthUI() {
        const currentUser = Auth.getCurrentUser();
        
        if (currentUser) {
            document.getElementById('loginBtn').classList.add('hidden');
            document.getElementById('logoutBtn').classList.remove('hidden');
            document.getElementById('profileLink').classList.remove('hidden');
            document.getElementById('settingsLink').classList.remove('hidden');
            
            if (currentUser.role === 'admin') {
                document.getElementById('adminLink').classList.remove('hidden');
            }
        } else {
            document.getElementById('loginBtn').classList.remove('hidden');
            document.getElementById('logoutBtn').classList.add('hidden');
            document.getElementById('profileLink').classList.add('hidden');
            document.getElementById('settingsLink').classList.add('hidden');
            document.getElementById('adminLink').classList.add('hidden');
        }
    }
};
