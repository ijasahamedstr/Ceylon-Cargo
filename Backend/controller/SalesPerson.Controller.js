import SalesPersonModel from "../models/SalesPerson.models.js";

export const createSalesPerson = async (req, res) => {
  try {
    const newSalesPerson = new SalesPersonModel(req.body);
    const savedSalesPerson = await newSalesPerson.save();
    res.status(201).json({ success: true, data: savedSalesPerson });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesPersons = async (req, res) => {
  try {
    const salesPersons = await SalesPersonModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: salesPersons.length, data: salesPersons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesPersonById = async (req, res) => {
  try {
    const salesPerson = await SalesPersonModel.findById(req.params.id);
    if (!salesPerson) {
      return res.status(404).json({ success: false, message: "Sales person not found" });
    }
    res.status(200).json({ success: true, data: salesPerson });
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid ID or server error" });
  }
};

export const updateSalesPerson = async (req, res) => {
  try {
    const updatedSalesPerson = await SalesPersonModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSalesPerson) {
      return res.status(404).json({ success: false, message: "Sales person not found" });
    }

    res.status(200).json({ success: true, data: updatedSalesPerson });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSalesPerson = async (req, res) => {
  try {
    const deletedSalesPerson = await SalesPersonModel.findByIdAndDelete(req.params.id);
    if (!deletedSalesPerson) {
      return res.status(404).json({ success: false, message: "Sales person not found" });
    }
    res.status(200).json({ success: true, message: "Sales person deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
