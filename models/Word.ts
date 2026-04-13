import mongoose from "mongoose";

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  length: Number,
  language: { type: String, default: "pl" },
  gender: String,
  example: String,
});

export default mongoose.models.Word || mongoose.model("Word", WordSchema);
