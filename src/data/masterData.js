// Kanchivaram Café Master Data (Complete Multi-Branch Master Dataset)
// Clean Customer-Facing POS Catalog + Kitchen Recipe Bill of Materials (BOM)

export function normalizeUnit(unit) {
  if (!unit) return 'NOS';
  const clean = String(unit).trim();
  const lower = clean.toLowerCase().replace(/[.\s_-]/g, '');
  if (['nos', 'no', 'unit', 'units', 'piece', 'pieces', 'pack', 'packs', 'packet', 'packets', 'number', 'numbers'].includes(lower)) {
    return 'NOS';
  }
  if (lower === 'kg' || lower === 'kilogram' || lower === 'kilograms') return 'kg';
  if (lower === 'g' || lower === 'gm' || lower === 'gms' || lower === 'gram' || lower === 'grams') return 'g';
  if (lower === 'l' || lower === 'ltr' || lower === 'liter' || lower === 'liters' || lower === 'litre' || lower === 'litres') return 'L';
  if (lower === 'ml' || lower === 'milliliter' || lower === 'milliliters' || lower === 'millilitre' || lower === 'millilitres') return 'ml';
  if (lower === 'm' || lower === 'meter' || lower === 'meters' || lower === 'metre' || lower === 'metres') return 'm';
  if (lower === 'cm' || lower === 'centimeter' || lower === 'centimeters') return 'cm';
  return clean;
}

// 9 Authentic Customer Categories for POS Billing (No prep items)
export const PRODUCT_CATEGORIES = [
  {
    "id": "all",
    "name": "All Menu Items",
    "slug": "all",
    "icon": "\u2728",
    "displayOrder": 0
  },
  {
    "id": "cat-kc-signatures",
    "name": "KC Signatures",
    "slug": "kc-signatures",
    "icon": "\u2728",
    "displayOrder": 1
  },
  {
    "id": "cat-sandwich",
    "name": "Sandwich",
    "slug": "sandwich",
    "icon": "\ud83e\udd6a",
    "displayOrder": 2
  },
  {
    "id": "cat-snacks",
    "name": "Snacks",
    "slug": "snacks",
    "icon": "\ud83e\udd59",
    "displayOrder": 3
  },
  {
    "id": "cat-milkshakes",
    "name": "Milkshakes",
    "slug": "milkshakes",
    "icon": "\ud83e\udd64",
    "displayOrder": 4
  },
  {
    "id": "cat-podi",
    "name": "Podi",
    "slug": "podi",
    "icon": "\ud83c\udf36\ufe0f",
    "displayOrder": 5
  },
  {
    "id": "cat-lunch",
    "name": "Lunch",
    "slug": "lunch",
    "icon": "\ud83c\udf71",
    "displayOrder": 6
  },
  {
    "id": "cat-special-drinks",
    "name": "Special Drinks",
    "slug": "special-drinks",
    "icon": "\ud83c\udf79",
    "displayOrder": 7
  },
  {
    "id": "cat-beverages",
    "name": "Beverages",
    "slug": "beverages",
    "icon": "\u2615",
    "displayOrder": 8
  },
  {
    "id": "cat-juices",
    "name": "Juices",
    "slug": "juices",
    "icon": "\ud83e\uddc3",
    "displayOrder": 9
  }
];

// All Categories including Kitchen Prep for Recipe Management
export const ALL_RECIPE_CATEGORIES = [
  {
    "id": "all",
    "name": "All Menu Items",
    "slug": "all",
    "icon": "\u2728",
    "displayOrder": 0
  },
  {
    "id": "cat-kc-signatures",
    "name": "KC Signatures",
    "slug": "kc-signatures",
    "icon": "\u2728",
    "displayOrder": 1
  },
  {
    "id": "cat-sandwich",
    "name": "Sandwich",
    "slug": "sandwich",
    "icon": "\ud83e\udd6a",
    "displayOrder": 2
  },
  {
    "id": "cat-snacks",
    "name": "Snacks",
    "slug": "snacks",
    "icon": "\ud83e\udd59",
    "displayOrder": 3
  },
  {
    "id": "cat-milkshakes",
    "name": "Milkshakes",
    "slug": "milkshakes",
    "icon": "\ud83e\udd64",
    "displayOrder": 4
  },
  {
    "id": "cat-podi",
    "name": "Podi",
    "slug": "podi",
    "icon": "\ud83c\udf36\ufe0f",
    "displayOrder": 5
  },
  {
    "id": "cat-lunch",
    "name": "Lunch",
    "slug": "lunch",
    "icon": "\ud83c\udf71",
    "displayOrder": 6
  },
  {
    "id": "cat-special-drinks",
    "name": "Special Drinks",
    "slug": "special-drinks",
    "icon": "\ud83c\udf79",
    "displayOrder": 7
  },
  {
    "id": "cat-beverages",
    "name": "Beverages",
    "slug": "beverages",
    "icon": "\u2615",
    "displayOrder": 8
  },
  {
    "id": "cat-juices",
    "name": "Juices",
    "slug": "juices",
    "icon": "\ud83e\uddc3",
    "displayOrder": 9
  },
  {
    "id": "cat-submenu",
    "name": "Kitchen Prep / Sub-Recipes",
    "slug": "submenu",
    "icon": "\ud83e\udd63",
    "displayOrder": 10
  }
];

