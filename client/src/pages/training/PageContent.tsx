
import React, { useState, useMemo } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ExerciseRenderer } from "@/components/ExerciseRenderer";
import { FlipCardsGrid } from "@/components/FlipCard";
import { TabbedContent } from "@/components/TabbedContent";
import { ComparisonBox } from "@/components/ComparisonBox";
import { CourseIllustration } from "@/components/CourseIllustration";
import {
  resolveI18n,
  detectLabelCards,
  LayerCardsGrid,
  detectCalloutBoxes,
  detectStepperSequence,
  detectInlineTabs,
  detectStyledInfoBlocks,
  StyledInfoBlockRenderer,
  InlineTabsRenderer,
  detectNumberedLists,
  detectAccordionBlocks,
  detectStepItems,
  detectConcatenatedTables,
  detectMarkdownTables,
  type InlineTabBlock,
  type StyledInfoBlock,
  type NumberedListBlock,
  type AccordionBlock,
} from "./contentDetectors";
import { ChevronDown, ChevronRight, Check } from "lucide-react";

export default function PageContent({ content, lang }: { content: string; lang: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeKey = 0;
  let isFirstTextLine = true;

  // Detect layer card patterns first
  const cardGroups = detectLabelCards(lines);
  const cardLineSet = new Set<number>();
  cardGroups.forEach(g => {
    for (let k = g.startIdx; k < g.endIdx; k++) cardLineSet.add(k);
  });

  // Detect callout boxes
  const calloutBoxes = detectCalloutBoxes(lines);
  const calloutLineSet = new Set<number>();
  calloutBoxes.forEach(cb => {
    for (let k = cb.startIdx; k < cb.endIdx; k++) calloutLineSet.add(k);
  });

  // Detect concatenated tables (scraping artifact)
  const concatTables = detectConcatenatedTables(lines);
  const concatTableLineSet = new Set<number>();
  concatTables.forEach(t => {
    for (let k = t.startIdx; k < t.endIdx; k++) concatTableLineSet.add(k);
  });

  // Detect markdown pipe tables
  const mdTables = detectMarkdownTables(lines);
  const mdTableLineSet = new Set<number>();
  mdTables.forEach(t => {
    for (let k = t.startIdx; k < t.endIdx; k++) mdTableLineSet.add(k);
  });

  // Pre-pass: detect TOC blocks (sequence of short topic lines near the start of content)
  const tocBlocks: { startIdx: number; endIdx: number; items: string[] }[] = [];
  const tocLineSet = new Set<number>();
  // Look for TOC pattern: after first non-empty line (title), find 3+ consecutive short topic lines
  const firstNonEmptyIdx = lines.findIndex(l => l.trim() !== '');
  if (firstNonEmptyIdx >= 0) {
    // Find next non-empty line after the first one (skip empty lines)
    let searchStart = firstNonEmptyIdx + 1;
    while (searchStart < lines.length && lines[searchStart].trim() === '') searchStart++;
    if (searchStart < lines.length) {
      const tocItems: string[] = [];
      let tocEnd = searchStart;
      while (tocEnd < lines.length) {
        const t = lines[tocEnd].trim();
        if (t === '') { tocEnd++; continue; }
        if (t.length <= 40 && t.split(/\s+/).length <= 5 && /^[A-Z]/.test(t) && !/[.,:;!?)]$/.test(t) && !t.includes(':')) {
          tocItems.push(t);
          tocEnd++;
        } else {
          break;
        }
      }
      if (tocItems.length >= 3) {
        tocBlocks.push({ startIdx: searchStart, endIdx: tocEnd, items: tocItems });
        for (let k = searchStart; k < tocEnd; k++) tocLineSet.add(k);
      }
    }
  }

  // Detect inline tabbed content (tabs embedded in text)
  const inlineTabBlocks = detectInlineTabs(lines);
  const inlineTabLineSet = new Set<number>();
  inlineTabBlocks.forEach(tb => {
    for (let k = tb.startIdx; k < tb.endIdx; k++) inlineTabLineSet.add(k);
  });

  // Detect styled info blocks ("Cost · Complexity · Risk" pattern)
  const styledInfoBlocks = detectStyledInfoBlocks(lines);
  const styledInfoLineSet = new Set<number>();
  styledInfoBlocks.forEach(sb => {
    for (let k = sb.startIdx; k < sb.endIdx; k++) styledInfoLineSet.add(k);
  });

  // Detect numbered list blocks ("1. text\n\n2. text\n\n3. text")
  const numberedListBlocks = detectNumberedLists(lines);
  const numberedListLineSet = new Set<number>();
  numberedListBlocks.forEach(nl => {
    for (let k = nl.startIdx; k < nl.endIdx; k++) numberedListLineSet.add(k);
  });

  // Build combined exclusion set for accordion detection (don't detect inside other structures)
  const allExcluded = new Set<number>();
  [cardLineSet, calloutLineSet, concatTableLineSet, mdTableLineSet,
   tocLineSet, inlineTabLineSet, styledInfoLineSet, numberedListLineSet
  ].forEach(s => s.forEach(v => allExcluded.add(v)));

  // Detect accordion blocks (4+ consecutive titled sections)
  const accordionBlocks = detectAccordionBlocks(lines, allExcluded);
  const accordionLineSet = new Set<number>();
  accordionBlocks.forEach(ab => {
    for (let k = ab.startIdx; k < ab.endIdx; k++) accordionLineSet.add(k);
  });

  // Heuristic helpers
  const _isShortLine = (line: string) => line.trim().length > 0 && line.trim().length <= 60;
  const isMetaLine = (line: string) => /^(Estimated time|Instructions|Duration|Time|Note|Tip|Warning|Important|Example|Exercise|Step \d):/i.test(line.trim());

  // Detect sub-section headings with pattern "Title: description" (e.g. "Tokens: the unit of input, output, and cost")
  const isSubSectionTitle = (line: string, idx: number) => {
    const trimmed = line.trim();
    // Must have a colon, be under 80 chars, not be a meta line
    if (!trimmed.includes(':') || trimmed.length > 80 || trimmed.length < 10) return false;
    if (isMetaLine(line)) return false;
    // Pattern: "Word(s): rest of title" where the part before colon is 1-4 words
    const colonIdx = trimmed.indexOf(':');
    const beforeColon = trimmed.slice(0, colonIdx).trim();
    const afterColon = trimmed.slice(colonIdx + 1).trim();
    if (beforeColon.split(/\s+/).length > 5) return false;
    if (afterColon.length < 5) return false;
    // Must start with a capital letter
    if (!/^[A-Z]/.test(beforeColon)) return false;
    // Must be preceded by an empty line (or be near the start)
    if (idx > 0 && lines[idx - 1].trim() !== '') return false;
    // Must be followed by an empty line then a paragraph
    if (idx < lines.length - 1 && lines[idx + 1].trim() !== '') return false;
    return true;
  };

  // Detect TOC block: sequence of short lines (1-3 words each) at the beginning of content
  
  // Technical terms - render as bold inline text (not badges)
  const techTerms = new Set(['Code Execution', 'Memory', 'Skills', 'Knowledge Base', 'Standing Instructions',
    'System Prompt', 'Context Window', 'API Key', 'Token', 'Temperature', 'Prompt Caching',
    'Tool Use', 'Function Calling', 'Streaming', 'Batch Processing', 'Vision', 'Embeddings',
    'Fine-tuning', 'RAG', 'MCP', 'Artifacts', 'Projects', 'Computer Use']);
  const isTechTerm = (line: string) => techTerms.has(line.trim());
  
  // Known section heading keywords (case-insensitive match)
  const knownSectionHeadings = new Set([
    'exercises', 'reflection', "what's next",
    'acknowledgments and license', 'putting things into practice',
    'getting started', 'what you will learn', 'learning objectives',
    'summary', 'conclusion', 'introduction', 'overview', 'prerequisites',
    'next steps', 'resources', 'references', 'discussion', 'activity',
    // French equivalents
    'exercices', 'réflexion', 'et ensuite', 'points clés', 'à retenir',
    'remerciements et licence', 'mise en pratique', 'objectifs',
    'résumé', 'prochaines étapes', 'ressources'
  ]);

  const isSectionHeading = (line: string, nextLine: string | undefined) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.length > 60) return false;
    if (isTechTerm(trimmed)) return false;
    
    // Check against known section heading keywords
    if (knownSectionHeadings.has(trimmed.toLowerCase())) return true;
    
    // Must not contain colons (those are handled by isSubSectionTitle)
    if (trimmed.includes(':')) return false;
    
    // Question-style headings (e.g. "Why do we need AI Fluency?")
    if (/^[A-Z][^.]*\?$/.test(trimmed) && trimmed.length <= 55) {
      if (!nextLine || nextLine.trim() === '' || nextLine.trim().length > trimmed.length) {
        return true;
      }
    }
    
    // Short line that doesn't end with period/comma (allow ? and !)
    if (!/[.,;)]$/.test(trimmed) && trimmed.length <= 50) {
      if (!nextLine || nextLine.trim() === '' || nextLine.trim().length > trimmed.length) {
        return true;
      }
    }
    return false;
  };
  const isImplicitListItem = (line: string, prevLines: string[], nextLines: string[]) => {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.length > 120) return false;
    
    // Check if it starts with a parenthetical pattern like "Clear product description (what...)"
    if (/^[A-Z][^.]*\([^)]+\)$/.test(trimmed)) return true;
    
    // Check if previous non-empty line ends with ":" (introduces a list)
    const prevNonEmpty = prevLines.filter(l => l.trim().length > 0);
    const lastPrev = prevNonEmpty[prevNonEmpty.length - 1]?.trim() || '';
    const secondLastPrev = prevNonEmpty[prevNonEmpty.length - 2]?.trim() || '';
    
    // If any recent non-empty line ends with ":" - this is a list context
    const hasColonIntro = prevLines.slice(-12).some(l => l.trim().endsWith(':'));
    
    // If the previous non-empty line ends with ":" or the one before that does
    // AND this line is relatively short and starts with a capital letter
    if ((lastPrev.endsWith(':') || secondLastPrev.endsWith(':') || hasColonIntro) && trimmed.length <= 100) {
      // This is likely a list item following a colon-ending intro
      if (/^[A-Z\u00C0-\u024F]/.test(trimmed) && !trimmed.endsWith(':')) return true;
      // Also catch lines starting with a product/tool name followed by colon ("Claude: Visit...")
      if (/^[A-Z][a-zA-Z]+:/.test(trimmed)) return true;
    }
    
    // Detect sequences of short lines that start with capitals and have similar structure
    if (/^[A-Z\u00C0-\u024F]/.test(trimmed) && trimmed.length <= 100 && !trimmed.endsWith('.')) {
      // Check if previous non-empty line is also a similar short line (continuation)
      if (prevNonEmpty.length >= 1) {
        const prevTrimmed = lastPrev;
        if (prevTrimmed.length > 20 && prevTrimmed.length <= 100 &&
            /^[A-Z\u00C0-\u024F]/.test(prevTrimmed) &&
            !prevTrimmed.endsWith('.') && !prevTrimmed.endsWith(':')) {
          return true;
        }
      }
      
      // Forward-looking: if the NEXT non-empty line is also a similar short line,
      // then this is likely the FIRST item of an implicit list
      if (trimmed.length > 20) {
        const nextNonEmpty = nextLines.find(l => l.trim().length > 0);
        if (nextNonEmpty) {
          const nextTrimmed = nextNonEmpty.trim();
          if (nextTrimmed.length > 20 && nextTrimmed.length <= 100 &&
              /^[A-Z\u00C0-\u024F]/.test(nextTrimmed) &&
              !nextTrimmed.endsWith('.') && !nextTrimmed.endsWith(':')) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    // Check if this line starts a card group - render the card grid and skip
    const cardGroup = cardGroups.find(g => g.startIdx === i);
    if (cardGroup) {
      elements.push(<LayerCardsGrid key={`cards-${i}`} cards={cardGroup.cards} />);
      i = cardGroup.endIdx - 1;
      continue;
    }
    if (cardLineSet.has(i)) continue;

    // Check if this line starts an inline tabbed content block
    const inlineTab = inlineTabBlocks.find(tb => tb.startIdx === i);
    if (inlineTab) {
      elements.push(<InlineTabsRenderer key={`itabs-${i}`} block={inlineTab} />);
      i = inlineTab.endIdx - 1;
      continue;
    }
    if (inlineTabLineSet.has(i)) continue;

    // Check if this line starts a styled info block (Cost · Complexity · Risk)
    const styledInfo = styledInfoBlocks.find(sb => sb.startIdx === i);
    if (styledInfo) {
      elements.push(<StyledInfoBlockRenderer key={`sinfo-${i}`} block={styledInfo} />);
      i = styledInfo.endIdx - 1;
      continue;
    }
    if (styledInfoLineSet.has(i)) continue;

    // Check if this line starts a numbered list block
    const numberedList = numberedListBlocks.find(nl => nl.startIdx === i);
    if (numberedList) {
      elements.push(
        <div key={`numlist-${i}`} className="my-6">
          {numberedList.introLine !== null && (
            <p className="text-[14.5px] leading-[1.75] mb-4 text-foreground/80 font-medium">
              {renderInlineFormatting(lines[numberedList.introLine].trim())}
            </p>
          )}
          <div className="space-y-3 pl-1">
            {numberedList.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#c75b3a] to-[#a84832] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {item.num}
                </div>
                <p className="text-[14.5px] leading-[1.75] text-foreground/80 pt-1 flex-1">
                  {renderInlineFormatting(item.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
      i = numberedList.endIdx - 1;
      continue;
    }
    if (numberedListLineSet.has(i)) continue;

    // Check if this line starts an accordion block
    const accordionBlock = accordionBlocks.find(ab => ab.startIdx === i);
    if (accordionBlock) {
      elements.push(
        <div key={`accordion-${i}`} className="my-6 rounded-xl border border-[#e8e5e0] dark:border-slate-700 overflow-hidden">
          <Accordion type="multiple" defaultValue={[accordionBlock.sections[0]?.title || '']}>
            {accordionBlock.sections.map((section, idx) => (
              <AccordionItem key={idx} value={section.title} className="border-b border-[#e8e5e0] dark:border-slate-700 last:border-b-0">
                <AccordionTrigger className="px-5 py-4 text-[15px] font-semibold text-foreground hover:no-underline hover:bg-[#faf9f7] dark:hover:bg-slate-800/40">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  <div className="space-y-2">
                    {section.contentLines.map((cl, ci) => (
                      <p key={ci} className="text-[14px] leading-[1.75] text-foreground/75">
                        {renderInlineFormatting(cl)}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
      i = accordionBlock.endIdx - 1;
      continue;
    }
    if (accordionLineSet.has(i)) continue;

    // Check if this line starts a TOC block
    const tocBlock = tocBlocks.find(tb => tb.startIdx === i);
    if (tocBlock) {
      elements.push(
        <div key={`toc-${i}`} className="mb-6 mt-2 flex flex-wrap gap-2">
          {tocBlock.items.map((item, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#f0ede8] dark:bg-slate-800 text-foreground/70 border border-[#e8e5e0] dark:border-slate-700">
              {item}
            </span>
          ))}
        </div>
      );
      i = tocBlock.endIdx - 1;
      continue;
    }
    if (tocLineSet.has(i)) continue;

    // Check if this line starts a callout box
    const calloutBox = calloutBoxes.find(cb => cb.startIdx === i);
    if (calloutBox) {
      elements.push(
        <div key={`callout-${i}`} className="my-5 rounded-xl border-l-4 border-l-[#c75b3a] border border-[#e8e5e0] dark:border-slate-700 bg-[#faf9f7] dark:bg-slate-800/40 p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c75b3a] block mb-2">
            {calloutBox.label}
          </span>
          <p className="text-[14px] text-foreground/85 leading-relaxed italic">
            {calloutBox.text}
          </p>
        </div>
      );
      i = calloutBox.endIdx - 1;
      continue;
    }
    if (calloutLineSet.has(i)) continue;

    // Check if this line starts a concatenated table
    const concatTable = concatTables.find(t => t.startIdx === i);
    if (concatTable) {
      elements.push(
        <div key={`ctable-${i}`} className="my-5 overflow-x-auto rounded-xl border border-[#e8e5e0] dark:border-slate-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f5f3ef] dark:bg-slate-800">
                {concatTable.headers.map((h, hi) => (
                  <th key={hi} className="text-left px-4 py-3 font-semibold text-foreground text-[13px] uppercase tracking-wide border-b border-[#e8e5e0] dark:border-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {concatTable.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#faf9f7] dark:bg-slate-800/40'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-foreground/80 text-[13.5px] border-b border-[#e8e5e0]/60 dark:border-slate-700/60">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = concatTable.endIdx - 1;
      continue;
    }
    if (concatTableLineSet.has(i)) continue;

    // Check if this line starts a markdown pipe table
    const mdTable = mdTables.find(t => t.startIdx === i);
    if (mdTable) {
      // Check if this table contains download links (/manus-storage/)
      const hasDownloadLinks = mdTable.rows.some(row => row.some(cell => cell.includes('/manus-storage/')));
      if (hasDownloadLinks) {
        // Render as download buttons instead of a table
        elements.push(
          <div key={`mdtable-${i}`} className="my-5 space-y-3">
            {mdTable.rows.map((row, ri) => {
              // Find the cell with the download link
              const linkCell = row.find(cell => cell.includes('/manus-storage/'));
              if (!linkCell) return null;
              const linkMatch = linkCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
              if (!linkMatch) return null;
              const linkText = linkMatch[1];
              const linkUrl = linkMatch[2];
              const description = row.find(cell => !cell.includes('/manus-storage/') && cell.length > 3 && !cell.includes('Mo') && !cell.includes('MB') && !cell.includes('Ko') && !cell.includes('KB')) || '';
              const size = row.find(cell => /\d+.*(?:Mo|MB|Ko|KB)/i.test(cell)) || '';
              return (
                <a key={ri} href={linkUrl} download className="flex items-center gap-4 p-4 rounded-xl border border-[#e8e5e0] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#f5f3ef] dark:hover:bg-slate-800 transition-colors group cursor-pointer no-underline">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{linkText}</div>
                    {description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{description}</div>}
                  </div>
                  {size && <div className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-md bg-[#f5f3ef] dark:bg-slate-800">{size}</div>}
                </a>
              );
            })}
          </div>
        );
      } else {
        elements.push(
          <div key={`mdtable-${i}`} className="my-5 overflow-x-auto rounded-xl border border-[#e8e5e0] dark:border-slate-700">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f5f3ef] dark:bg-slate-800">
                  {mdTable.headers.map((h, hi) => (
                    <th key={hi} className="text-left px-4 py-3 font-semibold text-foreground text-[13px] uppercase tracking-wide border-b border-[#e8e5e0] dark:border-slate-700">{renderInlineFormatting(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mdTable.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#faf9f7] dark:bg-slate-800/40'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-foreground/80 text-[13.5px] border-b border-[#e8e5e0]/60 dark:border-slate-700/60">{renderInlineFormatting(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      i = mdTable.endIdx - 1;
      continue;
    }
    if (mdTableLineSet.has(i)) continue;

    // Check if this line starts a numbered stepper sequence (bare "1" followed by label)
    const trimmedForStepper = lines[i].trim();
    if (/^\d+$/.test(trimmedForStepper) && parseInt(trimmedForStepper) === 1) {
      const stepper = detectStepperSequence(lines, i);
      if (stepper) {
        elements.push(
          <div key={`stepper-${i}`} className="my-6 flex items-center justify-center gap-0 overflow-x-auto py-2">
            {stepper.steps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    idx === 0 ? 'bg-[#c75b3a]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-muted-foreground mt-1.5 text-center max-w-[100px]">{step}</span>
                </div>
                {idx < stepper.steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1 mt-[-16px]" />
                )}
              </div>
            ))}
          </div>
        );
        i = stepper.endIdx - 1;
        continue;
      }
    }

    // Check if this line starts a "Step N:" sequence
    if (/^(?:Step|STEP)\s+\d+[:.·]/i.test(lines[i].trim())) {
      const stepItems = detectStepItems(lines, i);
      if (stepItems) {
        elements.push(
          <div key={`steps-${i}`} className="my-4 space-y-2">
            {stepItems.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#e8f4f8] dark:bg-blue-900/20 border border-[#b8dce5] dark:border-blue-800">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2a7d8a] text-white text-xs font-bold shrink-0">
                  {item.num}
                </span>
                <span className="text-sm text-gray-800 dark:text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        );
        i = stepItems.endIdx - 1;
        continue;
      }
    }

    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : undefined;
    const prevLine = i > 0 ? lines[i - 1] : undefined;

    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${codeKey++}`} className="bg-[#1e1e2e] text-emerald-300 p-5 rounded-xl text-[13px] font-mono overflow-x-auto my-5 leading-relaxed border border-slate-800">
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      elements.push(<hr key={i} className="my-4 border-border/50" />);
      continue;
    }
    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-blue-400/60 pl-4 py-1 my-2 text-sm italic text-muted-foreground bg-blue-50/30 dark:bg-blue-950/20 rounded-r">
          {renderInlineFormatting(line.replace(/^>\s*/, ""))}
        </blockquote>
      );
      continue;
    }
    // Key Takeaways / À retenir section heading
    if (line.match(/^(key takeaway|à retenir|points? clé|takeaway)/i) || line.match(/^#{1,3}\s*(key takeaway|à retenir|points? clé|takeaway)/i)) {
      const cleanTitle = line.replace(/^#{1,3}\s*/, "");
      elements.push(
        <div key={i} className="flex items-center gap-2 mt-6 mb-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
          <span className="text-amber-600 text-lg">💡</span>
          <h4 className="text-base font-bold text-amber-800 dark:text-amber-300">{cleanTitle}</h4>
        </div>
      );
      continue;
    }
    // Markdown headings
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="text-base font-semibold mt-6 mb-2.5 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>{line.replace("### ", "")}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold mt-8 mb-3 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>{line.replace("## ", "")}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-8 mb-3 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>{line.replace("# ", "")}</h2>);
    } else if (line.match(/^\*\*.*\*\*$/)) {
      // Bold-only line as sub-section title
      elements.push(
        <h4 key={i} className="text-base font-bold mt-6 mb-2.5 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
          {line.replace(/\*\*/g, "")}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <li key={i} className="text-[14.5px] ml-6 mb-2 leading-relaxed list-disc text-foreground/80">
          {renderInlineFormatting(line.replace(/^[-•]\s*/, ""))}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className="text-[14.5px] ml-6 mb-2 leading-relaxed list-decimal text-foreground/80">
          {renderInlineFormatting(line.replace(/^\d+\.\s*/, ""))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else if (isSubSectionTitle(line, i)) {
      // Sub-section title with pattern "Title: description"
      const colonIdx = line.trim().indexOf(':');
      const titlePart = line.trim().slice(0, colonIdx).trim();
      const descPart = line.trim().slice(colonIdx + 1).trim();
      elements.push(
        <h3 key={i} className="text-xl font-bold mt-10 mb-3 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
          <span>{titlePart}</span>
          <span className="text-foreground/70 font-normal text-lg">: {descPart}</span>
        </h3>
      );
    } else if (isMetaLine(line)) {
      // Metadata line (e.g. "Estimated time: 10 minutes", "Instructions:")
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      elements.push(
        <div key={i} className="flex items-baseline gap-2 mt-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label.trim()}:</span>
          {value && <span className="text-sm text-foreground">{value}</span>}
        </div>
      );
    } else if (isTechTerm(line)) {
      // Technical term - render as heading if preceded by empty line (section title)
      // or as bold inline text if within a paragraph
      const prevTrimmed = prevLine?.trim() || '';
      if (prevTrimmed === '' || i === 0) {
        elements.push(
          <h4 key={i} className="text-lg font-bold mt-8 mb-3 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {line.trim()}
          </h4>
        );
      } else {
        elements.push(
          <p key={i} className="text-[14.5px] font-semibold text-foreground mb-1.5">
            {line.trim()}
          </p>
        );
      }
    } else if (isFirstTextLine) {
      // First text line - TOC is now handled by pre-pass
      isFirstTextLine = false;
      
      // Check if it's an implicit list item
      if (isImplicitListItem(line, lines.slice(Math.max(0, i - 8), i), lines.slice(i + 1, i + 6))) {
        elements.push(
          <li key={i} className="text-[14.5px] ml-6 mb-2 leading-relaxed list-disc text-foreground/80">
            {renderInlineFormatting(line)}
          </li>
        );
      } else {
        elements.push(
          <p key={i} className="text-[14.5px] leading-[1.75] mb-3 text-foreground/80">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    } else if (isSectionHeading(line, nextLine) && (prevLine?.trim() === "" || i === 1)) {
      // Check if it's a known major section heading (render as h3) vs heuristic (h4)
      const isKnownHeading = knownSectionHeadings.has(line.trim().toLowerCase());
      // Determine contextual icon based on heading content
      const headingLower = line.trim().toLowerCase();
      let headingIcon = '';
      if (/exercice|exercise|activity|activité|mise en pratique|putting.*practice/i.test(headingLower)) {
        headingIcon = '✏️';
      } else if (/réflexion|reflection|discussion|think|réfléchir/i.test(headingLower)) {
        headingIcon = '💡';
      } else if (/résumé|summary|conclusion|points? clé|à retenir|key takeaway/i.test(headingLower)) {
        headingIcon = '🎯';
      } else if (/prochaines? étapes?|next steps?|et ensuite|what.*next/i.test(headingLower)) {
        headingIcon = '➡️';
      } else if (/objectif|learning objective|what you will learn/i.test(headingLower)) {
        headingIcon = '🏠';
      } else if (/ressources?|resources?|références?|references?/i.test(headingLower)) {
        headingIcon = '📚';
      } else if (/prérequis|prerequisites?|getting started/i.test(headingLower)) {
        headingIcon = '⚙️';
      }
      if (isKnownHeading) {
        elements.push(
          <h3 key={i} className="text-xl font-bold mt-10 mb-3 text-foreground border-b border-border/40 pb-2.5" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {headingIcon && <span className="mr-2">{headingIcon}</span>}
            {renderInlineFormatting(line)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={i} className="text-lg font-bold mt-8 mb-3 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {headingIcon && <span className="mr-2">{headingIcon}</span>}
            {renderInlineFormatting(line)}
          </h4>
        );
      }
    } else if (isImplicitListItem(line, lines.slice(Math.max(0, i - 8), i), lines.slice(i + 1, i + 6))) {
      // Implicit list item (short line following a colon-ending intro)
      elements.push(
        <li key={i} className="text-[14.5px] ml-6 mb-2 leading-relaxed list-disc text-foreground/80">
          {renderInlineFormatting(line)}
        </li>
      );
    } else {
      // Regular paragraph
      elements.push(
        <p key={i} className="text-[14.5px] leading-[1.75] mb-3 text-foreground/80">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  }

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={`code-${codeKey}`} className="bg-[#1e1e2e] text-emerald-300 p-5 rounded-xl text-[13px] font-mono overflow-x-auto my-5 leading-relaxed border border-slate-800">
        {codeLines.join("\n")}
      </pre>
    );
  }

  return <div className="prose-content">{elements}</div>;
}

export function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match: markdown links, raw URLs, bare domain links, parenthetical time/duration, code, bold, italic
  const regex = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+|\b(?:claude\.ai|anthropic\.com|openai\.com|github\.com|google\.com|docs\.anthropic\.com|console\.anthropic\.com)(?:\/[^\s)]*)?|\(\d+(?:-\d+)?\s*(?:minutes?|mins?|hours?|hrs?)\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith("[")) {
      // Markdown link: [text](url)
      const linkMatch = m.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a key={match.index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            {linkMatch[1]}
          </a>
        );
      }
    } else if (m.startsWith("http")) {
      // Raw URL
      parts.push(
        <a key={match.index} href={m} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline underline-offset-2 break-all">
          {m}
        </a>
      );
    } else if (m.startsWith("(") && /^\(\d+/.test(m)) {
      // Parenthetical duration: (4 minutes), (5-10 mins)
      parts.push(<em key={match.index} className="italic text-muted-foreground/80 text-xs">{m}</em>);
    } else if (/^[a-z]/i.test(m) && m.includes('.')) {
      // Bare domain link (claude.ai, anthropic.com, etc.)
      const href = m.startsWith('http') ? m : `https://${m}`;
      parts.push(
        <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
          {m}
        </a>
      );
    } else if (m.startsWith("`")) {
      parts.push(<code key={match.index} className="px-1.5 py-0.5 rounded text-xs font-mono bg-secondary text-primary">{m.slice(1, -1)}</code>);
    } else if (m.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-foreground">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("*")) {
      parts.push(<em key={match.index} className="italic text-muted-foreground">{m.slice(1, -1)}</em>);
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? <>{parts}</> : text;
}

// Quiz component for lesson validation with visual feedback and retry
