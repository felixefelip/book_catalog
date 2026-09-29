import { createInertiaApp, router } from "@inertiajs/react";
import { toast } from "sonner";

import AppLayout from "@/layouts/app_layout";
import { changeLocale } from "@/lib/i18n";

import "./application.css";

router.on("flash", (event) => {
  const { notice, alert } = event.detail.flash;
  if (notice) toast.success(notice);
  if (alert) toast.error(alert);
});

void createInertiaApp({
  pages: "../pages",

  layout: () => AppLayout,

  strictMode: true,

  withApp: (app, { page }) => {
    changeLocale(page.props.locale);
    return app;
  },

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    visitOptions: () => {
      return { queryStringArrayFormat: "brackets" };
    },
  },
}).catch((error) => {
  // This ensures this entrypoint is only loaded on Inertia pages
  // by checking for the presence of the root element (#app by default).
  // Feel free to remove this `catch` if you don't need it.
  if (document.getElementById("app")) {
    throw error;
  } else {
    console.error(
      "Missing root element.\n\n" +
        "If you see this error, it probably means you loaded Inertia.js on non-Inertia pages.\n" +
        'Consider moving <%= vite_typescript_tag "inertia.tsx" %> to the Inertia-specific layout instead.',
    );
  }
});
