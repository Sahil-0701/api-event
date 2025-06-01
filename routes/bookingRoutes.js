import express from "express";


import protect from "../middleware/authMiddleware.js";
import { cancelBooking, createBooking, getBookingDetails, getUserBookings, updatePaymentStatus } from "../controllers/bookingController.js";

const router = express.Router();


router.post("/", protect, createBooking );
router.patch("/:bookingId/payment", protect, updatePaymentStatus);

router.get("/", protect, getUserBookings);
router.get("/:bookingId", protect, getBookingDetails);
router.put("/cancel/:bookingId", protect, cancelBooking);

export default router;
