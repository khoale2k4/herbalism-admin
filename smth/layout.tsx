import type { Metadata } from "next";
import "./[locale]/globals.css";

export const metadata: Metadata = {
  title: 'Herbalism Admin',
  description: 'The remedy to the challenge of logistics',
  applicationName: 'Herbalism Admin',
  keywords: ["react", "server components", 'nextjs', 'tailwind', 'logistics'],
  icons: [{ rel: "favicon", type: 'image/ico', url: "/favicon.ico" }],
  generator: 'nhatdev',
  authors: [{ name: 'nhatdev' }],
  creator: 'nhatdev',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className="h-dvh w-dvw">
      <body>
        {children}
      </body>
    </html>
  );
};