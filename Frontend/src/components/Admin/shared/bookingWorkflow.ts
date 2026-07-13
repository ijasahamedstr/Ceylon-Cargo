export type BookingStatus =
  | "draft"
  | "collect_item"
  | "move_to_warehouse_sa"
  | "loading_box"
  | "shipment_manifest"
  | "arrived_warehouse_sl"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled";

export interface WorkflowStageConfig {
  status: BookingStatus;
  breadcrumb: string;
  title: string;
  subtitle: string;
  emptyMessage: string;
  nextStatus: BookingStatus | null;
  nextStatusLabel: string | null;
  csvFilename: string;
  cacheKey: string;
  allowEdit?: boolean;
}

/** Operational pipeline after New Booking — each tab shows one status only */
export const WORKFLOW_STAGES = {
  bookingCustomer: {
    status: "collect_item",
    breadcrumb: "COLLECTION",
    title: "Collect Item",
    subtitle: "Packages collected from clients — select and move to Saudi warehouse when ready",
    emptyMessage: "No bookings waiting for collection. Create a booking in New Booking first.",
    nextStatus: "move_to_warehouse_sa",
    nextStatusLabel: "Move to Warehouse SA",
    csvFilename: "collect-item-bookings.csv",
    cacheKey: "STAGE_collect_item",
    allowEdit: true,
  },
  warehouseSA: {
    status: "move_to_warehouse_sa",
    breadcrumb: "WAREHOUSE SA",
    title: "Warehouse SA (Saudi Arabia)",
    subtitle: "Packages at Saudi warehouse — select today's packages for loading",
    emptyMessage: "No bookings at Warehouse SA. Move collected items from Booking Customer.",
    nextStatus: "loading_box",
    nextStatusLabel: "Move to Loading",
    csvFilename: "warehouse-sa-bookings.csv",
    cacheKey: "STAGE_move_to_warehouse_sa",
    allowEdit: true,
  },
  loadingList: {
    status: "loading_box",
    breadcrumb: "LOADING",
    title: "Loading List",
    subtitle: "Packages being loaded — select clients going on today's shipment",
    emptyMessage: "No packages in loading. Move items from Warehouse SA.",
    nextStatus: "shipment_manifest",
    nextStatusLabel: "Move to Shipment Manifest",
    csvFilename: "loading-box-bookings.csv",
    cacheKey: "STAGE_loading_box",
    allowEdit: true,
  },
  shipmentManifest: {
    status: "shipment_manifest",
    breadcrumb: "MANIFEST",
    title: "Shipment Manifest",
    subtitle: "Documentation and manifest — update details, then dispatch to Sri Lanka",
    emptyMessage: "No bookings on manifest. Move loaded packages from Loading List.",
    nextStatus: "arrived_warehouse_sl",
    nextStatusLabel: "Move to Warehouse SL",
    csvFilename: "shipment-manifest-bookings.csv",
    cacheKey: "STAGE_shipment_manifest",
    allowEdit: true,
  },
  warehouseSL: {
    status: "arrived_warehouse_sl",
    breadcrumb: "WAREHOUSE SL",
    title: "Warehouse SL (Sri Lanka)",
    subtitle: "Arrived in Sri Lanka — most move to delivery; unselected packages stay here (on hold)",
    emptyMessage: "No packages at Sri Lanka warehouse. Move shipments from Manifest.",
    nextStatus: "ready_for_delivery",
    nextStatusLabel: "Move to Delivery",
    csvFilename: "warehouse-sl-bookings.csv",
    cacheKey: "STAGE_arrived_warehouse_sl",
    allowEdit: true,
  },
  delivery: {
    status: "ready_for_delivery",
    breadcrumb: "DELIVERY",
    title: "Delivery",
    subtitle: "Ready for last-mile delivery — select and mark as delivered when complete",
    emptyMessage: "No packages ready for delivery. Move items from Warehouse SL.",
    nextStatus: "delivered",
    nextStatusLabel: "Mark as Delivered",
    csvFilename: "ready-for-delivery-bookings.csv",
    cacheKey: "STAGE_ready_for_delivery",
    allowEdit: true,
  },
  complete: {
    status: "delivered",
    breadcrumb: "COMPLETE",
    title: "Complete (Delivered)",
    subtitle: "Packages successfully delivered and signed for",
    emptyMessage: "No completed bookings. Move items from Delivery.",
    nextStatus: null,
    nextStatusLabel: null,
    csvFilename: "completed-bookings.csv",
    cacheKey: "STAGE_delivered",
    allowEdit: true,
  },
} satisfies Record<string, WorkflowStageConfig>;

export const ALL_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "collect_item", label: "Collect Item" },
  { value: "move_to_warehouse_sa", label: "Warehouse SA" },
  { value: "loading_box", label: "Loading" },
  { value: "shipment_manifest", label: "Shipment Manifest" },
  { value: "arrived_warehouse_sl", label: "Warehouse SL" },
  { value: "ready_for_delivery", label: "Ready for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];
