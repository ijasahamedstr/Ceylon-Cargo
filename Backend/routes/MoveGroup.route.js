import express from "express";
import {
  createMoveGroup,
  getDuplicateBookings,
  getMoveGroupByCode,
  getMoveGroupById,
  getMoveGroups,
  bulkDeleteMoveGroups,
} from "../controller/MoveGroup.Controller.js";

const router = express.Router();

router.post("/", createMoveGroup);
router.post("/bulk/delete", bulkDeleteMoveGroups);
router.get("/duplicates", getDuplicateBookings);
router.get("/", getMoveGroups);
router.get("/code/:code", getMoveGroupByCode);
router.get("/:id", getMoveGroupById);

export default router;
