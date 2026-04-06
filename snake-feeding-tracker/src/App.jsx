import { useState } from 'react';
import FileUpload from './components/FileUpload';
import WeekSelector from './components/WeekSelector';
import FeedingResults from './components/FeedingResults';
import { parseSpreadsheet } from './utils/parseSpreadsheet';
import { getSnakesToFeed, getPreySummary } from './utils/feedingLogic';

export default function App() {
  const [step, setStep] = useState(1);
  const [snakeData, setSnakeData] = useState(null);
  const [maxWeek, setMaxWeek] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setError(null);
    try {
      const { snakes, maxWeek: max } = await parseSpreadsheet(file);
      setSnakeData(snakes);
      setMaxWeek(max);
      const nextWeek = max + 1;
      setCurrentWeek(nextWeek);
      setFileName(file.name);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWeekSelect = (week) => {
    const snakesToFeed = getSnakesToFeed(snakeData, week);
    const preySummary = getPreySummary(snakesToFeed);
    setResults({ snakesToFeed, preySummary, week });
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setSnakeData(null);
    setResults(null);
    setError(null);
    setFileName('');
    setMaxWeek(0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <span className="header-logo">🐍</span>
          <div>
            <h1 className="header-title">Snake Feeding Tracker</h1>
            <p className="header-sub">Gestionnaire de nourrissage</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Stepper */}
        <nav className="stepper">
          {[
            { n: 1, label: 'Importer' },
            { n: 2, label: 'Semaine' },
            { n: 3, label: 'Résultats' },
          ].map(({ n, label }, idx, arr) => (
            <span key={n} className="stepper-item">
              <button
                className={`step-btn ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`}
                onClick={() => {
                  if (n === 1) handleReset();
                  else if (n === 2 && step >= 2) setStep(2);
                }}
                disabled={step < n}
              >
                <span className="step-num">{step > n ? '✓' : n}</span>
                <span className="step-label">{label}</span>
              </button>
              {idx < arr.length - 1 && <span className="step-sep" />}
            </span>
          ))}
        </nav>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {step === 1 && <FileUpload onFileUpload={handleFileUpload} />}
        {step === 2 && (
          <WeekSelector
            maxWeek={maxWeek}
            currentWeek={currentWeek}
            fileName={fileName}
            onWeekSelect={handleWeekSelect}
            onChange={setCurrentWeek}
          />
        )}
        {step === 3 && results && (
          <FeedingResults
            results={results}
            onBack={() => setStep(2)}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Snake Feeding Tracker — valeurs acceptées : <code>ok</code> <code>ref</code> <code>p</code> <code>M</code> <code>G</code> <code>SG</code></p>
      </footer>
    </div>
  );
}
