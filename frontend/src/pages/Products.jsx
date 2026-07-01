import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  unit: "piece",
  description: "",
  isVeg: true,
  isTodaysSpecial: false,
  isAvailable: true,
  gstApplicable: true,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const [prodRes, catRes] = await Promise.all([
        api.get("/products", { params }),
        api.get("/categories"),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?._id || "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category?._id || p.category,
      price: p.price,
      unit: p.unit,
      description: p.description || "",
      isVeg: p.isVeg,
      isTodaysSpecial: p.isTodaysSpecial,
      isAvailable: p.isAvailable,
      gstApplicable: p.gstApplicable,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p._id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-crust-800">Products</h2>
          <p className="text-sm text-crust-600/70">Manage your bakery menu items.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-crust-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crust-600"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-crust-600/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-crust-100 text-sm"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-crust-100 text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl border border-crust-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-crust-50 text-left text-crust-600/70 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Special</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-crust-50 hover:bg-crust-50/60">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category?.emoji} {p.category?.name}</td>
                  <td className="px-4 py-3">₹{p.price} / {p.unit}</td>
                  <td className="px-4 py-3">{p.isTodaysSpecial ? "⭐" : ""}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isAvailable ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-crust-600 hover:text-crust-800"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Category</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm">
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-1">Price (₹)</label>
                <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-1">Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" placeholder="piece, kg, box..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-crust-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" rows={2} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Veg</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isTodaysSpecial} onChange={(e) => setForm({ ...form, isTodaysSpecial: e.target.checked })} /> Today's Special</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.gstApplicable} onChange={(e) => setForm({ ...form, gstApplicable: e.target.checked })} /> GST Applicable</label>
            </div>
            <button type="submit" className="w-full bg-crust-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-crust-600">
              {editing ? "Save Changes" : "Create Product"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
