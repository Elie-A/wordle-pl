import { connectDB } from "@/lib/mongoose";
import DailyWord from "@/models/DailyWord";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const length = Number(searchParams.get("length"));

  const history = await DailyWord.find({ length })
    .sort({ date: -1 })
    .limit(10)
    .populate("wordId");

  return Response.json(
    history.map((h) => ({
      date: h.date,
      word: h.wordId.word,
    })),
  );
}
