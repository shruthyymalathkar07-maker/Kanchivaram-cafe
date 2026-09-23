// Kanchivaram Café Master Data Definition
// Imported verbatim from Client Master Specifications

export interface ClientProductMaster {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  servingQty: number; // Serving quantity in UOM (NOT inventory stock!)
  uom: string; // Nos., g, ml
  dineInPrice: number;
  deliveryPrice: number;
  packingCharge: number;
  description: string;
  price: number; // Active base price for POS
  image: string;
}

export interface ClientInventoryMaster {
  id: string;
  name: string;
  category: string | null; // Null/Unspecified for items 37-42
  unit: string;
  openingStock: number; // Always 0 (NOT invented)
  stockIn: number;
  stockOut: number;
  costPerUnit: number;
  minThreshold: number;
  supplier: string;
}

export interface BOMProcessStep {
  step: number;
  rawMaterialName: string;
  rawMaterialId: string | null;
  qty: number;
  uom: string;
  process: string;
}

export interface ClientBOMMaster {
  productId: string;
  productName: string;
  servingQty: number;
  servingUom: string;
  status: 'COMPLETE' | 'AWAITING_RECIPE_DETAILS';
  processes: BOMProcessStep[];
  finalProcess: string | null;
}

// ─── 1. CATEGORIES MASTER (9 Categories) ───────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  { id: 'cat-kc-signatures', name: 'KC Signatures', slug: 'kc-signatures', icon: '✨', displayOrder: 1 },
  { id: 'cat-sandwich', name: 'Sandwich', slug: 'sandwich', icon: '🥪', displayOrder: 2 },
  { id: 'cat-snacks', name: 'Snacks', slug: 'snacks', icon: '🥙', displayOrder: 3 },
  { id: 'cat-milkshakes', name: 'Milkshakes', slug: 'milkshakes', icon: '🥤', displayOrder: 4 },
  { id: 'cat-podi', name: 'Podi', slug: 'podi', icon: '🌶️', displayOrder: 5 },
  { id: 'cat-lunch', name: 'Lunch', slug: 'lunch', icon: '🍱', displayOrder: 6 },
  { id: 'cat-special-drinks', name: 'Special Drinks', slug: 'special-drinks', icon: '🍹', displayOrder: 7 },
  { id: 'cat-beverages', name: 'Beverages', slug: 'beverages', icon: '☕', displayOrder: 8 },
  { id: 'cat-juices', name: 'Juices', slug: 'juices', icon: '🧃', displayOrder: 9 },
];

