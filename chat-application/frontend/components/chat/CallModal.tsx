"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneIncoming,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "@/socket/socket";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export type CallType = "audio" | "video";

export interface IncomingCall {
  from: string;
  callType: CallType;
  offer: RTCSessionDescriptionInit;
  callerName: string;
  callerAvatar?: string;
}

interface CallModalProps {
  // Outgoing call props (when WE initiate)
  outgoingCall?: {
    peerId: string;
    peerName: string;
    peerAvatar?: string;
    callType: CallType;
  } | null;
  onOutgoingCancel?: () => void;

  // Incoming call props (when peer calls us)
  incomingCall?: IncomingCall | null;
  onIncomingAccept?: () => void;
  onIncomingReject?: () => void;

  // Shared
  currentUserName: string;
  currentUserAvatar?: string;
}

export default function CallModal({
  outgoingCall,
  onOutgoingCancel,
  incomingCall,
  onIncomingAccept,
  onIncomingReject,
  currentUserName,
  currentUserAvatar,
}: CallModalProps) {
  const isOpen = !!outgoingCall || !!incomingCall;
  if (!isOpen) return null;

  return incomingCall ? (
    <IncomingCallScreen
      call={incomingCall}
      onAccept={onIncomingAccept!}
      onReject={onIncomingReject!}
    />
  ) : outgoingCall ? (
    <ActiveCallScreen
      peerId={outgoingCall.peerId}
      peerName={outgoingCall.peerName}
      peerAvatar={outgoingCall.peerAvatar}
      callType={outgoingCall.callType}
      isInitiator
      currentUserName={currentUserName}
      currentUserAvatar={currentUserAvatar}
      onHangup={onOutgoingCancel!}
    />
  ) : null;
}

// ─── Incoming call ring screen ────────────────────────────────────────────────

