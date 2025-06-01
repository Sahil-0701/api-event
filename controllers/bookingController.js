import Ticket from "../models/ticketModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import sendPaymentConfirmationEmail from "../helpers/mailer.js";

export const createBooking = async (req, res) => {
  try {
    const { eventId, quantity, bookingInfo } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.availableSeats < quantity) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const totalAmount = event.ticketPrice * quantity;

    const ticket = new Ticket({
      event: eventId,
      user: userId,
      admin: event.createdBy,
      quantity,
      totalAmount,
      bookingInfo,
      status: "pending",
      paymentStatus: "pending",
      eventTitle: event.eventTitle,
    });

    await ticket.save();

    const seatsUpdated = await event.updateSeats(quantity);
    if (!seatsUpdated) {
      await Ticket.findByIdAndDelete(ticket._id);
      return res.status(400).json({ message: "Failed to update seats" });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { bookingHistory: ticket._id },
    });

    await Event.findByIdAndUpdate(eventId, {
      $push: { bookings: ticket._id },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking: ticket,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentDetails } = req.body;

    const booking = await Ticket.findById(bookingId).populate(
      "user",
      "name email"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = paymentStatus;
    booking.paymentDetails = paymentDetails;

    if (paymentStatus === "completed") {
      booking.status = "confirmed";

      const event = await Event.findById(booking.event);
      await event.updateRevenue(booking.totalAmount);

      if (!booking.user || !booking.user.email) {
        console.warn("User email not found. Skipping email sending.");
      } else {
        console.log("Sending email to", booking.user.email);
        try {
          await sendPaymentConfirmationEmail(
            booking.user.email,
            booking.user.name || "User",
            event?.eventTitle || "Event",
            booking.quantity,
            booking.totalAmount,
            booking.ticketNumber
          );
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    } else if (paymentStatus === "failed") {
      booking.status = "pending";
    }

    await booking.save();

    res.json({
      message: "Payment status updated successfully",
      booking,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Error updating payment status" });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Ticket.find({ user: userId }).sort({
      createdAt: -1,
    }); 

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Ticket.findById(bookingId)
      .populate("event")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ message: "Error fetching booking details" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Ticket.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    const event = await Event.findById(booking.event);
    event.availableSeats += booking.quantity;
    event.totalBookings -= booking.quantity;
    await event.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Error cancelling booking" });
  }
};
