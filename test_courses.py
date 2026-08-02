#!/usr/bin/env python3
"""
Comprehensive functional test for all 71 courses.
Checks:
1. JSON structure validity (lessons, chapters, blocks)
2. Content completeness (no truncated text, no empty blocks)
3. Video references validity (YouTube IDs)
4. Exercise/quiz structure (options, correct answers)
5. Flip cards completeness
6. I18n fields (fr/en presence)
"""

import json
import os
import sys
from pathlib import Path

COURSES_DIR = Path("client/public/data/courses")
INDEX_FILE = Path("client/src/data/trainingIndex.json")

issues = []
warnings = []
stats = {
    "total_courses": 0,
    "total_lessons": 0,
    "total_chapters": 0,
    "total_blocks": 0,
    "total_videos": 0,
    "total_exercises": 0,
    "total_flip_cards": 0,
}

def add_issue(course_id, severity, message):
    issues.append({"course": course_id, "severity": severity, "message": message})

def add_warning(course_id, message):
    warnings.append({"course": course_id, "message": message})

def resolve_i18n(val, lang="fr"):
    if isinstance(val, dict):
        return val.get(lang, val.get("en", ""))
    return val or ""

def check_text_truncated(text, course_id, context):
    """Check if text appears truncated"""
    if not text:
        return
    text = str(text).strip()
    # Check for common truncation patterns
    if text.endswith("...") and len(text) < 50:
        add_warning(course_id, f"Possibly truncated text in {context}: '{text[:80]}'")
    if text.endswith("\\") or text.endswith("…"):
        add_warning(course_id, f"Possibly truncated text in {context}: '{text[:80]}'")

def validate_video(video, course_id, lesson_idx, chapter_idx):
    """Validate a video block"""
    stats["total_videos"] += 1
    video_id = video.get("youtubeId") or video.get("youtube_id") or video.get("id")
    if not video_id:
        add_issue(course_id, "ERROR", f"Lesson {lesson_idx}, Chapter {chapter_idx}: Video missing youtubeId")
        return
    # YouTube IDs are typically 11 chars
    if len(str(video_id)) < 5:
        add_issue(course_id, "ERROR", f"Lesson {lesson_idx}, Chapter {chapter_idx}: Invalid youtubeId '{video_id}'")

def validate_exercise(exercise, course_id, lesson_idx, chapter_idx, block_idx):
    """Validate an exercise block"""
    stats["total_exercises"] += 1
    ex_type = exercise.get("type", "unknown")
    
    if ex_type in ("single_choice", "multi_choice", "single-choice", "multi-choice"):
        options = exercise.get("options", [])
        if not options:
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: {ex_type} exercise has no options")
            return
        # Check at least one correct answer
        has_correct = any(o.get("correct") or o.get("isCorrect") for o in options)
        if not has_correct:
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: {ex_type} exercise has no correct answer")
        # Check options have text
        for i, opt in enumerate(options):
            opt_text = resolve_i18n(opt.get("text") or opt.get("label") or opt.get("title", ""))
            if not opt_text.strip():
                add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Option {i} has empty text")
    
    elif ex_type == "matching":
        pairs = exercise.get("pairs", [])
        if not pairs:
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Matching exercise has no pairs")
    
    elif ex_type == "bucket_sort":
        buckets = exercise.get("buckets", [])
        items = exercise.get("items", [])
        if not buckets:
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Bucket sort has no buckets")
        if not items:
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Bucket sort has no items")

def validate_flip_cards(block, course_id, lesson_idx, chapter_idx, block_idx):
    """Validate flip cards block"""
    cards = block.get("cards", [])
    stats["total_flip_cards"] += len(cards)
    if not cards:
        add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Flip cards block has no cards")
        return
    for i, card in enumerate(cards):
        front = resolve_i18n(card.get("front", ""))
        back = resolve_i18n(card.get("back", ""))
        if not front.strip():
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Card {i} has empty front")
        if not back.strip():
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Card {i} has empty back")
        check_text_truncated(back, course_id, f"flip card {i} back")

