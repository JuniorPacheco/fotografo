import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ENVIRONMENTS } from "../src/config/env";
import { hashPassword } from "../src/utils/password";

const connectionString = `${ENVIRONMENTS.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("🌱 Starting seed...");

  const adminEmail = "admin@admin.com";
  const adminPassword = "elmasteradmin";

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log("✅ Admin user already exists, skipping creation.");
  } else {
    // Hashear la contraseña
    const hashedPassword = await hashPassword(adminPassword);

    // Crear el usuario administrador
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrator",
        role: "OWNER",
        isActive: true,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}`);
  }

  // Crear paquetes por defecto
  console.log("\n📦 Creating default packages...");

  const defaultPackages = [
    {
      name: "Paquete Básico",
      suggestedPrice: 150000,
    },
    {
      name: "Paquete Estándar",
      suggestedPrice: 300000,
    },
    {
      name: "Paquete Premium",
      suggestedPrice: 500000,
    },
    {
      name: "Paquete Deluxe",
      suggestedPrice: 750000,
    },
    {
      name: "Paquete Boda",
      suggestedPrice: 1200000,
    },
    {
      name: "Paquete Quinceañera",
      suggestedPrice: 1000000,
    },
    {
      name: "Paquete Graduación",
      suggestedPrice: 400000,
    },
    {
      name: "Paquete Familiar",
      suggestedPrice: 250000,
    },
  ];

  for (const pkg of defaultPackages) {
    const existingPackage = await prisma.package.findFirst({
      where: {
        name: pkg.name,
        deletedAt: null,
      },
    });

    if (!existingPackage) {
      const createdPackage = await prisma.package.create({
        data: {
          name: pkg.name,
          suggestedPrice: pkg.suggestedPrice,
        },
      });
      console.log(
        `   ✅ Created package: ${createdPackage.name} - $${createdPackage.suggestedPrice}`
      );
    } else {
      console.log(`   ⏭️  Package already exists: ${pkg.name}`);
    }
  }

  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
