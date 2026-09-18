"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/kits",
      label: "My Kits",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={18} />
          </span>

          <span>Interview Prep</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 sm:flex">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      active
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <span className="hidden text-sm text-slate-500 md:block">
              {user.name || user.email}
            </span>

            <button
              onClick={handleLogout}
              className="secondary-button px-3"
              title="Log out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}