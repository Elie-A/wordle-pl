import mongoose from "mongoose";

const DailyWordSchema = new mongoose.Schema({
  date: String,
  length: Number,
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: "Word" },
});

export default mongoose.models.DailyWord ||
  mongoose.model("DailyWord", DailyWordSchema);
