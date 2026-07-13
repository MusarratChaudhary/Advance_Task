"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  ArrowLeft,
  Users,
  UserMinus,
  UserPlus,
  X,
  Search,
  Paperclip,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import socket from "@/socket/socket";
import useSocket from "@/hooks/useSocket";
import MessageBubble from "./MessageBubble";
import { Group, GroupMember } from "./CreateGroupModal";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

interface GroupMessage {
  _id: string;
  groupId: string;
  sender:
    | {
        _id: string;
        name: string;
        avatar?: string;
      }
    | string;
  text: string;
  imageUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  createdAt: string;
  isRead: boolean;
}

interface GroupChatWindowProps {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  allUsers: GroupMember[];
}

export default function GroupChatWindow({
  selectedGroup,
  setSelectedGroup,
  allUsers,
}: GroupChatWindowProps) {
  const { user: currentUser } = useAuth();
  useSocket(); // ensures socket is connected
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState<{ name: string } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [addSearch, setAddSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<Group | null>(selectedGroup);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    name: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (selectedGroup) {
      setActiveGroup(selectedGroup);
    } else {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile) {
        const t = setTimeout(() => setActiveGroup(null), 300);
        return () => clearTimeout(t);
      } else {
        setActiveGroup(null);
      }
    }
  }, [selectedGroup]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch messages when group changes
  useEffect(() => {
    if (!selectedGroup) {
      setMessages([]);
      setIsTyping(null);
      return;
    }

    setMessages([]);
    setIsTyping(null);

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/groups/${selectedGroup._id}/messages`);
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Fetch group messages error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Join group room
    socket.emit("joinGroup", { groupId: selectedGroup._id });
  }, [selectedGroup]);

  // Socket listeners for group messages
  useEffect(() => {
    const handleReceiveGroupMessage = (msg: GroupMessage) => {
      if (!selectedGroup || msg.groupId !== selectedGroup._id) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    const handleGroupTypingStatus = (data: {
      senderId: string;
      senderName?: string;
      isTyping: boolean;
    }) => {
      if (!selectedGroup) return;
      if (data.senderId === currentUser?._id) return;

      if (data.isTyping) {
        setIsTyping({ name: data.senderName || "Someone" });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(null), 2500);
      } else {
        setIsTyping(null);
      }
    };

    const handleGroupMessageDeleted = (data: {
      messageId: string;
      type: "me" | "everyone";
    }) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    };

    socket.on("receiveGroupMessage", handleReceiveGroupMessage);
    socket.on("groupTypingStatus", handleGroupTypingStatus);
    socket.on("groupMessageDeleted", handleGroupMessageDeleted);

    return () => {
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
      socket.off("groupTypingStatus", handleGroupTypingStatus);
      socket.off("groupMessageDeleted", handleGroupMessageDeleted);
    };
  }, [socket, selectedGroup, currentUser]);

  const stopTypingImmediately = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current && selectedGroup && socket.connected) {
      isTypingRef.current = false;
      socket.emit("groupStopTyping", { groupId: selectedGroup._id });
    }
  };

  const handleTypingInput = (text: string) => {
    if (!selectedGroup || !socket.connected) return;
    if (!text.trim()) {
      stopTypingImmediately();
      return;
    }
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("groupTyping", {
        groupId: selectedGroup._id,
        senderName: currentUser?.name || "Someone",
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit("groupStopTyping", { groupId: selectedGroup._id });
      }
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedFile({
          base64: reader.result,
          name: file.name,
          type: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if ((!trimmed && !selectedFile) || !selectedGroup || !socket.connected)
      return;

    setSending(true);
    socket.emit("sendGroupMessage", {
      groupId: selectedGroup._id,
      text: trimmed,
      attachment: selectedFile
        ? {
            base64: selectedFile.base64,
            name: selectedFile.name,
            type: selectedFile.type,
          }
        : undefined,
    });

    setMessage("");
    setSelectedFile(null);
    stopTypingImmediately();
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroup) return;
    try {
      const res = await api.delete(
        `/groups/${selectedGroup._id}/members/${memberId}`,
      );
      setSelectedGroup(res.data.group);
    } catch (err) {
      console.error("Remove member error:", err);
    }
  };

  const handleAddMembers = async (memberIds: string[]) => {
    if (!selectedGroup || memberIds.length === 0) return;
    try {
      const res = await api.post(`/groups/${selectedGroup._id}/members`, {
        members: memberIds,
      });
      setSelectedGroup(res.data.group);
      setShowAddMembers(false);
      setAddSearch("");
    } catch (err) {
      console.error("Add members error:", err);
    }
  };

  const isAdmin = selectedGroup?.admins.some((a) => a._id === currentUser?._id);

  const existingMemberIds = new Set(
    activeGroup?.members.map((m) => m._id) || [],
  );
  const availableToAdd = allUsers.filter(
    (u) =>
      !existingMemberIds.has(u._id) &&
      u.name.toLowerCase().includes(addSearch.toLowerCase()),
  );

  const [addSelected, setAddSelected] = useState<string[]>([]);

  const toggleAddMember = (id: string) => {
    setAddSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!activeGroup) {
    return (
      <section className="flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300 w-1/2 md:w-auto md:flex-1 shrink-0 md:shrink">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="mx-auto mb-3 text-orange-500" size={40} />
            <p>Select a group to start chatting</p>
          </div>
        </div>
      </section>
    );
  }

  const filteredMembers = activeGroup.members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  return (
    <section className="flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300 w-1/2 md:w-auto md:flex-1 shrink-0 md:shrink relative">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-white/10 p-5 flex-shrink-0">
        <button
          onClick={() => setSelectedGroup(null)}
          className="p-2 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 dark:text-zinc-400 transition cursor-pointer md:hidden flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="h-12 w-12 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {activeGroup.groupImage ? (
            <img
              src={
                activeGroup.groupImage.startsWith("http")
                  ? activeGroup.groupImage
                  : `${socketUrl}${activeGroup.groupImage}`
              }
              alt={activeGroup.groupName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Users size={22} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-zinc-900 dark:text-white truncate">
            {activeGroup.groupName}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {activeGroup.members.length} member
            {activeGroup.members.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
          title="Group Info"
        >
          <Users size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-messages-bg">
        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle
                className="mx-auto mb-3 text-orange-500"
                size={40}
              />
              <p>No messages yet. Say hello!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId =
              typeof msg.sender === "string" ? msg.sender : msg.sender._id;
            const isMe = senderId === currentUser?._id;
            const senderName =
              typeof msg.sender === "object" ? msg.sender.name : "";

            return (
              <div key={msg._id}>
                {!isMe && senderName && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1 ml-1">
                    {senderName}
                  </p>
                )}
                <MessageBubble
                  message={msg}
                  sender={isMe ? "me" : "other"}
                  onDelete={(messageId, type) => {
                    socket.emit("deleteGroupMessage", {
                      messageId,
                      groupId: activeGroup._id,
                      type,
                    });
                  }}
                />
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground italic animate-pulse">
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            {isTyping.name} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-white/10 p-4 flex-shrink-0">
        {selectedFile && (
          <div className="mb-3 flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 relative max-w-sm">
            {selectedFile.type.startsWith("image/") ? (
              <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={selectedFile.base64}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 flex-shrink-0">
                <Users size={22} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-500 cursor-pointer shadow-sm"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex gap-3 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white transition hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer flex-shrink-0"
          >
            <Paperclip size={20} />
          </button>

          <input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTypingInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeGroup.groupName}...`}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent px-4 py-3 outline-none transition focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />

          <button
            onClick={handleSend}
            disabled={sending || (!message.trim() && !selectedFile)}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>

      {/* Group Info Panel */}
      {showInfo && (
        <div className="absolute inset-0 z-30 bg-white dark:bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowInfo(false);
                  setShowAddMembers(false);
                  setAddSelected([]);
                }}
                className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg">
                Group Info
              </h3>
            </div>
            {isAdmin && !showAddMembers && (
              <button
                onClick={() => setShowAddMembers(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition cursor-pointer"
              >
                <UserPlus size={14} />
                Add
              </button>
            )}
          </div>

          {showAddMembers ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              {availableToAdd.map((u) => {
                const sel = addSelected.includes(u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => toggleAddMember(u._id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition cursor-pointer ${sel ? "bg-orange-50 dark:bg-orange-950/20" : "hover:bg-zinc-100 dark:hover:bg-white/5"}`}
                  >
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {u.avatar ? (
                        <img
                          src={
                            u.avatar.startsWith("http")
                              ? u.avatar
                              : `${socketUrl}${u.avatar}`
                          }
                          alt={u.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        u.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-zinc-900 dark:text-white">
                      {u.name}
                    </span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition ${sel ? "border-orange-500 bg-orange-500" : "border-zinc-300 dark:border-white/20"}`}
                    >
                      {sel && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}

              {availableToAdd.length === 0 && (
                <p className="text-center text-sm text-zinc-400 py-4">
                  No users available to add
                </p>
              )}

              {addSelected.length > 0 && (
                <button
                  onClick={() => {
                    handleAddMembers(addSelected);
                    setAddSelected([]);
                  }}
                  className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition cursor-pointer"
                >
                  Add {addSelected.length} member
                  {addSelected.length > 1 ? "s" : ""}
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Group avatar + name */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-orange-500 flex items-center justify-center text-white">
                  {activeGroup.groupImage ? (
                    <img
                      src={
                        activeGroup.groupImage.startsWith("http")
                          ? activeGroup.groupImage
                          : `${socketUrl}${activeGroup.groupImage}`
                      }
                      alt={activeGroup.groupName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users size={32} />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {activeGroup.groupName}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {activeGroup.members.length} members
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">
                Members
              </p>

              {filteredMembers.map((member) => {
                const memberIsAdmin = activeGroup.admins.some(
                  (a) => a._id === member._id,
                );
                const isSelf = member._id === currentUser?._id;
                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/5 transition"
                  >
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {member.avatar ? (
                        <img
                          src={
                            member.avatar.startsWith("http")
                              ? member.avatar
                              : `${socketUrl}${member.avatar}`
                          }
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {member.name}
                        {isSelf ? " (you)" : ""}
                      </p>
                      {memberIsAdmin && (
                        <span className="text-[10px] text-orange-500 font-semibold">
                          Admin
                        </span>
                      )}
                    </div>
                    {isAdmin && !isSelf && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                        title="Remove member"
                      >
                        <UserMinus size={15} />
                      </button>
                    )}
                    {isSelf && !isAdmin && (
                      <button
                        onClick={() => {
                          handleRemoveMember(member._id);
                          setSelectedGroup(null);
                        }}
                        className="text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
