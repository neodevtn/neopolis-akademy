import React, { useState } from "react";

export function resolveI18n(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.en || val.fr)) {
    return lang === "fr" ? (val.fr || val.en || "") : (val.en || val.fr || "");
  }
  return String(val);
}

// Detect repeated label-card patterns: Label\n\nTitle\n\nDescription (like Skilljar "Layer cards")
export function detectLabelCards(lines: string[]): { cards: { label: string; title: string; description: string }[]; startIdx: number; endIdx: number }[] {
  const results: { cards: { label: string; title: string; description: string }[]; startIdx: number; endIdx: number }[] = [];
  const visited = new Set<number>();
  
  for (let i = 0; i < lines.length; i++) {
    if (visited.has(i)) continue;
    const label = lines[i].trim();
    // Label: single word, capitalized, no punctuation, 2-20 chars
    if (!label || label.split(/\s+/).length > 1 || label.length > 20 || label.length < 2) continue;
    if (!/^[A-ZÀ-Ü]/.test(label)) continue;
    if (/[.,:;!?()0-9]/.test(label)) continue;
    
    // Try to find 2+ consecutive occurrences of this label
    const cards: { label: string; title: string; description: string }[] = [];
    let scanIdx = i;
    let lastEnd = i;
    
    while (scanIdx < lines.length) {
      const currentLabel = lines[scanIdx]?.trim();
      if (currentLabel !== label) break;
      
      // Skip empty lines after label
      let j = scanIdx + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      
      // Title line
      const title = lines[j]?.trim() || '';
      if (!title || title.length > 80) break;
      j++;
      
      // Skip empty lines after title
      while (j < lines.length && lines[j].trim() === '') j++;
      
      // Description line(s) - collect until next empty line or next label occurrence
      let desc = '';
      while (j < lines.length && lines[j].trim() !== '' && lines[j].trim() !== label) {
        desc += (desc ? ' ' : '') + lines[j].trim();
        j++;
      }
      
      cards.push({ label, title, description: desc });
      lastEnd = j;
      
      // Skip empty lines to find next potential label
      while (j < lines.length && lines[j].trim() === '') j++;
      scanIdx = j;
    }
    
    if (cards.length >= 2) {
      results.push({ cards, startIdx: i, endIdx: lastEnd });
      for (let k = i; k < lastEnd; k++) visited.add(k);
    }
  }
  
  return results;
}

