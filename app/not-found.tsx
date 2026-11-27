import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";

export async function generateMetadata() {
  return { title: (await getMessages("not-found")).title };
}

export default async function NotFound() {
  const t = await getMessages("not-found");
  return (
    <section aria-labelledby="not-found-title" className="m-auto max-w-md px-4 py-12 text-center">
      <p className="text-7xl font-extrabold sm:text-8xl">404</p>
      <h1 id="not-found-title" className="mt-4 text-2xl font-semibold">{t.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.description}</p>
      <Button asChild className="mt-6 min-h-11"><Link href="/">{t.home}</Link></Button>
    </section>
  );
}
