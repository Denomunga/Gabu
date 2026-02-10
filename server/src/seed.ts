import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  User,
  Product,
  Service,
  ServiceOffice,
  News,
  Page,
  SiteSettings,
  KenyaCounty,
  KenyaSubCounty,
  KenyaArea,
} from "./db.js";
import { hashPassword } from "./auth.js";

dotenv.config();

const PRODUCT_CATEGORIES = [
  "Immune Boosters",
  "Sport Fit",
  "Women's Beauty",
  "Heart & Blood Fit",
  "Smart Kids",
  "Men's Power",
  "Suma Fit",
  "Suma Living",
];

const KENYA_DATA = {
  Nairobi: ["Kasarani", "Embakasi", "Westlands", "Makadara", "Dagoretti"],
  Mombasa: ["Mvita", "Kisauni", "Nyali", "Likoni", "Changamwe"],
  Kisumu: ["Kisumu Central", "Nyakach", "Muhoroni", "Seme", "Nyando"],
  Nakuru: ["Nakuru Central", "Rongai", "Gilgil", "Molo", "Njoro"],
  Kericho: ["Kericho Central", "Belgaum", "Litein", "Ainamoi", "Sigowet"],
};

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/dr-gabriel";
    await mongoose.connect(mongoUri);
    console.log("📦 Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Service.deleteMany({});
    await ServiceOffice.deleteMany({});
    await News.deleteMany({});
    await KenyaCounty.deleteMany({});
    await KenyaSubCounty.deleteMany({});
    await KenyaArea.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Seed Kenya locations
    for (const [county, subCounties] of Object.entries(KENYA_DATA)) {
      const countyDoc = await KenyaCounty.create({ name: county });
      for (const subCounty of subCounties) {
        await KenyaSubCounty.create({
          countyId: countyDoc._id,
          name: subCounty,
        });
      }
    }
    console.log("📍 Kenya locations seeded");

    // Seed admin user
    const adminPassword = await hashPassword("admin123456");
    const admin = await User.create({
      username: "admin",
      email: "admin@drgabriel.com",
      password: adminPassword,
      role: "super_admin",
      phone: "+254700000000",
    });
    console.log("👤 Admin user created");

    // Seed products
    const products = [];
    for (let i = 0; i < 24; i++) {
      const category = PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length];
      const product = await Product.create({
        name: `Premium ${category} Product ${i + 1}`,
        description: `High-quality ${category} product designed to support your wellness journey. This product is formulated with premium ingredients.`,
        price: Math.floor(Math.random() * 5000) + 1000,
        category,
        images: [
          `https://images.unsplash.com/photo-1535743686920-55e51917c9e4?w=500&h=500&fit=crop`,
        ],
        features: [
          "Premium quality",
          "Natural ingredients",
          "Scientifically tested",
          "100% satisfaction guaranteed",
        ],
        benefits: [
          "Improved health",
          "Enhanced wellness",
          "Better lifestyle",
          "Professional support",
        ],
        isFeatured: i < 4,
        isTrending: i < 8,
        rating: Math.floor(Math.random() * 5) + 1,
      });
      products.push(product);
    }
    console.log(`📦 ${products.length} products created`);

    // Seed services
    const services = [
      {
        name: "Health Consultation",
        description:
          "Professional health consultation with our experienced practitioners",
        benefits: ["Expert advice", "Personalized care", "Follow-up support"],
        isFeatured: true,
      },
      {
        name: "Wellness Assessment",
        description:
          "Comprehensive wellness assessment and personalized health plans",
        benefits: ["Complete evaluation", "Tailored programs", "Progress tracking"],
        isFeatured: true,
      },
      {
        name: "Nutrition Planning",
        description: "Customized nutrition plans for optimal health",
        benefits: ["Diet customization", "Expert guidance", "Recipe suggestions"],
        isFeatured: false,
      },
      {
        name: "Fitness Training",
        description: "Professional fitness training and workout programs",
        benefits: ["Personalized workouts", "Form correction", "Progress monitoring"],
        isFeatured: false,
      },
    ];

    for (const serviceData of services) {
      await Service.create({
        ...serviceData,
        images: [
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop",
        ],
        isTrending: Math.random() > 0.5,
      });
    }
    console.log("🏥 Services created");

    // Seed service offices
    const officeLocations = [
      {
        name: "DR Gabriel - Nairobi Central",
        address: "123 Health Plaza, Nairobi",
        county: "Nairobi",
        subCounty: "Westlands",
        area: "Westlands",
        phone: "+254700000001",
      },
      {
        name: "DR Gabriel - Mombasa",
        address: "456 Wellness Street, Mombasa",
        county: "Mombasa",
        subCounty: "Mvita",
        area: "Mvita",
        phone: "+254700000002",
      },
      {
        name: "DR Gabriel - Kisumu",
        address: "789 Care Avenue, Kisumu",
        county: "Kisumu",
        subCounty: "Kisumu Central",
        area: "Kisumu Central",
        phone: "+254700000003",
      },
    ];

    for (const office of officeLocations) {
      await ServiceOffice.create(office);
    }
    console.log("🏢 Service offices created");

    // Seed news and offers
    const newsItems = [
      {
        title: "New Immune Booster Range Launch",
        content:
          "We are excited to announce the launch of our new premium immune booster range, formulated with natural ingredients to support your wellness journey.",
        type: "news",
        isUrgent: true,
        authorName: "Dr Gabriel",
      },
      {
        title: "Special Offer - 30% Off Wellness Products",
        content:
          "Enjoy 30% discount on all selected wellness products this month. Use code: WELLNESS30",
        type: "offer",
        isUrgent: false,
        authorName: "Marketing Team",
      },
      {
        title: "Expert Tips for Better Health",
        content:
          "Learn the best practices for maintaining good health during the changing seasons. Read our comprehensive guide.",
        type: "news",
        isUrgent: false,
        authorName: "Health Experts",
      },
    ];

    for (const newsItem of newsItems) {
      await News.create({
        ...newsItem,
        imageUrl:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop",
      });
    }
    console.log("📰 News and offers created");

    // Seed About page
    await Page.create({
      title: "About DR Gabriel",
      slug: "about",
      content:
        "DR Gabriel is a professional medical and wellness service dedicated to improving the health and wellbeing of our clients. We combine medical expertise with wellness programs and premium products to support a healthier life.",
      imageUrl:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=600&fit=crop",
      meta: {
        title: "About DR Gabriel - Medical & Wellness",
        description: "Professional medical and wellness services and premium wellness products.",
      },
      authorName: "DR Gabriel",
    });
    console.log("ℹ️ About page created");

    // Seed site settings
    await SiteSettings.create({
      defaultWhatsappNumber: "+254700000000",
      showUrgentBanner: true,
    });
    console.log("⚙️  Site settings created");

    console.log("✅ Database seeding completed successfully!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
