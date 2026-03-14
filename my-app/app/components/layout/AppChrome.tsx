"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: <HomeRoundedIcon />,
  },
	{
	label: "Profile",
	href: "/org/humanity-project",
	icon: <PersonRoundedIcon />,
	},
  {
    label: "Messages",
    href: "/messages/member-org",
    icon: <ForumRoundedIcon />,
  },
  {
    label: "Help",
    href: "/help",
    icon: <HelpOutlineRoundedIcon />,
  },
];

function matchPath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppChrome({ children }: Props) {
  const pathname = usePathname();

  const currentValue =
    navItems.find((item) => matchPath(pathname, item.href))?.href ?? "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "var(--background)",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: "none", md: "flex" },
          bgcolor: "rgba(255,255,255,0.92)",
          color: "var(--foreground)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "72px",
            maxWidth: 1400,
            width: "100%",
            mx: "auto",
            px: { md: 2, lg: 3 },
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.04em",
              fontSize: "1.3rem",
              color: "var(--foreground)",
            }}
          >
            GMHSC
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) => {
              const active = matchPath(pathname, item.href);

              return (
							<Box
								key={item.href}
								component={Link}
								href={item.href}
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: 1,
									px: 1.6,
									py: 1,
									borderRadius: 999,
									textDecoration: "none",
									bgcolor: active ? "var(--accent)" : "transparent",
									color: active ? "white" : "var(--foreground)",
									fontWeight: 800,
									transition: "0.18s ease",
									"& svg": {
										color: active ? "white" : "currentColor",
									},
									"& .nav-label": {
										color: active ? "white" : "inherit",
									},
									"&:hover": {
										bgcolor: active ? "var(--accent-strong)" : "#f7f7f4",
										color: active ? "white" : "var(--foreground)",
									},
									"&:hover svg": {
										color: active ? "white" : "currentColor",
									},
									"&:hover .nav-label": {
										color: active ? "white" : "inherit",
									},
								}}
							>
								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										color: "inherit",
									}}
								>
									{item.icon}
								</Box>

								<Typography
									component="span"
									className="nav-label"
									sx={{
										fontSize: "0.95rem",
										fontWeight: 800,
										color: "inherit",
									}}
								>
									{item.label}
								</Typography>
							</Box>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "100vh",
          pt: { xs: 0, md: "72px" },
          pb: { xs: "78px", md: 0 },
        }}
      >
        {children}
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          bgcolor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <BottomNavigation
          showLabels
          value={currentValue}
          sx={{
            height: 78,
            bgcolor: "transparent",
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              color: "var(--muted)",
              pt: 1,
            },
            "& .Mui-selected": {
              color: "var(--accent-strong)",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.76rem",
              fontWeight: 700,
              mt: 0.25,
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.href}
              value={item.href}
              label={item.label}
              icon={item.icon}
              component={Link}
              href={item.href}
            />
          ))}
        </BottomNavigation>
      </Box>
    </Box>
  );
}