import { http, HttpResponse, delay } from "msw";
import { getUsers, addRegisteredUser, toSafeUser } from "./db";
import { User } from "@grit/types-kit";

const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

const createToken = (userId: string, type: "access" | "refresh") => {
  const payload = {
    userId,
    type,
    exp: Date.now() + (type === "access" ? ACCESS_TOKEN_TTL : REFRESH_TOKEN_TTL),
  };
  return btoa(JSON.stringify(payload));
};

const parseToken = (token: string) => {
  try {
    return JSON.parse(atob(token)) as {
      userId: string;
      type: "access" | "refresh";
      exp: number;
    };
  } catch {
    return null;
  }
};

const unauthorized = () => HttpResponse.json({ message: "Unauthorized" }, { status: 401 });

export const handlers = [
  /**
   * Handler for registration.
   */
  http.post("/api/auth/register", async ({ request }) => {
    await delay(500);

    const { email, password, name } = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };

    if (!email || !password || !name) {
      return HttpResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return HttpResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const users = getUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return HttpResponse.json({ message: "Email is already taken" }, { status: 409 });
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password,
      name,
      role: "user",
      avatar: `https://robohash.org/set_set4/${encodeURIComponent(email)}.png`,
    };

    addRegisteredUser(newUser);

    return HttpResponse.json({
      user: toSafeUser(newUser),
      accessToken: createToken(newUser.id, "access"),
      refreshToken: createToken(newUser.id, "refresh"),
    });
  }),

  /**
   * Handler for login.
   */
  http.post("/api/auth/login", async ({ request }) => {
    await delay(500);

    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    const user = getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    return HttpResponse.json({
      user: toSafeUser(user),
      accessToken: createToken(user.id, "access"),
      refreshToken: createToken(user.id, "refresh"),
    });
  }),

  /**
   * Handler for current user.
   */
  http.get("/api/auth/me", async ({ request }) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const payload = token ? parseToken(token) : null;

    if (!payload || payload.exp < Date.now()) return unauthorized();

    const user = getUsers().find((u) => u.id === payload.userId);
    if (!user) return unauthorized();

    return HttpResponse.json({ user: toSafeUser(user) });
  }),

  /**
   * Handler for refresh token.
   */
  http.post("/api/auth/refresh", async ({ request }) => {
    await delay(300);

    const { refreshToken } = (await request.json()) as { refreshToken: string };
    const payload = parseToken(refreshToken);

    if (!payload || payload.type !== "refresh" || payload.exp < Date.now()) {
      return HttpResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    const user = getUsers().find((u) => u.id === payload.userId);
    if (!user) return unauthorized();

    return HttpResponse.json({
      accessToken: createToken(user.id, "access"),
      refreshToken: createToken(user.id, "refresh"),
    });
  }),

  /**
   * Handler for logout.
   */
  http.post("/api/auth/logout", async () => {
    await delay(300);
    return HttpResponse.json({ message: "Logged out" });
  }),
];
