import ticketModel from "../models/ticketModel.js";
import eventModel from "../models/eventModel.js";

const purchaseTickets = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    if (!eventId || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const event = await eventModel.findById(eventId).populate("createdBy");
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.totalSeats < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough seats available" });
    }

    const pricePerTicket = event.ticketPrice;
    const totalAmount = pricePerTicket * quantity;

    const ticket = new ticketModel({
      user: userId,
      event: eventId,
      admin: event.createdBy._id,
      eventTitle: event.eventTitle,
      quantity,
      totalAmount,
    });

    await ticket.save();
    event.totalSeats -= quantity;
    await event.save();

    res.status(201).json({
      success: true,
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        event: {
          title: event.eventTitle,
          date: event.eventDate,
          venue: event.venue,
        },
        quantity,
        totalAmount,
        purchaseDate: ticket.purchaseDate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const tickets = await ticketModel
      .find({ user: userId })
      .populate("event", "name date venue images")
      .sort({ purchaseDate: -1 });

    res.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        event: {
          name: ticket.event.name,
          date: ticket.event.date,
          venue: ticket.event.venue,
          image: ticket.event.images?.[0] || null,
        },
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        status: ticket.status,
        purchaseDate: ticket.purchaseDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const ticket = await ticketModel
      .findOne({ _id: ticketId, user: userId })
      .populate("event", "name date venue images description");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    res.json({
      success: true,
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        event: {
          name: ticket.event.name,
          date: ticket.event.date,
          venue: ticket.event.venue,
          description: ticket.event.description,
          image: ticket.event.images?.[0] || null,
        },
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        status: ticket.status,
        purchaseDate: ticket.purchaseDate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const ticket = await ticketModel.findOne({ _id: ticketId, user: userId });
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (ticket.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Ticket cannot be cancelled" });
    }

    ticket.status = "cancelled";
    await ticket.save();

    const event = await eventModel.findById(ticket.event);
    event.totalSeats += ticket.quantity;
    await event.save();

    res.json({
      success: true,
      message: "Ticket cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { purchaseTickets, getUserTickets, getTicketDetails, cancelTicket };
