document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('auth_token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span>Authenticating...</span>';
        btn.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                localStorage.setItem('auth_token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error || "Login failed");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (err) {
            alert('Server error during authentication');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
});
