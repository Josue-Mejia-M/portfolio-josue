import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell/AppShell";
import "./globals.css";

const themeInitializationScript = `
  (function () {
    var theme = "light";
    var storedTheme = null;

    try {
      storedTheme = localStorage.getItem("portfolio-theme");
    } catch (error) {}

    if (storedTheme === "light" || storedTheme === "dark") {
      theme = storedTheme;
    } else {
      try {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          theme = "dark";
        }
      } catch (error) {}
    }

    document.documentElement.setAttribute("data-theme", theme);
  })();
`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portafolio de Josué Mejía",
  description: "Portafolio personal de Josué Mejía.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerifDisplay.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
