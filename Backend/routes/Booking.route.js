import express from "express";
import { bulkDeleteBookings, bulkUpdateBookings, createBooking, deleteBooking, getBookingById, getBookings, searchBookings, updateBooking, getBookingByTrackingNumber } from "../controller/Booking.Controller.js";

const Bookingrouter = express.Router();

// ---------------------------------------------------
// SPECIFIC ROUTES (Must come before /:id routes)
// ---------------------------------------------------
Bookingrouter.get("/search", searchBookings);
Bookingrouter.get("/tracking/:trackingNumber", getBookingByTrackingNumber);

// Bulk Operations
Bookingrouter.patch("/bulk/update", bulkUpdateBookings);
Bookingrouter.post("/bulk/delete", bulkDeleteBookings);

// Basic Collection Routes
Bookingrouter.post("/", createBooking);
Bookingrouter.get("/", getBookings);

// ---------------------------------------------------
// DYNAMIC PARAMETER ROUTES (/:id)
// ---------------------------------------------------
Bookingrouter.get("/:id", getBookingById);
Bookingrouter.put("/:id", updateBooking);
Bookingrouter.delete("/:id", deleteBooking);

export default Bookingrouter;