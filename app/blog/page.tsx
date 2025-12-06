// app/blog/page.tsx
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Pool } from "pg";
import truncate from "html-truncate"; // <-- import html-truncate

// Types
type Category = { id: number; name: string };
type User = { id: string; name: string; role?: string };
type Post = {
  id: number;
  title: string;
  content: string;
  slug: string;
  thumbnail?: string;
  created_at: string;
  categories?: Category[];
  author?: User;
};

// Use a single pool instance
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

// Fetch posts with category names and author info
async function getPosts(): Promise<Post[]> {
  const res = await pool.query(
    `SELECT p.id, p.title, p.content, p.slug, p.thumbnail, p.created_at, p.categories, p.author_id,
            u.name AS author_name, u.role AS author_role
     FROM posts p
     LEFT JOIN users u ON u.id = p.author_id
     WHERE p.status = 'published'
     ORDER BY p.created_at DESC`
  );

  const posts: Post[] = [];

  for (const row of res.rows) {
    // Fetch category names
    let categories: Category[] = [];
    if (row.categories && row.categories.length > 0) {
      const catRes = await pool.query(
        `SELECT id, name FROM categories WHERE id = ANY($1)`,
        [row.categories]
      );
      categories = catRes.rows;
    }

    const author: User = {
      id: row.author_id,
      name: row.author_name || "Unknown",
      role: row.author_role || undefined,
    };

    posts.push({
      ...row,
      categories,
      author,
    });
  }

  return posts;
}

// Server Component
export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>

        {posts.length === 0 && (
          <p className="text-center text-gray-500">No posts published yet.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 overflow-hidden shadow-sm flex flex-col"
            >
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4 flex flex-col flex-1 gap-2">
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-sm text-blue-600">
                    {post.categories.map((cat) => (
                      <span
                        key={`${post.id}-${cat.id}`}
                        className="bg-blue-100 px-2 py-0.5 rounded"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-xl font-semibold">{post.title}</h2>

                {post.author && (
                  <p className="text-gray-600 text-sm">
                    By <span className="font-medium">{post.author.name}</span>{" "}
                    {post.author.role && `(Role: ${post.author.role})`}
                  </p>
                )}

                <p className="text-gray-600 text-sm mb-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                {/* HTML-safe truncated content */}
                <div
                  className="text-gray-700 flex-1"
                  dangerouslySetInnerHTML={{
                    __html: truncate(post.content, 120, { ellipsis: "..." }),
                  }}
                />

                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-auto text-blue-600 hover:underline font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