// Customer Sellable Products for POS Billing Terminal
export const CLIENT_PRODUCTS_MASTER = [
  {
    "id": "prod-1",
    "name": "Mini Podi Idli",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 10,
    "uom": "Nos.",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "Bite-sized ten idlies rolled in fiery homemade podi and a glaze of oil, delivering bold flavour in every soft, pillowy morsel",
    "price": 35,
    "unit": "Nos.",
    "image": "/dishes/prod-1.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-2",
    "name": "Mini Sambar Idli",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 10,
    "uom": "Nos.",
    "dineInPrice": 45,
    "deliveryPrice": 68,
    "packingCharge": 5,
    "description": "Fluffy ten mini-idlies soaking up piping-hot, tangy sambar \u2014 a warm, comforting bite in every spoonful",
    "price": 45,
    "unit": "Nos.",
    "image": "/dishes/prod-2.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-3",
    "name": "Kaima Idli",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 15,
    "uom": "Nos.",
    "dineInPrice": 75,
    "deliveryPrice": 113,
    "packingCharge": 5,
    "description": "Fifteen Idlies simmered with fragrant whole spices, turning out extra soft and richly flavoured with every steamy bite",
    "price": 75,
    "unit": "Nos.",
    "image": "/dishes/prod-3.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-4",
    "name": "Sambar Vada",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "A soft, spiced vadai soaked in hot, tangy sambar until it turns melt-in-the-mouth tender \u2014 comforting in every bite",
    "price": 35,
    "unit": "Nos.",
    "image": "/dishes/prod-4.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-5",
    "name": "Idli Sambar Chutney",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 40,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Two cloud-soft steamed idlies bathed in piping-hot sambar and paired with fresh chutney, for a comforting classic done right",
    "price": 40,
    "unit": "Nos.",
    "image": "/dishes/prod-5.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-6",
    "name": "Veg. Cheese Sandwich",
    "category": "Sandwich",
    "categoryName": "Sandwich",
    "categoryId": "cat-sandwich",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 5,
    "description": "Savor layers of gooey, melted cheese and fresh vegetables nestled between crispy, toasted bread \u2014 made completely mayonnaise-free",
    "price": 60,
    "unit": "Nos.",
    "image": "/dishes/prod-6.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-7",
    "name": "Corn Cheese Sandwich",
    "category": "Sandwich",
    "categoryName": "Sandwich",
    "categoryId": "cat-sandwich",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "Sweet, juicy corn kernels melt into gooey cheese, all grilled between golden, crunchy bread \u2014 no mayonnaise, just pure flavour",
    "price": 70,
    "unit": "Nos.",
    "image": "/dishes/prod-7.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-8",
    "name": "Chilli Cheese Sandwich",
    "category": "Sandwich",
    "categoryName": "Sandwich",
    "categoryId": "cat-sandwich",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "Molten cheese meets a fiery chilli kick, layered between crisp golden bread \u2014 a bold, mayo-free bite",
    "price": 70,
    "unit": "Nos.",
    "image": "/dishes/prod-8.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-9",
    "name": "Raw Banana Bajji",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "Crisp, golden fritters made with fresh raw banana, coated in a light savory batter \u2014 crunchy outside, tender and mildly sweet inside. Best devoured 6  hot Bajji \u2014  with chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-9.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-10",
    "name": "Bonda",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "Deep-fried urad dal fritters with a crisp golden crust and a soft, fluffy center \u2014 6 Bondas, best enjoyed with a side of coconut chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-10.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-11",
    "name": "Masal Vadai",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "Crunchy, deeply spiced lentil fritters with a crisp golden edge and a soft, herby center, 6 masal vada with a side of coconut chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-11.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-12",
    "name": "Samosa",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 30,
    "deliveryPrice": 45,
    "packingCharge": 0,
    "description": "Shatteringly crisp, flaky layers wrapped around a warm, spiced potato filling \u2014 fried to golden perfection, 3 Pcs with a tomato ketchup",
    "price": 30,
    "unit": "Nos.",
    "image": "/dishes/prod-12.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-13",
    "name": "Kaara Kuzhi Paniyaram",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 3,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 60,
    "packingCharge": 0,
    "description": "6 Pcs \u2014 Golden, crisp-edged dumplings with a soft spiced core, a fiery little burst in every bite with kara chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-13.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-14",
    "name": "Sweet Kuzhi Paniyaram",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 4,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 60,
    "packingCharge": 0,
    "description": "8 Pcs \u2014 Golden, caramelized dumplings with a soft sweet center, the perfect little treat with your evening time",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-14.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-15",
    "name": "Suiyam / Suzhiyam",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "6 Pcs \u2014 Deep golden fritters with a crackling jaggery crust giving way to a soft, sweet center",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-15.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-16",
    "name": "Sundal",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 70,
    "uom": "g",
    "dineInPrice": 20,
    "deliveryPrice": 45,
    "packingCharge": 0,
    "description": "A wholesome toss of tender legumes, and curry leaves \u2014 light, earthy, and full of flavour- 100g",
    "price": 20,
    "unit": "g",
    "image": "/dishes/prod-16.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-17",
    "name": "Rava Kesari",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 70,
    "uom": "g",
    "dineInPrice": 20,
    "deliveryPrice": 45,
    "packingCharge": 0,
    "description": "Glistening with a rich blend of ghee and palm oil, this semolina sweet melts into a soft, aromatic bite- 60g",
    "price": 20,
    "unit": "g",
    "image": "/dishes/prod-17.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-18",
    "name": "Vanilla Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "Thick, creamy, and dreamy \u2014 classic vanilla blended to silky smooth perfection in every sip",
    "price": 70,
    "unit": "ml",
    "image": "/dishes/prod-18.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-19",
    "name": "Apple Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Fresh apple swirled into a cool, creamy milkshake bursting with natural sweetness in every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-19.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-20",
    "name": "Chocolate Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Rich, velvety chocolate blended thick and creamy \u2014 pure indulgence in every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-20.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-21",
    "name": "Dates Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Naturally sweet dates blended into a thick, wholesome shake that feels like a treat with every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-21.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-22",
    "name": "Strawberry Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 120,
    "deliveryPrice": 180,
    "packingCharge": 5,
    "description": "Fresh strawberries blended into a luscious, fruity shake \u2014 cool, creamy, and refreshing in every sip",
    "price": 120,
    "unit": "ml",
    "image": "/dishes/prod-22.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-23",
    "name": "Mango Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Ripe, juicy mangoes blended into a thick, luscious shake \u2014 tropical sweetness in every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-23.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-24",
    "name": "Butterfruit Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 100,
    "deliveryPrice": 150,
    "packingCharge": 5,
    "description": "Creamy avocado blended into a rich, velvety shake with a subtle natural sweetness in every sip",
    "price": 100,
    "unit": "ml",
    "image": "/dishes/prod-24.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-25",
    "name": "Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-25.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-26",
    "name": "Sesame Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-26.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-27",
    "name": "Horsegram Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-27.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-28",
    "name": "Flax Seed Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "",
    "price": 60,
    "unit": "g",
    "image": "/dishes/prod-28.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-29",
    "name": "Special Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-29.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-30",
    "name": "Curry Leaves Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 55,
    "deliveryPrice": 83,
    "packingCharge": 0,
    "description": "",
    "price": 55,
    "unit": "g",
    "image": "/dishes/prod-30.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-31",
    "name": "Paruppu Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-31.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-32",
    "name": "Seeraga Samba Vegetable Biriyani",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 45,
    "deliveryPrice": 68,
    "packingCharge": 5,
    "description": "",
    "price": 45,
    "unit": "g",
    "image": "/dishes/prod-32.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-33",
    "name": "Seeraga Samba Mushroom Biriyani",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 5,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-33.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-34",
    "name": "Curd Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 30,
    "deliveryPrice": 45,
    "packingCharge": 5,
    "description": "",
    "price": 30,
    "unit": "g",
    "image": "/dishes/prod-34.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-35",
    "name": "Tomato Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "",
    "price": 35,
    "unit": "g",
    "image": "/dishes/prod-35.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-36",
    "name": "Lemon Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "",
    "price": 35,
    "unit": "g",
    "image": "/dishes/prod-36.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-37",
    "name": "Carrot Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "g",
    "image": "/dishes/prod-37.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-68",
    "name": "CurryLeaf Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 5,
    "description": "Fragrant South Indian rice tempered with fresh curry leaves, mustard seeds, and roasted lentils",
    "price": 0,
    "unit": "g",
    "image": "/dishes/prod-68.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-69",
    "name": "Avarakai Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 5,
    "description": "Traditional South Indian variety rice cooked with tender fresh broad beans and aromatic spices",
    "price": 0,
    "unit": "g",
    "image": "/dishes/prod-69.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-38",
    "name": "Rose Milk",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 5,
    "description": "",
    "price": 50,
    "unit": "ml",
    "image": "/dishes/prod-38.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-39",
    "name": "Cold Black Coffe",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-39.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-40",
    "name": "Cold Coffee",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 5,
    "description": "",
    "price": 50,
    "unit": "ml",
    "image": "/dishes/prod-40.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-41",
    "name": "Iced Tea",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-41.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-42",
    "name": "Lemon Soda",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 30,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 30,
    "unit": "ml",
    "image": "/dishes/prod-42.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-43",
    "name": "Kulukki Sarbath",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-43.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-45",
    "name": "Tea",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-44.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-48",
    "name": "Filter Coffee",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 25,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 25,
    "unit": "ml",
    "image": "/dishes/prod-45.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-49",
    "name": "Milk",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 15,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 15,
    "unit": "ml",
    "image": "/dishes/prod-46.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-50",
    "name": "Sukku Malli Coffee",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 30,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 30,
    "unit": "ml",
    "image": "/dishes/prod-47.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-51",
    "name": "Hot Chocolate",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-48.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-52",
    "name": "Lemon Tea",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-49.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-53",
    "name": "Black Coffee",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-50.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-54",
    "name": "Lemon Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 30,
    "packingCharge": 5,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-51.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-55",
    "name": "Watermelon Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-52.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-56",
    "name": "Grape Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "",
    "price": 70,
    "unit": "ml",
    "image": "/dishes/prod-53.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-57",
    "name": "Pineapple Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 5,
    "description": "",
    "price": 60,
    "unit": "ml",
    "image": "/dishes/prod-54.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-58",
    "name": "Sweetlime Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 5,
    "description": "",
    "price": 60,
    "unit": "ml",
    "image": "/dishes/prod-55.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-59",
    "name": "Orange Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-56.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-60",
    "name": "Apple Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "",
    "price": 70,
    "unit": "ml",
    "image": "/dishes/prod-57.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-61",
    "name": "Mango Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 100,
    "deliveryPrice": 100,
    "packingCharge": 5,
    "description": "Rich and luscious mango juice blended fresh to order",
    "price": 100,
    "unit": "ml",
    "image": "/dishes/prod-61.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-63",
    "name": "Pomegranate Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 150,
    "deliveryPrice": 200,
    "packingCharge": 5,
    "description": "",
    "price": 150,
    "unit": "ml",
    "image": "/dishes/prod-63.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  }
];

// Complete Catalog including Kitchen Prep Items
export const ALL_PRODUCTS_CATALOG = [
  {
    "id": "prod-1",
    "name": "Mini Podi Idli",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 10,
    "uom": "Nos.",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "Bite-sized ten idlies rolled in fiery homemade podi and a glaze of oil, delivering bold flavour in every soft, pillowy morsel",
    "price": 35,
    "unit": "Nos.",
    "image": "/dishes/prod-1.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-2",
    "name": "Mini Sambar Idli",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 10,
    "uom": "Nos.",
    "dineInPrice": 45,
    "deliveryPrice": 68,
    "packingCharge": 5,
    "description": "Fluffy ten mini-idlies soaking up piping-hot, tangy sambar \u2014 a warm, comforting bite in every spoonful",
    "price": 45,
    "unit": "Nos.",
    "image": "/dishes/prod-2.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-3",
    "name": "Kaima Idli",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 15,
    "uom": "Nos.",
    "dineInPrice": 75,
    "deliveryPrice": 113,
    "packingCharge": 5,
    "description": "Fifteen Idlies simmered with fragrant whole spices, turning out extra soft and richly flavoured with every steamy bite",
    "price": 75,
    "unit": "Nos.",
    "image": "/dishes/prod-3.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-4",
    "name": "Sambar Vada",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "A soft, spiced vadai soaked in hot, tangy sambar until it turns melt-in-the-mouth tender \u2014 comforting in every bite",
    "price": 35,
    "unit": "Nos.",
    "image": "/dishes/prod-4.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-5",
    "name": "Idli Sambar Chutney",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 40,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Two cloud-soft steamed idlies bathed in piping-hot sambar and paired with fresh chutney, for a comforting classic done right",
    "price": 40,
    "unit": "Nos.",
    "image": "/dishes/prod-5.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-6",
    "name": "Veg. Cheese Sandwich",
    "category": "Sandwich",
    "categoryName": "Sandwich",
    "categoryId": "cat-sandwich",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 5,
    "description": "Savor layers of gooey, melted cheese and fresh vegetables nestled between crispy, toasted bread \u2014 made completely mayonnaise-free",
    "price": 60,
    "unit": "Nos.",
    "image": "/dishes/prod-6.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-7",
    "name": "Corn Cheese Sandwich",
    "category": "Sandwich",
    "categoryName": "Sandwich",
    "categoryId": "cat-sandwich",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "Sweet, juicy corn kernels melt into gooey cheese, all grilled between golden, crunchy bread \u2014 no mayonnaise, just pure flavour",
    "price": 70,
    "unit": "Nos.",
    "image": "/dishes/prod-7.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-8",
    "name": "Chilli Cheese Sandwich",
    "category": "Sandwich",
    "categoryName": "Sandwich",
    "categoryId": "cat-sandwich",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "Molten cheese meets a fiery chilli kick, layered between crisp golden bread \u2014 a bold, mayo-free bite",
    "price": 70,
    "unit": "Nos.",
    "image": "/dishes/prod-8.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-9",
    "name": "Raw Banana Bajji",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "Crisp, golden fritters made with fresh raw banana, coated in a light savory batter \u2014 crunchy outside, tender and mildly sweet inside. Best devoured 6  hot Bajji \u2014  with chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-9.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-10",
    "name": "Bonda",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "Deep-fried urad dal fritters with a crisp golden crust and a soft, fluffy center \u2014 6 Bondas, best enjoyed with a side of coconut chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-10.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-11",
    "name": "Masal Vadai",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "Crunchy, deeply spiced lentil fritters with a crisp golden edge and a soft, herby center, 6 masal vada with a side of coconut chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-11.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-12",
    "name": "Samosa",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 30,
    "deliveryPrice": 45,
    "packingCharge": 0,
    "description": "Shatteringly crisp, flaky layers wrapped around a warm, spiced potato filling \u2014 fried to golden perfection, 3 Pcs with a tomato ketchup",
    "price": 30,
    "unit": "Nos.",
    "image": "/dishes/prod-12.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-13",
    "name": "Kaara Kuzhi Paniyaram",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 3,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 60,
    "packingCharge": 0,
    "description": "6 Pcs \u2014 Golden, crisp-edged dumplings with a soft spiced core, a fiery little burst in every bite with kara chutney",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-13.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-14",
    "name": "Sweet Kuzhi Paniyaram",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 4,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 60,
    "packingCharge": 0,
    "description": "8 Pcs \u2014 Golden, caramelized dumplings with a soft sweet center, the perfect little treat with your evening time",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-14.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-15",
    "name": "Suiyam / Suzhiyam",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 2,
    "uom": "Nos.",
    "dineInPrice": 20,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "6 Pcs \u2014 Deep golden fritters with a crackling jaggery crust giving way to a soft, sweet center",
    "price": 20,
    "unit": "Nos.",
    "image": "/dishes/prod-15.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-16",
    "name": "Sundal",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 70,
    "uom": "g",
    "dineInPrice": 20,
    "deliveryPrice": 45,
    "packingCharge": 0,
    "description": "A wholesome toss of tender legumes, and curry leaves \u2014 light, earthy, and full of flavour- 100g",
    "price": 20,
    "unit": "g",
    "image": "/dishes/prod-16.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-17",
    "name": "Rava Kesari",
    "category": "Snacks",
    "categoryName": "Snacks",
    "categoryId": "cat-snacks",
    "servingQty": 70,
    "uom": "g",
    "dineInPrice": 20,
    "deliveryPrice": 45,
    "packingCharge": 0,
    "description": "Glistening with a rich blend of ghee and palm oil, this semolina sweet melts into a soft, aromatic bite- 60g",
    "price": 20,
    "unit": "g",
    "image": "/dishes/prod-17.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-18",
    "name": "Vanilla Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "Thick, creamy, and dreamy \u2014 classic vanilla blended to silky smooth perfection in every sip",
    "price": 70,
    "unit": "ml",
    "image": "/dishes/prod-18.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-19",
    "name": "Apple Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Fresh apple swirled into a cool, creamy milkshake bursting with natural sweetness in every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-19.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-20",
    "name": "Chocolate Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Rich, velvety chocolate blended thick and creamy \u2014 pure indulgence in every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-20.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-21",
    "name": "Dates Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Naturally sweet dates blended into a thick, wholesome shake that feels like a treat with every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-21.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-22",
    "name": "Strawberry Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 120,
    "deliveryPrice": 180,
    "packingCharge": 5,
    "description": "Fresh strawberries blended into a luscious, fruity shake \u2014 cool, creamy, and refreshing in every sip",
    "price": 120,
    "unit": "ml",
    "image": "/dishes/prod-22.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-23",
    "name": "Mango Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "Ripe, juicy mangoes blended into a thick, luscious shake \u2014 tropical sweetness in every sip",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-23.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-24",
    "name": "Butterfruit Milkshake",
    "category": "Milkshakes",
    "categoryName": "Milkshakes",
    "categoryId": "cat-milkshakes",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 100,
    "deliveryPrice": 150,
    "packingCharge": 5,
    "description": "Creamy avocado blended into a rich, velvety shake with a subtle natural sweetness in every sip",
    "price": 100,
    "unit": "ml",
    "image": "/dishes/prod-24.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-25",
    "name": "Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-25.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-26",
    "name": "Sesame Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-26.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-27",
    "name": "Horsegram Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-27.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-28",
    "name": "Flax Seed Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 0,
    "description": "",
    "price": 60,
    "unit": "g",
    "image": "/dishes/prod-28.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-29",
    "name": "Special Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-29.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-30",
    "name": "Curry Leaves Idly Milagai Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 55,
    "deliveryPrice": 83,
    "packingCharge": 0,
    "description": "",
    "price": 55,
    "unit": "g",
    "image": "/dishes/prod-30.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-31",
    "name": "Paruppu Podi",
    "category": "Podi",
    "categoryName": "Podi",
    "categoryId": "cat-podi",
    "servingQty": 100,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 0,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-31.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-32",
    "name": "Seeraga Samba Vegetable Biriyani",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 45,
    "deliveryPrice": 68,
    "packingCharge": 5,
    "description": "",
    "price": 45,
    "unit": "g",
    "image": "/dishes/prod-32.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-33",
    "name": "Seeraga Samba Mushroom Biriyani",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 5,
    "description": "",
    "price": 50,
    "unit": "g",
    "image": "/dishes/prod-33.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-34",
    "name": "Curd Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 30,
    "deliveryPrice": 45,
    "packingCharge": 5,
    "description": "",
    "price": 30,
    "unit": "g",
    "image": "/dishes/prod-34.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-35",
    "name": "Tomato Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "",
    "price": 35,
    "unit": "g",
    "image": "/dishes/prod-35.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-36",
    "name": "Lemon Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 35,
    "deliveryPrice": 53,
    "packingCharge": 5,
    "description": "",
    "price": 35,
    "unit": "g",
    "image": "/dishes/prod-36.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-37",
    "name": "Carrot Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "g",
    "image": "/dishes/prod-37.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-38",
    "name": "Rose Milk",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 5,
    "description": "",
    "price": 50,
    "unit": "ml",
    "image": "/dishes/prod-38.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-39",
    "name": "Cold Black Coffe",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-39.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-40",
    "name": "Cold Coffee",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 50,
    "deliveryPrice": 75,
    "packingCharge": 5,
    "description": "",
    "price": 50,
    "unit": "ml",
    "image": "/dishes/prod-40.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-41",
    "name": "Iced Tea",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-41.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-42",
    "name": "Lemon Soda",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 30,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 30,
    "unit": "ml",
    "image": "/dishes/prod-42.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-43",
    "name": "Kulukki Sarbath",
    "category": "Special Drinks",
    "categoryName": "Special Drinks",
    "categoryId": "cat-special-drinks",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-43.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-44",
    "name": "Sugar Water",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 1,
    "uom": "l",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "l",
    "image": "/dishes/prod-44.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-45",
    "name": "Tea",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-44.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-46",
    "name": "Filter1",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 500,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-46.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-47",
    "name": "Filter2",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 500,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-47.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-48",
    "name": "Filter Coffee",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 25,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 25,
    "unit": "ml",
    "image": "/dishes/prod-45.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-49",
    "name": "Milk",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 15,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 15,
    "unit": "ml",
    "image": "/dishes/prod-46.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-50",
    "name": "Sukku Malli Coffee",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 30,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 30,
    "unit": "ml",
    "image": "/dishes/prod-47.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-51",
    "name": "Hot Chocolate",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-48.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-52",
    "name": "Lemon Tea",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-49.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-53",
    "name": "Black Coffee",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-50.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-54",
    "name": "Lemon Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 20,
    "deliveryPrice": 30,
    "packingCharge": 5,
    "description": "",
    "price": 20,
    "unit": "ml",
    "image": "/dishes/prod-51.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-55",
    "name": "Watermelon Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 40,
    "deliveryPrice": 60,
    "packingCharge": 5,
    "description": "",
    "price": 40,
    "unit": "ml",
    "image": "/dishes/prod-52.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-56",
    "name": "Grape Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "",
    "price": 70,
    "unit": "ml",
    "image": "/dishes/prod-53.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-57",
    "name": "Pineapple Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 5,
    "description": "",
    "price": 60,
    "unit": "ml",
    "image": "/dishes/prod-54.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-58",
    "name": "Sweetlime Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 60,
    "deliveryPrice": 90,
    "packingCharge": 5,
    "description": "",
    "price": 60,
    "unit": "ml",
    "image": "/dishes/prod-55.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-59",
    "name": "Orange Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 80,
    "deliveryPrice": 120,
    "packingCharge": 5,
    "description": "",
    "price": 80,
    "unit": "ml",
    "image": "/dishes/prod-56.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-60",
    "name": "Apple Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 70,
    "deliveryPrice": 105,
    "packingCharge": 5,
    "description": "",
    "price": 70,
    "unit": "ml",
    "image": "/dishes/prod-57.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-61",
    "name": "Mango Juice (Flavour)",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 65,
    "deliveryPrice": 0,
    "packingCharge": 5,
    "description": "",
    "price": 65,
    "unit": "ml",
    "image": "/dishes/prod-61.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-62",
    "name": "Mango Juice (Natural)",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-62.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-63",
    "name": "Pomegranate Juice",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 150,
    "deliveryPrice": 200,
    "packingCharge": 5,
    "description": "",
    "price": 150,
    "unit": "ml",
    "image": "/dishes/prod-63.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-64",
    "name": "Chutney-1",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-64.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-65",
    "name": "Chutney-2",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-65.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-66",
    "name": "Sandwich Chutney",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-66.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-67",
    "name": "Bajji Batter",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-67.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-68",
    "name": "CurryLeaf Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "g",
    "image": "/dishes/prod-68.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-69",
    "name": "Avarakai Rice",
    "category": "Lunch",
    "categoryName": "Lunch",
    "categoryId": "cat-lunch",
    "servingQty": 300,
    "uom": "g",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "g",
    "image": "/dishes/prod-69.jpg",
    "isSubRecipe": false,
    "isKitchenPrep": false
  },
  {
    "id": "prod-70",
    "name": "Samosa Maavu",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "Nos.",
    "image": "/dishes/prod-70.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-71",
    "name": "Daily Sambar",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 20,
    "uom": "L",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "Daily Bulk Batch Kitchen Prep (Sambar)",
    "price": 0,
    "unit": "L",
    "image": "/branch_main.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-72",
    "name": "Daily Rasam",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 15,
    "uom": "L",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "Daily Bulk Batch Kitchen Prep (Rasam)",
    "price": 0,
    "unit": "L",
    "image": "/branch_main.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  }
];
export const KITCHEN_SUB_RECIPES = [
  {
    "id": "prod-44",
    "name": "Sugar Water",
    "category": "KC Signatures",
    "categoryName": "KC Signatures",
    "categoryId": "cat-kc-signatures",
    "servingQty": 1,
    "uom": "l",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "l",
    "image": "/dishes/prod-44.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-46",
    "name": "Filter1",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 500,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-46.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-47",
    "name": "Filter2",
    "category": "Beverages",
    "categoryName": "Beverages",
    "categoryId": "cat-beverages",
    "servingQty": 500,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-47.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-62",
    "name": "Mango Juice (Natural)",
    "category": "Juices",
    "categoryName": "Juices",
    "categoryId": "cat-juices",
    "servingQty": 300,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-62.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-64",
    "name": "Chutney-1",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-64.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-65",
    "name": "Chutney-2",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-65.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-66",
    "name": "Sandwich Chutney",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-66.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-67",
    "name": "Bajji Batter",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 100,
    "uom": "ml",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "ml",
    "image": "/dishes/prod-67.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  },
  {
    "id": "prod-70",
    "name": "Samosa Maavu",
    "category": "SubMenu",
    "categoryName": "SubMenu",
    "categoryId": "cat-submenu",
    "servingQty": 1,
    "uom": "Nos.",
    "dineInPrice": 0,
    "deliveryPrice": 0,
    "packingCharge": 0,
    "description": "",
    "price": 0,
    "unit": "Nos.",
    "image": "/dishes/prod-70.jpg",
    "isSubRecipe": true,
    "isKitchenPrep": true
  }
];

// Raw Materials Master (195 Standard Items)
export const CLIENT_RAW_MATERIALS_MASTER = [
  {
    "id": "rm-1",
    "name": "200 ml Juice Bottle",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-2",
    "name": "200 ml Round Container",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-3",
    "name": "250 ml Round Container",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-4",
    "name": "300 ml Juice Cup with Black Lid",
    "category": "Packaging & Disposables",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-5",
    "name": "300 ml Milk-White Round Container",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-6",
    "name": "35 ml Box",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-7",
    "name": "400 ml Milk-White Round Container",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-8",
    "name": "450 ml Rectangular Aluminium Foil Container",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-9",
    "name": "50 ml Box",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-10",
    "name": "Avarakai",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-11",
    "name": "Aali Vidhai (Flax Seeds)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-12",
    "name": "Amulya Milk Powder",
    "category": "Dairy & Chilled",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-13",
    "name": "Apple",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-14",
    "name": "Arabica Coffee Beans",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-15",
    "name": "Arabica Coffee Powder",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-16",
    "name": "Avocado",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-17",
    "name": "Bajji Batter",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-18",
    "name": "Beans",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-19",
    "name": "Bengal Gram Dal (Chana Dal)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-20",
    "name": "Kadalai Maavu (Bengal Gram Flour)",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-21",
    "name": "Bio Carry Bag 10 x 14",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-22",
    "name": "Bio Carry Bag 13 x 16",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-23",
    "name": "Bio Carry Bag 16 x 20",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-24",
    "name": "Black Channa (Chickpeas)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-25",
    "name": "Boiled Broken Rice",
    "category": "Rice, Flour & Bakery",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-26",
    "name": "Boiled Rice",
    "category": "Rice, Flour & Bakery",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-27",
    "name": "Bread",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-28",
    "name": "Bread Pieces",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-29",
    "name": "Brinji Ilai",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-30",
    "name": "Broad Beans",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-31",
    "name": "Broken Boiled Rice (Noi)",
    "category": "Rice, Flour & Bakery",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-32",
    "name": "Brown Paper Cover 6 x 8",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-33",
    "name": "Bush Vanilla Powder",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-34",
    "name": "Kudai Milagai (Capsicum)",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-35",
    "name": "Cardamom Powder",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-36",
    "name": "Carrot",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-37",
    "name": "Cello Tape 3/4 inch",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-38",
    "name": "Chaat Masala",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-39",
    "name": "Cheese",
    "category": "Dairy & Chilled",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-40",
    "name": "Chicory",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-41",
    "name": "Chilli Powder",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-42",
    "name": "Chocolate Powder",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-43",
    "name": "Chutney (prepared)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-44",
    "name": "Cinnamon",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-45",
    "name": "Cling Wrap (Film)",
    "category": "Packaging & Disposables",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-46",
    "name": "Cloves",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-47",
    "name": "Cocoa Powder",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-48",
    "name": "Coconut",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-49",
    "name": "Coffee Beans",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-50",
    "name": "Ennai (Cooking Oil)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-51",
    "name": "Samosa Maavu",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-52",
    "name": "Kothamalli (Coriander Leaves)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-53",
    "name": "Corn",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-54",
    "name": "Nattu Sarkarai (Country Sugar)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-55",
    "name": "Cucumber",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-56",
    "name": "Curd",
    "category": "Dairy & Chilled",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-57",
    "name": "Curry Leaves",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-58",
    "name": "Date Coding Tape",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-59",
    "name": "Dates",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-60",
    "name": "Dhaniya (Coriander Seeds)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-61",
    "name": "Disposable Gloves",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-62",
    "name": "Drinking Straw",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-63",
    "name": "Drinking Water",
    "category": "Beverages & Cafe Ingredients",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-64",
    "name": "Dry Ginger",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-65",
    "name": "Dry Ginger-Coriander Powder",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-66",
    "name": "Elakkai (Cardamom)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-67",
    "name": "Fennel Seeds",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-68",
    "name": "Fenugreek Seeds",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-69",
    "name": "Filter- Filter Coffee",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-70",
    "name": "Filter- Cold Coffee",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-71",
    "name": "Filter- Black Coffee",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-72",
    "name": "Garam Masala",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-73",
    "name": "Meal Maker (Soya Chunks)",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-74",
    "name": "Garlic",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-75",
    "name": "Nei (Ghee)",
    "category": "Dairy & Chilled",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-76",
    "name": "Ginger",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-77",
    "name": "Ginger Garlic Paste",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-78",
    "name": "Grape Essence",
    "category": "Beverages & Cafe Ingredients",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-79",
    "name": "Grapes",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-80",
    "name": "Grated Coconut",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-81",
    "name": "Green Chilli",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-82",
    "name": "Green Chutney",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-83",
    "name": "Ice",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-84",
    "name": "Ice Cream",
    "category": "Dairy & Chilled",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-85",
    "name": "Iced Soda",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-86",
    "name": "Idli (prepared)",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-87",
    "name": "Idli Arisi",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-88",
    "name": "Idli Batter",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-89",
    "name": "Jadhikai (Nutmeg)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-90",
    "name": "Jaffic Mango Essence",
    "category": "Fruits",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-91",
    "name": "Jaffic Pineapple Essence",
    "category": "Fruits",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-92",
    "name": "Jaljeera Masala",
    "category": "Beverages & Cafe Ingredients",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-93",
    "name": "Jathi Pathiri",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-94",
    "name": "Jeera (Cumin Seeds)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-95",
    "name": "Juice Packets",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-96",
    "name": "Kadalai Paruppu (Gram Dal)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-97",
    "name": "Kadugu (Mustard Seeds)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-98",
    "name": "Kalakkai (Peanut)",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-99",
    "name": "Kallu Uppu (Rock Salt)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-100",
    "name": "Kollu",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-101",
    "name": "Lemon",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-102",
    "name": "Maida Flour",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-103",
    "name": "Malaa Rose Milk Syrup",
    "category": "Dairy & Chilled",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-104",
    "name": "Mango",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-105",
    "name": "Mango Tin",
    "category": "Fruits",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-106",
    "name": "Marathi Moggu",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-107",
    "name": "Milagu (Pepper)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-108",
    "name": "Milk",
    "category": "Dairy & Chilled",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-109",
    "name": "Mint Leaves",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-110",
    "name": "Mixed Spices",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-111",
    "name": "Mundhiri (Cashew Nuts)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-112",
    "name": "Mushroom",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-113",
    "name": "Neetu Milagai (Long Chilli)",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-114",
    "name": "Omam",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-115",
    "name": "Onion",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-116",
    "name": "Orange",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-117",
    "name": "Pachai Pattani (Green Peas)",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-118",
    "name": "Pacharisi",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-119",
    "name": "Palm Oil",
    "category": "Oils, Sweeteners & Staples",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-120",
    "name": "Paper Wrap",
    "category": "Packaging & Disposables",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-121",
    "name": "Pattani (Peas)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-122",
    "name": "Pineapple",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-123",
    "name": "Podi (Special Idly Milagai)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-124",
    "name": "Pomegranate",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-125",
    "name": "Puli (Tamarind)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-126",
    "name": "Ragi",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-127",
    "name": "Rava",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-128",
    "name": "Raw Rice",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-129",
    "name": "Rectangular Aluminum Foil Box- 750ml",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-130",
    "name": "Arisi Maavu (Rice Flour)",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-131",
    "name": "Sivappu Milagai (Red Chilli)",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-132",
    "name": "Roasted Chana Dal",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-133",
    "name": "Roasted Gram",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-134",
    "name": "Robusta Coffee Beans",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-135",
    "name": "Rose Mottu (Dried Rose Buds)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-136",
    "name": "Rose Syrup",
    "category": "Beverages & Cafe Ingredients",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-137",
    "name": "Sabje (Basil) Seeds",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-138",
    "name": "Uppu (Salt)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-139",
    "name": "Sambar (prepared)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-140",
    "name": "Sandwich Box",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-141",
    "name": "Sandwich Chutney",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-142",
    "name": "Sarkarai (Sugar)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-143",
    "name": "Sauce Sachet",
    "category": "Prepared Foods & Condiments",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-144",
    "name": "Seeraga Samba Rice",
    "category": "Rice, Flour & Bakery",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-145",
    "name": "Sesame Seeds",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-146",
    "name": "Silver Cover 4 x 6",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-147",
    "name": "Silver Cover 5 x 7",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-148",
    "name": "Silver Cover 6 x 8",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-149",
    "name": "Soda Maavu (Baking Soda)",
    "category": "Other / Confirm",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-150",
    "name": "Soya Chunks",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-151",
    "name": "Star Anise",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-152",
    "name": "Strawberry Essence",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-153",
    "name": "Sugar",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-154",
    "name": "Sugar Syrup",
    "category": "Beverages & Cafe Ingredients",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-155",
    "name": "Sugar Water",
    "category": "Groceries",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-156",
    "name": "Sukku",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-157",
    "name": "Sukku Malli Powder",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-158",
    "name": "Sweet Lime",
    "category": "Fruits",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-159",
    "name": "Sweetlime",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-160",
    "name": "Tamarind",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-161",
    "name": "Tea Powder",
    "category": "Caf\u00e9",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-162",
    "name": "Thakkali",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-163",
    "name": "Thakkali (Tomato)",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-164",
    "name": "Thengai",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-165",
    "name": "Thick Transparent Cover 6 x 6",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-166",
    "name": "Thuvaram Paruppu",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-167",
    "name": "Tissue Paper",
    "category": "Packaging & Disposables",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-168",
    "name": "Tomato",
    "category": "Vegetables",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-169",
    "name": "Tonivin Mixed Fruit Essence",
    "category": "Beverages & Cafe Ingredients",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-170",
    "name": "Toor Dal",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-171",
    "name": "Transparent Cover 10 x 14",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-172",
    "name": "Transparent Cover- 10 x 14",
    "category": "Consumables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-173",
    "name": "Transparent Cover 4 x 4",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-174",
    "name": "Transparent Cover- 4 x 4",
    "category": "Consumables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-175",
    "name": "Transparent Cover 4 x 6",
    "category": "Packaging & Disposables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-176",
    "name": "Transparent Cover- 4 x 6",
    "category": "Consumables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-177",
    "name": "Transparent Thick Cover- 6 x 6",
    "category": "Consumables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-178",
    "name": "Turmeric",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-179",
    "name": "Udaitha Kadalai",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-180",
    "name": "Ulundhu Paruppu",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-181",
    "name": "Urad Dal",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-182",
    "name": "Urulai Kilangu",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-183",
    "name": "Urulai Kizhangu (Potato)",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-184",
    "name": "Vada (prepared)",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-185",
    "name": "Vanaspati (Dalda)",
    "category": "Pulses, Nuts & Seeds",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-186",
    "name": "Vanilla Essence",
    "category": "Beverages & Cafe Ingredients",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-187",
    "name": "Vanilla Essense",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-188",
    "name": "Vathal",
    "category": "Spices, Condiments & Prepared Items",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-189",
    "name": "Vazhakkai (Raw Banana)",
    "category": "Vegetables & Fresh Produce",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-190",
    "name": "Vellam (Jaggery)",
    "category": "Oils, Sweeteners & Staples",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-191",
    "name": "Thengai Chutney (Coconut Chutney)",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-192",
    "name": "Vendhiyam",
    "category": "Groceries",
    "unit": "kg",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-193",
    "name": "Water",
    "category": "Caf\u00e9",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-194",
    "name": "Watermelon",
    "category": "Fruits",
    "unit": "L",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 5,
    "supplier": "Local Vendor"
  },
  {
    "id": "rm-195",
    "name": "Wooden Spoon",
    "category": "Consumables",
    "unit": "Nos.",
    "openingStock": 0,
    "stockIn": 0,
    "stockOut": 0,
    "costPerUnit": 0,
    "minThreshold": 20,
    "supplier": "Local Vendor"
  }
];

// Bill of Materials (BOM) with Standard Portions Pre-filled
export const CLIENT_BOM_MASTER = [
  {
    "productId": "prod-1",
    "productName": "Mini Podi Idli",
    "servingQty": 10,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Podi (Special Idly Milagai)",
        "rawMaterialId": "rm-123",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Idli (prepared)",
        "rawMaterialId": "rm-86",
        "qty": 10,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-2",
    "productName": "Mini Sambar Idli",
    "servingQty": 10,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Sambar (prepared)",
        "rawMaterialId": "rm-139",
        "qty": 150,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Idli (prepared)",
        "rawMaterialId": "rm-86",
        "qty": 10,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-3",
    "productName": "Kaima Idli",
    "servingQty": 15,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 30,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ginger Garlic Paste",
        "rawMaterialId": "rm-77",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Tomato",
        "rawMaterialId": "rm-168",
        "qty": 30,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Chilli Powder",
        "rawMaterialId": "rm-41",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Idli (prepared)",
        "rawMaterialId": "rm-86",
        "qty": 15,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Dhaniya (Coriander Seeds)",
        "rawMaterialId": "rm-60",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-4",
    "productName": "Sambar Vada",
    "servingQty": 1,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Vada (prepared)",
        "rawMaterialId": "rm-184",
        "qty": 1,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sambar (prepared)",
        "rawMaterialId": "rm-139",
        "qty": 150,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-5",
    "productName": "Idli Sambar Chutney",
    "servingQty": 2,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Idli (prepared)",
        "rawMaterialId": "rm-86",
        "qty": 2,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sambar (prepared)",
        "rawMaterialId": "rm-139",
        "qty": 150,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Thengai Chutney (Coconut Chutney)",
        "rawMaterialId": "rm-191",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-6",
    "productName": "Veg. Cheese Sandwich",
    "servingQty": 1,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Bread",
        "rawMaterialId": "rm-27",
        "qty": 2,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sandwich Chutney",
        "rawMaterialId": "rm-141",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Tomato",
        "rawMaterialId": "rm-168",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kudai Milagai (Capsicum)",
        "rawMaterialId": "rm-34",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Cucumber",
        "rawMaterialId": "rm-55",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Cheese",
        "rawMaterialId": "rm-39",
        "qty": 25,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Chaat Masala",
        "rawMaterialId": "rm-38",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-7",
    "productName": "Corn Cheese Sandwich",
    "servingQty": 1,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Bread",
        "rawMaterialId": "rm-27",
        "qty": 2,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sandwich Chutney",
        "rawMaterialId": "rm-141",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Corn",
        "rawMaterialId": "rm-53",
        "qty": 30,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Chaat Masala",
        "rawMaterialId": "rm-38",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Cheese",
        "rawMaterialId": "rm-39",
        "qty": 25,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-8",
    "productName": "Chilli Cheese Sandwich",
    "servingQty": 1,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Bread",
        "rawMaterialId": "rm-27",
        "qty": 2,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sandwich Chutney",
        "rawMaterialId": "rm-141",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Kudai Milagai (Capsicum)",
        "rawMaterialId": "rm-34",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Chaat Masala",
        "rawMaterialId": "rm-38",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Cheese",
        "rawMaterialId": "rm-39",
        "qty": 30,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-9",
    "productName": "Raw Banana Bajji",
    "servingQty": 2,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Vazhakkai (Raw Banana)",
        "rawMaterialId": "rm-189",
        "qty": 0.5,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Bajji Batter",
        "rawMaterialId": "rm-17",
        "qty": 40,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-10",
    "productName": "Bonda",
    "servingQty": 2,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 50,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Raw Rice",
        "rawMaterialId": "rm-128",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Milagu (Pepper)",
        "rawMaterialId": "rm-107",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-11",
    "productName": "Masal Vadai",
    "servingQty": 2,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Bengal Gram Dal (Chana Dal)",
        "rawMaterialId": "rm-19",
        "qty": 60,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ginger",
        "rawMaterialId": "rm-76",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Garlic",
        "rawMaterialId": "rm-74",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Fennel seeds",
        "rawMaterialId": "rm-67",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-12",
    "productName": "Samosa",
    "servingQty": 2,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Samosa Maavu",
        "rawMaterialId": "rm-51",
        "qty": 300,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 6,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Omam",
        "rawMaterialId": "rm-114",
        "qty": 0.125,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Vanaspati (Dalda)",
        "rawMaterialId": "rm-185",
        "qty": 35,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-13",
    "productName": "Kaara Kuzhi Paniyaram",
    "servingQty": 3,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Raw Rice",
        "rawMaterialId": "rm-128",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Boiled Broken Rice",
        "rawMaterialId": "rm-25",
        "qty": 40,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Bengal Gram Dal (Chana Dal)",
        "rawMaterialId": "rm-19",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Grated Coconut",
        "rawMaterialId": "rm-80",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-14",
    "productName": "Sweet Kuzhi Paniyaram",
    "servingQty": 4,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Raw Rice",
        "rawMaterialId": "rm-128",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Boiled Broken Rice",
        "rawMaterialId": "rm-25",
        "qty": 40,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Vellam (Jaggery)",
        "rawMaterialId": "rm-190",
        "qty": 30,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Elakkai (Cardamom)",
        "rawMaterialId": "rm-66",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Grated Coconut",
        "rawMaterialId": "rm-80",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-15",
    "productName": "Suiyam / Suzhiyam",
    "servingQty": 2,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Pacharisi",
        "rawMaterialId": "rm-118",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Vellam (Jaggery)",
        "rawMaterialId": "rm-190",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-16",
    "productName": "Sundal",
    "servingQty": 70,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Black Channa (Chickpeas)",
        "rawMaterialId": "rm-24",
        "qty": 60,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 5,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Sivappu Milagai (Red Chilli)",
        "rawMaterialId": "rm-131",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Grated Coconut",
        "rawMaterialId": "rm-80",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-17",
    "productName": "Rava Kesari",
    "servingQty": 70,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Rava",
        "rawMaterialId": "rm-127",
        "qty": 0.5,
        "uom": "Cup",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Nei (Ghee)",
        "rawMaterialId": "rm-75",
        "qty": 0.125,
        "uom": "Cup",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Mundhiri (Cashew Nuts)",
        "rawMaterialId": "rm-111",
        "qty": 1,
        "uom": "Cup",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 0.125,
        "uom": "Cup",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 1,
        "uom": "Cup",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 1.5,
        "uom": "Cup",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-18",
    "productName": "Vanilla Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Vanilla Essense",
        "rawMaterialId": "rm-187",
        "qty": 4,
        "uom": "Drops",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-19",
    "productName": "Apple Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Apple",
        "rawMaterialId": "rm-13",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 3,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-20",
    "productName": "Chocolate Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Chocolate Powder",
        "rawMaterialId": "rm-42",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-21",
    "productName": "Dates Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Dates",
        "rawMaterialId": "rm-59",
        "qty": 50,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sarkarai (Sugar)",
        "rawMaterialId": "rm-142",
        "qty": 1,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-22",
    "productName": "Strawberry Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Strawberry Essence",
        "rawMaterialId": "rm-152",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-23",
    "productName": "Mango Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Mango",
        "rawMaterialId": "rm-104",
        "qty": 120,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 3,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-24",
    "productName": "Butterfruit Milkshake",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Avocado",
        "rawMaterialId": "rm-16",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 3,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-25",
    "productName": "Idly Milagai Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-26",
    "productName": "Sesame Idly Milagai Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-27",
    "productName": "Horsegram Idly Milagai Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-28",
    "productName": "Flax Seed Idly Milagai Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-29",
    "productName": "Special Idly Milagai Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-30",
    "productName": "Curry Leaves Idly Milagai Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-31",
    "productName": "Paruppu Podi",
    "servingQty": 100,
    "servingUom": "g",
    "status": "AWAITING_RECIPE_DETAILS",
    "processes": [],
    "finalProcess": null
  },
  {
    "productId": "prod-32",
    "productName": "Seeraga Samba Vegetable Biriyani",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Mixed Spices",
        "rawMaterialId": "rm-110",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Mint leaves",
        "rawMaterialId": "rm-109",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Ginger Garlic Paste",
        "rawMaterialId": "rm-77",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Kallu Uppu (Rock Salt)",
        "rawMaterialId": "rm-99",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Tomato",
        "rawMaterialId": "rm-168",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Pachai Pattani (Green Peas)",
        "rawMaterialId": "rm-117",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Carrot",
        "rawMaterialId": "rm-36",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Beans",
        "rawMaterialId": "rm-18",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 12,
        "rawMaterialName": "Meal Maker (Soya Chunks)",
        "rawMaterialId": "rm-73",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 13,
        "rawMaterialName": "Curd",
        "rawMaterialId": "rm-56",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 14,
        "rawMaterialName": "Chilli Powder",
        "rawMaterialId": "rm-41",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 15,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 160,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 16,
        "rawMaterialName": "Seeraga Samba Rice",
        "rawMaterialId": "rm-144",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-33",
    "productName": "Seeraga Samba Mushroom Biriyani",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Mixed Spices",
        "rawMaterialId": "rm-110",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Mint leaves",
        "rawMaterialId": "rm-109",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Ginger Garlic Paste",
        "rawMaterialId": "rm-77",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Kallu Uppu (Rock Salt)",
        "rawMaterialId": "rm-99",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Tomato",
        "rawMaterialId": "rm-168",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Pachai Pattani (Green Peas)",
        "rawMaterialId": "rm-117",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Mushroom",
        "rawMaterialId": "rm-112",
        "qty": 50,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Curd",
        "rawMaterialId": "rm-56",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 12,
        "rawMaterialName": "Chilli Powder",
        "rawMaterialId": "rm-41",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 13,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 160,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 14,
        "rawMaterialName": "Seeraga Samba Rice",
        "rawMaterialId": "rm-144",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-34",
    "productName": "Curd Rice",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Raw Rice",
        "rawMaterialId": "rm-128",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Ginger",
        "rawMaterialId": "rm-76",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Curd",
        "rawMaterialId": "rm-56",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-35",
    "productName": "Tomato Rice",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Boiled Rice",
        "rawMaterialId": "rm-26",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Fennel seeds",
        "rawMaterialId": "rm-67",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Tomato",
        "rawMaterialId": "rm-168",
        "qty": 60,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Chilli Powder",
        "rawMaterialId": "rm-41",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 12,
        "rawMaterialName": "Garam masala",
        "rawMaterialId": "rm-72",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 13,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-36",
    "productName": "Lemon Rice",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Boiled Rice",
        "rawMaterialId": "rm-26",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Ginger",
        "rawMaterialId": "rm-76",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 0.5,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-37",
    "productName": "Carrot Rice",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Boiled Rice",
        "rawMaterialId": "rm-26",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Ginger Garlic Paste",
        "rawMaterialId": "rm-77",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Carrot",
        "rawMaterialId": "rm-36",
        "qty": 60,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-38",
    "productName": "Rose Milk",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 180,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Rose Syrup",
        "rawMaterialId": "rm-136",
        "qty": 30,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 2,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-39",
    "productName": "Cold Black Coffe",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 200,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Arabica Coffee Powder",
        "rawMaterialId": "rm-15",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-40",
    "productName": "Cold Coffee",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Filter- Cold Coffee",
        "rawMaterialId": "rm-70",
        "qty": 40,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 150,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-41",
    "productName": "Iced Tea",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Tea Powder",
        "rawMaterialId": "rm-161",
        "qty": 0.5,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 0.75,
        "uom": "Glass",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Sugar Syrup",
        "rawMaterialId": "rm-154",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 1,
        "uom": "Pinch",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 0.5,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-42",
    "productName": "Lemon Soda",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 1,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar Water",
        "rawMaterialId": "rm-155",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 1,
        "uom": "Pinch",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Iced Soda",
        "rawMaterialId": "rm-85",
        "qty": 300,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-43",
    "productName": "Kulukki Sarbath",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Sabje (Basil) Seeds",
        "rawMaterialId": "rm-137",
        "qty": 2,
        "uom": "Pinch",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 1,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar Syrup",
        "rawMaterialId": "rm-154",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 1,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 1,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Iced Soda",
        "rawMaterialId": "rm-85",
        "qty": 0,
        "uom": "",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Jaljeera Masala",
        "rawMaterialId": "rm-92",
        "qty": 1,
        "uom": "Pinch",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-44",
    "productName": "Sugar Water",
    "servingQty": 1,
    "servingUom": "l",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 1,
        "uom": "Kg",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 1,
        "uom": "Litre",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-45",
    "productName": "Tea",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Tea Powder",
        "rawMaterialId": "rm-161",
        "qty": 1,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-46",
    "productName": "Filter1",
    "servingQty": 500,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Arabica Coffee Beans",
        "rawMaterialId": "rm-14",
        "qty": 50,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Robusta Coffee Beans",
        "rawMaterialId": "rm-134",
        "qty": 40,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Chicory",
        "rawMaterialId": "rm-40",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-47",
    "productName": "Filter2",
    "servingQty": 500,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Arabica Coffee Beans",
        "rawMaterialId": "rm-14",
        "qty": 100,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-48",
    "productName": "Filter Coffee",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Filter- Filter Coffee",
        "rawMaterialId": "rm-69",
        "qty": 25,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-49",
    "productName": "Milk",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-50",
    "productName": "Sukku Malli Coffee",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Sukku Malli Powder",
        "rawMaterialId": "rm-157",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Nattu Sarkarai (Country Sugar)",
        "rawMaterialId": "rm-54",
        "qty": 1,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-51",
    "productName": "Hot Chocolate",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Milk",
        "rawMaterialId": "rm-108",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Chocolate Powder",
        "rawMaterialId": "rm-42",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice Cream",
        "rawMaterialId": "rm-84",
        "qty": 1,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-52",
    "productName": "Lemon Tea",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 120,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Tea Powder",
        "rawMaterialId": "rm-161",
        "qty": 0.5,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 0.5,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-53",
    "productName": "Black Coffee",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 110,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Filter- Black Coffee",
        "rawMaterialId": "rm-71",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "tsp.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-54",
    "productName": "Lemon Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 1,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-55",
    "productName": "Watermelon Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Watermelon",
        "rawMaterialId": "rm-194",
        "qty": 250,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-56",
    "productName": "Grape Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Grapes",
        "rawMaterialId": "rm-79",
        "qty": 1,
        "uom": "Kg",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 625,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Grape Essence",
        "rawMaterialId": "rm-78",
        "qty": 6,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "200 ml Juice Bottle",
        "rawMaterialId": "rm-1",
        "qty": 25,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-57",
    "productName": "Pineapple Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Pineapple",
        "rawMaterialId": "rm-122",
        "qty": 1,
        "uom": "Kg",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 375,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Jaffic Pineapple Essence",
        "rawMaterialId": "rm-91",
        "qty": 5,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "200 ml Juice Bottle",
        "rawMaterialId": "rm-1",
        "qty": 15,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-58",
    "productName": "Sweetlime Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Sweetlime",
        "rawMaterialId": "rm-159",
        "qty": 250,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-59",
    "productName": "Orange Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Orange",
        "rawMaterialId": "rm-116",
        "qty": 250,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-60",
    "productName": "Apple Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Apple",
        "rawMaterialId": "rm-13",
        "qty": 250,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 4,
        "uom": "tsp.",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-61",
    "productName": "Mango Juice (Flavour)",
    "servingQty": 16,
    "servingUom": "l",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Mango Tin",
        "rawMaterialId": "rm-105",
        "qty": 3,
        "uom": "l",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 2,
        "uom": "Kg",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Jaffic Mango Essence",
        "rawMaterialId": "rm-90",
        "qty": 20,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Juice Packets",
        "rawMaterialId": "rm-95",
        "qty": 80,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-62",
    "productName": "Mango Juice (Natural)",
    "servingQty": 5,
    "servingUom": "l",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Mango",
        "rawMaterialId": "rm-104",
        "qty": 1,
        "uom": "Kg",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 625,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "200 ml Juice Bottle",
        "rawMaterialId": "rm-1",
        "qty": 25,
        "uom": "Nos.",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-63",
    "productName": "Pomegranate Juice",
    "servingQty": 300,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Pomegranate",
        "rawMaterialId": "rm-124",
        "qty": 150,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Sugar Syrup",
        "rawMaterialId": "rm-154",
        "qty": 30,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ice",
        "rawMaterialId": "rm-83",
        "qty": 4,
        "uom": "Cubes",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-64",
    "productName": "Chutney-1",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 10,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Tomato",
        "rawMaterialId": "rm-168",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Green chilli",
        "rawMaterialId": "rm-81",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Dhaniya (Coriander Seeds)",
        "rawMaterialId": "rm-60",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Jeera (Cumin Seeds)",
        "rawMaterialId": "rm-94",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Bengal Gram Dal (Chana Dal)",
        "rawMaterialId": "rm-19",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-65",
    "productName": "Chutney-2",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Coconut",
        "rawMaterialId": "rm-48",
        "qty": 60,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Roasted chana dal",
        "rawMaterialId": "rm-132",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Green chilli",
        "rawMaterialId": "rm-81",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Garlic",
        "rawMaterialId": "rm-74",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-66",
    "productName": "Sandwich Chutney",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Dhaniya (Coriander Seeds)",
        "rawMaterialId": "rm-60",
        "qty": 30,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Green chilli",
        "rawMaterialId": "rm-81",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Sugar",
        "rawMaterialId": "rm-153",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Chaat Masala",
        "rawMaterialId": "rm-38",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Lemon",
        "rawMaterialId": "rm-101",
        "qty": 0.5,
        "uom": "Nos.",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Roasted chana dal",
        "rawMaterialId": "rm-132",
        "qty": 10,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Garlic",
        "rawMaterialId": "rm-74",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-67",
    "productName": "Bajji Batter",
    "servingQty": 100,
    "servingUom": "ml",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Kadalai Maavu (Bengal Gram Flour)",
        "rawMaterialId": "rm-20",
        "qty": 70,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Arisi Maavu (Rice Flour)",
        "rawMaterialId": "rm-130",
        "qty": 25,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Chilli Powder",
        "rawMaterialId": "rm-41",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Soda Maavu (Baking Soda)",
        "rawMaterialId": "rm-149",
        "qty": 0.5,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-68",
    "productName": "CurryLeaf Rice",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Boiled Rice",
        "rawMaterialId": "rm-26",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Ulundhu Paruppu",
        "rawMaterialId": "rm-180",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Tamarind ",
        "rawMaterialId": "rm-160",
        "qty": 5,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Sivappu Milagai (Red Chilli)",
        "rawMaterialId": "rm-131",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Milagu (Pepper)",
        "rawMaterialId": "rm-107",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 15,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-69",
    "productName": "Avarakai Rice",
    "servingQty": 300,
    "servingUom": "g",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Boiled Rice",
        "rawMaterialId": "rm-26",
        "qty": 80,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Ennai (Cooking Oil)",
        "rawMaterialId": "rm-50",
        "qty": 15,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Kadugu (Mustard Seeds)",
        "rawMaterialId": "rm-97",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Urad dal",
        "rawMaterialId": "rm-181",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Kadalai Paruppu (Gram Dal)",
        "rawMaterialId": "rm-96",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 6,
        "rawMaterialName": "Curry Leaves",
        "rawMaterialId": "rm-57",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 7,
        "rawMaterialName": "Onion",
        "rawMaterialId": "rm-115",
        "qty": 20,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 8,
        "rawMaterialName": "Green Chilli",
        "rawMaterialId": "rm-81",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 9,
        "rawMaterialName": "Ginger Garlic Paste",
        "rawMaterialId": "rm-77",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 10,
        "rawMaterialName": "Chilli Powder",
        "rawMaterialId": "rm-41",
        "qty": 2,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 11,
        "rawMaterialName": "Avarakai",
        "rawMaterialId": "rm-10",
        "qty": 60,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 12,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 50,
        "uom": "ml",
        "process": "Measure & Add"
      },
      {
        "step": 13,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 3,
        "uom": "g",
        "process": "Measure & Add"
      }
    ],
    "finalProcess": "Prepare as per recipe and serve"
  },
  {
    "productId": "prod-70",
    "productName": "Samosa Maavu",
    "servingQty": 1,
    "servingUom": "Nos.",
    "status": "COMPLETE",
    "processes": [
      {
        "step": 1,
        "rawMaterialName": "Maida Flour",
        "rawMaterialId": "rm-102",
        "qty": 300,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 2,
        "rawMaterialName": "Vanaspati (Dalda)",
        "rawMaterialId": "rm-185",
        "qty": 35,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 3,
        "rawMaterialName": "Omam",
        "rawMaterialId": "rm-114",
        "qty": 1,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 4,
        "rawMaterialName": "Uppu (Salt)",
        "rawMaterialId": "rm-138",
        "qty": 6,
        "uom": "g",
        "process": "Measure & Add"
      },
      {
        "step": 5,
        "rawMaterialName": "Water",
        "rawMaterialId": "rm-193",
        "qty": 100,
        "uom": "ml",
        "process": "Measure & Add"
      }
    ],
  },
  {
    "productId": "prod-71",
    "productName": "Daily Sambar",
    "servingQty": 20,
    "servingUom": "L",
    "status": "COMPLETE",
    "processes": [
      { "step": 1, "rawMaterialName": "Toor Dal", "rawMaterialId": "rm-170", "qty": 2000, "uom": "g", "process": "Boil" },
      { "step": 2, "rawMaterialName": "Tamarind", "rawMaterialId": "rm-160", "qty": 500, "uom": "g", "process": "Extract Juice" },
      { "step": 3, "rawMaterialName": "Tomato", "rawMaterialId": "rm-168", "qty": 1000, "uom": "g", "process": "Chop and Boil" },
      { "step": 4, "rawMaterialName": "Onion", "rawMaterialId": "rm-115", "qty": 1000, "uom": "g", "process": "Saute and Add" },
      { "step": 5, "rawMaterialName": "Chilli Powder", "rawMaterialId": "rm-41", "qty": 150, "uom": "g", "process": "Season" },
      { "step": 6, "rawMaterialName": "Turmeric", "rawMaterialId": "rm-178", "qty": 25, "uom": "g", "process": "Add" },
      { "step": 7, "rawMaterialName": "Kadugu (Mustard Seeds)", "rawMaterialId": "rm-97", "qty": 30, "uom": "g", "process": "Temper" },
      { "step": 8, "rawMaterialName": "Curry Leaves", "rawMaterialId": "rm-57", "qty": 50, "uom": "g", "process": "Temper" },
      { "step": 9, "rawMaterialName": "Uppu (Salt)", "rawMaterialId": "rm-138", "qty": 250, "uom": "g", "process": "Dissolve" }
    ],
    "finalProcess": "Simmer in bulk 20L pot and transfer to serving counter"
  },
  {
    "productId": "prod-72",
    "productName": "Daily Rasam",
    "servingQty": 15,
    "servingUom": "L",
    "status": "COMPLETE",
    "processes": [
      { "step": 1, "rawMaterialName": "Toor Dal", "rawMaterialId": "rm-170", "qty": 500, "uom": "g", "process": "Dal Water" },
      { "step": 2, "rawMaterialName": "Tamarind", "rawMaterialId": "rm-160", "qty": 400, "uom": "g", "process": "Extract Juice" },
      { "step": 3, "rawMaterialName": "Tomato", "rawMaterialId": "rm-168", "qty": 1000, "uom": "g", "process": "Crush and Boil" },
      { "step": 4, "rawMaterialName": "Kadugu (Mustard Seeds)", "rawMaterialId": "rm-97", "qty": 20, "uom": "g", "process": "Temper" },
      { "step": 5, "rawMaterialName": "Curry Leaves", "rawMaterialId": "rm-57", "qty": 30, "uom": "g", "process": "Temper" },
      { "step": 6, "rawMaterialName": "Turmeric", "rawMaterialId": "rm-178", "qty": 15, "uom": "g", "process": "Add" },
      { "step": 7, "rawMaterialName": "Uppu (Salt)", "rawMaterialId": "rm-138", "qty": 180, "uom": "g", "process": "Dissolve" },
      { "step": 8, "rawMaterialName": "Kothamalli (Coriander Leaves)", "rawMaterialId": "rm-52", "qty": 100, "uom": "g", "process": "Garnish" }
    ],
    "finalProcess": "Bring to light foam and transfer to serving counter"
  }
];

export const ORIGINAL_PRODUCT_IDS = new Set(CLIENT_PRODUCTS_MASTER.map(p => p.id));
export function isOriginalProduct(productId) {
  if (!productId) return false;
  return ORIGINAL_PRODUCT_IDS.has(productId);
}
