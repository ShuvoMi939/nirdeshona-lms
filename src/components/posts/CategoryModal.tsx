// src/components/CategoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { auth } from "@/lib/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  editingCategory: any | null;
  refresh: () => void;
}

export default function CategoryModal({ open, onClose, editingCategory, refresh }: Props) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setParentId(editingCategory.parent_id || null);
    } else {
      setName("");
      setParentId(null);
    }

    // Fetch categories for dropdown
    fetch("/api/categories/list")
      .then(res => res.json())
      .then(data => setAllCategories(data.categories || []))
      .catch(err => console.error(err));
  }, [editingCategory]);

  if (!open) return null;

  const saveCategory = async () => {
    if (!name) return;

    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    let url = editingCategory ? "/api/categories/update" : "/api/categories/create";
    let method = editingCategory ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingCategory ? { id: editingCategory.id, name, parent_id: parentId } : { name, parent_id: parentId }),
    });

    const data = await res.json();
    if (!data.category && !data.success) {
      alert("Save failed: " + data.error);
      return;
    }

    refresh();
    onClose();
  };

  return (
    <div className="post-custom-scroll fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center overflow-auto z-50">
      <div className="bg-white p-5 shadow-sm max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">{editingCategory ? "Edit" : "Add"} Category</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          placeholder="Category Name"
        />
        {/* Parent category select */}
        <select
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
          className="border p-2 w-full rounded mb-4"
        >
          <option value="">-- No Parent --</option>
          {allCategories
            .filter(cat => !editingCategory || cat.id !== editingCategory.id) // prevent self-parenting
            .map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={saveCategory}>{editingCategory ? "Update" : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}
