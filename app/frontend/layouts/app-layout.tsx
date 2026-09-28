import { Link, usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { current_user } = usePage().props;

  return (
    <>
      {current_user && (
        <header className="mx-auto flex w-full max-w-4xl items-center justify-end gap-4 px-4 pt-4 text-sm">
          <span className="text-muted-foreground">
            {current_user.email_address}
          </span>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/session" method="delete" as="button" />}
          >
            {t("layout.sign_out")}
          </Button>
        </header>
      )}
      <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
