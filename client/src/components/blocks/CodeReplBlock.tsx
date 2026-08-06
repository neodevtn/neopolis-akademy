import { useState, useRef } from "react";
import { Terminal, Play, CheckCircle2, XCircle, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeReplBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
}

export function CodeReplBlock({ block, lang, t, onComplete, blockIdx }: CodeReplBlockProps) {
  const instructions = typeof block.instructions === "object" ? (block.instructions[lang] || block.instructions.en || "") : (block.instructions || "");
  const language = block.language || "python";
  const starterCode = block.starterCode || "";
  const solutionCode = block.solutionCode || "";
  const expectedOutput = block.expectedOutput || "";

  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setIsCorrect(null);

    try {
      // Simulate code execution via eval for JS or display expected output comparison
      if (language === "javascript" || language === "typescript") {
        try {
          const logs: string[] = [];
          const mockConsole = { log: (...args: any[]) => logs.push(args.map(String).join(" ")), error: (...args: any[]) => logs.push("Error: " + args.map(String).join(" ")) };
          const fn = new Function("console", code);
          fn(mockConsole);
          const result = logs.join("\n");
          setOutput(result);
          if (expectedOutput && result.trim() === expectedOutput.trim()) {
            setIsCorrect(true);
            if (onComplete) onComplete(block.id || `code_repl_${blockIdx}`);
          } else if (expectedOutput) {
            setIsCorrect(false);
          }
        } catch (err: any) {
          setOutput(`Error: ${err.message}`);
          setIsCorrect(false);
        }
      } else {
        // For Python/SQL, we show a simulated output panel
        // In a real implementation, this would call a sandboxed execution API
        setOutput(t({ en: "⚡ Code submitted. In a production environment, this would execute in a sandboxed runtime.", fr: "⚡ Code soumis. En production, ceci s'exécuterait dans un runtime sandboxé." }));
        if (expectedOutput && code.trim().includes(expectedOutput.trim().split("\n")[0])) {
          setIsCorrect(true);
          if (onComplete) onComplete(block.id || `code_repl_${blockIdx}`);
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(starterCode);
    setOutput("");
    setIsCorrect(null);
    setShowSolution(false);
  };

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-emerald-50 dark:bg-emerald-950/20">
        <Terminal className="w-5 h-5 text-emerald-600" />
        <span className="font-semibold text-foreground">{t({ en: "Interactive Code", fr: "Code interactif" })}</span>
        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 uppercase">{language}</span>
      </div>
      {instructions && <div className="px-4 pt-3 text-sm text-muted-foreground whitespace-pre-wrap">{instructions}</div>}
      <div className="p-4 space-y-3">
        {/* Code editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleTab}
            className="w-full min-h-[200px] bg-slate-900 text-green-300 font-mono text-sm p-4 rounded-lg border border-slate-700 resize-y outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
            spellCheck={false}
          />
          <span className="absolute top-2 right-2 text-xs text-slate-500 font-mono">{language}</span>
        </div>
        {/* Output panel */}
        {output && (
          <div className={`rounded-lg border p-3 font-mono text-sm whitespace-pre-wrap ${
            isCorrect === true ? "bg-green-50 dark:bg-green-950/20 border-green-300 text-green-800 dark:text-green-200" :
            isCorrect === false ? "bg-red-50 dark:bg-red-950/20 border-red-300 text-red-800 dark:text-red-200" :
            "bg-slate-50 dark:bg-slate-800 border-border text-foreground"
          }`}>
            <div className="flex items-center gap-2 mb-1 text-xs font-sans font-medium text-muted-foreground">
              {isCorrect === true && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              {isCorrect === false && <XCircle className="w-3.5 h-3.5 text-red-500" />}
              Output:
            </div>
            {output}
          </div>
        )}
        {/* Solution */}
        {showSolution && solutionCode && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">{t({ en: "Solution:", fr: "Solution :" })}</p>
            <pre className="bg-slate-900 text-slate-100 font-mono text-sm p-3 rounded overflow-x-auto">{solutionCode}</pre>
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleRun} disabled={isRunning} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
            <Play className="w-3.5 h-3.5" />
            {isRunning ? t({ en: "Running...", fr: "Exécution..." }) : t({ en: "Run", fr: "Exécuter" })}
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            {t({ en: "Reset", fr: "Réinitialiser" })}
          </Button>
          {solutionCode && (
            <Button onClick={() => setShowSolution(!showSolution)} variant="ghost" className="gap-1 text-amber-600">
              <Eye className="w-3.5 h-3.5" />
              {showSolution ? t({ en: "Hide solution", fr: "Masquer la solution" }) : t({ en: "Show solution", fr: "Voir la solution" })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
