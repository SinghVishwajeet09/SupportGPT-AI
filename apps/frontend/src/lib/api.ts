import axios from "axios";
import type { ApiSuccess } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

let accessToken: string | null = sessionStorage.getItem("supportgpt_access_token");

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) sessionStorage.setItem("supportgpt_access_token", token);
  else sessionStorage.removeItem("supportgpt_access_token");
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const unwrap = <T>(response: { data: ApiSuccess<T> }): T => response.data.data;
export default api;
