# Bug: Markdown ** asterisks shown raw in sidebar and content headings

## Confirmed on dev server
- URL: /training/claude_certified_associate_foundations/claude_certified_associate_foundations__01
- Sidebar shows: **What to Expect from Generative AI**
- Content heading shows: **What to Expect from Generative AI** (with literal asterisks)

## Root cause
The `body` field in flip_cards blocks starts with `**Title**\n\nContent...`
The code parses the first line as a heading/title for the screen but doesn't strip the ** markdown bold markers.

## Where to fix
The screen title extraction logic and the heading rendering in TrainingCourse.tsx need to strip ** from titles.
The sidebar sub-screen items also display the raw ** text.
