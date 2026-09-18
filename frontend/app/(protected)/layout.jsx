import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function ProtectedLayout({
  children,
}) {
  return (
    <ProtectedRoute>
      <Navbar />

      <main className="page-container py-8">
        {children}
      </main>
    </ProtectedRoute>
  );
}