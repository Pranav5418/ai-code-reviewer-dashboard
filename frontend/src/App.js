import React, { useState, useEffect } from "react";
import "./App.css";

// Chart imports
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

function App() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState("analyzer");
  const [history, setHistory] = useState([]);

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error("Server Error");

      const data = await response.json();
      setResult(data);

      const newEntry = {
        code,
        result: data,
        time: new Date().toLocaleString(),
      };

      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("history", JSON.stringify(updatedHistory));

    } catch (err) {
      console.error(err);
      setResult(null);
      setError("⚠️ Invalid code or server error!");
    }

    setLoading(false);
  };

  const chartData = result
    ? {
      labels: ["Complexity", "Quality"],
      datasets: [
        {
          label: "Code Metrics",
          data: [result.complexity_score, result.quality_score],
          backgroundColor: ["#ff7b00", "#28a745"],
        },
      ],
    }
    : null;

  // ✅ NEW: Dashboard Calculations
  const avgScore =
    history.length > 0
      ? Math.round(
        history.reduce((acc, h) => acc + h.result.quality_score, 0) /
        history.length
      )
      : 0;

  const bestScore =
    history.length > 0
      ? Math.max(...history.map((h) => h.result.quality_score))
      : 0;

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>⚡</h2>

        <p
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </p>

        <p
          className={page === "analyzer" ? "active" : ""}
          onClick={() => setPage("analyzer")}
        >
          Analyzer
        </p>

        <h3>📜 History</h3>

        {history.map((item, i) => (
          <div
            key={i}
            className="history-item"
            onClick={() => {
              setResult(item.result);
              setCode(item.code);
              setPage("analyzer");
            }}
          >
            <p><b>Score:</b> {item.result.quality_score}</p>
            <p><b>Complexity:</b> {item.result.complexity_score}</p>
            <p className="code-preview">
              {item.code.slice(0, 40)}...
            </p>
            <p className="time">{item.time}</p>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main-content">
        <div className="container">
          <h1>🚀 AI Code Reviewer</h1>

          {/* ANALYZER */}
          {page === "analyzer" && (
            <>
              <div className="code-section">
                <textarea
                  className="code-box"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                />

                <button className="analyze-btn" onClick={analyzeCode}>
                  {loading ? "Analyzing..." : "Analyze Code"}
                </button>
              </div>

              {error && <div className="error-box">{error}</div>}

              {result && (
                <div className="dashboard">
                  <div className="stats">
                    <div className="card stat-card">
                      <h4>Complexity</h4>
                      <p>{result.complexity_score}</p>
                    </div>

                    <div className="card stat-card">
                      <h4>Quality Score</h4>
                      <p className={result.quality_score > 80 ? "good" : "bad"}>
                        {result.quality_score}
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <h3>📈 Analysis Chart</h3>
                    {chartData && <Bar data={chartData} />}
                  </div>

                  <div className="grid">
                    <div className="card">
                      <h3>💡 Suggestions</h3>
                      {result.suggestions.map((s, i) => (
                        <div className="suggestion-item" key={i}>
                          {s}
                        </div>
                      ))}
                    </div>

                    <div className="card">
                      <h3>📄 Lint Report</h3>
                      <pre className="lint-modern">{result.lint_report}</pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <div className="dashboard">
              <h2>📊 Dashboard Overview</h2>

              {/* Stats */}
              <div className="stats">
                <div className="card stat-card">
                  <h4>Total Analyses</h4>
                  <p>{history.length}</p>
                </div>

                <div className="card stat-card">
                  <h4>Average Score</h4>
                  <p>{avgScore}</p>
                </div>

                <div className="card stat-card">
                  <h4>Best Score</h4>
                  <p>{bestScore}</p>
                </div>
              </div>

              {/* History Chart */}
              <div className="card">
                <h3>📈 Score History</h3>
                {history.length > 0 ? (
                  <Bar
                    data={{
                      labels: history.map((_, i) => `Run ${i + 1}`),
                      datasets: [
                        {
                          label: "Quality Score",
                          data: history.map(
                            (h) => h.result.quality_score
                          ),
                          backgroundColor: "#28a745",
                        },
                      ],
                    }}
                  />
                ) : (
                  <p>No data yet</p>
                )}
              </div>

              {/* Latest */}
              <div className="card">
                <h3>🕒 Latest Analysis</h3>
                {history[0] ? (
                  <>
                    <p><b>Score:</b> {history[0].result.quality_score}</p>
                    <p><b>Complexity:</b> {history[0].result.complexity_score}</p>
                    <p>{history[0].time}</p>
                  </>
                ) : (
                  <p>No analysis yet</p>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;