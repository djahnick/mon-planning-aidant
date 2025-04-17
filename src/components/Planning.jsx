// src/components/Planning.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

// Utilitaire pour toujours formater "HH:MM"
const padTime = t => {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h.padStart(2,'0')}:${(m||'00').padStart(2,'0')}`;
};

export default function Planning() {
  // États Firestore
  const [rendezvous, setRendezvous] = useState([]);
  const [clients, setClients]       = useState([]);
  const [employes, setEmployes]     = useState([]);

  // Gestion des modales / formulaires
  const [showForm, setShowForm]                   = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [selectedEvent, setSelectedEvent]         = useState(null);

  // Formulaire simple
  const [formData, setFormData] = useState({
    date: '', heureDebut: '', heureFin: '',
    clientId: '', employeId: '', type: ''
  });

  // Formulaire récurrent
  const [recurringData, setRecurringData] = useState({
    jour: 1,    // nombre : 1 = Lundi … 0 = Dimanche
    mois: '', 
    heureDebut: '', 
    heureFin: '',
    clientId: '', 
    employeId: '', 
    type: ''
  });

  const calendarRef = useRef(null);
  const [viewTitle, setViewTitle] = useState('');

  // Collections Firestore
  const rvRef      = collection(db, 'rendezvous');
  const clientsRef = collection(db, 'clients');
  const empRef     = collection(db, 'employes');

  // Chargement initial
  useEffect(() => {
    (async () => {
      const [rvSnap, clSnap, emSnap] = await Promise.all([
        getDocs(rvRef),
        getDocs(clientsRef),
        getDocs(empRef),
      ]);
      setRendezvous(rvSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setClients  (clSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setEmployes (emSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // Helper FullCalendar
  const getApi = () => calendarRef.current?.getApi();
  const handleDatesSet = ({ view }) => setViewTitle(view.title);

  // Clic sur jour vide
  const handleDateClick = ({ dateStr }) => {
    setFormData({
      date: dateStr,
      heureDebut: '',
      heureFin: '',
      clientId: '',
      employeId: '',
      type: ''
    });
    setSelectedEvent(null);
    setShowForm(true);
  };

  // Clic sur événement existant
  const handleEventClick = ({ event }) => {
    const orig = event.extendedProps.original;
    setFormData({
      id:         event.id,
      date:       orig.date,
      heureDebut: padTime(orig.heureDebut),
      heureFin:   padTime(orig.heureFin),
      clientId:   orig.clientId,
      employeId:  orig.employeId,
      type:       orig.type || ''
    });
    setSelectedEvent(event);
    setShowForm(true);
  };

  // Création / mise à jour simple
  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      date:       formData.date,
      heureDebut: formData.heureDebut,
      heureFin:   formData.heureFin,
      clientId:   formData.clientId,
      employeId:  formData.employeId,
      type:       formData.type
    };
    if (selectedEvent) {
      await updateDoc(doc(db, 'rendezvous', formData.id), payload);
    } else {
      await addDoc(rvRef, payload);
    }
    const snap = await getDocs(rvRef);
    setRendezvous(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setShowForm(false);
  };

  // Suppression
  const handleDelete = async () => {
    if (!selectedEvent) return;
    await deleteDoc(doc(db, 'rendezvous', formData.id));
    const snap = await getDocs(rvRef);
    setRendezvous(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setShowForm(false);
  };

  // Création récurrente (format local YYYY‑MM‑DD)
  const createRecurringRendezvous = async () => {
    const year      = new Date().getFullYear();
    const month     = parseInt(recurringData.mois, 10);
    const targetDay = recurringData.jour;
    const dates = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() === targetDay) {
        // format local YYYY-MM-DD
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth()+1).padStart(2,'0');
        const dd   = String(d.getDate()).padStart(2,'0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
      d.setDate(d.getDate()+1);
    }
    await Promise.all(dates.map(dateStr =>
      addDoc(rvRef, {
        date:       dateStr,
        heureDebut: recurringData.heureDebut,
        heureFin:   recurringData.heureFin,
        clientId:   recurringData.clientId,
        employeId:  recurringData.employeId,
        type:       recurringData.type
      })
    ));
    const snap = await getDocs(rvRef);
    setRendezvous(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setShowRecurringForm(false);
  };

  return (
    <div className="p-4">
      {/* Toolbar responsive */}
      <div className="flex flex-col space-y-2 mb-4">
        <h2 className="text-2xl font-semibold text-center">{viewTitle}</h2>
        <div className="flex justify-center">
          <button onClick={()=>getApi()?.today()} className="text-sm px-2 py-1 bg-gray-300 rounded">
            Aujourd'hui
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button onClick={()=>getApi()?.prev()} className="text-sm px-2 py-1 bg-gray-800 text-white rounded">‹</button>
            <button onClick={()=>getApi()?.next()} className="text-sm px-2 py-1 bg-gray-800 text-white rounded">›</button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={()=>setShowRecurringForm(true)} className="text-sm px-2 py-1 bg-blue-500 text-white rounded">+ Rdv récurrent</button>
            <button onClick={()=>getApi()?.changeView('dayGridMonth')}   className="text-sm px-2 py-1 bg-gray-800 text-white rounded">Mois</button>
            <button onClick={()=>getApi()?.changeView('timeGridWeek')}   className="text-sm px-2 py-1 bg-gray-800 text-white rounded">Semaine</button>
            <button onClick={()=>getApi()?.changeView('timeGridDay')}    className="text-sm px-2 py-1 bg-gray-800 text-white rounded">Jour</button>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <FullCalendar
        ref={calendarRef}
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        initialView="dayGridMonth"
        headerToolbar={false}
        locale={frLocale}
        events={rendezvous.map(rv => {
          const c = clients.find(c=>c.id===rv.clientId)?.nom   || '…';
          const e = employes.find(e=>e.id===rv.employeId)?.nom || '…';
          const idx = employes.findIndex(xx=>xx.id===rv.employeId);
          const color = idx>=0 ? `hsl(${(idx*60)%360},70%,60%)` : '#999';
          return {
            id:            rv.id,
            title:         `${e} pour ${c}`,
            start:         `${rv.date}T${padTime(rv.heureDebut)}`,
            end:           `${rv.date}T${padTime(rv.heureFin)}`,
            extendedProps: { original: rv },
            backgroundColor: color,
            borderColor:     color
          };
        })}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        height="auto"
      />

      {/* Modale récurrente */}
      {showRecurringForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">Créer rendez-vous récurrent</h3>
            <div className="space-y-2">
              <select
                className="w-full border p-2 rounded"
                value={recurringData.jour}
                onChange={e=>setRecurringData({...recurringData, jour:parseInt(e.target.value,10)})}
              >
                <option value={1}>Lundi</option>
                <option value={2}>Mardi</option>
                <option value={3}>Mercredi</option>
                <option value={4}>Jeudi</option>
                <option value={5}>Vendredi</option>
                <option value={6}>Samedi</option>
                <option value={0}>Dimanche</option>
              </select>
              <select
                className="w-full border p-2 rounded"
                value={recurringData.mois}
                onChange={e=>setRecurringData({...recurringData, mois:e.target.value})}
              >
                {[...Array(12)].map((_,i)=>(
                  <option key={i} value={i}>
                    {new Date(0,i).toLocaleString('fr-FR',{month:'long'})}
                  </option>
                ))}
              </select>
              <input type="time" className="w-full border p-2 rounded"
                     value={recurringData.heureDebut}
                     onChange={e=>setRecurringData({...recurringData, heureDebut:e.target.value})} />
              <input type="time" className="w-full border p-2 rounded"
                     value={recurringData.heureFin}
                     onChange={e=>setRecurringData({...recurringData, heureFin:e.target.value})} />
              <select className="w-full border p-2 rounded"
                      value={recurringData.clientId}
                      onChange={e=>setRecurringData({...recurringData, clientId:e.target.value})}>
                <option value="">Sélectionner un client</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select className="w-full border p-2 rounded"
                      value={recurringData.employeId}
                      onChange={e=>setRecurringData({...recurringData, employeId:e.target.value})}>
                <option value="">Sélectionner une employée</option>
                {employes.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
              <input type="text" className="w-full border p-2 rounded"
                     placeholder="Type de tâche"
                     value={recurringData.type}
                     onChange={e=>setRecurringData({...recurringData, type:e.target.value})} />
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={()=>setShowRecurringForm(false)}>
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={createRecurringRendezvous}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale simple */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">
              {selectedEvent ? 'Modifier le rendez-vous' : 'Créer un rendez-vous'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>Date : <strong>{formData.date}</strong></div>
              <select className="w-full border p-2 rounded"
                      value={formData.clientId}
                      onChange={e=>setFormData({...formData, clientId:e.target.value})}
                      required>
                <option value="">Sélectionner un client</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select className="w-full border p-2 rounded"
                      value={formData.employeId}
                      onChange={e=>setFormData({...formData, employeId:e.target.value})}
                      required>
                <option value="">Sélectionner une employée</option>
                {employes.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
              <input type="time" className="w-full border p-2 rounded"
                     value={formData.heureDebut}
                     onChange={e=>setFormData({...formData, heureDebut:e.target.value})}
                     required />
              <input type="time" className="w-full border p-2 rounded"
                     value={formData.heureFin}
                     onChange={e=>setFormData({...formData, heureFin:e.target.value})}
                     required />
              <input type="text" className="w-full border p-2 rounded"
                     placeholder="Type de tâche"
                     value={formData.type}
                     onChange={e=>setFormData({...formData, type:e.target.value})} />
              <div className="flex justify-end space-x-2">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={()=>setShowForm(false)}>
                  Annuler
                </button>
                {selectedEvent && (
                  <button type="button" className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleDelete}>
                    Supprimer
                  </button>
                )}
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  {selectedEvent ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