// ─── 2. EXACT 59 PRODUCT / MENU MASTER RECORDS ────────────────────────────────
export const CLIENT_PRODUCTS_MASTER: ClientProductMaster[] = [
  // KC Signatures (1-5)
  {
    id: 'prod-1',
    name: 'Mini Podi Idli',
    category: 'KC Signatures',
    categoryId: 'cat-kc-signatures',
    servingQty: 10,
    uom: 'Nos.',
    dineInPrice: 35,
    deliveryPrice: 53,
    packingCharge: 5,
    description: 'Mini Podi Idli (10 Nos.) tossed in traditional spiced podi & ghee',
    price: 35,
    image: '/dishes/prod-1.jpg'
  },
  {
    id: 'prod-2',
    name: 'Mini Sambar Idli',
    category: 'KC Signatures',
    categoryId: 'cat-kc-signatures',
    servingQty: 10,
    uom: 'Nos.',
    dineInPrice: 45,
    deliveryPrice: 68,
    packingCharge: 5,
    description: 'Mini Sambar Idli (10 Nos.) soaked in piping hot piping South Indian sambar',
    price: 45,
    image: '/dishes/prod-2.jpg'
  },
  {
    id: 'prod-3',
    name: 'Kaima Idli',
    category: 'KC Signatures',
    categoryId: 'cat-kc-signatures',
    servingQty: 15,
    uom: 'Nos.',
    dineInPrice: 75,
    deliveryPrice: 113,
    packingCharge: 5,
    description: 'Crispy fried Kaima Idli (15 Nos.) tossed with aromatic spices & herbs',
    price: 75,
    image: '/dishes/prod-3.jpg'
  },
  {
    id: 'prod-4',
    name: 'Sambar Vada',
    category: 'KC Signatures',
    categoryId: 'cat-kc-signatures',
    servingQty: 1,
    uom: 'Nos.',
    dineInPrice: 35,
    deliveryPrice: 53,
    packingCharge: 5,
    description: 'Crispy golden Medu Vada (1 No.) immersed in rich flavorful sambar',
    price: 35,
    image: '/dishes/prod-4.jpg'
  },
  {
    id: 'prod-5',
    name: 'Idli Sambar Chutney',
    category: 'KC Signatures',
    categoryId: 'cat-kc-signatures',
    servingQty: 4,
    uom: 'Nos.',
    dineInPrice: 80,
    deliveryPrice: 120,
    packingCharge: 5,
    description: 'Steamed fluffy Idlis (4 Nos.) served with authentic sambar & fresh coconut chutney',
    price: 80,
    image: '/dishes/prod-5.jpg'
  },

  // Sandwich (6-8)
  {
    id: 'prod-6',
    name: 'Veg. Cheese Sandwich',
    category: 'Sandwich',
    categoryId: 'cat-sandwich',
    servingQty: 1,
    uom: 'Nos.',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Fresh grilled sandwich loaded with seasonal vegetables and melted cheese',
    price: 60,
    image: '/dishes/prod-6.jpg'
  },
  {
    id: 'prod-7',
    name: 'Corn Cheese Sandwich',
    category: 'Sandwich',
    categoryId: 'cat-sandwich',
    servingQty: 1,
    uom: 'Nos.',
    dineInPrice: 70,
    deliveryPrice: 105,
    packingCharge: 5,
    description: 'Sweet golden corn kernels mixed with rich mozzarella & cheddar cheese',
    price: 70,
    image: '/dishes/prod-7.jpg'
  },
  {
    id: 'prod-8',
    name: 'Chilli Cheese Sandwich',
    category: 'Sandwich',
    categoryId: 'cat-sandwich',
    servingQty: 1,
    uom: 'Nos.',
    dineInPrice: 70,
    deliveryPrice: 105,
    packingCharge: 5,
    description: 'Spicy green chillies paired with bubbling grilled cheese on toasted bread',
    price: 70,
    image: '/dishes/prod-8.jpg'
  },

  // Snacks (9-17)
  {
    id: 'prod-9',
    name: 'Raw Banana Bajji',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 6,
    uom: 'Nos.',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Crispy gram-flour battered raw plantain fritters (6 Nos.) served hot with chutney',
    price: 60,
    image: '/dishes/prod-9.jpg'
  },
  {
    id: 'prod-10',
    name: 'Bonda',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 6,
    uom: 'Nos.',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Traditional spiced potato filling coated with crispy golden batter (6 Nos.)',
    price: 60,
    image: '/dishes/prod-10.jpg'
  },
  {
    id: 'prod-11',
    name: 'Masal Vadai',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 6,
    uom: 'Nos.',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Crunchy chana dal patties infused with onions, fennel, and red chillies (6 Nos.)',
    price: 60,
    image: '/dishes/prod-11.jpg'
  },
  {
    id: 'prod-12',
    name: 'Samosa',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 2,
    uom: 'Nos.',
    dineInPrice: 30,
    deliveryPrice: 45,
    packingCharge: 5,
    description: 'Flaky pastry filled with aromatic spiced potato and green peas (2 Nos.)',
    price: 30,
    image: '/dishes/prod-12.jpg'
  },
  {
    id: 'prod-13',
    name: 'Kaara Kuzhi Paniyaram',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 6,
    uom: 'Nos.',
    dineInPrice: 40,
    deliveryPrice: 60,
    packingCharge: 5,
    description: 'Savory pan-fried fermented batter dumplings seasoned with mustard and curry leaves (6 Nos.)',
    price: 40,
    image: '/dishes/prod-13.jpg'
  },
  {
    id: 'prod-14',
    name: 'Sweet Kuzhi Paniyaram',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 8,
    uom: 'Nos.',
    dineInPrice: 40,
    deliveryPrice: 60,
    packingCharge: 5,
    description: 'Delectable jaggery and cardamom infused sweet dumplings (8 Nos.)',
    price: 40,
    image: '/dishes/prod-14.jpg'
  },
  {
    id: 'prod-15',
    name: 'Suiyam / Suzhiyam',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 6,
    uom: 'Nos.',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Traditional sweet jaggery, coconut and dal stuffing in a crispy golden coating (6 Nos.)',
    price: 60,
    image: '/dishes/prod-15.jpg'
  },
  {
    id: 'prod-16',
    name: 'Sundal',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 30,
    deliveryPrice: 45,
    packingCharge: 0,
    description: 'Nutritious boiled chickpeas tempered with mustard, grated coconut, and curry leaves (100g)',
    price: 30,
    image: '/dishes/prod-16.jpg'
  },
  {
    id: 'prod-17',
    name: 'Rava Kesari',
    category: 'Snacks',
    categoryId: 'cat-snacks',
    servingQty: 60,
    uom: 'g',
    dineInPrice: 30,
    deliveryPrice: 45,
    packingCharge: 0,
    description: 'Melt-in-mouth semolina sweet flavored with pure ghee, saffron, and roasted cashews (60g)',
    price: 30,
    image: '/dishes/prod-17.jpg'
  },

  // Milkshakes (18-24)
  {
    id: 'prod-18',
    name: 'Vanilla Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 70,
    deliveryPrice: 105,
    packingCharge: 5,
    description: 'Creamy chilled milkshake flavored with premium vanilla beans (300 ml)',
    price: 70,
    image: '/dishes/prod-18.jpg'
  },
  {
    id: 'prod-19',
    name: 'Apple Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 80,
    deliveryPrice: 120,
    packingCharge: 5,
    description: 'Thick shake blended with fresh crisp apples and rich whole milk (300 ml)',
    price: 80,
    image: '/dishes/prod-19.jpg'
  },
  {
    id: 'prod-20',
    name: 'Chocolate Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 80,
    deliveryPrice: 120,
    packingCharge: 5,
    description: 'Decadent chocolate shake prepared with rich cocoa and chilled milk (300 ml)',
    price: 80,
    image: '/dishes/prod-20.jpg'
  },
  {
    id: 'prod-21',
    name: 'Dates Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 80,
    deliveryPrice: 120,
    packingCharge: 5,
    description: 'Wholesome energy milkshake prepared with sweet Arabian dates and milk (300 ml)',
    price: 80,
    image: '/dishes/prod-21.jpg'
  },
  {
    id: 'prod-22',
    name: 'Strawberry Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 120,
    deliveryPrice: 180,
    packingCharge: 5,
    description: 'Luscious strawberry shake made with fresh strawberries and sweet cream (300 ml)',
    price: 120,
    image: '/dishes/prod-22.jpg'
  },
  {
    id: 'prod-23',
    name: 'Mango Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 80,
    deliveryPrice: 120,
    packingCharge: 5,
    description: 'King of fruits mango pulp blended into thick creamy refreshing shake (300 ml)',
    price: 80,
    image: '/dishes/prod-23.jpg'
  },
  {
    id: 'prod-24',
    name: 'Butterfruit Milkshake',
    category: 'Milkshakes',
    categoryId: 'cat-milkshakes',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 100,
    deliveryPrice: 150,
    packingCharge: 5,
    description: 'Creamy avocado (butterfruit) smoothie shake with honey and milk (300 ml)',
    price: 100,
    image: '/dishes/prod-24.jpg'
  },

  // Podi (25-31)
  {
    id: 'prod-25',
    name: 'Idly Milagai Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Authentic spiced gun powder blended with roasted lentils and red chillies (100g pack)',
    price: 50,
    image: '/dishes/prod-25.jpg'
  },
  {
    id: 'prod-26',
    name: 'Sesame Idly Milagai Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Roasted black & white sesame seeds mixed with aromatic spice blend (100g pack)',
    price: 50,
    image: '/dishes/prod-26.jpg'
  },
  {
    id: 'prod-27',
    name: 'Horsegram Idly Milagai Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Healthy Kollu (Horsegram) coarse spice powder rich in protein (100g pack)',
    price: 50,
    image: '/dishes/prod-27.jpg'
  },
  {
    id: 'prod-28',
    name: 'Flax Seed Idly Milagai Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Omega-3 rich roasted flax seed gun powder with South Indian spices (100g pack)',
    price: 60,
    image: '/dishes/prod-28.jpg'
  },
  {
    id: 'prod-29',
    name: 'Special Idly Milagai Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Signature heritage blend of slow-roasted dals, spices, and asafoetida (100g pack)',
    price: 50,
    image: '/dishes/prod-29.jpg'
  },
  {
    id: 'prod-30',
    name: 'Curry Leaves Idly Milagai Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 55,
    deliveryPrice: 83,
    packingCharge: 5,
    description: 'Sun-dried Karuvepillai (curry leaves) spice powder rich in iron and aroma (100g pack)',
    price: 55,
    image: '/dishes/prod-30.jpg'
  },
  {
    id: 'prod-31',
    name: 'Paruppu Podi',
    category: 'Podi',
    categoryId: 'cat-podi',
    servingQty: 100,
    uom: 'g',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Classic roasted lentil spice powder to mix with hot rice and melted ghee (100g pack)',
    price: 50,
    image: '/dishes/prod-31.jpg'
  },

  // Lunch (32-37)
  {
    id: 'prod-32',
    name: 'Seeraga Samba Vegetable Biriyani',
    category: 'Lunch',
    categoryId: 'cat-lunch',
    servingQty: 300,
    uom: 'g',
    dineInPrice: 45,
    deliveryPrice: 68,
    packingCharge: 5,
    description: 'Fragrant Seeraga Samba short grain rice cooked with garden vegetables & biryani masala (300g)',
    price: 45,
    image: '/dishes/prod-32.jpg'
  },
  {
    id: 'prod-33',
    name: 'Seeraga Samba Mushroom Biriyani',
    category: 'Lunch',
    categoryId: 'cat-lunch',
    servingQty: 300,
    uom: 'g',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Juicy button mushrooms simmered in aromatic Seeraga Samba rice with herbs (300g)',
    price: 50,
    image: '/dishes/prod-33.jpg'
  },
  {
    id: 'prod-34',
    name: 'Curd Rice',
    category: 'Lunch',
    categoryId: 'cat-lunch',
    servingQty: 300,
    uom: 'g',
    dineInPrice: 30,
    deliveryPrice: 45,
    packingCharge: 5,
    description: 'Soothing creamy curd rice tempered with mustard, green chillies, ginger, and curry leaves (300g)',
    price: 30,
    image: '/dishes/prod-34.jpg'
  },
  {
    id: 'prod-35',
    name: 'Tomato Rice',
    category: 'Lunch',
    categoryId: 'cat-lunch',
    servingQty: 300,
    uom: 'g',
    dineInPrice: 35,
    deliveryPrice: 53,
    packingCharge: 5,
    description: 'Tangy and spiced South Indian Thakkali Sadham prepared with ripe tomatoes and spices (300g)',
    price: 35,
    image: '/dishes/prod-35.jpg'
  },
  {
    id: 'prod-36',
    name: 'Lemon Rice',
    category: 'Lunch',
    categoryId: 'cat-lunch',
    servingQty: 300,
    uom: 'g',
    dineInPrice: 35,
    deliveryPrice: 53,
    packingCharge: 5,
    description: 'Zesty lemon rice seasoned with crunchy peanuts, turmeric, and fresh curry leaves (300g)',
    price: 35,
    image: '/dishes/prod-36.jpg'
  },
  {
    id: 'prod-37',
    name: 'Carrot Rice',
    category: 'Lunch',
    categoryId: 'cat-lunch',
    servingQty: 300,
    uom: 'g',
    dineInPrice: 40,
    deliveryPrice: 60,
    packingCharge: 5,
    description: 'Healthy grated carrot rice sautéed with mild spices, cashews, and fresh cilantro (300g)',
    price: 40,
    image: '/dishes/prod-37.jpg'
  },

  // Special Drinks (38-43)
  {
    id: 'prod-38',
    name: 'Rose Milk',
    category: 'Special Drinks',
    categoryId: 'cat-special-drinks',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Traditional chilled rose scented milk made with authentic rose syrup (300 ml)',
    price: 50,
    image: '/dishes/prod-38.jpg'
  },
  {
    id: 'prod-39',
    name: 'Cold Black Coffe',
    category: 'Special Drinks',
    categoryId: 'cat-special-drinks',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 40,
    deliveryPrice: 60,
    packingCharge: 5,
    description: 'Bold dark roast cold brew served chilled on ice without milk (300 ml)',
    price: 40,
    image: '/dishes/prod-39.jpg'
  },
  {
    id: 'prod-40',
    name: 'Cold Coffee',
    category: 'Special Drinks',
    categoryId: 'cat-special-drinks',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 50,
    deliveryPrice: 75,
    packingCharge: 5,
    description: 'Classic creamy iced coffee blended with milk and rich coffee decoction (300 ml)',
    price: 50,
    image: '/dishes/prod-40.jpg'
  },
  {
    id: 'prod-41',
    name: 'Iced Tea',
    category: 'Special Drinks',
    categoryId: 'cat-special-drinks',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 40,
    deliveryPrice: 60,
    packingCharge: 5,
    description: 'Refreshing brewed iced tea infused with fresh lemon and mint leaves (300 ml)',
    price: 40,
    image: '/dishes/prod-41.jpg'
  },
  {
    id: 'prod-42',
    name: 'Lemon Soda',
    category: 'Special Drinks',
    categoryId: 'cat-special-drinks',
    servingQty: 350,
    uom: 'ml',
    dineInPrice: 30,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Fizzy chilled soda with freshly squeezed lime juice (Sweet / Salt / Mixed) (350 ml)',
    price: 30,
    image: '/dishes/prod-42.jpg'
  },
  {
    id: 'prod-43',
    name: 'Kulukki Sarbath',
    category: 'Special Drinks',
    categoryId: 'cat-special-drinks',
    servingQty: 350,
    uom: 'ml',
    dineInPrice: 40,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Shaken Kerala style sarbath with green chilli, basil seeds, and fresh lime (350 ml)',
    price: 40,
    image: '/dishes/prod-43.jpg'
  },

  // Beverages (44-50)
  {
    id: 'prod-44',
    name: 'Tea',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 20,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Freshly brewed aromatic South Indian ginger cardamom milk tea (100 ml)',
    price: 20,
    image: '/dishes/prod-44.jpg'
  },
  {
    id: 'prod-45',
    name: 'Filter Coffee',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 25,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Signature Kanchivaram Kumbakonam degree filter coffee in brass dabara set (100 ml)',
    price: 25,
    image: '/dishes/prod-45.jpg'
  },
  {
    id: 'prod-46',
    name: 'Milk',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 15,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Pure boiled farm fresh whole cow milk served hot (100 ml)',
    price: 15,
    image: '/dishes/prod-46.jpg'
  },
  {
    id: 'prod-47',
    name: 'Sukku Malli Coffee',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 30,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Herbal dry ginger and coriander seed medicinal brew sweetened with palm jaggery (100 ml)',
    price: 30,
    image: '/dishes/prod-47.jpg'
  },
  {
    id: 'prod-48',
    name: 'Hot Chocolate',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 40,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Rich velvety hot cocoa prepared with melted chocolate and creamy milk (100 ml)',
    price: 40,
    image: '/dishes/prod-48.jpg'
  },
  {
    id: 'prod-49',
    name: 'Lemon Tea',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 20,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Light golden tea infused with tangy fresh lemon and a touch of honey (100 ml)',
    price: 20,
    image: '/dishes/prod-49.jpg'
  },
  {
    id: 'prod-50',
    name: 'Black Coffee',
    category: 'Beverages',
    categoryId: 'cat-beverages',
    servingQty: 100,
    uom: 'ml',
    dineInPrice: 20,
    deliveryPrice: 0,
    packingCharge: 0,
    description: 'Pure strong black coffee decoction with rich aroma and zero dairy (100 ml)',
    price: 20,
    image: '/dishes/prod-50.jpg'
  },

  // Juices (51-59)
  {
    id: 'prod-51',
    name: 'Lemon Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 20,
    deliveryPrice: 30,
    packingCharge: 5,
    description: 'Freshly squeezed lemon juice with sugar, water, and ice cubes (300 ml)',
    price: 20,
    image: '/dishes/prod-51.jpg'
  },
  {
    id: 'prod-52',
    name: 'Watermelon Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 40,
    deliveryPrice: 60,
    packingCharge: 5,
    description: 'Freshly cut sweet red watermelon cubes blended with sugar and ice (300 ml)',
    price: 40,
    image: '/dishes/prod-52.jpg'
  },
  {
    id: 'prod-53',
    name: 'Grape Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 70,
    deliveryPrice: 105,
    packingCharge: 5,
    description: 'Fresh dark grape juice packed with antioxidants and natural sweetness (300 ml)',
    price: 70,
    image: '/dishes/prod-53.jpg'
  },
  {
    id: 'prod-54',
    name: 'Pineapple Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Tropical golden pineapple juice extracted from fresh ripe pineapples (300 ml)',
    price: 60,
    image: '/dishes/prod-54.jpg'
  },
  {
    id: 'prod-55',
    name: 'Sweetlime Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 60,
    deliveryPrice: 90,
    packingCharge: 5,
    description: 'Freshly cold-pressed Mosambi sweetlime juice rich in vitamin C (300 ml)',
    price: 60,
    image: '/dishes/prod-55.jpg'
  },
  {
    id: 'prod-56',
    name: 'Orange Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 80,
    deliveryPrice: 120,
    packingCharge: 5,
    description: 'Pure hand-squeezed pulpy orange juice served chilled (300 ml)',
    price: 80,
    image: '/dishes/prod-56.jpg'
  },
  {
    id: 'prod-57',
    name: 'Apple Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 70,
    deliveryPrice: 105,
    packingCharge: 5,
    description: 'Pure extracted juice from crisp sweet apples with a hint of honey (300 ml)',
    price: 70,
    image: '/dishes/prod-57.jpg'
  },
  {
    id: 'prod-58',
    name: 'Mango Juice',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 65,
    deliveryPrice: 100,
    packingCharge: 5,
    description: 'Sweet and luscious Alphoso mango nectar served cold (300 ml)',
    price: 65,
    image: '/dishes/prod-58.jpg'
  },
  {
    id: 'prod-59',
    name: 'Pomegranate',
    category: 'Juices',
    categoryId: 'cat-juices',
    servingQty: 300,
    uom: 'ml',
    dineInPrice: 150,
    deliveryPrice: 200,
    packingCharge: 5,
    description: 'Freshly pressed ruby red pomegranate pearls rich in nutrients (300 ml)',
    price: 150,
    image: '/dishes/prod-59.jpg'
  }
];

