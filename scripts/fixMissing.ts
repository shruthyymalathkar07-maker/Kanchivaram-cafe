import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public/dishes');

async function fixMissing() {
  const fixes = [
    { id: 53, name: 'Grape Juice', url: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=85' },
    { id: 57, name: 'Apple Juice', url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=85' }
  ];
  for (const f of fixes) {
    const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(path.join(targetDir, `prod-${f.id}.jpg`), buf);
      console.log(`Saved prod-${f.id}.jpg (${(buf.length / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`Failed ${f.name}: HTTP ${res.status}`);
    }
  }
}
fixMissing();
