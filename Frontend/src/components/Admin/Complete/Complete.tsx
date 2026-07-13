import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 7 — delivered package history */
export default function Complete() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.complete} />;
}
