"use client";

import { useState } from "react";
import { MoreVertical, File } from "lucide-react";
import socket from "@/socket/socket";

interface MessageBubbleProps {
  message: {
    _id: string;

    text: string;

    isRead: boolean;

    createdAt: string;

    imageUrl?: string;

    fileUrl?: string;

    fileType?: string;

    fileName?: string;
  };

  sender: "me" | "other";

  onDelete?: (messageId: string, type: "me" | "everyone") => void;
}

export default function MessageBubble({
  message,
  sender,
  onDelete,
}: MessageBubbleProps) {
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  const [showMenu, setShowMenu] = useState(false);

  const handleDeleteForMe = () => {
    if (onDelete) {
      onDelete(message._id, "me");
    } else {
      socket.emit("deleteMessage", { messageId: message._id, type: "me" });
    }
    setShowMenu(false);
  };

  const handleDeleteForEveryone = () => {
    if (onDelete) {
      onDelete(message._id, "everyone");
    } else {
      socket.emit("deleteMessage", {
        messageId: message._id,
        type: "everyone",
      });
    }
    setShowMenu(false);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`
            flex
            ${sender === "me" ? "justify-end" : "justify-start"}
            `}
    >
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}

      <div
        className={`
                group
                relative
                flex
                items-center
                gap-2
                ${sender === "me" ? "flex-row-reverse" : "flex-row"}
                `}
      >
        <div
          className={`
                    max-w-xs
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    shadow-sm
                    ${
                      sender === "me"
                        ? "bg-orange-500 text-white rounded-br-none"
                        : "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white rounded-bl-none"
                    }
                    `}
        >
          {message.imageUrl && (
            <div className="mb-2 max-w-full overflow-hidden rounded-lg border border-white/10 shadow-sm max-h-60 flex items-center justify-center bg-black/5 flex-shrink-0">
              <img
                src={`${socketUrl}${message.imageUrl}`}
                alt="Shared image"
                className="max-h-60 max-w-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() =>
                  window.open(`${socketUrl}${message.imageUrl}`, "_blank")
                }
              />
            </div>
          )}

          {message.fileUrl && (
            <a
              href={`${socketUrl}${message.fileUrl}`}
              download={message.fileName || "file"}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                            mb-2
                            flex
                            items-center
                            gap-3
                            p-3
                            rounded-xl
                            border
                            transition
                            cursor-pointer
                            ${
                              sender === "me"
                                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                                : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                            }
                            `}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white flex-shrink-0">
                <File size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {message.fileName || "Shared File"}
                </p>
                <p className="text-[10px] opacity-70">Click to download</p>
              </div>
            </a>
          )}

          {message.text && <p className="break-words">{message.text}</p>}

          <div
            className={`
                        mt-2
                        flex
                        items-center
                        justify-end
                        gap-1
                        text-[11px]
                        ${
                          sender === "me"
                            ? "text-white/80"
                            : "text-zinc-500 dark:text-white/50"
                        }
                        `}
          >
            <span>{formattedTime}</span>

            {sender === "me" && (
              <span
                className="
                                text-xs
                                "
              >
                {message.isRead ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 transition-opacity cursor-pointer duration-200"
        >
          <MoreVertical size={14} />
        </button>

        {showMenu && (
          <div
            className={`
                        absolute
                        z-20
                        w-36
                        rounded-xl
                        border
                        border-zinc-200
                        dark:border-white/10
                        bg-white
                        dark:bg-zinc-900
                        p-1.5
                        shadow-lg
                        ${sender === "me" ? "left-0 top-10" : "right-0 top-10"}
                        `}
          >
            <button
              onClick={handleDeleteForMe}
              className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Delete for me
            </button>
            {sender === "me" && (
              <button
                onClick={handleDeleteForEveryone}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
              >
                Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
