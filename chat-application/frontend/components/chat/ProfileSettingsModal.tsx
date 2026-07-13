"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarPreview(
        user.avatar
          ? user.avatar.startsWith("http")
            ? user.avatar
            : `${socketUrl}${user.avatar}`
          : "",
      );
      setNewAvatar("");
      setError("");
    }
  }, [user, isOpen, socketUrl]);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image is too large. Max size is 2MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
        setNewAvatar(reader.result);
        setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.put("/users/profile", {
        name: name.trim(),
        bio: bio.trim(),
        avatar: newAvatar || undefined,
      });

      if (response.data.success) {
        setUser(response.data.user);
        onClose();
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-white/20" />
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[90dvh] sm:max-h-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 cursor-pointer"
          >
            <X size={18} />
          </button>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            Profile Settings
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group h-24 w-24 rounded-full overflow-hidden border-2 border-orange-500 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-zinc-400" />
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                >
                  <Camera size={20} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30">
                {error}
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-4 py-3 text-sm text-zinc-500 dark:text-white/50 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-orange-500 transition"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-orange-500 transition resize-none"
                  maxLength={160}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-safe">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