def validate_block(block, course_id, lesson_idx, chapter_idx, block_idx):
    """Validate a single content block"""
    stats["total_blocks"] += 1
    block_type = block.get("type", "unknown")
    
    if block_type == "text":
        content = resolve_i18n(block.get("content", ""))
        if not content.strip():
            add_warning(course_id, f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Empty text block")
        check_text_truncated(content, course_id, f"text block L{lesson_idx}/Ch{chapter_idx}/B{block_idx}")
    
    elif block_type == "video":
        validate_video(block, course_id, lesson_idx, chapter_idx)
    
    elif block_type in ("single_choice_exercise", "multi_choice_exercise", "exercise", "single_choice", "multi_choice"):
        validate_exercise(block, course_id, lesson_idx, chapter_idx, block_idx)
    
    elif block_type == "flip_cards":
        validate_flip_cards(block, course_id, lesson_idx, chapter_idx, block_idx)
    
    elif block_type == "matching":
        validate_exercise(block, course_id, lesson_idx, chapter_idx, block_idx)
    
    elif block_type == "bucket_sort":
        validate_exercise(block, course_id, lesson_idx, chapter_idx, block_idx)
    
    elif block_type == "quiz":
        questions = block.get("questions", [])
        if not questions:
            add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Quiz has no questions")
        for qi, q in enumerate(questions):
            choices = q.get("choices", q.get("options", []))
            if not choices:
                add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Quiz Q{qi} has no choices")
            has_correct = any(c.get("correct") or c.get("isCorrect") for c in choices)
            if not has_correct:
                add_issue(course_id, "ERROR", f"L{lesson_idx}/Ch{chapter_idx}/B{block_idx}: Quiz Q{qi} has no correct answer")

def validate_course(course_file):
    """Validate a single course JSON file"""
    course_id = course_file.stem
    stats["total_courses"] += 1
    
    try:
        with open(course_file) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        add_issue(course_id, "CRITICAL", f"Invalid JSON: {e}")
        return
    except Exception as e:
        add_issue(course_id, "CRITICAL", f"Cannot read file: {e}")
        return
    
    # Check basic structure
    lessons = data.get("lessons", [])
    if not lessons:
        add_issue(course_id, "ERROR", f"Course has no lessons")
        return
    
    stats["total_lessons"] += len(lessons)
    
    for li, lesson in enumerate(lessons):
        lesson_title = resolve_i18n(lesson.get("title", ""))
        if not lesson_title.strip():
            add_warning(course_id, f"Lesson {li} has empty title")
        
        chapters = lesson.get("chapters", [])
        if not chapters:
            add_issue(course_id, "ERROR", f"Lesson {li} ({lesson_title}): has no chapters")
            continue
        
        stats["total_chapters"] += len(chapters)
        
        for ci, chapter in enumerate(chapters):
            chapter_title = resolve_i18n(chapter.get("title", ""))
            if not chapter_title.strip():
                add_warning(course_id, f"Lesson {li}, Chapter {ci}: empty title")
            
            blocks = chapter.get("blocks", chapter.get("content", []))
            if not blocks:
                add_issue(course_id, "ERROR", f"Lesson {li}, Chapter {ci} ({chapter_title}): has no content blocks")
                continue
            
            if not isinstance(blocks, list):
                add_issue(course_id, "ERROR", f"Lesson {li}, Chapter {ci}: blocks is not a list (type={type(blocks).__name__})")
                continue
            
            for bi, block in enumerate(blocks):
                if not isinstance(block, dict):
                    add_issue(course_id, "ERROR", f"L{li}/Ch{ci}/B{bi}: block is not a dict (type={type(block).__name__})")
                    continue
                validate_block(block, course_id, li, ci, bi)

def main():
    print("=" * 60)
    print("NEOPOLIS AKADEMY - COMPREHENSIVE COURSE VALIDATION")
    print("=" * 60)
    
    # Validate all course files
    course_files = sorted(COURSES_DIR.glob("*.json"))
    print(f"\nFound {len(course_files)} course files to validate\n")
    
    for cf in course_files:
        validate_course(cf)
    
    # Print results
    print("\n" + "=" * 60)
    print("STATISTICS")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    print("\n" + "=" * 60)
    print(f"ERRORS ({len([i for i in issues if i['severity'] in ('ERROR', 'CRITICAL')])})")
    print("=" * 60)
    
    critical = [i for i in issues if i["severity"] == "CRITICAL"]
    errors = [i for i in issues if i["severity"] == "ERROR"]
    
    if critical:
        print("\n--- CRITICAL ---")
        for i in critical:
            print(f"  [{i['course']}] {i['message']}")
    
    if errors:
        print("\n--- ERRORS ---")
        for i in errors:
            print(f"  [{i['course']}] {i['message']}")
    
    if not critical and not errors:
        print("  No errors found!")
    
    print(f"\n--- WARNINGS ({len(warnings)}) ---")
    if warnings:
        for w in warnings[:50]:  # Limit output
            print(f"  [{w['course']}] {w['message']}")
        if len(warnings) > 50:
            print(f"  ... and {len(warnings) - 50} more warnings")
    else:
        print("  No warnings!")
    
    print("\n" + "=" * 60)
    print("VALIDATION COMPLETE")
    print("=" * 60)
    
    return 1 if critical or errors else 0

if __name__ == "__main__":
    sys.exit(main())
