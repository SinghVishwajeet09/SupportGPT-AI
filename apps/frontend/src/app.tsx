import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { ProtectedRoute } from "./components/protected-route";
import { LoginPage, RegisterPage } from "./pages/auth-page";
import { ComingSoonPage, DashboardPage, ProfilePage } from "./pages/dashboard-page";
import { CreateTicketPage, TicketDetailPage, TicketListPage } from "./pages/ticket-pages";

export function App() {
  return <Routes><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route element={<ProtectedRoute/>}><Route element={<AppShell/>}><Route index element={<DashboardPage/>}/><Route path="tickets" element={<TicketListPage/>}/><Route path="tickets/new" element={<CreateTicketPage/>}/><Route path="tickets/:id" element={<TicketDetailPage/>}/><Route path="chat" element={<ComingSoonPage title="AI assistant" description="The grounded knowledge assistant is implemented after knowledge-base indexing in Phase 5."/>}/><Route path="notifications" element={<ComingSoonPage title="Notifications" description="In-app notifications will be added with ticket and automation events."/>}/><Route path="profile" element={<ProfilePage/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>;
}
