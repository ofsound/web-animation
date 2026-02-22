import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "../lib/auth-client";
import { DemoPreviewFrame } from "./DemoPreviewFrame";
import {
  clearDraftFromStorage,
  draftToPublishBody,
  readDraftFromStorage,
  serializeDraft,
  toDemoDraft,
  writeDraftToStorage,
} from "./drafts";
import type { AdminUser, DemoCategory, DemoDraft, DemoFileKind, DemoRecord } from "./types";
import { FILE_KIND_LABEL, FILE_KIND_ORDER } from "./types";

type SessionResponse = { user: AdminUser };
type CategoriesResponse = { categories: DemoCategory[] };
type DemosResponse = { demos: DemoRecord[] };
type CategoryResponse = { category: DemoCategory };
type DemoResponse = { demo: DemoRecord };
type ReorderDirection = "up" | "down";
type CategoryFormState = {
  type: "css" | "tailwind";
  label: string;
  slug: string;
  icon: string;
  description: string;
};

const INITIAL_CATEGORY_FORM: CategoryFormState = {
  type: "tailwind" as const,
  label: "",
  slug: "",
  icon: "layers",
  description: "",
};

const DEFAULT_NEW_DEMO_HTML =
  "<button class=\"rounded-xl bg-accent-brand px-4 py-2 font-semibold text-text-inverse\">\n  Demo action\n</button>";

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const hasBody = init?.body !== undefined;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const json = (await response.json()) as { error?: unknown };
      if (typeof json.error === "string") {
        message = json.error;
      } else if (json.error) {
        message = JSON.stringify(json.error);
      }
    } catch {
      // Keep default status message when body is unavailable.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

function createDefaultFiles() {
  return FILE_KIND_ORDER.map((fileKind) => ({
    fileKind,
    content:
      fileKind === "html"
        ? DEFAULT_NEW_DEMO_HTML
        : fileKind === "meta"
          ? "{}"
          : "",
  }));
}

function compareSort(a: { sortOrder: number }, b: { sortOrder: number }): number {
  return a.sortOrder - b.sortOrder;
}

export default function AdminApp() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [categories, setCategories] = useState<DemoCategory[]>([]);
  const [demos, setDemos] = useState<DemoRecord[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const [signInEmail, setSignInEmail] = useState("ben@modernthings.net");
  const [signInPassword, setSignInPassword] = useState("");

  const [newCategoryForm, setNewCategoryForm] =
    useState<CategoryFormState>(INITIAL_CATEGORY_FORM);
  const [categoryDraft, setCategoryDraft] = useState<{
    label: string;
    slug: string;
    icon: string;
    description: string;
  } | null>(null);

  const [newDemoTitle, setNewDemoTitle] = useState("");
  const [demoDraft, setDemoDraft] = useState<DemoDraft | null>(null);
  const [activeFileKind, setActiveFileKind] = useState<DemoFileKind>("html");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const demosForSelectedCategory = useMemo(() => {
    if (!selectedCategoryId) return [];
    return demos
      .filter((demo) => demo.categoryId === selectedCategoryId)
      .slice()
      .sort(compareSort);
  }, [demos, selectedCategoryId]);

  const selectedDemo = useMemo(
    () => demos.find((demo) => demo.id === selectedDemoId) ?? null,
    [demos, selectedDemoId],
  );

  const publishedDraftSnapshot = useMemo(
    () => (selectedDemo ? serializeDraft(toDemoDraft(selectedDemo)) : null),
    [selectedDemo],
  );

  const draftSnapshot = useMemo(
    () => (demoDraft ? serializeDraft(demoDraft) : null),
    [demoDraft],
  );

  const draftDirty = useMemo(() => {
    if (!publishedDraftSnapshot || !draftSnapshot) return false;
    return publishedDraftSnapshot !== draftSnapshot;
  }, [draftSnapshot, publishedDraftSnapshot]);

  const tailwindCategories = useMemo(
    () => categories.filter((category) => category.type === "tailwind").slice().sort(compareSort),
    [categories],
  );

  const cssCategories = useMemo(
    () => categories.filter((category) => category.type === "css").slice().sort(compareSort),
    [categories],
  );

  const runAction = useCallback(async (actionName: string, action: () => Promise<void>) => {
    setBusyAction(actionName);
    setError(null);
    setNotice(null);

    try {
      await action();
    } catch (actionError) {
      setError(toErrorMessage(actionError));
    } finally {
      setBusyAction(null);
    }
  }, []);

  const refreshData = useCallback(
    async (preferred?: { categoryId?: string | null; demoId?: string | null }) => {
      setRefreshing(true);
      try {
        const [categoriesResponse, demosResponse] = await Promise.all([
          apiRequest<CategoriesResponse>("/api/admin/categories"),
          apiRequest<DemosResponse>("/api/admin/demos"),
        ]);

        const nextCategories = categoriesResponse.categories;
        const nextDemos = demosResponse.demos;
        setCategories(nextCategories);
        setDemos(nextDemos);

        const preferredCategoryId =
          preferred?.categoryId ?? selectedCategoryId ?? nextCategories[0]?.id ?? null;
        const resolvedCategoryId = nextCategories.some((c) => c.id === preferredCategoryId)
          ? preferredCategoryId
          : nextCategories[0]?.id ?? null;
        setSelectedCategoryId(resolvedCategoryId);

        const demosInResolvedCategory = resolvedCategoryId
          ? nextDemos
              .filter((demo) => demo.categoryId === resolvedCategoryId)
              .slice()
              .sort(compareSort)
          : [];
        const preferredDemoId = preferred?.demoId ?? selectedDemoId ?? demosInResolvedCategory[0]?.id ?? null;
        const resolvedDemoId = demosInResolvedCategory.some((demo) => demo.id === preferredDemoId)
          ? preferredDemoId
          : demosInResolvedCategory[0]?.id ?? null;
        setSelectedDemoId(resolvedDemoId);
      } finally {
        setRefreshing(false);
      }
    },
    [selectedCategoryId, selectedDemoId],
  );

  useEffect(() => {
    let ignore = false;

    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionResponse = await fetch("/api/admin/session", {
          credentials: "include",
        });

        if (ignore) return;

        if (sessionResponse.status === 401) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (!sessionResponse.ok) {
          throw new Error(`Session check failed (${sessionResponse.status})`);
        }

        const session = (await sessionResponse.json()) as SessionResponse;
        if (ignore) return;

        setUser(session.user);
        await refreshData();
      } catch (initError) {
        if (!ignore) {
          setError(toErrorMessage(initError));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void initialize();
    return () => {
      ignore = true;
    };
  }, [refreshData]);

  useEffect(() => {
    if (!selectedCategory) {
      setCategoryDraft(null);
      return;
    }

    setCategoryDraft({
      label: selectedCategory.label,
      slug: selectedCategory.slug,
      icon: selectedCategory.icon,
      description: selectedCategory.description,
    });
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedDemo) {
      setDemoDraft(null);
      return;
    }

    const cached = readDraftFromStorage(selectedDemo.id);
    setDemoDraft(cached ?? toDemoDraft(selectedDemo));
    setActiveFileKind("html");
  }, [selectedDemo]);

  useEffect(() => {
    if (!selectedDemoId || !demoDraft) return;
    writeDraftToStorage(selectedDemoId, demoDraft);
  }, [demoDraft, selectedDemoId]);

  const setDraftField = useCallback(
    (field: Exclude<keyof DemoDraft, "files">, value: string) => {
      setDemoDraft((current) => {
        if (!current) return current;
        return {
          ...current,
          [field]: value,
        };
      });
    },
    [],
  );

  const setDraftFile = useCallback((fileKind: DemoFileKind, content: string) => {
    setDemoDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        files: {
          ...current.files,
          [fileKind]: content,
        },
      };
    });
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await runAction("signin", async () => {
      const result = await authClient.signIn.email({
        email: signInEmail,
        password: signInPassword,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to sign in");
      }

      const session = await apiRequest<SessionResponse>("/api/admin/session");
      setUser(session.user);
      setSignInPassword("");
      await refreshData();
      setNotice("Signed in.");
    });
  };

  const handleSignOut = async () => {
    await runAction("signout", async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message ?? "Unable to sign out");
      }

      setUser(null);
      setCategories([]);
      setDemos([]);
      setSelectedCategoryId(null);
      setSelectedDemoId(null);
      setCategoryDraft(null);
      setDemoDraft(null);
      setNotice("Signed out.");
    });
  };

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await runAction("create-category", async () => {
      const response = await apiRequest<CategoryResponse>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          type: newCategoryForm.type,
          label: newCategoryForm.label,
          slug: newCategoryForm.slug || undefined,
          icon: newCategoryForm.icon,
          description: newCategoryForm.description,
        }),
      });

      setNewCategoryForm((current) => ({
        ...current,
        label: "",
        slug: "",
        description: "",
      }));

      await refreshData({ categoryId: response.category.id });
      setNotice(`Created category: ${response.category.label}`);
    });
  };

  const handleSaveCategory = async () => {
    if (!selectedCategory || !categoryDraft) return;

    await runAction("save-category", async () => {
      await apiRequest<CategoryResponse>(`/api/admin/categories/${selectedCategory.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          label: categoryDraft.label,
          slug: categoryDraft.slug,
          icon: categoryDraft.icon,
          description: categoryDraft.description,
        }),
      });

      await refreshData({ categoryId: selectedCategory.id, demoId: selectedDemoId });
      setNotice("Category updated.");
    });
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    const confirmed = window.confirm(
      `Delete category "${selectedCategory.label}"? This only works when no demos remain in it.`,
    );
    if (!confirmed) return;

    await runAction("delete-category", async () => {
      await apiRequest<{ success: boolean }>(`/api/admin/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });

      await refreshData();
      setNotice("Category deleted.");
    });
  };

  const handleMoveCategory = async (direction: ReorderDirection) => {
    if (!selectedCategory) return;

    const pool = categories
      .filter((category) => category.type === selectedCategory.type)
      .slice()
      .sort(compareSort);

    const currentIndex = pool.findIndex((category) => category.id === selectedCategory.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pool.length) return;

    const reordered = pool.slice();
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    await runAction("move-category", async () => {
      await apiRequest<{ success: boolean }>("/api/admin/categories/reorder", {
        method: "POST",
        body: JSON.stringify({
          type: selectedCategory.type,
          orderedIds: reordered.map((category) => category.id),
        }),
      });

      await refreshData({ categoryId: selectedCategory.id, demoId: selectedDemoId });
      setNotice("Category order updated.");
    });
  };

  const handleCreateDemo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCategoryId || !newDemoTitle.trim()) return;

    await runAction("create-demo", async () => {
      const response = await apiRequest<DemoResponse>("/api/admin/demos", {
        method: "POST",
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          title: newDemoTitle.trim(),
          files: createDefaultFiles(),
        }),
      });

      setNewDemoTitle("");
      await refreshData({
        categoryId: response.demo.categoryId,
        demoId: response.demo.id,
      });
      setNotice(`Created demo: ${response.demo.title}`);
    });
  };

  const handleDeleteDemo = async () => {
    if (!selectedDemo) return;
    const confirmed = window.confirm(`Delete demo "${selectedDemo.title}"?`);
    if (!confirmed) return;

    await runAction("delete-demo", async () => {
      await apiRequest<{ success: boolean }>(`/api/admin/demos/${selectedDemo.id}`, {
        method: "DELETE",
      });

      clearDraftFromStorage(selectedDemo.id);
      await refreshData({ categoryId: selectedCategoryId });
      setNotice("Demo deleted.");
    });
  };

  const handleMoveDemo = async (direction: ReorderDirection) => {
    if (!selectedCategoryId || !selectedDemo) return;

    const ordered = demosForSelectedCategory;
    const currentIndex = ordered.findIndex((demo) => demo.id === selectedDemo.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    const reordered = ordered.slice();
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    await runAction("move-demo", async () => {
      await apiRequest<{ success: boolean }>("/api/admin/demos/reorder", {
        method: "POST",
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          orderedIds: reordered.map((demo) => demo.id),
        }),
      });

      await refreshData({ categoryId: selectedCategoryId, demoId: selectedDemo.id });
      setNotice("Demo order updated.");
    });
  };

  const handleResetDraft = () => {
    if (!selectedDemo) return;
    clearDraftFromStorage(selectedDemo.id);
    setDemoDraft(toDemoDraft(selectedDemo));
    setNotice("Draft reset to published version.");
  };

  const handlePublishDemo = async () => {
    if (!selectedDemo || !demoDraft) return;

    await runAction("publish-demo", async () => {
      const response = await apiRequest<DemoResponse>(
        `/api/admin/demos/${selectedDemo.id}/publish`,
        {
          method: "POST",
          body: JSON.stringify(draftToPublishBody(demoDraft)),
        },
      );

      clearDraftFromStorage(selectedDemo.id);
      await refreshData({
        categoryId: response.demo.categoryId,
        demoId: response.demo.id,
      });
      setNotice(`Published "${response.demo.title}".`);
    });
  };

  if (loading) {
    return (
      <main className="bg-app-bg text-text-primary min-h-screen p-6 sm:p-10">
        <p className="font-mono text-sm">Loading admin…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-app-bg text-text-primary min-h-screen p-6 sm:p-10">
        <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-6">
          <h1 className="text-xl font-semibold">Admin Sign In</h1>
          <p className="text-text-secondary text-sm">
            Sign in with the seeded admin account to manage demos.
          </p>

          <form onSubmit={handleSignIn} className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span>Email</span>
              <input
                type="email"
                value={signInEmail}
                onChange={(event) => setSignInEmail(event.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-control px-3 py-2"
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span>Password</span>
              <input
                type="password"
                value={signInPassword}
                onChange={(event) => setSignInPassword(event.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-control px-3 py-2"
                required
              />
            </label>

            <button
              type="submit"
              disabled={busyAction !== null}
              className="w-full rounded-lg bg-accent-brand px-4 py-2 font-semibold text-text-inverse disabled:opacity-50"
            >
              {busyAction === "signin" ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {error ? (
            <p className="rounded-lg border border-status-error/40 bg-status-error/10 px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="bg-app-bg text-text-primary min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3">
        <div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">Demo Admin</h1>
          <p className="text-text-secondary text-xs sm:text-sm">
            Signed in as {user.email}
            {refreshing ? " · syncing" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void runAction("refresh", async () => {
                await refreshData({ categoryId: selectedCategoryId, demoId: selectedDemoId });
                setNotice("Data refreshed.");
              });
            }}
            disabled={busyAction !== null}
            className="rounded-lg border border-border-subtle bg-surface-control px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSignOut();
            }}
            disabled={busyAction !== null}
            className="rounded-lg border border-border-subtle bg-surface-control px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            Sign Out
          </button>
        </div>
      </header>

      {error ? (
        <p className="mb-4 rounded-lg border border-status-error/40 bg-status-error/10 px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mb-4 rounded-lg border border-status-success/40 bg-status-success/10 px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[330px_330px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-card p-4">
          <h2 className="text-base font-semibold">Categories</h2>

          <form onSubmit={handleCreateCategory} className="space-y-2 rounded-lg border border-border-subtle p-3">
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
              Create category
            </p>
            <select
              value={newCategoryForm.type}
              onChange={(event) =>
                setNewCategoryForm((current) => ({
                  ...current,
                  type: event.target.value as "css" | "tailwind",
                }))
              }
              className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
            >
              <option value="tailwind">Tailwind</option>
              <option value="css">CSS</option>
            </select>
            <input
              value={newCategoryForm.label}
              onChange={(event) =>
                setNewCategoryForm((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Label"
              className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
              required
            />
            <input
              value={newCategoryForm.slug}
              onChange={(event) =>
                setNewCategoryForm((current) => ({ ...current, slug: event.target.value }))
              }
              placeholder="Slug (optional)"
              className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
            />
            <input
              value={newCategoryForm.icon}
              onChange={(event) =>
                setNewCategoryForm((current) => ({ ...current, icon: event.target.value }))
              }
              placeholder="Icon"
              className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
            />
            <textarea
              value={newCategoryForm.description}
              onChange={(event) =>
                setNewCategoryForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Description"
              rows={2}
              className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={busyAction !== null}
              className="w-full rounded-md bg-accent-brand px-2 py-1.5 text-sm font-semibold text-text-inverse disabled:opacity-50"
            >
              Create
            </button>
          </form>

          <div className="space-y-3">
            <div>
              <p className="text-text-tertiary mb-1 text-[11px] font-semibold uppercase tracking-wide">
                Tailwind
              </p>
              <div className="space-y-1">
                {tailwindCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                    }}
                    className={`w-full rounded-md border px-2 py-1.5 text-left text-sm ${
                      selectedCategoryId === category.id
                        ? "border-accent-brand bg-accent-soft text-text-primary"
                        : "border-border-subtle bg-surface-control text-text-secondary"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-text-tertiary mb-1 text-[11px] font-semibold uppercase tracking-wide">
                CSS
              </p>
              <div className="space-y-1">
                {cssCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                    }}
                    className={`w-full rounded-md border px-2 py-1.5 text-left text-sm ${
                      selectedCategoryId === category.id
                        ? "border-accent-brand bg-accent-soft text-text-primary"
                        : "border-border-subtle bg-surface-control text-text-secondary"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedCategory && categoryDraft ? (
            <div className="space-y-2 rounded-lg border border-border-subtle p-3">
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                Edit selected category
              </p>
              <input
                value={categoryDraft.label}
                onChange={(event) =>
                  setCategoryDraft((current) =>
                    current ? { ...current, label: event.target.value } : current,
                  )
                }
                className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
              />
              <input
                value={categoryDraft.slug}
                onChange={(event) =>
                  setCategoryDraft((current) =>
                    current ? { ...current, slug: event.target.value } : current,
                  )
                }
                className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
              />
              <input
                value={categoryDraft.icon}
                onChange={(event) =>
                  setCategoryDraft((current) =>
                    current ? { ...current, icon: event.target.value } : current,
                  )
                }
                className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
              />
              <textarea
                rows={2}
                value={categoryDraft.description}
                onChange={(event) =>
                  setCategoryDraft((current) =>
                    current ? { ...current, description: event.target.value } : current,
                  )
                }
                className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void handleMoveCategory("up");
                  }}
                  disabled={busyAction !== null}
                  className="rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm disabled:opacity-50"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleMoveCategory("down");
                  }}
                  disabled={busyAction !== null}
                  className="rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm disabled:opacity-50"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSaveCategory();
                  }}
                  disabled={busyAction !== null}
                  className="rounded-md bg-accent-brand px-2 py-1.5 text-sm font-semibold text-text-inverse disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleDeleteCategory();
                  }}
                  disabled={busyAction !== null}
                  className="rounded-md border border-status-error/60 bg-status-error/10 px-2 py-1.5 text-sm text-status-error disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-card p-4">
          <h2 className="text-base font-semibold">Demos</h2>

          {selectedCategoryId ? (
            <form onSubmit={handleCreateDemo} className="space-y-2 rounded-lg border border-border-subtle p-3">
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                Create demo in category
              </p>
              <input
                value={newDemoTitle}
                onChange={(event) => setNewDemoTitle(event.target.value)}
                placeholder="Demo title"
                className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm"
                required
              />
              <button
                type="submit"
                disabled={busyAction !== null}
                className="w-full rounded-md bg-accent-brand px-2 py-1.5 text-sm font-semibold text-text-inverse disabled:opacity-50"
              >
                Create demo
              </button>
            </form>
          ) : (
            <p className="rounded-md border border-border-subtle bg-surface-control px-3 py-2 text-sm text-text-secondary">
              Select a category to create demos.
            </p>
          )}

          <div className="space-y-1">
            {demosForSelectedCategory.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => {
                  setSelectedDemoId(demo.id);
                }}
                className={`w-full rounded-md border px-2 py-2 text-left text-sm ${
                  selectedDemoId === demo.id
                    ? "border-accent-brand bg-accent-soft text-text-primary"
                    : "border-border-subtle bg-surface-control text-text-secondary"
                }`}
              >
                <div className="font-semibold">{demo.title}</div>
                <div className="text-text-tertiary text-xs">#{demo.sortOrder + 1}</div>
              </button>
            ))}
            {demosForSelectedCategory.length === 0 ? (
              <p className="rounded-md border border-border-subtle bg-surface-control px-3 py-2 text-sm text-text-secondary">
                No demos in this category.
              </p>
            ) : null}
          </div>

          {selectedDemo ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  void handleMoveDemo("up");
                }}
                disabled={busyAction !== null}
                className="rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm disabled:opacity-50"
              >
                Move up
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleMoveDemo("down");
                }}
                disabled={busyAction !== null}
                className="rounded-md border border-border-subtle bg-surface-control px-2 py-1.5 text-sm disabled:opacity-50"
              >
                Move down
              </button>
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-card p-4">
          <h2 className="text-base font-semibold">Editor</h2>

          {!selectedDemo || !demoDraft ? (
            <p className="rounded-md border border-border-subtle bg-surface-control px-3 py-2 text-sm text-text-secondary">
              Select a demo to edit and publish.
            </p>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-text-secondary">Title</span>
                  <input
                    value={demoDraft.title}
                    onChange={(event) => setDraftField("title", event.target.value)}
                    className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-text-secondary">Slug</span>
                  <input
                    value={demoDraft.slug}
                    onChange={(event) => setDraftField("slug", event.target.value)}
                    className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-text-secondary">Category</span>
                  <select
                    value={demoDraft.categoryId}
                    onChange={(event) => setDraftField("categoryId", event.target.value)}
                    className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5"
                  >
                    {categories
                      .slice()
                      .sort((a, b) =>
                        a.type === b.type
                          ? compareSort(a, b)
                          : a.type.localeCompare(b.type),
                      )
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.type} · {category.label}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-text-secondary">Difficulty</span>
                  <input
                    value={demoDraft.difficulty}
                    onChange={(event) => setDraftField("difficulty", event.target.value)}
                    className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5"
                  />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span className="text-text-secondary">Support</span>
                  <input
                    value={demoDraft.support}
                    onChange={(event) => setDraftField("support", event.target.value)}
                    className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5"
                  />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span className="text-text-secondary">Description</span>
                  <textarea
                    value={demoDraft.description}
                    onChange={(event) => setDraftField("description", event.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-border-subtle bg-surface-control px-2 py-1.5"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {FILE_KIND_ORDER.map((fileKind) => (
                    <button
                      key={fileKind}
                      type="button"
                      onClick={() => setActiveFileKind(fileKind)}
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                        activeFileKind === fileKind
                          ? "border-accent-brand bg-accent-soft text-text-primary"
                          : "border-border-subtle bg-surface-control text-text-secondary"
                      }`}
                    >
                      {FILE_KIND_LABEL[fileKind]}
                    </button>
                  ))}
                </div>
                <textarea
                  value={demoDraft.files[activeFileKind]}
                  onChange={(event) => setDraftFile(activeFileKind, event.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full rounded-lg border border-border-subtle bg-surface-control px-3 py-2 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void handlePublishDemo();
                  }}
                  disabled={busyAction !== null || !draftDirty}
                  className="rounded-md bg-accent-brand px-3 py-2 text-sm font-semibold text-text-inverse disabled:opacity-50"
                >
                  {busyAction === "publish-demo" ? "Publishing…" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={handleResetDraft}
                  disabled={busyAction !== null || !draftDirty}
                  className="rounded-md border border-border-subtle bg-surface-control px-3 py-2 text-sm disabled:opacity-50"
                >
                  Reset draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleDeleteDemo();
                  }}
                  disabled={busyAction !== null}
                  className="rounded-md border border-status-error/60 bg-status-error/10 px-3 py-2 text-sm text-status-error disabled:opacity-50"
                >
                  Delete demo
                </button>
                <span className="text-text-tertiary text-xs">
                  {draftDirty ? "Unpublished changes" : "Draft matches published"}
                </span>
              </div>

              <DemoPreviewFrame draft={demoDraft} />
              <p className="text-text-tertiary text-xs">
                Preview runs in an isolated iframe (`allow-scripts` only) with CSP
                `connect-src 'none'` and runtime network API blocking.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
