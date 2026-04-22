/* mockApi.js - Intercepts fetch requests to mock backend on Vercel deployment */
(function() {
    const originalFetch = window.fetch;
    const LOCAL_STORAGE_KEY = 'sanctuary_bookings_mock_db';

    // Initialize mock database if empty
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([
            { id: 1, b_name: "Sarah Jenkins", b_phone: "+1 555-0102", b_service: "Physiotherapy Assessment", b_date: "2024-11-20", b_time_btn: "10:30 AM", status: "Confirm" },
            { id: 2, b_name: "Michael Ross", b_phone: "+1 555-0199", b_service: "Sports Injury Treatment", b_date: "2024-11-21", b_time_btn: "01:00 PM", status: "Confirm" }
        ]));
    }

    window.fetch = async function(url, options) {
        options = options || {};
        const method = (options.method || 'GET').toUpperCase();

        // 1. Mock Login API
        if (url.includes('/api/login') && method === 'POST') {
            const body = JSON.parse(options.body);
            // Default generic fallback to access portal easily as requested for portfolio demo
            if ((body.username === 'admin' && body.password === 'password') || body.username) {
                return new Response(JSON.stringify({ success: true, token: 'fake-jwt-token-123' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // 2. Mock Bookings API
        if (url.includes('/api/bookings')) {
            let bookings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            
            // Extract potential ID from URL (e.g., /api/bookings/123)
            const parts = url.split('/');
            const id = parts[parts.length - 1] === 'bookings' ? null : parseInt(parts[parts.length - 1]);

            if (method === 'GET') {
                return new Response(JSON.stringify(bookings), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (method === 'POST') {
                const newBooking = JSON.parse(options.body);
                newBooking.id = Date.now();
                bookings.push(newBooking);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
                return new Response(JSON.stringify(newBooking), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (method === 'PATCH' && id) {
                const bookingIndex = bookings.findIndex(b => b.id === id);
                if (bookingIndex !== -1) {
                    bookings[bookingIndex] = { ...bookings[bookingIndex], ...JSON.parse(options.body) };
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
                    return new Response(JSON.stringify(bookings[bookingIndex]), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    return new Response(JSON.stringify({ error: 'Not found' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }

            if (method === 'DELETE' && id) {
                bookings = bookings.filter(b => b.id !== id);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Pass through for all other regular requests
        return originalFetch.apply(this, arguments);
    };
})();
