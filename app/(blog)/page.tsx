import Link from 'next/link';
import { getLatestPostsMongo } from '../../lib/posts-mongo';

export const revalidate = 60;

function excerptFromMarkdown(markdown: string, maxLen: number = 180) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trimEnd()}…`;
}

export default async function BlogHomePage() {
  const posts = await getLatestPostsMongo(20);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">DevZey Blog</h1>
        <p className="text-slate-300 max-w-2xl">
          Clean, developer-centric writing on building, shipping, and scaling products.
        </p>
      </div>

      <section className="grid gap-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold leading-snug">
                  <Link href={`/posts/${p.slug}`} className="hover:underline underline-offset-4">
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  {excerptFromMarkdown(p.content)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{p.author}</span>
                  <span>·</span>
                  <time dateTime={p.createdAt}>{new Date(p.createdAt).toLocaleDateString()}</time>
                  <span>·</span>
                  <span>{p.upvoteCount} upvotes</span>
                  {p.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full border border-slate-800/60 px-2 py-0.5 text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-8 text-slate-300">
            No posts yet. Once you add posts to MongoDB, they’ll appear here.
          </div>
        )}
      </section>
    </div>
  );
}

