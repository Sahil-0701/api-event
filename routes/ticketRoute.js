import express from "express";
import {
  purchaseTickets,
  getUserTickets,
  getTicketDetails,
  cancelTicket,
} from "../controllers/ticketController.js";
import protect from "../middleware/authMiddleware.js";

const ticketRouter = express.Router();

ticketRouter.use(protect);

ticketRouter.post("/purchase", purchaseTickets);

ticketRouter.get("/my-tickets", getUserTickets);

ticketRouter.get("/:ticketId", getTicketDetails);

ticketRouter.post("/:ticketId/cancel", cancelTicket);

export default ticketRouter;
