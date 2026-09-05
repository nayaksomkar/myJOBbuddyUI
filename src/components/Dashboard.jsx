import { useState } from 'react';
import HintChips from './HintChips.jsx';
import { hintsConfig } from '../config/index.js';

const InsightMessage = ({ text }) => (
  <div className="dashboard-insight">
    <div className="dashboard-insight-label">Analysis Insight</div>
    <div className="dashboard-insight-text">{text}</div>
  </div>
);

export default function Dashboard({ activeResume }) {
  const [insights, setInsights] = useState([]);

  const handleInsight = (preview) => {
    setInsights(prev => [...prev, {
      id: Date.now(),
      text: preview,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">Competitor Analysis</div>
        <div className="dashboard-subtitle">
          {activeResume
            ? `Insights for: ${activeResume.name}`
            : 'Select a resume to generate competitive insights'}
        </div>
      </div>

      <div className="dashboard-hints-section">
        <div className="dashboard-section-label">Predictive Insights</div>
        <HintChips onInsight={handleInsight} />
      </div>

      <div className="dashboard-output-section">
        <div className="dashboard-section-label">
          Analysis Output {insights.length > 0 && `(${insights.length})`}
        </div>
        {insights.length === 0 ? (
          <div className="dashboard-empty-output">
            Click a hint chip above to explore competitive insights about your profile.
          </div>
        ) : (
          <div className="dashboard-insights-list">
            {insights.map(insight => (
              <InsightMessage key={insight.id} text={insight.text} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