// Render Layer Cards as a visual grid
export function LayerCardsGrid({ cards }: { cards: { label: string; title: string; description: string }[] }) {
  const colors = ['#c75b3a', '#c75b3a', '#2a7d8a', '#c75b3a', '#2a7d8a'];
  const bgColors = ['white', 'white', '#e8f4f8', 'white', '#e8f4f8'];
  
  return (
    <div className="my-6">
      <div className={`grid gap-4 ${cards.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : cards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {cards.map((card, idx) => {
          const borderColor = colors[idx % colors.length];
          const bgColor = bgColors[idx % bgColors.length];
          return (
            <div
              key={idx}
              className="rounded-lg p-4 border border-gray-200"
              style={{ borderTop: `4px solid ${borderColor}`, backgroundColor: bgColor }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                style={{ color: borderColor }}
              >
                {card.label}
              </span>
              <p className="text-sm font-bold text-gray-900 mb-1">{card.title}</p>
              {card.description && (
                <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Detect callout box patterns: "Label\n\"quoted text\"" or "Label\ntext" where label is short caps
export function detectCalloutBoxes(lines: string[]): { label: string; text: string; startIdx: number; endIdx: number }[] {
  const results: { label: string; text: string; startIdx: number; endIdx: number }[] = [];
  const calloutLabels = /^(single prompt|decomposed prompt|multi-step prompt|system prompt|user prompt|assistant response|prompt|example prompt|example response|response|output|input|bad prompt|good prompt|weak prompt|strong prompt|improved prompt|original prompt|revised prompt)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!calloutLabels.test(trimmed)) continue;
    if (trimmed.length > 40) continue;
    
    // Next non-empty line should be the content (possibly quoted)
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j >= lines.length) continue;
    
    // Collect content lines until next empty line or end
    let content = '';
    const _startContent = j;
    while (j < lines.length && lines[j].trim() !== '') {
      content += (content ? '\n' : '') + lines[j].trim();
      j++;
    }
    if (content) {
      results.push({ label: trimmed, text: content, startIdx: i, endIdx: j });
    }
  }
  return results;
}

// Detect numbered step sequences: "1\nLabel\n2\nLabel\n3\nLabel..."
export function detectStepperSequence(lines: string[], startIdx: number): { steps: string[]; endIdx: number } | null {
  const steps: string[] = [];
  let i = startIdx;
  let expectedNum = 1;
  
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    // Must be a bare number matching expected sequence
    if (trimmed === String(expectedNum)) {
      // Next non-empty line is the label
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j >= lines.length) break;
      const label = lines[j].trim();
      if (!label || label.length > 60) break;
      steps.push(label);
      expectedNum++;
      // Move past the label and any trailing empty lines
      j++;
      while (j < lines.length && lines[j].trim() === '') j++;
      i = j;
    } else {
      break;
    }
  }
  
  if (steps.length >= 3) {
    return { steps, endIdx: i };
  }
  return null;
}

// Detect inline tabbed content pattern:
// Pattern: instruction line ("Select each...") → 3+ short labels → repeated sections (Capability:/Limitation:/Mitigation: or similar paired entries)
export interface InlineTabBlock {
  instructionIdx: number;
  labels: string[];
  tabContents: { label: string; sections: { heading: string; text: string }[] }[];
  startIdx: number;
  endIdx: number;
}

export function detectInlineTabs(lines: string[]): InlineTabBlock[] {
  const results: InlineTabBlock[] = [];
  
  // Look for instruction lines that precede tab labels
  const instructionPatterns = /^(Select each|Sélectionnez chaque|Choose each|Click each|Cliquez sur|Choisissez)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!instructionPatterns.test(trimmed)) continue;
    
    // After instruction, find 3+ consecutive short label lines
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    
    const labels: string[] = [];
    const _labelsStart = j;
    while (j < lines.length) {
      const t = lines[j].trim();
      if (t === '') { j++; continue; }
      // Labels are short (<=40 chars), few words, start with capital, no ending punctuation
      if (t.length <= 40 && t.split(/\s+/).length <= 5 && /^[A-Z]/.test(t) && !/[.,:;!?)]$/.test(t) && !t.includes(':')) {
        labels.push(t);
        j++;
      } else {
        break;
      }
    }
    
    if (labels.length < 3) continue;
    
    // After labels, look for repeated section patterns (Capability:/Limitation:/Mitigation: or similar)
    // Each tab should have the same number of sections
    const sectionPattern = /^(Capability|Limitation|Mitigation|Capacité|Limite|Atténuation|Mesures d'atténuation|Cost|Complexity|Risk|Coût|Complexité|Risque|The feasibility question to ask|Where design compensates|La question de faisabilité|Où la conception compense)\s*[:：]/i;
    
    // Skip empty lines
    while (j < lines.length && lines[j].trim() === '') j++;
    
    // Detect section headings and their content
    const allSections: { heading: string; text: string; lineIdx: number }[] = [];
    let k = j;
    while (k < lines.length) {
      const line = lines[k].trim();
      if (line === '') { k++; continue; }
      
      const sectionMatch = line.match(sectionPattern);
      if (sectionMatch) {
        // This is a section heading line - extract heading and content
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) { k++; continue; }
        const heading = line.slice(0, colonIdx).trim();
        const restOfLine = line.slice(colonIdx + 1).trim();
        
        // Collect content: rest of this line + following non-empty lines until next section or double blank
        let content = restOfLine;
        k++;
        while (k < lines.length) {
          const nextLine = lines[k].trim();
          if (nextLine === '') {
            // Check if next non-empty line is a new section heading
            let peek = k + 1;
            while (peek < lines.length && lines[peek].trim() === '') peek++;
            if (peek >= lines.length || sectionPattern.test(lines[peek].trim()) || 
                (!sectionPattern.test(lines[peek].trim()) && allSections.length >= labels.length * 2)) {
              break;
            }
            // Otherwise it's just a paragraph break within the section
            content += '\n\n';
            k++;
            continue;
          }
          if (sectionPattern.test(nextLine)) break;
          content += (content ? ' ' : '') + nextLine;
          k++;
        }
        allSections.push({ heading, text: content, lineIdx: k });
      } else {
        // Not a section heading - we've reached the end of the tab content
        break;
      }
    }
    
    // We need at least (labels.length) sections to form tabs
    // Typically it's labels.length * 3 (Capability/Limitation/Mitigation for each)
    if (allSections.length < labels.length) continue;
    
    // Determine how many sections per tab
    const sectionsPerTab = Math.floor(allSections.length / labels.length);
    if (sectionsPerTab < 1) continue;
    
    // Distribute sections to tabs
    const tabContents: { label: string; sections: { heading: string; text: string }[] }[] = [];
    for (let ti = 0; ti < labels.length; ti++) {
      const startSec = ti * sectionsPerTab;
      const endSec = startSec + sectionsPerTab;
      tabContents.push({
        label: labels[ti],
        sections: allSections.slice(startSec, endSec).map(s => ({ heading: s.heading, text: s.text }))
      });
    }
    
    results.push({
      instructionIdx: i,
      labels,
      tabContents,
      startIdx: i,
      endIdx: k
    });
  }
  
  return results;
}

// Detect "Label · Label · Label" header followed by "Label: text" sections (styled info block)
export interface StyledInfoBlock {
  header: string;
  sections: { heading: string; text: string }[];
  startIdx: number;
  endIdx: number;
}

export function detectStyledInfoBlocks(lines: string[]): StyledInfoBlock[] {
  const results: StyledInfoBlock[] = [];
  // Pattern: "Word · Word · Word" (dot-separated labels) followed by matching "Word: text" sections
  const dotSeparatorPattern = /^([A-Z\u00C0-\u024F][a-z\u00C0-\u024F]*(?:\s+[a-z\u00C0-\u024F]+)*)\s*[·•]\s*([A-Z\u00C0-\u024F][a-z\u00C0-\u024F]*(?:\s+[a-z\u00C0-\u024F]+)*)\s*[·•]\s*([A-Z\u00C0-\u024F][a-z\u00C0-\u024F]*(?:\s+[a-z\u00C0-\u024F]+)*)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const match = trimmed.match(dotSeparatorPattern);
    if (!match) continue;
    
    const headerLabels = [match[1], match[2], match[3]];
    
    // After the header, look for matching sections
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    
    const sections: { heading: string; text: string }[] = [];
    while (j < lines.length) {
      const line = lines[j].trim();
      if (line === '') { j++; continue; }
      
      // Check if this line starts with one of the header labels followed by colon
      const sectionMatch = headerLabels.find(label => 
        line.startsWith(label + ':') || line.startsWith(label + ' :')
      );
      if (sectionMatch) {
        const colonIdx = line.indexOf(':');
        const heading = line.slice(0, colonIdx).trim();
        const restOfLine = line.slice(colonIdx + 1).trim();
        
        // Collect content until next section or end
        let content = restOfLine;
        j++;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          if (nextLine === '') {
            let peek = j + 1;
            while (peek < lines.length && lines[peek].trim() === '') peek++;
            if (peek >= lines.length) break;
            const peekLine = lines[peek].trim();
            const isNextSection = headerLabels.some(label => 
              peekLine.startsWith(label + ':') || peekLine.startsWith(label + ' :')
            );
            if (isNextSection || !peekLine) break;
            content += '\n\n';
            j++;
            continue;
          }
          const isNextSection = headerLabels.some(label => 
            nextLine.startsWith(label + ':') || nextLine.startsWith(label + ' :')
          );
          if (isNextSection) break;
          content += ' ' + nextLine;
          j++;
        }
        sections.push({ heading, text: content });
      } else {
        break;
      }
    }
    
    if (sections.length >= 2) {
      results.push({
        header: trimmed,
        sections,
        startIdx: i,
        endIdx: j
      });
    }
  }
  
  return results;
}

// Styled info block renderer (beige card with sections)
export function StyledInfoBlockRenderer({ block }: { block: StyledInfoBlock }) {
  return (
    <div className="my-6 p-5 rounded-xl border border-[#e8e5e0] dark:border-slate-700 bg-[#f5f3ef] dark:bg-slate-800/50">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
        {block.header}
      </div>
      <div className="space-y-4">
        {block.sections.map((section, idx) => (
          <div key={idx}>
            <span className="text-[15px] font-bold text-foreground">{section.heading}:</span>
            <span className="text-[14.5px] text-foreground/80 ml-1 leading-[1.75]">
              {section.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Interactive inline tabs renderer component
export function InlineTabsRenderer({ block }: { block: InlineTabBlock }) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="my-6">
      {/* Tab headers - Skilljar style with orange active indicator */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {block.tabContents.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`
              px-5 py-3 text-sm font-medium transition-all duration-200 relative whitespace-nowrap
              ${activeTab === idx
                ? 'text-[#c75b3a]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
            `}
          >
            {tab.label}
            {activeTab === idx && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#c75b3a] rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content - styled card */}
      <div className="mt-4 p-5 rounded-xl border border-[#e8e5e0] dark:border-slate-700 bg-[#faf9f7] dark:bg-slate-800/40">
        {block.tabContents[activeTab]?.sections.map((section, idx) => (
          <div key={idx} className={idx > 0 ? 'mt-5 pt-5 border-t border-[#e8e5e0] dark:border-slate-700' : ''}>
            <span className="text-sm font-bold text-foreground">{section.heading}:</span>
            <span className="text-sm text-foreground/80 ml-1 leading-relaxed">
              {section.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detect numbered list blocks: "1. text\n\n2. text\n\n3. text" pattern
export interface NumberedListBlock {
  startIdx: number;
  endIdx: number;
  introLine: number | null; // line index of the intro sentence (e.g. "À l'issue de ce module, vous serez capable de :")
  items: { num: number; text: string }[];
}

export function detectNumberedLists(lines: string[]): NumberedListBlock[] {
  const results: NumberedListBlock[] = [];
  const visited = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (visited.has(i)) continue;
    const match = lines[i].trim().match(/^(\d+)[.)]\.?\s+(.+)/);
    if (!match || parseInt(match[1]) !== 1) continue;

    // Found a "1. ..." line - collect consecutive numbered items
    const items: { num: number; text: string }[] = [];
    let expectedNum = 1;
    let j = i;
    let endIdx = i;

    while (j < lines.length) {
      const trimmed = lines[j].trim();
      const numMatch = trimmed.match(/^(\d+)[.)]\.?\s+(.+)/);
      if (numMatch && parseInt(numMatch[1]) === expectedNum) {
        // Collect multi-line item (continuation lines until next numbered item or empty+numbered)
        let itemText = numMatch[2];
        let k = j + 1;
        // Check for continuation lines (non-empty, non-numbered)
        while (k < lines.length && lines[k].trim() !== '' && !lines[k].trim().match(/^\d+[.)]\.?\s/)) {
          itemText += ' ' + lines[k].trim();
          k++;
        }
        items.push({ num: expectedNum, text: itemText });
        expectedNum++;
        endIdx = k;
        // Skip empty lines between items
        while (k < lines.length && lines[k].trim() === '') k++;
        j = k;
      } else {
        break;
      }
    }

    if (items.length >= 3) {
      // Check if there's an intro line before (ending with ":")
      let introLine: number | null = null;
      let searchBack = i - 1;
      while (searchBack >= 0 && lines[searchBack].trim() === '') searchBack--;
      if (searchBack >= 0 && lines[searchBack].trim().endsWith(':')) {
        introLine = searchBack;
      }

      const startIdx = introLine !== null ? introLine : i;
      results.push({ startIdx, endIdx, introLine, items });
      for (let k = startIdx; k < endIdx; k++) visited.add(k);
    }
  }
  return results;
}

// Detect long content sections suitable for accordion (sections with headings followed by paragraphs)
export interface AccordionSection {
  title: string;
  contentLines: string[];
}
export interface AccordionBlock {
  startIdx: number;
  endIdx: number;
  sections: AccordionSection[];
}

export function detectAccordionBlocks(lines: string[], excludedLines: Set<number>): AccordionBlock[] {
  const results: AccordionBlock[] = [];
  
  // Find sequences of 4+ short heading lines each followed by paragraph content
  // Pattern: short title line (< 60 chars, no period, starts with capital) followed by 2+ content lines
  const sections: { titleIdx: number; title: string; contentStart: number; contentEnd: number }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (excludedLines.has(i)) continue;
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    
    // Check if this is a section heading
    if (
      trimmed.length > 3 &&
      trimmed.length < 70 &&
      /^[A-ZÀ-Ÿ]/.test(trimmed) &&
      !/[.;,)]$/.test(trimmed) &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('•') &&
      !trimmed.match(/^\d+[.)]\.?\s/) &&
      trimmed.split(/\s+/).length <= 12
    ) {
      // Check that previous line is empty (or start of content)
      if (i > 0 && lines[i - 1].trim() !== '' && !excludedLines.has(i - 1)) continue;
      
      // Collect content lines after this heading
      let contentStart = i + 1;
      // Skip empty line after heading
      while (contentStart < lines.length && lines[contentStart].trim() === '') contentStart++;
      
      let contentEnd = contentStart;
      let contentLineCount = 0;
      while (contentEnd < lines.length) {
        if (excludedLines.has(contentEnd)) break;
        const cl = lines[contentEnd].trim();
        if (cl === '') {
          // Check if next non-empty line is a new section heading
          let peek = contentEnd + 1;
          while (peek < lines.length && lines[peek].trim() === '') peek++;
          if (peek < lines.length) {
            const peekTrimmed = lines[peek].trim();
            if (
              peekTrimmed.length > 3 &&
              peekTrimmed.length < 70 &&
              /^[A-ZÀ-Ÿ]/.test(peekTrimmed) &&
              !/[.;,)]$/.test(peekTrimmed) &&
              !peekTrimmed.startsWith('-') &&
              !peekTrimmed.startsWith('•') &&
              !peekTrimmed.match(/^\d+[.)]\.?\s/) &&
              peekTrimmed.split(/\s+/).length <= 12
            ) {
              break; // Next section heading found
            }
          } else {
            break; // End of content
          }
          contentEnd++;
        } else {
          contentLineCount++;
          contentEnd++;
        }
      }
      
      if (contentLineCount >= 2) {
        sections.push({ titleIdx: i, title: trimmed, contentStart, contentEnd });
      }
    }
  }
  
  // Group consecutive sections into accordion blocks (need 4+ sections)
  if (sections.length >= 4) {
    let blockStart = 0;
    while (blockStart < sections.length) {
      // Find a run of consecutive sections (each section starts right after the previous ends)
      let blockEnd = blockStart + 1;
      while (blockEnd < sections.length) {
        const prevSection = sections[blockEnd - 1];
        const currSection = sections[blockEnd];
        // Check if current section title is within a few lines of previous section's content end
        const gap = currSection.titleIdx - prevSection.contentEnd;
        if (gap <= 3) {
          blockEnd++;
        } else {
          break;
        }
      }
      
      const runLength = blockEnd - blockStart;
      if (runLength >= 4) {
        const accordionSections: AccordionSection[] = [];
        for (let s = blockStart; s < blockEnd; s++) {
          const sec = sections[s];
          accordionSections.push({
            title: sec.title,
            contentLines: lines.slice(sec.contentStart, sec.contentEnd).filter(l => l.trim() !== '')
          });
        }
        results.push({
          startIdx: sections[blockStart].titleIdx,
          endIdx: sections[blockEnd - 1].contentEnd,
          sections: accordionSections
        });
      }
      blockStart = blockEnd;
    }
  }
  
  return results;
}

// Detect "Step N: description" or "STEP N: description" patterns
export function detectStepItems(lines: string[], startIdx: number): { items: { num: number; text: string }[]; endIdx: number } | null {
  const items: { items: { num: number; text: string }[]; endIdx: number } = { items: [], endIdx: startIdx };
  let i = startIdx;
  
  while (i < lines.length) {
    const match = lines[i].trim().match(/^(?:Step|STEP)\s+(\d+)[:.·]\s*(.+)$/i);
    if (match) {
      items.items.push({ num: parseInt(match[1]), text: match[2] });
      items.endIdx = i + 1;
      i++;
    } else if (lines[i].trim() === '' && items.items.length > 0) {
      // Allow one empty line between step items
      i++;
      const nextMatch = lines[i]?.trim().match(/^(?:Step|STEP)\s+(\d+)[:.·]\s*(.+)$/i);
      if (!nextMatch) break;
    } else {
      break;
    }
  }
  
  if (items.items.length >= 2) return items;
  return null;
}

// Detect concatenated table patterns (scraping artifact: "HeaderCol1HeaderCol2\nCell1Cell2")
export function detectConcatenatedTables(lines: string[]): { headers: string[]; rows: string[][]; startIdx: number; endIdx: number }[] {
  const results: { headers: string[]; rows: string[][]; startIdx: number; endIdx: number }[] = [];
  const visited = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (visited.has(i)) continue;
    const stripped = lines[i].trim();
    if (!stripped || stripped.length < 10) continue;

    // Check for camelCase transitions (lowercase immediately followed by uppercase)
    const transitions = (stripped.match(/[a-z][A-Z]/g) || []).length;
    if (transitions < 1) continue;

    // Split header at camelCase boundaries (including after punctuation)
    const headerCells = stripped.split(/(?<=[a-z.?!,;:)])(?=[A-Z])/);
    if (headerCells.length < 2) continue;

    // Check subsequent non-empty lines for similar pattern
    const colCount = headerCells.length;
    const rows: string[][] = [];
    let endIdx = i + 1;

    for (let j = i + 1; j < lines.length; j++) {
      const rowLine = lines[j].trim();
      if (!rowLine) { endIdx = j + 1; continue; }

      // Check if this row also has camelCase transitions
      const rowTransitions = (rowLine.match(/[a-z][A-Z]/g) || []).length;
      if (rowTransitions < 1 && rowLine.length > 30) break;
      if (rowTransitions < 1) break;

      // Split row with limited splits to match column count
      const rowCells = rowLine.split(/(?<=[a-z.?!,;:)])(?=[A-Z])/);
      // Accept rows that split into colCount cells (or close)
      if (rowCells.length >= colCount - 1 && rowCells.length <= colCount + 1) {
        // Normalize to exact colCount
        if (rowCells.length > colCount) {
          // Merge extra cells into the last column
          const normalized = rowCells.slice(0, colCount - 1);
          normalized.push(rowCells.slice(colCount - 1).join(''));
          rows.push(normalized);
        } else if (rowCells.length < colCount) {
          // Pad with empty cells
          rows.push([...rowCells, ...Array(colCount - rowCells.length).fill('')]);
        } else {
          rows.push(rowCells);
        }
        endIdx = j + 1;
      } else {
        break;
      }
    }

    // Need at least 2 data rows to consider it a table
    if (rows.length >= 2) {
      results.push({ headers: headerCells, rows, startIdx: i, endIdx });
      for (let k = i; k < endIdx; k++) visited.add(k);
    }
  }
  return results;
}

// Detect markdown pipe tables (| col1 | col2 |)
export function detectMarkdownTables(lines: string[]): { headers: string[]; rows: string[][]; startIdx: number; endIdx: number }[] {
  const results: { headers: string[]; rows: string[][]; startIdx: number; endIdx: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|') || !line.endsWith('|')) continue;

    // Check if next line is a separator (| --- | --- |)
    const nextLine = lines[i + 1]?.trim() || '';
    if (!nextLine.match(/^\|[\s-:|]+\|$/)) continue;

    // Parse header
    const headers = line.split('|').filter(c => c.trim()).map(c => c.trim());
    if (headers.length < 2) continue;

    // Parse rows
    const rows: string[][] = [];
    let endIdx = i + 2;
    for (let j = i + 2; j < lines.length; j++) {
      const rowLine = lines[j].trim();
      if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;
      const cells = rowLine.split('|').filter(c => c.trim() !== '' || c.includes(' ')).map(c => c.trim());
      if (cells.length >= 1) {
        rows.push(cells);
        endIdx = j + 1;
      }
    }

    if (rows.length >= 1) {
      results.push({ headers, rows, startIdx: i, endIdx });
    }
  }
  return results;
}

// Smart content renderer with heuristic structure detection
