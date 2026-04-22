// Global window functions for inline onclick execution
window.updateBookingStatus = async (id, status) => {
    try {
        await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status })
        });
        loadDashboard();
    } catch(err) { alert('Error updating booking status'); }
};

window.deleteBooking = async (id) => {
    if(!confirm("Are you sure you want to delete this appointment?")) return;
    try {
        await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        loadDashboard();
    } catch(err) { alert('Error deleting booking'); }
};

function loadDashboard() {
    if (!localStorage.getItem('auth_token')) {
        window.location.href = 'admin-login.html';
        return;
    }

    const container = document.getElementById('dashboard-bookings');
    if (!container) return;
    
    fetch('/api/bookings')
        .then(res => {
            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = 'admin-login.html';
                throw new Error("Unauthorized");
            }
            return res.json();
        })
        .then(bookings => {
            // Update stats
            const total = 1284 + bookings.length;
            const todayStr = new Date().toISOString().split('T')[0];
            const todayCount = bookings.filter(b => b.date === todayStr).length;
            const pendingCount = bookings.filter(b => b.status === 'Pending').length;
            const completedCount = 42 + bookings.filter(b => b.status === 'Completed').length;
            
            if(document.getElementById('welcome-subtitle')) {
               document.getElementById('welcome-subtitle').innerText = `You have ${todayCount} appointments scheduled for today across two clinics.`;
            }
            if(document.getElementById('stat-total')) {
                document.getElementById('stat-total').innerText = total.toLocaleString();
            }
            if(document.getElementById('stat-today')) {
                document.getElementById('stat-today').innerText = todayCount.toString().padStart(2, '0');
            }
            if(document.getElementById('stat-pending')) {
                document.getElementById('stat-pending').innerText = pendingCount;
            }
            if(document.getElementById('stat-completed')) {
                document.getElementById('stat-completed').innerText = completedCount;
            }

            if (!bookings || bookings.length === 0) {
                container.innerHTML = '<p class="text-xs text-on-surface-variant p-4">No appointments scheduled for today.</p>';
                return;
            }
            
            let html = '';
            const colors = ['primary', 'secondary', 'tertiary', 'slate-300'];
            
            bookings.sort((a,b) => b.id - a.id).forEach((b, index) => {
                const color = b.status === 'Completed' ? 'green-500' : colors[index % colors.length];
                const opacity = b.status === 'Completed' ? 'opacity-60' : '';
                
                html += `
                <div class="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between gap-4 hover:shadow-sm transition-all border-l-4 border-${color} ${opacity}">
                    <div class="flex items-start gap-4 flex-1 overflow-hidden">
                        <div class="shrink-0 text-center w-12">
                            <p class="text-xs font-bold text-on-surface">${b.time ? b.time.split(' ')[0] : 'Time'}</p>
                            <p class="text-[10px] text-on-surface-variant">${b.time && b.time.split(' ')[1] ? b.time.split(' ')[1] : ''}</p>
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <h5 class="text-sm font-bold text-on-surface truncate">${b.name} 
                                <span class="text-[10px] font-normal ${b.status === 'Completed' ? 'text-green-600 bg-green-50' : 'text-on-surface-variant bg-surface-container'} rounded-full px-2 ml-1">${b.status}</span>
                            </h5>
                            <p class="text-[11px] text-on-surface-variant truncate">${b.service} - ${b.date}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        ${b.status !== 'Completed' ? 
                          `<button onclick="updateBookingStatus(${b.id}, 'Completed')" class="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-green-200 flex items-center justify-center" title="Mark Completed"><span class="material-symbols-outlined text-[16px]">check_circle</span></button>` : ''}
                        <button onclick="deleteBooking(${b.id})" class="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200 flex items-center justify-center" title="Delete"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                </div>
                `;
            });
            
            container.innerHTML = html;
        })
        .catch(err => {
            container.innerHTML = '<p class="text-xs text-error p-4">Failed to load appointments from server.</p>';
        });
}

window.logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', loadDashboard);
