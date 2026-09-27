export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
  avatar: string;
};

export type SafeUser = Omit<User, "password">;
