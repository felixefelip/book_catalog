import "@testing-library/jest-dom/vitest";
import { config } from "@inertiajs/react";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import "@/lib/i18n";

vi.mock("@inertiajs/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@inertiajs/react")>()),
  Head: () => null,
}));

config.set("form.withAllErrors", true);

afterEach(cleanup);
