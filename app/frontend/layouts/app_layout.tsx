import { Link, router, usePage } from "@inertiajs/react";
import { ChevronDown, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import AppearanceToggle from "@/components/appearance_toggle";
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
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { url, props } = usePage();
  const { current_user } = props;
  const path = url.split("?")[0];
  const isBooksList = path === "/" || path === "/books";

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 text-sm sm:px-6">
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

          <AppearanceToggle />

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
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
      <Toaster />
    </>
  );
}
