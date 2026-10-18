export type Role = "CUSTOMER" | "AGENT" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
};

export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };
