const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const files = [
  'index.html', 'about.html', 'services.html', 'gallery.html', 
  'contact.html', 'book.html', 'admin-login.html', 'dashboard.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf-8');
  const $ = cheerio.load(content);

  // Update navigation links based on text content
  $('a').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === 'home') $(el).attr('href', 'index.html');
    else if (text === 'about') $(el).attr('href', 'about.html');
    else if (text === 'services') $(el).attr('href', 'services.html');
    else if (text === 'gallery') $(el).attr('href', 'gallery.html');
    else if (text === 'contact' || text === 'contact us') $(el).attr('href', 'contact.html');
  });

  // Make Book Appointment buttons clickable
  $('button').each((i, el) => {
    if ($(el).text().trim().includes('Book Appointment') || $(el).text().trim().includes('Start Your Recovery')) {
      $(el).attr('onclick', "window.location.href='book.html'");
    }
  });

  // Make Dashboard icons clickable to dashboard.html
  $('span.material-symbols-outlined').each((i, el) => {
    if ($(el).text().trim() === 'dashboard') {
      $(el).attr('onclick', "window.location.href='dashboard.html'");
      $(el).css('cursor', 'pointer');
    }
  });

  // Add generic AOS animations to sections, cards, and titles
  $('section, main > div, .glass-card, form, h1, h2').each((i, el) => {
      if(!$(el).attr('data-aos')) {
          $(el).attr('data-aos', 'fade-up');
      }
  });

  // Add AOS css and script
  if (!$('link[href*="aos.css"]').length) {
    $('head').append('<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">');
  }
  if (!$('script[src*="aos.js"]').length) {
    $('body').append('<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>');
    $('body').append('<script>setTimeout(() => AOS.init({ duration: 800, once: true }), 100);</script>');
  }

  // Handle specific pages for localStorage bookings
  if (file === 'book.html') {
    const form = $('form');
    // give inputs id
    const inputs = form.find('input, select, textarea');
    inputs.eq(0).attr('id', 'name');
    inputs.eq(1).attr('id', 'phone');
    inputs.eq(2).attr('id', 'email');
    inputs.eq(3).attr('id', 'service');
    inputs.eq(4).attr('id', 'date'); // it's a date select actually wait
    // Look at actual book.html for inputs
    $('input[placeholder="John Doe"]').attr('id', 'b_name');
    $('input[placeholder="+1 (555) 000-0000"]').attr('id', 'b_phone');
    $('input[placeholder="john@example.com"]').attr('id', 'b_email');
    $(form).find('select').attr('id', 'b_service');
    $(form).find('input[type="date"]').attr('id', 'b_date');
    $('button.border-primary').attr('id', 'b_time_btn'); // we'll just mock time using date for now
    
    // add form script
    $('body').append(`<script src="/bookLogic.js"></script>`);
  }

  if (file === 'dashboard.html') {
    // Empty the schedule list and just give it an ID
    const schedHead = $('h4:contains("Today\'s Schedule")').parent().parent();
    schedHead.find('> div:not(:first-child)').remove(); // Remove all dummy children after header
    schedHead.append('<div id="dashboard-bookings" class="space-y-4"></div>');
    $('body').append(`<script src="/dashboardLogic.js"></script>`);
  }

  fs.writeFileSync(file, $.html());
  console.log(`Patched ${file}`);
});
