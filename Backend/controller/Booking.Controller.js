import BookingModels from "../models/Booking.models.js";

// ==========================================
// 1. CREATE BOOKING
// ==========================================
export const createBooking = async (req, res) => {
  try {
    const newBooking = new BookingModels(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. VIEW ALL BOOKINGS (With sorting)
// ==========================================
export const getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await BookingModels.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. VIEW SINGLE BOOKING BY ID
// ==========================================
export const getBookingById = async (req, res) => {
  try {
    const booking = await BookingModels.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid ID or server error" });
  }
};

// ==========================================
// 3. VIEW BOOKING BY TRACKING NUMBER
// ==========================================
export const getBookingByTrackingNumber = async (req, res) => {
  try {
    const trackingNumber = req.params.trackingNumber?.trim();
    if (!trackingNumber) {
      return res.status(400).json({ success: false, message: "Tracking number required" });
    }

    const escapedTrackingNumber = trackingNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const booking = await BookingModels.findOne({
      tracking_number: new RegExp(`^${escapedTrackingNumber}$`, "i"),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. UPDATE SINGLE BOOKING
// ==========================================
export const updateBooking = async (req, res) => {
  try {
    const { expectedStatus, ...updateData } = req.body;

    let updatedBooking;
    if (expectedStatus && updateData.status && updateData.status !== expectedStatus) {
      updatedBooking = await BookingModels.findOneAndUpdate(
        { _id: req.params.id, status: expectedStatus },
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedBooking) {
        const current = await BookingModels.findById(req.params.id);
        return res.status(409).json({
          success: false,
          message: current
            ? `Package ${current.tracking_number} already moved (now at ${current.status})`
            : "Booking not found or already moved",
        });
      }
    } else {
      updatedBooking = await BookingModels.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. DELETE SINGLE BOOKING
// ==========================================
export const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await BookingModels.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. BULK UPDATE BOOKINGS
// ==========================================
export const bulkUpdateBookings = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of booking IDs" });
    }

    const result = await BookingModels.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} bookings updated successfully`,
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. BULK DELETE BOOKINGS
// ==========================================
export const bulkDeleteBookings = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of booking IDs" });
    }

    const result = await BookingModels.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} bookings deleted successfully`,
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. SEARCH FOR AUTO-FILL
// ==========================================
export const searchBookings = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Search query required" });

    // Used BookingModels here instead of Booking
    const booking = await BookingModels.findOne({
      $or: [{ sender_mobile: q }, { sender_iqama: q }, { sender_passport: q }]
    }).sort({ createdAt: -1 }); 

    if (!booking) return res.status(404).json({ success: false, message: "No records found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};