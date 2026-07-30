# Translation Fix Notes

## Problem
The admin content editor crashes with `TypeError: ke.body?.replace is not a function` because:
1. Course data fields (body, question, explanation, prompt, title, etc.) are translation objects `{en, fr}` not strings
2. The rendering code calls `.replace()`, `.substring()` directly on these objects
3. The edit dialogs try to display objects in text inputs (shows `[object Object]`)

## What was already fixed (in this session)
1. Added `resolveBody()` helper to AdminContentManager.tsx (line 35-40) that extracts the correct language string
2. Fixed `block.body` rendering for content and transcript blocks (lines 303, 322)
3. Fixed exercise title, prompt, instructions rendering (lines 373, 386, 387)
4. Added missing block type renderers (text, single_choice_exercise, bucket_sort, comparison, tabbed_content, download)

## Edit dialogs - current state
The exam question and quiz edit dialogs already handle typeof checks for display:
- Line 820: domain input uses `typeof editingExamQ.domain === "object" ? ...`
- Line 824: question textarea uses typeof check
- Line 842: choice text input uses typeof check
- Line 856: explanation textarea uses typeof check
- Line 904: quiz question uses typeof check
- Line 918: quiz choice text uses typeof check
- Line 931: quiz explanation uses typeof check

## Exercise edit dialog (lines 768-806) - NEEDS FIX
The exercise edit dialog does NOT handle translation objects:
- Line 771: `value={editingExamQ.title || ""}` - will show [object Object]
- Line 775: `value={editingExamQ.prompt || ""}` - will show [object Object]
- Line 779: `value={editingExamQ.instructions || ""}` - will show [object Object]
- Line 783: `value={editingExamQ.correction || ""}` - will show [object Object]

## Backend (server/adminContentRouter.ts)
- `updateChapterBlocks` accepts `z.any()` blocks - can preserve translation objects
- `updateQuizzes`, `updateMockExamQuestion`, `updateExercise` use string schemas for translated fields
- Backend schemas need to be widened to accept either string or {en, fr} objects

## Data structure (from check_types.py)
Translation objects found in:
- content.body, text.content, transcript.body
- single_choice_exercise.question, single_choice_exercise.explanation
- bucket_sort.title, bucket_sort.instructions, bucket_sort.correction
- comparison.conclusion
- download.image
- exercise.title, exercise.prompt, exercise.correction (no instructions field found as dict)
