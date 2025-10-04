import { PrismaClient, ProductBadge, UserRole } from "@prisma/vercel-client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();

  console.log("👤 Creating users...");
  // Hash password - both users have the same password
  const password = "asxzasxz";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      name: "Admin User",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create regular user
  await prisma.user.create({
    data: {
      email: "user@gmail.com",
      name: "Regular User",
      password: hashedPassword,
      role: UserRole.USER,
    },
  });
  console.log("✅ Users created successfully");

  // Create categories
  console.log("📁 Creating categories...");

  const cakesCategory = await prisma.category.upsert({
    where: { slug: "cakes" },
    update: {},
    create: {
      name: "Cakes",
      slug: "cakes",
    },
  });

  const cupcakesCategory = await prisma.category.upsert({
    where: { slug: "cupcakes" },
    update: {},
    create: {
      name: "Cupcakes",
      slug: "cupcakes",
    },
  });

  const pastriesCategory = await prisma.category.upsert({
    where: { slug: "pastries" },
    update: {},
    create: {
      name: "Pastries",
      slug: "pastries",
    },
  });

  const specialOccasionsCategory = await prisma.category.upsert({
    where: { slug: "special-occasions" },
    update: {},
    create: {
      name: "Special Occasions",
      slug: "special-occasions",
    },
  });

  const seasonalCategory = await prisma.category.upsert({
    where: { slug: "seasonal" },
    update: {},
    create: {
      name: "Seasonal",
      slug: "seasonal",
    },
  });

  console.log("✅ Categories created successfully");

  // Create products
  console.log("🎂 Creating products...");

  const products = [
    // Cakes
    {
      name: "Lychee Rose Delight",
      slug: "lychee-rose-delight",
      price: 65.0,
      weight: 1200,
      stock: 8,
      badge: ProductBadge.BESTSELLER,
      description:
        "Delicate rose sponge layers infused with lychee cream, topped with our signature pink drip, handcrafted macarons, and elegant gold leaf accents.",
      details: [
        "Serves 10-12 people",
        "Contains dairy, eggs, wheat",
        "Made with fresh lychee puree",
        "Best enjoyed chilled",
        "8-inch diameter cake",
        "Gluten-free option available upon request",
      ],
      images: ["/cake/rose.jpg"],
      categoryId: cakesCategory.id,
    },
    {
      name: "Chocolate Fudge Dream",
      slug: "chocolate-fudge-dream",
      price: 55.0,
      weight: 1100,
      stock: 12,
      badge: ProductBadge.FEATURED,
      description:
        "Rich dark chocolate layers with smooth Belgian fudge frosting, decorated with artisan chocolate curls and edible gold dust.",
      details: [
        "Serves 8-10 people",
        "Contains dairy, eggs, wheat, nuts",
        "Made with premium Belgian chocolate",
        "Refrigerate after 2 hours",
        "7-inch diameter cake",
        "Rich in cocoa content (70%)",
      ],
      images: ["/cake/choco.jpg"],
      categoryId: cakesCategory.id,
    },
    {
      name: "Classic Vanilla Bean",
      slug: "classic-vanilla-bean",
      price: 50.0,
      weight: 1000,
      stock: 15,
      description:
        "Fluffy Madagascan vanilla bean sponge cake with silky Swiss meringue buttercream and vanilla bean specks.",
      details: [
        "Serves 8-10 people",
        "Contains dairy, eggs, wheat",
        "Made with premium Madagascar vanilla beans",
        "Store in a cool place",
        "8-inch diameter cake",
        "Light and airy texture",
      ],
      images: ["/cake/vanilla.jpg"],
      categoryId: cakesCategory.id,
    },
    {
      name: "Red Velvet Royale",
      slug: "red-velvet-royale",
      price: 58.0,
      weight: 1150,
      stock: 10,
      badge: ProductBadge.NEW,
      description:
        "Classic red velvet cake with cream cheese frosting, finished with red velvet crumbs and white chocolate decorations.",
      details: [
        "Serves 10-12 people",
        "Contains dairy, eggs, wheat",
        "Traditional Southern recipe",
        "Cream cheese frosting",
        "8-inch diameter cake",
        "Moist and tangy flavor",
      ],
      images: ["/cake/red-velvet.jpg"],
      categoryId: cakesCategory.id,
    },

    // Cupcakes
    {
      name: "Strawberry Fields Cupcakes",
      slug: "strawberry-fields-cupcakes",
      price: 24.0,
      weight: 480,
      stock: 24,
      badge: ProductBadge.SEASONAL,
      description:
        "Fresh strawberry cupcakes with strawberry buttercream, topped with candied strawberries and mint leaves.",
      details: [
        "Set of 6 cupcakes",
        "Contains dairy, eggs, wheat",
        "Made with fresh strawberry puree",
        "Best consumed within 2 days",
        "Seasonal availability",
        "Individual cupcake boxes available",
      ],
      images: ["/cake/strawberry.jpg"],
      categoryId: cupcakesCategory.id,
    },
    {
      name: "Salted Caramel Surprise",
      slug: "salted-caramel-surprise",
      price: 28.0,
      weight: 520,
      stock: 18,
      badge: ProductBadge.BESTSELLER,
      description:
        "Vanilla cupcakes with salted caramel filling, caramel buttercream, and a sprinkle of sea salt flakes.",
      details: [
        "Set of 6 cupcakes",
        "Contains dairy, eggs, wheat",
        "Homemade salted caramel center",
        "Topped with French sea salt",
        "Rich and indulgent flavor",
        "Perfect for gifting",
      ],
      images: ["/cake/caramel.jpg"],
      categoryId: cupcakesCategory.id,
    },

    // Pastries
    {
      name: "French Macarons Collection",
      slug: "french-macarons-collection",
      price: 32.0,
      weight: 240,
      stock: 20,
      badge: ProductBadge.FEATURED,
      description:
        "Assorted French macarons in 12 flavors including vanilla, chocolate, pistachio, raspberry, and lemon.",
      details: [
        "Box of 12 macarons",
        "Contains dairy, eggs, nuts",
        "12 different flavors",
        "Made with French technique",
        "Gluten-free",
        "Beautiful gift packaging",
      ],
      images: ["/cake/caramel.jpg"],
      categoryId: pastriesCategory.id,
    },
    {
      name: "Artisan Croissant Selection",
      slug: "artisan-croissant-selection",
      price: 18.0,
      weight: 360,
      stock: 30,
      description:
        "Freshly baked buttery croissants in plain, almond, and chocolate varieties.",
      details: [
        "Set of 6 croissants (2 of each)",
        "Contains dairy, eggs, wheat, nuts",
        "Made with French butter",
        "Best enjoyed fresh",
        "Laminated dough technique",
        "Flaky and buttery texture",
      ],
      images: ["/cake/croissants.jpg"],
      categoryId: pastriesCategory.id,
    },

    // Special Occasions
    {
      name: "Wedding Tier Elegance",
      slug: "wedding-tier-elegance",
      price: 285.0,
      weight: 4500,
      stock: 2,
      badge: ProductBadge.LIMITED,
      description:
        "Three-tier wedding cake with vanilla and chocolate layers, decorated with sugar flowers and pearl details.",
      details: [
        "Serves 40-50 people",
        "Contains dairy, eggs, wheat",
        'Three tiers (6", 8", 10")',
        "Handcrafted sugar flowers",
        "Customizable flavors",
        "48-hour advance notice required",
        "Delivery and setup included",
      ],
      images: ["/cake/wedding.jpg", "/cake/wedding-2.jpg"],
      categoryId: specialOccasionsCategory.id,
    },
    {
      name: "Birthday Celebration Cake",
      slug: "birthday-celebration-cake",
      price: 45.0,
      weight: 900,
      stock: 25,
      description:
        "Colorful funfetti cake with vanilla buttercream, rainbow sprinkles, and customizable message.",
      details: [
        "Serves 8-10 people",
        "Contains dairy, eggs, wheat",
        "Customizable message",
        "Colorful funfetti layers",
        "Vanilla buttercream frosting",
        "Rainbow decorations",
        "Perfect for all ages",
      ],
      images: ["/cake/birthday.jpg"],
      categoryId: specialOccasionsCategory.id,
    },

    // Seasonal
    {
      name: "Pumpkin Spice Delight",
      slug: "pumpkin-spice-delight",
      price: 52.0,
      weight: 1050,
      stock: 8,
      badge: ProductBadge.SEASONAL,
      description:
        "Autumn-inspired pumpkin spice cake with cinnamon cream cheese frosting and candied pecans.",
      details: [
        "Serves 8-10 people",
        "Contains dairy, eggs, wheat, nuts",
        "Made with real pumpkin puree",
        "Warm autumn spices",
        "Cream cheese frosting",
        "Available September-November",
        "Limited seasonal offering",
      ],
      images: ["/cake/pumpkin.jpg"],
      categoryId: seasonalCategory.id,
    },
    {
      name: "Holiday Fruitcake Supreme",
      slug: "holiday-fruitcake-supreme",
      price: 68.0,
      weight: 1400,
      stock: 6,
      badge: ProductBadge.SEASONAL,
      description:
        "Traditional holiday fruitcake with premium dried fruits, nuts, and a hint of brandy.",
      details: [
        "Serves 12-14 people",
        "Contains dairy, eggs, wheat, nuts, alcohol",
        "Premium dried fruits and nuts",
        "Aged with brandy",
        "Long shelf life",
        "Available November-January",
        "Traditional holiday recipe",
      ],
      images: ["/cake/cake.jpg"],
      categoryId: seasonalCategory.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("✅ Products created successfully");
  console.log("🎉 Database seeding completed!");

  // Print summary
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();

  console.log(`\n📊 Summary:`);
  console.log(`   Users: 2 (1 Admin, 1 Regular)`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Products: ${productCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
