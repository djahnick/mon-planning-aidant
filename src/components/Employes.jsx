// src/components/Employes.jsx
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

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function Employes() {
  const [employes, setEmployes] = useState([]);
  const [form, setForm] = useState({ nom: '', telephone: '', disponibilite: [], notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editingId, setEditingId] = useState(null);

  const colRef = collection(db, 'employes');

  // Charger la liste des employées
  const fetchEmployes = async () => {
    try {
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map(d => {
        const item = { id: d.id, ...d.data() };
        if (!Array.isArray(item.disponibilite)) {
          item.disponibilite = [];
        }
        if (typeof item.notes !== 'string') {
          item.notes = '';
        }
        return item;
      });
      setEmployes(data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erreur lors du chargement des employées.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchEmployes();
  }, []);

  // Créer ou mettre à jour une employée
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'employes', editingId), form);
        setMessage({ text: 'Employée mise à jour !', type: 'success' });
      } else {
        await addDoc(colRef, form);
        setMessage({ text: 'Employée ajoutée !', type: 'success' });
      }
      setForm({ nom: '', telephone: '', disponibilite: [], notes: '' });
      setEditingId(null);
      await fetchEmployes();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erreur, réessaie !', type: 'error' });
    }
    setLoading(false);
  };

  // Supprimer une employée
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'employes', id));
      setMessage({ text: 'Employée supprimée !', type: 'success' });
      await fetchEmployes();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erreur de suppression !', type: 'error' });
    }
    setLoading(false);
  };

  // Préparer l'édition d'une employée
  const handleEdit = (employe) => {
    setForm({
      nom: employe.nom || '',
      telephone: employe.telephone || '',
      disponibilite: Array.isArray(employe.disponibilite) ? employe.disponibilite : [],
      notes: employe.notes || ''
    });
    setEditingId(employe.id);
  };

  // Gérer la sélection des jours de disponibilité
  const toggleJour = (jour) => {
    setForm(prev => {
      const dispo = prev.disponibilite.includes(jour)
        ? prev.disponibilite.filter(d => d !== jour)
        : [...prev.disponibilite, jour];
      return { ...prev, disponibilite: dispo };
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Gestion des Employées</h2>

      {message.text && (
        <div className={`mb-4 p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div className="flex justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
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

        <div>
          <p className="mb-2 font-medium">Jours de disponibilité :</p>
          <div className="grid grid-cols-2 gap-2">
            {JOURS_SEMAINE.map(jour => (
              <label key={jour} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.disponibilite.includes(jour)}
                  onChange={() => toggleJour(jour)}
                  className="form-checkbox h-5 w-5"
                />
                <span>{jour}</span>
              </label>
            ))}
          </div>
        </div>

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
          {editingId ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </form>

      <ul className="space-y-4">
        {employes.map(emp => (
          <li key={emp.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-2 border rounded">
            <div>
              <strong>{emp.nom}</strong>
              <div className="text-sm text-gray-600">
                {emp.telephone && <span className="block">📞 {emp.telephone}</span>}
                <span className="block">
                  Disponibilités: {emp.disponibilite.length > 0 ? emp.disponibilite.join(', ') : 'Aucune'}
                </span>
                {emp.notes && (
                  <span className="block mt-1">Notes: {emp.notes}</span>
                )}
              </div>
            </div>
            <div className="mt-2 sm:mt-0 space-x-2">
              <button onClick={() => handleEdit(emp)} className="text-blue-500 hover:underline">
                Modifier
              </button>
              <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:underline">
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Employes;
