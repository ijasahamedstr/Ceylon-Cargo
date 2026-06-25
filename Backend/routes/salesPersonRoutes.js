import express from "express";
import { bulkDeleteSalesPersons, bulkUpdateSalesPersons, createSalesPerson, deleteSalesPerson, getSalesPersonById, getSalesPersons, importSalesPersons, searchSalesPersons, updateSalesPerson } from "../controller/SalesPerson.Controller.js";

const SalesPersonRouter = express.Router();

// ---------------------------------------------------
// SPECIFIC ROUTES (Must come before /:id routes)
// ---------------------------------------------------
SalesPersonRouter.get("/search", searchSalesPersons);

// Bulk & Import Operations
SalesPersonRouter.post("/bulk/import", importSalesPersons);
SalesPersonRouter.patch("/bulk/update", bulkUpdateSalesPersons);
SalesPersonRouter.post("/bulk/delete", bulkDeleteSalesPersons);

// Basic Collection Routes
SalesPersonRouter.post("/", createSalesPerson);
SalesPersonRouter.get("/", getSalesPersons);

// ---------------------------------------------------
// DYNAMIC PARAMETER ROUTES (/:id)
// ---------------------------------------------------
SalesPersonRouter.get("/:id", getSalesPersonById);
SalesPersonRouter.put("/:id", updateSalesPerson);
SalesPersonRouter.delete("/:id", deleteSalesPerson);

export default SalesPersonRouter;