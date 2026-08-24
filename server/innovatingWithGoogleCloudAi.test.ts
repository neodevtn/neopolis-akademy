import course from "../client/public/data/courses/innovating_with_google_cloud_ai__01.json";
import { describe, expect, it } from "vitest";
describe("cours DataCamp Innover avec Google Cloud AI",()=>{it("préserve les activités et QCM interactifs",()=>{const a=course.lessons.flatMap((l:any)=>l.chapters);const b=a.flatMap((x:any)=>x.blocks||[]);expect(a).toHaveLength(23);expect(b.filter((x:any)=>x.type==="single_choice_exercise")).toHaveLength(12);expect(a.every((x:any)=>x.requiredBeforeAdvance)).toBe(true);expect(JSON.stringify(course)).not.toMatch(/datacamp\.com|\/manus-storage\//i);});});
