import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectDB } from "../lib/mongoose";
import Word from "../models/Word";
import { words } from "../data/words";

export async function seedWords({ clearExisting = true } = {}) {
  await connectDB();

  if (clearExisting) {
    console.log("Clearing existing Word collection...");
    await Word.deleteMany({});
  }

  const bulkOps = words.map((word) => ({
    updateOne: {
      filter: { word: word.word },
      update: {
        $set: {
          ...word,
          length: word.word.length,
          language: word.language ?? "pl",
        },
      },
      upsert: true,
    },
  }));

  const result = await Word.bulkWrite(bulkOps);

  console.log(
    `Seeded ${words.length} words. upserted=${result.upsertedCount ?? 0}, modified=${result.modifiedCount ?? 0}`,
  );
}

if (process.argv[1]?.endsWith("seed-words.ts")) {
  seedWords()
    .then(() => {
      console.log("Word seed complete.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Word seed failed:", error);
      process.exit(1);
    });
}
