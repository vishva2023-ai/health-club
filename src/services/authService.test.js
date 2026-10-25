import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ getFirebase: vi.fn() }));
const { ROLE_LABELS, isCampusEmail } = await import("./authService");

describe("roles and sign-up rules", () => {
  it("maps faculty and admin roles to the faculty portal", () => {
    expect(ROLE_LABELS.faculty).toBe("Admin / Faculty");
    expect(ROLE_LABELS.admin).toBe("Admin / Faculty");
  });
  it("maps board role to the board portal", () => {
    expect(ROLE_LABELS.board).toBe("Board member");
  });
  it("only accepts VIT campus emails for sign-up", () => {
    expect(isCampusEmail("a.b2023@vitstudent.ac.in")).toBe(true);
    expect(isCampusEmail("harish.y@vit.ac.in")).toBe(true);
    expect(isCampusEmail("someone@gmail.com")).toBe(false);
  });
});
