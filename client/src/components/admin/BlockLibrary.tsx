import { useEffect, useMemo, useState } from "react";
import { BLOCK_REGISTRY, getEditableBlockTypes, getBlockTypesByCategory, CATEGORY_LABELS, type BlockTypeDefinition, type BlockCategory } from "@shared/blockRegistry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Plus, Search, GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { WysiwygMarkdownEditor } from "./WysiwygMarkdownEditor";
import { BucketSortBlockEditor, CheckpointBlockEditor, ChoiceQuestionEditor, FillBlankBlockEditor } from "./SpecializedBlockEditors";
import { getEditorFields, hydrateBlockForEditor, isMediaEditorField } from "./blockEditorParity";

interface BlockLibraryProps {
  blocks: any[];
  onChange: (blocks: any[]) => void;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onRequestMedia?: (target: { blockIndex: number; fieldKey: string }) => void;
}

/**
 * BlockLibrary — Visual block editor for admin content management.
 * Displays a palette of available block types and allows drag-reorder, edit, delete.
 */
export function BlockLibrary({ blocks, onChange, lang, t, onRequestMedia }: BlockLibraryProps) {
  const [showPalette, setShowPalette] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const rawIndex = new URLSearchParams(window.location.search).get("block");
    const index = rawIndex === null ? NaN : Number(rawIndex);
    return Number.isInteger(index) && index >= 0 ? index : null;
  });
  const [editLang, setEditLang] = useState<"en" | "fr">("en");
  const [searchQuery, setSearchQuery] = useState("");

  const editableTypes = useMemo(() => getEditableBlockTypes(), []);
  const groupedTypes = useMemo(() => getBlockTypesByCategory(), []);

  // Filter block types by search
  const filteredTypes = useMemo(() => {
    if (!searchQuery) return editableTypes;
    const q = searchQuery.toLowerCase();
    return editableTypes.filter(bt =>
      bt.label.en.toLowerCase().includes(q) ||
      bt.label.fr.toLowerCase().includes(q) ||
      bt.type.includes(q) ||
      bt.category.includes(q)
    );
  }, [editableTypes, searchQuery]);

  const addBlock = (blockType: BlockTypeDefinition) => {
    const newBlock = JSON.parse(JSON.stringify(blockType.defaultData));
    onChange([...blocks, newBlock]);
    setShowPalette(false);
    // Adding a block opens its visual form immediately, including its contextual media selector.
    setEditingIdx(blocks.length);
    toast.success(t({ en: `Added: ${blockType.label.en}`, fr: `Ajouté : ${blockType.label.fr}` }));
  };

  const removeBlock = (idx: number) => {
    const newBlocks = blocks.filter((_, i) => i !== idx);
    onChange(newBlocks);
  };

  const duplicateBlock = (idx: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, JSON.parse(JSON.stringify(blocks[idx])));
    onChange(newBlocks);
  };

  const moveBlock = (idx: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    onChange(newBlocks);
  };

  const updateBlock = (idx: number, data: any) => {
    const newBlocks = [...blocks];
    newBlocks[idx] = { ...newBlocks[idx], ...data };
    onChange(newBlocks);
  };

  const getBlockDef = (type: string) => BLOCK_REGISTRY.find(b => b.type === type);

  return (
    <div className="space-y-2">
      {/* Block list */}
      {blocks.map((block, idx) => {
        const def = getBlockDef(block.type);
        const label = def ? (lang === "fr" ? def.label.fr : def.label.en) : block.type;
        const color = def?.color || "bg-gray-100 text-gray-700";
        // Preview text
        const preview = getBlockPreview(block, lang);

        return (
          <div key={idx} className="group flex items-start gap-2 p-2 rounded-lg border border-border hover:border-primary/30 bg-card transition-all">
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <button onClick={() => moveBlock(idx, "up")} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
              <button onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${color}`}>{label}</Badge>
                <span className="text-xs text-muted-foreground truncate flex-1">{preview}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => setEditingIdx(idx)}
                aria-label={`Modifier le bloc ${idx + 1}`}
              >
                <Edit3 className="h-3.5 w-3.5" /> Modifier
              </Button>
              <button onClick={() => duplicateBlock(idx)} className="p-1 text-muted-foreground hover:text-foreground" title="Dupliquer le bloc" aria-label={`Dupliquer le bloc ${idx + 1}`}>
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => removeBlock(idx)} className="p-1 text-muted-foreground hover:text-red-500" title="Supprimer le bloc" aria-label={`Supprimer le bloc ${idx + 1}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add block button */}
      <Button onClick={() => setShowPalette(true)} variant="outline" className="w-full border-dashed gap-2">
        <Plus className="w-4 h-4" />
        {t({ en: "Add block", fr: "Ajouter un bloc" })}
      </Button>

      {/* Block Palette Dialog */}
      <Dialog open={showPalette} onOpenChange={setShowPalette}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t({ en: "Block Library", fr: "Bibliothèque de blocs" })}</DialogTitle>
            <p className="text-sm text-muted-foreground">Choisissez un bloc : son formulaire visuel s’ouvrira ensuite pour ajouter son contenu et son média associé.</p>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t({ en: "Search blocks...", fr: "Rechercher un bloc..." })}
              className="pl-9"
            />
          </div>
          <div className="space-y-4">
            {(Object.entries(groupedTypes) as [BlockCategory, BlockTypeDefinition[]][])
              .filter(([, types]) => types.some(bt => filteredTypes.includes(bt)))
              .map(([category, types]) => {
                const catLabel = CATEGORY_LABELS[category];
                const visibleTypes = types.filter(bt => filteredTypes.includes(bt));
                return (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {lang === "fr" ? catLabel.fr : catLabel.en}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {visibleTypes.map((bt) => (
                        <button
                          key={bt.type}
                          onClick={() => addBlock(bt)}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                        >
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 mt-0.5 ${bt.color}`}>
                            {bt.type}
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{lang === "fr" ? bt.label.fr : bt.label.en}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{lang === "fr" ? bt.description.fr : bt.description.en}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Editor Dialog */}
      {editingIdx !== null && (
        <BlockEditorDialog
          block={blocks[editingIdx]}
          blockDef={getBlockDef(blocks[editingIdx]?.type)}
          lang={editLang}
          onLangChange={setEditLang}
          t={t}
          onSave={(data) => {
            updateBlock(editingIdx, data);
            setEditingIdx(null);
            toast.success(t({ en: "Block updated", fr: "Bloc mis à jour" }));
          }}
          onRequestMedia={(fieldKey) => onRequestMedia?.({ blockIndex: editingIdx, fieldKey })}
          onClose={() => setEditingIdx(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// Block Editor Dialog
// ============================================================

function BlockEditorDialog({ block, blockDef, lang, onLangChange, t, onSave, onRequestMedia, onClose }: {
  block: any;
  blockDef: BlockTypeDefinition | undefined;
  lang: "en" | "fr";
  onLangChange: (l: "en" | "fr") => void;
  t: (obj: { en: string; fr: string }) => string;
  onSave: (data: any) => void;
  onRequestMedia?: (fieldKey: string) => void;
  onClose: () => void;
}) {
  const [editData, setEditData] = useState<any>(() => hydrateBlockForEditor(block));
  useEffect(() => setEditData(hydrateBlockForEditor(block)), [block]);

  if (!blockDef) {
    // Fallback: raw JSON editor for unknown block types
    return (
      <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t({ en: "Edit Block", fr: "Éditer le bloc" })} ({block.type})</DialogTitle>
          </DialogHeader>
          <Textarea
            value={JSON.stringify(editData, null, 2)}
            onChange={(e) => { try { setEditData(JSON.parse(e.target.value)); } catch {} }}
            rows={20}
            className="font-mono text-xs"
          />
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>{t({ en: "Cancel", fr: "Annuler" })}</Button>
            <Button onClick={() => onSave(editData)}>{t({ en: "Save", fr: "Sauvegarder" })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (block.type === "single_choice_exercise" || block.type === "multi_choice_exercise") {
    return <ChoiceQuestionEditor block={block} multiple={block.type === "multi_choice_exercise"} onSave={onSave} onClose={onClose} />;
  }
  if (block.type === "checkpoint") {
    return <CheckpointBlockEditor block={block} onSave={onSave} onClose={onClose} />;
  }
  if (block.type === "bucket_sort") {
    return <BucketSortBlockEditor block={block} onSave={onSave} onClose={onClose} />;
  }
  if (block.type === "fill_blank") {
    return <FillBlankBlockEditor block={block} onSave={onSave} onClose={onClose} />;
  }

  const updateField = (key: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateI18nField = (key: string, l: string, value: string) => {
    const current = editData[key] || {};
    if (typeof current === "string") {
      // Convert string to i18n object
      updateField(key, { en: l === "en" ? value : current, fr: l === "fr" ? value : "" });
    } else {
      updateField(key, { ...current, [l]: value });
    }
  };

  const getI18nValue = (key: string, l: string): string => {
    const val = editData[key];
    if (!val) return "";
    if (typeof val === "string") return l === "en" ? val : "";
    return val[l] || "";
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={blockDef.color}>{blockDef.type}</Badge>
            {lang === "fr" ? blockDef.label.fr : blockDef.label.en}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={lang} onValueChange={(v) => onLangChange(v as "en" | "fr")} className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
          </TabsList>
          <TabsContent value={lang} className="space-y-4">
            {getEditorFields(editData, blockDef.schema).map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {lang === "fr" ? field.label.fr : field.label.en}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-[10px] text-muted-foreground mb-1">{lang === "fr" ? field.helpText.fr : field.helpText.en}</p>
                )}
                {renderFieldEditor(field, editData, lang, updateField, updateI18nField, getI18nValue, onRequestMedia)}
              </div>
            ))}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t({ en: "Cancel", fr: "Annuler" })}</Button>
          <Button onClick={() => onSave(editData)} className="bg-emerald-600 hover:bg-emerald-700">
            {t({ en: "Save changes", fr: "Sauvegarder" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Field renderers
// ============================================================

function renderFieldEditor(
  field: any,
  editData: any,
  lang: string,
  updateField: (key: string, value: any) => void,
  updateI18nField: (key: string, l: string, value: string) => void,
  getI18nValue: (key: string, l: string) => string,
  onRequestMedia?: (fieldKey: string) => void,
) {
  const isMediaField = isMediaEditorField(field.key);
  const renderTextInput = () => (
    <div className="flex gap-2">
      <Input value={editData[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} placeholder={field.placeholder} />
    </div>
  );
  const renderMediaInput = () => (
    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
      <div className="flex gap-2">
        <Input value={editData[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} placeholder={field.placeholder || "/api/assets/..."} />
      </div>
      {onRequestMedia && <Button type="button" variant="outline" className="w-full justify-start bg-background" onClick={() => onRequestMedia(field.key)}><ImagePlus className="mr-2 h-4 w-4" />Choisir ou ajouter un média depuis la bibliothèque</Button>}
      <p className="text-[11px] text-muted-foreground">Sélectionnez un média existant ou ouvrez la gestion globale pour ajouter, remplacer ou retirer une ressource.</p>
    </div>
  );
  switch (field.type) {
    case "text":
      return isMediaField ? renderMediaInput() : renderTextInput();
    case "textarea":
      return <Textarea value={editData[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} rows={4} placeholder={field.placeholder} />;
    case "code":
      return <Textarea value={editData[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} rows={8} className="font-mono text-xs bg-slate-900 text-green-300" />;
    case "number":
      return <Input type="number" value={editData[field.key] ?? field.defaultValue ?? ""} onChange={(e) => updateField(field.key, Number(e.target.value))} />;
    case "boolean":
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!editData[field.key]} onChange={(e) => updateField(field.key, e.target.checked)} className="rounded" />
          <span className="text-sm">{lang === "fr" ? field.label.fr : field.label.en}</span>
        </label>
      );
    case "select":
      return (
        <Select value={editData[field.key] || ""} onValueChange={(v) => updateField(field.key, v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt: any) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "i18n_text":
      return <Input value={getI18nValue(field.key, lang)} onChange={(e) => updateI18nField(field.key, lang, e.target.value)} placeholder={field.placeholder} />;
    case "i18n_textarea":
      return <Textarea value={getI18nValue(field.key, lang)} onChange={(e) => updateI18nField(field.key, lang, e.target.value)} rows={field.type === "i18n_richtext" ? 8 : 4} placeholder={field.placeholder} />;
    case "i18n_richtext":
      return <WysiwygMarkdownEditor value={getI18nValue(field.key, lang)} onChange={(value) => updateI18nField(field.key, lang, value)} placeholder={field.placeholder} />;
    case "i18n_html":
      return <Textarea value={getI18nValue(field.key, lang)} onChange={(event) => updateI18nField(field.key, lang, event.target.value)} rows={10} className="font-mono text-xs bg-slate-950 text-emerald-300" placeholder="&lt;section&gt;...&lt;/section&gt;" spellCheck={false} />;
    case "richtext":
      return <WysiwygMarkdownEditor value={editData[field.key] || ""} onChange={(value) => updateField(field.key, value)} placeholder={field.placeholder} />;
    case "array":
      return <ArrayFieldEditor field={field} data={editData[field.key] || []} onChange={(val) => updateField(field.key, val)} lang={lang} />;
    case "json":
      return <Textarea value={JSON.stringify(editData[field.key] || {}, null, 2)} onChange={(e) => { try { updateField(field.key, JSON.parse(e.target.value)); } catch {} }} rows={6} className="font-mono text-xs" />;
    default:
      return <Input value={String(editData[field.key] || "")} onChange={(e) => updateField(field.key, e.target.value)} />;
  }
}

function ArrayFieldEditor({ field, data, onChange, lang }: { field: any; data: any[]; onChange: (val: any[]) => void; lang: string }) {
  const addItem = () => {
    const newItem: any = {};
    (field.arrayItemSchema || []).forEach((f: any) => { newItem[f.key] = ""; });
    onChange([...data, newItem]);
  };

  const removeItem = (idx: number) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, key: string, value: any) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [key]: value };
    onChange(newData);
  };

  const updateI18nItem = (idx: number, key: string, l: string, value: string) => {
    const current = data[idx]?.[key] || {};
    const newVal = typeof current === "string" ? { en: l === "en" ? value : current, fr: l === "fr" ? value : "" } : { ...current, [l]: value };
    updateItem(idx, key, newVal);
  };

  return (
    <div className="space-y-2 border border-border rounded-lg p-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
          <span className="text-xs text-muted-foreground mt-1 shrink-0">{idx + 1}.</span>
          <div className="flex-1 space-y-1">
            {(field.arrayItemSchema || []).map((subField: any) => {
              const isI18n = subField.type.startsWith("i18n_");
              const val = isI18n
                ? (typeof item[subField.key] === "object" ? (item[subField.key]?.[lang] || "") : (item[subField.key] || ""))
                : (item[subField.key] || "");
              return (
                <div key={subField.key}>
                  <label className="text-[10px] text-muted-foreground">{lang === "fr" ? subField.label.fr : subField.label.en}</label>
                  <Input
                    value={val}
                    onChange={(e) => isI18n ? updateI18nItem(idx, subField.key, lang, e.target.value) : updateItem(idx, subField.key, e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              );
            })}
          </div>
          <button onClick={() => removeItem(idx)} className="p-1 text-muted-foreground hover:text-red-500 mt-1">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <Button onClick={addItem} variant="ghost" size="sm" className="w-full text-xs gap-1">
        <Plus className="w-3 h-3" /> {lang === "fr" ? "Ajouter" : "Add item"}
      </Button>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function getBlockPreview(block: any, lang: string): string {
  // Try to extract a meaningful preview from the block
  const tryField = (field: any): string => {
    if (!field) return "";
    if (typeof field === "string") return field.slice(0, 60);
    if (typeof field === "object" && field[lang]) return field[lang].slice(0, 60);
    if (typeof field === "object" && field.en) return field.en.slice(0, 60);
    return "";
  };

  return tryField(block.title) || tryField(block.question) || tryField(block.body) || tryField(block.instructions) || tryField(block.prompt) || "";
}
