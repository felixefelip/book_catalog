import { Link, usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { current_user } = usePage().props;

  return (
    <>
      <header className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-4 text-sm">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/" />}
        >
          {t("layout.home")}
        </Button>

        <div className="flex-1" />

        {current_user ? (
          <>
            <span className="text-muted-foreground">
              {current_user.name} {current_user.last_name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/session" method="delete" as="button" />}
            >
              {t("layout.sign_out")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/session/new" />}
            >
              {t("layout.sign_in")}
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/registration/new" />}
            >
              {t("layout.sign_up")}
            </Button>
          </>
        )}
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
