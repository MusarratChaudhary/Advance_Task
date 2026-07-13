"use client";

import { useEffect, useRef, useState } from "react";

import {
  MessageCircle,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import { User } from "./Sidebar";

import MessageBubble from "./MessageBubble";

import MessageInput from "./MessageInput";

import useSocket from "@/hooks/useSocket";

import { useAuth } from "@/context/AuthContext";

import api from "@/lib/axios";

interface ChatWindowProps {
  selectedUser: User | null;

  setSelectedUser?: (user: User | null) => void;
}

interface Message {
  _id: string;

  sender:
    | string
    | {
        _id: string;
      };

  receiver:
    | string
    | {
        _id: string;
      };

  text: string;

  isRead: boolean;

  createdAt: string;

  imageUrl?: string;

  fileUrl?: string;

  fileType?: string;

  fileName?: string;
}

export default function ChatWindow({
  selectedUser,
  setSelectedUser,
}: ChatWindowProps) {
  const socket = useSocket();

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  const [activeUser, setActiveUser] = useState<User | null>(selectedUser);

  useEffect(() => {
    if (selectedUser) {
      setActiveUser(selectedUser);
    } else {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile) {
        const timer = setTimeout(() => {
          setActiveUser(null);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setActiveUser(null);
      }
    }
  }, [selectedUser]);

  const [loading, setLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [clearingChat, setClearingChat] = useState(false);

  const [showClearSuccess, setShowClearSuccess] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  // Clear chat handler
  const handleClearChat = async () => {
    if (!activeUser) return;
    try {
      setClearingChat(true);
      await api.delete(`/messages/${activeUser._id}`);
      setMessages([]);
      setShowClearConfirm(false);
      setShowClearSuccess(true);
      setTimeout(() => setShowClearSuccess(false), 2500);
    } catch (error) {
      console.error("Clear chat error:", error);
    } finally {
      setClearingChat(false);
    }
  };

  // Auto Scroll

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch Messages

  const fetchMessages = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      const response = await api.get(`/messages/${selectedUser._id}`);

      setMessages(response.data.messages);
    } catch (error) {
      console.log("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  // User Change

  useEffect(() => {
    if (selectedUser) {
      setMessages([]);

      setIsTyping(false);

      fetchMessages();
    } else {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

      if (isMobile) {
        const timer = setTimeout(() => {
          setMessages([]);

          setIsTyping(false);
        }, 300);

        return () => clearTimeout(timer);
      } else {
        setMessages([]);

        setIsTyping(false);
      }
    }
  }, [selectedUser]);

  // Mark messages read when opening chat

  useEffect(() => {
    if (selectedUser && socket.connected) {
      socket.emit("markAsRead", {
        senderId: selectedUser._id,
      });
    }
  }, [selectedUser, socket]);

  // Receive Messages

  useEffect(() => {
    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item._id === message._id);

        if (exists) {
          return prev;
        }

        return [...prev, message];
      });

      // If message comes from selected user
      // mark as read

      if (selectedUser && message.sender === selectedUser._id) {
        socket.emit("markAsRead", {
          senderId: selectedUser._id,
        });
      }
    };

    const handleTypingStatus = (data: {
      senderId: string;
      isTyping: boolean;
    }) => {
      if (selectedUser && data.senderId === selectedUser._id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      type: "me" | "everyone";
    }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
    };

    const handleMessageRead = (data: { readerId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,

          isRead: true,
        })),
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.on("messageRead", handleMessageRead);

    socket.on("typingStatus", handleTypingStatus);

    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);

      socket.off("messageRead", handleMessageRead);

      socket.off("typingStatus", handleTypingStatus);

      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, selectedUser]);

  return (
    <section
      className={`
       flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300
       w-1/2 md:w-auto md:flex-1 shrink-0 md:shrink
`}
    >
      {activeUser ? (
        <>
          {/* Header */}

          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 p-4 md:p-5">
            {/* Back Button (Mobile Only) */}
            <button
              onClick={() => setSelectedUser?.(null)}
              className="p-2 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 dark:text-zinc-400 transition cursor-pointer md:hidden flex-shrink-0"
              title="Back to Chats"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Avatar */}
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-orange-500 text-white font-semibold flex-shrink-0">
              {activeUser.avatar ? (
                <img
                  src={
                    activeUser.avatar.startsWith("http")
                      ? activeUser.avatar
                      : `${socketUrl}${activeUser.avatar}`
                  }
                  alt={activeUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                activeUser.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Name + Status */}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-zinc-900 dark:text-white truncate">
                {activeUser.name}
              </h2>
              <p
                className={`text-xs font-medium ${activeUser.isOnline ? "text-green-500" : "text-zinc-400"}`}
              >
                {activeUser.isOnline ? "Online" : "Offline"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
                title="Voice Call"
              >
                <Phone size={18} />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
                title="Video Call"
              >
                <Video size={18} />
              </button>

              {/* More Options dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
                  title="More Options"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 z-50 min-w-[160px] rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowClearConfirm(true);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}

          <div
            className="
flex-1
space-y-4
overflow-y-auto
p-6
chat-messages-bg
"
          >
            {loading ? (
              <p className="text-center text-muted-foreground">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <div
                className="
flex
h-full
items-center
justify-center
"
              >
                <div
                  className="
text-center
text-muted-foreground
"
                >
                  <MessageCircle
                    className="
mx-auto
mb-3
text-orange-500
"
                    size={40}
                  />

                  <p>Start conversation with {activeUser.name}</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  sender={
                    typeof message.sender === "string"
                      ? message.sender === currentUser?._id
                        ? "me"
                        : "other"
                      : message.sender._id === currentUser?._id
                        ? "me"
                        : "other"
                  }
                />
              ))
            )}

            {isTyping && activeUser && (
              <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground italic animate-pulse">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                {activeUser.name} is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <MessageInput receiverId={activeUser._id} />

          {/* Clear Chat Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15 mx-auto">
                  <Trash2 size={22} className="text-red-500" />
                </div>
                <h3 className="text-center text-base font-semibold text-zinc-900 dark:text-white mb-1">
                  Clear Chat
                </h3>
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  Are you sure you want to clear this chat?
                  <br />
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    This action cannot be undone.
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={clearingChat}
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearChat}
                    disabled={clearingChat}
                    className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 active:scale-95 transition disabled:opacity-60 cursor-pointer"
                  >
                    {clearingChat ? "Clearing..." : "Clear Chat"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {showClearSuccess && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-3 shadow-2xl border border-white/10 dark:border-zinc-200/20 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CheckCircle2
                size={17}
                className="text-orange-500 flex-shrink-0"
              />
              <span className="text-sm font-medium text-white dark:text-zinc-900 whitespace-nowrap">
                Chat cleared successfully
              </span>
            </div>
          )}
        </>
      ) : (
        <div
          className="
flex
flex-1
items-center
justify-center
"
        >
          <div
            className="
text-center
text-muted-foreground
"
          >
            <MessageCircle
              className="
mx-auto
mb-3
text-orange-500
"
              size={40}
            />

            <p>Select a user to start chatting</p>
          </div>
        </div>
      )}
    </section>
  );
}
