# Neopolis Akademy - Rebuild Specification

## Objective
Reproduce faithfully the CPN/Skilljar structure, then enrich without destroying the source structure.

## Sources
- `raw/*.html` and `raw/pages/*.html` = source of truth for Skilljar
- `output_authenticated/markdown/*` and `training_site_source/*` = extracted content only (not structure)

## Target Data Model

### Certification
- id, title, structure ("path" or "catalog"), courses[]

### Course
- id, sourceUrl, officialTitleEn, titleFr, descriptionEn, descriptionFr
- objectives[], prerequisites[], audience
- sectionCount, lessonCount, videoCount, quizCount, exerciseCount
- sections[]

### Section
- id, order, officialTitleEn, titleFr, lessons[]

### Lesson
- id, sourceHref, order, sectionId, officialTitleEn, titleFr
- type: "video" | "content" | "exercise" | "quiz" | "assessment" | "survey"
- contentBlocks[], video, transcript, exercise, quiz, estimatedDuration

## Reconstruction Rules
1. Never merge two source lessons into one title with `->`
2. Never replace source titles with generic `Module 01` titles
3. Keep Skilljar sections as visible groups in sidebar
4. Keep each Skilljar lesson as atomic step
5. Exercises stay at source position and become interactive
6. Source quizzes stay at source position and become passable
7. Videos displayed in video lessons; if embed impossible, show external link + transcript
8. Displayed counters from reconstructed model: sections, lessons, videos, exercises, quizzes
9. Catalog-type CPN courses independently accessible (no lock between courses)
10. Pedagogical locking intra-course only, based on real lessons/exercises/quizzes

## Expected Rendering
- Catalog page: course list, clickable cards, per-course progress, aggregate progress
- Course page: Skilljar overview first, objectives/prerequisites/audience, sections, start/continue button
- Course player: collapsible sections sidebar, atomic lessons in source order, type badges, per-lesson progress, paginated content, prev/next buttons
- Exercises: response fields, validate button, feedback, correction/rubric after attempt, save response
- Quiz: single/multi select QCM, scoring, explanation, retry if allowed, complete status
- Videos: iframe or external link, transcript in paragraphs, video progress

## Translation Rules
- Bilingual EN/FR
- Keep official course titles in English, add secondary FR translation
- Don't translate product names: Claude Code, MCP, RAG, BM25, API
- Uniformize "IA" in French except in official English titles
- Clean all encoding artifacts: Â, â, Flip, ↻, undefined, null, visible escape sequences

## Acceptance Tests
1. "Building with the Claude API" shows Skilljar sections (Introduction, Anthropic overview, etc.)
2. No lesson title contains `->` unless in source
3. Lessons "Getting an API key", "Making a request", "Chat exercise", "Quiz on accessing Claude with the API" exist as distinct steps
4. Exercises have at least one interactive field or actionable choice
5. Quizzes have options, validation, score and explanation
6. Video lessons show iframe or external link + transcript
7. Lesson/video/quiz/exercise counters match reconstructed source model
8. FR and EN mode show same structure and step IDs
9. Architect Foundations catalog exposes independent clickable courses
10. No artifact Â, â, Flip, ↻, undefined, null visible
