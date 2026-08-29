import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { matchesCanonicalSolution, normalizeCodeForValidation } from "../shared/codeReplValidation";

describe("validation sûre des blocs Code REPL", () => {
  it("normalise les fins de ligne et espaces de fin sans modifier le contenu de code", () => {
    expect(normalizeCodeForValidation("const value = 1;  \r\nconsole.log(value);\r\n")).toBe("const value = 1;\nconsole.log(value);");
  });

  it("valide uniquement une proposition équivalente à la solution canonique, sans exécution", () => {
    expect(matchesCanonicalSolution("print('ok')\n", "print('ok')")).toBe(true);
    expect(matchesCanonicalSolution("print('non')", "print('ok')")).toBe(false);
    expect(matchesCanonicalSolution("print('ok')", "")).toBe(false);
  });

  it("ne laisse aucun mécanisme d’exécution dynamique dans le bloc apprenant", () => {
    const component = fs.readFileSync("client/src/components/blocks/CodeReplBlock.tsx", "utf8");
    expect(component).not.toContain("new Function");
    expect(component).not.toContain("eval(");
    expect(component).toContain("matchesCanonicalSolution");
  });
});
