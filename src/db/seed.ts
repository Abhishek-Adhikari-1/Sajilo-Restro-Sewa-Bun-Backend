import { db } from "../config/db";
import { categories, menus } from "./index";

async function seed() {
  console.log("🌱 Starting menu & category seed...");

  try {
    // --- 1. Seed Categories ---
    console.log("Seeding menu categories...");

    const newCategories = await db
      .insert(categories)
      .values([
        {
          name: "Mo:Mo",
          description:
            "Nepal's favorite dumplings — steamed, fried, kothey, C and sadheko",
        },
        { name: "Chow Mein", description: "Stir-fried noodles" },
        { name: "Fried Rice", description: "Wok-tossed fried rice dishes" },
        { name: "Keema Noodles", description: "Minced meat noodles" },
        { name: "Thukpa", description: "Tibetan-style noodle soup" },
        { name: "Salad", description: "Fresh salads" },
        { name: "Soup", description: "Hot soups" },
        { name: "Pizza", description: "Wood-fired pizzas" },
        { name: "Breakfast", description: "Morning meal sets and à-la-carte" },
        {
          name: "Noodle Soups",
          description: "Korean and instant noodle soups",
        },
        { name: "Shawarma", description: "Rolled shawarma wraps" },
        { name: "Biryani", description: "Fragrant rice dishes" },
        { name: "Veg Snacks", description: "Vegetarian snacks and starters" },
        {
          name: "Non-Veg Snacks",
          description: "Meat-based snacks and starters",
        },
        { name: "Self BBQ", description: "Grill-your-own sekuwa platters" },
        { name: "Chop Suey", description: "American and Chinese chop suey" },
        { name: "Pasta", description: "Italian-style pasta dishes" },
        { name: "Burger", description: "Burgers with and without cheese" },
        { name: "Sizzler", description: "Sizzling hot plates" },
        { name: "Grill Items", description: "Grilled chicken and pork" },
        { name: "Coffee", description: "Espresso-based hot and iced coffee" },
        { name: "Blended Drinks", description: "Blended shakes and lassi" },
        { name: "Tea", description: "Hot teas and specialty sips" },
        { name: "Sweet Endings", description: "Ice cream and desserts" },
        {
          name: "Chilled Refreshments",
          description: "Iced teas, lemonades, sodas and cold drinks",
        },
        { name: "Hookah", description: "Flame & Puffs — hookah menu" },
        { name: "Cigarettes", description: "Cigarette brands" },
        { name: "Beer", description: "Bottled and canned beers" },
        {
          name: "Local Spirits",
          description: "Locally produced whiskey, rum, gin and vodka",
        },
        {
          name: "Imported Spirits",
          description: "Imported whiskey, rum, gin and vodka",
        },
        { name: "Liquor Shots", description: "Liqueur and tequila shots" },
        { name: "Wine", description: "Red, white and sparkling wines" },
      ])
      .returning();

    console.log(`✅ Seeded ${newCategories.length} categories.`);

    // Helper to find category id by name
    const cid = (name: string) => {
      const cat = newCategories.find((c) => c.name === name);
      if (!cat) throw new Error(`Category not found: ${name}`);
      return cat.id;
    };

    // --- 2. Seed Menu Items ---
    console.log("Seeding menu items...");

    const menuItems = [
      // ─────────────────────────────────────────────
      // MO:MO  (price in Rs.)
      // ─────────────────────────────────────────────
      // Veg
      {
        name: "Veg Steam Momo",
        description: "Steamed vegetable dumplings",
        price: 160,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Veg Fried Momo",
        description: "Fried vegetable dumplings",
        price: 170,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Veg Kothey Momo",
        description: "Half-fried juicy vegetable momo",
        price: 180,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Veg C Momo",
        description: "Chilli fried vegetable momo",
        price: 210,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Veg Sadheko Momo",
        description: "Spiced marinated vegetable momo",
        price: 200,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },

      // Chicken
      {
        name: "Chicken Steam Momo",
        description: "Steamed chicken dumplings",
        price: 180,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Chicken Fried Momo",
        description: "Fried chicken dumplings",
        price: 190,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Chicken Kothey Momo",
        description: "Half-fried juicy chicken momo",
        price: 200,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Chicken C Momo",
        description: "Chilli fried chicken momo",
        price: 240,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Chicken Sadheko Momo",
        description: "Spiced marinated chicken momo",
        price: 220,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },

      // Buff
      {
        name: "Buff Steam Momo",
        description: "Steamed buffalo dumplings",
        price: 170,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Buff Fried Momo",
        description: "Fried buffalo dumplings",
        price: 180,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Buff Kothey Momo",
        description: "Half-fried juicy buffalo momo",
        price: 190,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Buff C Momo",
        description: "Chilli fried buffalo momo",
        price: 230,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Buff Sadheko Momo",
        description: "Spiced marinated buffalo momo",
        price: 210,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },

      // Pork
      {
        name: "Pork Steam Momo",
        description: "Steamed pork dumplings",
        price: 230,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Pork Fried Momo",
        description: "Fried pork dumplings",
        price: 240,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Pork Kothey Momo",
        description: "Half-fried juicy pork momo",
        price: 260,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Pork C Momo",
        description: "Chilli fried pork momo",
        price: 270,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Pork Sadheko Momo",
        description: "Spiced marinated pork momo",
        price: 280,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 15,
      },

      // Mutton
      {
        name: "Mutton Steam Momo",
        description: "Steamed mutton dumplings",
        price: 300,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Mutton Fried Momo",
        description: "Fried mutton dumplings",
        price: 310,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Mutton Kothey Momo",
        description: "Half-fried juicy mutton momo",
        price: 320,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 22,
      },
      {
        name: "Mutton C Momo",
        description: "Chilli fried mutton momo",
        price: 330,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 22,
      },
      {
        name: "Mutton Sadheko Momo",
        description: "Spiced marinated mutton momo",
        price: 340,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 20,
      },

      // Platter
      {
        name: "Mo:Mo Platter",
        description: "Mixed platter — Steam, Fried, Kothey & C momo",
        price: 410,
        categoryId: cid("Mo:Mo"),
        estimatedPreparationTime: 25,
      },

      // ─────────────────────────────────────────────
      // CHOW MEIN
      // ─────────────────────────────────────────────
      {
        name: "Veg Chow Mein",
        description: "Stir-fried vegetable noodles",
        price: 150,
        categoryId: cid("Chow Mein"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Chow Mein",
        description: "Stir-fried chicken noodles",
        price: 180,
        categoryId: cid("Chow Mein"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Buff Chow Mein",
        description: "Stir-fried buffalo noodles",
        price: 170,
        categoryId: cid("Chow Mein"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Egg Chow Mein",
        description: "Stir-fried egg noodles",
        price: 160,
        categoryId: cid("Chow Mein"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Mixed Chow Mein",
        description: "Stir-fried mixed noodles",
        price: 250,
        categoryId: cid("Chow Mein"),
        estimatedPreparationTime: 15,
      },

      // ─────────────────────────────────────────────
      // FRIED RICE
      // ─────────────────────────────────────────────
      {
        name: "Veg Fried Rice",
        description: "Wok-tossed vegetable fried rice",
        price: 170,
        categoryId: cid("Fried Rice"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Fried Rice",
        description: "Wok-tossed chicken fried rice",
        price: 210,
        categoryId: cid("Fried Rice"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Buff Fried Rice",
        description: "Wok-tossed buffalo fried rice",
        price: 190,
        categoryId: cid("Fried Rice"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Egg Fried Rice",
        description: "Wok-tossed egg fried rice",
        price: 185,
        categoryId: cid("Fried Rice"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Mixed Fried Rice",
        description: "Wok-tossed mixed fried rice",
        price: 250,
        categoryId: cid("Fried Rice"),
        estimatedPreparationTime: 15,
      },

      // ─────────────────────────────────────────────
      // KEEMA NOODLES
      // ─────────────────────────────────────────────
      {
        name: "Chicken Keema Noodles",
        description: "Minced chicken noodles",
        price: 210,
        categoryId: cid("Keema Noodles"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Buff Keema Noodles",
        description: "Minced buffalo noodles",
        price: 200,
        categoryId: cid("Keema Noodles"),
        estimatedPreparationTime: 15,
      },

      // ─────────────────────────────────────────────
      // THUKPA
      // ─────────────────────────────────────────────
      {
        name: "Veg Thukpa",
        description: "Tibetan-style vegetable noodle soup",
        price: 150,
        categoryId: cid("Thukpa"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Chicken Thukpa",
        description: "Tibetan-style chicken noodle soup",
        price: 190,
        categoryId: cid("Thukpa"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Buff Thukpa",
        description: "Tibetan-style buffalo noodle soup",
        price: 170,
        categoryId: cid("Thukpa"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Mixed Thukpa",
        description: "Tibetan-style mixed noodle soup",
        price: 250,
        categoryId: cid("Thukpa"),
        estimatedPreparationTime: 18,
      },

      // ─────────────────────────────────────────────
      // SALAD
      // ─────────────────────────────────────────────
      {
        name: "Green Salad",
        description: "Fresh garden green salad",
        price: 150,
        categoryId: cid("Salad"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Nepali Salad",
        description: "Traditional Nepali salad",
        price: 200,
        categoryId: cid("Salad"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Mexican Salad",
        description: "Mexican-style salad",
        price: 180,
        categoryId: cid("Salad"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Fruit Salad",
        description: "Fresh seasonal fruit salad",
        price: 250,
        categoryId: cid("Salad"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Fruit Salad with Curd",
        description: "Fresh seasonal fruit salad with yogurt",
        price: 300,
        categoryId: cid("Salad"),
        estimatedPreparationTime: 5,
      },

      // ─────────────────────────────────────────────
      // SOUP
      // ─────────────────────────────────────────────
      {
        name: "Veg Soup",
        description: "Hot vegetable soup",
        price: 150,
        categoryId: cid("Soup"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Soup",
        description: "Hot chicken soup",
        price: 210,
        categoryId: cid("Soup"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Mushroom Soup",
        description: "Hot mushroom soup",
        price: 180,
        categoryId: cid("Soup"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Cream of Mushroom Soup",
        description: "Rich creamy mushroom soup",
        price: 200,
        categoryId: cid("Soup"),
        estimatedPreparationTime: 12,
      },

      // ─────────────────────────────────────────────
      // PIZZA
      // ─────────────────────────────────────────────
      {
        name: "Veg Pizza",
        description: "Wood-fired vegetable pizza",
        price: 390,
        categoryId: cid("Pizza"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Chicken Pizza",
        description: "Wood-fired chicken pizza",
        price: 500,
        categoryId: cid("Pizza"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Cheese Pizza",
        description: "Wood-fired cheese pizza",
        price: 500,
        categoryId: cid("Pizza"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Mushroom Pizza",
        description: "Wood-fired mushroom pizza",
        price: 450,
        categoryId: cid("Pizza"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Mixed Pizza",
        description: "Wood-fired mixed toppings pizza",
        price: 550,
        categoryId: cid("Pizza"),
        estimatedPreparationTime: 22,
      },

      // ─────────────────────────────────────────────
      // BREAKFAST
      // ─────────────────────────────────────────────
      {
        name: "Sunny Side Up Egg",
        description: "Classic sunny side up egg",
        price: 120,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Masala Omelette",
        description: "Spiced masala omelette",
        price: 120,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Plain Omelette",
        description: "Simple plain omelette",
        price: 100,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Boiled Egg Set",
        description: "Set of boiled eggs",
        price: 80,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Veg Sandwich",
        description: "Fresh vegetable sandwich",
        price: 150,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Club Sandwich",
        description: "Triple-decker club sandwich",
        price: 240,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Sandwich",
        description: "Grilled chicken sandwich",
        price: 210,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Cheese Sandwich",
        description: "Melted cheese sandwich",
        price: 180,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Egg Sandwich",
        description: "Egg-filled sandwich",
        price: 180,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Omelette Paratha",
        description: "Omelette served with paratha",
        price: 140,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Mixed Veg Boiled/Stir",
        description: "Boiled or stir-fried mixed vegetables",
        price: 230,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Pathway Special Breakfast Set",
        description: "Boiled egg, green salad, fruits, paratha & tea",
        price: 300,
        categoryId: cid("Breakfast"),
        estimatedPreparationTime: 15,
      },

      // ─────────────────────────────────────────────
      // NOODLE SOUPS
      // ─────────────────────────────────────────────
      {
        name: "Korean Noodles with Cheese",
        description: "Korean instant noodles topped with cheese",
        price: 250,
        categoryId: cid("Noodle Soups"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Wai Wai Noodles",
        description: "Classic Wai Wai instant noodles",
        price: 110,
        categoryId: cid("Noodle Soups"),
        estimatedPreparationTime: 8,
      },

      // ─────────────────────────────────────────────
      // SHAWARMA
      // ─────────────────────────────────────────────
      {
        name: "Shawarma",
        description: "Rolled shawarma wrap",
        price: 180,
        categoryId: cid("Shawarma"),
        estimatedPreparationTime: 10,
      },

      // ─────────────────────────────────────────────
      // BIRYANI
      // ─────────────────────────────────────────────
      {
        name: "Veg Biryani",
        description: "Fragrant vegetable biryani",
        price: 250,
        categoryId: cid("Biryani"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Chicken Biryani",
        description: "Fragrant chicken biryani",
        price: 350,
        categoryId: cid("Biryani"),
        estimatedPreparationTime: 25,
      },

      // ─────────────────────────────────────────────
      // VEG SNACKS
      // ─────────────────────────────────────────────
      {
        name: "French Fries",
        description: "Crispy golden potato fries",
        price: 160,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Veg Pakauda",
        description: "Crispy fried vegetable fritters",
        price: 180,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Potato Wedges",
        description: "Seasoned baked potato wedges",
        price: 150,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Sadheko Chowchow",
        description: "Spiced marinated Chowchow noodles",
        price: 180,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Sadheko Peanut",
        description: "Spiced marinated peanuts",
        price: 180,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Sadheko Bhatmas",
        description: "Spiced marinated soybeans",
        price: 180,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Sadheko Potato",
        description: "Spiced marinated potato",
        price: 180,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Mustang Aalu",
        description: "Spicy Mustang-style potatoes",
        price: 270,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Grilled Potato with Cheese",
        description: "Grilled potato topped with melted cheese",
        price: 250,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Paneer Pakauda",
        description: "Crispy fried paneer fritters",
        price: 230,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Dry Papad",
        description: "Plain dry papad",
        price: 80,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Fry Papad",
        description: "Crispy fried papad",
        price: 90,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Masala Papad",
        description: "Papad topped with masala",
        price: 110,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Chips Chilly",
        description: "Spicy chilli-tossed potato chips",
        price: 210,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Mushroom Chilly",
        description: "Spicy stir-fried mushroom",
        price: 230,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Paneer Chilly",
        description: "Spicy stir-fried paneer",
        price: 260,
        categoryId: cid("Veg Snacks"),
        estimatedPreparationTime: 12,
      },

      // ─────────────────────────────────────────────
      // NON-VEG SNACKS
      // ─────────────────────────────────────────────
      {
        name: "Chicken Chilly",
        description: "Spicy stir-fried chicken",
        price: 330,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Buff Chilly",
        description: "Spicy stir-fried buffalo",
        price: 350,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Pork Chilly",
        description: "Spicy stir-fried pork",
        price: 390,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Buffalo Wings (3 pcs)",
        description: "Crispy fried buffalo wings — 3 pieces",
        price: 340,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Drumstick (6 pcs)",
        description: "Fried chicken drumsticks — 6 pieces",
        price: 340,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Buff Sausage Per Plate (3 pcs)",
        description: "Grilled buffalo sausage — 3 pieces",
        price: 180,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Sausage Per Plate (3 pcs)",
        description: "Grilled chicken sausage — 3 pieces",
        price: 190,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Sadheko",
        description: "Spiced marinated chicken",
        price: 350,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Chicken Timur",
        description: "Sichuan pepper-spiced chicken",
        price: 320,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Cheesy Chicken Bomb",
        description: "Cheese-stuffed crispy chicken",
        price: 260,
        categoryId: cid("Non-Veg Snacks"),
        estimatedPreparationTime: 15,
      },

      // ─────────────────────────────────────────────
      // SELF BBQ
      // ─────────────────────────────────────────────
      {
        name: "Chicken Sekuwa Half Kg",
        description: "Self-grill chicken sekuwa — 500g",
        price: 600,
        categoryId: cid("Self BBQ"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Chicken Sekuwa Full Kg",
        description: "Self-grill chicken sekuwa — 1kg",
        price: 1100,
        categoryId: cid("Self BBQ"),
        estimatedPreparationTime: 30,
      },
      {
        name: "Pork Sekuwa Half Kg",
        description: "Self-grill pork sekuwa — 500g",
        price: 700,
        categoryId: cid("Self BBQ"),
        estimatedPreparationTime: 20,
      },
      {
        name: "Pork Sekuwa Full Kg",
        description: "Self-grill pork sekuwa — 1kg",
        price: 1290,
        categoryId: cid("Self BBQ"),
        estimatedPreparationTime: 30,
      },

      // ─────────────────────────────────────────────
      // CHOP SUEY
      // ─────────────────────────────────────────────
      {
        name: "American Chop Suey",
        description: "Crispy noodles with sweet & sour sauce",
        price: 290,
        categoryId: cid("Chop Suey"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Chinese Chop Suey",
        description: "Soft noodles in Chinese sauce",
        price: 260,
        categoryId: cid("Chop Suey"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Veg Chop Suey",
        description: "Vegetable chop suey",
        price: 190,
        categoryId: cid("Chop Suey"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Chicken Timur Chop Suey",
        description: "Sichuan pepper chicken chop suey",
        price: 300,
        categoryId: cid("Chop Suey"),
        estimatedPreparationTime: 18,
      },

      // ─────────────────────────────────────────────
      // PASTA
      // ─────────────────────────────────────────────
      {
        name: "Veg Pasta",
        description: "Italian-style vegetable pasta",
        price: 250,
        categoryId: cid("Pasta"),
        estimatedPreparationTime: 15,
      },
      {
        name: "Chicken Pasta",
        description: "Italian-style chicken pasta",
        price: 340,
        categoryId: cid("Pasta"),
        estimatedPreparationTime: 18,
      },
      {
        name: "Mushroom Pasta",
        description: "Italian-style mushroom pasta",
        price: 280,
        categoryId: cid("Pasta"),
        estimatedPreparationTime: 15,
      },

      // ─────────────────────────────────────────────
      // BURGER
      // ─────────────────────────────────────────────
      {
        name: "Veg Burger",
        description: "Classic vegetable burger",
        price: 180,
        categoryId: cid("Burger"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Veg Burger with Extra Cheese",
        description: "Vegetable burger with extra cheese",
        price: 200,
        categoryId: cid("Burger"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Burger",
        description: "Grilled chicken burger",
        price: 210,
        categoryId: cid("Burger"),
        estimatedPreparationTime: 12,
      },
      {
        name: "Chicken Burger with Extra Cheese",
        description: "Grilled chicken burger with extra cheese",
        price: 230,
        categoryId: cid("Burger"),
        estimatedPreparationTime: 12,
      },

      // ─────────────────────────────────────────────
      // SIZZLER
      // ─────────────────────────────────────────────
      {
        name: "Chicken Sizzler",
        description: "Sizzling hot chicken platter",
        price: 540,
        categoryId: cid("Sizzler"),
        estimatedPreparationTime: 25,
      },

      // ─────────────────────────────────────────────
      // GRILL ITEMS
      // ─────────────────────────────────────────────
      {
        name: "Half Chicken Grill",
        description: "Grilled half chicken",
        price: 510,
        categoryId: cid("Grill Items"),
        estimatedPreparationTime: 25,
      },
      {
        name: "Flame Kissed Pork",
        description: "Flame-grilled pork",
        price: 585,
        categoryId: cid("Grill Items"),
        estimatedPreparationTime: 25,
      },

      // ─────────────────────────────────────────────
      // COFFEE — Espresso Based & Iced
      // ─────────────────────────────────────────────
      {
        name: "Espresso",
        description: "Single shot espresso",
        price: 90,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Espresso Macchiato",
        description: "Espresso with a dash of milk foam",
        price: 150,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Doppio",
        description: "Double shot espresso",
        price: 120,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Americano",
        description: "Espresso with hot water",
        price: 140,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Café Lungo",
        description: "Long black espresso",
        price: 120,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Cappuccino",
        description: "Espresso with steamed milk foam",
        price: 180,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Café Latte",
        description: "Espresso with steamed milk",
        price: 200,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Honey Latte",
        description: "Latte sweetened with honey",
        price: 230,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Caramel Latte",
        description: "Latte with caramel syrup",
        price: 270,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Flat White",
        description: "Espresso with velvety steamed milk",
        price: 200,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      // Iced
      {
        name: "Iced Latte",
        description: "Chilled espresso latte over ice",
        price: 240,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Iced Cappuccino",
        description: "Chilled cappuccino over ice",
        price: 220,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Iced Mocha",
        description: "Chilled mocha over ice",
        price: 280,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Iced Americano",
        description: "Chilled Americano over ice",
        price: 170,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Iced Caramel Macchiato",
        description: "Chilled caramel macchiato over ice",
        price: 280,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      // Try something different
      {
        name: "Espresso on the Rock",
        description: "Espresso served over ice",
        price: 120,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Affogato",
        description: "Espresso poured over ice cream",
        price: 200,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Piccolo",
        description: "Small latte in a short glass",
        price: 160,
        categoryId: cid("Coffee"),
        estimatedPreparationTime: 5,
      },

      // ─────────────────────────────────────────────
      // BLENDED DRINKS
      // ─────────────────────────────────────────────
      {
        name: "Blended Caramel Macchiato",
        description: "Blended iced caramel macchiato",
        price: 250,
        categoryId: cid("Blended Drinks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Blended Mocha",
        description: "Blended iced mocha",
        price: 280,
        categoryId: cid("Blended Drinks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Blended Ice Cream Shake",
        description: "Creamy blended ice cream shake",
        price: 280,
        categoryId: cid("Blended Drinks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Oreo Cookies Shake",
        description: "Blended Oreo cookie milkshake",
        price: 300,
        categoryId: cid("Blended Drinks"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Blended Seasonal Lassi",
        description: "Blended yogurt lassi with seasonal fruit",
        price: 170,
        categoryId: cid("Blended Drinks"),
        estimatedPreparationTime: 5,
      },

      // ─────────────────────────────────────────────
      // TEA
      // ─────────────────────────────────────────────
      {
        name: "Black Tea",
        description: "Classic brewed black tea",
        price: 25,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Black Tea with Mint",
        description: "Black tea with fresh mint",
        price: 40,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Lemon Tea",
        description: "Tea with fresh lemon",
        price: 40,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Milk Tea",
        description: "Traditional Nepali chiya",
        price: 50,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Matka Masala Tea",
        description: "Spiced masala tea in a clay pot",
        price: 70,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 8,
      },
      {
        name: "Hot Lemon",
        description: "Hot lemon water",
        price: 60,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Hot Lemon with Honey",
        description: "Hot lemon with honey",
        price: 120,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Hot Chocolate",
        description: "Rich and creamy hot chocolate",
        price: 210,
        categoryId: cid("Tea"),
        estimatedPreparationTime: 5,
      },

      // ─────────────────────────────────────────────
      // SWEET ENDINGS
      // ─────────────────────────────────────────────
      {
        name: "Ice Cream",
        description: "Scooped ice cream",
        price: 120,
        categoryId: cid("Sweet Endings"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Juju Dhau",
        description: "Traditional Bhaktapur king curd",
        price: 90,
        categoryId: cid("Sweet Endings"),
        estimatedPreparationTime: 2,
      },

      // ─────────────────────────────────────────────
      // CHILLED REFRESHMENTS
      // ─────────────────────────────────────────────
      // Iced Teas
      {
        name: "Iced Tea",
        description: "Classic chilled iced tea",
        price: 120,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Lemon Iced Tea",
        description: "Chilled iced tea with lemon",
        price: 160,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Peach Iced Tea",
        description: "Chilled peach iced tea",
        price: 220,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Apple Iced Tea",
        description: "Chilled apple iced tea",
        price: 220,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      // Lemon & Mint
      {
        name: "Lemon Soda",
        description: "Fresh lemon soda",
        price: 150,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Blended Lemonade",
        description: "Freshly blended lemonade",
        price: 170,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Blended Mint Lemonade",
        description: "Freshly blended mint lemonade",
        price: 190,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      {
        name: "Virgin Mojito",
        description: "Alcohol-free mojito with mint and lime",
        price: 250,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },
      // Cold Drinks
      {
        name: "Coke",
        description: "Coca-Cola bottle",
        price: 75,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Fanta",
        description: "Fanta orange bottle",
        price: 75,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Sprite",
        description: "Sprite bottle",
        price: 75,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Sandheko Coke",
        description: "Spiced Coke with masala",
        price: 110,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Sandheko Sprite",
        description: "Spiced Sprite with masala",
        price: 110,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Lemon Sprite",
        description: "Sprite with fresh lemon",
        price: 100,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 3,
      },
      {
        name: "Fresh Seasonal Juice",
        description: "Freshly squeezed seasonal fruit juice",
        price: 190,
        categoryId: cid("Chilled Refreshments"),
        estimatedPreparationTime: 5,
      },

      // ─────────────────────────────────────────────
      // HOOKAH
      // ─────────────────────────────────────────────
      {
        name: "Normal Hookah",
        description: "Standard hookah — choice of flavour",
        price: 300,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Cloud Hookah",
        description: "Cloud hookah — choice of flavour",
        price: 430,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Premium Cloud Hookah",
        description: "Premium cloud hookah with premium flavours",
        price: 510,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Milk-Base Hookah",
        description: "Milk-based hookah",
        price: 480,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 10,
      },
      {
        name: "RedBull Base Hookah",
        description: "RedBull-based hookah",
        price: 590,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Pathway Special Hookah",
        description: "Signature Pathway hookah experience",
        price: 700,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 10,
      },
      {
        name: "Extra Coil — Normal",
        description: "Normal replacement coil",
        price: 30,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Extra Coil — Coconut",
        description: "Coconut replacement coil",
        price: 50,
        categoryId: cid("Hookah"),
        estimatedPreparationTime: 2,
      },

      // ─────────────────────────────────────────────
      // CIGARETTES
      // ─────────────────────────────────────────────
      {
        name: "Shikhar Ice",
        description: "Shikhar Ice cigarette",
        price: 20,
        categoryId: cid("Cigarettes"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Surya Red",
        description: "Surya Red cigarette",
        price: 30,
        categoryId: cid("Cigarettes"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Surya Light",
        description: "Surya Light cigarette",
        price: 30,
        categoryId: cid("Cigarettes"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Surya Arctic",
        description: "Surya Arctic cigarette",
        price: 30,
        categoryId: cid("Cigarettes"),
        estimatedPreparationTime: 1,
      },
      {
        name: "DJarum Black",
        description: "DJarum Black clove cigarette",
        price: 35,
        categoryId: cid("Cigarettes"),
        estimatedPreparationTime: 1,
      },
      {
        name: "Esse",
        description: "Esse slim cigarette",
        price: 35,
        categoryId: cid("Cigarettes"),
        estimatedPreparationTime: 1,
      },

      // ─────────────────────────────────────────────
      // BEER
      // ─────────────────────────────────────────────
      {
        name: "Tuborg Beer 650ml",
        description: "Tuborg lager — 650ml bottle",
        price: 530,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Gorkha Strong 650ml",
        description: "Gorkha Strong — 650ml bottle",
        price: 490,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Gorkha Strong 330ml",
        description: "Gorkha Strong — 330ml can",
        price: 240,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Barahsinghe 650ml",
        description: "Barahsinghe lager — 650ml bottle",
        price: 510,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Barahsinghe 330ml",
        description: "Barahsinghe lager — 330ml can",
        price: 250,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Budweiser 650ml",
        description: "Budweiser — 650ml bottle",
        price: 550,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Budweiser 330ml",
        description: "Budweiser — 330ml can",
        price: 350,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Arna 650ml",
        description: "Arna lager — 650ml bottle",
        price: 490,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Arna 330ml",
        description: "Arna lager — 330ml can",
        price: 230,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Somersby Apple Cider 250ml",
        description: "Somersby Apple Cider — 250ml",
        price: 280,
        categoryId: cid("Beer"),
        estimatedPreparationTime: 2,
      },

      // ─────────────────────────────────────────────
      // LOCAL SPIRITS — Whiskey
      // ─────────────────────────────────────────────
      {
        name: "Old Durbar Whiskey 60ml",
        description: "Old Durbar whiskey — 60ml peg",
        price: 360,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Old Durbar Whiskey Half (370ml)",
        description: "Old Durbar whiskey — half bottle 370ml",
        price: 2100,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Old Durbar Whiskey Full (750ml)",
        description: "Old Durbar whiskey — full bottle 750ml",
        price: 3900,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Black Chimney Whiskey 60ml",
        description: "Black Chimney whiskey — 60ml peg",
        price: 440,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Black Chimney Whiskey Half (370ml)",
        description: "Black Chimney whiskey — half bottle 370ml",
        price: 2400,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Black Chimney Whiskey Full (750ml)",
        description: "Black Chimney whiskey — full bottle 750ml",
        price: 4600,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Gurkhas & Guns Whiskey 60ml",
        description: "Gurkhas & Guns whiskey — 60ml peg",
        price: 390,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Gurkhas & Guns Whiskey Half (370ml)",
        description: "Gurkhas & Guns whiskey — half bottle 370ml",
        price: 2200,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Gurkhas & Guns Whiskey Full (750ml)",
        description: "Gurkhas & Guns whiskey — full bottle 750ml",
        price: 4200,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Golden Oak Whiskey 60ml",
        description: "Golden Oak whiskey — 60ml peg",
        price: 180,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Golden Oak Whiskey Half (370ml)",
        description: "Golden Oak whiskey — half bottle 370ml",
        price: 970,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Golden Oak Whiskey Full (750ml)",
        description: "Golden Oak whiskey — full bottle 750ml",
        price: 1700,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Kala Patthar Whiskey 60ml",
        description: "Kala Patthar whiskey — 60ml peg",
        price: 360,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Kala Patthar Whiskey Half (370ml)",
        description: "Kala Patthar whiskey — half bottle 370ml",
        price: 2050,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Kala Patthar Whiskey Full (750ml)",
        description: "Kala Patthar whiskey — full bottle 750ml",
        price: 3900,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Storm Whiskey 60ml",
        description: "Storm whiskey — 60ml peg",
        price: 150,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Storm Whiskey Half (370ml)",
        description: "Storm whiskey — half bottle 370ml",
        price: 850,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Storm Whiskey Full (750ml)",
        description: "Storm whiskey — full bottle 750ml",
        price: 1650,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "E-Vate Whiskey 60ml",
        description: "E-Vate whiskey — 60ml peg",
        price: 160,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "E-Vate Whiskey Half (370ml)",
        description: "E-Vate whiskey — half bottle 370ml",
        price: 860,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "E-Vate Whiskey Full (750ml)",
        description: "E-Vate whiskey — full bottle 750ml",
        price: 1680,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      // Local Spirits — Rum
      {
        name: "Khukuri White Rum 60ml",
        description: "Khukuri White rum — 60ml peg",
        price: 330,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Khukuri White Rum Half (370ml)",
        description: "Khukuri White rum — half bottle 370ml",
        price: 2350,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Khukuri White Rum Full (750ml)",
        description: "Khukuri White rum — full bottle 750ml",
        price: 4500,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Khukuri Spice Rum 60ml",
        description: "Khukuri Spice rum — 60ml peg",
        price: 330,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Khukuri Spice Rum Half (370ml)",
        description: "Khukuri Spice rum — half bottle 370ml",
        price: 2300,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Khukuri Spice Rum Full (750ml)",
        description: "Khukuri Spice rum — full bottle 750ml",
        price: 4400,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Khukuri XXX Rum 60ml",
        description: "Khukuri XXX rum — 60ml peg",
        price: 290,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Khukuri XXX Rum Half (370ml)",
        description: "Khukuri XXX rum — half bottle 370ml",
        price: 1750,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Khukuri XXX Rum Full (750ml)",
        description: "Khukuri XXX rum — full bottle 750ml",
        price: 3400,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Mount Manaslu XXX Rum 60ml",
        description: "Mount Manaslu XXX rum — 60ml peg",
        price: 150,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Mount Manaslu XXX Rum Half (370ml)",
        description: "Mount Manaslu XXX rum — half bottle 370ml",
        price: 850,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Mount Manaslu XXX Rum Full (750ml)",
        description: "Mount Manaslu XXX rum — full bottle 750ml",
        price: 1650,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      // Local Spirits — Gin
      {
        name: "Snowman Gin 60ml",
        description: "Snowman gin — 60ml peg",
        price: 330,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Snowman Gin Half (370ml)",
        description: "Snowman gin — half bottle 370ml",
        price: 2350,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Snowman Gin Full (750ml)",
        description: "Snowman gin — full bottle 750ml",
        price: 4400,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Oliz Extra Dry Gin 60ml",
        description: "Oliz Extra Dry gin — 60ml peg",
        price: 150,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Oliz Extra Dry Gin Half (370ml)",
        description: "Oliz Extra Dry gin — half bottle 370ml",
        price: 850,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Oliz Extra Dry Gin Full (750ml)",
        description: "Oliz Extra Dry gin — full bottle 750ml",
        price: 1650,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      // Local Spirits — Vodka
      {
        name: "8848 Vodka 60ml",
        description: "8848 vodka — 60ml peg",
        price: 300,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "8848 Vodka Half (370ml)",
        description: "8848 vodka — half bottle 370ml",
        price: 1800,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "8848 Vodka Full (750ml)",
        description: "8848 vodka — full bottle 750ml",
        price: 3500,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Ruslan Vodka 60ml",
        description: "Ruslan vodka — 60ml peg",
        price: 300,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Ruslan Vodka Half (370ml)",
        description: "Ruslan vodka — half bottle 370ml",
        price: 1800,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Ruslan Vodka Full (750ml)",
        description: "Ruslan vodka — full bottle 750ml",
        price: 3500,
        categoryId: cid("Local Spirits"),
        estimatedPreparationTime: 2,
      },

      // ─────────────────────────────────────────────
      // IMPORTED SPIRITS — Whiskey
      // ─────────────────────────────────────────────
      {
        name: "Jameson Irish Whiskey 60ml",
        description: "Jameson Irish whiskey — 60ml peg",
        price: 665,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jameson Irish Whiskey Half (375ml)",
        description: "Jameson Irish whiskey — half bottle 375ml",
        price: 4650,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jameson Irish Whiskey Full (750ml)",
        description: "Jameson Irish whiskey — full bottle 750ml",
        price: 8900,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Jim Beam Whiskey 60ml",
        description: "Jim Beam bourbon — 60ml peg",
        price: 630,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jim Beam Whiskey Half (375ml)",
        description: "Jim Beam bourbon — half bottle 375ml",
        price: 3800,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jim Beam Whiskey Full (750ml)",
        description: "Jim Beam bourbon — full bottle 750ml",
        price: 6850,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Jack Daniels 60ml",
        description: "Jack Daniels Tennessee whiskey — 60ml peg",
        price: 650,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jack Daniels Half (375ml)",
        description: "Jack Daniels Tennessee whiskey — half bottle 375ml",
        price: 4200,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jack Daniels Full (750ml)",
        description: "Jack Daniels Tennessee whiskey — full bottle 750ml",
        price: 8950,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "JW Red Label 60ml",
        description: "Johnnie Walker Red Label — 60ml peg",
        price: 750,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "JW Red Label Half (375ml)",
        description: "Johnnie Walker Red Label — half bottle 375ml",
        price: 4950,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "JW Red Label Full (750ml)",
        description: "Johnnie Walker Red Label — full bottle 750ml",
        price: 8950,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "JW Black Label 60ml",
        description: "Johnnie Walker Black Label — 60ml peg",
        price: 600,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "JW Black Label Half (375ml)",
        description: "Johnnie Walker Black Label — half bottle 375ml",
        price: 3600,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "JW Black Label Full (750ml)",
        description: "Johnnie Walker Black Label — full bottle 750ml",
        price: 6900,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Famous Grouse 60ml",
        description: "Famous Grouse Scotch whisky — 60ml peg",
        price: 750,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Famous Grouse Half (375ml)",
        description: "Famous Grouse Scotch whisky — half bottle 375ml",
        price: 5850,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Famous Grouse Full (750ml)",
        description: "Famous Grouse Scotch whisky — full bottle 750ml",
        price: 8900,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Chivas Regal 60ml",
        description: "Chivas Regal Scotch whisky — 60ml peg",
        price: 600,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Chivas Regal Half (375ml)",
        description: "Chivas Regal Scotch whisky — half bottle 375ml",
        price: 3450,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Chivas Regal Full (750ml)",
        description: "Chivas Regal Scotch whisky — full bottle 750ml",
        price: 6750,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      // Imported Spirits — Gin
      {
        name: "Beefeater Gin 60ml",
        description: "Beefeater London Dry Gin — 60ml peg",
        price: 650,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Beefeater Gin Half (375ml)",
        description: "Beefeater London Dry Gin — half bottle 375ml",
        price: 3850,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Beefeater Gin Full (750ml)",
        description: "Beefeater London Dry Gin — full bottle 750ml",
        price: 7500,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "London Hill Gin 60ml",
        description: "London Hill gin — 60ml peg",
        price: 630,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "London Hill Gin Half (375ml)",
        description: "London Hill gin — half bottle 375ml",
        price: 3750,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "London Hill Gin Full (750ml)",
        description: "London Hill gin — full bottle 750ml",
        price: 6900,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      // Imported Spirits — Rum
      {
        name: "Malibu Rum 60ml",
        description: "Malibu coconut rum — 60ml peg",
        price: 700,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Malibu Rum Half (375ml)",
        description: "Malibu coconut rum — half bottle 375ml",
        price: 4500,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Malibu Rum Full (750ml)",
        description: "Malibu coconut rum — full bottle 750ml",
        price: 8500,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Bacardi Carta 60ml",
        description: "Bacardi Carta Blanca rum — 60ml peg",
        price: 890,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Bacardi Carta Half (375ml)",
        description: "Bacardi Carta Blanca rum — half bottle 375ml",
        price: 5400,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Bacardi Carta Full (750ml)",
        description: "Bacardi Carta Blanca rum — full bottle 750ml",
        price: 10200,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      // Imported Spirits — Vodka
      {
        name: "Absolut Vodka 60ml",
        description: "Absolut vodka — 60ml peg",
        price: 650,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Absolut Vodka Half (375ml)",
        description: "Absolut vodka — half bottle 375ml",
        price: 3850,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Absolut Vodka Full (750ml)",
        description: "Absolut vodka — full bottle 750ml",
        price: 7550,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      {
        name: "Ketel One Vodka 60ml",
        description: "Ketel One vodka — 60ml peg",
        price: 850,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Ketel One Vodka Half (375ml)",
        description: "Ketel One vodka — half bottle 375ml",
        price: 5800,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Ketel One Vodka Full (750ml)",
        description: "Ketel One vodka — full bottle 750ml",
        price: 10200,
        categoryId: cid("Imported Spirits"),
        estimatedPreparationTime: 2,
      },

      // ─────────────────────────────────────────────
      // LIQUOR SHOTS
      // ─────────────────────────────────────────────
      {
        name: "Baileys Shot",
        description: "Baileys Irish Cream shot",
        price: 625,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jagermeister Shot",
        description: "Jagermeister herbal liqueur shot",
        price: 640,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Kahlua Shot",
        description: "Kahlua coffee liqueur shot",
        price: 650,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Triple Sec Shot",
        description: "Triple Sec orange liqueur shot",
        price: 670,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Aperol Shot",
        description: "Aperol aperitivo shot",
        price: 680,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      // Tequila
      {
        name: "Agavita Gold Tequila Shot",
        description: "Agavita Gold tequila shot",
        price: 310,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Camino Real Gold Tequila Shot",
        description: "Camino Real Gold tequila shot",
        price: 325,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Olmeca Tequila Gold Shot",
        description: "Olmeca Gold tequila shot",
        price: 340,
        categoryId: cid("Liquor Shots"),
        estimatedPreparationTime: 2,
      },

      // ─────────────────────────────────────────────
      // WINE — Red
      // ─────────────────────────────────────────────
      {
        name: "Akira Sweet Red Wine (Glass)",
        description: "Akira Sweet red wine — glass",
        price: 280,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Akira Sweet Red Wine (Bottle)",
        description: "Akira Sweet red wine — bottle",
        price: 1320,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "BigMaster Sweet Red Wine (Glass)",
        description: "BigMaster Sweet red wine — glass",
        price: 270,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "BigMaster Sweet Red Wine (Bottle)",
        description: "BigMaster Sweet red wine — bottle",
        price: 1310,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "SubMarine Red Wine (Glass)",
        description: "SubMarine red wine — glass",
        price: 290,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "SubMarine Red Wine (Bottle)",
        description: "SubMarine red wine — bottle",
        price: 1400,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Canvas Sweet Red Wine (Glass)",
        description: "Canvas Sweet red wine — glass",
        price: 290,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Canvas Sweet Red Wine (Bottle)",
        description: "Canvas Sweet red wine — bottle",
        price: 1400,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Divine Red Wine (Glass)",
        description: "Divine red wine — glass",
        price: 250,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Divine Red Wine (Bottle)",
        description: "Divine red wine — bottle",
        price: 1200,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },

      // Wine — White
      {
        name: "Pataleban White Ashish (Glass)",
        description: "Pataleban White Ashish wine — glass",
        price: 320,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Pataleban White Ashish (Bottle)",
        description: "Pataleban White Ashish wine — bottle",
        price: 1480,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Manang Valley Premium (Glass)",
        description: "Manang Valley Premium white wine — glass",
        price: 310,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Manang Valley Premium (Bottle)",
        description: "Manang Valley Premium white wine — bottle",
        price: 1450,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "2 Share Natural White Wine (Glass)",
        description: "2 Share Natural white wine — glass",
        price: 470,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "2 Share Natural White Wine (Bottle)",
        description: "2 Share Natural white wine — bottle",
        price: 2100,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Akira Sweet White Wine (Glass)",
        description: "Akira Sweet white wine — glass",
        price: 280,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Akira Sweet White Wine (Bottle)",
        description: "Akira Sweet white wine — bottle",
        price: 1350,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Bigmaster Sweet White Wine (Glass)",
        description: "Bigmaster Sweet white wine — glass",
        price: 270,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Bigmaster Sweet White Wine (Bottle)",
        description: "Bigmaster Sweet white wine — bottle",
        price: 1350,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Divine White Wine (Glass)",
        description: "Divine white wine — glass",
        price: 250,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Divine White Wine (Bottle)",
        description: "Divine white wine — bottle",
        price: 1200,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },

      // Wine — Sparkling
      {
        name: "Robertson Sweet White Sparkling (Glass)",
        description: "Robertson Sweet White Sparkling wine — glass",
        price: 490,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Robertson Sweet White Sparkling (Bottle)",
        description: "Robertson Sweet White Sparkling wine — bottle",
        price: 2380,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "JP Chenet Brut Sparkling (Glass)",
        description: "JP Chenet Brut Sparkling wine — glass",
        price: 580,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "JP Chenet Brut Sparkling (Bottle)",
        description: "JP Chenet Brut Sparkling wine — bottle",
        price: 2750,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jacob's Creek Sparkling Moscato (Glass)",
        description: "Jacob's Creek Sparkling Moscato — glass",
        price: 640,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
      {
        name: "Jacob's Creek Sparkling Moscato (Bottle)",
        description: "Jacob's Creek Sparkling Moscato — bottle",
        price: 2950,
        categoryId: cid("Wine"),
        estimatedPreparationTime: 2,
      },
    ];

    const newMenus = await db.insert(menus).values(menuItems).returning();

    console.log(`✅ Seeded ${newMenus.length} menu items.`);
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
