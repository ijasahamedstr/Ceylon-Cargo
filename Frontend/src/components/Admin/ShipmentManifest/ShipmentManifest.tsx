import StageBookingBoard from "../shared/StageBookingBoard";
import { WORKFLOW_STAGES } from "../shared/bookingWorkflow";

/** Workflow step 4 — shipment manifest & documentation */
export default function ShipmentManifest() {
  return <StageBookingBoard stage={WORKFLOW_STAGES.shipmentManifest} />;
}
