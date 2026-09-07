import { describe, expect, it, vi } from "vitest";
import { RETIRED_PUBLIC_EXAM_ASSET_PATHS, registerExamAssetRevocations } from "./examAssetRevocation";

describe("révocation des assets publics d’examen", () => {
  it("retire les deux anciennes URLs avec une réponse non mise en cache", () => {
    let paths: readonly string[] = [];
    let handler: ((req: unknown, res: any) => void) | undefined;
    registerExamAssetRevocations({
      all: (registeredPaths: readonly string[], registeredHandler: any) => {
        paths = registeredPaths;
        handler = registeredHandler;
        return {} as any;
      },
    } as any);

    expect(paths).toEqual(RETIRED_PUBLIC_EXAM_ASSET_PATHS);
    const res = {
      status: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    handler?.({}, res);
    expect(res.status).toHaveBeenCalledWith(410);
    expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store, max-age=0");
    expect(res.send).toHaveBeenCalledWith("This resource is no longer available.");
  });
});
