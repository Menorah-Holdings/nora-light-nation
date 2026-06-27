import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CreatorStatus = "Not Applied" | "Under Review" | "Approved" | "Rejected";

export interface NoraUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarInitial: string;
  creator_status: CreatorStatus;
  rejectionReason?: string;
}

export const MOCK_USERS: NoraUser[] = [
  { id: "u1", name: "Nora Listener", handle: "nora_listener", email: "listener@nora.app", avatarInitial: "N", creator_status: "Not Applied" },
  { id: "u2", name: "Ada Okafor", handle: "ada_o", email: "ada@nora.app", avatarInitial: "A", creator_status: "Under Review" },
  { id: "u3", name: "Pastor David Adeleke", handle: "pastordavid", email: "david@nora.app", avatarInitial: "D", creator_status: "Approved" },
  { id: "u4", name: "Joy Mwangi", handle: "joy_m", email: "joy@nora.app", avatarInitial: "J", creator_status: "Rejected", rejectionReason: "We need additional information about your content and rights ownership before approval." },
];

const ACTIVE_USER_KEY = "nora_active_user_id";
const STATUS_OVERRIDE_KEY = "nora_creator_status_override";

interface UserContextValue {
  user: NoraUser;
  setActiveUserId: (id: string) => void;
  setCreatorStatus: (status: CreatorStatus) => void;
  users: NoraUser[];
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return MOCK_USERS[0].id;
    return localStorage.getItem(ACTIVE_USER_KEY) || MOCK_USERS[0].id;
  });
  const [statusOverride, setStatusOverride] = useState<CreatorStatus | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem(`${STATUS_OVERRIDE_KEY}:${activeId}`) as CreatorStatus | null) || null;
  });

  useEffect(() => {
    localStorage.setItem(ACTIVE_USER_KEY, activeId);
    setStatusOverride((localStorage.getItem(`${STATUS_OVERRIDE_KEY}:${activeId}`) as CreatorStatus | null) || null);
  }, [activeId]);

  const value = useMemo<UserContextValue>(() => {
    const base = MOCK_USERS.find(u => u.id === activeId) || MOCK_USERS[0];
    const user: NoraUser = { ...base, creator_status: statusOverride ?? base.creator_status };
    return {
      user,
      users: MOCK_USERS,
      setActiveUserId: (id) => setActiveId(id),
      setCreatorStatus: (status) => {
        setStatusOverride(status);
        localStorage.setItem(`${STATUS_OVERRIDE_KEY}:${activeId}`, status);
      },
    };
  }, [activeId, statusOverride]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export const creatorBadgeLabel = (status: CreatorStatus): string => {
  switch (status) {
    case "Not Applied": return "Listener";
    case "Under Review": return "Application Under Review";
    case "Approved": return "Verified Creator";
    case "Rejected": return "Application Not Approved";
  }
};
