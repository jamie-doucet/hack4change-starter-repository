"use client";

import { useId, useRef } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";

type Props = {
  image: string;
  onImageChange: (value: string) => void;
};

function compressFileToDataUrl(
  file: File,
  size = 320,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not compress image."));
          return;
        }

        const srcW = img.width;
        const srcH = img.height;
        const square = Math.min(srcW, srcH);
        const sx = Math.floor((srcW - square) / 2);
        const sy = Math.floor((srcH - square) / 2);

        ctx.drawImage(img, sx, sy, square, square, 0, 0, size, size);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => reject(new Error("Could not load image."));
      img.src = typeof reader.result === "string" ? reader.result : "";
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
  const uploadInputId = useId();
  const cameraInputId = useId();

  const uploadRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  const handlePickUpload = () => {
    uploadRef.current?.click();
  };

  const handlePickCamera = () => {
    cameraRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressFileToDataUrl(file);
      onImageChange(dataUrl);
    } catch (error) {
      console.error(error);
      window.alert("Could not load that image.");
    } finally {
      event.target.value = "";
    }
  };

  return (
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
          Upload an image or take one with your camera.
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
        {image ? (
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
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "var(--accent-soft)",
            }}
          >
            <Typography sx={{ color: "var(--muted)" }}>
              No image selected
            </Typography>
          </Box>
        )}

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
          onClick={handlePickCamera}
          startIcon={<PhotoCameraRoundedIcon />}
          sx={{
            borderRadius: 999,
            px: 2,
            bgcolor: "var(--accent)",
            color: "#ffffff",
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
        <Button
          onClick={handlePickUpload}
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
      </Stack>

      <input
        id={uploadInputId}
        ref={uploadRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <input
        id={cameraInputId}
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileChange}
      />
    </Stack>
  );
}
