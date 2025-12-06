// app/control-panel/posts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import Loading from "@/components/Loading";
import PostModal from "@/components/posts/PostModal";

type Post = {
  id: number;
  title: string;
  content: string;
  author_id: string;
  role: string;
  status: string;
  created_at: string;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [userRole, setUserRole] = useState("subscriber");

  const fetchData = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

      const [roleRes, postsRes] = await Promise.all([
        fetch("/api/users/get-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        }),
        fetch("/api/posts/list", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const roleData = await roleRes.json();
      setUserRole(roleData.role || "subscriber");

      const postsData = await postsRes.json();
      if (!postsRes.ok) throw new Error(postsData.error);
      setPosts(postsData.posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setShowPostModal(true);
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setShowPostModal(true);
  };

  const savePost = async (post: Partial<Post>) => {
    try {
      setUpdating(true);

      const token = await auth.currentUser?.getIdToken();
      const isEdit = !!post.id;

      if (!isEdit) {
        post.author_id = auth.currentUser?.uid || "";
        post.role = userRole;
      }

      const res = await fetch(isEdit ? "/api/posts/update" : "/api/posts/create", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts(
        isEdit
          ? posts.map((p) => (p.id === post.id ? data.post : p))
          : [data.post, ...posts]
      );

      setShowPostModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      setUpdating(true);
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-5 bg-white border border-gray-200 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Post Management</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Post
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4">
        {posts.length === 0 && <p className="text-gray-500">No posts found.</p>}

        {posts.map((post) => (
          <div key={post.id} className="border p-4 bg-gray-50 flex justify-between">
            <div>
              <h2 className="font-bold">{post.title}</h2>
              <p className="text-sm text-gray-600">
                {post.role} • {post.status} •{" "}
                {new Date(post.created_at).toLocaleString()}
              </p>
              <p>{post.content.substring(0, 120)}...</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => openEditModal(post)}
                className="px-3 py-1 bg-yellow-400"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(post.id)}
                className="px-3 py-1 bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPostModal && (
        <PostModal
          post={editingPost}
          onClose={() => setShowPostModal(false)}
          onSave={savePost}
          canCreateCategory={false}
        />
      )}
    </div>
  );
}
