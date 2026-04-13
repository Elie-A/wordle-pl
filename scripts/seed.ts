import { seedWords } from "./seed-words";
import { seedDaily } from "./seed-daily";

async function seed() {
  console.log("Seeding Word list...");
  await seedWords({ clearExisting: true });

  console.log("Seeding daily word entries...");
  await seedDaily({ clearExisting: true, count: 3 });
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
