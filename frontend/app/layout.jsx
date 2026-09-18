import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Interview Prep Kit",
  description: "AI-powered interview preparation workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}