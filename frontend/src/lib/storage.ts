import type { Employee } from "../types";

const USER_KEY = "staffora_user";

export const storage = {
  getUser: (): Employee | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Employee;
    } catch {
      return null;
    }
  },
  setUser: (user: Employee | null) => {
    if (!user) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};
