import { describe, expect, it } from "vitest";
import { isSchedulableCommunicationDate, toOneShotCommunicationCron } from "./communicationScheduling";

describe("communication scheduling", () => {
  it("builds a six-field UTC cron expression for the chosen date", () => {
    expect(toOneShotCommunicationCron(new Date("2026-12-03T14:05:00.000Z"))).toBe("0 5 14 3 12 *");
  });

  it("requires a date at least two minutes ahead and no more than twelve months away", () => {
    const now = new Date("2026-08-18T12:00:00.000Z").getTime();
    expect(isSchedulableCommunicationDate(new Date("2026-08-18T12:01:59.000Z"), now)).toBe(false);
    expect(isSchedulableCommunicationDate(new Date("2026-08-18T12:02:00.000Z"), now)).toBe(true);
    expect(isSchedulableCommunicationDate(new Date("2027-08-20T12:00:00.000Z"), now)).toBe(false);
  });
});
