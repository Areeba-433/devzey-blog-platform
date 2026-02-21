import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { getPosts } from '../lib/posts';
import { getPlatformSettings } from '../utils/platform-settings';
import { Post } from '../types/post';

interface HomeProps {
  posts: Post[];
  settings: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
  };
}

export default function Home({ posts, settings }: HomeProps) {
  const title = settings.siteName;
  const description = settings.siteDescription;
  const canonicalUrl = settings.siteUrl;

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{settings.siteName}</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">{settings.siteDescription}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900">
                <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>By {post.author}</span>
                {post.publishedAt && (
                  <span>· {new Date(post.publishedAt).toLocaleDateString()}</span>
                )}
                <span>· {post.readingTime} min read</span>
              </div>
              <div className="mt-4">
                <Link href={`/posts/${post.slug}`} className="text-sm text-blue-600 hover:text-blue-700">
                  Read more →
                </Link>
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="col-span-full bg-white rounded-lg border p-10 text-center text-gray-600">
              No posts yet. Create one from the <Link href="/admin" className="text-blue-600 hover:underline">admin dashboard</Link>.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const settings = await getPlatformSettings();
  const posts = await getPosts({ published: true, sortBy: 'publishedAt', sortOrder: 'desc', limit: settings.postsPerPage });

  return {
    props: {
      posts,
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        siteUrl: settings.siteUrl,
      },
    },
  };
};


