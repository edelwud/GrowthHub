import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";

const prisma = new PrismaClient();

const fakerStaff = (): any => ({
  name: faker.helpers.fake("{{person.firstName}} {{person.lastName}}"),
  email: faker.internet.email(),
});

async function main() {
  const fakerRounds = 10;
  dotenv.config();
  console.log("Seeding...");
  /// --------- Users ---------------
  for (let i = 0; i < fakerRounds; i++) {
    await prisma.staff.create({ data: fakerStaff() });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
