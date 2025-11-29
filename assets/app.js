document.addEventListener('DOMContentLoaded', () => {
    // Setup auth UI
    UI.setupAuthUI();

    // Load snippets
    loadSnippets();

    // Setup modals
    setupModals();

    // Setup filter
    setupFilter();

    // Setup auth forms
    setupAuthForms();
});

function loadSnippets() {
    const currentUser = Auth.getCurrentUser();
    let snippets = DB.getSnippets();
    
    // Filter private snippets jika bukan pemilik
    if (currentUser) {
        snippets = snippets.filter(snippet => 
            !snippet.private || snippet.authorId === currentUser.id
        );
    } else {
        snippets = snippets.filter(snippet => !snippet.private);
    }
    
    const container = document.getElementById('snippetList');
    container.innerHTML = '';
    
    if (snippets.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full">Belum ada snippet</p>';
        return;
    }
    
    snippets.forEach(snippet => {
        const snippetCard = document.createElement('div');
        snippetCard.innerHTML = UI.renderSnippetCard(snippet, currentUser);
        container.appendChild(snippetCard);
    });
    
    // Highlight syntax
    Prism.highlightAll();
}

function setupModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const createSnippetBtn = document.getElementById('createSnippetBtn');
    const createSnippetModal = document.getElementById('createSnippetModal');
    const createSnippetForm = document.getElementById('createSnippetForm');
    
    // Login modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });
    
    // Register modal
    showRegisterBtn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });
    
    showLoginBtn.addEventListener('click', () => {
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });
    
    // Create snippet modal
    createSnippetBtn.addEventListener('click', () => {
        const currentUser = Auth.getCurrentUser();
        if (currentUser) {
            createSnippetModal.classList.remove('hidden');
        } else {
            alert('Silakan login terlebih dahulu');
        }
    });

    createSnippetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        const snippet = {
            id: Date.now().toString(),
            title: document.getElementById('snippetTitle').value,
            language: document.getElementById('snippetLanguage').value,
            code: document.getElementById('snippetCode').value,
            description: document.getElementById('snippetDescription').value,
            private: document.getElementById('snippetPrivate').checked,
            author: currentUser.username,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            likes: [],
            comments: []
        };
        
        DB.addSnippet(snippet);
        createSnippetModal.classList.add('hidden');
        createSnippetForm.reset();
        loadSnippets();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
        if (e.target === registerModal) {
            registerModal.classList.add('hidden');
        }
        if (e.target === createSnippetModal) {
            createSnippetModal.classList.add('hidden');
        }
    });
}

function setupFilter() {
    const filter = document.getElementById('languageFilter');
    filter.addEventListener('change', () => {
        const selectedLanguage = filter.value;
        const snippetCards = document.querySelectorAll('#snippetList > div');
        
        snippetCards.forEach(card => {
            const languageElement = card.querySelector('.bg-gray-200');
            if (languageElement) {
                const cardLanguage = languageElement.textContent.toLowerCase();
                if (selectedLanguage === '' || cardLanguage === selectedLanguage) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
}

function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (Auth.login(username, password)) {
            document.getElementById('loginModal').classList.add('hidden');
            UI.setupAuthUI();
            loadSnippets();
        } else {
            alert('Username atau password salah');
        }
    });
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        
        if (Auth.register(username, password)) {
            alert('Registrasi berhasil, silakan login');
            document.getElementById('registerModal').classList.add('hidden');
            document.getElementById('loginModal').classList.remove('hidden');
        } else {
            alert('Username sudah digunakan');
        }
    });
}

// Global functions for snippet actions
function toggleLike(snippetId) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
        alert('Silakan login terlebih dahulu');
        return;
    }
    
    DB.toggleLike(snippetId, currentUser.id);
    loadSnippets();
}

function toggleFollow(authorId) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
        alert('Silakan login terlebih dahulu');
        return;
    }
    
    if (currentUser.id === authorId) {
        alert('Tidak bisa follow diri sendiri');
        return;
    }
    
    DB.toggleFollow(currentUser.id, authorId);
    loadSnippets();
}
