"use client";

import { Box, Container, Paper, Stack, Typography } from "@mui/material";

const textTop = `Help Page
Hi there! If you're not sure how to use any part of this system, this page is meant to explain.

Navigation buttons
There are 4 tabs available to click at any time from anywhere on the website. 

Help, of course, brings you here. 

The Home button brings you to [this] page, where you can see what's on everyone's profile all in one place. You can choose "I'm asking" to see where you might wanna send a request, or choose "I'm offering" to browse all current wishlist items, good for someone who's trying to make their donation count. Then below that stuff when you scroll down there is a map and list of all GMHSC member organisations. If you click on one of them, it brings you to their profile.`;

const textAfterHome = `Next is your own member organisation's Profile. Lots of things can be done from here, the most important being to update the lists. More on that later. You can also edit your information and bio to personalise what people see when they click on your profile. People can reach out to you from here!`;

const textAfterProfile = `Lastly, you can go to your active conversations with this Messages tab. You might see a notification pop up here when the system finds a match! That means someone is offering something that's on your wishlist, and you'll be prompted to request those items directly in your conversation with them. Any discussion or planning that may be helpful to sharing resources can take place in the messages. To start a new conversation, you can go to the relevant member organisation's profile and click Message in the top right corner.`;

const textUsingLists = `Using the lists
On your own member organisation's profile:`;

const textAnotherOrg = `On another member organisation's profile:`;

const textContributor = `From a contributor's point of view:`;

const textMakingTrade = `Making a trade`;

const textIntended = `Intended functionality
Anyone who works at any member organisation can facilitate the sharing of resources (anything from socks to chairs) on this website as needed. It connects individual GHMSC member organisations, showing their information and linking webpages related to donations where applicable. Instead of texting and emailing all over the place, everything resource-sharing can be centralized here.  Those who take donations may be checking their messages daily and updating their wishlist. On occasions when there's a sudden surplus of something, for example, a dozen fresh squashes were donated, but only 2 are needed in a recipe. Whoever is left with the excess 10 can add them to their organisation's offerings list by snapping a picture and moving on with their day. Eventually, a pickup or delivery should be coordinated in the messages, and once the request is fulfilled, the squashes just come off the list. Maybe the person driving to get them stops at a second location for apples, as discussed in a separate request. There's no need to keep a full inventory here. We simply take a picture of the things that would be better used in another location and through collaboration, we make sure everyone gets what they need. 

Plus, potential donors can see exactly what to bring where for maximum impact at that time in particular.`;

function TextBlock({ text, large = false }: { text: string; large?: boolean }) {
  return (
    <Typography
      sx={{
        whiteSpace: "pre-line",
        color: "var(--foreground)",
        fontSize: large ? { xs: "1rem", md: "1.02rem" } : { xs: "0.98rem", md: "1rem" },
        lineHeight: 1.9,
      }}
    >
      {text}
    </Typography>
  );
}

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <Box
      sx={{
        mt: 2,
        mb: 1,
        width: "100%",
        minHeight: { xs: 210, md: 320 },
        borderRadius: "26px",
        border: "1px solid rgba(40, 199, 167, 0.22)",
        bgcolor: "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(245,255,251,0.96))",
        background:
          "radial-gradient(circle at top left, rgba(49,237,199,0.18), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,251,249,0.98))",
        boxShadow: "0 18px 45px rgba(0,0,0,0.06)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "999px",
            bgcolor: "rgba(49,237,199,0.16)",
            border: "1px solid rgba(40, 199, 167, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "16px solid var(--accent-strong)",
              ml: 0.5,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            fontSize: { xs: "1rem", md: "1.08rem" },
            textAlign: "center",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            color: "var(--muted)",
            fontSize: "0.92rem",
            textAlign: "center",
            maxWidth: 420,
          }}
        >
          Replace this block with a walkthrough video or screen recording.
        </Typography>
      </Stack>
    </Box>
  );
}

function SectionCard({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: "30px",
        border: accent
          ? "1px solid rgba(40, 199, 167, 0.22)"
          : "1px solid var(--border)",
        bgcolor: accent ? "rgba(255,255,255,0.98)" : "var(--surface)",
        boxShadow: accent
          ? "0 24px 60px rgba(0,0,0,0.07)"
          : "var(--shadow-soft)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </Paper>
  );
}

export default function SupportPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 2, md: 4 },
        background:
          "radial-gradient(circle at top, rgba(49,237,199,0.08), transparent 25%), var(--background)",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <SectionCard accent>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "inline-flex",
                  width: "fit-content",
                  px: 1.4,
                  py: 0.75,
                  borderRadius: 999,
                  bgcolor: "rgba(49,237,199,0.14)",
                  border: "1px solid rgba(40, 199, 167, 0.22)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    fontWeight: 800,
                    color: "var(--accent-strong)",
                  }}
                >
                  Support
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.06em",
                  fontWeight: 900,
                }}
              >
                Help Page
              </Typography>

              <Typography
                sx={{
                  maxWidth: 860,
                  color: "var(--muted)",
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.9,
                }}
              >
                Hi there! If you're not sure how to use any part of this system,
                this page is meant to explain.
              </Typography>
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack spacing={2}>
              <TextBlock
                text={`Navigation buttons
There are 4 tabs available to click at any time from anywhere on the website. 

Help, of course, brings you here. 

The Home button brings you to [this] page, where you can see what's on everyone's profile all in one place. You can choose "I'm asking" to see where you might wanna send a request, or choose "I'm offering" to browse all current wishlist items, good for someone who's trying to make their donation count. Then below that stuff when you scroll down there is a map and list of all GMHSC member organisations. If you click on one of them, it brings you to their profile.`}
                large
              />
              <VideoPlaceholder label="Home page intro video" />
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack spacing={2}>
              <TextBlock text={textAfterHome} large />
              <VideoPlaceholder label="Profile page intro video" />
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack spacing={2}>
              <TextBlock text={textAfterProfile} large />
              <VideoPlaceholder label="Messages page intro video" />
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack spacing={2.5}>
              <TextBlock text={textUsingLists} large />
              <VideoPlaceholder label="Using your own organisation profile video" />

              <TextBlock text={textAnotherOrg} large />
              <VideoPlaceholder label="Using another organisation profile video" />

              <TextBlock text={textContributor} large />
              <VideoPlaceholder label="Contributor point of view video" />
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack spacing={2}>
              <TextBlock text={textMakingTrade} large />
              <VideoPlaceholder label="Making a trade demonstration video" />
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack spacing={2}>
              <TextBlock text={textIntended} large />
              <VideoPlaceholder label="Audio placeholder" />
            </Stack>
          </SectionCard>
        </Stack>
      </Container>
    </Box>
  );
}
