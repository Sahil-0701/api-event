import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organizationName: { type: String, required: true },
    role: { type: String, default: "admin" },
   events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]

  },
  {
    timestamps: true
  }
);

const adminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default adminModel; 