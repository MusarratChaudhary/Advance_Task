import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";

import User from "../models/User.js";
import Message from "../models/Message.js";
import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";

import { socketAuth } from "./socket.middleware.js";

const saveAttachment = (base64Data: string, fileName: string): string => {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const buffer = Buffer.from(matches[2], "base64");
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadDir, uniqueFileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${uniqueFileName}`;
};

interface SocketWithUser extends Socket {
  user?: {
    id: string;
  };
}

// Store Online Users
const onlineUsers = new Map<string, string>();

export const socketHandler = (io: Server) => {
  // Socket Authentication
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const authSocket = socket as SocketWithUser;

    console.log("🟢 Socket Connected:", authSocket.id);

    const userId = authSocket.user?.id;

    try {
      if (userId) {
        onlineUsers.set(userId, authSocket.id);

        await User.findByIdAndUpdate(userId, { isOnline: true });

        console.log("User Online:", userId);

        // Join all group rooms this user belongs to
        const userGroups = await Group.find({ members: userId }).select("_id");
        for (const g of userGroups) {
          authSocket.join(`group:${g._id.toString()}`);
        }
      }
    } catch (error) {
      console.error("Online status error:", error);
    }

    // =========================
    // SEND PRIVATE MESSAGE
    // =========================

    authSocket.on(
      "sendMessage",
      async (data: {
        receiverId: string;
        text?: string;
        attachment?: {
          base64: string;
          name: string;
          type: string;
        };
      }) => {
        try {
          const { receiverId, text, attachment } = data;
          const senderId = authSocket.user?.id;

          if (!senderId || !receiverId) return;
          if (!text?.trim() && !attachment) return;

          let fileUrl: string | undefined;
          let imageUrl: string | undefined;
          let fileType: string | undefined;
          let fileName: string | undefined;

          if (
            attachment &&
            attachment.base64 &&
            attachment.name &&
            attachment.type
          ) {
            try {
              const savedPath = saveAttachment(
                attachment.base64,
                attachment.name,
              );
              fileType = attachment.type;
              fileName = attachment.name;
              if (attachment.type.startsWith("image/")) {
                imageUrl = savedPath;
              } else {
                fileUrl = savedPath;
              }
            } catch (err) {
              console.error("Attachment saving error:", err);
              return;
            }
          }

          const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text: (text || "").trim(),
            imageUrl,
            fileUrl,
            fileType,
            fileName,
          });

          const receiverSocket = onlineUsers.get(receiverId);

          if (receiverSocket) {
            io.to(receiverSocket).emit("receiveMessage", message);
          }

          // Emit updated unreadCount to receiver
          const unreadCount = await Message.countDocuments({
            sender: senderId,
            receiver: receiverId,
            isRead: false,
            deletedBy: { $ne: receiverId },
          });
          if (receiverSocket) {
            io.to(receiverSocket).emit("unreadCountUpdate", {
              senderId,
              unreadCount,
            });
          }

          // Echo back to sender
          authSocket.emit("receiveMessage", message);
        } catch (error) {
          console.error("Send message error:", error);
        }
      },
    );

    // =========================
    // MARK MESSAGE AS READ
    // =========================

    authSocket.on("markAsRead", async (data) => {
      try {
        const readerId = authSocket.user?.id;
        const { senderId } = data;

        if (!readerId || !senderId) return;

        await Message.updateMany(
          { sender: senderId, receiver: readerId, isRead: false },
          { isRead: true },
        );

        const senderSocket = onlineUsers.get(senderId);
        if (senderSocket) {
          io.to(senderSocket).emit("messageRead", { readerId });
        }

        // Reset unread count for reader
        authSocket.emit("unreadCountUpdate", {
          senderId,
          unreadCount: 0,
        });
      } catch (error) {
        console.error("Read status error:", error);
      }
    });

    // =========================
    // TYPING INDICATOR
    // =========================

    authSocket.on("typing", (data: { receiverId: string }) => {
      const senderId = authSocket.user?.id;
      if (!senderId || !data?.receiverId) return;

      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", {
          senderId,
          isTyping: true,
        });
      }
    });

    authSocket.on("stopTyping", (data: { receiverId: string }) => {
      const senderId = authSocket.user?.id;
      if (!senderId || !data?.receiverId) return;

      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", {
          senderId,
          isTyping: false,
        });
      }
    });

    // =========================
    // DELETE PRIVATE MESSAGE
    // =========================

    authSocket.on(
      "deleteMessage",
      async (data: { messageId: string; type: "me" | "everyone" }) => {
        try {
          const currentUser = authSocket.user?.id;
          if (!currentUser || !data?.messageId) return;

          const message = await Message.findById(data.messageId);
          if (!message) return;

          const isSender = message.sender.toString() === currentUser;
          const isReceiver = message.receiver.toString() === currentUser;

          if (!isSender && !isReceiver) return;

          if (data.type === "everyone") {
            if (!isSender) return;

            await Message.findByIdAndDelete(data.messageId);

            const receiverSocketId = onlineUsers.get(
              message.receiver.toString(),
            );
            const senderSocketId = onlineUsers.get(message.sender.toString());

            if (receiverSocketId) {
              io.to(receiverSocketId).emit("messageDeleted", {
                messageId: data.messageId,
                type: "everyone",
              });
            }
            if (senderSocketId) {
              io.to(senderSocketId).emit("messageDeleted", {
                messageId: data.messageId,
                type: "everyone",
              });
            }
          } else {
            await Message.findByIdAndUpdate(data.messageId, {
              $addToSet: { deletedBy: currentUser },
            });

            authSocket.emit("messageDeleted", {
              messageId: data.messageId,
              type: "me",
            });
          }
        } catch (error) {
          console.error("Delete message error:", error);
        }
      },
    );

    // =========================
    // JOIN GROUP ROOM
    // =========================

    authSocket.on("joinGroup", (data: { groupId: string }) => {
      if (data?.groupId) {
        authSocket.join(`group:${data.groupId}`);
      }
    });

    // =========================
    // SEND GROUP MESSAGE
    // =========================

    authSocket.on(
      "sendGroupMessage",
      async (data: {
        groupId: string;
        text?: string;
        attachment?: {
          base64: string;
          name: string;
          type: string;
        };
      }) => {
        try {
          const senderId = authSocket.user?.id;
          const { groupId, text, attachment } = data;

          if (!senderId || !groupId) return;
          if (!text?.trim() && !attachment) return;

          // Verify sender is a member
          const group = await Group.findById(groupId);
          if (!group) return;

          const isMember = group.members.some((m) => m.toString() === senderId);
          if (!isMember) return;

          let fileUrl: string | undefined;
          let imageUrl: string | undefined;
          let fileType: string | undefined;
          let fileName: string | undefined;

          if (
            attachment &&
            attachment.base64 &&
            attachment.name &&
            attachment.type
          ) {
            try {
              const savedPath = saveAttachment(
                attachment.base64,
                attachment.name,
              );
              fileType = attachment.type;
              fileName = attachment.name;
              if (attachment.type.startsWith("image/")) {
                imageUrl = savedPath;
              } else {
                fileUrl = savedPath;
              }
            } catch (err) {
              console.error("Group attachment saving error:", err);
              return;
            }
          }

          const message = await GroupMessage.create({
            groupId,
            sender: senderId,
            text: (text || "").trim(),
            imageUrl,
            fileUrl,
            fileType,
            fileName,
          });

          // Populate sender for the broadcast
          const populated = await GroupMessage.findById(message._id).populate(
            "sender",
            "name email avatar",
          );

          // Broadcast to all members in the room (including sender)
          io.to(`group:${groupId}`).emit("receiveGroupMessage", populated);
        } catch (error) {
          console.error("Send group message error:", error);
        }
      },
    );

    // =========================
    // GROUP TYPING INDICATOR
    // =========================

    authSocket.on(
      "groupTyping",
      (data: { groupId: string; senderName: string }) => {
        const senderId = authSocket.user?.id;
        if (!senderId || !data?.groupId) return;

        authSocket.to(`group:${data.groupId}`).emit("groupTypingStatus", {
          senderId,
          senderName: data.senderName,
          isTyping: true,
        });
      },
    );

    authSocket.on("groupStopTyping", (data: { groupId: string }) => {
      const senderId = authSocket.user?.id;
      if (!senderId || !data?.groupId) return;

      authSocket.to(`group:${data.groupId}`).emit("groupTypingStatus", {
        senderId,
        isTyping: false,
      });
    });

    // =========================
    // DELETE GROUP MESSAGE
    // =========================

    authSocket.on(
      "deleteGroupMessage",
      async (data: {
        messageId: string;
        groupId: string;
        type: "me" | "everyone";
      }) => {
        try {
          const currentUser = authSocket.user?.id;
          if (!currentUser || !data?.messageId || !data?.groupId) return;

          const message = await GroupMessage.findById(data.messageId);
          if (!message) return;

          const isSender = message.sender.toString() === currentUser;

          if (data.type === "everyone") {
            if (!isSender) return;

            await GroupMessage.findByIdAndDelete(data.messageId);

            io.to(`group:${data.groupId}`).emit("groupMessageDeleted", {
              messageId: data.messageId,
              type: "everyone",
            });
          } else {
            await GroupMessage.findByIdAndUpdate(data.messageId, {
              $addToSet: { deletedBy: currentUser },
            });

            authSocket.emit("groupMessageDeleted", {
              messageId: data.messageId,
              type: "me",
            });
          }
        } catch (error) {
          console.error("Delete group message error:", error);
        }
      },
    );

    // =========================
    // WEBRTC SIGNALING
    // =========================

    // Caller initiates a call
    authSocket.on(
      "call:initiate",
      (data: {
        to: string;
        callType: "audio" | "video";
        offer: RTCSessionDescriptionInit;
        callerName: string;
        callerAvatar?: string;
      }) => {
        const callerId = authSocket.user?.id;
        if (!callerId || !data?.to) return;

        const receiverSocket = onlineUsers.get(data.to);
        if (receiverSocket) {
          io.to(receiverSocket).emit("call:incoming", {
            from: callerId,
            callType: data.callType,
            offer: data.offer,
            callerName: data.callerName,
            callerAvatar: data.callerAvatar,
          });
        } else {
          // Receiver offline
          authSocket.emit("call:unavailable", { to: data.to });
        }
      },
    );

    // Receiver answers the call
    authSocket.on(
      "call:answer",
      (data: { to: string; answer: RTCSessionDescriptionInit }) => {
        if (!data?.to) return;
        const callerSocket = onlineUsers.get(data.to);
        if (callerSocket) {
          io.to(callerSocket).emit("call:answered", { answer: data.answer });
        }
      },
    );

    // ICE candidate exchange
    authSocket.on(
      "call:ice-candidate",
      (data: { to: string; candidate: RTCIceCandidateInit }) => {
        if (!data?.to) return;
        const peerSocket = onlineUsers.get(data.to);
        if (peerSocket) {
          io.to(peerSocket).emit("call:ice-candidate", {
            candidate: data.candidate,
          });
        }
      },
    );

    // Caller or receiver ends the call
    authSocket.on("call:end", (data: { to: string }) => {
      if (!data?.to) return;
      const peerSocket = onlineUsers.get(data.to);
      if (peerSocket) {
        io.to(peerSocket).emit("call:ended");
      }
    });

    // Receiver rejects the call
    authSocket.on("call:reject", (data: { to: string }) => {
      if (!data?.to) return;
      const callerSocket = onlineUsers.get(data.to);
      if (callerSocket) {
        io.to(callerSocket).emit("call:rejected");
      }
    });

    // =========================
    // DISCONNECT
    // =========================

    authSocket.on("disconnect", async () => {
      console.log("🔴 Socket Disconnected:", authSocket.id);

      try {
        if (userId) {
          onlineUsers.delete(userId);

          await User.findByIdAndUpdate(userId, { isOnline: false });

          console.log("User Offline:", userId);
        }
      } catch (error) {
        console.error("Offline status error:", error);
      }
    });
  });
};
