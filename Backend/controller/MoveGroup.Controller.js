import MoveGroup from "../models/MoveGroup.models.js";
import BookingModels from "../models/Booking.models.js";

export const createMoveGroup = async (req, res) => {
  try {
    const { bookingIds, fromStatus, toStatus, fromLabel, toLabel, notes, movedBy } = req.body;

    if (!bookingIds?.length || !fromStatus || !toStatus) {
      return res.status(400).json({
        success: false,
        message: "bookingIds, fromStatus, and toStatus are required",
      });
    }

    if (fromStatus === toStatus) {
      return res.status(400).json({ success: false, message: "fromStatus and toStatus must be different" });
    }

    // Remove duplicate IDs in the same request
    const uniqueIds = [...new Set(bookingIds.map(String))];

    const bookings = await BookingModels.find({ _id: { $in: uniqueIds } });

    if (bookings.length !== uniqueIds.length) {
      return res.status(404).json({ success: false, message: "One or more bookings not found" });
    }

    const wrongStage = bookings.filter((b) => b.status !== fromStatus);
    if (wrongStage.length > 0) {
      const labels = wrongStage.map((b) => `${b.tracking_number} (${b.status})`).join(", ");
      return res.status(409).json({
        success: false,
        message: `Cannot move — already moved or wrong stage: ${labels}`,
        alreadyMoved: wrongStage.map((b) => ({
          _id: b._id,
          tracking_number: b.tracking_number,
          status: b.status,
        })),
      });
    }

    const group = new MoveGroup({
      from_status: fromStatus,
      to_status: toStatus,
      from_label: fromLabel || fromStatus.replace(/_/g, " "),
      to_label: toLabel || toStatus.replace(/_/g, " "),
      package_count: uniqueIds.length,
      booking_ids: uniqueIds,
      notes: notes || "",
      moved_by: movedBy || "",
    });

    await group.save();

    // Atomic: only update if still at fromStatus (prevents double-move race)
    const updateResult = await BookingModels.updateMany(
      { _id: { $in: uniqueIds }, status: fromStatus },
      {
        $set: {
          status: toStatus,
          last_move_group_id: group._id,
          last_moved_at: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount !== uniqueIds.length) {
      await MoveGroup.findByIdAndDelete(group._id);
      return res.status(409).json({
        success: false,
        message: "Some packages were already moved by another user. Please refresh and try again.",
      });
    }

    const populated = await MoveGroup.findById(group._id).populate("booking_ids");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMoveGroups = async (req, res) => {
  try {
    const { from_status, to_status } = req.query;
    const filter = {};
    if (from_status) filter.from_status = from_status;
    if (to_status) filter.to_status = to_status;

    const groups = await MoveGroup.find(filter)
      .sort({ createdAt: -1 })
      .populate("booking_ids");

    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMoveGroupById = async (req, res) => {
  try {
    const group = await MoveGroup.findById(req.params.id).populate("booking_ids");
    if (!group) {
      return res.status(404).json({ success: false, message: "Move group not found" });
    }
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMoveGroupByCode = async (req, res) => {
  try {
    const group = await MoveGroup.findOne({ group_code: req.params.code }).populate("booking_ids");
    if (!group) {
      return res.status(404).json({ success: false, message: "Move group not found" });
    }
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Find bookings with same mobile + iqama at a given stage */
export const getDuplicateBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await BookingModels.find(filter).sort({ createdAt: -1 });

    const groups = {};
    for (const b of bookings) {
      const mobile = (b.sender_mobile || "").replace(/\D/g, "");
      const key = `${mobile}|${(b.sender_iqama || "").trim()}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          sender_name: b.sender_name,
          sender_mobile: b.sender_mobile,
          sender_iqama: b.sender_iqama,
          count: 0,
          bookings: [],
        };
      }
      groups[key].count += 1;
      groups[key].bookings.push({
        _id: b._id,
        tracking_number: b.tracking_number,
        status: b.status,
        receiver_name: b.receiver_name,
        createdAt: b.createdAt,
      });
    }

    const duplicates = Object.values(groups).filter((g) => g.count > 1);

    res.status(200).json({
      success: true,
      count: duplicates.length,
      data: duplicates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkDeleteMoveGroups = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of move group IDs" });
    }

    const result = await MoveGroup.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} move groups deleted successfully`,
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
