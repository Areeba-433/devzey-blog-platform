import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { getPostBySlugMongo } from '../../../../lib/posts-mongo';
import MarkdownRenderer from '../../../../components/MarkdownRenderer';
import UpvoteButton from '../../../../components/UpvoteButton';
import { ipFromXForwardedFor, voterIdFromIp } from '../../../../lib/voter';

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

function siteUrl() {
  return process.env.SITE_URL || 'http://localhost:3000';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlugMongo(params.slug);
  if (!post) return { title: 'Post not found' };

  const canonical = `${siteUrl()}/posts/${post.slug}`;
  const title = post.seoMetadata?.title || post.title;
  const description =
    post.seoMetadata?.description ||
    post.content.replace(/\s+/g, ' ').trim().slice(0, 180);
  const ogImage = post.seoMetadata?.ogImage;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlugMongo(params.slug);
  if (!post) {
    return (
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-8">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="mt-2 text-slate-300">Check the URL slug or publish the post in MongoDB.</p>
      </div>
    );
  }

  const canonical = `${siteUrl()}/posts/${post.slug}`;
  const xff = (await headers()).get('x-forwarded-for');
  const ip = ipFromXForwardedFor(xff) || '127.0.0.1';
  const voterId = voterIdFromIp(ip);
  const initiallyUpvoted = post.upvotes.includes(voterId);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seoMetadata?.description,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: [{ '@type': 'Person', name: post.author }],
    image: post.seoMetadata?.ogImage ? [post.seoMetadata.ogImage] : [],
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  return (
    <div className="space-y-6">
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{post.title}</h1>
        <div className="text-sm text-slate-400 flex flex-wrap items-center gap-2">
          <span>{post.author}</span>
          <span>·</span>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
          <span>·</span>
          <span>{post.upvoteCount} upvotes</span>
          <span className="ml-2">
            <UpvoteButton postId={post.id} initialCount={post.upvoteCount} initiallyUpvoted={initiallyUpvoted} />
          </span>
        </div>
      </header>

      <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-6 sm:p-8">
        <MarkdownRenderer value={post.content} className="prose prose-invert max-w-none" />
      </div>
    </div>
  );
}

