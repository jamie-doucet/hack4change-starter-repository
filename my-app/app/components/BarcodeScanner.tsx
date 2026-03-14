"use client";

import { useEffect, useRef } from "react";

type Props = {
  onDetected: (code: string) => void;
};

export default function BarcodeScanner({ onDetected }: Props) {
  const regionId = "barcode-reader";
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5QrcodeScanner(
        regionId,
        {
          fps: 10,
          qrbox: { width: 220, height: 140 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0],
        },
        false
      );

      scanner.render(
        (decodedText: string) => {
          onDetected(decodedText);
          scanner.clear().catch(() => {});
        },
        () => {}
      );

      scannerRef.current = scanner;
    }

    start();

    return () => {
      cancelled = true;
      scannerRef.current?.clear?.().catch(() => {});
    };
  }, [onDetected]);

  return <div id={regionId} />;
}