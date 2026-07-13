import express from "express";
import {
  createSalesPerson,
  deleteSalesPerson,
  getSalesPersons,
  getSalesPersonById,
  updateSalesPerson,
} from "../controller/SalesPerson.Controller.js";

const router = express.Router();

router.get("/", getSalesPersons);
router.get("/:id", getSalesPersonById);
router.post("/", createSalesPerson);
router.put("/:id", updateSalesPerson);
router.delete("/:id", deleteSalesPerson);

export default router;
