import { Link, router, usePage } from "@inertiajs/react";
import { ChevronDown, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { url, props } = usePage();
  const { current_user } = props;
  const path = url.split("?")[0];
  const isBooksList = path === "/" || path === "/books";

  return (
    <>
      <header className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-4 text-sm">
        <NavigationMenu aria-label={t("layout.main_navigation")}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                active={isBooksList}
                render={<Link href="/" />}
              >
                {t("layout.home")}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1" />

        {current_user ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              {current_user.name} {current_user.last_name}
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{current_user.email_address}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.delete("/session")}>
                <LogOut />
                {t("layout.sign_out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavigationMenu aria-label={t("layout.account")}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  active={path === "/session/new"}
                  render={<Link href="/session/new" />}
                >
                  {t("layout.sign_in")}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  active={path === "/registration/new"}
                  render={<Link href="/registration/new" />}
                >
                  {t("layout.sign_up")}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
