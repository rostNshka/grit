import { User, SafeUser } from "@grit/types-kit";

const STORAGE_KEY = "grit_users";

const SEED_USERS: User[] = [
  {
    id: "1",
    email: "admin@grit.dev",
    password: "qwerty123",
    name: "Admin",
    role: "admin",
    avatar: "https://robohash.org/set_set4/admin-avatar.png",
  },
  {
    id: "2",
    email: "user@grit.dev",
    password: "qwerty123",
    name: "Grit User",
    role: "user",
    avatar: "https://robohash.org/set_set4/user-avatar.png",
  },
];

export const getRegisteredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
};

export const saveRegisteredUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const addRegisteredUser = (user: User) => {
  saveRegisteredUsers([...getRegisteredUsers(), user]);
};

export const getUsers = (): User[] => {
  return [...SEED_USERS, ...getRegisteredUsers()];
};

export const toSafeUser = (user: User): SafeUser => {
  const { password: _, ...safe } = user;
  return safe;
};
