// src/components/Clients.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ nom: '', telephone: '', adresse: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editingId, setEditingId] = useState(null);

  const colRef = collection(db, 'clients');

  // Récupérer la liste des clients
  const fetchClients = async () => {
    try {
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map(d => {
        const item = { id: d.id, ...d.data() };
        if (typeof item.notes !== 'string') {
          item.notes = '';
        }
        return item;
      });
      setClients(data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erreur lors du chargement des clients.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Ajouter ou mettre à jour un client
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'clients', editingId), form);
        setMessage({ text: 'Client mis à jour !', type: 'success' });
      } else {
        await addDoc(colRef, form);
        setMessage({ text: 'Client ajouté !', type: 'success' });
      }
      setForm({ nom: '', telephone: '', adresse: '', notes: '' });
      setEditingId(null);
      await fetchClients();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erreur, réessaie !', type: 'error' });
    }
    setLoading(false);
  };

  // Supprimer un client
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'clients', id));
      setMessage({ text: 'Client supprimé !', type: 'success' });
      await fetchClients();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erreur de suppression !', type: 'error' });
    }
    setLoading(false);
  };

  // Préparer l'édition d'un client
  const handleEdit = (client) => {
    setForm({
      nom: client.nom || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      notes: client.notes || ''
    });
    setEditingId(client.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Gestion des Clients</h2>

      {/* Notification */}
      {message.text && (
        <div
          className={`mb-4 p-2 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Spinner */}
      {loading && (
        <div className="flex justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 space-y-2 max-w-md">
        <input
          type="text"
          placeholder="Nom"
          value={form.nom}
          onChange={e => setForm({ ...form, nom: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={form.telephone}
          onChange={e => setForm({ ...form, telephone: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Adresse"
          value={form.adresse}
          onChange={e => setForm({ ...form, adresse: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          )}
          {editingId ? 'Mettre à jour' : 'Ajouter le client'}
        </button>
      </form>

      <ul className="space-y-4">
        {clients.map(c => (
          <li key={c.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-2 border rounded">
            <div>
              <strong>{c.nom}</strong>
              <div className="text-sm text-gray-600">
                {c.telephone && <span className="block">📞 {c.telephone}</span>}
                {c.adresse && <span className="block">🏠 {c.adresse}</span>}
                {c.notes && <span className="block mt-1">Notes: {c.notes}</span>}
              </div>
            </div>
            <div className="mt-2 sm:mt-0 space-x-2">
              <button onClick={() => handleEdit(c)} className="text-blue-500 hover:underline">
                Modifier
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline">
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Clients;