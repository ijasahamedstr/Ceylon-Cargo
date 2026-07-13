import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 3 — loading packages for shipment */
export default function LoadingLists() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.loadingList} />;
}
