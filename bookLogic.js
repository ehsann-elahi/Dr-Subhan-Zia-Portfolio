document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Add time slot click logic to highlight selected time
    let selectedTime = "09:00 AM"; // default
    const timeButtons = document.querySelectorAll('button[type="button"]');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            timeButtons.forEach(b => {
                b.classList.remove('border-primary', 'text-primary', 'bg-primary-fixed/20');
                b.classList.add('border-transparent');
            });
            btn.classList.add('border-primary', 'text-primary', 'bg-primary-fixed/20');
            btn.classList.remove('border-transparent');
            selectedTime = btn.innerText.trim();
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('b_name')?.value || 'Guest';
        const phone = document.getElementById('b_phone')?.value || '';
        const email = document.getElementById('b_email')?.value || '';
        const service = document.getElementById('b_service')?.value || 'Consultation';
        let date = document.getElementById('b_date')?.value || new Date().toISOString().split('T')[0];
        
        const booking = {
            id: Date.now(),
            name,
            phone,
            email,
            service,
            date,
            time: selectedTime,
            status: 'Pending'
        };
        
        fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        })
        .then(res => res.json())
        .then(data => {
            alert(`Thank you ${name}! Your appointment for ${service} on ${date} at ${selectedTime} is confirmed.`);
            form.reset();
            window.location.href = 'index.html';
        })
        .catch(err => alert("Error saving booking. Please try again."));
    });
});
