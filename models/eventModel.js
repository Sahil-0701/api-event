import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventTitle: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, required: true },
    organizer: { type: String, required: true },
    eventImages: [{ type: String, required: true }],
    availableSeats: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    ticketPrice: { type: Number, required: true },
    totalBookings: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    eventType: {
      type: String,
      enum: [
        "outdoor",
        "indoor",
        "national",
        "international",
        "inter-college",
        "inter-state",
      ],
      required: true,
    },
    isFeatured: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    organizationName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

eventSchema.methods.updateSeats = async function (quantity) {
  if (this.availableSeats < quantity) return false;
  this.availableSeats -= quantity;
  this.totalBookings += quantity;
  await this.save();
  return true;
};

eventSchema.methods.updateRevenue = async function (amount) {
  this.revenue += amount;
  await this.save();
};

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
export default Event;
