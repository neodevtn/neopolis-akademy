import { describe, expect, it } from "vitest";
import { parseInvitationEmails } from "./invitationEmails";

describe("parseInvitationEmails", () => {
  it("accepts semicolon and line-break separators while removing duplicates", () => {
    expect(parseInvitationEmails("ada@example.com; BOB@example.com\nada@example.com")).toEqual({
      emails: ["ada@example.com", "bob@example.com"],
      invalid: [],
      duplicates: ["ada@example.com"],
    });
  });

  it("keeps invalid tokens visible and does not silently submit them", () => {
    expect(parseInvitationEmails("valid@example.com; pas-un-email\n")).toEqual({
      emails: ["valid@example.com"],
      invalid: ["pas-un-email"],
      duplicates: [],
    });
  });
});
