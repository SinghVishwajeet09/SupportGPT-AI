import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../auth/auth-context";

const loginSchema = z.object({ email: z.email("Enter a valid email address."), password: z.string().min(1, "Enter your password.") });
const registerSchema = z.object({ name: z.string().trim().min(2, "Enter your name."), email: z.email("Enter a valid email address."), password: z.string().min(12, "Use at least 12 characters.") });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return <div className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10"><section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl shadow-slate-950/30"><Link to="/" className="mb-8 flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">S</span>SupportGPT AI</Link><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>{children}</section></div>;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  if (user) return <Navigate to="/" replace />;
  const submit = async (values: LoginValues) => { try { setError(undefined); await login(values.email, values.password); navigate(location.state?.from?.pathname ?? "/", { replace: true }); } catch (cause) { setError(errorMessage(cause)); } };
  return <AuthCard title="Welcome back" subtitle="Sign in to manage support with clarity and confidence."><form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-4"><Field label="Email" error={form.formState.errors.email?.message}><input autoComplete="email" {...form.register("email")} /></Field><Field label="Password" error={form.formState.errors.password?.message}><input type="password" autoComplete="current-password" {...form.register("password")} /></Field>{error && <p role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button disabled={form.formState.isSubmitting} className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">{form.formState.isSubmitting ? "Signing in…" : "Sign in"}</button></form><p className="mt-6 text-center text-sm text-slate-500">New customer? <Link className="font-medium text-indigo-600 hover:text-indigo-500" to="/register">Create an account</Link></p></AuthCard>;
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  if (user) return <Navigate to="/" replace />;
  const submit = async (values: RegisterValues) => { try { setError(undefined); await register(values.name, values.email, values.password); navigate("/", { replace: true }); } catch (cause) { setError(errorMessage(cause)); } };
  return <AuthCard title="Create your account" subtitle="Start with a secure customer workspace."><form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-4"><Field label="Name" error={form.formState.errors.name?.message}><input autoComplete="name" {...form.register("name")} /></Field><Field label="Email" error={form.formState.errors.email?.message}><input autoComplete="email" {...form.register("email")} /></Field><Field label="Password" error={form.formState.errors.password?.message}><input type="password" autoComplete="new-password" {...form.register("password")} /></Field>{error && <p role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button disabled={form.formState.isSubmitting} className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">{form.formState.isSubmitting ? "Creating account…" : "Create account"}</button></form><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-medium text-indigo-600 hover:text-indigo-500" to="/login">Sign in</Link></p></AuthCard>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700"><span>{label}</span><span className="mt-1.5 block [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-slate-300 [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-slate-900 [&_input]:outline-none [&_input:focus]:border-indigo-500 [&_input:focus]:ring-2 [&_input:focus]:ring-indigo-200">{children}</span>{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>; }
function errorMessage(cause: unknown) { return typeof cause === "object" && cause !== null && "response" in cause ? "Unable to sign in with those details." : "Something went wrong. Please try again."; }
