import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import trainingIndex from "@/data/trainingIndex.json";
import {
  ArrowLeft, CheckCircle2, PlayCircle, ChevronRight, ChevronLeft,
  BookOpen, Lock, LogIn, LogOut, ArrowRight, Moon, Sun, Menu, X, Clock, Check, Filter, Video, Eye,
  Dumbbell, FileText, ChevronDown, Brain, Target, Trophy, GraduationCap, Puzzle, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ExerciseRenderer } from "@/components/ExerciseRenderer";
import { FlipCardsGrid } from "@/components/FlipCard";
import { TabbedContent } from "@/components/TabbedContent";
import { ComparisonBox } from "@/components/ComparisonBox";
import { MatchingExercise } from "@/components/MatchingExercise";
import { SingleChoiceExercise } from "@/components/SingleChoiceExercise";
import { ChapterQuiz } from "@/components/ChapterQuiz";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

/* ─── Animation Variants ─── */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Helper to resolve {en, fr} objects or plain strings
function resolveI18n(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.en || val.fr)) {
    return lang === "fr" ? (val.fr || val.en || "") : (val.en || val.fr || "");
  }
  return String(val);
}

// Detect repeated label-card patterns: Label\n\nTitle\n\nDescription (like Skilljar "Layer cards")
function detectLabelCards(lines: string[]): { cards: { label: string; title: string; description: string }[]; startIdx: number; endIdx: number }[] {
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
function LayerCardsGrid({ cards }: { cards: { label: string; title: string; description: string }[] }) {
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
function detectCalloutBoxes(lines: string[]): { label: string; text: string; startIdx: number; endIdx: number }[] {
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
    const startContent = j;
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
function detectStepperSequence(lines: string[], startIdx: number): { steps: string[]; endIdx: number } | null {
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
interface InlineTabBlock {
  instructionIdx: number;
  labels: string[];
  tabContents: { label: string; sections: { heading: string; text: string }[] }[];
  startIdx: number;
  endIdx: number;
}

function detectInlineTabs(lines: string[]): InlineTabBlock[] {
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
    const labelsStart = j;
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
interface StyledInfoBlock {
  header: string;
  sections: { heading: string; text: string }[];
  startIdx: number;
  endIdx: number;
}

function detectStyledInfoBlocks(lines: string[]): StyledInfoBlock[] {
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
function StyledInfoBlockRenderer({ block }: { block: StyledInfoBlock }) {
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
function InlineTabsRenderer({ block }: { block: InlineTabBlock }) {
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
interface NumberedListBlock {
  startIdx: number;
  endIdx: number;
  introLine: number | null; // line index of the intro sentence (e.g. "À l'issue de ce module, vous serez capable de :")
  items: { num: number; text: string }[];
}

function detectNumberedLists(lines: string[]): NumberedListBlock[] {
  const results: NumberedListBlock[] = [];
  const visited = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (visited.has(i)) continue;
    const match = lines[i].trim().match(/^(\d+)[\.)]\.?\s+(.+)/);
    if (!match || parseInt(match[1]) !== 1) continue;

    // Found a "1. ..." line - collect consecutive numbered items
    const items: { num: number; text: string }[] = [];
    let expectedNum = 1;
    let j = i;
    let endIdx = i;

    while (j < lines.length) {
      const trimmed = lines[j].trim();
      const numMatch = trimmed.match(/^(\d+)[\.)]\.?\s+(.+)/);
      if (numMatch && parseInt(numMatch[1]) === expectedNum) {
        // Collect multi-line item (continuation lines until next numbered item or empty+numbered)
        let itemText = numMatch[2];
        let k = j + 1;
        // Check for continuation lines (non-empty, non-numbered)
        while (k < lines.length && lines[k].trim() !== '' && !lines[k].trim().match(/^\d+[\.)]\.?\s/)) {
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
interface AccordionSection {
  title: string;
  contentLines: string[];
}
interface AccordionBlock {
  startIdx: number;
  endIdx: number;
  sections: AccordionSection[];
}

function detectAccordionBlocks(lines: string[], excludedLines: Set<number>): AccordionBlock[] {
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
      !trimmed.match(/^\d+[\.)]\.?\s/) &&
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
              !peekTrimmed.match(/^\d+[\.)]\.?\s/) &&
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
function detectStepItems(lines: string[], startIdx: number): { items: { num: number; text: string }[]; endIdx: number } | null {
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
function detectConcatenatedTables(lines: string[]): { headers: string[]; rows: string[][]; startIdx: number; endIdx: number }[] {
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
function detectMarkdownTables(lines: string[]): { headers: string[]; rows: string[][]; startIdx: number; endIdx: number }[] {
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
function PageContent({ content, lang }: { content: string; lang: string }) {
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
  let firstNonEmptyIdx = lines.findIndex(l => l.trim() !== '');
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
  const isShortLine = (line: string) => line.trim().length > 0 && line.trim().length <= 60;
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
      elements.push(
        <div key={`mdtable-${i}`} className="my-5 overflow-x-auto rounded-xl border border-[#e8e5e0] dark:border-slate-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f5f3ef] dark:bg-slate-800">
                {mdTable.headers.map((h, hi) => (
                  <th key={hi} className="text-left px-4 py-3 font-semibold text-foreground text-[13px] uppercase tracking-wide border-b border-[#e8e5e0] dark:border-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mdTable.rows.map((row, ri) => (
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
      if (isKnownHeading) {
        elements.push(
          <h3 key={i} className="text-xl font-bold mt-10 mb-3 text-foreground border-b border-border/40 pb-2.5" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {renderInlineFormatting(line)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={i} className="text-lg font-bold mt-8 mb-3 text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
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

function renderInlineFormatting(text: string): React.ReactNode {
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
function LessonQuiz({
  certId,
  courseId,
  lessonIndex,
  lang,
  t,
  onPass,
}: {
  certId: string;
  courseId: string;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onPass: () => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; questionIdx: number; selectedId: string | null }>>([]);
  const [shakeError, setShakeError] = useState(false);
  const [showErrorReview, setShowErrorReview] = useState(false);

  useEffect(() => {
    // Try lesson-specific quizzes first, fall back to cert-level questions
    fetch("/data/lessonQuizzes.json")
      .then((r) => r.json())
      .then((allQuizzes: any) => {
        const courseQuizzes = allQuizzes[courseId];
        // Gather all questions for this lesson (keys may be compound "lessonIdx_chapterIdx" or simple "chapterIdx")
        let lessonQs: any[] = [];
        if (courseQuizzes) {
          const prefix = `${lessonIndex}_`;
          for (const [key, qs] of Object.entries(courseQuizzes)) {
            if (key.startsWith(prefix) || (key === String(lessonIndex) && !key.includes('_'))) {
              lessonQs = lessonQs.concat(qs as any[]);
            }
          }
          // For single-lesson courses, all keys are just chapterIndex (no underscore)
          if (lessonQs.length === 0) {
            for (const [key, qs] of Object.entries(courseQuizzes)) {
              if (!key.includes('_')) {
                lessonQs = lessonQs.concat(qs as any[]);
              }
            }
          }
        }
        if (lessonQs.length > 0) {
          // Shuffle and pick 5 questions from the pool
          const shuffled = [...lessonQs].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 5);
          const lessonQsSelected = selected;
          // Map to expected format - handle both plain string and bilingual {en, fr} objects
          const mapped = lessonQsSelected.map((q: any, idx: number) => ({
            id: `lq_${courseId}_${lessonIndex}_${idx}`,
            question: typeof q.question === 'object' ? q.question : { en: q.question, fr: q.question },
            choices: q.choices.map((c: any) => ({ id: c.id, text: typeof c.text === 'object' ? c.text : { en: c.text, fr: c.text } })),
            correctChoiceIds: [q.correctId],
            explanation: typeof q.explanation === 'object' ? q.explanation : { en: q.explanation, fr: q.explanation },
          }));
          setQuestions(mapped);
        } else {
          // Fallback to cert-level questions
          fetch("/data/mockExamQuestions.json")
            .then((r2) => r2.json())
            .then((allQ: any[]) => {
              const certQuestions = allQ.filter((q: any) => q.certificationId === certId);
              const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
              setQuestions(shuffled.slice(0, 3));
            })
            .catch(() => setQuestions([]));
        }
      })
      .catch(() => {
        // Fallback to cert-level questions
        fetch("/data/mockExamQuestions.json")
          .then((r) => r.json())
          .then((allQ: any[]) => {
            const certQuestions = allQ.filter((q: any) => q.certificationId === certId);
            const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
            setQuestions(shuffled.slice(0, 3));
          })
          .catch(() => setQuestions([]));
      });
  }, [certId, courseId, lessonIndex]);

  if (questions.length === 0) return null;

  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl p-6 border bg-card border-border"
      >
        <div className="text-center">
          {quizPassed ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {t({ en: "Quiz Passed!", fr: "Quiz r\u00e9ussi !" })}
              </h3>
              <p className="text-sm mb-2 text-muted-foreground">
                {t({ en: `You got ${correctCount}/3 correct. You can now complete this lesson.`, fr: `Vous avez obtenu ${correctCount}/3 correct. Vous pouvez maintenant terminer cette le\u00e7on.` })}
              </p>
              {attemptCount > 1 && (
                <p className="text-xs mb-4 text-muted-foreground">
                  {t({ en: `Passed on attempt #${attemptCount}`, fr: `R\u00e9ussi \u00e0 la tentative n\u00b0${attemptCount}` })}
                </p>
              )}
              {/* Visual score dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {answers.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      a.correct ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  >
                    {a.correct ? "\u2713" : "\u2717"}
                  </motion.div>
                ))}
              </div>
              <Button onClick={onPass} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t({ en: "Complete Lesson", fr: "Terminer la le\u00e7on" })}
              </Button>
            </>
          ) : !showErrorReview ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <X className="w-14 h-14 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {t({ en: "Not quite!", fr: "Pas tout \u00e0 fait !" })}
              </h3>
              <p className="text-sm mb-2 text-muted-foreground">
                {t({ en: `You got ${correctCount}/3. You need at least 2/3 to pass.`, fr: `Vous avez obtenu ${correctCount}/3. Il faut au moins 2/3 pour r\u00e9ussir.` })}
              </p>
              <p className="text-xs mb-4 text-muted-foreground/70">
                {t({ en: `Attempt #${attemptCount}`, fr: `Tentative n\u00b0${attemptCount}` })}
              </p>
              {/* Visual score dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {answers.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      a.correct ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  >
                    {a.correct ? "\u2713" : "\u2717"}
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-2"
              >
                <Button
                  onClick={() => setShowErrorReview(true)}
                  variant="outline"
                  className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Eye className="w-4 h-4" />
                  {t({ en: "Review my errors", fr: "Revoir mes erreurs" })}
                </Button>
                <Button
                  onClick={() => {
                    setAttemptCount((c) => c + 1);
                    setCurrentQ(0);
                    setSelected(null);
                    setShowResult(false);
                    setCorrectCount(0);
                    setQuizComplete(false);
                    setQuizPassed(false);
                    setAnswers([]);
                    setShowErrorReview(false);
                    fetch("/data/lessonQuizzes.json")
                      .then((r) => r.json())
                      .then((allQuizzes: any) => {
                        const cq = allQuizzes[courseId];
                        if (cq) {
                          let retryQs: any[] = [];
                          const prefix = `${lessonIndex}_`;
                          for (const [key, qs] of Object.entries(cq)) {
                            if (key.startsWith(prefix) || (key === String(lessonIndex) && !key.includes('_'))) {
                              retryQs = retryQs.concat(qs as any[]);
                            }
                          }
                          if (retryQs.length === 0) {
                            for (const [key, qs] of Object.entries(cq)) {
                              if (!key.includes('_')) {
                                retryQs = retryQs.concat(qs as any[]);
                              }
                            }
                          }
                          if (retryQs.length > 0) {
                            const shuffled = [...retryQs].sort(() => Math.random() - 0.5);
                            const selected = shuffled.slice(0, 5);
                            const mapped = selected.map((q: any, idx: number) => ({
                              id: `lq_${courseId}_${lessonIndex}_${idx}_${Date.now()}`,
                              question: typeof q.question === 'object' ? q.question : { en: q.question, fr: q.question },
                              choices: q.choices.map((c: any) => ({ id: c.id, text: typeof c.text === 'object' ? c.text : { en: c.text, fr: c.text } })),
                              correctChoiceIds: [q.correctId],
                              explanation: typeof q.explanation === 'object' ? q.explanation : { en: q.explanation, fr: q.explanation },
                            }));
                            setQuestions(mapped);
                          }
                        }
                      })
                      .catch(() => {});
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full py-3 text-base font-semibold"
                >
                  <ArrowRight className="w-4 h-4" />
                  {t({ en: `Retry directly (Attempt #${attemptCount + 1})`, fr: `R\u00e9essayer directement (Tentative n\u00b0${attemptCount + 1})` })}
                </Button>
              </motion.div>
            </>
          ) : (
            /* Detailed error review screen */
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setShowErrorReview(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                  {t({ en: "Error Review", fr: "Révision des erreurs" })}
                </h3>
                <span className="text-xs ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                  {answers.filter(a => !a.correct).length} {t({ en: "error(s)", fr: "erreur(s)" })}
                </span>
              </div>

              {/* Domain progress indicator */}
              {(() => {
                const domainStats: Record<string, { total: number; correct: number }> = {};
                questions.forEach((question, idx) => {
                  const answer = answers[idx];
                  if (!answer) return;
                  const domainName = resolveI18n(question.domain, lang);
                  if (!domainStats[domainName]) domainStats[domainName] = { total: 0, correct: 0 };
                  domainStats[domainName].total++;
                  if (answer.correct) domainStats[domainName].correct++;
                });
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3 rounded-xl bg-secondary/50 border border-border"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">
                      {t({ en: "Performance by domain", fr: "Performance par domaine" })}
                    </p>
                    <div className="space-y-2">
                      {Object.entries(domainStats).map(([domain, stats]) => {
                        const pct = Math.round((stats.correct / stats.total) * 100);
                        const isWeak = pct < 50;
                        return (
                          <div key={domain}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-xs font-medium ${isWeak ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {domain}
                              </span>
                              <span className={`text-[10px] font-bold ${isWeak ? "text-red-500" : "text-emerald-500"}`}>
                                {stats.correct}/{stats.total}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={`h-full rounded-full ${isWeak ? "bg-red-400" : "bg-emerald-400"}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {Object.entries(domainStats).some(([, s]) => s.correct / s.total < 0.5) && (
                      <p className="text-[10px] mt-2.5 text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        {t({ en: "Focus on red domains to improve your score", fr: "Concentrez-vous sur les domaines en rouge pour am\u00e9liorer votre score" })}
                      </p>
                    )}
                  </motion.div>
                );
              })()}

              <div className="space-y-4 mb-5">
                {questions.map((question, idx) => {
                  const answer = answers[idx];
                  if (!answer) return null;
                  const isQCorrect = answer.correct;
                  // Find matching course for this domain to build review link
                  const domainEn = typeof question.domain === "object" ? question.domain.en : question.domain;
                  const matchingCourse = (trainingIndex as any).courses.find((c: any) => {
                    if (!c.id.startsWith(certId)) return false;
                    const titleEn = typeof c.title === "object" ? c.title.en : c.title;
                    // Match by keyword overlap between domain and course title
                    const domainWords = domainEn.toLowerCase().split(/[\s,&]+/).filter((w: string) => w.length > 3);
                    const titleLower = titleEn.toLowerCase();
                    return domainWords.some((w: string) => titleLower.includes(w));
                  });
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`rounded-xl border p-4 ${
                        isQCorrect
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                          : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs font-bold text-white ${
                          isQCorrect ? "bg-emerald-500" : "bg-red-400"
                        }`}>
                          {isQCorrect ? "\u2713" : "\u2717"}
                        </span>
                        <div className="flex-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {resolveI18n(question.domain, lang)}
                          </span>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {resolveI18n(question.question, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="ml-8 space-y-1.5">
                        {question.choices.map((choice: any) => {
                          const wasSelected = answer.selectedId === choice.id;
                          const isCorrectChoice = question.correctChoiceIds.includes(choice.id);
                          let style = "bg-secondary/50 text-muted-foreground";
                          if (isCorrectChoice) style = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700";
                          else if (wasSelected && !isCorrectChoice) style = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 line-through";
                          return (
                            <div key={choice.id} className={`text-xs p-2 rounded-lg ${style}`}>
                              <span className="font-bold mr-1.5">{choice.id.toUpperCase()}.</span>
                              {resolveI18n(choice.text, lang)}
                              {isCorrectChoice && <span className="ml-2 font-medium">\u2713</span>}
                              {wasSelected && !isCorrectChoice && <span className="ml-2 font-medium">\u2717</span>}
                            </div>
                          );
                        })}
                      </div>

                      {!isQCorrect && question.explanation && (
                        <div className="ml-8 mt-2.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                          <span className="font-semibold">{t({ en: "Explanation:", fr: "Explication :" })}</span>{" "}
                          {resolveI18n(question.explanation, lang)}
                        </div>
                      )}

                      {!isQCorrect && matchingCourse && (
                        <div className="ml-8 mt-2">
                          <Link
                            href={`/training/${certId}/${matchingCourse.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {t({ en: "Review this section", fr: "Revoir cette section" })}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <Button
                onClick={() => {
                  setAttemptCount((c) => c + 1);
                  setCurrentQ(0);
                  setSelected(null);
                  setShowResult(false);
                  setCorrectCount(0);
                  setQuizComplete(false);
                  setQuizPassed(false);
                  setAnswers([]);
                  setShowErrorReview(false);
                  fetch("/data/lessonQuizzes.json")
                    .then((r) => r.json())
                    .then((allQuizzes: any) => {
                      const cq = allQuizzes[courseId];
                      if (cq && cq[String(lessonIndex)]) {
                        const lessonQs = cq[String(lessonIndex)];
                        const mapped = lessonQs.map((q: any, idx: number) => ({
                          id: `lq_${courseId}_${lessonIndex}_${idx}_${Date.now()}`,
                          question: typeof q.question === 'object' ? q.question : { en: q.question, fr: q.question },
                          choices: q.choices.map((c: any) => ({ id: c.id, text: typeof c.text === 'object' ? c.text : { en: c.text, fr: c.text } })),
                          correctChoiceIds: [q.correctId],
                          explanation: typeof q.explanation === 'object' ? q.explanation : { en: q.explanation, fr: q.explanation },
                        }));
                        setQuestions(mapped);
                      }
                    })
                    .catch(() => {});
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full py-3 text-base font-semibold"
              >
                <ArrowRight className="w-4 h-4" />
                {t({ en: `I understand, retry (Attempt #${attemptCount + 1})`, fr: `J'ai compris, r\u00e9essayer (Tentative n\u00b0${attemptCount + 1})` })}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  const isCorrect = selected && q.correctChoiceIds.includes(selected);

  // Option letters for Skilljar style
  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <motion.div
      key={`q-${currentQ}-${attemptCount}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-lg p-5 mt-6 bg-[#f8f8f6] dark:bg-card ${shakeError ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
    >
      {/* Question label - Skilljar style "Q1" grey */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400 uppercase">
            Q{currentQ + 1}
          </span>
          {attemptCount > 1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
              #{attemptCount}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {currentQ + 1}/3
        </span>
      </div>

      {/* Question text - serif */}
      <p className="text-base font-medium mb-5 text-gray-900 dark:text-foreground" style={{ fontFamily: 'Lora, Georgia, serif' }}>
        {resolveI18n(q.question, lang)}
      </p>

      {/* Choices - Skilljar style: A/B/C letter in coral */}
      <div className="space-y-3 mb-5">
        {q.choices.map((choice: any, idx: number) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = q.correctChoiceIds.includes(choice.id);
          const letter = OPTION_LETTERS[idx] || choice.id.toUpperCase();

          let containerClass = "bg-white dark:bg-card border-gray-200 dark:border-border hover:border-[#c75b3a]/50";
          let letterColor = "text-[#c75b3a]";

          if (showResult) {
            if (isCorrectChoice) {
              containerClass = "bg-green-50 dark:bg-emerald-900/20 border-green-400 dark:border-emerald-600";
              letterColor = "text-green-600";
            } else if (isSelected && !isCorrectChoice) {
              containerClass = "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600";
              letterColor = "text-red-500";
            } else {
              containerClass = "bg-white dark:bg-card border-gray-200 dark:border-border opacity-60";
            }
          } else if (isSelected) {
            containerClass = "bg-[#fef3f0] dark:bg-[#c75b3a]/10 border-[#c75b3a]";
          }

          return (
            <button
              key={choice.id}
              onClick={() => !showResult && setSelected(choice.id)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${containerClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className={`text-sm font-bold ${letterColor}`}>{letter}</span>
              <span className="text-sm text-gray-800 dark:text-foreground flex-1">{resolveI18n(choice.text, lang)}</span>
              {showResult && isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              {showResult && isSelected && !isCorrectChoice && <X className="w-4 h-4 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation after answer */}
      {showResult && q.explanation && (
        <div className="text-sm p-3 rounded-lg mb-4 bg-white dark:bg-secondary border border-gray-200 dark:border-border text-gray-700 dark:text-muted-foreground italic">
          {resolveI18n(q.explanation, lang)}
        </div>
      )}

      {/* Action button - coral */}
      {!showResult ? (
        <Button
          onClick={() => {
            setShowResult(true);
            const correct = !!(selected && q.correctChoiceIds.includes(selected));
            if (!correct) {
              setShakeError(true);
              setTimeout(() => setShakeError(false), 400);
            }
          }}
          disabled={!selected}
          className="bg-[#c75b3a] hover:bg-[#a84a2e] text-white w-full"
          size="sm"
        >
          {t({ en: "Check Answer", fr: "Vérifier" })}
        </Button>
      ) : (
        <Button
          onClick={() => {
            const correct = !!(selected && q.correctChoiceIds.includes(selected));
            const newCorrect = correctCount + (correct ? 1 : 0);
            setCorrectCount(newCorrect);
            setAnswers((prev) => [...prev, { correct, questionIdx: currentQ, selectedId: selected }]);
            if (currentQ >= 2) {
              setQuizComplete(true);
              setQuizPassed(newCorrect >= 2);
            } else {
              setCurrentQ((p) => p + 1);
              setSelected(null);
              setShowResult(false);
            }
          }}
          className="bg-[#c75b3a] hover:bg-[#a84a2e] text-white w-full"
          size="sm"
        >
          {currentQ >= 2
            ? t({ en: "See Results", fr: "Voir les résultats" })
            : t({ en: "Next Question", fr: "Question suivante" })} →
        </Button>
      )}
    </motion.div>
  );
}

// Chapter-based lesson viewer for V2 structure (chapters with blocks)
function LessonViewer({
  lesson,
  lessonIndex,
  lang,
  t,
  certId,
  courseId,
  onComplete,
  matchedVideos,
  completedVideos,
  expandedVideos,
  playingVideos,
  toggleVideo,
  startPlayingVideo,
  toggleVideoComplete,
  getYouTubeThumbnail,
  isReviewMode = false,
  courseExercises = [],
  onChapterChange,
  initialChapter,
}: {
  lesson: any;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  certId: string;
  courseId: string;
  onComplete: () => void;
  matchedVideos: any[];
  completedVideos: Set<string>;
  expandedVideos: Set<string>;
  playingVideos: Set<string>;
  toggleVideo: (id: string) => void;
  startPlayingVideo: (id: string) => void;
  toggleVideoComplete: (id: string) => void;
  getYouTubeThumbnail: (id: string) => string;
  isReviewMode?: boolean;
  courseExercises?: any[];
  onChapterChange?: (current: number, total: number) => void;
  initialChapter?: number;
}) {
  const [currentChapter, setCurrentChapter] = useState(initialChapter ?? 0);
  // validatedChapter tracks the highest chapter index that was VALIDATED (quiz passed or exercises completed)
  // This is what gets persisted as progress - NOT the navigation position
  const [validatedChapter, setValidatedChapter] = useState(initialChapter ?? 0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChapterQuiz, setShowChapterQuiz] = useState(false);
  const [chapterQuizPassed, setChapterQuizPassed] = useState<Set<number>>(new Set());
  // Track completed exercises in quiz/checkpoint chapters (exerciseId -> true)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  // Track whether we're syncing from parent to avoid calling onChapterChange back
  const isSyncingFromParent = useRef(false);
  const prevLessonId = useRef(lesson.id);
  // Track navigation direction for slide-in animation
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const chapters = lesson.chapters || [];
  const totalChapters = chapters.length;

  // Sync with initialChapter prop (for single-lesson courses navigating via sidebar)
  useEffect(() => {
    if (initialChapter !== undefined && initialChapter !== currentChapter) {
      isSyncingFromParent.current = true;
      setSlideDirection(initialChapter > currentChapter ? 'right' : 'left');
      setCurrentChapter(initialChapter);
    }
  }, [initialChapter]);

  // When lesson changes, reset chapter position
  useEffect(() => {
    if (lesson.id !== prevLessonId.current) {
      prevLessonId.current = lesson.id;
      const startChapter = initialChapter !== undefined ? initialChapter : 0;
      setCurrentChapter(startChapter);
      setValidatedChapter(startChapter);
      setShowQuiz(false);
      setShowTranscript(false);
      setShowChapterQuiz(false);
      setChapterQuizPassed(new Set());
      setCompletedExercises(new Set());
    }
  }, [lesson.id]);

  // When chapter changes from internal navigation (Next button, etc.) - only scroll
  useEffect(() => {
    if (isSyncingFromParent.current) {
      isSyncingFromParent.current = false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter, totalChapters]);

  // Only persist progress when validatedChapter advances (quiz passed or exercises completed)
  useEffect(() => {
    if (validatedChapter > 0) {
      onChapterChange?.(validatedChapter, totalChapters);
    }
  }, [validatedChapter, totalChapters]);

  const isLastChapter = currentChapter >= totalChapters - 1;
  const chapter = chapters[currentChapter];

  if (!chapter && !showQuiz) {
    return (
      <div className="mt-2 p-6 text-center">
        <p className="text-sm italic text-muted-foreground">
          {t({ en: "No content available", fr: "Aucun contenu disponible" })}
        </p>
      </div>
    );
  }

  // Render a single block
  const renderBlock = (block: any, blockIdx: number) => {
    switch (block.type) {
      case "content": {
        const body = block.body || {};
        let text = typeof body === "string" ? body : (body[lang] || body.en || "");
        if (!text) return null;
        // Skip content blocks that are text duplicates of the following bucket_sort exercise
        const allBlocks = chapter?.blocks || [];
        if (blockIdx + 1 < allBlocks.length && allBlocks[blockIdx + 1]?.type === 'bucket_sort') {
          const nextBucket = allBlocks[blockIdx + 1];
          const bucketLabels = (nextBucket.buckets || []).map((b: any) => {
            const lbl = b.label || {};
            return typeof lbl === 'string' ? lbl : (lbl[lang] || lbl.en || '');
          });
          const textLines = text.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
          const lastLines = textLines.slice(-Math.max(bucketLabels.length + 2, 6));
          const matchCount = bucketLabels.filter((label: string) => lastLines.includes(label)).length;
          if (matchCount >= 2) {
            // This content block is a scraping artifact - skip it
            return null;
          }
        }
        // Skip the first line of the first content block since it's used as the screen title
        if (blockIdx === 0) {
          const lines = text.split('\n');
          const firstNonEmpty = lines.findIndex((l: string) => l.trim().length > 0);
          if (firstNonEmpty >= 0) {
            // Remove the first non-empty line (used as screen title)
            lines.splice(firstNonEmpty, 1);
            // Also check if the next non-empty line was used as screen description
            const secondNonEmpty = lines.findIndex((l: string) => l.trim().length > 0);
            if (secondNonEmpty >= 0) {
              const secondLine = lines[secondNonEmpty].trim().replace(/^#{1,6}\s+/, '');
              if (secondLine.length < 120 && secondLine.length > 20) {
                // This was likely used as screen description - skip it too
                lines.splice(secondNonEmpty, 1);
              }
            }
            text = lines.join('\n');
          }
        }
        if (!text.trim()) return null;
        return (
          <div key={blockIdx} className="py-2">
            <PageContent content={text} lang={lang} />
          </div>
        );
      }
      case "video": {
        const videoId = block.videoId || "";
        const videoKey = videoId;
        const isVideoComplete = completedVideos.has(videoKey);
        const isPlaying = playingVideos.has(videoKey);
        return (
          <div
            key={blockIdx}
            className={`border rounded-xl overflow-hidden transition-colors ${
              isVideoComplete
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                {isVideoComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <PlayCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span className="font-medium text-sm text-foreground">
                  {block.title || "Video"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold uppercase">
                  {t({ en: "Video", fr: "Vidéo" })}
                </span>
              </div>
            </div>
            <div className="px-3 pt-3 pb-3">
              {!isPlaying ? (
                <div
                  className="aspect-video rounded-lg overflow-hidden bg-black relative cursor-pointer group"
                  onClick={() => startPlayingVideo(videoKey)}
                >
                  <img
                    src={getYouTubeThumbnail(videoId)}
                    alt={block.title || "Video"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-7 h-7 text-white fill-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
                    title={block.title || "Video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <Button
                  variant={isVideoComplete ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleVideoComplete(videoKey)}
                  className={`gap-1.5 text-xs ${
                    isVideoComplete
                      ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {isVideoComplete
                    ? t({ en: "Completed", fr: "Terminée" })
                    : t({ en: "Mark as watched", fr: "Marquer comme vue" })
                  }
                </Button>
                {block.watchUrl && (
                  <a
                    href={block.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {t({ en: "Watch on YouTube", fr: "Regarder sur YouTube" })}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      }
      case "transcript": {
        const body = block.body || {};
        const text = typeof body === "string" ? body : (body[lang] || body.en || "");
        if (!text) return null;
        return (
          <details key={blockIdx} className="group border border-border/50 rounded-lg" open={showTranscript}>
            <summary
              onClick={(e) => { e.preventDefault(); setShowTranscript(!showTranscript); }}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {t({ en: "Video Transcript", fr: "Transcription vidéo" })}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${showTranscript ? "rotate-180" : ""}`} />
            </summary>
            <div className="px-4 pb-3 text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {text}
            </div>
          </details>
        );
      }
      case "checkpoint": {
        const exerciseId = block.exerciseId;
        const exercise = courseExercises.find((ex: any) => ex.id === exerciseId);
        if (!exercise) return null;
        return (
          <div key={blockIdx} className="my-4">
            <ExerciseRenderer
              exercise={exercise}
              index={0}
              lang={lang as "en" | "fr"}
              onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })}
            />
          </div>
        );
      }
      case "flip_cards": {
        const cards = block.cards || [];
        if (!cards.length) return null;
        return (
          <div key={blockIdx}>
            <FlipCardsGrid cards={cards} lang={lang} />
          </div>
        );
      }
      case "tabbed_content": {
        const tabs = block.tabs || [];
        if (!tabs.length) return null;
        return (
          <div key={blockIdx}>
            <TabbedContent tabs={tabs} lang={lang as "en" | "fr"} />
          </div>
        );
      }
      case "comparison": {
        const items = block.items || [];
        if (!items.length) return null;
        return (
          <div key={blockIdx}>
            <ComparisonBox
              items={items}
              conclusion={block.conclusion}
              lang={lang as "en" | "fr"}
            />
          </div>
        );
      }
      case "bucket_sort": {
        if (!block.buckets || !block.cards) return null;
        return (
          <div key={blockIdx}>
            <MatchingExercise
              exercise={{
                id: block.id || `bucket_${blockIdx}`,
                title: block.title,
                instructions: block.instructions,
                buckets: block.buckets,
                cards: block.cards,
                correction: block.correction,
              }}
              lang={lang as "en" | "fr"}
            />
          </div>
        );
      }
      case "single_choice_exercise": {
        const question = typeof block.question === 'string' ? block.question : (block.question?.[lang] || block.question?.en || '');
        const options = (block.options || []).map((opt: any) => ({
          id: opt.id,
          text: typeof opt.text === 'string' ? opt.text : (opt.text?.[lang] || opt.text?.en || '')
        }));
        const explanation = typeof block.explanation === 'string' ? block.explanation : (block.explanation?.[lang] || block.explanation?.en || '');
        const correctAnswer = block.correctAnswer || 'a';
        const exerciseId = block.id || `quiz_${blockIdx}`;
        // Calculate question number within this chapter
        const chapterBlocks = chapter?.blocks || [];
        const quizBlocksBefore = chapterBlocks.slice(0, blockIdx).filter((b: any) => b.type === 'single_choice_exercise').length;
        return (
          <SingleChoiceExercise
            key={blockIdx}
            id={exerciseId}
            question={question}
            options={options}
            correctAnswer={correctAnswer}
            explanation={explanation}
            lang={lang as 'en' | 'fr'}
            questionNumber={quizBlocksBefore + 1}
            onCorrect={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })}
          />
        );
      }
      case "download": {
        const dlTitle = block.title ? (typeof block.title === 'object' ? (block.title[lang] || block.title.en || '') : block.title) : '';
        const dlDesc = block.description ? (typeof block.description === 'object' ? (block.description[lang] || block.description.en || '') : block.description) : '';
        const dlUrl = block.download_url || block.url || '';
        const dlFilename = block.filename || 'file';
        const dlColor = block.color || '#cbcadb';
        const dlImage = block.image || {};
        const dlImageSrc = typeof dlImage === 'object' ? (dlImage.src || '') : '';
        const dlImageAlt = typeof dlImage === 'object' ? (dlImage.alt || 'Download illustration') : 'Download illustration';
        const isFirstDownload = blockIdx === 0 || (blockIdx > 0 && (() => {
          const prevBlock = chapter?.blocks?.[blockIdx - 1];
          return !prevBlock || prevBlock.type !== 'download';
        })());
        return (
          <div key={blockIdx} className="my-4">
            {isFirstDownload ? (
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {t({ en: "Downloads", fr: "Téléchargements" })}
              </h3>
            ) : null}
            {/* Desktop: horizontal card. Mobile: stacked */}
            <a
              href={dlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden hover:opacity-90 transition-opacity group mb-4"
              style={{ backgroundColor: dlColor }}
            >
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Image section */}
                <div className="md:w-48 w-full h-40 md:h-auto flex items-center justify-center p-6 shrink-0">
                  {dlImageSrc ? (
                    <img
                      src={dlImageSrc}
                      alt={dlImageAlt}
                      className="w-24 h-24 md:w-32 md:h-32 object-contain"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-foreground/60" />
                  )}
                </div>
                {/* Content section */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <p className="font-semibold text-foreground text-lg mb-2">{dlTitle}</p>
                  {dlDesc && <p className="text-foreground/80 text-base leading-relaxed mb-4">{dlDesc}</p>}
                  <div>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground/10 text-foreground text-sm font-medium group-hover:bg-foreground/20 transition-colors w-full md:w-auto justify-center">
                      <Download className="w-4 h-4" />
                      {t({ en: "Download", fr: "Télécharger" })}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Slide-in animation variants
  const slideEase = [0.23, 1, 0.32, 1] as [number, number, number, number];
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: slideEase },
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.2, ease: slideEase },
    }),
  };

  return (
    <div className="mt-2">
      {!showQuiz ? (
        <>
          <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={`chapter-${currentChapter}`}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
          {/* Chapter header - Skilljar style: badge shows type + chapter name, title shows screen title */}
          {chapter && (() => {
            // Extract screen title from first content block's first line
            const firstContentBlock = chapter.blocks?.find((b: any) => b.type === 'content');
            let screenTitle = '';
            let screenDescription = '';
            if (firstContentBlock) {
              const body = firstContentBlock.body || {};
              const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
              const textLines = text.split('\n').filter((l: string) => l.trim().length > 0);
              if (textLines.length > 0) {
                // Strip markdown heading prefixes (##, ###, etc.)
                screenTitle = textLines[0].trim().replace(/^#{1,6}\s+/, '');
                // If second line is a short description (< 120 chars), use it
                if (textLines.length > 1 && textLines[1].trim().length < 120 && textLines[1].trim().length > 20) {
                  screenDescription = textLines[1].trim().replace(/^#{1,6}\s+/, '');
                }
              }
            }
            // Fall back to chapter title if no screen title found
            const displayTitle = screenTitle || resolveI18n(chapter.title, lang);
            const chapterName = resolveI18n(chapter.title, lang);
            // Only show chapter name in badge if screen title is different from chapter title
            const showChapterInBadge = screenTitle && screenTitle !== chapterName;

            return (
              <div className="mb-8">
                {/* Badge row: TYPE | CHAPTER_NAME · DURATION */}
                <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                    chapter.type === 'exercise'
                      ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300'
                      : chapter.type === 'checkpoint' || chapter.type === 'quiz'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}>
                    {chapter.type === 'exercise' ? t({ en: 'EXERCISE', fr: 'EXERCICE' })
                      : chapter.type === 'checkpoint' ? 'CHECKPOINT'
                      : chapter.type === 'quiz' ? 'QUIZ'
                      : t({ en: 'TEACHING', fr: 'ENSEIGNEMENT' })}
                  </span>
                  {showChapterInBadge && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      {chapterName}
                    </span>
                  )}
                  {chapter.duration && (
                    <span className="text-xs text-muted-foreground">
                      · {chapter.duration}
                    </span>
                  )}
                </div>
                {/* Screen title - large serif */}
                <h2 className="text-2xl md:text-[28px] font-semibold text-foreground leading-tight" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {displayTitle}
                </h2>
                {/* Decorative separator */}
                <div className="mt-4 mb-2 w-12 h-0.5 bg-[#c75b3a]/60 rounded-full" />
                {/* Screen description - italic serif */}
                {screenDescription && (
                  <p className="mt-3 text-base text-muted-foreground italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                    {screenDescription}
                  </p>
                )}
                {/* Chapter description fallback */}
                {!screenDescription && chapter.description && (
                  <p className="mt-3 text-base text-muted-foreground italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                    {resolveI18n(chapter.description, lang)}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Render all blocks in the current chapter */}
          {chapter && (
            <div className="space-y-6">
              {chapter.blocks.map((block: any, idx: number) => renderBlock(block, idx))}
            </div>
          )}

          {/* Chapter Quiz (shown between teaching chapters) */}
          {showChapterQuiz && (
            <ChapterQuiz
              courseId={courseId}
              chapterIndex={currentChapter}
              lessonIndex={lessonIndex}
              lang={lang}
              t={t}
              onPass={() => {
                setChapterQuizPassed((prev) => { const next = new Set(Array.from(prev)); next.add(currentChapter); return next; });
                setShowChapterQuiz(false);
                // Advance validated progress (quiz passed = chapter validated)
                setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                setSlideDirection('right');
                setCurrentChapter((p) => p + 1);
                setShowTranscript(false);
              }}
            />
          )}
          </motion.div>
          </AnimatePresence>

                    {/* Chapter navigation */}
          <div className="mt-8 pt-5 border-t border-[#e8e5e0] dark:border-slate-700">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {t({ en: `Screen ${currentChapter + 1} of ${totalChapters}`, fr: `Écran ${currentChapter + 1} sur ${totalChapters}` })}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-[#e8e5e0] dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c75b3a] transition-all duration-300"
                  style={{ width: `${((currentChapter + 1) / totalChapters) * 100}%` }}
                />
              </div>
            </div>
            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSlideDirection('left'); setCurrentChapter((p) => p - 1); setShowTranscript(false); setShowChapterQuiz(false); }}
              disabled={currentChapter === 0}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              ← {t({ en: "Previous", fr: "Précédent" })}
            </Button>

            {(() => {
              if (isLastChapter && isReviewMode) {
                return (
                  <span className="text-xs text-muted-foreground italic">
                    {t({ en: "End of review", fr: "Fin de la révision" })}
                  </span>
                );
              }
              if (isLastChapter && !isReviewMode) {
                return (
                  <Button
                    size="sm"
                    onClick={() => setShowQuiz(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                  >
                    {t({ en: "Take Quiz", fr: "Passer le quiz" })}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                );
              }
              // Not last chapter - show Next button with possible gate
              const isQuizOrCheckpointChapter = chapter?.type === 'quiz' || chapter?.type === 'checkpoint';
              const chapterExerciseIds = isQuizOrCheckpointChapter
                ? (chapter?.blocks || []).filter((b: any) => b.type === 'single_choice_exercise' || b.type === 'checkpoint').map((b: any, i: number) => b.type === 'checkpoint' ? (b.exerciseId || `checkpoint_${i}`) : (b.id || `quiz_${i}`))
                : [];
              const allExercisesCompleted = chapterExerciseIds.length === 0 || chapterExerciseIds.every((id: string) => completedExercises.has(id));
              const isGatedByExercises = isQuizOrCheckpointChapter && chapterExerciseIds.length > 0 && !allExercisesCompleted && !isReviewMode;
              const chapterTitle = resolveI18n(chapter?.title, 'en');
              const isStructuralChapter = /^(Module Introduction|Key Takeaways|Module Complete)$/i.test(chapterTitle);
              const isTeachingChapter = chapter?.type === 'teaching' && !isStructuralChapter;
              const needsQuiz = isTeachingChapter && !isReviewMode && !chapterQuizPassed.has(currentChapter);

              return (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isGatedByExercises}
                  onClick={() => {
                    if (needsQuiz) {
                      setShowChapterQuiz(true);
                    } else {
                      // For non-quiz chapters (structural, exercise-completed, etc.), validate progress
                      if (isQuizOrCheckpointChapter && allExercisesCompleted) {
                        // Exercises completed = chapter validated
                        setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                      } else if (isStructuralChapter || (!isTeachingChapter && !isQuizOrCheckpointChapter)) {
                        // Structural chapters auto-validate (they have no quiz)
                        setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                      }
                      setSlideDirection('right');
                      setCurrentChapter((p) => p + 1);
                      setShowTranscript(false);
                      setShowChapterQuiz(false);
                    }
                  }}
                  className={`gap-1 font-medium ${isGatedByExercises ? 'text-muted-foreground cursor-not-allowed' : 'text-[#c75b3a] hover:text-[#a84a2e]'}`}
                  title={isGatedByExercises ? (lang === 'fr' ? 'Répondez correctement à toutes les questions pour continuer' : 'Answer all questions correctly to continue') : undefined}
                >
                  {isGatedByExercises ? (
                    <>{t({ en: "Complete all exercises", fr: "Complétez les exercices" })}</>
                  ) : (
                    <>{t({ en: "Next", fr: "Suivant" })} →</>
                  )}
                </Button>
              );
            })()}
            </div>
          </div>
        </>
      ) : (
        <LessonQuiz
          certId={certId}
          courseId={courseId}
          lessonIndex={lessonIndex}
          lang={lang}
          t={t}
          onPass={onComplete}
        />
      )}
    </div>
  );
}

// Sidebar content (shared between desktop and mobile drawer)
function LessonSidebarContent({
  lessons,
  lang,
  t,
  nextUnlocked,
  isLessonComplete,
  courseId,
  videos,
  activeLessonIndex,
  onLessonClick,
  chapterProgress,
  displayedLessonIndex,
  onScreenClick,
  activeScreenIndex,
  chaptersData,
  sections,
}: {
  lessons: any[];
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  nextUnlocked: number;
  isLessonComplete: (courseId: string, idx: number) => boolean;
  courseId: string;
  videos: any[];
  activeLessonIndex: number | null;
  onLessonClick: (idx: number) => void;
  chapterProgress: { current: number; total: number } | null;
  displayedLessonIndex: number;
  onScreenClick?: (chapterIdx: number, screenIdx: number) => void;
  activeScreenIndex?: number;
  chaptersData?: any[];
  sections?: any[];
}) {
  // Calculate overall progress percentage
  const completedCount = lessons.filter((_, idx) => isLessonComplete(courseId, idx)).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Build section boundaries: map lesson index -> section title to show BEFORE it
  const sectionBoundaries: Record<number, string> = {};
  if (sections && sections.length > 0) {
    const genericTitles = new Set(['module introduction', 'module complete', 'key takeaways']);
    let searchFrom = 0;
    for (const section of sections) {
      const sectionTitle = section.title ? (typeof section.title === 'object' ? resolveI18n(section.title, lang) : section.title) : '';
      const sectionLessons = section.lessons || [];
      if (sectionLessons.length > 0) {
        // Find the first non-generic lesson title in this section for boundary matching
        const uniqueTitle = sectionLessons.find((t: string) => !genericTitles.has(t.toLowerCase()));
        let foundIdx = -1;
        if (uniqueTitle) {
          // Search from expected position to handle repeated titles
          for (let i = searchFrom; i < lessons.length; i++) {
            const lt = lessons[i].title ? (typeof lessons[i].title === 'object' ? resolveI18n(lessons[i].title, 'en') : lessons[i].title) : '';
            if (lt.toLowerCase() === uniqueTitle.toLowerCase()) {
              // The section starts at the first lesson before this unique one (could be Module Introduction)
              foundIdx = Math.max(searchFrom, i - sectionLessons.indexOf(uniqueTitle));
              break;
            }
          }
        }
        if (foundIdx >= 0) {
          sectionBoundaries[foundIdx] = sectionTitle;
          searchFrom = foundIdx + sectionLessons.length;
        } else {
          // Fallback: use sequential position
          sectionBoundaries[searchFrom] = sectionTitle;
          searchFrom += sectionLessons.length;
        }
      } else {
        // No lessons array - use sequential assignment
        sectionBoundaries[searchFrom] = sectionTitle;
      }
    }
  }

  return (
    <div className="p-3 space-y-1">
      <p className="text-xs font-bold uppercase tracking-wider px-3 py-2 text-muted-foreground">
        {t({ en: "Progress", fr: "Progression" })}
      </p>
      {lessons.map((lesson, idx) => {
        const completed = isLessonComplete(courseId, idx);
        const isCurrent = idx === nextUnlocked && !completed;
        const isLocked = idx > nextUnlocked;
        const isActive = activeLessonIndex === idx;

        let statusIcon: React.ReactNode;
        let bgClass = "";
        let textClass = "text-muted-foreground";

        if (completed) {
          statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          textClass = "text-foreground";
        } else if (isCurrent) {
          statusIcon = (
            <div className="w-4 h-4 rounded-full bg-primary shrink-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          );
          bgClass = "bg-primary/5 border border-primary/30";
          textClass = "text-foreground";
        } else if (isLocked) {
          statusIcon = <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
          textClass = "text-muted-foreground";
        } else {
          statusIcon = <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />;
        }

        // Override bg for active review item
        if (isActive && completed) {
          bgClass = "bg-amber-500/10 border border-amber-500/30";
        }

        // Check if this lesson has a matching video
        const lessonTitle = resolveI18n(lesson.title, "en").toLowerCase().trim();
        const hasVideo = videos.some((v: any) => (v.title || "").toLowerCase().trim() === lessonTitle);
        
        // Determine chapter/lesson type icon
        const chType = lesson.chapterType || '';
        const hasBucketSort = lesson.hasBucketSort || false;
        const lessonTitleEn = resolveI18n(lesson.title, "en").toLowerCase();
        const isModuleComplete = lessonTitleEn.includes('module complete') || lessonTitleEn.includes('module terminé');
        const isKeyTakeaways = lessonTitleEn.includes('key takeaway') || lessonTitleEn.includes('points clés');
        
        // Detect lesson content types from blocks
        const lessonBlocks = (lesson.chapters || []).flatMap((ch: any) => (ch.blocks || []).map((b: any) => b.type || ''));
        const hasFlipCards = lessonBlocks.includes('flip_cards');
        const hasDownload = lessonBlocks.includes('download');
        const hasCheckpoint = lessonBlocks.includes('checkpoint');
        const hasTabbedContent = lessonBlocks.includes('tabbed_content');
        const hasExerciseBlock = lessonBlocks.includes('single_choice_exercise');
        
        let typeIcon: React.ReactNode = null;
        if (chType === 'quiz' || lessonTitleEn.includes('quiz')) {
          typeIcon = <Brain className="w-3 h-3 text-purple-500 shrink-0" />;
        } else if (chType === 'exercise' || hasExerciseBlock || hasBucketSort) {
          typeIcon = <Target className="w-3 h-3 text-orange-500 shrink-0" />;
        } else if (hasVideo || lesson.hasVideo) {
          typeIcon = <Video className="w-3 h-3 text-red-400 shrink-0" />;
        } else if (isModuleComplete) {
          typeIcon = <Trophy className="w-3 h-3 text-amber-500 shrink-0" />;
        } else if (isKeyTakeaways) {
          typeIcon = <GraduationCap className="w-3 h-3 text-emerald-500 shrink-0" />;
        } else if (hasCheckpoint && !hasFlipCards && !hasTabbedContent) {
          typeIcon = <Check className="w-3 h-3 text-blue-500 shrink-0" />;
        } else if (hasDownload) {
          typeIcon = <Download className="w-3 h-3 text-indigo-500 shrink-0" />;
        } else {
          typeIcon = <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />;
        }

        // Clickable if completed or current
        const isClickable = completed || isCurrent;

        // Get sub-screens (blocks) for this chapter when it's the active one
        const showSubScreens = isActive && chaptersData && chaptersData[idx];
        const chapterBlocks = showSubScreens ? (chaptersData[idx]?.blocks || []) : [];

        return (
          <div key={lesson.id || idx}>
            {sectionBoundaries[idx] && (
              <p className="text-xs font-bold uppercase tracking-wider px-3 pt-4 pb-1 text-primary/80 border-t border-border/50 mt-2">
                {sectionBoundaries[idx]}
              </p>
            )}
            <button
              onClick={() => isClickable && onLessonClick(idx)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${bgClass} ${isLocked ? "opacity-50 cursor-not-allowed" : ""} ${isClickable && !isActive ? "hover:bg-secondary/50 cursor-pointer" : ""}`}
            >
              {statusIcon}
              <span className={`truncate font-medium ${textClass}`} title={resolveI18n(lesson.title, lang)}>
                {resolveI18n(lesson.title, lang)}
              </span>
              {typeIcon && (
                <span className="shrink-0 ml-auto flex items-center">
                  {typeIcon}
                </span>
              )}
              {!typeIcon && hasVideo && (
                <Video className="w-3.5 h-3.5 text-red-400 shrink-0 ml-auto" />
              )}
              {isActive && completed && !typeIcon && (
                <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-auto" />
              )}
            </button>
            {/* Sub-screens (blocks) for active chapter - Skilljar style */}
            {showSubScreens && chapterBlocks.length > 1 && (
              <div className="ml-5 mt-0.5 mb-1 border-l-2 border-border pl-3 space-y-0.5">
                {chapterBlocks.map((block: any, screenIdx: number) => {
                  const isActiveScreen = activeScreenIndex === screenIdx;
                  // Determine screen title from block
                  let screenTitle = '';
                  if (block.type === 'content') {
                    const body = block.body || {};
                    const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
                    const firstLine = text.split('\n').find((l: string) => l.trim().length > 0) || '';
                    screenTitle = firstLine.trim().substring(0, 40);
                  } else if (block.type === 'checkpoint' || block.type === 'bucket_sort') {
                    screenTitle = 'Checkpoint';
                  } else if (block.type === 'flip_cards') {
                    screenTitle = lang === 'fr' ? 'Cartes mémoire' : 'Flip Cards';
                  } else if (block.type === 'single_choice_exercise') {
                    screenTitle = lang === 'fr' ? 'Exercice' : 'Exercise';
                  } else if (block.type === 'tabbed_content') {
                    screenTitle = lang === 'fr' ? 'Contenu' : 'Content';
                  } else if (block.type === 'download') {
                    screenTitle = lang === 'fr' ? 'Téléchargement' : 'Download';
                  } else {
                    screenTitle = block.type || (lang === 'fr' ? 'Écran' : 'Screen');
                  }
                  // Determine if this screen is validated (before current active position)
                  const isScreenValidated = activeLessonIndex !== null && screenIdx < activeLessonIndex;
                  // For single-lesson courses, screens before the active chapter are validated
                  const isChapterValidated = completed || (screenIdx < (activeLessonIndex ?? 0));
                  return (
                    <button
                      key={screenIdx}
                      onClick={() => onScreenClick?.(idx, screenIdx)}
                      className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                        isActiveScreen
                          ? 'text-[#c75b3a] font-medium bg-[#c75b3a]/5'
                          : isChapterValidated
                          ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                      }`}
                    >
                      {isChapterValidated && !isActiveScreen ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="text-[10px]">{isActiveScreen ? '●' : '○'}</span>
                      )}
                      <span className="truncate">{screenTitle}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {/* Chapter progress indicator for the currently displayed lesson (non-sub-screen mode) */}
            {idx === displayedLessonIndex && chapterProgress && chapterProgress.total > 1 && !completed && !showSubScreens && (
              <div className="ml-7 mr-3 mt-0.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex gap-0.5">
                    {Array.from({ length: chapterProgress.total }).map((_, ci) => (
                      <div
                        key={ci}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          ci < chapterProgress.current
                            ? "bg-emerald-500"
                            : ci === chapterProgress.current
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {chapterProgress.current > 0 && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {chapterProgress.current + 1}/{chapterProgress.total}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {/* Progress footer */}
      <div className="mt-4 pt-3 border-t border-border px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t({ en: "PROGRESS", fr: "PROGRESSION" })} {progressPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-[#c75b3a] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Sidebar component with Sheet for mobile, sticky aside for desktop
function LessonSidebar({
  lessons,
  lang,
  t,
  nextUnlocked,
  isLessonComplete,
  courseId,
  sidebarOpen,
  onClose,
  videos,
  activeLessonIndex,
  onLessonClick,
  chapterProgress,
  displayedLessonIndex,
  onScreenClick,
  activeScreenIndex,
  chaptersData,
  sections,
}: {
  lessons: any[];
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  nextUnlocked: number;
  isLessonComplete: (courseId: string, idx: number) => boolean;
  courseId: string;
  sidebarOpen: boolean;
  onClose: () => void;
  videos: any[];
  activeLessonIndex: number | null;
  onLessonClick: (idx: number) => void;
  chapterProgress: { current: number; total: number } | null;
  displayedLessonIndex: number;
  onScreenClick?: (chapterIdx: number, screenIdx: number) => void;
  activeScreenIndex?: number;
  chaptersData?: any[];
  sections?: any[];
}) {
  const sidebarContent = (
    <LessonSidebarContent
      lessons={lessons}
      lang={lang}
      t={t}
      nextUnlocked={nextUnlocked}
      isLessonComplete={isLessonComplete}
      courseId={courseId}
      videos={videos}
      activeLessonIndex={activeLessonIndex}
      onLessonClick={(idx) => { onLessonClick(idx); onClose(); }}
      chapterProgress={chapterProgress}
      displayedLessonIndex={displayedLessonIndex}
      onScreenClick={onScreenClick}
      activeScreenIndex={activeScreenIndex}
      chaptersData={chaptersData}
      sections={sections}
    />
  );

  return (
    <>
      {/* Mobile drawer using Sheet */}
      <div className="lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">
                {t({ en: "Lessons", fr: "Leçons" })}
              </span>
            </div>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-72 overflow-y-auto bg-card border-r border-border">
        {sidebarContent}
      </aside>
    </>
  );
}

export default function TrainingCourse() {
  const { certId, courseId } = useParams<{ certId: string; courseId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isLessonComplete, markLessonComplete, getNextUnlockedLesson, isCourseComplete, getChapterProgress: getPersistedChapterProgress, saveChapterProgress: persistChapterProgress } = useTrainingProgress();
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [chapterProgress, setChapterProgress] = useState<{ current: number; total: number } | null>(null);

  // Initialize chapterProgress from persisted data for single-lesson courses
  const persistedChapterInit = getPersistedChapterProgress(courseId || "", 0);
  const hasInitializedChapter = useRef(false);
  useEffect(() => {
    if (persistedChapterInit && !hasInitializedChapter.current && !chapterProgress) {
      setChapterProgress({ current: persistedChapterInit.chapterIndex, total: persistedChapterInit.totalChapters });
      hasInitializedChapter.current = true;
    }
  }, [persistedChapterInit]);

  // Stable callback for chapter changes (prevents infinite re-render in LessonViewer)
  // MUST be declared before any conditional returns (Rules of Hooks)
  const handleChapterChange = useCallback((current: number, total: number) => {
    setChapterProgress({ current, total });
    // Persist chapter progress to database - uses refs/closures to avoid stale values
    if (courseId) {
      persistChapterProgress(courseId, 0, current, total);
    }
  }, [courseId, persistChapterProgress]);

  // Server-synced video progress
  const videoProgressQuery = trpc.videoProgress.get.useQuery(
    { courseId: courseId || "" },
    { enabled: isAuthenticated && !!courseId }
  );
  const toggleVideoMutation = trpc.videoProgress.toggle.useMutation({
    onSuccess: () => { videoProgressQuery.refetch(); },
  });

  // Derive completed set from server data (fallback to localStorage for non-auth)
  const completedVideos = useMemo(() => {
    if (videoProgressQuery.data) {
      return new Set(videoProgressQuery.data.map((vp: any) => vp.youtubeId));
    }
    // Fallback to localStorage if not authenticated
    try {
      const stored = localStorage.getItem(`video_progress_${courseId}`);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch { return new Set<string>(); }
  }, [videoProgressQuery.data, courseId]);

  const course = trainingIndex.courses.find((c: any) => c.id === courseId);
  const cert = trainingIndex.certifications.find((c: any) => c.id === certId);

  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  const [courseExercises, setCourseExercises] = useState<any[]>([]);
  const [courseSections, setCourseSections] = useState<any[]>([]);


  useEffect(() => {
    if (!courseId) return;
    setLessonsLoading(true);
    fetch(`/data/courses/${courseId}.json`)
      .then((res) => res.json())
      .then((data) => {
        setCourseLessons(data.lessons || []);
        setCourseExercises(data.exercises || []);
        setCourseSections(data.sections || []);

        setLessonsLoading(false);
      })
      .catch(() => {
        setCourseLessons([]);
        setCourseExercises([]);
        setCourseSections([]);

        setLessonsLoading(false);
      });
  }, [courseId]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t({ en: "Loading...", fr: "Chargement..." })}</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t({ en: "Authentication Required", fr: "Authentification requise" })}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t({ en: "You must be logged in to access courses.", fr: "Vous devez être connecté pour accéder aux cours." })}
            </p>
            <Button onClick={() => { window.location.href = getLoginUrl(); }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl">
              {t({ en: "Log in", fr: "Se connecter" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

    if (!course || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t({ en: "Course not found", fr: "Cours introuvable" })}</p>
      </div>
    );
  }
  // Sequential lock guard: prevent direct URL access to locked courses
  const certCourses = trainingIndex.courses.filter((c: any) => c.certId === certId);
  const courseIdx = certCourses.findIndex((c: any) => c.id === courseId);
  if (courseIdx > 0) {
    const prevCourse = certCourses[courseIdx - 1];
    const prevTotal = prevCourse.lessonCount || 1;
    const prevComplete = isCourseComplete(prevCourse.id, prevTotal);
    if (!prevComplete) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              {t({ en: "Course Locked", fr: "Cours verrouill\u00e9" })}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t({ en: `You must complete "${typeof prevCourse.title === 'object' ? (prevCourse.title as any)[lang] || (prevCourse.title as any).en : prevCourse.title}" first.`, fr: `Vous devez d'abord terminer "${typeof prevCourse.title === 'object' ? (prevCourse.title as any)[lang] || (prevCourse.title as any).fr : prevCourse.title}".` })}
            </p>
            <Link href={`/training/${certId}`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t({ en: "Back to certification", fr: "Retour \u00e0 la certification" })}
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  }
  // Wait for lessons to load before rendering the course content
  if (lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t({ en: "Loading course...", fr: "Chargement du cours..." })}</p>
        </div>
      </div>
    );
  }

  // For single-lesson courses with multiple chapters, treat chapters as progression units
  const isSingleLessonCourse = courseLessons.length === 1 && (courseLessons[0]?.chapters?.length || 0) > 1;
  const totalProgressUnits = isSingleLessonCourse
    ? (courseLessons[0]?.chapters?.length || 1)
    : courseLessons.length;
  const totalLessons = totalProgressUnits;
  const completed = isCourseComplete(course.id, totalLessons);
  const nextUnlocked = isSingleLessonCourse
    ? (() => {
        const persisted = getPersistedChapterProgress(course.id, 0);
        // chapterIndex is the current reading position (0-based)
        // Chapters 0..chapterIndex-1 are completed, chapterIndex is the "next unlocked" (current)
        return persisted ? Math.min(persisted.chapterIndex, totalLessons) : 0;
      })()
    : getNextUnlockedLesson(course.id, totalLessons);
  const videos = course.videos || [];

  const toggleVideo = (videoId: string) => {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const startPlayingVideo = (videoId: string) => {
    setPlayingVideos((prev) => new Set(prev).add(videoId));
  };

  const toggleVideoComplete = (videoId: string) => {
    if (isAuthenticated && courseId) {
      toggleVideoMutation.mutate({ courseId, youtubeId: videoId });
    } else {
      // Fallback to localStorage for non-authenticated users
      try {
        const stored = localStorage.getItem(`video_progress_${courseId}`);
        const set = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
        if (set.has(videoId)) set.delete(videoId);
        else set.add(videoId);
        localStorage.setItem(`video_progress_${courseId}`, JSON.stringify(Array.from(set)));
      } catch {}
    }
  };

  // Get YouTube thumbnail URL from youtube_id
  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  const handleMarkLessonComplete = (lessonIndex: number) => {
    if (certId && courseId) {
      markLessonComplete(certId, courseId, lessonIndex);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href={`/training/${certId}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">Training</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors"
            >
              <span>{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
              {lang === "en" ? "EN" : "FR"}
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 hover:text-red-700 border border-red-200 dark:border-red-800 hover:border-red-300"
              title="Déconnexion"
            >
              <LogOut size={13} />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex overflow-x-hidden">
        {/* Sidebar */}
        {!lessonsLoading && courseLessons.length > 0 && (
          <LessonSidebar
            lessons={isSingleLessonCourse
              ? (courseLessons[0]?.chapters || []).map((ch: any, i: number) => ({
                  id: ch.id || `chapter_${i}`,
                  title: ch.title || { en: `Chapter ${i + 1}`, fr: `Chapitre ${i + 1}` },
                  chapterType: ch.type || 'teaching',
                  hasVideo: ch.blocks?.some((b: any) => b.type === 'video') || false,
                  hasBucketSort: ch.blocks?.some((b: any) => b.type === 'bucket_sort') || false,
                }))
              : courseLessons
            }
            lang={lang}
            t={t}
            nextUnlocked={nextUnlocked}
            isLessonComplete={isSingleLessonCourse
              ? (cId: string, idx: number) => {
                  // For single-lesson courses, use persisted chapter progress for completion
                  // A chapter is complete if it's before the current reading position
                  const persisted = getPersistedChapterProgress(cId, 0);
                  if (persisted && idx < persisted.chapterIndex) return true;
                  if (chapterProgress && idx < chapterProgress.current) return true;
                  return false;
                }
              : isLessonComplete
            }
            courseId={course.id}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            videos={videos}
            activeLessonIndex={isSingleLessonCourse
              ? (chapterProgress?.current ?? 0)
              : activeLessonIndex
            }
            onLessonClick={(idx) => {
              if (isSingleLessonCourse) {
                // Navigate to the chapter within the single lesson
                setActiveLessonIndex(0);
                setChapterProgress({ current: idx, total: courseLessons[0]?.chapters?.length || 1 });
              } else {
                setActiveLessonIndex(idx);
              }
            }}
            chapterProgress={isSingleLessonCourse ? null : chapterProgress}
            displayedLessonIndex={isSingleLessonCourse
              ? (chapterProgress?.current ?? 0)
              : (activeLessonIndex ?? nextUnlocked)
            }
            chaptersData={isSingleLessonCourse ? (courseLessons[0]?.chapters || []) : undefined}
            activeScreenIndex={undefined}
            onScreenClick={isSingleLessonCourse ? undefined : undefined}
            sections={isSingleLessonCourse ? undefined : courseSections}
          />
        )}

        {/* Main content */}
        <motion.main
          className="flex-1 max-w-4xl mx-auto px-4 py-8 lg:px-8 min-w-0"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Course Header */}
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm mb-2 text-muted-foreground">
              <Link href="/training" className="hover:text-primary transition-colors">
                {t({ en: "Training", fr: "Formation" })}
              </Link>
              <span>/</span>
              <Link href={`/training/${certId}`} className="hover:text-primary transition-colors">
                {t(cert.title)}
              </Link>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">{t(course.title)}</h1>
            {/* Global progress summary */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{Math.min(nextUnlocked, totalLessons)}</span>
                <span>/ {totalLessons} {isSingleLessonCourse ? t({ en: "chapters", fr: "chapitres" }) : t({ en: "lessons", fr: "leçons" })}</span>
              </div>
              {videos.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-foreground">{completedVideos.size}</span>
                  <span>/ {videos.length} {t({ en: "videos", fr: "vidéos" })}</span>
                </div>
              )}
            </div>
            {/* Combined progress bar */}
            {totalLessons > 0 && (
              <div className="mt-4 space-y-2">
                {/* Lessons progress */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-14">{isSingleLessonCourse ? t({ en: "Chapters", fr: "Chapitres" }) : t({ en: "Lessons", fr: "Leçons" })}</span>
                  <div className="flex-1 rounded-full h-2 bg-secondary">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (nextUnlocked / totalLessons) * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                    {Math.min(nextUnlocked, totalLessons)}/{totalLessons}
                  </span>
                </div>
                {/* Videos progress */}
                {videos.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-14">{t({ en: "Videos", fr: "Vidéos" })}</span>
                    <div className="flex-1 rounded-full h-2 bg-secondary">
                      <motion.div
                        className="bg-red-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${videos.length > 0 ? (completedVideos.size / videos.length) * 100 : 0}%` }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                      {completedVideos.size}/{videos.length}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Active Lesson Viewer */}
          {lessonsLoading ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
              <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t({ en: "Loading lessons...", fr: "Chargement des leçons..." })}</p>
            </div>
          ) : courseLessons.length > 0 && (() => {
            // Determine which lesson to display: review mode or current
            // For single-lesson courses, always display the single lesson (index 0)
            // and use chapter-based navigation within it
            const displayedIndex = isSingleLessonCourse ? 0 : (activeLessonIndex ?? nextUnlocked);
            const displayedLesson = courseLessons[displayedIndex];
            const isReviewMode = isSingleLessonCourse
              ? (chapterProgress !== null && chapterProgress.current < nextUnlocked)
              : (activeLessonIndex !== null && isLessonComplete(course.id, activeLessonIndex));
            const isCurrentLesson = isSingleLessonCourse
              ? !completed
              : (displayedIndex === nextUnlocked && !isLessonComplete(course.id, nextUnlocked));

            // If no active review and current lesson is completed, show nothing (course complete state handles it)
            if (!displayedLesson) return null;
            if (!isSingleLessonCourse && !isReviewMode && !isCurrentLesson) return null;

            // Match videos to this lesson by title
            const lessonTitle = resolveI18n(displayedLesson.title, "en").toLowerCase().trim();
            const lessonVideos = videos.filter((v: any) => {
              const vTitle = (v.title || "").toLowerCase().trim();
              return vTitle === lessonTitle;
            });

            return (
              <motion.div
                key={displayedIndex}
                variants={fadeInUp}
                className={`border-2 rounded-2xl overflow-hidden shadow-sm ${
                  isReviewMode ? "border-amber-500/50" : "border-primary"
                }`}
              >
                <div className={`p-4 border-b ${
                  isReviewMode ? "border-amber-500/30 bg-amber-500/5" : "border-primary/30 bg-primary/5"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isReviewMode ? "bg-amber-500" : "bg-primary"
                    }`}>
                      <span className="text-white text-xs font-bold">{displayedIndex + 1}</span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {resolveI18n(displayedLesson.title, lang)}
                    </span>
                    {lessonVideos.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <PlayCircle className="w-3 h-3" />
                        {lessonVideos.length} {lessonVideos.length > 1 ? "vidéos" : "vidéo"}
                      </span>
                    )}
                    {isReviewMode ? (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Eye className="w-3 h-3" />
                        {t({ en: "Review Mode", fr: "Mode Révision" })}
                      </span>
                    ) : (
                      <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                        {t({ en: "In Progress", fr: "En cours" })}
                      </span>
                    )}
                  </div>
                  {isReviewMode && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isSingleLessonCourse) {
                            // Return to the current chapter (nextUnlocked position)
                            setChapterProgress({ current: nextUnlocked, total: totalLessons });
                          } else {
                            setActiveLessonIndex(null);
                          }
                        }}
                        className="text-xs gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        {t({ en: "Back to current lesson", fr: "Retour au cours actuel" })}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <LessonViewer
                    lesson={displayedLesson}
                    lessonIndex={displayedIndex}
                    lang={lang}
                    t={t}
                    certId={certId || ""}
                    courseId={courseId || ""}
                    onComplete={() => {
                      if (isSingleLessonCourse) {
                        // For single-lesson courses, advance chapter progress to the end
                        const totalChaps = courseLessons[0]?.chapters?.length || 1;
                        setChapterProgress({ current: totalChaps, total: totalChaps });
                        // Persist chapter progress to DB (marks all chapters as done)
                        if (course?.id) {
                          persistChapterProgress(course.id, 0, totalChaps, totalChaps);
                        }
                        // Also mark lesson 0 as complete in training_progress table
                        handleMarkLessonComplete(0);
                      } else {
                        handleMarkLessonComplete(displayedIndex);
                      }
                    }}
                    matchedVideos={lessonVideos}
                    completedVideos={completedVideos}
                    expandedVideos={expandedVideos}
                    playingVideos={playingVideos}
                    toggleVideo={toggleVideo}
                    startPlayingVideo={startPlayingVideo}
                    toggleVideoComplete={toggleVideoComplete}
                    getYouTubeThumbnail={getYouTubeThumbnail}
                    isReviewMode={isReviewMode}
                    courseExercises={courseExercises}
                    onChapterChange={handleChapterChange}
                    initialChapter={isSingleLessonCourse ? (chapterProgress?.current ?? 0) : undefined}
                  />
                </div>
              </motion.div>
            );
          })()}



          {/* Course Completion */}
          {completed && (
            <motion.div variants={fadeInUp} className="flex items-center gap-4 border border-primary/30 rounded-2xl p-6 bg-primary/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {t({ en: "Course completed!", fr: "Cours terminé !" })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: "Great job! You can move on to the next course.", fr: "Bravo ! Vous pouvez passer au cours suivant." })}
                </p>
                <Link href={`/training/${certId}`}>
                  <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                    {t({ en: "Back to certification", fr: "Retour à la certification" })}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
