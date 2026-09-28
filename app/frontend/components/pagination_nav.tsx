import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import type { Pagination as PaginationData } from "@/types";

interface PaginationNavProps {
  pagination: PaginationData;
  path: string;
  params?: Record<string, string>;
}

function pageItems(current: number, total: number): (number | "ellipsis")[] {
  const pages = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  return pages.flatMap((page, index) =>
    index > 0 && page - pages[index - 1] > 1 ? ["ellipsis", page] : [page],
  );
}

export default function PaginationNav({ pagination, path, params = {} }: PaginationNavProps) {
  const { t } = useTranslation();
  const { current_page, total_pages } = pagination;

  if (total_pages <= 1) return null;

  const pageHref = (page: number) => {
    const query = new URLSearchParams({
      ...params,
      ...(page > 1 && { page: String(page) }),
    }).toString();

    return query ? `${path}?${query}` : path;
  };

  return (
    <Pagination aria-label={t("pagination.label")}>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            className="pl-1.5!"
            disabled={current_page === 1}
            aria-label={t("pagination.previous_label")}
            nativeButton={current_page === 1}
            render={current_page === 1 ? undefined : <Link href={pageHref(current_page - 1)} />}
          >
            <ChevronLeft data-icon="inline-start" />
            <span className="hidden sm:block">{t("pagination.previous")}</span>
          </Button>
        </PaginationItem>

        {pageItems(current_page, total_pages).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <Button
                variant={item === current_page ? "outline" : "ghost"}
                size="icon"
                aria-current={item === current_page ? "page" : undefined}
                aria-label={t("pagination.page", { page: item })}
                nativeButton={false}
                render={<Link href={pageHref(item)} />}
              >
                {item}
              </Button>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <Button
            variant="ghost"
            className="pr-1.5!"
            disabled={current_page === total_pages}
            aria-label={t("pagination.next_label")}
            nativeButton={current_page === total_pages}
            render={current_page === total_pages ? undefined : <Link href={pageHref(current_page + 1)} />}
          >
            <span className="hidden sm:block">{t("pagination.next")}</span>
            <ChevronRight data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
