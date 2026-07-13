import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 6 — last-mile delivery tracking */
export default function Delivery() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.delivery} />;
}
