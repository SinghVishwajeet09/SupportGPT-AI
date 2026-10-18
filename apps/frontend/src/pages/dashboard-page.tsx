import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import api, { unwrap } from "../lib/api";
import type { User } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const profile = useQuery({ queryKey: ["current-user"], queryFn: async () => unwrap<User>(await api.get("/auth/me")), initialData: user! });
  const name = profile.data.name.split(" ")[0];
  const isCustomer = user!.role === "CUSTOMER";
  return <div className="space-y-8"><section className="rounded-2xl bg-slate-950 px-6 py-8 text-white sm:px-8"><p className="text-sm font-medium text-indigo-300">{isCustomer ? "Customer workspace" : user!.role === "AGENT" ? "Agent workspace" : "Administration workspace"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you, {name}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{isCustomer ? "Get fast answers or connect with your support team when you need help." : "Your operational workspace is ready. Ticket and analytics modules will appear as the next implementation phases are completed."}</p><div className="mt-6 flex flex-wrap gap-3">{isCustomer && <Link className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100" to="/chat">Ask SupportGPT</Link>}<Link className="rounded-md border border-slate-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" to="/tickets">View tickets</Link></div></section><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><StatusCard title="Secure session" detail={profile.isFetching ? "Refreshing account details…" : "Your authenticated workspace is active."} state="Connected"/><StatusCard title="Ticket workspace" detail="Ticket management is scheduled for Phase 3." state="Planned"/><StatusCard title="Knowledge assistant" detail="RAG-powered help is scheduled for Phase 5." state="Planned"/></section></div>;
}

function StatusCard({ title, detail, state }: { title: string; detail: string; state: string }) { return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-900">{title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p><span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{state}</span></article>; }

export function ComingSoonPage({ title, description }: { title: string; description: string }) { return <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="text-sm font-medium text-indigo-600">On the roadmap</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">{description}</p></section>; }

export function ProfilePage() { const { user } = useAuth(); return <section><h1 className="text-2xl font-semibold tracking-tight">Profile</h1><p className="mt-2 text-sm text-slate-500">Account data comes from your authenticated session.</p><dl className="mt-6 max-w-xl divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white"><Row label="Name" value={user!.name}/><Row label="Email" value={user!.email}/><Row label="Role" value={user!.role}/><Row label="Verification" value={user!.isVerified ? "Verified" : "Pending verification"}/></dl></section>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-900">{value}</dd></div>; }
