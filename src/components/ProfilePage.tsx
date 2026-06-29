import { useEffect, useState } from "react";
import { backend } from "../services/backend";
import { sanitize } from "../utils/sanitize";
import { GlassPanel } from "./ui/GlassPanel";

type PublicProfile = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  socialLinks?: { platform: string; url: string }[];
  createdAt: number;
};

export function ProfilePage({ username, onBack }: { username: string; onBack: () => void }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setNotFound(false);
      const p = await backend.getUserProfile(username);
      if (p) setProfile(p);
      else setNotFound(true);
      setLoading(false);
    };
    fetch();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#a5c4e8] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <GlassPanel className="p-12 text-center">
        <div className="text-[32px] mb-3 opacity-40">👤</div>
        <div className="text-[16px] font-[600] mb-1">User not found</div>
        <div className="text-[13px] text-[#8ea5cf]">No user with the username "{sanitize(username)}" exists.</div>
        <button onClick={onBack} className="mt-4 px-4 py-[9px] rounded-full glass-soft text-[13px] hover:bg-white/[.06] transition">← Back</button>
      </GlassPanel>
    );
  }

  const displayName = sanitize(profile.displayName || profile.username);
  const avatarInitial = sanitize(profile.displayName || profile.username).slice(0, 1).toUpperCase();
  const joined = new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <div className="max-w-[600px] mx-auto space-y-6">
      <button onClick={onBack} className="text-[12px] px-3 py-[7px] rounded-full glass-soft hover:bg-white/[.06] transition">← Back</button>

      <GlassPanel className="p-6">
        <div className="flex flex-col items-center text-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/[.15] mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] flex items-center justify-center text-[32px] font-[700] text-[#0d2436] mb-4">
              {avatarInitial}
            </div>
          )}
          <div className="text-[22px] font-[700]">{displayName}</div>
          <div className="text-[13px] text-[#99afda]">@{sanitize(profile.username)}</div>
          <div className="text-[11px] text-[#7d91bc] mt-1">Joined {joined}</div>

          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="nofollow noreferrer"
              className="mt-3 text-[13px] text-[#a5d4ff] hover:underline"
            >
              {sanitize(profile.websiteUrl)}
            </a>
          )}
        </div>

        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/[.08]">
            <div className="text-[11px] tracking-wider text-[#97b1dc] mono mb-3 text-center">SOCIALS</div>
            <div className="flex flex-wrap justify-center gap-2">
              {profile.socialLinks.map((sl, idx) => (
                <a
                  key={idx}
                  href={sl.url}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="px-4 py-[7px] rounded-full glass-soft text-[12.5px] hover:bg-white/[.06] transition border border-white/[.08]"
                >
                  {sanitize(sl.platform)}
                </a>
              ))}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
