import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/tickets", label: "Tickets" },
  { to: "/chat", label: "AI assistant" },
  { to: "/notifications", label: "Notifications" },
  { to: "/profile", label: "Profile" }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleName = user!.role === "CUSTOMER" ? "Customer" : user!.role === "AGENT" ? "Support agent" : "Administrator";

  const signOut = async () => { await logout(); navigate("/login", { replace: true }); };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm text-white">S</span>SupportGPT AI</Link>
          <div className="flex items-center gap-3 text-sm"><span className="hidden text-slate-500 sm:block">{roleName}</span><button onClick={() => void signOut()} className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100">Sign out</button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl md:grid-cols-[15rem_1fr]">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 md:min-h-[calc(100vh-4rem)] md:border-b-0 md:border-r">
          <nav className="flex gap-1 overflow-x-auto md:flex-col">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}>{item.label}</NavLink>)}</nav>
        </aside>
        <main className="p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
