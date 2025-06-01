import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cardData: { type: Object, default: {} },
  bookingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
}, {
  minimize: false,
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
