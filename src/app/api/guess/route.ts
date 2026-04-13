import { connectDB } from "@/lib/db";
import DailyWord from "@/models/DailyWord";
import { evaluateGuess } from "@/lib/wordle";

export async function POST(req: Request) {
  await connectDB();

  const { guess, length } = await req.json();
  const today = new Date().toISOString().split("T")[0];

  const daily = await DailyWord.findOne({ date: today, length }).populate(
    "wordId",
  );

  const answer = daily.wordId.word;

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
