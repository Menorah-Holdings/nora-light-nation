import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CreatorStatus = "Not Applied" | "Under Review" | "Approved" | "Rejected";
export type PlatformRole = "user" | "nora_team";

export interface NoraUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarInitial: string;
  creator_status: CreatorStatus;
  platform_role: PlatformRole;
  rejectionReason?: string;
}

export const MOCK_USERS: NoraUser[] = [
  { id: "u1", name: "NoraPlus Listener", handle: "nora_listener", email: "listener@noraplus.io", avatarInitial: "N", creator_status: "Not Applied", platform_role: "user" },
  { id: "u2", name: "Ada Okafor", handle: "ada_o", email: "ada@noraplus.io", avatarInitial: "A", creator_status: "Under Review", platform_role: "user" },
  { id: "u3", name: "Pastor David Adeleke", handle: "pastordavid", email: "david@noraplus.io", avatarInitial: "D", creator_status: "Approved", platform_role: "user" },
  { id: "u4", name: "Joy Mwangi", handle: "joy_m", email: "joy@noraplus.io", avatarInitial: "J", creator_status: "Rejected", platform_role: "user", rejectionReason: "We need additional information about your content and rights ownership before approval." },
  { id: "u5", name: "NoraPlus Team", handle: "nora_admin", email: "team@noraplus.io", avatarInitial: "T", creator_status: "Approved", platform_role: "nora_team" },
];

const ACTIVE_USER_KEY = "nora_active_user_id";
const STATUS_OVERRIDE_KEY = "nora_creator_status_override";

interface UserContextValue {
  user: NoraUser;
  setActiveUserId: (id: string) => void;
  setCreatorStatus: (status: CreatorStatus) => void;
  users: NoraUser[];
  isApprovedCreator: boolean;
  isNoraTeam: boolean;
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
      isApprovedCreator: user.creator_status === "Approved",
      isNoraTeam: user.platform_role === "nora_team",
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
    case "Under Review": return "Application Pending";
    case "Approved": return "Creator";
    case "Rejected": return "Application Declined";
  }
};

export const creatorNavLabel = (status: CreatorStatus): string => {
  switch (status) {
    case "Approved": return "Creator Studio";
    case "Under Review": return "Application Under Review";
    case "Rejected": return "Application Declined";
    default: return "Create on NoraPlus";
  }
};
