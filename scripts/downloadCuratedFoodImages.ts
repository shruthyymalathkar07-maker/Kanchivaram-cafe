import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public/dishes');

interface CuratedDish {
  id: number;
  name: string;
  url: string;
}

// Curated high-resolution, top-down / overhead authentic food photography
const curatedDishes: CuratedDish[] = [
  // 1. Sweet Kuzhi Paniyaram (14)
  {
    id: 14,
    name: 'Sweet Kuzhi Paniyaram',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85'
  },
  // 2. Podi Items (25–31) - ONLY PODI / SPICE POWDER in bowl with oil/ghee well, NO IDLI
  {
    id: 25,
    name: 'Idly Milagai Podi',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 26,
    name: 'Sesame Idly Milagai Podi',
    url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 27,
    name: 'Horsegram Idly Milagai Podi',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 28,
    name: 'Flax Seed Idly Milagai Podi',
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 29,
    name: 'Special Idly Milagai Podi',
    url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 30,
    name: 'Curry Leaves Idly Milagai Podi',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 31,
    name: 'Paruppu Podi',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85'
  },
  // 3. Lunch (32–37)
  {
    id: 32,
    name: 'Seeraga Samba Vegetable Biriyani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 33,
    name: 'Seeraga Samba Mushroom Biriyani',
    url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 34,
    name: 'Curd Rice',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 35,
    name: 'Tomato Rice',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 36,
    name: 'Lemon Rice',
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 37,
    name: 'Carrot Rice',
    url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=85'
  },
  // 4. Special Drinks (38–43)
  {
    id: 38,
    name: 'Rose Milk',
    url: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 39,
    name: 'Cold Black Coffe',
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 40,
    name: 'Cold Coffee',
    url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 41,
    name: 'Iced Tea',
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 42,
    name: 'Lemon Soda',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 43,
    name: 'Kulukki Sarbath',
    url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=85'
  },
  // 5. Beverages (44–50)
  {
    id: 44,
    name: 'Tea',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 45,
    name: 'Filter Coffee',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 46,
    name: 'Milk',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 47,
    name: 'Sukku Malli Coffee',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 48,
    name: 'Hot Chocolate',
    url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 49,
    name: 'Lemon Tea',
    url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 50,
    name: 'Black Coffee',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=85'
  },
  // 6. Juices (51–59)
  {
    id: 51,
    name: 'Lemon Juice',
    url: 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 52,
    name: 'Watermelon Juice',
    url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 53,
    name: 'Grape Juice',
    url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 54,
    name: 'Pineapple Juice',
    url: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 55,
    name: 'Sweetlime Juice',
    url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 56,
    name: 'Orange Juice',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 57,
    name: 'Apple Juice',
    url: 'https://images.unsplash.com/photo-1568651057084-525677a570f0?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 58,
    name: 'Mango Juice',
    url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 59,
    name: 'Pomegranate Juice',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=85'
  }
];

async function downloadCurated() {
  console.log(`Downloading curated photography for ${curatedDishes.length} dishes...`);
  for (const item of curatedDishes) {
    const filename = `prod-${item.id}.jpg`;
    const filePath = path.join(targetDir, filename);
    console.log(`[${item.id}/59] Downloading ${item.name} -> ${filename}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      console.log(`  ✓ Saved ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error(`  ✗ Error ${item.name}:`, err.message);
    }
  }
  console.log('=== All 59 dish images updated! ===');
}

downloadCurated();
