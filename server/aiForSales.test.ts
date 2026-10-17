import course from "../client/public/data/courses/ai_for_sales__01.json";
import { describe, expect, it } from "vitest";

describe("cours DataCamp L’IA pour les ventes", () => {
  it("préserve compteurs, formats interactifs et médias locaux", () => {
    const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
    const blocks = activities.flatMap((activity: any) => activity.blocks || []);
    expect(activities).toHaveLength(22);
    expect(blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length)).toHaveLength(9);
    // Le TP de balisage qui exigeait call_transcript.pdf a été transformé en
    // contenu : aucun fichier source n'était disponible dans la médiathèque.
    expect(blocks.filter((block: any) => block.type === "cloud_exercise")).toHaveLength(7);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(2);
    expect(blocks.filter((block: any) => /choice_exercise/.test(block.type))).toHaveLength(2);
    const removedPracticalScreen = activities.find((activity: any) => activity.id === "dc_ch03_act05");
    expect(removedPracticalScreen).toMatchObject({ type: "content", requiredBeforeAdvance: false });
    expect(removedPracticalScreen.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "content", remediation: expect.objectContaining({ sourcePreserved: true }) }),
    ]));
    const removedCopilotPracticalScreen = activities.find((activity: any) => activity.id === "dc_ch03_act03");
    expect(removedCopilotPracticalScreen).toMatchObject({ type: "content", requiredBeforeAdvance: false });
    expect(removedCopilotPracticalScreen.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "dc_3_act_03_tp_learning_note", type: "content", remediation: expect.objectContaining({ sourcePreserved: true }) }),
    ]));
    expect(activities.filter((activity: any) => !["dc_ch03_act05", "dc_ch03_act03"].includes(activity.id)).every((activity: any) => activity.requiredBeforeAdvance)).toBe(true);
    expect(JSON.stringify(course)).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
