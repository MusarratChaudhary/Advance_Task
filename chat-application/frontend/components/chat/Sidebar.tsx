"use client";

import { useEffect, useState } from "react";
import { Search, CircleUserRound, Users, Plus } from "lucide-react";
import CreateGroupModal, { Group, GroupMember } from "./CreateGroupModal";

import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import socket from "@/socket/socket";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  unreadCount?: number;
}

interface SidebarProps {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  allUsers: User[];
}

export default function Sidebar({
  selectedUser,
  setSelectedUser,
  selectedGroup,
  setSelectedGroup,
  groups,
  setGroups,
  allUsers,
}: SidebarProps) {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.users);
    } catch (error) {
      console.log("Users fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data.groups);
    } catch (error) {
      console.log("Groups fetch error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  // Unread count socket handlers (private chats)
  useEffect(() => {
    const handleUnreadCountUpdate = (data: {
      senderId: string;
      unreadCount: number;
    }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === data.senderId ? { ...u, unreadCount: data.unreadCount } : u,
        ),
      );
    };

    const handleReceiveMessage = (message: any) => {
      const senderId =
        typeof message.sender === "string"
          ? message.sender
          : message.sender._id;
      if (
        senderId !== currentUser?._id &&
        (!selectedUser || selectedUser._id !== senderId)
      ) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === senderId
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u,
          ),
        );
      }
    };

    socket.on("unreadCountUpdate", handleUnreadCountUpdate);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [currentUser, selectedUser]);

  const handleGroupCreated = (group: Group) => {
    setGroups([group, ...groups]);
    setSelectedGroup(group);
    setSelectedUser(null);
    setActiveTab("groups");
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="h-full flex flex-col border-r border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300 w-1/2 md:w-80 md:max-w-sm shrink-0">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-orange-500">ChatSphere</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 dark:text-zinc-400 transition cursor-pointer"
              title="New Group"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <p className="mt-1 text-sm text-muted-foreground font-medium bg-gradient-to-r from-orange-600 via-purple-400 to-pink-600 bg-clip-text text-transparent">
           Connect <span className="text-orange-400">•</span> Chat <span className="text-purple-400">•</span> Collaborate
        </p>

        {/* Search */}
        <div className="relative mt-5">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "chats" ? "Search users..." : "Search groups..."
            }
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent py-3 pl-10 pr-4 outline-none transition focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex mt-4 gap-1 bg-zinc-100 dark:bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === "chats"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <CircleUserRound size={15} />
            Chats
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === "groups"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <Users size={15} />
            Groups
            {groups.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                {groups.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Private Chats Tab */}
        {activeTab === "chats" &&
          (loading ? (
            <p className="text-center text-sm text-muted-foreground">
              Loading users...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No users found
            </p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                    setUsers((prev) =>
                      prev.map((u) =>
                        u._id === user._id ? { ...u, unreadCount: 0 } : u,
                      ),
                    );
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition ${
                    selectedUser?._id === user._id
                      ? "bg-orange-50 dark:bg-orange-950/20"
                      : "hover:bg-zinc-100 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-orange-500 text-white">
                      {user.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `${socketUrl}${user.avatar}`
                          }
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CircleUserRound size={28} />
                      )}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${user.isOnline ? "bg-green-500" : "bg-gray-500"}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>

                  {user.unreadCount && user.unreadCount > 0 ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white flex-shrink-0">
                      {user.unreadCount}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ))}

        {/* Groups Tab */}
        {activeTab === "groups" &&
          (filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400">
                <Users size={24} />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                No groups yet.
                <br />
                Create one with the + button.
              </p>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition cursor-pointer"
              >
                <Plus size={15} />
                New Group
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => {
                    setSelectedGroup(group);
                    setSelectedUser(null);
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition ${
                    selectedGroup?._id === group._id
                      ? "bg-orange-50 dark:bg-orange-950/20"
                      : "hover:bg-zinc-100 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-orange-500 text-white flex-shrink-0">
                    {group.groupImage ? (
                      <img
                        src={
                          group.groupImage.startsWith("http")
                            ? group.groupImage
                            : `${socketUrl}${group.groupImage}`
                        }
                        alt={group.groupName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users size={22} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                      {group.groupName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {group.members.length} member
                      {group.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ))}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        users={allUsers}
        onGroupCreated={handleGroupCreated}
      />
    </aside>
  );
}
