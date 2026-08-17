import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listGlobalMediaAssets, removeUnusedMediaMetadata, replaceMediaEverywhere, saveMediaMetadata } from "./mediaCatalog";

const workspaces: string[] = [];

async function createWorkspace() {
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "neopolis-media-"));
  workspaces.push(dataDirectory);
  await fs.mkdir(path.join(dataDirectory, "courses"));
  await fs.writeFile(path.join(dataDirectory, "courses", "course.json"), JSON.stringify({
    courseId: "course",
    lessons: [{ recommendedVideos: [{ videoId: "4cQWJViybAQ", title: "Workflow n8n", channel: "n8n", type: "tutorial", topics: ["n8n"] }], chapters: [{ title: { en: "Media" }, blocks: [{ type: "video", mp4Url: "/api/assets/old.mp4" }, { type: "download", fileUrl: "/api/assets/guide.pdf" }] }] }],
  }));
  return dataDirectory;
}

afterEach(async () => { await Promise.all(workspaces.splice(0).map((entry) => fs.rm(entry, { recursive: true, force: true }))); });

describe("media catalog", () => {
  it("indexes existing course assets and exposes their usages", async () => {
    const directory = await createWorkspace();
    const assets = await listGlobalMediaAssets(directory);
    expect(assets).toHaveLength(3);
    expect(assets.find((asset) => asset.url === "/api/assets/old.mp4")?.usedBy).toHaveLength(1);
    expect(assets.find((asset) => asset.url === "https://www.youtube.com/watch?v=4cQWJViybAQ")?.usedBy[0]).toContain("recommendedVideos");
  });

  it("updates every course reference when an administrator replaces a media URL", async () => {
    const directory = await createWorkspace();
    const result = await replaceMediaEverywhere(directory, "/api/assets/old.mp4", "/api/assets/new.mp4");
    const course = JSON.parse(await fs.readFile(path.join(directory, "courses", "course.json"), "utf8"));
    expect(result.updatedCourses).toBe(1);
    expect(course.lessons[0].chapters[0].blocks[0].mp4Url).toBe("/api/assets/new.mp4");
  });

  it("prevents removal while a media reference is still used and allows removing unused metadata", async () => {
    const directory = await createWorkspace();
    await saveMediaMetadata(directory, { url: "/api/assets/old.mp4", title: "Ancienne vidéo", kind: "video" });
    await saveMediaMetadata(directory, { url: "/api/assets/unreferenced.pdf", title: "PDF isolé", kind: "pdf" });
    await expect(removeUnusedMediaMetadata(directory, "/api/assets/old.mp4")).resolves.toMatchObject({ success: false, usageCount: 1 });
    await expect(removeUnusedMediaMetadata(directory, "/api/assets/unreferenced.pdf")).resolves.toMatchObject({ success: true });
  });
});
