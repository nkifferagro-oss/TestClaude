import { useState } from 'react';

export default function WeekSelector({ maxWeek, currentWeek, fileName, onWeekSelect, onChange }) {
  const [week, setWeek] = useState(currentWeek);

  const handleChange = (val) => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setWeek(n);
    onChange(n);
  };

  return (
    <div className="card week-card">
      <h2 className="card-title">Sélectionner la semaine</h2>
      <p className="card-desc">
        Fichier chargé : <strong>{fileName}</strong>
        {maxWeek > 0 && (
          <> — <span className="muted">{maxWeek} semaine(s) d'historique</span></>
        )}
      </p>

      <div className="week-input-group">
        <label htmlFor="week-input" className="week-label">
          Numéro de la semaine courante
        </label>
        <div className="week-controls">
          <button
            className="btn-icon"
            onClick={() => handleChange(week - 1)}
            disabled={week <= 1}
          >−</button>
          <input
            id="week-input"
            type="number"
            min="1"
            value={week}
            onChange={(e) => handleChange(e.target.value)}
            className="week-input"
          />
          <button
            className="btn-icon"
            onClick={() => handleChange(week + 1)}
          >+</button>
        </div>
        {maxWeek > 0 && week <= maxWeek && (
          <p className="week-hint warning">
            ⚠️ La semaine {week} est déjà dans l'historique. Pour voir les prochains repas, utilisez la semaine {maxWeek + 1}.
          </p>
        )}
        {maxWeek > 0 && week === maxWeek + 1 && (
          <p className="week-hint success">
            ✓ Semaine suivante après le dernier historique.
          </p>
        )}
      </div>

      <button
        className="btn btn-primary btn-large"
        onClick={() => onWeekSelect(week)}
      >
        Calculer les repas de la semaine {week} →
      </button>
    </div>
  );
}
