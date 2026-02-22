import { describe, expect, it } from "vitest";
import { matchAdminRoute, toNodeHeaderMap } from "./adminDispatcher.js";

describe("matchAdminRoute", () => {
  it("matches supported admin routes and methods", () => {
    const cases: Array<{
      method: string;
      pathname: string;
      key: string;
      id?: string;
    }> = [
      { method: "POST", pathname: "/api/admin/sign-in", key: "sign-in" },
      { method: "POST", pathname: "/api/admin/sign-out", key: "sign-out" },
      { method: "GET", pathname: "/api/admin/session", key: "session" },
      { method: "GET", pathname: "/api/admin/categories", key: "categories" },
      { method: "POST", pathname: "/api/admin/categories", key: "categories" },
      {
        method: "POST",
        pathname: "/api/admin/categories/reorder",
        key: "categories-reorder",
      },
      {
        method: "PATCH",
        pathname: "/api/admin/categories/cat_1",
        key: "category-by-id",
        id: "cat_1",
      },
      {
        method: "DELETE",
        pathname: "/api/admin/categories/cat_1",
        key: "category-by-id",
        id: "cat_1",
      },
      { method: "GET", pathname: "/api/admin/demos", key: "demos" },
      { method: "POST", pathname: "/api/admin/demos", key: "demos" },
      {
        method: "POST",
        pathname: "/api/admin/demos/reorder",
        key: "demos-reorder",
      },
      {
        method: "PATCH",
        pathname: "/api/admin/demos/demo_1",
        key: "demo-by-id",
        id: "demo_1",
      },
      {
        method: "DELETE",
        pathname: "/api/admin/demos/demo_1",
        key: "demo-by-id",
        id: "demo_1",
      },
      {
        method: "POST",
        pathname: "/api/admin/demos/demo_1/delete",
        key: "demo-delete-legacy",
        id: "demo_1",
      },
      {
        method: "PUT",
        pathname: "/api/admin/demos/demo_1/files",
        key: "demo-files",
        id: "demo_1",
      },
      {
        method: "POST",
        pathname: "/api/admin/demos/demo_1/publish",
        key: "demo-publish",
        id: "demo_1",
      },
    ];

    for (const testCase of cases) {
      const result = matchAdminRoute(testCase.method, testCase.pathname);
      expect(result.type).toBe("match");
      if (result.type !== "match") continue;
      expect(result.route.key).toBe(testCase.key);
      expect(result.route.params.id).toBe(testCase.id);
    }
  });

  it("normalizes trailing slash and returns method_not_allowed", () => {
    const result = matchAdminRoute("GET", "/api/admin/sign-in/");
    expect(result).toEqual({
      type: "method_not_allowed",
      allow: ["POST"],
    });
  });

  it("returns not_found for unknown routes", () => {
    expect(matchAdminRoute("GET", "/api/admin/unknown")).toEqual({
      type: "not_found",
    });
  });
});

describe("toNodeHeaderMap", () => {
  it("preserves multiple set-cookie headers for auth/session continuity", () => {
    const headers = new Headers();
    headers.append("set-cookie", "session=one; Path=/; HttpOnly");
    headers.append("set-cookie", "session=two; Path=/; HttpOnly");

    const mapped = toNodeHeaderMap(headers);
    expect(mapped.get("set-cookie")).toEqual([
      "session=one; Path=/; HttpOnly",
      "session=two; Path=/; HttpOnly",
    ]);
  });
});