// ─── 3. EXACT 117 RAW MATERIAL / INVENTORY MASTER RECORDS ─────────────────────
export const CLIENT_RAW_MATERIALS_MASTER: ClientInventoryMaster[] = [
  { id: 'rm-1', name: 'Ulundhu Paruppu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-2', name: 'Kadalai Paruppu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-3', name: 'Thuvaram Paruppu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-4', name: 'Udaitha Kadalai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-5', name: 'Pacharisi', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-6', name: 'Puzhungal Arisi', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-7', name: 'Idli Arisi', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-8', name: 'Seeraga Samba Arisi', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-9', name: 'Puzhungal Arisi Noi', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-10', name: 'Karuppu Mookadalai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-11', name: 'Milagu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-12', name: 'Seeragam', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-13', name: 'Vendhiyam', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-14', name: 'Kadugu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-15', name: 'Sombu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-16', name: 'Dhaniya', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-17', name: 'Neetu Milagai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-18', name: 'Omam', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-19', name: 'Kallu Uppu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-20', name: 'Salt', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-21', name: 'Soya Chunks', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-22', name: 'Sarkarai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-23', name: 'Nattu Sarkarai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-24', name: 'Sukku', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-25', name: 'Elakkai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-26', name: 'Mundhiri', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-27', name: 'Puli', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-28', name: 'Cocoa Powder', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-29', name: 'Tea Powder', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-30', name: 'Coffee Beans', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-31', name: 'Chicory', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-32', name: 'Palm Oil', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-33', name: 'Ghee', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-34', name: 'Amulya Milk Powder', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-35', name: 'Bush Vanila Powder', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-36', name: 'Mala Rosemilk Syrup', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  
  // Records 37-42: Category intentionally NULL/Unspecified as per client dataset
  { id: 'rm-37', name: 'Jaffic Pineaapple Essence', category: null, unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-38', name: 'Jaffic Mango Essence', category: null, unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-39', name: 'Tonivin Mixed Fruit Essence', category: null, unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-40', name: 'Kezhvaragu', category: null, unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-41', name: 'Kalakkai', category: null, unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-42', name: 'Vellam', category: null, unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },

  // Fruits (43-45)
  { id: 'rm-43', name: 'Grape', category: 'Fruit', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-44', name: 'Pineapple', category: 'Fruit', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-45', name: 'Mango', category: 'Fruit', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },

  // Groceries continued (46-65)
  { id: 'rm-46', name: 'Ellu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-47', name: 'Kollu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-48', name: 'Aali Vidhai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-49', name: 'Soda Maavu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-50', name: 'Dalda', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-51', name: 'Rava', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-52', name: 'Maida', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-53', name: 'Bread', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-54', name: 'Cheese', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-55', name: 'Manjal', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-56', name: 'Vathal', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-57', name: 'Chat Masala', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-58', name: 'Pattai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-59', name: 'Lavangam', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-60', name: 'Jadhikai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-61', name: 'Jathi Pathiri', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-62', name: 'Brinji Ilai', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-63', name: 'Rose Mottu', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-64', name: 'Marati Mooku', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-65', name: 'Annachi Poo', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },

  // Vegetables (66-82)
  { id: 'rm-66', name: 'Vengayam', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-67', name: 'Thakkali', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-68', name: 'Urulai Kilangu', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-69', name: 'Carrot', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-70', name: 'Beans', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-71', name: 'Inji', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-72', name: 'Pachai Milagai', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-73', name: 'Pachai Pattani', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-74', name: 'Corn', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-75', name: 'Karuvepillai', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-76', name: 'Kothamalli', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-77', name: 'Pudhina', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-78', name: 'Thengai', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-79', name: 'Lemon', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-80', name: 'Koda Milagai', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-81', name: 'Keerakai', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-82', name: 'Mushroom', category: 'Vegetables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },

  // Water & Consumables (83-90)
  { id: 'rm-83', name: 'Water', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-84', name: 'Silver Cover- 4 x 6', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-85', name: 'Silver Cover- 5 x 7', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-86', name: 'Silver Cover- 6 x 8', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-87', name: 'Transparent Thick Cover- 6 x 6', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-88', name: 'Transparent Cover- 4 x 4', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-89', name: 'Transparent Cover- 4 x 6', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-90', name: 'Box- 35 ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },

  // Groceries & Consumables (91-117)
  { id: 'rm-91', name: 'Boost', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-92', name: 'Horlicks', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-93', name: 'Milk', category: 'Groceries', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-94', name: 'Tissue Paper', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-95', name: 'Bio Carry Bag- 10 x 14', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-96', name: 'Bio Carry Bag- 13 x 16', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-97', name: 'Bio Carry Bag- 16 x 20', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-98', name: 'Cello Tape- 3/4"', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-99', name: 'Brown Cover- 6 x 8', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-100', name: 'Rectangular Aluminum Foil Box- 450ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-101', name: 'Rectangular Aluminum Foil Box- 750ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-102', name: 'Round Box Milk White- 300ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-103', name: 'Round Box Milk White- 400ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-104', name: 'Juice Cup with Black Lid- 300ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-105', name: 'Juice Bottle- 200ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-106', name: 'Round Box- 250ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-107', name: 'Round Box- 200ml', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-108', name: 'Transparent Cover- 10 x 14', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-109', name: 'Date Tape', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-110', name: 'Hand Gloves', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-111', name: 'Sandwich Box', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-112', name: '50ml Box', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-113', name: 'Sauce Packet', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-114', name: 'Wooden Spoon', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-115', name: 'Straw', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-116', name: 'Cling Wrap', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' },
  { id: 'rm-117', name: 'Paper Wrap', category: 'Consumables', unit: 'units', openingStock: 0, stockIn: 0, stockOut: 0, costPerUnit: 0, minThreshold: 0, supplier: 'Unassigned' }
];

// ─── 4. BOM / RECIPES MASTER (2 Complete + 7 Incomplete Placeholders) ─────────
export const CLIENT_BOM_MASTER: ClientBOMMaster[] = [
  // 1. Complete Recipe: Lemon Juice (300 ml)
  {
    productId: 'prod-51',
    productName: 'Lemon Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'COMPLETE',
    processes: [
      { step: 1, rawMaterialName: 'Lemon', rawMaterialId: 'rm-79', qty: 1, uom: 'Nos.', process: 'Cut & Squeeze' },
      { step: 2, rawMaterialName: 'Sugar', rawMaterialId: 'rm-22', qty: 4, uom: 'tsp.', process: 'Add' },
      { step: 3, rawMaterialName: 'Water', rawMaterialId: 'rm-83', qty: 100, uom: 'ml', process: 'Pour' },
      { step: 4, rawMaterialName: 'Ice', rawMaterialId: null, qty: 4, uom: 'Cubes', process: 'Add' }
    ],
    finalProcess: 'Grind in Mixie, Pour in Juice Cup and Serve to Customer'
  },

  // 2. Complete Recipe: Watermelon Juice (300 ml)
  {
    productId: 'prod-52',
    productName: 'Watermelon Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'COMPLETE',
    processes: [
      { step: 1, rawMaterialName: 'Watermelon', rawMaterialId: null, qty: 250, uom: 'g', process: 'Pick, Peel-off the top skin, and cut into cubes' },
      { step: 2, rawMaterialName: 'Sugar', rawMaterialId: 'rm-22', qty: 4, uom: 'tsp.', process: 'Add' },
      { step: 3, rawMaterialName: 'Ice', rawMaterialId: null, qty: 4, uom: 'Cubes', process: 'Add' }
    ],
    finalProcess: 'Grind in Mixie, Pour in Juice Cup and Serve to Customer'
  },

  // 3-9. 7 Incomplete BOM Placeholders (Awaiting Client Recipe Details - NO fake ingredients)
  {
    productId: 'prod-53',
    productName: 'Grape Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  },
  {
    productId: 'prod-54',
    productName: 'Pineapple Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  },
  {
    productId: 'prod-55',
    name: 'Sweetlime Juice',
    productName: 'Sweetlime Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  } as ClientBOMMaster,
  {
    productId: 'prod-56',
    productName: 'Orange Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  },
  {
    productId: 'prod-57',
    productName: 'Apple Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  },
  {
    productId: 'prod-58',
    productName: 'Mango Juice',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  },
  {
    productId: 'prod-59',
    productName: 'Pomegranate',
    servingQty: 300,
    servingUom: 'ml',
    status: 'AWAITING_RECIPE_DETAILS',
    processes: [],
    finalProcess: null
  }
];
