import Link from 'next/link';
import { searchPostsMongo } from '../../lib/search-mongo';

export const revalidate = 60;

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; tag?: string };
}) {
  const q = (searchParams?.q || '').trim();
  const tag = (searchParams?.tag || '').trim();
  const posts = await searchPostsMongo(q, { tag, limit: 50 });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Search</h1>
        <p className="text-slate-300 text-sm">Search posts by title, content, tags, or author.</p>
      </header>

      <form className="flex flex-col sm:flex-row gap-3" action="/search" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search posts…"
          className="flex-1 rounded-lg border border-slate-800/60 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          name="tag"
          defaultValue={tag}
          placeholder="Tag (optional)"
          className="sm:w-56 rounded-lg border border-slate-800/60 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white hover:bg-sky-400 transition-colors"
        >
          Search
        </button>
      </form>

      <section className="space-y-4">
        {q || tag ? (
          <div className="text-sm text-slate-400">
            Showing <span className="text-slate-200">{posts.length}</span> results
            {q ? (
              <>
                {' '}
                for <span className="text-slate-200">“{q}”</span>
              </>
            ) : null}
            {tag ? (
              <>
                {' '}
                in tag <span className="text-slate-200">“{tag}”</span>
              </>
            ) : null}
            .
          </div>
        ) : (
          <div className="text-sm text-slate-400">Type a query to start searching.</div>
        )}

        {posts.map((p) => (
          <article key={p.id} className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-5">
            <h2 className="text-lg font-semibold">
              <Link href={`/posts/${p.slug}`} className="hover:underline underline-offset-4">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-slate-300">{p.excerpt}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{p.author}</span>
              <span>·</span>
              <time dateTime={p.createdAt}>{new Date(p.createdAt).toLocaleDateString()}</time>
              <span>·</span>
              <span>{p.upvoteCount} upvotes</span>
              {p.tags.length > 0 && (
                <>
                  <span>·</span>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.slice(0, 5).map((t) => (
                      <Link
                        key={t}
                        href={`/search?tag=${encodeURIComponent(t)}`}
                        className="rounded-full border border-slate-800/60 px-2 py-0.5 text-slate-200 hover:border-slate-600"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </article>
        ))}

        {(q || tag) && posts.length === 0 ? (
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-8 text-slate-300">
            No results found.
          </div>
        ) : null}
      </section>
    </div>
  );
}

