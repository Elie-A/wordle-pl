import { connectDB } from "@/lib/mongoose";
import DailyWord from "@/models/DailyWord";
import Word from "@/models/Word";
import { evaluateGuess } from "@/lib/wordle";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();
  const guess = String(body.guess ?? "")
    .toLocaleLowerCase("pl")
    .normalize("NFC");
  const length = Number(body.length);
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

    await daily.populate("wordId");
  }

  const answer = String(daily.wordId.word)
    .toLocaleLowerCase("pl")
    .normalize("NFC");

  const result = evaluateGuess(guess, answer);

  const isWin = guess === answer;

  return Response.json({
    result,
    isWin,
    ...(isWin && {
      word: answer,
      gender: daily.wordId.gender,
      example: daily.wordId.example,
    }),
  });
}
