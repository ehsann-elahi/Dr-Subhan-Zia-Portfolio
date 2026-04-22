if (!localStorage.getItem('auth_token')) {
    window.location.href = 'admin-login.html';
}

window.updateAppointmentStatus = async (id, status) => {
    try {
        await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status })
        });
        loadAppointments();
    } catch(err) { alert('Error updating appointment status'); }
};

window.deleteAppointment = async (id) => {
    if(!confirm("Are you sure you want to cancel and remove this appointment?")) return;
    try {
        await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        loadAppointments();
    } catch(err) { alert('Error deleting appointment'); }
};

function loadAppointments() {
    const feed = document.getElementById('appointments-feed');
    if (!feed) return;
    
    fetch('/api/bookings')
        .then(res => {
            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = 'admin-login.html';
                throw new Error("Unauthorized");
            }
            return res.json();
        })
        .then(appointments => {
            if (!appointments || appointments.length === 0) {
                feed.innerHTML = '<div class="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl">No upcoming appointments scheduled.</div>';
                return;
            }
            
            let html = '';
            
            // Sort by ID to simulate chronological arrival if time string isn't easy to parse
            appointments.sort((a,b) => b.id - a.id).forEach((app) => {
                const statusColor = app.status === 'Completed' ? 'text-green-600 bg-green-50 outline-green-200' : 
                                    app.status === 'Pending' ? 'text-amber-600 bg-amber-50 outline-amber-200' : 
                                    'text-blue-600 bg-blue-50 outline-blue-200';
                
                const timeStr = app.time ? app.time : 'TBD';
                
                html += `
                <div class="relative flex flex-col md:flex-row gap-6 group">
                    <!-- Timeline Time Node -->
                    <div class="w-auto md:w-20 shrink-0 md:text-right pt-2">
                        <p class="font-bold text-lg text-primary">${timeStr.split(' ')[0]}</p>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${timeStr.split(' ')[1] || ''}</p>
                    </div>
                    
                    <!-- Timeline Dot (Only visible on md+ since the line is md-only) -->
                    <div class="absolute left-8 top-5 w-4 h-4 rounded-full bg-surface border-[4px] border-primary z-10 group-hover:scale-125 transition-transform hidden md:block" style="translate: -50% 0"></div>
                    
                    <!-- Main Card -->
                    <div class="flex-1 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] group-hover:-translate-y-1 transition-all duration-300 ml-0 md:ml-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold font-headline text-on-surface">${app.name}</h3>
                                <p class="text-sm font-semibold text-primary mt-1">${app.service}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-bold outline outline-1 flex items-center gap-1 ${statusColor}">
                                <span class="w-1.5 h-1.5 rounded-full currentColor bg-current opacity-70"></span>
                                ${app.status || 'Pending'}
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-surface p-3 rounded-xl border border-slate-50">
                                <p class="text-[10px] uppercase font-bold text-slate-400 mb-1">Date</p>
                                <p class="text-sm font-medium text-slate-700">${app.date}</p>
                            </div>
                            <div class="bg-surface p-3 rounded-xl border border-slate-50">
                                <p class="text-[10px] uppercase font-bold text-slate-400 mb-1">Contact</p>
                                <p class="text-sm font-medium text-slate-700 truncate">${app.phone}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            ${app.status !== 'Completed' ? 
                              `<button onclick="updateAppointmentStatus(${app.id}, 'Completed')" class="text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                                Approve Session
                              </button>` : ''}
                            <button onclick="deleteAppointment(${app.id})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-red-100" title="Cancel Appointment">
                                <span class="material-symbols-outlined text-[18px]">event_busy</span>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            });
            
            feed.innerHTML = html;
        })
        .catch(err => {
            feed.innerHTML = '<div class="p-8 text-center text-red-500 bg-red-50 rounded-2xl">Error loading schedule.</div>';
        });
}

window.logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', loadAppointments);
