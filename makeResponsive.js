const fs = require('fs');

const files = [
  'index.html', 'about.html', 'services.html', 'gallery.html', 
  'contact.html', 'book.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');

  // 1. Optimize Padding on small screens
  // Ensure we don't duplicate if script is run twice
  content = content.replace(/p-10/g, 'p-6 md:p-10').replace(/p-6 md:p-6 md:p-10/g, 'p-6 md:p-10');
  content = content.replace(/p-12 md:p-20/g, 'p-8 md:p-20');
  content = content.replace(/p-12 md:p-24/g, 'p-8 md:p-24');
  content = content.replace(/py-32/g, 'py-16 md:py-32').replace(/py-16 md:py-16 md:py-32/g, 'py-16 md:py-32');
  content = content.replace(/py-24/g, 'py-12 md:py-24').replace(/py-12 md:py-12 md:py-24/g, 'py-12 md:py-24');
  content = content.replace(/py-20/g, 'py-12 md:py-20').replace(/py-12 md:py-12 md:py-20/g, 'py-12 md:py-20');
  content = content.replace(/py-16/g, 'py-10 md:py-16').replace(/py-10 md:py-10 md:py-16/g, 'py-10 md:py-16');

  // 2. Fix Flex wraps for action buttons
  content = content.replace(/flex flex-wrap gap-4/g, 'flex flex-col sm:flex-row gap-4 w-full sm:w-auto');
  content = content.replace(/flex flex-wrap gap-6/g, 'flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto');
  
  // Apply full width on mobile for main CTA buttons (ignoring those that already have it)
  content = content.replace(/<button class="([^"]*)px-8([^"]*)">/g, (match, p1, p2) => {
      if (!p1.includes('w-full') && !p2.includes('w-full')) {
          return `<button class="${p1}px-8 w-full sm:w-auto${p2}">`;
      }
      return match;
  });

  // 3. Prevent absolute items from overflowing off-screen on mobile
  content = content.replace(/-left-12/g, 'left-4 md:-left-12');
  content = content.replace(/-right-12/g, 'right-4 md:-right-12');
  content = content.replace(/-right-8/g, 'right-2 md:-right-8');
  content = content.replace(/-left-16/g, 'left-4 md:-left-16');

  // 4. Scale down typography
  content = content.replace(/text-5xl(?! md:)/g, 'text-4xl md:text-5xl');
  content = content.replace(/text-6xl(?! md:)/g, 'text-5xl md:text-6xl');
  content = content.replace(/text-7xl(?! md:)/g, 'text-5xl md:text-7xl');

  // 5. Adjust hardcoded heights
  content = content.replace(/min-h-\[500px\]/g, 'min-h-[350px] md:min-h-[500px]');
  content = content.replace(/h-\[500px\]/g, 'h-[300px] md:h-[500px]');
  content = content.replace(/h-\[400px\]/g, 'h-[250px] md:h-[400px]');

  fs.writeFileSync(file, content);
  console.log(`Successfully made ${file} responsive!`);
});
