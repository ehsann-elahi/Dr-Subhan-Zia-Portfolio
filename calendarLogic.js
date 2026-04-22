if (!localStorage.getItem('auth_token')) {
    window.location.href = 'admin-login.html';
}

function loadCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
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
            // Group by date securely
            const bindings = {};
            bookings.forEach(b => {
                if(!bindings[b.date]) bindings[b.date] = [];
                bindings[b.date].push(b);
            });
            
            // Generate monthly layout matrix
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            
            const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let html = '';
            
            // Loop exactly 35 blocks (5 weeks * 7 days typical bounding box)
            for(let i = 0; i < 35; i++) {
                const dayNumber = i - firstDay + 1;
                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                const dStr = String(dayNumber).padStart(2,'0');
                const mStr = String(month+1).padStart(2, '0');
                const dateString = isCurrentMonth ? `${year}-${mStr}-${dStr}` : null;
                const dayBookings = dateString && bindings[dateString] ? bindings[dateString] : [];
                
                const isToday = isCurrentMonth && dayNumber === today.getDate() && month === today.getMonth();
                
                html += `
                <div class="bg-white min-h-[120px] p-2 transition-colors hover:bg-slate-50 flex flex-col group ${isToday ? 'bg-blue-50/20' : ''}">
                    <span class="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-on-primary' : (isCurrentMonth ? 'text-slate-700' : 'text-slate-300')} mb-2">${isCurrentMonth ? dayNumber : ''}</span>
                    <div class="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                        ${dayBookings.map(b => {
                            const color = b.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                          b.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                          'bg-blue-100 text-blue-700';
                            return `
                                <div class="px-2 py-1 text-[10px] rounded block truncate font-bold ${color}" title="${b.name} - ${b.service}">
                                    ${b.time ? b.time.split(' ')[0] : 'TBD'} ${b.name.split(' ')[0]}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                `;
            }
            grid.innerHTML = html;
        });
}

window.logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', loadCalendar);
