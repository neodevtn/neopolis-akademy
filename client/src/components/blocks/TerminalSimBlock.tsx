import { useState, useRef, useEffect } from "react";
import { SquareTerminal, CheckCircle2 } from "lucide-react";

interface TerminalSimBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

export function TerminalSimBlock({ block, lang, t, onComplete, blockIdx }: TerminalSimBlockProps) {
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const completionMessage = typeof block.completionMessage === "object" ? (block.completionMessage[lang] || block.completionMessage.en || "") : (block.completionMessage || "");
  const prompt = block.prompt || "$ ";
  const steps = block.steps || [];

  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ type: "prompt" | "output" | "error" | "success"; text: string }[]>([]);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completed || !input.trim()) return;

    const step = steps[currentStep];
    if (!step) return;

    const cmd = input.trim();
    const expected = step.command.trim();
    const alternatives = step.alternatives ? step.alternatives.split(",").map((s: string) => s.trim()) : [];
    const allValid = [expected, ...alternatives];

    const newHistory = [...history, { type: "prompt" as const, text: `${prompt}${cmd}` }];

    if (allValid.some(valid => cmd.toLowerCase() === valid.toLowerCase())) {
      // Correct command
      newHistory.push({ type: "output" as const, text: step.output || "" });
      setHistory(newHistory);
      setInput("");

      if (currentStep + 1 >= steps.length) {
        // All steps completed
        setCompleted(true);
        if (completionMessage) {
          newHistory.push({ type: "success" as const, text: completionMessage });
          setHistory([...newHistory]);
        }
        if (onComplete) onComplete(block.id || `terminal_${blockIdx}`);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Wrong command
      const hint = step.hint ? (typeof step.hint === "object" ? (step.hint[lang] || step.hint.en || "") : step.hint) : "";
      newHistory.push({ type: "error" as const, text: hint || t({ en: "Command not recognized. Try again.", fr: "Commande non reconnue. Réessayez." }) });
      setHistory(newHistory);
      setInput("");
    }
  };

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-slate-100 dark:bg-slate-800">
        <SquareTerminal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        <span className="font-semibold text-foreground">{title || t({ en: "Terminal", fr: "Terminal" })}</span>
        {completed && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
        <span className="text-xs text-muted-foreground ml-auto">{t({ en: `Step ${Math.min(currentStep + 1, steps.length)}/${steps.length}`, fr: `Étape ${Math.min(currentStep + 1, steps.length)}/${steps.length}` })}</span>
      </div>
      {instructions && <p className="px-4 pt-3 text-sm text-muted-foreground">{instructions}</p>}
      <div
        ref={terminalRef}
        className="bg-slate-900 text-slate-100 font-mono text-sm p-4 min-h-[200px] max-h-[400px] overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <div key={i} className={`whitespace-pre-wrap ${
            entry.type === "error" ? "text-red-400" :
            entry.type === "success" ? "text-green-400 font-bold" :
            entry.type === "prompt" ? "text-white" : "text-slate-300"
          }`}>
            {entry.text}
          </div>
        ))}
        {!completed && (
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="text-green-400 mr-1">{prompt}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white caret-green-400"
              autoFocus
              spellCheck={false}
            />
          </form>
        )}
      </div>
    </div>
  );
}
