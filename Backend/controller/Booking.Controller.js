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
    // Fetches all bookings, newest first
    const bookings = await BookingModels.find().sort({ createdAt: -1 });
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
// 4. UPDATE SINGLE BOOKING
// ==========================================
export const updateBooking = async (req, res) => {
  try {
    // ⚠️ CHANGED: Must use findById and .save() to trigger the schema pre-save hook for status history
    const booking = await BookingModels.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Apply updates from req.body to the existing booking document
    Object.assign(booking, req.body);

    // Call .save() so the Mongoose pre('save') hook runs and updates the history/counts
    const updatedBooking = await booking.save();
    
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
    // 1. Make sure they provided an array of IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of booking IDs" });
    }
    // 2. FETCH ALL DOCUMENTS matching those IDs 
    // (We do this instead of updateMany so we can trigger the save hook)
    const bookings = await BookingModels.find({ _id: { $in: ids } });
    // 3. LOOP THROUGH EACH BOOKING
    const savePromises = bookings.map(async (booking) => {
      
      // Apply the new updates (like the new status) to the booking
      Object.assign(booking, updateData);
      
      // 4. SAVE EACH ONE INDIVIDUALLY
      // Calling .save() here triggers your schema's pre("save") hook,
      // which properly records the status_history and updates the status_count!
      return booking.save(); 
    });
    // Wait for all the individual saves to finish
    await Promise.all(savePromises);
    res.status(200).json({ 
      success: true, 
      message: `${bookings.length} bookings updated and status counts recorded successfully!`
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

    const booking = await BookingModels.findOne({
      $or: [{ sender_mobile: q }, { sender_iqama: q }, { sender_passport: q }]
    }).sort({ createdAt: -1 }); 

    if (!booking) return res.status(404).json({ success: false, message: "No records found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};