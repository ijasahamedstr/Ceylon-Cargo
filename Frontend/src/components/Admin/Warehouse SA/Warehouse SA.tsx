import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 2 — Saudi Arabia warehouse */
export default function WarehouseSA() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.warehouseSA} />;
}
