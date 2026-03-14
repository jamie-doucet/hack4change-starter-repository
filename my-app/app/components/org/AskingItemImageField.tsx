"use client";

import { useId, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import CameraCaptureDialog from "./CameraCaptureDialog";

type Props = {
  image: string;
  onImageChange: (value: string) => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image."));
    };

    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export default function AskingItemImageField({
  image,
  onImageChange,
}: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handlePick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      onImageChange(dataUrl);
    } catch (error) {
      console.error(error);
      window.alert("Could not load that image.");
    } finally {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Stack spacing={1.5}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Item image
          </Typography>
          <Typography
            sx={{
              mt: 0.35,
              color: "var(--muted)",
              fontSize: "0.92rem",
            }}
          >
            Upload an image or open the camera. The preview below shows the current image.
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            bgcolor: "white",
            minHeight: 220,
            boxShadow: "var(--shadow)",
          }}
        >
          <Box
            component="img"
            src={image}
            alt="Item preview"
            sx={{
              display: "block",
              width: "100%",
              height: 220,
              objectFit: "cover",
              bgcolor: "var(--accent-soft)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.14), rgba(0,0,0,0.02))",
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
              border: "1px solid rgba(255,255,255,0.8)",
              fontSize: "0.82rem",
              fontWeight: 800,
              letterSpacing: "0.01em",
            }}
          >
            Current image
          </Box>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            onClick={handlePick}
            startIcon={<UploadRoundedIcon />}
            sx={{
              borderRadius: 999,
              px: 2,
              bgcolor: "white",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "var(--accent-soft)",
                borderColor: "rgba(40, 199, 167, 0.32)",
              },
            }}
          >
            Upload image
          </Button>

          <Button
            onClick={() => setCameraOpen(true)}
            startIcon={<PhotoCameraRoundedIcon />}
            sx={{
              borderRadius: 999,
              px: 2,
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
            Camera
          </Button>
        </Stack>

        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Stack>

      <CameraCaptureDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => onImageChange(dataUrl)}
      />
    </>
  );
}