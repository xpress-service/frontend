import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from './_components/ClientProviders';

// Use system fonts instead of Google Fonts for better reliability
const systemFonts = {
  className: 'font-system',
  variable: '--font-system --font-inter --font-poppins'
};

// Enhanced metadata for better SEO and PWA support
export const metadata: Metadata = {
  title: {
    default: "ServiceXpress - Your Premier Service Hub",
    template: "%s | ServiceXpress"
  },
  description: "Connect with top-rated service providers in your area. From home repairs to personal services, find trusted professionals on ServiceXpress.",
  keywords: ["services", "providers", "marketplace", "home services", "professionals", "booking"],
  authors: [{ name: "ServiceXpress Team" }],
  creator: "ServiceXpress",
  publisher: "ServiceXpress",
  metadataBase: new URL('https://servicexpress.com'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: "ServiceXpress - Your Premier Service Hub",
    description: "Connect with top-rated service providers in your area. From home repairs to personal services, find trusted professionals on ServiceXpress.",
    url: 'https://servicexpress.com',
    siteName: 'ServiceXpress',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ServiceXpress - Connect with Service Providers'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Servi-Xpress - Your Premier Service Hub",
    description: "Connect with top-rated service providers in your area.",
    images: ['/twitter-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

// Viewport configuration for better mobile experience
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  colorScheme: 'light'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={systemFonts.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Preload critical resources */}
        
        {/* Performance and Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        
        {/* Progressive Web App */}
        <meta name="application-name" content="Servi-Xpress" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Servi-Xpress" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body 
        className={`${systemFonts.className} antialiased`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
