import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectType, PromptTemplate } from "../types";
import { DEFAULT_TEMPLATES } from "../constants/templates";
import { uid } from "../utils/uid";
import { classNames } from "../utils/classNames";
import { GlassPanel } from "./ui/GlassPanel";
import { PLACEHOLDER_CATEGORIES, getPlaceholderMeta } from "../utils/placeholders";
import { useAuth } from "../context/AuthContext";
import { localPublishTemplate, localUnpublishTemplate, localIsTemplatePublic } from "../services/backend";

type Props = {
  templates: PromptTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<PromptTemplate[]>>;
  onRequireAuth: () => void;
};

const PROJECT_TYPES: ProjectType[] = ["webapp", "saas", "mobile", "api", "extension", "ai-agent"];
const TYPE_LABELS: Record<ProjectType, string> = {
  webapp: "Web App", saas: "SaaS", mobile: "Mobile", api: "API", extension: "Extension", "ai-agent": "AI Agent",
};

export function PromptStudio({ templates, setTemplates, onRequireAuth }: Props) {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [pubVersion, setPubVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ProjectType | "all">("all");
  const [showPlaceholderBar, setShowPlaceholderBar] = useState(true);
  const [phSearch, setPhSearch] = useState("");
  const [phCollapsed, setPhCollapsed] = useState<Set<string>>(new Set());
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) || null, [templates, selectedId]);

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    return [...templates]
      .filter((t) => {
        if (filterType !== "all" && t.projectType !== filterType) return false;
        if (q && !t.name.toLowerCase().includes(q) && !t.projectType.includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [templates, search, filterType]);

  // ─── Actions ───
  const selectTemplate = (id: string) => {
    if (isDirty && selectedId) handleSave();
    const t = templates.find((x) => x.id === id);
    if (t) {
      setSelectedId(id);
      setEditBuffer(t.content);
      setIsDirty(false);
    }
  };

  const handleSave = () => {
    if (!selectedId) return;
    setTemplates((prev) => prev.map((t) => t.id === selectedId ? { ...t, content: editBuffer, updatedAt: Date.now() } : t));
    setIsDirty(false);
  };

  const handleCreate = (type: ProjectType) => {
    const tpl: PromptTemplate = {
      id: uid(),
      name: `My ${TYPE_LABELS[type]} template`,
      content: DEFAULT_TEMPLATES[type],
      projectType: type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTemplates((prev) => [tpl, ...prev]);
    setSelectedId(tpl.id);
    setEditBuffer(tpl.content);
    setIsDirty(false);
  };

  const handleDuplicate = () => {
    if (!selected) return;
    const dup: PromptTemplate = { ...selected, id: uid(), name: selected.name + " (copy)", createdAt: Date.now(), updatedAt: Date.now() };
    setTemplates((prev) => [dup, ...prev]);
    setSelectedId(dup.id);
    setEditBuffer(dup.content);
    setIsDirty(false);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) { setSelectedId(null); setEditBuffer(""); setIsDirty(false); }
  };

  const handleResetToDefault = () => {
    if (!selected) return;
    const defaultContent = DEFAULT_TEMPLATES[selected.projectType];
    setEditBuffer(defaultContent);
    setIsDirty(true);
  };

  const isPublished = useMemo(() => (selected ? localIsTemplatePublic(selected.id) : false), [selected, pubVersion]);
  const handleTogglePublish = () => {
    if (!selected) return;
    if (!user) { onRequireAuth(); return; }
    if (isPublished) {
      localUnpublishTemplate(selected.id);
    } else {
      // make sure latest content is saved before publishing
      const latest = { ...selected, content: editBuffer, updatedAt: Date.now() };
      setTemplates((prev) => prev.map((t) => t.id === selected.id ? latest : t));
      setIsDirty(false);
      localPublishTemplate(latest, user);
    }
    setPubVersion((v) => v + 1);
  };

  const handleRename = () => {
    if (!renamingId || !renameVal.trim()) return;
    setTemplates((prev) => prev.map((t) => t.id === renamingId ? { ...t, name: renameVal.trim(), updatedAt: Date.now() } : t));
    setRenamingId(null);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = (text: string, name: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Insert placeholder at cursor ───
  const insertPlaceholder = useCallback((key: string) => {
    const ta = editorRef.current;
    if (!ta) return;
    const tag = `{{${key}}}`;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = editBuffer.slice(0, start);
    const after = editBuffer.slice(end);
    const next = before + tag + after;
    setEditBuffer(next);
    setIsDirty(true);
    // restore cursor after inserted tag
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + tag.length, start + tag.length);
    });
  }, [editBuffer]);

  // ─── Filtered placeholder list ───
  const filteredCategories = useMemo(() => {
    if (!phSearch) return PLACEHOLDER_CATEGORIES;
    const q = phSearch.toLowerCase();
    return PLACEHOLDER_CATEGORIES
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i) =>
          i.key.toLowerCase().includes(q) || i.label.toLowerCase().includes(q) || (i.hint && i.hint.toLowerCase().includes(q))
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [phSearch]);

  const togglePhCat = (id: string) => {
    setPhCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Detect which placeholders are used in current editor ───
  const usedPlaceholders = useMemo(() => {
    const matches = editBuffer.match(/\{\{(\w+)\}\}/g);
    return matches ? [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))] : [];
  }, [editBuffer]);

  return (
    <div className="grid grid-cols-12 gap-5 items-start">
      {/* ═══════ LEFT SIDEBAR ═══════ */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        <GlassPanel className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] tracking-wider text-[#98b3de] mono">TEMPLATES</div>
            <span className="text-[11px] text-[#6f88b5]">{templates.length}</span>
          </div>

          {/* Search + filter */}
          <div className="relative mb-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full rounded-[12px] glass-soft pl-9 pr-3 py-[8px] text-[12px] outline-none text-[#eaf2ff] placeholder-[#7d91bc] focus:ring-sky"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#7d91bc]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          </div>
          <div className="flex flex-wrap gap-[5px] mb-3">
            <button
              onClick={() => setFilterType("all")}
              className={classNames("px-2 py-[4px] rounded-full text-[10px] border transition", filterType === "all" ? "bg-[#e6fbff] text-[#0b2b31] border-[#b9f4ff]" : "glass-soft border-transparent text-[#92a8cf] hover:text-white")}
            >all</button>
            {PROJECT_TYPES.map((pt) => (
              <button
                key={pt}
                onClick={() => setFilterType(pt)}
                className={classNames("px-2 py-[4px] rounded-full text-[10px] border transition", filterType === pt ? "bg-[#e6fbff] text-[#0b2b31] border-[#b9f4ff]" : "glass-soft border-transparent text-[#92a8cf] hover:text-white")}
              >{TYPE_LABELS[pt]}</button>
            ))}
          </div>

          {/* Template list */}
          <div className="space-y-[5px] max-h-[340px] overflow-auto scroll-fancy pr-1">
            {sorted.length === 0 && (
              <div className="text-[12px] text-[#7d91b8] text-center py-6">
                {search || filterType !== "all" ? "No matches" : "No templates yet"}
              </div>
            )}
            {sorted.map((t) => {
              const active = t.id === selectedId;
              const isRenaming = renamingId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => !isRenaming && selectTemplate(t.id)}
                  className={classNames(
                    "px-3 py-[9px] rounded-[12px] cursor-pointer border transition group",
                    active ? "glass-strong border-[#aac6ff4d] ring-sky" : "glass-soft border-transparent hover:border-[#9dbbe733]",
                  )}
                >
                  {isRenaming ? (
                    <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenamingId(null); }}
                      onBlur={handleRename}
                      className="w-full bg-transparent border border-white/20 rounded-[8px] px-2 py-1 text-[12px] outline-none" />
                  ) : (
                    <div className="text-[12.5px] font-[600] truncate">{t.name}</div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] px-[5px] py-[1px] rounded-full glass-soft text-[#a5c4e8]">{TYPE_LABELS[t.projectType]}</span>
                    <span className="text-[9px] text-[#6f88b5] flex-1">{(t.content.length / 1000).toFixed(1)}k</span>
                    <button onClick={(e) => { e.stopPropagation(); setRenamingId(t.id); setRenameVal(t.name); }} className="text-[9px] text-[#7ba0cf] opacity-0 group-hover:opacity-100 transition hover:text-white">rename</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="text-[9px] text-[#c98a8e] opacity-0 group-hover:opacity-100 transition hover:text-[#ff6b6b]">del</button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* Create new */}
        <GlassPanel className="p-3">
          <div className="text-[10px] mono text-[#7d91bc] tracking-wider mb-2">NEW TEMPLATE</div>
          <div className="grid grid-cols-3 gap-[6px]">
            {PROJECT_TYPES.map((pt) => (
              <button key={pt} onClick={() => handleCreate(pt)}
                className="px-2 py-[7px] rounded-[10px] glass-soft text-[10px] text-[#b0c8e8] hover:bg-white/[.06] hover:text-white transition text-center"
              >
                + {TYPE_LABELS[pt]}
              </button>
            ))}
          </div>
        </GlassPanel>

        {/* Used placeholders indicator */}
        {selected && usedPlaceholders.length > 0 && (
          <GlassPanel className="p-3">
            <div className="text-[10px] mono text-[#7d91bc] tracking-wider mb-2">USED VARIABLES ({usedPlaceholders.length})</div>
            <div className="flex flex-wrap gap-[4px] max-h-[120px] overflow-auto scroll-fancy">
              {usedPlaceholders.map((k) => {
                const meta = getPlaceholderMeta(k);
                return (
                  <span key={k} className="text-[9px] px-[6px] py-[2px] rounded-full glass-soft text-[#a5d4ff] font-[500]">
                    {k}
                    {meta?.hint && <span className="text-[#5f7faa] ml-1">({meta.hint})</span>}
                  </span>
                );
              })}
            </div>
          </GlassPanel>
        )}
      </div>

      {/* ═══════ RIGHT: EDITOR + PLACEHOLDER BAR ═══════ */}
      <div className="col-span-12 lg:col-span-9">
        <GlassPanel className="p-5 md:p-6">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selectedId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] font-[700] truncate">{selected.name}</div>
                    <div className="text-[11px] text-[#8ea5cf] flex items-center gap-3 mt-0.5">
                      <span className="px-[7px] py-[2px] rounded-full glass-soft text-[10px]">{TYPE_LABELS[selected.projectType]}</span>
                      <span>{(editBuffer.length / 1000).toFixed(1)}k chars</span>
                      <span>{editBuffer.split("\n").length} lines</span>
                      {isDirty && <span className="text-[#ffd37a]">● unsaved</span>}
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="flex flex-wrap gap-2 mt-3 mb-3">
                  <button onClick={handleSave} disabled={!isDirty}
                    className={classNames("px-4 py-[7px] rounded-full text-[11.5px] font-[600] transition", isDirty ? "bg-[#cffff8] text-[#06271f] shadow-[0_4px_16px_rgba(100,255,230,.15)]" : "glass-soft text-[#6f88b5] cursor-default")}
                  >{isDirty ? "Save" : "Saved"}</button>
                  <button onClick={() => handleCopy(editBuffer)} className={classNames("px-3 py-[7px] rounded-full text-[11.5px] font-[500] transition", copied ? "bg-[#80ffd0] text-[#052b1f]" : "glass-soft text-[#a5d4ff] hover:bg-white/[.06]")}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => download(editBuffer, `${selected.name.replace(/\s+/g, "-")}.txt`)} className="px-3 py-[7px] rounded-full glass-soft text-[11.5px] text-[#a5d4ff] hover:bg-white/[.06] transition">Download</button>
                  <button onClick={handleDuplicate} className="px-3 py-[7px] rounded-full glass-soft text-[11.5px] text-[#a5d4ff] hover:bg-white/[.06] transition">Duplicate</button>
                  <button onClick={handleResetToDefault} className="px-3 py-[7px] rounded-full glass-soft text-[11.5px] text-[#ffb8ba] hover:bg-red-500/10 transition">Reset</button>
                  <button onClick={handleTogglePublish}
                    className={classNames("px-3 py-[7px] rounded-full text-[11.5px] font-[600] transition border", isPublished ? "bg-[#80ffd0]/15 text-[#80ffd0] border-[#80ffd0]/30" : "glass-soft text-[#ffd8f7] border-transparent hover:bg-white/[.06]")}>
                    {isPublished ? "🌍 Public" : "Publish to Explore"}
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => setShowPlaceholderBar((v) => !v)}
                    className={classNames("px-3 py-[7px] rounded-full text-[11.5px] font-[500] transition border", showPlaceholderBar ? "bg-[#d4eaff]/10 text-[#a5d4ff] border-[#a5d4ff]/30" : "glass-soft text-[#7d91bc] border-transparent")}
                  >
                    {"{{…}}"} Variables
                  </button>
                  <button onClick={() => handleDelete(selected.id)} className="px-3 py-[7px] rounded-full glass-soft text-[11.5px] text-[#ffb8ba] hover:bg-red-500/10 transition">Delete</button>
                </div>

                {/* Placeholder insertion toolbar */}
                <AnimatePresence>
                  {showPlaceholderBar && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="glass-soft rounded-[14px] p-3">
                        <div className="relative mb-2">
                          <input value={phSearch} onChange={(e) => setPhSearch(e.target.value)}
                            placeholder="Search variables (e.g. color, tech, audience)…"
                            className="w-full rounded-[10px] bg-[#0a101c]/60 border border-white/[.1] pl-3 pr-3 py-[7px] text-[11px] outline-none text-[#eaf2ff] placeholder-[#6d84aa] focus:border-sky-400/40 transition"
                          />
                        </div>
                        <div className="max-h-[220px] overflow-auto scroll-fancy space-y-1">
                          {filteredCategories.map((cat) => {
                            const collapsed = phCollapsed.has(cat.id);
                            return (
                              <div key={cat.id}>
                                <button onClick={() => togglePhCat(cat.id)} className="flex items-center gap-2 w-full text-left py-[4px] px-1 rounded-[8px] hover:bg-white/[.03] transition">
                                  <span className="text-[11px]">{cat.icon}</span>
                                  <span className="text-[11px] font-[600] text-[#b5d0ee]">{cat.label}</span>
                                  <span className="text-[9px] text-[#5f7faa] ml-1">({cat.items.length})</span>
                                  <span className="text-[9px] text-[#5f7faa] ml-auto">{collapsed ? "▸" : "▾"}</span>
                                </button>
                                {!collapsed && (
                                  <div className="flex flex-wrap gap-[5px] pl-6 pb-1">
                                    {cat.items.map((item) => {
                                      const isUsed = usedPlaceholders.includes(item.key);
                                      return (
                                        <button
                                          key={item.key}
                                          onClick={() => insertPlaceholder(item.key)}
                                          title={item.hint ? `${item.label} — ${item.hint}` : item.label}
                                          className={classNames(
                                            "px-[8px] py-[3px] rounded-[8px] text-[10px] font-mono border transition",
                                            isUsed
                                              ? "bg-[#80ffe0]/10 text-[#80ffe0] border-[#80ffe0]/20"
                                              : "bg-white/[.03] text-[#a5c4e8] border-white/[.08] hover:bg-white/[.08] hover:text-white hover:border-white/[.16]",
                                          )}
                                        >
                                          {`{{${item.key}}}`}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {filteredCategories.length === 0 && (
                            <div className="text-[11px] text-[#6f88b5] text-center py-3">No variables match "{phSearch}"</div>
                          )}
                        </div>
                        <div className="text-[10px] text-[#5f7faa] mt-2 pl-1">
                          Click to insert at cursor. Green = already used in template.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Editor */}
                <textarea
                  ref={editorRef}
                  value={editBuffer}
                  onChange={(e) => { setEditBuffer(e.target.value); setIsDirty(true); }}
                  spellCheck={false}
                  className="w-full h-[440px] rounded-[16px] glass-soft p-5 text-[12.5px] mono leading-relaxed text-[#d9ebff] scroll-fancy outline-none focus:ring-sky resize-y"
                />

                <div className="flex items-center justify-between mt-3 text-[10px] text-[#5f7faa]">
                  <span>Created {new Date(selected.createdAt).toLocaleDateString()}</span>
                  <span>Modified {new Date(selected.updatedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center py-24">
                  <div className="w-16 h-16 mx-auto rounded-[20px] glass-soft flex items-center justify-center mb-5">
                    <span className="text-[28px] opacity-40">{"{{ }}"}</span>
                  </div>
                  <div className="text-[18px] font-[700] mb-2">Template Workshop</div>
                  <div className="text-[14px] text-[#99afda] max-w-md mx-auto leading-relaxed">
                    {templates.length > 0
                      ? "Select a template from the list to edit, or create a new one. Click Variables above the editor to insert placeholders."
                      : 'Create your first template. Each template can use {{variableName}} placeholders that get filled from your Idea sessions.'}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </div>
    </div>
  );
}
