import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { backend } from "../services/backend";
import { useAuth } from "../context/AuthContext";

type SocialEntry = { platform: string; url: string };

const COMMON_PLATFORMS = [
  "twitter", "github", "linkedin", "youtube", "twitch", "mastodon",
  "bluesky", "threads", "instagram", "tiktok", "dribbble", "behance",
  "medium", "devto", "hashnode", "substack",
];

export function ProfileEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, token, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || "");
  const [socialLinks, setSocialLinks] = useState<SocialEntry[]>(user?.socialLinks || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && user) {
      setDisplayName(user.displayName || "");
      setAvatarUrl(user.avatarUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
      setSocialLinks(user.socialLinks || []);
      setError("");
      setSaved(false);
    }
  }, [open, user]);

  if (!open) return null;

  const addSocial = () => setSocialLinks([...socialLinks, { platform: "", url: "" }]);

  const updateSocial = (idx: number, field: keyof SocialEntry, value: string) => {
    const next = [...socialLinks];
    next[idx] = { ...next[idx], [field]: value };
    setSocialLinks(next);
  };

  const removeSocial = (idx: number) => setSocialLinks(socialLinks.filter((_, i) => i !== idx));

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const filtered = socialLinks.filter((s) => s.platform.trim() && s.url.trim());
      await backend.updateProfile(token!, {
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        socialLinks: filtered,
      });
      refreshUser();
      setSaved(true);
      setTimeout(() => onClose(), 1200);
    } catch (e: any) {
      setError(e.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] glass-strong rounded-[22px] overflow-y-auto max-h-[90vh]"
      >
        <div className="px-6 pt-5 pb-4 border-b border-white/[.08] flex items-center justify-between">
          <div>
            <div className="text-[17px] font-[700]">Edit Profile</div>
            <div className="text-[12px] text-[#99afda]">@{user?.username}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[10px] glass-soft flex items-center justify-center text-[#99afda] hover:text-white text-[16px]">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Avatar preview */}
          {avatarUrl && (
            <div className="flex justify-center mb-2">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-white/[.15]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div>
            <div className="text-[12px] text-[#c9d6f3] font-[500] mb-1">Display name</div>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-[12px] glass-soft px-3 py-[10px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3]" placeholder="Your display name" />
          </div>

          <div>
            <div className="text-[12px] text-[#c9d6f3] font-[500] mb-1">Avatar URL</div>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-[12px] glass-soft px-3 py-[10px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3]" placeholder="https://example.com/avatar.jpg" />
          </div>

          <div>
            <div className="text-[12px] text-[#c9d6f3] font-[500] mb-1">Website</div>
            <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-[12px] glass-soft px-3 py-[10px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3]" placeholder="https://example.com" />
          </div>

          {/* Social links */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[12px] text-[#c9d6f3] font-[500]">Social links</div>
              <button onClick={addSocial} className="text-[11px] px-3 py-[5px] rounded-full glass-soft hover:bg-white/[.06]">+ Add</button>
            </div>
            <div className="space-y-2">
              {socialLinks.map((sl, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="relative flex-1">
                    <input
                      list="social-platforms"
                      value={sl.platform}
                      onChange={(e) => updateSocial(idx, "platform", e.target.value)}
                      className="w-full rounded-[10px] glass-soft px-3 py-[8px] text-[12px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3]"
                      placeholder="Platform (e.g. github)"
                    />
                  </div>
                  <input
                    value={sl.url}
                    onChange={(e) => updateSocial(idx, "url", e.target.value)}
                    className="flex-1 rounded-[10px] glass-soft px-3 py-[8px] text-[12px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3]"
                    placeholder="https://github.com/..."
                  />
                  <button onClick={() => removeSocial(idx)} className="text-[#ff9ba0] hover:text-[#ff6b6b] text-[14px] px-1 py-[8px]">×</button>
                </div>
              ))}
              <datalist id="social-platforms">
                {COMMON_PLATFORMS.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>
          </div>

          {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12.5px] text-[#ff9ba0] bg-red-500/10 rounded-[10px] px-3 py-2">{error}</motion.div>}
          {saved && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12.5px] text-[#80ffd0] bg-green-500/10 rounded-[10px] px-3 py-2">Profile saved!</motion.div>}

          <button onClick={save} disabled={busy}
            className="w-full px-5 py-[12px] rounded-[14px] bg-gradient-to-r from-[#bde3ff] to-[#ffd8f7] text-[#142132] text-[14px] font-[650] disabled:opacity-40 hover:translate-y-[-1px] transition">
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
