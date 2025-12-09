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
    return;
  }

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

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
