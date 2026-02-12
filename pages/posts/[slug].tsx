import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getPostBySlug } from '../../lib/posts';
import { getPlatformSettings } from '../../utils/platform-settings';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    return { notFound: true };
  }

  const settings = await getPlatformSettings();

  const title =
    post.seoTitle ||
    post.title ||
    settings.seoSettings.defaultMetaTitle ||
    settings.siteName;

  const description =
    post.seoDescription ||
    post.excerpt ||
    settings.seoSettings.defaultMetaDescription ||
    settings.siteDescription;

  const canonicalUrl =
    post.canonicalUrl || `${settings.siteUrl}/posts/${post.slug}`;

  const robots = post.noIndex ? 'noindex,nofollow' : 'index,follow';

  const ogTitle = post.socialTitle || title;
  const ogDescription = post.socialDescription || description;
  const ogImage = post.socialImage || post.featuredImage || '';

  const seo = {
    title,
    description,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    siteName: settings.siteName
  };

  return {
    props: {
      post,
      seo
    }
  };
};

export default function PostPage({ post, seo }: any) {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="robots" content={seo.robots} />
        <link rel="canonical" href={seo.canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seo.ogTitle} />
        <meta property="og:description" content={seo.ogDescription} />
        <meta property="og:url" content={seo.canonicalUrl} />
        {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:site_name" content={seo.siteName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.ogTitle} />
        <meta name="twitter:description" content={seo.ogDescription} />
        {seo.ogImage && (
          <meta name="twitter:image" content={seo.ogImage} />
        )}

        {/* Optional JSON-LD Structured Data */}
        {post.structuredData && (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(post.structuredData)
            }}
          />
        )}
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <article>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            By {post.author}{' '}
            {post.publishedAt &&
              `· ${new Date(post.publishedAt).toLocaleDateString()}`}
          </p>
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="mb-6 w-full rounded-md"
            />
          )}
          <div className="prose max-w-none">
            {post.content}
          </div>
        </article>
      </main>
    </>
  );
}


