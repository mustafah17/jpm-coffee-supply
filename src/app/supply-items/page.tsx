'use client';

import { useEffect, useState, ChangeEvent } from 'react';

type ItemCategory = 'COFFEE_BEANS' | 'MILK' | 'SUGAR' | 'CUPS';

type Supplier = {
  name: string;
  contact: string;
};

type SupplyItem = {
  itemID?: number;
  name: string;
  category: ItemCategory;
  stock: number;
  reorderLevel: number;
  supplier: Supplier;
};

export default function SupplyItemsPage() {
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [form, setForm] = useState<Partial<SupplyItem>>({
    supplier: { name: '', contact: '' },
  });
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<Partial<SupplyItem>>({});
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  const API_BASE = 'http://localhost:8080/api/supply-items';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch(API_BASE);
    const data = await res.json();
    setItems(data);
  };

  const createItem = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const newItem = await res.json();
    setItems([...items, newItem]);
  };

  const updateItem = async (id: number) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingForm),
    });
    const updated = await res.json();
    setItems(items.map(i => i.itemID === id ? updated : i));
    setEditingItemId(null);
  };

  const deleteItem = async (id: number) => {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.itemID !== id));
  };

  const searchItems = async () => {
    const query = new URLSearchParams(searchParams).toString();
    const res = await fetch(`${API_BASE}/search?${query}`);
    const data = await res.json();
    setItems(data);
  };

  const updateQuantity = async (id: number) => {
    const quantityStr = prompt('Enter new quantity:');
    const quantity = Number(quantityStr);
    if (isNaN(quantity)) return;
    const res = await fetch(`${API_BASE}/${id}/quantity?quantity=${quantity}`, {
      method: 'PATCH',
    });
    const updated = await res.json();
    setItems(items.map(i => i.itemID === id ? updated : i));
  };

  const getReorderList = async () => {
    const res = await fetch(`${API_BASE}/to-reorder`);
    const data = await res.json();
    setItems(data);
  };

  const importCsv = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setItems([...items, ...data]);
  };

  const handleFormChange = (field: keyof SupplyItem, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSupplierChange = (field: keyof Supplier, value: string) => {
    setForm({
      ...form,
      supplier: { ...form.supplier, [field]: value ?? "" },
    });
  };

  const handleSearchParamChange = (field: string, value: string) => {
    setSearchParams({ ...searchParams, [field]: value });
  };

  return (
    <div>
      <h1>Supply Items</h1>

      {/* Create Form */}
      <section>
        <h2>Create Item</h2>
        <input placeholder="Name" onChange={e => handleFormChange('name', e.target.value)} value={form.name || ''} />
        <select onChange={e => handleFormChange('category', e.target.value as ItemCategory)} value={form.category || ''}>
          <option value="">Select Category</option>
          <option value="COFFEE_BEANS">COFFEE_BEANS</option>
          <option value="MILK">MILK</option>
          <option value="SUGAR">SUGAR</option>
          <option value="CUPS">CUPS</option>
        </select>
        <input type="number" placeholder="Stock" onChange={e => handleFormChange('stock', Number(e.target.value))} value={form.stock || ''} />
        <input type="number" placeholder="Reorder Level" onChange={e => handleFormChange('reorderLevel', Number(e.target.value))} value={form.reorderLevel || ''} />
        <input placeholder="Supplier Name" onChange={e => handleSupplierChange('name', e.target.value)} value={form.supplier?.name || ''} />
        <input placeholder="Supplier Contact" onChange={e => handleSupplierChange('contact', e.target.value)} value={form.supplier?.contact || ''} />
        <button onClick={createItem}>Create</button>
      </section>

      {/* Search */}
      <section>
        <h2>Search Items</h2>
        <input placeholder="Name" onChange={e => handleSearchParamChange('name', e.target.value)} />
        <select onChange={e => handleSearchParamChange('category', e.target.value)}>
          <option value="">Select Category</option>
          <option value="COFFEE_BEANS">COFFEE_BEANS</option>
          <option value="MILK">MILK</option>
          <option value="SUGAR">SUGAR</option>
          <option value="CUPS">CUPS</option>
        </select>
        <input placeholder="Supplier Name" onChange={e => handleSearchParamChange('supplierName', e.target.value)} />
        <input placeholder="Supplier Contact" onChange={e => handleSearchParamChange('supplierContact', e.target.value)} />
        <button onClick={searchItems}>Search</button>
      </section>

      {/* Import CSV */}
      <section>
        <h2>Import from CSV</h2>
        <input type="file" accept=".csv" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
        <button onClick={importCsv}>Import</button>
      </section>

      {/* Reorder list */}
      <section>
        <h2>Reorder List</h2>
        <button onClick={getReorderList}>Get Reorder Items</button>
      </section>

      {/* List */}
      <section>
        <h2>All Items</h2>
        {items.map(item => (
          <div key={item.itemID ?? Math.random()} style={{ border: '1px solid black', padding: '5px', margin: '5px' }}>
            {editingItemId === item.itemID ? (
              <>
                <input value={editingForm.name || ''} onChange={e => setEditingForm({ ...editingForm, name: e.target.value })} />
                <select value={editingForm.category || ''} onChange={e => setEditingForm({ ...editingForm, category: e.target.value as ItemCategory })}>
                  <option value="">Select Category</option>
                  <option value="COFFEE_BEANS">COFFEE_BEANS</option>
                  <option value="MILK">MILK</option>
                  <option value="SUGAR">SUGAR</option>
                  <option value="CUPS">CUPS</option>
                </select>
                <input type="number" value={editingForm.stock || ''} onChange={e => setEditingForm({ ...editingForm, stock: Number(e.target.value) })} />
                <input type="number" value={editingForm.reorderLevel || ''} onChange={e => setEditingForm({ ...editingForm, reorderLevel: Number(e.target.value) })} />
                <input value={editingForm.supplier?.name || ''} onChange={e => setEditingForm({ ...editingForm, supplier: { ...editingForm.supplier, name: e.target.value } })} />
                <input value={editingForm.supplier?.contact || ''} onChange={e => setEditingForm({ ...editingForm, supplier: { ...editingForm.supplier, contact: e.target.value } })} />
                <button onClick={() => updateItem(item.itemID!)}>Save</button>
                <button onClick={() => setEditingItemId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p>ID: {item.itemID}</p>
                <p>Name: {item.name}</p>
                <p>Category: {item.category}</p>
                <p>Stock: {item.stock}</p>
                <p>Reorder Level: {item.reorderLevel}</p>
                <p>Supplier: {item.supplier.name} ({item.supplier.contact})</p>
                <button onClick={() => deleteItem(item.itemID!)}>Delete</button>
                <button onClick={() => updateQuantity(item.itemID!)}>Update Quantity</button>
                <button onClick={() => {
                  setEditingItemId(item.itemID!);
                  setEditingForm(item);
                }}>Edit</button>
              </>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}