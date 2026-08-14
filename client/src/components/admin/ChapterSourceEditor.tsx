import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Braces, CheckCircle2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ContentValidationIssue } from "@shared/contentStudio";

interface ChapterSourceEditorProps {
  chapter: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (chapter: any) => void;
  validate: (chapter: any) => Promise<{ valid: boolean; errors: ContentValidationIssue[]; warnings: ContentValidationIssue[] }>;
}

/** Advanced mode: structured chapter source, parsed locally and validated server-side before it reaches the draft. */
export function ChapterSourceEditor({ chapter, open, onOpenChange, onApply, validate }: ChapterSourceEditorProps) {
  const [source, setSource] = useState("");
  const [issues, setIssues] = useState<ContentValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (open) {
      setSource(JSON.stringify(chapter, null, 2));
      setIssues([]);
    }
  }, [chapter, open]);

  const parsed = useMemo(() => {
    try { return { value: JSON.parse(source), error: "" }; }
    catch (error) { return { value: null, error: error instanceof Error ? error.message : "JSON invalide" }; }
  }, [source]);

  const checkAndApply = async () => {
    if (!parsed.value) return;
    setIsValidating(true);
    const result = await validate(parsed.value);
    setIsValidating(false);
    setIssues([...result.errors, ...result.warnings]);
    if (result.valid) {
      onApply(parsed.value);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary" /> Mode avancé — source structurée</DialogTitle>
          <DialogDescription>Éditez le JSON du chapitre sélectionné. La source est analysée avant d’être appliquée au brouillon ; aucun cours publié n’est modifié à cette étape.</DialogDescription>
        </DialogHeader>
        <Textarea value={source} onChange={(event) => setSource(event.target.value)} className="min-h-[420px] font-mono text-xs leading-5" spellCheck={false} />
        {parsed.error && <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>JSON invalide : {parsed.error}</span></div>}
        {issues.length > 0 && <div className="space-y-1 rounded-md border bg-muted/40 p-3 text-xs">{issues.map((issue, index) => <p key={`${issue.path}-${index}`} className={issue.severity === "error" ? "text-red-700" : "text-amber-700"}>{issue.severity === "error" ? "Erreur" : "Avertissement"} · <code>{issue.path}</code> — {issue.message}</p>)}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button disabled={!parsed.value || isValidating} onClick={checkAndApply}>{isValidating ? "Validation…" : <><Braces className="mr-2 h-4 w-4" /> Valider et appliquer au brouillon</>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
