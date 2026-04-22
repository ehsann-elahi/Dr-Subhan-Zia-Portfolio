// Auth Gate
if (!localStorage.getItem('auth_token')) {
    window.location.href = 'admin-login.html';
}

// Tab switching logic
window.showSection = function(name) {
    // Hide all panels
    document.querySelectorAll('.settings-section').forEach(el => el.classList.add('hidden'));
    // Reset all tabs
    document.querySelectorAll('.settings-tab').forEach(el => {
        el.classList.remove('text-blue-700', 'bg-primary/5');
        el.classList.add('text-slate-500', 'hover:bg-slate-50');
    });
    
    // Show selected panel
    const panel = document.getElementById('section-' + name);
    if (panel) panel.classList.remove('hidden');
    
    // Activate selected tab
    const tab = document.getElementById('tab-' + name);
    if (tab) {
        tab.classList.add('text-blue-700', 'bg-primary/5');
        tab.classList.remove('text-slate-500', 'hover:bg-slate-50');
    }
};

window.logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', () => {
    // Activate profile tab by default
    showSection('profile');
});
