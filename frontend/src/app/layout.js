import "./globals.css";
import PWAProvider from "@/components/PWAProvider";

export const metadata = {
  title: "Yarn — Speak your day!",
  description: "Multi-user voice-to-text logbook generator for SIWES students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yarn",
  },
  icons: {
    icon: "/Logo-standalone-svg.svg",
    apple: "/Logo-standalone-png.png",
  },
  verification: {
    google: "wCLd5DBp240wzRU9bkXucfxU9jO7YzZsZg5DTTyiLIE",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('yarn_theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background font-body text-body text-ink-900 min-h-screen flex flex-col antialiased selection:bg-accent-100">
        <PWAProvider>
          <div className="flex-1 flex flex-col relative w-full pt-14 pb-20 bg-background">
            {children}
          </div>
        </PWAProvider>
      </body>
    </html>
  );
}
