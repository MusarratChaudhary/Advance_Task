"use client";

import { useState } from "react";
import { X, Users, Search, Check, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  _id: string;
  groupName: string;
  groupImage?: string;
  members: GroupMember[];
  admins: GroupMember[];
  createdBy: GroupMember;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: GroupMember[];
  onGroupCreated: (group: Group) => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  users,
  onGroupCreated,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setGroupImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCreate = async () => {
    setError("");
    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Select at least one member.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/groups", {
        groupName: groupName.trim(),
        members: selectedMembers,
        groupImage: groupImage || undefined,
      });
      onGroupCreated(res.data.group);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setSearch("");
    setSelectedMembers([]);
    setGroupImage(null);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Mobile: bottom sheet */}
          <motion.div
            key="sheet-mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/10 rounded-t-3xl shadow-2xl sm:hidden overflow-hidden"
            style={{ maxHeight: "min(92svh, 620px)" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white flex-shrink-0">
                  <Users size={16} />
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  New Group
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — min-h-0 required for flex-1 + overflow-y-auto to work inside flex column */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3">
              <ModalBody
                groupName={groupName}
                setGroupName={setGroupName}
                groupImage={groupImage}
                handleImageChange={handleImageChange}
                selectedMembers={selectedMembers}
                toggleMember={toggleMember}
                search={search}
                setSearch={setSearch}
                filteredUsers={filteredUsers}
                users={users}
                error={error}
                compact
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-white/10 flex-shrink-0">
              <button
                onClick={handleCreate}
                disabled={
                  loading || !groupName.trim() || selectedMembers.length === 0
                }
                className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading
                  ? "Creating..."
                  : `Create Group${selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ""}`}
              </button>
            </div>
          </motion.div>

          {/* Desktop: centered modal */}
          <motion.div
            key="modal-desktop"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 hidden sm:flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col"
              style={{ maxHeight: "90vh", pointerEvents: "auto" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                    <Users size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    New Group
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 space-y-4">
                <ModalBody
                  groupName={groupName}
                  setGroupName={setGroupName}
                  groupImage={groupImage}
                  handleImageChange={handleImageChange}
                  selectedMembers={selectedMembers}
                  toggleMember={toggleMember}
                  search={search}
                  setSearch={setSearch}
                  filteredUsers={filteredUsers}
                  users={users}
                  error={error}
                  compact={false}
                />
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-200 dark:border-white/10 flex-shrink-0">
                <button
                  onClick={handleCreate}
                  disabled={
                    loading || !groupName.trim() || selectedMembers.length === 0
                  }
                  className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Creating..."
                    : `Create Group${selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ""}`}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Shared body content for both mobile and desktop
interface ModalBodyProps {
  groupName: string;
  setGroupName: (v: string) => void;
  groupImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedMembers: string[];
  toggleMember: (id: string) => void;
  search: string;
  setSearch: (v: string) => void;
  filteredUsers: GroupMember[];
  users: GroupMember[];
  error: string;
  compact?: boolean;
}

function ModalBody({
  groupName,
  setGroupName,
  groupImage,
  handleImageChange,
  selectedMembers,
  toggleMember,
  search,
  setSearch,
  filteredUsers,
  users,
  error,
  compact = false,
}: ModalBodyProps) {
  const imgSize = compact ? "h-12 w-12" : "h-16 w-16";
  const iconSize = compact ? 18 : 22;

  return (
    <>
      {/* Group Image + Name — always row, image shrinks on compact */}
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer flex-shrink-0">
          <div
            className={`${imgSize} rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-white/20 flex items-center justify-center hover:border-orange-500 transition`}
          >
            {groupImage ? (
              <img
                src={groupImage}
                alt="group"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus size={iconSize} className="text-zinc-400" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name..."
          className="flex-1 min-w-0 rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
        />
      </div>

      {/* Selected member chips */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedMembers.map((id) => {
            const u = users.find((u) => u._id === id);
            if (!u) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 text-xs font-semibold max-w-[120px]"
              >
                <span className="truncate">{u.name.split(" ")[0]}</span>
                <button
                  onClick={() => toggleMember(id)}
                  className="hover:text-orange-800 dark:hover:text-orange-200 cursor-pointer flex-shrink-0"
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-orange-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
        />
      </div>

      {/* User list */}
      <div className="space-y-0.5">
        {filteredUsers.map((user) => {
          const isSelected = selectedMembers.includes(user._id);
          return (
            <button
              key={user._id}
              onClick={() => toggleMember(user._id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition cursor-pointer ${
                isSelected
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "hover:bg-zinc-100 dark:hover:bg-white/5"
              }`}
            >
              <div className="h-9 w-9 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
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
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {user.email}
                </p>
              </div>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 border-2 transition ${
                  isSelected
                    ? "border-orange-500 bg-orange-500"
                    : "border-zinc-300 dark:border-white/20"
                }`}
              >
                {isSelected && (
                  <Check size={11} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-6">
            No users found
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
