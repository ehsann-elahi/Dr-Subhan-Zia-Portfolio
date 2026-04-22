const fs = require('fs');
const cheerio = require('cheerio');

const files = [
  'index.html', 'about.html', 'services.html', 'gallery.html', 
  'contact.html', 'book.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf-8');
  const $ = cheerio.load(content, { decodeEntities: false });

  const navBar = $('header.fixed.top-0, nav.fixed.top-0');

  if (navBar.length > 0 && !$('#mobile-menu').length) {
    const rightSide = navBar.find('> div.flex').last();
    if (rightSide.length > 0 && !rightSide.find('#mobile-menu-btn').length) {
      rightSide.append(`
<button id="mobile-menu-btn" class="md:hidden ml-2 material-symbols-outlined text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">menu</button>
      `);
    }

    navBar.after(`
<div id="mobile-menu" class="hidden fixed top-[72px] left-0 w-full bg-white/95 backdrop-blur-3xl shadow-lg z-40 border-t border-slate-100 flex-col p-4 space-y-4 md:hidden">
    <a href="index.html" class="text-slate-600 font-medium hover:text-blue-500 py-2 border-b border-slate-100">Home</a>
    <a href="about.html" class="text-slate-600 font-medium hover:text-blue-500 py-2 border-b border-slate-100">About</a>
    <a href="services.html" class="text-slate-600 font-medium hover:text-blue-500 py-2 border-b border-slate-100">Services</a>
    <a href="gallery.html" class="text-slate-600 font-medium hover:text-blue-500 py-2 border-b border-slate-100">Gallery</a>
    <a href="contact.html" class="text-slate-600 font-medium hover:text-blue-500 py-2 border-b border-slate-100">Contact</a>
    <button class="bg-primary text-on-primary px-6 py-3 rounded-full font-semibold text-sm w-full mt-2 shadow-lg" onclick="window.location.href='book.html'">Book Appointment</button>
</div>
    `);

    if (!$('#mobile-menu-script').length) {
      $('body').append(`
<script id="mobile-menu-script">
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (btn && menu) {
            btn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
                menu.classList.toggle('flex');
                btn.textContent = menu.classList.contains('hidden') ? 'menu' : 'close';
            });
        }
    });
</script>
      `);
    }

    fs.writeFileSync(file, $.html());
    console.log(`Added mobile nav to ${file}`);
  }
});
