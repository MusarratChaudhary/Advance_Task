"use client";

import { useState, useRef, useEffect } from "react";

import { Send, Paperclip, X, File } from "lucide-react";

import socket from "@/socket/socket";

interface MessageInputProps {
  receiverId: string;
}

export default function MessageInput({ receiverId }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const isTypingRef = useRef(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    name: string;
    type: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Max size is 10MB.");
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const stopTypingImmediately = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current && receiverId && socket.connected) {
      isTypingRef.current = false;

      socket.emit("stopTyping", { receiverId });
    }
  };

  const handleTyping = (text: string) => {
    if (!receiverId || !socket.connected) return;

    if (!text.trim()) {
      stopTypingImmediately();

      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;

      socket.emit("typing", { receiverId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;

        socket.emit("stopTyping", { receiverId });
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      stopTypingImmediately();
    };
  }, [receiverId]);

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if ((!trimmedMessage && !selectedFile) || !receiverId) {
      return;
    }

    if (!socket.connected) {
      console.log("Socket not connected");

      return;
    }

    try {
      setSending(true);

      socket.emit("sendMessage", {
        receiverId,

        text: trimmedMessage,

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
    } catch (error) {
      console.log("Message send error:", error);

      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-200 dark:border-white/10 p-4">
      {selectedFile && (
        <div className="mb-3 flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 relative max-w-sm">
          {selectedFile.type.startsWith("image/") ? (
            <div className="h-16 w-16 overflow-hidden rounded-lg bg-black/10 border border-zinc-200 dark:border-white/10 flex-shrink-0">
              <img
                src={selectedFile.base64}
                alt="preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 flex-shrink-0">
              <File size={28} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-white/50">
              {selectedFile.type || "Unknown file type"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer shadow-sm animate-in fade-in zoom-in"
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
            handleTyping(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="
                    flex-1
                    rounded-xl
                    border
                    border-zinc-200
                    dark:border-white/10
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-orange-500
                    text-zinc-900
                    dark:text-white
                    placeholder-zinc-400
                    dark:placeholder-zinc-500
                    "
        />

        <button
          onClick={handleSend}
          disabled={sending || (!message.trim() && !selectedFile)}
          className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500
                    text-white
                    transition
                    hover:bg-orange-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    "
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}