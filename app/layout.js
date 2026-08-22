import "./globals.css";

export const metadata = {
  title: "Society Maintenance Tracker",
  description: "Raise, track, and resolve society maintenance complaints",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
