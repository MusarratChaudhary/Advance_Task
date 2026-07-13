"use client";

import { useState, useEffect } from "react";

import Sidebar, { User } from "./Sidebar";
import ChatWindow from "./ChatWindow";
import GroupChatWindow from "./GroupChatWindow";
import { Group, GroupMember } from "./CreateGroupModal";
import api from "@/lib/axios";

export default function ChatLayout() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<GroupMember[]>([]);

  // Fetch all users once so both Sidebar and GroupChatWindow can use them
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setAllUsers(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const hasSelection = selectedUser !== null || selectedGroup !== null;

  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div
        className={`
                flex h-full w-[200vw] md:w-full transition-transform duration-300 ease-in-out
                ${hasSelection ? "-translate-x-1/2 md:translate-x-0" : "translate-x-0"}
            `}
      >
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={(user) => {
            setSelectedUser(user);
            if (user) setSelectedGroup(null);
          }}
          selectedGroup={selectedGroup}
          setSelectedGroup={(group) => {
            setSelectedGroup(group);
            if (group) setSelectedUser(null);
          }}
          groups={groups}
          setGroups={setGroups}
          allUsers={allUsers}
        />

        {selectedGroup ? (
          <GroupChatWindow
            selectedGroup={selectedGroup}
            setSelectedGroup={(group) => {
              setSelectedGroup(group);
              if (group) {
                setGroups((prev) =>
                  prev.map((g) => (g._id === group._id ? group : g)),
                );
              }
            }}
            allUsers={allUsers}
          />
        ) : (
          <ChatWindow
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        )}
      </div>
    </div>
  );
}
