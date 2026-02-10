import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { connectMongo, getMongoDb, getNextId } from "./mongo";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import dotenv from "dotenv";

const scryptAsync = promisify(scrypt);

const KENYA_LOCATIONS_DATA_FILE = path.resolve(
  process.cwd(),
  "server",
  "data",
  "Kenya-Counties-SubCounties-and-Wards.json",
);

const KENYA_LOCATIONS_DATA_URL =
  "https://raw.githubusercontent.com/alvinchesaro/Kenya-Counties-SubCounties-and-Wards/main/Kenya-Counties-SubCounties-and-Wards.json";

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });
  await connectMongo();
  console.log("Seeding database...");

  // Check if admin exists
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    const password = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password,
      role: "admin",
      email: "admin@drgabriel.com",
      phone: "+254700000000",
      whatsappNumber: "254700000000",
      location: "Nairobi, Kenya"
    });
    console.log("Admin user created (admin / admin123)");
  }

  const settings = await storage.getSiteSettings();
  if (!settings) {
    await storage.upsertSiteSettings({
      defaultWhatsappNumber: "254700000000",
      showUrgentBanner: true,
    });
    console.log("Site settings seeded");
  }

  const existingCounties = await storage.getKenyaCounties();
  if (existingCounties.length === 0) {
    let raw: string;
    try {
      raw = await readFile(KENYA_LOCATIONS_DATA_FILE, "utf-8");
    } catch {
      const res = await fetch(KENYA_LOCATIONS_DATA_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch Kenya locations data: ${res.status}`);
      }
      raw = await res.text();
      await mkdir(path.dirname(KENYA_LOCATIONS_DATA_FILE), { recursive: true });
      await writeFile(KENYA_LOCATIONS_DATA_FILE, raw, "utf-8");
    }

    const data = JSON.parse(raw) as Record<string, Record<string, string[]>>;
    const countyEntries = Object.entries(data);

    const mongoDb = getMongoDb();

    for (const [countyName, subCounties] of countyEntries) {
      const countyId = await getNextId("kenyaCounties");
      await mongoDb.collection("kenyaCounties").insertOne({ id: countyId, name: countyName });

      const subCountyEntries = Object.entries(subCounties);
      for (const [subCountyName, wards] of subCountyEntries) {
        const subCountyId = await getNextId("kenyaSubCounties");
        await mongoDb.collection("kenyaSubCounties").insertOne({
          id: subCountyId,
          countyId: countyId,
          name: subCountyName,
        });

        if (wards.length > 0) {
          await mongoDb.collection("kenyaAreas").insertMany(
            await Promise.all(
              wards.map(async (wardName) => ({
                id: await getNextId("kenyaAreas"),
                subCountyId: subCountyId,
                name: wardName,
              })),
            ),
          );
        }
      }
    }

    console.log("Kenya locations seeded");
  }

  // Check products
  const products = await storage.getProducts();
  if (products.length === 0) {
    await storage.createProduct({
      name: "Super Immune Vitamin C",
      description: "High potency Vitamin C 1000mg with Zinc for maximum immune support. Great for daily use.",
      price: 150000, // 1500 KES
      category: "Immune Boosters",
      images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"],
      isFeatured: true,
      isTrending: true,
      features: ["1000mg Vitamin C", "Added Zinc", "Sugar Free"]
    });

    await storage.createProduct({
      name: "Whey Protein Isolate",
      description: "Premium grass-fed whey protein isolate for muscle recovery and growth. Chocolate flavor.",
      price: 450000,
      category: "Sport Fit",
      images: ["https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=800"],
      isFeatured: true,
      isTrending: true,
      features: ["25g Protein", "Low Carb", "Keto Friendly"]
    });

    await storage.createProduct({
      name: "Collagen Beauty Complex",
      description: "Hydrolyzed collagen peptides for radiant skin, hair, and nails. Unflavored.",
      price: 320000,
      category: "Women's Beauty",
      images: ["https://images.unsplash.com/photo-1594405230635-c54d35b9d363?auto=format&fit=crop&q=80&w=800"],
      isFeatured: true,
      isTrending: false,
      features: ["Type I & III Collagen", "Hyaluronic Acid", "Biotin"]
    });

    await storage.createProduct({
      name: "Kids Multivitamin Gummies",
      description: "Delicious fruit-flavored gummies packed with essential vitamins for growing kids.",
      price: 180000,
      category: "Smart Kids",
      images: ["https://images.unsplash.com/photo-1624638760976-4314d485eef4?auto=format&fit=crop&q=80&w=800"],
      isFeatured: false,
      isTrending: true,
      features: ["Vitamins A, C, D, E", "No Artificial Colors", "Gluten Free"]
    });

    await storage.createProduct({
      name: "Men's Energy Booster",
      description: "Natural herbal blend to support energy, stamina, and vitality in men.",
      price: 250000,
      category: "Men's Power",
      images: ["https://images.unsplash.com/photo-1616612666506-694c92476d1e?auto=format&fit=crop&q=80&w=800"],
      isFeatured: true,
      isTrending: false,
      features: ["Maca Root", "Ginseng", "Zinc"]
    });
    
    console.log("Products seeded");
  }

  // Check services
  const services = await storage.getServices();
  if (services.length === 0) {
    await storage.createService({
      name: "Comprehensive Wellness Consultation",
      description: "A one-on-one session with our wellness experts to assess your health goals and create a personalized plan.",
      benefits: ["Personalized Diet Plan", "Supplement Recommendations", "Lifestyle Assessment"],
      images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"],
      isFeatured: true
    });

    await storage.createService({
      name: "Sports Nutrition Coaching",
      description: "Optimize your athletic performance with a tailored nutrition strategy designed for your sport.",
      benefits: ["Performance Analysis", "Recovery Strategies", "Meal Timing Guide"],
      images: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"],
      isFeatured: true
    });
    console.log("Services seeded");
  }

  // Check news
  const news = await storage.getNews();
  if (news.length === 0) {
    await storage.createNews({
      title: "Grand Opening Sale!",
      content: "Welcome to DR Gabriel! To celebrate our launch, enjoy special discounts on all Immune Booster products this week. Don't miss out on boosting your health for less.",
      type: "offer",
      isUrgent: true,
      authorName: "Dr. Gabriel Admin",
      imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800"
    });

    await storage.createNews({
      title: "The Importance of Vitamin D",
      content: "Vitamin D is essential for bone health and immune function. Learn why you might need a supplement even in sunny weather...",
      type: "news",
      isUrgent: false,
      authorName: "Dr. Gabriel Admin",
      imageUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=800"
    });
    console.log("News seeded");
  }

  // Seed service offices
  const existingOffices = await storage.getServiceOffices();
  if (existingOffices.length === 0) {
    await storage.createServiceOffice({
      name: "DR Gabriel Main Clinic - Nairobi",
      address: "Mombasa Road, Opposite Nyayo Stadium",
      county: "Nairobi",
      subCounty: "Nairobi",
      area: "Nairobi CBD",
      phone: "+254700000001",
      isActive: true
    });

    await storage.createServiceOffice({
      name: "DR Gabriel Wellness Center - Westlands",
      address: "Sarit Centre, 2nd Floor",
      county: "Nairobi", 
      subCounty: "Nairobi",
      area: "Westlands",
      phone: "+254700000002",
      isActive: true
    });

    await storage.createServiceOffice({
      name: "DR Gabriel Medical Hub - Mombasa",
      address: "Digo Road, Next to Mombasa Hospital",
      county: "Mombasa",
      subCounty: "Mombasa",
      area: "Mombasa Island",
      phone: "+254700000003",
      isActive: true
    });

    console.log("Service offices seeded");
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