function IncomingCallScreen({
  call,
  onAccept,
  onReject,
}: {
  call: IncomingCall;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl border border-white/10">
        {/* Avatar */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-orange-500/30">
            {call.callerAvatar ? (
              <img
                src={
                  call.callerAvatar.startsWith("http")
                    ? call.callerAvatar
                    : `${socketUrl}${call.callerAvatar}`
                }
                alt={call.callerName}
                className="h-full w-full object-cover"
              />
            ) : (
              call.callerName.charAt(0).toUpperCase()
            )}
          </div>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-orange-500/20" />
        </div>

        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-1">
            Incoming {call.callType === "video" ? "Video" : "Voice"} Call
          </p>
          <h2 className="text-2xl font-bold text-white">{call.callerName}</h2>
        </div>

        <div className="flex items-center gap-8 mt-2">
          {/* Reject */}
          <button
            onClick={onReject}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-500/30">
              <PhoneOff size={26} className="text-white" />
            </div>
            <span className="text-xs text-zinc-400">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition shadow-lg shadow-green-500/30 animate-bounce">
              {call.callType === "video" ? (
                <Video size={26} className="text-white" />
              ) : (
                <Phone size={26} className="text-white" />
              )}
            </div>
            <span className="text-xs text-zinc-400">Accept</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Active call screen (handles WebRTC after accept) ────────────────────────

interface ActiveCallScreenProps {
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  callType: CallType;
  isInitiator: boolean;
  currentUserName: string;
  currentUserAvatar?: string;
  // If answering, we already have the offer
  incomingOffer?: RTCSessionDescriptionInit;
  onHangup: () => void;
}

export function ActiveCallScreen({
  peerId,
  peerName,
  peerAvatar,
  callType,
  isInitiator,
  currentUserName,
  currentUserAvatar,
  incomingOffer,
  onHangup,
}: ActiveCallScreenProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(callType === "video");
  const [callState, setCallState] = useState<
    "connecting" | "connected" | "ended"
  >("connecting");
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const cleanup = useCallback(() => {
    stopTimer();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
  }, [stopTimer]);

  const hangup = useCallback(() => {
    socket.emit("call:end", { to: peerId });
    cleanup();
    onHangup();
  }, [peerId, cleanup, onHangup]);

  // ── WebRTC setup ─────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        // 1. Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Create peer connection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Remote track → remote video
        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        // ICE candidates → send to peer
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("call:ice-candidate", {
              to: peerId,
              candidate: e.candidate.toJSON(),
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setCallState("connected");
            startTimer();
          }
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed"
          ) {
            hangup();
          }
        };

        // 3. Initiator: create offer; answerer: set remote desc then answer
        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("call:initiate", {
            to: peerId,
            callType,
            offer,
            callerName: currentUserName,
            callerAvatar: currentUserAvatar,
          });
        } else if (incomingOffer) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(incomingOffer),
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("call:answer", { to: peerId, answer });
        }
      } catch (err) {
        console.error("WebRTC setup error:", err);
        hangup();
      }
    };

    setup();

    // ── socket listeners ──────────────────────────────────────────────────
    const onAnswered = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      if (pcRef.current && pcRef.current.signalingState !== "stable") {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
    };

    const onIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch {}
    };

    const onEnded = () => {
      setCallState("ended");
      cleanup();
      setTimeout(onHangup, 1200);
    };

    const onRejected = () => {
      setCallState("ended");
      cleanup();
      setTimeout(onHangup, 1000);
    };

    const onUnavailable = () => {
      setCallState("ended");
      cleanup();
      setTimeout(onHangup, 1000);
    };

    socket.on("call:answered", onAnswered);
    socket.on("call:ice-candidate", onIce);
    socket.on("call:ended", onEnded);
    socket.on("call:rejected", onRejected);
    socket.on("call:unavailable", onUnavailable);

    return () => {
      cancelled = true;
      socket.off("call:answered", onAnswered);
      socket.off("call:ice-candidate", onIce);
      socket.off("call:ended", onEnded);
      socket.off("call:rejected", onRejected);
      socket.off("call:unavailable", onUnavailable);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── mic / cam toggles ────────────────────────────────────────────────────

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicOn((p) => !p);
  };

  const toggleCam = () => {
    if (callType !== "video") return;
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCamOn((p) => !p);
  };

  // ─────────────────────────────────────────────────────────────────────────

  const statusLabel =
    callState === "connecting"
      ? "Calling…"
      : callState === "connected"
        ? formatDuration(duration)
        : "Call ended";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
    >
      {/* Remote video (full screen) */}
      {callType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Audio-only: peer avatar background */}
      {callType === "audio" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-orange-500/30 shadow-2xl shadow-orange-500/20">
            {peerAvatar ? (
              <img
                src={
                  peerAvatar.startsWith("http")
                    ? peerAvatar
                    : `${socketUrl}${peerAvatar}`
                }
                alt={peerName}
                className="h-full w-full object-cover"
              />
            ) : (
              peerName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">{peerName}</h2>
            <p className="text-zinc-400 mt-1">{statusLabel}</p>
          </div>
        </div>
      )}

      {/* Overlay gradient for video mode UI readability */}
      {callType === "video" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-5">
        {callType === "video" && (
          <div>
            <h2 className="text-white font-semibold text-lg">{peerName}</h2>
            <p className="text-white/60 text-sm">{statusLabel}</p>
          </div>
        )}
        {/* Local video pip (video mode) */}
        {callType === "video" && (
          <div className="ml-auto h-28 w-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-zinc-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover scale-x-[-1]"
            />
          </div>
        )}
      </div>

      {/* Audio mode local preview (hidden, just for stream) */}
      {callType === "audio" && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
        />
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-5 pb-10 px-6">
        {/* Mic */}
        <button
          onClick={toggleMic}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition shadow-lg cursor-pointer ${
            micOn
              ? "bg-white/20 hover:bg-white/30 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        {/* Cam (video only) */}
        {callType === "video" && (
          <button
            onClick={toggleCam}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition shadow-lg cursor-pointer ${
              camOn
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={camOn ? "Turn off camera" : "Turn on camera"}
          >
            {camOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
        )}

        {/* Hang up */}
        <button
          onClick={hangup}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition shadow-xl shadow-red-500/40 cursor-pointer"
          title="End Call"
        >
          <PhoneOff size={26} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
}
