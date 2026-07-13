import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 1 — packages collected from clients */
export default function BookingCustomer() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.bookingCustomer} />;
}
