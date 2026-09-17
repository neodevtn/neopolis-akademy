import { describe, expect, it, vi } from "vitest";
import { DEPLOYMENT_HEALTH_PATH, mayUseAlternatePort, registerDeploymentHealthRoute, resolveHostingPort } from "./deploymentHealth";

describe("deployment health configuration", () => {
  it("uses a valid root-relative healthcheck path", () => {
    expect(DEPLOYMENT_HEALTH_PATH).toBe("/healthz");
    expect(DEPLOYMENT_HEALTH_PATH.startsWith("/")).toBe(true);
  });

  it("returns an immediate, dependency-free JSON liveness response", () => {
    let handler: ((req: unknown, res: any) => void) | undefined;
    const app = { get: vi.fn((_path: string, registeredHandler: any) => { handler = registeredHandler; }) };
    const json = vi.fn();
    const set = vi.fn(() => ({ json }));
    const status = vi.fn(() => ({ set }));

    registerDeploymentHealthRoute(app as any);
    expect(app.get).toHaveBeenCalledWith(DEPLOYMENT_HEALTH_PATH, expect.any(Function));
    handler?.({}, { status });

    expect(status).toHaveBeenCalledWith(200);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ "Cache-Control": "no-store, max-age=0", "Content-Type": "application/json; charset=utf-8" }));
    expect(json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("uses the hosting-injected port strictly outside development", () => {
    expect(resolveHostingPort("8080")).toBe(8080);
    expect(resolveHostingPort("not-a-port")).toBe(3000);
    expect(mayUseAlternatePort("production")).toBe(false);
    expect(mayUseAlternatePort("development")).toBe(true);
  });
});
