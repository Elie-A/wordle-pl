import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectDB } from "../lib/mongoose";
import DailyWord from "../models/DailyWord";
import Word from "../models/Word";

export interface SeedDailyOptions {
  dates?: string[];
  lengths?: number[];
  length?: number;
  count?: number;
  startDate?: string;
  force?: boolean;
  clearExisting?: boolean;
}

function normalizeDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export async function seedDaily({
  dates,
  lengths,
  length = Number(process.env.LENGTH ?? 5),
  count = Number(process.env.COUNT ?? 1),
  startDate,
  force = process.env.FORCE === "true",
  clearExisting = false,
}: SeedDailyOptions = {}) {
  await connectDB();

  if (clearExisting) {
    console.log("Clearing existing DailyWord collection...");
    await DailyWord.deleteMany({});
  }

  const envLengths = process.env.LENGTHS
    ? process.env.LENGTHS.split(",")
        .map((item) => Number(item.trim()))
        .filter(Boolean)
    : [];

  const effectiveLengths = lengths?.length
    ? lengths
    : envLengths.length
      ? envLengths
      : [length];

  const seedDates = dates?.length
    ? dates.map((item) => item.trim()).filter(Boolean)
    : Array.from({ length: Math.max(1, count) }, (_, index) =>
        normalizeDate(
          addDays(startDate ? new Date(startDate) : new Date(), index),
        ),
      );

  if (!seedDates.length) {
    throw new Error("No dates provided for daily-word seeding.");
  }

  if (!effectiveLengths.length) {
    throw new Error("No lengths provided for daily-word seeding.");
  }

  for (const date of seedDates) {
    for (const lengthValue of effectiveLengths) {
      const existing = await DailyWord.findOne({ date, length: lengthValue });
      if (existing && !force) {
        console.log(
          `Skipped existing daily word for ${date} (length=${lengthValue}).`,
        );
        continue;
      }

      const words = await Word.aggregate([
        { $match: { length: lengthValue } },
        { $sample: { size: 1 } },
      ]);

      if (!words.length) {
        throw new Error(
          `No Word documents found for length ${lengthValue}. Seed words first or adjust LENGTH/LENGTHS.`,
        );
      }

      if (existing) {
        existing.wordId = words[0]._id;
        await existing.save();
        console.log(`Updated daily word for ${date} -> ${words[0].word}`);
      } else {
        await DailyWord.create({
          date,
          length: lengthValue,
          wordId: words[0]._id,
        });
        console.log(`Created daily word for ${date} -> ${words[0].word}`);
      }
    }
  }
}

if (process.argv[1]?.endsWith("seed-daily.ts")) {
  seedDaily()
    .then(() => {
      console.log("Daily-word seed complete.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Daily-word seed failed:", error);
      process.exit(1);
    });
}
