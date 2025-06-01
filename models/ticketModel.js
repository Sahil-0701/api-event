import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },

  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "used"],
    default: "pending",
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },

  paymentDetails: { type: Object, default: {} },
  bookingInfo: { type: Object, default: {} },

  bookingReference: { type: String, unique: true },
  purchaseDate: { type: Date, default: Date.now },
  ticketNumber: { type: String, unique: true },
  eventTitle: { type: String },
}, {
  timestamps: true,
});

ticketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    this.ticketNumber = `TICKET-${timestamp}-${random}`;
  }
  if (!this.bookingReference) {
    this.bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
export default Ticket;
