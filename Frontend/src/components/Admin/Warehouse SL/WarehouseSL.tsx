import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 5 — Sri Lanka warehouse (packages on hold stay here until selected) */
export default function WarehouseSL() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.warehouseSL} />;
}
