"use client";

import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import RequestQuantityControl from "@/app/components/org/RequestQuantityControl";

type AggregateSource = {
  orgId: string;
  orgName: string;
  location: string;
  quantity: number;
  itemId: string;
  expiration?: string;
  urgency?: "low" | "medium" | "high";
};

type AggregateItem = {
  key: string;
  name: string;
  category: string;
  image: string;
  tags: string[];
  totalQuantity: number;
  sourceCount: number;
  sources: AggregateSource[];
};

type BrowseMode = "asking" | "offering";

type Props = {
  mode: BrowseMode;
  item: AggregateItem | null;
  requestSelection: {
    orgId: string;
    itemId: string;
    quantity: number;
  } | null;
  onSourceQuantityChange: (
    orgId: string,
    itemId: string,
    max: number,
    next: number
  ) => void;
  onRequest: () => void;
};

function formatExpiration(value?: string) {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${monthNames[Number(month) - 1] ?? month} ${Number(day)}, ${year}`;
}

function urgencyColor(urgency?: "low" | "medium" | "high") {
  if (urgency === "low") return "#2e7d32";
  if (urgency === "medium") return "#b26a00";
  return "#c62828";
}

export default function AggregatedItemDetail({
  mode,
  item,
  requestSelection,
  onSourceQuantityChange,
  onRequest,
}: Props) {
  const router = useRouter();

  if (!item) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: "28px",
          border: "1px solid var(--border)",
          bgcolor: "var(--surface)",
          boxShadow: "var(--shadow-soft)",
          minHeight: 620,
        }}
      >
        <Typography sx={{ color: "var(--muted)" }}>
          Select an item to see the full network view.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: "28px",
        border: "1px solid var(--border)",
        bgcolor: "var(--surface)",
        boxShadow: "var(--shadow-soft)",
        minHeight: 620,
      }}
    >
      <Stack spacing={2}>
        <Box
          component="img"
          src={item.image}
          alt={item.name}
          sx={{
            width: "100%",
            height: { xs: 220, md: 300 },
            objectFit: "cover",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            bgcolor: "var(--accent-soft)",
          }}
        />

        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 0.96,
              fontSize: { xs: "2rem", md: "2.7rem" },
            }}
          >
            {item.name}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            <Chip
              label={item.category}
              sx={{
                borderRadius: 999,
                bgcolor: "white",
                border: "1px solid var(--border)",
                textTransform: "capitalize",
                fontWeight: 700,
              }}
            />
            {item.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{
                  borderRadius: 999,
                  bgcolor: "#fafaf8",
                  border: "1px solid var(--border)",
                  fontWeight: 700,
                }}
              />
            ))}
            <Chip
              label={`Total quantity ${item.totalQuantity}`}
              sx={{
                borderRadius: 999,
                bgcolor: "var(--accent-soft)",
                color: "var(--accent-strong)",
                border: "1px solid rgba(40, 199, 167, 0.24)",
                fontWeight: 700,
              }}
            />
          </Stack>
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontSize: "1.14rem",
            }}
          >
            {mode === "offering"
              ? "Available from these places"
              : "Needed by these places"}
          </Typography>

          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            {item.sources.map((source) => {
              const active =
                requestSelection?.orgId === source.orgId &&
                requestSelection?.itemId === source.itemId;

              const askingClickable = mode === "asking";

              return (
                <Paper
                  key={`${source.orgId}-${source.itemId}`}
                  elevation={0}
                  onClick={() => {
                    if (askingClickable) {
                      router.push(`/org/${source.orgId}/user`);
                    }
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: "22px",
                    border: "1px solid",
                    borderColor: active
                      ? "rgba(40, 199, 167, 0.34)"
                      : "var(--border)",
                    bgcolor: active ? "#f7fffc" : "white",
                    cursor: askingClickable ? "pointer" : "default",
                    transition: "0.16s ease",
                    "&:hover": askingClickable
                      ? {
                          borderColor: "rgba(40, 199, 167, 0.34)",
                          boxShadow: "var(--shadow-soft)",
                        }
                      : undefined,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1.5}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {source.orgName}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.35,
                          color: "var(--muted)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {source.location}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 1 }}
                      >
                        <Chip
                          size="small"
                          label={
                            mode === "offering"
                              ? `Available ${source.quantity}`
                              : `Need ${source.quantity}`
                          }
                          sx={{
                            borderRadius: 999,
                            bgcolor: "var(--accent-soft)",
                            color: "var(--accent-strong)",
                            border: "1px solid rgba(40, 199, 167, 0.24)",
                            fontWeight: 700,
                          }}
                        />

                        {mode === "asking" && source.urgency && (
                          <Chip
                            size="small"
                            label={source.urgency}
                            sx={{
                              borderRadius: 999,
                              bgcolor: "white",
                              color: urgencyColor(source.urgency),
                              border: `1px solid ${urgencyColor(source.urgency)}22`,
                              textTransform: "capitalize",
                              fontWeight: 700,
                            }}
                          />
                        )}

                        {mode === "offering" && source.expiration && (
                          <Chip
                            size="small"
                            label={`Expires ${formatExpiration(source.expiration)}`}
                            sx={{
                              borderRadius: 999,
                              bgcolor: "#fff8e8",
                              color: "#8a5a00",
                              border: "1px solid rgba(255, 193, 7, 0.24)",
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>

                    {mode === "offering" && (
                      <RequestQuantityControl
                        value={active ? requestSelection?.quantity ?? 0 : 0}
                        max={source.quantity}
                        onChange={(next) =>
                          onSourceQuantityChange(
                            source.orgId,
                            source.itemId,
                            source.quantity,
                            next
                          )
                        }
                      />
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        {mode === "offering" && (
          <Box sx={{ pt: 0.5 }}>
            <Button
              disabled={!requestSelection}
              onClick={onRequest}
              sx={{
                borderRadius: 999,
                px: 2.5,
                py: 1.2,
                bgcolor: "var(--accent)",
                color: "white",
                fontWeight: 800,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "var(--accent-strong)",
                  color: "white",
                },
                "&.Mui-disabled": {
                  bgcolor: "#eef2f1",
                  color: "#92a19d",
                },
              }}
            >
              Request from selected organisation
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}