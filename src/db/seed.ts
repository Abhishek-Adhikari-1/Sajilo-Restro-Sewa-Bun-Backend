import { db } from "../config/db";
import { tables, categories, menus } from "./index";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // --- 1. Seed Tables ---
    console.log("Seeding restaurant tables...");

    const tableData = [
      ...Array.from({ length: 40 }, (_, i) => ({
        tableNumber: i + 1,
        section: "Indoor",
        capacity: [2, 4, 4, 6, 8][i % 5]!,
        status: "available" as const,
      })),

      ...Array.from({ length: 20 }, (_, i) => ({
        tableNumber: i + 41,
        section: "Outdoor",
        capacity: [2, 4, 6, 8][i % 4]!,
        status: "available" as const,
      })),

      ...Array.from({ length: 20 }, (_, i) => ({
        tableNumber: i + 61,
        section: "Rooftop",
        capacity: [2, 4, 6, 8][i % 4]!,
        status: "available" as const,
      })),
    ];

    const newTables = await db.insert(tables).values(tableData).returning();

    console.log(`✅ Seeded ${newTables.length} tables.`);

    // --- 2. Seed Categories ---
    console.log("Seeding menu categories...");
    const newCategories = await db
      .insert(categories)
      .values([
        {
          name: "Momo",
          description: "Nepal's favorite dumplings",
        },
        {
          name: "Khaja Set",
          description: "Traditional Nepali snacks and sets",
        },
        {
          name: "Dal Bhat",
          description: "Authentic Nepali meal sets",
        },
        {
          name: "Newari Specials",
          description: "Traditional Newari cuisine",
        },
        {
          name: "Curries",
          description: "Chicken, mutton and veg curries",
        },
        {
          name: "Rice & Noodles",
          description: "Rice dishes and noodles",
        },
        {
          name: "Starters",
          description: "Appetizers and snacks",
        },
        {
          name: "Beverages",
          description: "Hot and cold drinks",
        },
        {
          name: "Desserts",
          description: "Sweet dishes",
        },
      ])
      .returning();

    // --- 3. Seed Menus ---
    console.log("Seeding menu items...");
    const momoId = newCategories.find((c) => c.name === "Momo")!.id;
    const khajaId = newCategories.find((c) => c.name === "Khaja Set")!.id;
    const dalBhatId = newCategories.find((c) => c.name === "Dal Bhat")!.id;
    const newariId = newCategories.find(
      (c) => c.name === "Newari Specials",
    )!.id;
    const curriesId = newCategories.find((c) => c.name === "Curries")!.id;
    const riceId = newCategories.find((c) => c.name === "Rice & Noodles")!.id;
    const startersId = newCategories.find((c) => c.name === "Starters")!.id;
    const beveragesId = newCategories.find((c) => c.name === "Beverages")!.id;
    const dessertsId = newCategories.find((c) => c.name === "Desserts")!.id;

    const menuItems = [
      // MOMO
      {
        name: "Buff Momo",
        description: "Steamed buffalo dumplings",
        price: 18000,
        categoryId: momoId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Chicken Momo",
        description: "Steamed chicken dumplings",
        price: 20000,
        categoryId: momoId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Veg Momo",
        description: "Vegetable dumplings",
        price: 16000,
        categoryId: momoId,
        estimatedPreparationTime: 12,
      },
      {
        name: "Jhol Momo",
        description: "Momo served with spicy sesame soup",
        price: 23000,
        categoryId: momoId,
        estimatedPreparationTime: 18,
      },
      {
        name: "C Momo",
        description: "Chilli fried momo",
        price: 25000,
        categoryId: momoId,
        estimatedPreparationTime: 18,
      },
      {
        name: "Kothey Momo",
        description: "Half fried juicy momo",
        price: 24000,
        categoryId: momoId,
        estimatedPreparationTime: 18,
      },

      // KHAJA SET
      {
        name: "Buff Sekuwa Set",
        description: "Grilled buffalo meat with beaten rice",
        price: 45000,
        categoryId: khajaId,
        estimatedPreparationTime: 20,
      },
      {
        name: "Chicken Sekuwa Set",
        description: "Grilled chicken khaja set",
        price: 42000,
        categoryId: khajaId,
        estimatedPreparationTime: 20,
      },
      {
        name: "Choila Set",
        description: "Spicy Newari choila set",
        price: 40000,
        categoryId: khajaId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Sukuti Set",
        description: "Dry meat khaja set",
        price: 48000,
        categoryId: khajaId,
        estimatedPreparationTime: 20,
      },

      // DAL BHAT
      {
        name: "Veg Dal Bhat",
        description: "Traditional Nepali vegetarian meal",
        price: 35000,
        categoryId: dalBhatId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Chicken Dal Bhat",
        description: "Dal bhat with chicken curry",
        price: 45000,
        categoryId: dalBhatId,
        estimatedPreparationTime: 20,
      },
      {
        name: "Buff Dal Bhat",
        description: "Dal bhat with buffalo curry",
        price: 47000,
        categoryId: dalBhatId,
        estimatedPreparationTime: 20,
      },
      {
        name: "Mutton Dal Bhat",
        description: "Dal bhat with mutton curry",
        price: 65000,
        categoryId: dalBhatId,
        estimatedPreparationTime: 25,
      },

      // NEWARI
      {
        name: "Buff Choila",
        description: "Spicy grilled buffalo meat",
        price: 30000,
        categoryId: newariId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Chicken Choila",
        description: "Spicy grilled chicken",
        price: 28000,
        categoryId: newariId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Chatamari",
        description: "Traditional Newari rice crepe",
        price: 22000,
        categoryId: newariId,
        estimatedPreparationTime: 12,
      },
      {
        name: "Bara",
        description: "Lentil pancake",
        price: 18000,
        categoryId: newariId,
        estimatedPreparationTime: 10,
      },
      {
        name: "Sukuti",
        description: "Spiced dried meat",
        price: 32000,
        categoryId: newariId,
        estimatedPreparationTime: 12,
      },

      // CURRIES
      {
        name: "Chicken Curry",
        description: "Nepali style chicken curry",
        price: 35000,
        categoryId: curriesId,
        estimatedPreparationTime: 20,
      },
      {
        name: "Mutton Curry",
        description: "Slow cooked mutton curry",
        price: 55000,
        categoryId: curriesId,
        estimatedPreparationTime: 30,
      },
      {
        name: "Buff Curry",
        description: "Traditional buffalo curry",
        price: 45000,
        categoryId: curriesId,
        estimatedPreparationTime: 25,
      },
      {
        name: "Paneer Butter Masala",
        description: "Creamy paneer curry",
        price: 32000,
        categoryId: curriesId,
        estimatedPreparationTime: 18,
      },

      // RICE & NOODLES
      {
        name: "Chicken Chowmein",
        description: "Stir fried noodles",
        price: 25000,
        categoryId: riceId,
        estimatedPreparationTime: 12,
      },
      {
        name: "Buff Chowmein",
        description: "Buff stir fried noodles",
        price: 26000,
        categoryId: riceId,
        estimatedPreparationTime: 12,
      },
      {
        name: "Veg Chowmein",
        description: "Vegetable noodles",
        price: 20000,
        categoryId: riceId,
        estimatedPreparationTime: 10,
      },
      {
        name: "Chicken Fried Rice",
        description: "Nepali style fried rice",
        price: 26000,
        categoryId: riceId,
        estimatedPreparationTime: 12,
      },
      {
        name: "Buff Fried Rice",
        description: "Buff fried rice",
        price: 28000,
        categoryId: riceId,
        estimatedPreparationTime: 12,
      },
      {
        name: "Veg Fried Rice",
        description: "Vegetable fried rice",
        price: 22000,
        categoryId: riceId,
        estimatedPreparationTime: 10,
      },

      // STARTERS
      {
        name: "French Fries",
        description: "Crispy potato fries",
        price: 15000,
        categoryId: startersId,
        estimatedPreparationTime: 8,
      },
      {
        name: "Chicken Wings",
        description: "Spicy fried wings",
        price: 28000,
        categoryId: startersId,
        estimatedPreparationTime: 15,
      },
      {
        name: "Mushroom Chilli",
        description: "Spicy mushroom starter",
        price: 24000,
        categoryId: startersId,
        estimatedPreparationTime: 12,
      },

      // BEVERAGES
      {
        name: "Milk Tea",
        description: "Traditional Nepali chiya",
        price: 5000,
        categoryId: beveragesId,
        estimatedPreparationTime: 5,
      },
      {
        name: "Black Tea",
        description: "Fresh brewed tea",
        price: 4000,
        categoryId: beveragesId,
        estimatedPreparationTime: 5,
      },
      {
        name: "Lemon Tea",
        description: "Tea with lemon",
        price: 7000,
        categoryId: beveragesId,
        estimatedPreparationTime: 5,
      },
      {
        name: "Mango Lassi",
        description: "Sweet yogurt drink",
        price: 12000,
        categoryId: beveragesId,
        estimatedPreparationTime: 5,
      },
      {
        name: "Cold Coffee",
        description: "Chilled coffee",
        price: 15000,
        categoryId: beveragesId,
        estimatedPreparationTime: 5,
      },
      {
        name: "Fresh Lime Soda",
        description: "Refreshing lime drink",
        price: 10000,
        categoryId: beveragesId,
        estimatedPreparationTime: 3,
      },
      {
        name: "Mineral Water",
        description: "Bottle water",
        price: 3000,
        categoryId: beveragesId,
        estimatedPreparationTime: 1,
      },

      // DESSERTS
      {
        name: "Juju Dhau",
        description: "Traditional Bhaktapur king curd",
        price: 12000,
        categoryId: dessertsId,
        estimatedPreparationTime: 2,
      },
      {
        name: "Rasbari",
        description: "Sweet syrup soaked dessert",
        price: 10000,
        categoryId: dessertsId,
        estimatedPreparationTime: 2,
      },
      {
        name: "Gulab Jamun",
        description: "Soft milk dumplings",
        price: 12000,
        categoryId: dessertsId,
        estimatedPreparationTime: 2,
      },
      {
        name: "Kheer",
        description: "Rice pudding",
        price: 10000,
        categoryId: dessertsId,
        estimatedPreparationTime: 5,
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
