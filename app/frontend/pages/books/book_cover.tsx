import { BookOpen } from "lucide-react";
import { cn } from "cn";

type BookCoverProps = {
  url: string | null;
  className?: string;
  iconClassName?: string;
};

export default function BookCover({ url, className, iconClassName }: BookCoverProps) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn("aspect-2/3 rounded-md object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-2/3 items-center justify-center rounded-md bg-muted text-muted-foreground",
        className,
      )}
    >
      <BookOpen aria-hidden="true" className={iconClassName} />
    </div>
  );
}
