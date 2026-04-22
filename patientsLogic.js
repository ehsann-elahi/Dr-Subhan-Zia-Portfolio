// Ensure we maintain the strict Auth Gate
if (!localStorage.getItem('auth_token')) {
    window.location.href = 'admin-login.html';
}

window.updatePatientStatus = async (id, status) => {
    try {
        await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status })
        });
        loadPatients();
    } catch(err) { alert('Error updating patient status'); }
};

window.deletePatient = async (id) => {
    if(!confirm("Are you sure you want to completely remove this patient record?")) return;
    try {
        await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        loadPatients();
    } catch(err) { alert('Error deleting patient'); }
};

function loadPatients() {
    const tableBody = document.getElementById('patients-table-body');
    if (!tableBody) return;
    
    fetch('/api/bookings')
        .then(res => {
            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = 'admin-login.html';
                throw new Error("Unauthorized");
            }
            return res.json();
        })
        .then(patients => {
            if (!patients || patients.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-on-surface-variant">No patients found in database.</td></tr>';
                return;
            }
            
            let html = '';
            
            patients.sort((a,b) => b.id - a.id).forEach((p) => {
                const statusColor = p.status === 'Completed' ? 'text-green-600 bg-green-50' : 
                                    p.status === 'Pending' ? 'text-amber-600 bg-amber-50' : 
                                    'text-blue-600 bg-blue-50';
                
                html += `
                <tr class="hover:bg-slate-50 transition-colors group">
                    <td class="p-4 px-6">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                ${p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p class="font-bold text-on-surface">${p.name}</p>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 px-6 text-on-surface-variant text-xs">
                        <p class="font-semibold text-on-surface">${p.date}</p>
                        <p>${p.time || 'TBD'}</p>
                    </td>
                    <td class="p-4 px-6 text-on-surface-variant text-xs">
                        <p>${p.phone}</p>
                        <p class="text-[10px] border-b border-dashed border-slate-300 inline">${p.email}</p>
                    </td>
                    <td class="p-4 px-6">
                        <span class="text-xs font-semibold text-on-surface-variant">${p.service}</span>
                    </td>
                    <td class="p-4 px-6 text-center">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold ${statusColor}">${p.status || 'Pending'}</span>
                    </td>
                    <td class="p-4 px-6 text-right">
                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${p.status !== 'Completed' ? 
                              `<button onclick="updatePatientStatus(${p.id}, 'Completed')" class="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors border border-transparent hover:border-green-200" title="Approve">
                                <span class="material-symbols-outlined text-[16px]">check</span>
                              </button>` : ''}
                            <button onclick="deletePatient(${p.id})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Delete record">
                                <span class="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
                `;
            });
            
            tableBody.innerHTML = html;
        })
        .catch(err => {
            console.error('Failed to load patients:', err);
            tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Error loading database.</td></tr>';
        });
}

window.logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', loadPatients);
