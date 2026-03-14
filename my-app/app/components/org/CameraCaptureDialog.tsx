"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
};

export default function CameraCaptureDialog({
  open,
  onClose,
  onCapture,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startRequestIdRef = useRef(0);

  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      try {
        video.pause();
      } catch {}

      try {
        video.srcObject = null;
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    const requestId = ++startRequestIdRef.current;

    try {
      setStarting(true);
      setError("");

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      if (requestId !== startRequestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      try {
        await video.play();
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        throw err;
      }
    } catch (err) {
      console.error(err);
      setError("Could not access the camera.");
      stopCamera();
    } finally {
      if (requestId === startRequestIdRef.current) {
        setStarting(false);
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!open) return;

    setCapturedDataUrl(null);
    void startCamera();

    return () => {
      startRequestIdRef.current += 1;
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  function handleTakePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (!videoWidth || !videoHeight) return;

    const squareSize = Math.min(videoWidth, videoHeight);
    const sx = Math.floor((videoWidth - squareSize) / 2);
    const sy = Math.floor((videoHeight - squareSize) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 900;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      video,
      sx,
      sy,
      squareSize,
      squareSize,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedDataUrl(dataUrl);
    stopCamera();
  }

  async function handleRetake() {
    setCapturedDataUrl(null);
    await startCamera();
  }

  function handleUsePhoto() {
    if (!capturedDataUrl) return;
    onCapture(capturedDataUrl);
    handleClose();
  }

  function handleClose() {
    startRequestIdRef.current += 1;
    stopCamera();
    setCapturedDataUrl(null);
    setError("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: "28px" },
          bgcolor: "var(--background)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: "-0.04em" }}
        >
          Take item photo
        </Typography>
        <Typography sx={{ mt: 0.5, color: "var(--muted)" }}>
          The square guide shows the crop used for the item card.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            bgcolor: "black",
            boxShadow: "var(--shadow)",
          }}
        >
          {capturedDataUrl ? (
            <Box
              component="img"
              src={capturedDataUrl}
              alt="Captured preview"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <Box
              component="video"
              ref={videoRef}
              muted
              playsInline
              autoPlay
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: error ? "none" : "block",
              }}
            />
          )}

          {!capturedDataUrl && !error && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.18)",
                  pointerEvents: "none",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "58%",
                  aspectRatio: "1 / 1",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "22px",
                  border: "2px dashed rgba(255,255,255,0.96)",
                  boxShadow: "0 0 0 999px rgba(0,0,0,0.16)",
                  pointerEvents: "none",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  left: 12,
                  bottom: 12,
                  px: 1.25,
                  py: 0.7,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.94)",
                  color: "var(--foreground)",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                }}
              >
                Card crop
              </Box>
            </>
          )}

          {starting && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(0,0,0,0.24)",
                color: "white",
                fontWeight: 700,
              }}
            >
              Starting camera…
            </Box>
          )}

          {error && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                p: 3,
                textAlign: "center",
                color: "white",
              }}
            >
              {error}
            </Box>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1.5 }}
        >
          <Typography sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            The saved image uses the center square inside the guide.
          </Typography>

          {capturedDataUrl && (
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid rgba(40, 199, 167, 0.24)",
                bgcolor: "var(--accent-soft)",
              }}
            >
              <Box
                component="img"
                src={capturedDataUrl}
                alt="Thumbnail preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          onClick={handleClose}
          sx={{
            borderRadius: 999,
            px: 2,
            color: "var(--foreground)",
          }}
        >
          Cancel
        </Button>

        <Stack direction="row" spacing={1}>
          {capturedDataUrl ? (
            <>
              <Button
                onClick={handleRetake}
                sx={{
                  borderRadius: 999,
                  px: 2,
                  bgcolor: "white",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Retake
              </Button>

              <Button
                onClick={handleUsePhoto}
                sx={{
                  borderRadius: 999,
                  px: 2.4,
                  bgcolor: "var(--accent)",
                  color: "#08352d",
                  textTransform: "none",
                  fontWeight: 800,
                  "&:hover": {
                    bgcolor: "var(--accent-strong)",
                    color: "white",
                  },
                }}
              >
                Use photo
              </Button>
            </>
          ) : (
            <Button
              onClick={handleTakePhoto}
              disabled={!!error || starting}
              sx={{
                borderRadius: 999,
                px: 2.4,
                bgcolor: "var(--accent)",
                color: "#08352d",
                textTransform: "none",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "var(--accent-strong)",
                  color: "white",
                },
              }}
            >
              Take photo
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}