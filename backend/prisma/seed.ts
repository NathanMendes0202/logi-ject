import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Eletrônicos", description: "Equipamentos e componentes eletrônicos" },
    { name: "Informática", description: "Computadores, periféricos e acessórios" },
    { name: "Embalagens", description: "Materiais utilizados para expedição" }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  const password = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@logi-ject.local" },
    update: {},
    create: { name: "Administrador", email: "admin@logi-ject.local", password, role: UserRole.ADMIN }
  });

  await prisma.warehouse.upsert({
    where: { code: "SP-01" },
    update: {},
    create: {
      code: "SP-01",
      name: "Centro de Distribuição São Paulo",
      description: "Armazém principal do logi-ject",
      city: "São Paulo",
      state: "SP",
      locations: {
        create: [
          { code: "A-01-01", name: "Corredor A / Rack 01 / Prateleira 01", aisle: "A", rack: "01", shelf: "01" },
          { code: "A-01-02", name: "Corredor A / Rack 01 / Prateleira 02", aisle: "A", rack: "01", shelf: "02" },
          { code: "B-01-01", name: "Corredor B / Rack 01 / Prateleira 01", aisle: "B", rack: "01", shelf: "01" }
        ]
      }
    }
  });

  console.log("Seed concluído com sucesso.");
  console.log(`Categorias: ${await prisma.category.count()}`);
  console.log(`Armazéns: ${await prisma.warehouse.count()}`);
  console.log(`Usuários: ${await prisma.user.count()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
