import "./globals.css";

export const metadata = {
  title: "Yarn — Speak your day!",
  description: "Multi-user voice-to-text logbook generator for SIWES students.",
  manifest: "/manifest.json",
  icons: {
    icon: "/Logo-standalone-svg.svg",
    apple: "/Logo-standalone-png.png",
  },
};

export const viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="app-container">{children}</div>
      </body>
    </html>
  );
}
