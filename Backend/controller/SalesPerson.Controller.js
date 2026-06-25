

// ==========================================
// SINGLE OPERATIONS (CRUD)
// ==========================================

import SalesPerson from "../models/SalesPerson.models.js";

// @desc    Create a single sales person
// @route   POST /api/sales-persons
export const createSalesPerson = async (req, res) => {
  try {
    const { name, branch, phone } = req.body;
    if (!name || !branch) {
      return res.status(400).json({ message: "Name and branch are required." });
    }

    const newAgent = new SalesPerson({ name, branch, phone });
    const savedAgent = await newAgent.save();

    res.status(201).json({ message: "Sales agent created successfully", data: savedAgent });
  } catch (error) {
    res.status(500).json({ message: "Server error while saving agent.", error: error.message });
  }
};

// @desc    Get a single sales person by ID
// @route   GET /api/sales-persons/:id
export const getSalesPersonById = async (req, res) => {
  try {
    const agent = await SalesPerson.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Sales agent not found" });
    }
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching agent.", error: error.message });
  }
};

// @desc    Update a single sales person
// @route   PUT /api/sales-persons/:id
export const updateSalesPerson = async (req, res) => {
  try {
    const { name, branch, phone } = req.body;
    
    const updatedAgent = await SalesPerson.findByIdAndUpdate(
      req.params.id,
      { name, branch, phone },
      { new: true, runValidators: true } // Return updated doc & run schema validations
    );

    if (!updatedAgent) {
      return res.status(404).json({ message: "Sales agent not found" });
    }

    res.status(200).json({ message: "Agent profile updated successfully", data: updatedAgent });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating agent.", error: error.message });
  }
};

// @desc    Delete a single sales person
// @route   DELETE /api/sales-persons/:id
export const deleteSalesPerson = async (req, res) => {
  try {
    const deletedAgent = await SalesPerson.findByIdAndDelete(req.params.id);
    if (!deletedAgent) {
      return res.status(404).json({ message: "Sales agent not found" });
    }
    res.status(200).json({ message: `Agent ${deletedAgent.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting agent.", error: error.message });
  }
};

// ==========================================
// BULK & IMPORT OPERATIONS
// ==========================================

// @desc    Import / Bulk Create sales persons
// @route   POST /api/sales-persons/bulk/import
export const importSalesPersons = async (req, res) => {
  try {
    const { agents } = req.body; // Expects an array of objects: [{name, branch, phone}, ...]
    
    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return res.status(400).json({ message: "Invalid payload. 'agents' must be a non-empty array." });
    }

    // InsertMany handles rapid batch insertion
    const insertedAgents = await SalesPerson.insertMany(agents, { ordered: true });
    
    res.status(201).json({
      message: `${insertedAgents.length} sales agents imported successfully!`,
      data: insertedAgents
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk import failed.", error: error.message });
  }
};

// @desc    Bulk Update sales persons
// @route   PATCH /api/sales-persons/bulk/update
export const bulkUpdateSalesPersons = async (req, res) => {
  try {
    const { updates } = req.body; // Expects an array: [{ id: "...", name: "...", branch: "..." }]

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Invalid payload. 'updates' must be a non-empty array." });
    }

    // Construct high-performance bulk operations for MongoDB
    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { 
          $set: { 
            ...(item.name && { name: item.name }),
            ...(item.branch && { branch: item.branch }),
            ...(item.phone && { phone: item.phone })
          } 
        }
      }
    }));

    const result = await SalesPerson.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Bulk update completed successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk update failed.", error: error.message });
  }
};

// @desc    Bulk Delete sales persons
// @route   POST /api/sales-persons/bulk/delete
export const bulkDeleteSalesPersons = async (req, res) => {
  try {
    const { ids } = req.body; // Expects an array of MongoDB IDs: ["id1", "id2", ...]

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid payload. 'ids' must be a non-empty array." });
    }

    const result = await SalesPerson.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: `${result.deletedCount} agents deleted successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk delete failed.", error: error.message });
  }
};

// ==========================================
// STANDARD LIST & SEARCH
// ==========================================

// @desc    Get all sales persons
// @route   GET /api/sales-persons
export const getSalesPersons = async (req, res) => {
  try {
    const agents = await SalesPerson.find().sort({ createdAt: -1 });
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching agents.", error: error.message });
  }
};

// @desc    Search sales persons
// @route   GET /api/sales-persons/search
export const searchSalesPersons = async (req, res) => {
  try {
    const { name, branch } = req.query;
    const query = {};
    
    if (name) query.name = { $regex: name, $options: "i" };
    if (branch) query.branch = branch;
    
    const agents = await SalesPerson.find(query).sort({ createdAt: -1 });
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: "Search failed.", error: error.message });
  }
};