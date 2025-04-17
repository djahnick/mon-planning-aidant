// src/components/Recap.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Recap() {
  const [rendezvous, setRendezvous] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [clients, setClients] = useState([]);
  const [tauxHoraires, setTauxHoraires] = useState({});
  const [tauxClients, setTauxClients] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const rvSnap = await getDocs(collection(db, 'rendezvous'));
      const empSnap = await getDocs(collection(db, 'employes'));
      const cliSnap = await getDocs(collection(db, 'clients'));

      setRendezvous(rvSnap.docs.map(d => d.data()));
      const employeData = empSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEmployes(employeData);
      const clientData = cliSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClients(clientData);

      const defaultTauxClients = {};
      clientData.forEach(c => {
        defaultTauxClients[c.id] = 0;
      });
      setTauxClients(defaultTauxClients);

      const defaultTaux = {};
      employeData.forEach(e => {
        defaultTaux[e.id] = 0;
      });
      setTauxHoraires(defaultTaux);
    };

    fetchAll();
  }, []);

  const moisActuel = new Date().toLocaleString('fr-FR', { month: 'long' });
  const [moisFiltre, setMoisFiltre] = useState(moisActuel.charAt(0).toUpperCase() + moisActuel.slice(1));
  
  const calculateHeures = (heureDebut, heureFin) => {
    const [h1, m1] = heureDebut.split(':').map(Number);
    const [h2, m2] = heureFin.split(':').map(Number);
    return (h2 + m2 / 60) - (h1 + m1 / 60);
  };

  const currentYear = new Date().getFullYear();
  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const tableEmployes = employes.map(emp => {
    const ligne = { nom: emp.nom, id: emp.id };
    for (let i = 0; i < 12; i++) {
      const total = rendezvous
        .filter(r => {
          const d = new Date(`${r.date}T00:00`);
          return r.employeId === emp.id && d.getFullYear() === currentYear && d.getMonth() === i;
        })
        .reduce((acc, r) => acc + calculateHeures(r.heureDebut, r.heureFin), 0);
      ligne[mois[i]] = total;
    }
    return ligne;
  });

  const tableClients = clients.map(cli => {
    const ligne = { nom: cli.nom };
    for (let i = 0; i < 12; i++) {
      const total = rendezvous
        .filter(r => {
          const d = new Date(`${r.date}T00:00`);
          return r.clientId === cli.id && d.getFullYear() === currentYear && d.getMonth() === i;
        })
        .reduce((acc, r) => acc + calculateHeures(r.heureDebut, r.heureFin), 0);
      ligne[mois[i]] = total;
    }
    return ligne;
  });

  const handleTauxChange = (id, value) => {
    setTauxHoraires({ ...tauxHoraires, [id]: parseFloat(value) });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Tableau annuel des heures ({currentYear})</h2>
      <div className="mb-6">
        <label htmlFor="mois-select" className="mr-2 font-medium">Afficher :</label>
        <select
          id="mois-select"
          value={moisFiltre}
          onChange={(e) => setMoisFiltre(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="Tous">Tous les mois</option>
          {mois.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <h3 className="text-xl font-semibold mb-2 mt-6">Par Employée</h3>
      <div className="overflow-auto mb-8">
        <table className="table-auto border text-sm min-w-full">
          <thead>
            <tr>
              <th className="border px-2 py-1">Mois</th>
              <th className="border px-2 py-1">Employée</th>
              <th className="border px-2 py-1">Nombre d’heures</th>
              <th className="border px-2 py-1">Taux horaire (€)</th>
              <th className="border px-2 py-1">Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {mois
            .filter(m => moisFiltre === 'Tous' || m === moisFiltre)
            .map((m, monthIndex) => {
              const lignesMois = tableEmployes.map((e, i) => {
                const heures = e[m];
                const taux = tauxHoraires[e.id] || 0;
                return (
                  <tr key={`${m}-${e.id}`}>
                    <td className="border px-2 py-1 text-center">{m}</td>
                    <td className="border px-2 py-1 text-center">{e.nom}</td>
                    <td className="border px-2 py-1 text-center">{heures.toFixed(2)}</td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={tauxHoraires[e.id] || ''}
                        onChange={(ev) => handleTauxChange(e.id, ev.target.value)}
                        className="w-20 border rounded px-1 py-0.5 text-sm"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">{(heures * taux).toFixed(2)} €</td>
                  </tr>
                );
              });

              const totalHeuresMois = tableEmployes.reduce((sum, e) => sum + e[m], 0);
              const totalEurMois = tableEmployes.reduce((sum, e) => sum + e[m] * (tauxHoraires[e.id] || 0), 0);

              return [
                ...lignesMois,
                <tr key={`${m}-total`} className="bg-gray-100 font-semibold">
                  <td className="border px-2 py-1 text-center" colSpan={2}>Total {m}</td>
                  <td className="border px-2 py-1 text-center">{totalHeuresMois.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-center">–</td>
                  <td className="border px-2 py-1 text-center">{totalEurMois.toFixed(2)} €</td>
                </tr>
              ];
            })}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-2 mt-6">Par Client</h3>
      <div className="overflow-auto">
        <table className="table-auto border text-sm min-w-full">
          <thead>
            <tr className="bg-blue-50 font-bold">
              <th className="border px-2 py-1">Client</th>
              <th className="border px-2 py-1">Mois</th>
              <th className="border px-2 py-1">Nombre d’heures</th>
              <th className="border px-2 py-1">Taux horaire (€)</th>
              <th className="border px-2 py-1">Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {tableClients.map((c, i) => {
              return mois
                .filter(m => moisFiltre === 'Tous' || m === moisFiltre)
                .map(m => {
                  const heures = c[m];
                  const taux = tauxClients[c.nom] || 0;
                  return (
                    <tr key={`${c.nom}-${m}`}>
                      <td className="border px-2 py-1 text-center font-medium bg-green-50">{c.nom}</td>
                      <td className="border px-2 py-1 text-center">{m}</td>
                      <td className="border px-2 py-1 text-center">{heures.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="number"
                          step="0.01"
                          value={tauxClients[c.nom] || ''}
                          onChange={(ev) => setTauxClients({ ...tauxClients, [c.nom]: parseFloat(ev.target.value) })}
                          className="w-20 border rounded px-1 py-0.5 text-sm"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">{(heures * taux).toFixed(2)} €</td>
                    </tr>
                  );
                });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Recap;
