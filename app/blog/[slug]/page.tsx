// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Pool } from "pg";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

type Category = { id: number; name: string };
type User = { id: string; name: string; role?: string };
type Post = {
  id: number;
  title: string;
  content: string;
  slug: string;
  thumbnail?: string;
  created_at?: string;
  categories?: Category[];
  author?: User;
};

async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.content, p.slug, p.thumbnail, p.created_at, p.categories, p.author_id, 
              u.name AS author_name, u.role AS author_role
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.slug = $1 AND p.status = 'published'
       LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    let categories: Category[] = [];
    if (row.categories && row.categories.length > 0) {
      const categoryResult = await pool.query(
        `SELECT id, name FROM categories WHERE id = ANY($1)`,
        [row.categories]
      );
      categories = categoryResult.rows;
    }

    const author: User = {
      id: row.author_id,
      name: row.author_name || "Unknown",
      role: row.author_role || undefined,
    };

    return { ...row, categories, author };
  } catch (err) {
    console.error(err);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center text-gray-700 font-medium">
              {post.title}
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>

        {post.created_at && (
          <p className="text-gray-600 text-sm mb-2">
            Published on {new Date(post.created_at).toLocaleDateString()}
          </p>
        )}

        {post.author && (
          <p className="text-gray-500 text-sm mb-4">
            By {post.author.name} {post.author.role ? `(${post.author.role})` : ""}
          </p>
        )}

        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((cat) => (
              <span
                key={`${post.id}-${cat.id}`}
                className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full max-h-96 object-cover rounded mb-6"
          />
        )}

        <div
          className="prose max-w-full"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>

      <Footer />
    </>
  );
}
