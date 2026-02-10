import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },
    avatarUrl: String,
    county: String,
    subCounty: String,
    area: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "Immune Boosters",
        "Sport Fit",
        "Women's Beauty",
        "Heart & Blood Fit",
        "Smart Kids",
        "Men's Power",
        "Suma Fit",
        "Suma Living",
      ],
      required: true,
    },
    images: [String],
    features: [String],
    benefits: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Service Schema
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      trim: true,
      enum: ["Consultation", "Training", "Checkups"],
    },
    benefits: [String],
    images: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Service Office Schema
const serviceOfficeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: String,
    county: String,
    subCounty: String,
    area: String,
    phone: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// News Schema
const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["news", "offer"],
      default: "news",
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    imageUrl: String,
    authorName: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryInfo: {
      county: String,
      subCounty: String,
      area: String,
      address: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Appointment Schema
const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOffice",
      required: true,
    },
    location: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Favorite Schema
const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: mongoose.Schema.Types.ObjectId,
    serviceId: mongoose.Schema.Types.ObjectId,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ userId: 1, serviceId: 1 }, { unique: true, sparse: true });

// Newsletter Subscriber Schema
const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Site Settings Schema
const siteSettingsSchema = new mongoose.Schema(
  {
    defaultWhatsappNumber: {
      type: String,
      required: true,
    },
    showUrgentBanner: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Kenya County Schema
const kenyaCountySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Kenya Sub-County Schema
const kenyaSubCountySchema = new mongoose.Schema({
  countyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KenyaCounty",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Kenya Area Schema
const kenyaAreaSchema = new mongoose.Schema({
  subCountyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KenyaSubCounty",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Create models
export const User = mongoose.model("User", userSchema);
export const Product = mongoose.model("Product", productSchema);
export const Service = mongoose.model("Service", serviceSchema);
export const ServiceOffice = mongoose.model("ServiceOffice", serviceOfficeSchema);
export const News = mongoose.model("News", newsSchema);
export const Order = mongoose.model("Order", orderSchema);
export const Appointment = mongoose.model("Appointment", appointmentSchema);
export const Review = mongoose.model("Review", reviewSchema);
export const Favorite = mongoose.model("Favorite", favoriteSchema);
export const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);
export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
export const KenyaCounty = mongoose.model("KenyaCounty", kenyaCountySchema);
export const KenyaSubCounty = mongoose.model("KenyaSubCounty", kenyaSubCountySchema);
export const KenyaArea = mongoose.model("KenyaArea", kenyaAreaSchema);

// Page Schema (for static pages like About, Contact, etc.)
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    imageUrl: String,
    meta: {
      title: String,
      description: String,
    },
    authorName: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Page = mongoose.model("Page", pageSchema);
