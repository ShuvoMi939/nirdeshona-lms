// app/not-found.tsx
import NothingFound from "@/components/NothingFound";

export default function NotFoundPage() {
  return (
    <NothingFound
      message="404 — Page Not Found"
      linkText="Go to Home"
      linkHref="/"
    />
  );
}
