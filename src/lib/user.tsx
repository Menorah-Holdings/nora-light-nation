import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/queryKeys";
import type { ApiUser, UserRole } from "@/lib/api/types";
import { useSession } from "@/lib/api/hooks/useAuth";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";

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
  role?: UserRole;
  image?: string | null;
  emailVerified?: boolean;
  subscriptionTier?: "FREE" | "PREMIUM";
}

export const MOCK_USERS: NoraUser[] = [
  { id: "u1", name: "NoraPlus Listener", handle: "nora_listener", email: "listener@noraplus.io", avatarInitial: "N", creator_status: "Not Applied", platform_role: "user", role: "USER" },
  { id: "u2", name: "Ada Okafor", handle: "ada_o", email: "ada@noraplus.io", avatarInitial: "A", creator_status: "Under Review", platform_role: "user", role: "USER" },
  { id: "u3", name: "Pastor David Adeleke", handle: "pastordavid", email: "david@noraplus.io", avatarInitial: "D", creator_status: "Approved", platform_role: "user", role: "CREATOR" },
  { id: "u4", name: "Joy Mwangi", handle: "joy_m", email: "joy@noraplus.io", avatarInitial: "J", creator_status: "Rejected", platform_role: "user", rejectionReason: "We need additional information about your content and rights ownership before approval.", role: "USER" },
  { id: "u5", name: "NoraPlus Team", handle: "nora_admin", email: "team@noraplus.io", avatarInitial: "T", creator_status: "Approved", platform_role: "nora_team", role: "ADMIN" },
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
  isAuthenticated: boolean;
  isLoading: boolean;
  isPrototypeUser: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const sessionQuery = useSession();
  const sessionUser = sessionQuery.data?.user ?? null;
  const isAuthenticated = Boolean(sessionUser?.id);
  const currentUserQuery = useCurrentUser(isAuthenticated);

  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return MOCK_USERS[0].id;
    return localStorage.getItem(ACTIVE_USER_KEY) || MOCK_USERS[0].id;
  });
  const [statusOverride, setStatusOverride] = useState<CreatorStatus | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem(`${STATUS_OVERRIDE_KEY}:${activeId}`) as CreatorStatus | null) || null;
  });

  const apiUser = currentUserQuery.data ?? sessionUser;
  const isPrototypeUser = !apiUser;

  const user = useMemo<NoraUser>(() => {
    if (apiUser) return mapApiUser(apiUser);

    const base = MOCK_USERS.find((u) => u.id === activeId) || MOCK_USERS[0];
    return { ...base, creator_status: statusOverride ?? base.creator_status };
  }, [activeId, apiUser, statusOverride]);

  const setActiveUserId = useCallback((id: string) => {
    if (apiUser) return;

    setActiveId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_USER_KEY, id);
      setStatusOverride((localStorage.getItem(`${STATUS_OVERRIDE_KEY}:${id}`) as CreatorStatus | null) || null);
    }
  }, [apiUser]);

  const setCreatorStatus = useCallback((status: CreatorStatus) => {
    if (apiUser) return;

    setStatusOverride(status);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STATUS_OVERRIDE_KEY}:${activeId}`, status);
    }
  }, [activeId, apiUser]);

  const refreshUser = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    ]);
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await authApi.signOut().catch(() => undefined);
    queryClient.setQueryData(queryKeys.auth.session(), null);
    queryClient.removeQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  }, [queryClient]);

  const value = useMemo<UserContextValue>(() => ({
    user,
    users: apiUser ? [user] : MOCK_USERS,
    isApprovedCreator: user.creator_status === "Approved",
    isNoraTeam: user.platform_role === "nora_team",
    isAuthenticated,
    isLoading: sessionQuery.isLoading || (isAuthenticated && currentUserQuery.isLoading),
    isPrototypeUser,
    setActiveUserId,
    setCreatorStatus,
    refreshUser,
    signOut,
  }), [
    apiUser,
    currentUserQuery.isLoading,
    isAuthenticated,
    isPrototypeUser,
    refreshUser,
    sessionQuery.isLoading,
    setActiveUserId,
    setCreatorStatus,
    signOut,
    user,
  ]);

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

function mapApiUser(apiUser: ApiUser): NoraUser {
  const role = apiUser.role ?? "USER";
  const name = apiUser.name?.trim() || apiUser.email.split("@")[0] || "NoraPlus Listener";
  const handle = toHandle(name, apiUser.email);

  return {
    id: apiUser.id,
    name,
    handle,
    email: apiUser.email,
    avatarInitial: getInitial(name, apiUser.email),
    creator_status: roleToCreatorStatus(role),
    platform_role: role === "ADMIN" ? "nora_team" : "user",
    role,
    image: apiUser.image,
    emailVerified: apiUser.emailVerified,
    subscriptionTier: apiUser.subscriptionTier,
  };
}

function roleToCreatorStatus(role: UserRole): CreatorStatus {
  if (role === "ADMIN" || role === "CREATOR") return "Approved";
  return "Not Applied";
}

function getInitial(name: string, email: string): string {
  return (name.trim()[0] || email.trim()[0] || "N").toUpperCase();
}

function toHandle(name: string, email: string): string {
  const source = name || email.split("@")[0] || "noraplus";
  return source.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "noraplus";
}

