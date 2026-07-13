declare module "react-qr-scanner" {
  import type { CSSProperties, ComponentType } from "react";

  export interface QrScannerProps {
    delay?: number | false;
    style?: CSSProperties;
    onError: (error: any) => void;
    onScan: (result: string | null) => void;
    onLoad?: () => void;
    onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    facingMode?: "environment" | "user" | string;
    legacyMode?: boolean;
    maxImageSize?: number;
  }

  const QrScanner: ComponentType<QrScannerProps>;
  export default QrScanner;
}
