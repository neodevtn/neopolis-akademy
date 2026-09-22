import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getBlockDef } from "@shared/blockRegistry";
import { getEditorFields, hydrateBlockForEditor } from "./blockEditorParity";

const INTERNAL_KEYS = new Set(["type", "id", "label", "source_page", "order", "mediaUnavailable", "optionalMediaUnavailable"]);
const VIDEO_ALIASES = new Set(["url", "videoId", "watchUrl", "embedUrl", "mp4Url", "hlsUrl", "audioUrl"]);

function courseBlocks() {
  const directory = path.resolve(process.cwd(), "client", "public", "data", "courses");
  return fs.readdirSync(directory).filter((name) => name.endsWith(".json")).flatMap((name) => {
    const course = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
    return (course.lessons || []).flatMap((lesson: any) => (lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []));
  }).filter((block: any) => block?.type);
}

describe("production block editor coverage", () => {
  it("covers every learner-facing attribute found in every production block type", () => {
    const seenTypes = new Set<string>();
    for (const block of courseBlocks()) {
      const definition = getBlockDef(block.type);
      expect(definition, `registered definition for ${block.type}`).toBeTruthy();
      seenTypes.add(block.type);
      const fieldKeys = new Set(getEditorFields(hydrateBlockForEditor(block, definition?.schema), definition?.schema).map((field) => field.key));
      for (const [key, value] of Object.entries(block)) {
        if (INTERNAL_KEYS.has(key)) continue;
        if (value === undefined || value === null || value === "") continue;
        if (block.type === "video" && VIDEO_ALIASES.has(key)) {
          expect(fieldKeys.has("sourceType") && fieldKeys.has("sourceUrl"), `canonical video source for ${key}`).toBe(true);
          continue;
        }
        expect(fieldKeys.has(key), `${block.type}.${key}`).toBe(true);
      }
    }
    expect(seenTypes.size).toBeGreaterThanOrEqual(30);
  });
});
