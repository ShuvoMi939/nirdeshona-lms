// src/components/PostModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";

type Category = { id: number; name: string; parent_id?: number };

type Post = {
  id?: number;
  title: string;
  content: string;
  status: string;
  thumbnail?: string;
  tags?: string[];
  categories?: number[];
  slug?: string;
};

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (post: Partial<Post>) => void;
  canCreateCategory: boolean;
}

export default function PostModal({ post, onClose, onSave, canCreateCategory }: PostModalProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState(post?.status || "draft");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [categories, setCategories] = useState<number[]>(post?.categories || []);
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugLocked, setSlugLocked] = useState(!post?.id);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { 
    setTitle(post?.title || "");
    setContent(post?.content || "");
    setStatus(post?.status || "draft");
    setThumbnail(post?.thumbnail || "");
    setTags(post?.tags?.join(", ") || "");
    setCategories(post?.categories || []);
    setSlug(post?.slug || "");
    setSlugLocked(!post?.id);
  }, [post]);

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await fetch("/api/categories/list");
      const data = await res.json();
      if (res.ok) setAllCategories(data.categories);
    } catch (err) { console.error(err); }
    finally { setLoadingCats(false); }
  };

  const addCategory = async () => {
    if (!newCategory || !canCreateCategory) return;
    try {
      const res = await fetch("/api/categories/create", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ name: newCategory }) 
      });
      const data = await res.json();
      if (res.ok) {
        setAllCategories([...allCategories, data.category]);
        setCategories([...categories, data.category.id]);
        setNewCategory("");
      }
    } catch (err) { console.error(err); }
  };

  const toggleCategory = (id: number) => {
    setCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Auto-generate slug from title for new posts only if locked
  useEffect(() => {
    if (!post?.id && slugLocked) {
      setSlug(title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""));
    }
  }, [title, slugLocked, post]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    if (!title || !content || !slug) {
      alert("Title, Content, and Slug are required.");
      return;
    }
    onSave({
      id: post?.id,
      title,
      content,
      status,
      thumbnail,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      categories,
      slug
    });
  };

  // Recursive function to get full parent/child path
  const getCategoryPath = (cat: Category, allCats: Category[]): string => {
    if (!cat.parent_id) return cat.name;
    const parent = allCats.find(c => c.id === cat.parent_id);
    if (!parent) return cat.name;
    return getCategoryPath(parent, allCats) + "/" + cat.name;
  };

  const filteredCategories = allCategories.filter(cat =>
    getCategoryPath(cat, allCategories).toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <div className="post-custom-scroll fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-start overflow-auto z-50 pt-2">
      <div className="bg-white p-5 w-full max-w-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">{post ? "Edit Post" : "Create Post"}</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnail}
          onChange={e => setThumbnail(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Categories */}
        <div className="mb-3 relative" ref={dropdownRef}>
          <label className="block mb-1 font-medium">Categories:</label>

          {canCreateCategory && (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}

          <div
            onClick={() => setCatDropdownOpen(prev => !prev)}
            className="flex flex-wrap gap-1 border p-2 rounded cursor-pointer min-h-[40px] items-center"
          >
            {categories.length === 0 && <span className="text-gray-400">Select categories...</span>}
            {categories.map(id => {
              const cat = allCategories.find(c => c.id === id);
              return cat ? (
                <span key={id} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                  {getCategoryPath(cat, allCategories)}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleCategory(id); }}
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>

          {catDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
              <input
                type="text"
                placeholder="Search categories..."
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                className="w-full px-3 py-2 border-b focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col">
                {filteredCategories.map(cat => (
                  <label
                    key={cat.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    {getCategoryPath(cat, allCategories)}
                  </label>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="px-3 py-2 text-gray-400">No categories found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Slug with lock/unlock */}
        <div className="mb-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            disabled={slugLocked}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setSlugLocked(!slugLocked)}
            className="px-2 py-1 border rounded"
          >
            {slugLocked ? "🔒" : "🔓"}
          </button>
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}
