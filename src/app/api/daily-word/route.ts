import { connectDB } from "@/lib/mongoose";
import Word from "@/models/Word";
import DailyWord from "@/models/DailyWord";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const length = Number(searchParams.get("length"));
  const reveal = searchParams.get("reveal") === "true";
  const today = new Date().toISOString().split("T")[0];

  if (!length || length < 1) {
    return Response.json(
      { error: "Nieprawidłowa długość słowa." },
      { status: 400 },
    );
  }

  let daily = await DailyWord.findOne({ date: today, length }).populate(
    "wordId",
  );

  if (!daily) {
    const words = await Word.aggregate([
      { $match: { length } },
      { $sample: { size: 1 } },
    ]);

    if (!words.length) {
      return Response.json(
        { error: `Brak zasiejonych słów o długości ${length}.` },
        { status: 400 },
      );
    }

    daily = await DailyWord.create({
      date: today,
      length,
      wordId: words[0]._id,
    });

    if (reveal) {
      await daily.populate("wordId");
    }
  }

  if (reveal) {
    return Response.json({
      word: String(daily.wordId.word).toLocaleLowerCase("pl").normalize("NFC"),
      gender: daily.wordId.gender,
      example: daily.wordId.example,
    });
  }

  return Response.json({
    date: today,
    length,
  });
}
