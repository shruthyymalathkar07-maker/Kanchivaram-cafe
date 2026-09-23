import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public/dishes');

interface DishPrompt {
  id: number;
  name: string;
  prompt: string;
}

const dishesToGenerate: DishPrompt[] = [
  // 1. Sweet Kuzhi Paniyaram (prod-14)
  {
    id: 14,
    name: 'Sweet Kuzhi Paniyaram',
    prompt: 'top down food photography South Indian sweet kuzhi paniyaram golden brown jaggery dumplings brass bowl wooden table overhead'
  },
  // 2. Podi Items (prod-25 to prod-31) - ONLY PODI IN BOWL, NO IDLI
  {
    id: 25,
    name: 'Idly Milagai Podi',
    prompt: 'top down food photography authentic South Indian idli milagai podi red chili gunpowder spice powder in brass bowl with sesame oil well, only spice powder in bowl, no idli, rustic wood table'
  },
  {
    id: 26,
    name: 'Sesame Idly Milagai Podi',
    prompt: 'top down food photography South Indian sesame ellu podi dark roasted sesame spice powder in ceramic bowl with sesame oil well, only spice powder in bowl, no idli, rustic wood table'
  },
  {
    id: 27,
    name: 'Horsegram Idly Milagai Podi',
    prompt: 'top down food photography South Indian horsegram kollu podi coarse roasted horsegram spice powder in bowl with sesame oil pool, only spice powder in bowl, no idli, dark wood background'
  },
  {
    id: 28,
    name: 'Flax Seed Idly Milagai Podi',
    prompt: 'top down food photography South Indian flax seed aali vidhai podi roasted flaxseed spice powder in bowl with oil well, only spice powder in bowl, no idli, rustic wood table'
  },
  {
    id: 29,
    name: 'Special Idly Milagai Podi',
    prompt: 'top down food photography Special idly milagai podi signature roasted South Indian spice powder in brass bowl with pure melted golden ghee well, only spice powder in bowl, no idli, rustic wood table'
  },
  {
    id: 30,
    name: 'Curry Leaves Idly Milagai Podi',
    prompt: 'top down food photography Karuvepillai curry leaves podi vibrant green roasted curry leaf spice powder in ceramic bowl with oil well, only spice powder in bowl, no idli, rustic table'
  },
  {
    id: 31,
    name: 'Paruppu Podi',
    prompt: 'top down food photography authentic South Indian paruppu podi golden yellow roasted lentil spice powder in brass bowl with melted ghee well, only spice powder in bowl, no idli, wooden table'
  },
  // 3. Lunch Items (prod-32 to prod-37)
  {
    id: 32,
    name: 'Seeraga Samba Vegetable Biriyani',
    prompt: 'top down food photography South Indian seeraga samba vegetable biriyani fragrant short grain rice in clay pot banana leaf wooden table'
  },
  {
    id: 33,
    name: 'Seeraga Samba Mushroom Biriyani',
    prompt: 'top down food photography South Indian seeraga samba mushroom biriyani spiced small grain rice with button mushrooms in bowl wooden table'
  },
  {
    id: 34,
    name: 'Curd Rice',
    prompt: 'top down food photography South Indian curd rice thayir sadham creamy rice tempered with mustard curry leaves pomegranate in bowl wooden table'
  },
  {
    id: 35,
    name: 'Tomato Rice',
    prompt: 'top down food photography South Indian tomato rice thakkali sadham spiced red rice with cashews curry leaves in bowl wooden table'
  },
  {
    id: 36,
    name: 'Lemon Rice',
    prompt: 'top down food photography South Indian lemon rice elumichai sadham yellow rice with roasted peanuts curry leaves in bowl wooden table'
  },
  {
    id: 37,
    name: 'Carrot Rice',
    prompt: 'top down food photography healthy South Indian carrot rice savory grated carrot rice with mustard cashews coriander in bowl wooden table'
  },
  // 4. Special Drinks (prod-38 to prod-43)
  {
    id: 38,
    name: 'Rose Milk',
    prompt: 'top down food photography South Indian rose milk chilled vibrant pink milk in clear glass tumbler with ice and rose petals on wooden table'
  },
  {
    id: 39,
    name: 'Cold Black Coffe',
    prompt: 'top down food photography iced cold black coffee dark roast cold brew in glass with ice cubes on dark wood table'
  },
  {
    id: 40,
    name: 'Cold Coffee',
    prompt: 'top down food photography creamy cold coffee shake in tall glass with thick froth and cocoa powder dusting on wooden table'
  },
  {
    id: 41,
    name: 'Iced Tea',
    prompt: 'top down food photography refreshing iced tea amber tea in glass with lemon slices mint leaves ice cubes on wooden table'
  },
  {
    id: 42,
    name: 'Lemon Soda',
    prompt: 'top down food photography sparkling fresh lemon soda fizzy bubbly drink in glass with lime slices mint and ice on wooden table'
  },
  {
    id: 43,
    name: 'Kulukki Sarbath',
    prompt: 'top down food photography Kerala kulukki sarbath drink in glass with split green chili lemon slice sabja seeds crushed ice on wooden table'
  },
  // 5. Beverages (prod-44 to prod-50)
  {
    id: 44,
    name: 'Tea',
    prompt: 'top down food photography hot South Indian cutting chai tea in traditional glass tumbler with frothy top on wooden table'
  },
  {
    id: 45,
    name: 'Filter Coffee',
    prompt: 'top down food photography South Indian filter coffee kaapi in traditional brass dabara and tumbler with frothy foam on wooden table'
  },
  {
    id: 46,
    name: 'Milk',
    prompt: 'top down food photography hot pure dairy milk in traditional glass tumbler with saffron strands on wooden table'
  },
  {
    id: 47,
    name: 'Sukku Malli Coffee',
    prompt: 'top down food photography South Indian sukku malli coffee spiced dry ginger coriander herbal brew in clay cup on wooden table'
  },
  {
    id: 48,
    name: 'Hot Chocolate',
    prompt: 'top down food photography rich hot chocolate in ceramic mug with thick froth and cocoa powder on wooden table'
  },
  {
    id: 49,
    name: 'Lemon Tea',
    prompt: 'top down food photography hot lemon tea golden tea in glass cup with fresh lemon slice on wooden table'
  },
  {
    id: 50,
    name: 'Black Coffee',
    prompt: 'top down food photography hot South Indian black coffee dark rich decoction in glass cup on wooden table'
  },
  // 6. Juices (prod-51 to prod-59)
  {
    id: 51,
    name: 'Lemon Juice',
    prompt: 'top down food photography fresh lemon juice in tall glass with lemon slice garnish mint ice cubes on wooden table'
  },
  {
    id: 52,
    name: 'Watermelon Juice',
    prompt: 'top down food photography fresh red watermelon juice in tall glass with mint ice cubes watermelon slice on wooden table'
  },
  {
    id: 53,
    name: 'Grape Juice',
    prompt: 'top down food photography fresh purple grape juice in glass with ice cubes and dark grapes on wooden table'
  },
  {
    id: 54,
    name: 'Pineapple Juice',
    prompt: 'top down food photography tropical golden pineapple juice in tall glass with pineapple slice ice cubes on wooden table'
  },
  {
    id: 55,
    name: 'Sweetlime Juice',
    prompt: 'top down food photography fresh mosambi sweet lime juice in glass with ice on wooden table'
  },
  {
    id: 56,
    name: 'Orange Juice',
    prompt: 'top down food photography fresh squeezed orange juice in tall glass with orange wheel garnish on wooden table'
  },
  {
    id: 57,
    name: 'Apple Juice',
    prompt: 'top down food photography fresh pressed apple juice in clear glass with ice and red apple slices on wooden table'
  },
  {
    id: 58,
    name: 'Mango Juice',
    prompt: 'top down food photography sweet golden alphonso mango juice in glass with ice on wooden table'
  },
  {
    id: 59,
    name: 'Pomegranate Juice',
    prompt: 'top down food photography deep ruby red pomegranate juice in tall glass with ice and ruby seeds on wooden table'
  }
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchImageWithRetry(item: DishPrompt, attempt = 1): Promise<boolean> {
  const filename = `prod-${item.id}.jpg`;
  const filePath = path.join(targetDir, filename);
  const encodedPrompt = encodeURIComponent(item.prompt);
  
  // Alternative endpoints & seeds
  const seed = (item.id * 1337 + attempt * 42) % 99999;
  const urls = [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}&model=turbo`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&seed=${seed}`
  ];

  const url = urls[(attempt - 1) % urls.length];

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 8000) {
      fs.writeFileSync(filePath, buffer);
      console.log(`  ✓ [${item.id}] Saved ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      throw new Error(`Buffer too small: ${buffer.length} bytes`);
    }
  } catch (err: any) {
    if (attempt <= 3) {
      console.warn(`  ↻ Retry ${attempt}/3 for ${item.name} (${err.message})...`);
      await sleep(2500);
      return fetchImageWithRetry(item, attempt + 1);
    } else {
      console.error(`  ✗ Failed ${item.name} after 3 attempts: ${err.message}`);
      return false;
    }
  }
}

async function generateAll() {
  console.log(`Starting generation for ${dishesToGenerate.length} items...`);
  let successCount = 0;

  for (const item of dishesToGenerate) {
    console.log(`[Item ${item.id}] ${item.name}...`);
    const ok = await fetchImageWithRetry(item);
    if (ok) successCount++;
    await sleep(2000); // 2s rate limit breathing space
  }

  console.log(`\n=== Finished! Successfully generated ${successCount}/${dishesToGenerate.length} images. ===`);
}

generateAll();
