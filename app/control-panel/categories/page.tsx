"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import CategoryModal from "@/components/posts/CategoryModal";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Loading from "@/components/Loading";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [role, setRole] = useState<string>("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await fetch("/api/categories/list");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) return;
      const token = await user.getIdTokenResult();
      setRole((token.claims.role as string) || "client");
    });

    return () => unsubscribe();
  }, []);

  if (role === "denied") return <p className="p-6 text-red-600">Access Denied.</p>;
  if (loading) return <Loading />;

  // Delete handlers
  const confirmDeleteCategory = (cat: any) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    const res = await fetch("/api/categories/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: categoryToDelete.id }),
    });

    const data = await res.json();
    if (!data.success) {
      alert("Delete failed: " + data.error);
      return;
    }

    setDeleteModalOpen(false);
    setCategoryToDelete(null);
    fetchCategories();
  };

  // Helper: Get full category path
  const getCategoryPath = (cat: any, allCats: any[]): string => {
    if (!cat.parent_id) return cat.name; // no parent
    const parent = allCats.find((c) => c.id === cat.parent_id);
    if (!parent) return cat.name;
    return getCategoryPath(parent, allCats) + "/" + cat.name;
  };

  return (
    <div className="p-5 bg-white min-h-fit border border-gray-200 space-y-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Manage Categories</h1>
        <Button onClick={() => { setEditCategory(null); setModalOpen(true); }}>
          + Add Category
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex justify-between items-center border border-gray-300 p-3">
            <p>{getCategoryPath(cat, categories)}</p>
            <div className="space-x-2">
              <Button
                variant="secondary"
                onClick={() => { setEditCategory(cat); setModalOpen(true); }}
              >
                Edit
              </Button>
              <Button variant="destructive" onClick={() => confirmDeleteCategory(cat)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editCategory}
        refresh={fetchCategories}
      />

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="post-custom-scroll fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center overflow-auto z-50">
          <div className="bg-white p-5 shadow-sm max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete "{categoryToDelete?.name}"?
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
