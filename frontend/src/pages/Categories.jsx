import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";

const emptyForm = { name: "", emoji: "🍰", description: "", displayOrder: 0, isActive: true };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, emoji: cat.emoji, description: cat.description || "", displayOrder: cat.displayOrder, isActive: cat.isActive });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
      } else {
        await api.post("/categories", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-crust-800">Categories</h2>
          <p className="text-sm text-crust-600/70">Manage product categories shown on WhatsApp.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-crust-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crust-600"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-xl border border-crust-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl">{cat.emoji}</p>
                  <h3 className="font-semibold text-crust-800 mt-1">{cat.name}</h3>
                  <p className="text-xs text-crust-600/60 mt-0.5">{cat.description}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(cat)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-crust-100 hover:bg-crust-50">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(cat)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Category" : "Add Category"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Emoji</label>
              <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active (visible on WhatsApp)
            </label>
            <button type="submit" className="w-full bg-crust-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-crust-600">
              {editing ? "Save Changes" : "Create Category"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
