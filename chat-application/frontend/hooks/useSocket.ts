"use client";

import { useEffect } from "react";

import socket from "@/socket/socket";

export default function useSocket() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.log("Socket Error:", error.message);
    });

    return () => {
      socket.disconnect();

      socket.off("connect");

      socket.off("connect_error");
    };
  }, []);

  return socket;
}
