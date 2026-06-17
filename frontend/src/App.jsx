import { useState } from "react";
import "./App.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function App() {
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [answers, setAnswers] = useState([]);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsHistory, setAnalyticsHistory] = useState([]);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);

  function registerUser() {
    fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => setAuthMessage(data.message || data.error))
      .catch((error) => console.error(error));
  }

  function loginUser() {
    fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAuthMessage(data.message || data.error);

        if (data.user_id) {
          setLoggedInUser(data);
          localStorage.setItem("user_id", data.user_id);
          setShowQuestions(false);
        }
      })
      .catch((error) => console.error(error));
  }

  function logoutUser() {
    setLoggedInUser(null);
    localStorage.removeItem("user_id");
    setEmail("");
    setPassword("");
    setAuthMessage("Logged out successfully");
    setShowQuestions(false);
  }

  function getQuestions() {
    fetch(`http://127.0.0.1:8000/questions/${selectedRole}`)
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setAiFeedback("");
        setShowQuestions(true);
      })
      .catch((error) => console.error(error));
  }

  function handleAnswerChange(index, value) {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  }

  function submitAnswers() {
    if (!loggedInUser) {
      alert("Please log in before submitting answers.");
      return;
    }

    fetch("http://127.0.0.1:8000/submit_answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: selectedRole,
        answers: answers,
        user_id: loggedInUser.user_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message || data.error);

        if (data.feedback) {
          setAiFeedback(data.feedback);
        }
      })
      .catch((error) => console.error(error));
  }

  function showSavedAnswersPage() {
    if (!loggedInUser) {
      alert("Please log in to view your saved answers.");
      return;
    }

    fetch(`http://127.0.0.1:8000/answers/${loggedInUser.user_id}`)
      .then((response) => response.json())
      .then((data) => {
        setSavedAnswers(data.saved_answers);
        setShowQuestions("saved");
      })
      .catch((error) => console.error("Error fetching saved answers:", error));
  }

  async function getAIFeedback(question, answer) {
    if (!answer || answer.trim().length < 20) {
      setAiFeedback("Please write a longer answer before requesting AI feedback.");
      return;
    }

    setLoadingFeedback(true);
    setAiFeedback("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          question: question,
          answer: answer,
        }),
      });

      const data = await response.json();

      if (data.feedback) {
        setAiFeedback(data.feedback);
      } else {
        setAiFeedback(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setAiFeedback("Unable to get AI feedback.");
    }

    setLoadingFeedback(false);
  }

  async function getAnalytics() {
    if (!loggedInUser) {
      alert("Please log in to view analytics.");
      return;
    }

    const summaryResponse = await fetch(
      `http://127.0.0.1:8000/analytics/summary/${loggedInUser.user_id}`
    );

    const summaryData = await summaryResponse.json();

    const historyResponse = await fetch(
      `http://127.0.0.1:8000/analytics/history/${loggedInUser.user_id}`
    );

    const historyData = await historyResponse.json();

    setAnalytics(summaryData);
    setAnalyticsHistory(historyData.history);

    setShowQuestions("analytics");
  }

  function formatRole(role) {
    return role
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div className="app">
      {showQuestions === false ? (
        <>
          <nav className="navbar">
            <h2>🤖 AI Interview</h2>

            <div className="nav-links">
              <button onClick={() => setShowQuestions(false)}>Home</button>
              <button onClick={() => setShowQuestions("role")}>Interviews</button>
              <button onClick={showSavedAnswersPage}>History</button>
              <button onClick={getAnalytics}>Analytics</button>
            </div>

            {!loggedInUser ? (
              <div className="nav-auth">
                <button
                  className="secondary-button"
                  onClick={() => setShowQuestions("login")}
                >
                  Login
                </button>

                <button onClick={() => setShowQuestions("register")}>
                  Register
                </button>
              </div>
            ) : (
              <button className="secondary-button" onClick={logoutUser}>
                Logout
              </button>
            )}
          </nav>

          <section className="hero">
            <div className="hero-text">
              <h1>
                AI Career Intelligence <span>Platform</span>
              </h1>

              {loggedInUser ? (
                <p>Welcome back, {loggedInUser.username}! Ready to keep practicing?</p>
              ) : (
                <p>
                  Practice interviews, receive AI-powered feedback, and track your
                  career growth.
                </p>
              )}

              <div className="button-row">
                <button onClick={() => setShowQuestions("role")}>
                  Start Interview →
                </button>

                <button className="secondary-button" onClick={showSavedAnswersPage}>
                  View Saved Answers
                </button>
              </div>

              <p className="auth-message">{authMessage}</p>
            </div>

            <div className="hero-visual">
              <div className="visual-card main-card">
                <div className="visual-avatar">👤</div>

                <div>
                  <div className="visual-line long"></div>
                  <div className="visual-line short"></div>
                  <div className="visual-stars">★★★★★</div>
                </div>
              </div>

              <div className="visual-card floating-card top-card">
                🤖 AI Feedback
              </div>

              <div className="visual-card floating-card chart-card">
                📈 82% Growth
              </div>

              <div className="visual-card floating-card score-card">
                🏆 Strong Answer
              </div>
            </div>
          </section>

          <section className="feature-grid">
            <div className="feature-card">
              <h3>🎯 Mock Interviews</h3>
              <p>
                Role-specific questions for Software Engineering, Data Analytics,
                and Data Science.
              </p>
            </div>

            <div className="feature-card">
              <h3>🤖 AI Feedback</h3>
              <p>
                Get personalized feedback to improve clarity, structure, and
                confidence.
              </p>
            </div>

            <div className="feature-card">
              <h3>📈 Progress Tracking</h3>
              <p>
                Review saved interviews and monitor your improvement over time.
              </p>
            </div>
          </section>

          <section className="stats-section">
            <div className="stat-card">
              <span>👥</span>
              <h2>3+</h2>
              <p>Career Paths</p>
            </div>

            <div className="stat-card">
              <span>🛡️</span>
              <h2>100%</h2>
              <p>Secure Login</p>
            </div>

            <div className="stat-card">
              <span>⚡</span>
              <h2>Instant</h2>
              <p>AI Feedback</p>
            </div>

            <div className="stat-card">
              <span>🗄️</span>
              <h2>PostgreSQL</h2>
              <p>Powered</p>
            </div>
          </section>

          <section className="how-section">
            <h2>How It Works</h2>

            <div className="how-grid">
              <div>
                <h3>1. Create Account</h3>
                <p>Register or login to begin tracking your progress.</p>
              </div>

              <div>
                <h3>2. Choose Role</h3>
                <p>Select Software Engineer, Data Analyst, or Data Scientist.</p>
              </div>

              <div>
                <h3>3. Answer Questions</h3>
                <p>Practice with role-specific interview questions.</p>
              </div>

              <div>
                <h3>4. Review Progress</h3>
                <p>View saved responses and improve over time.</p>
              </div>
            </div>
          </section>
        </>
      ) : showQuestions === "register" ? (
        <section className="auth-card">
          <h1>Create Account</h1>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={registerUser}>Register</button>

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back Home
          </button>

          <p>{authMessage}</p>
        </section>
      ) : showQuestions === "login" ? (
        <section className="auth-card">
          <h1>Login</h1>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={loginUser}>Login</button>

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back Home
          </button>

          <p>{authMessage}</p>
        </section>
      ) : showQuestions === "role" ? (
        <section className="dashboard-layout">
          <aside className="sidebar">
            <h2>🧠 AI Career Intelligence Platform</h2>
            <p>Made by Malcolm Felix</p>

            <button onClick={() => setShowQuestions(false)}>🏠 Home</button>
            <button className="sidebar-active">🎯 Practice Interview</button>
            <button onClick={getAnalytics}>📊 Analytics</button>
            <button onClick={showSavedAnswersPage}>💼 Saved Responses</button>
            <button>📄 Resume Review</button>
            <button>⚙️ Settings</button>
            <button className="logout-button" onClick={logoutUser}>
              🚪 Logout
            </button>
          </aside>

          <main className="practice-area role-page">
            <p className="welcome-text">
              Welcome back, {loggedInUser?.username || "Malcolm"} 👋
            </p>

            <h1>Select a Role</h1>

            <p className="role-subtitle">
              Choose a role to generate personalized interview questions and start practicing.
            </p>

            <div className="role-card">
              <h3>💼 Choose Interview Role</h3>

              <select
                className="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Choose a role</option>
                <option value="software-engineer">Software Engineer</option>
                <option value="data-analyst">Data Analyst</option>
                <option value="data-scientist">Data Scientist</option>
              </select>
            </div>

            <button
              className="generate-button"
              disabled={!selectedRole}
              onClick={getQuestions}
            >
              ✨ Generate Questions
            </button>

            <button className="outline-button" onClick={() => setShowQuestions(false)}>
              ← Back to Home
            </button>
          </main>
        </section>
      ) : showQuestions === "analytics" ? (
        <section className="dashboard-layout">
          <aside className="sidebar">
            <h2>🧠 AI Career Intelligence Platform</h2>
            <p>Made by Malcolm Felix</p>

            <button onClick={() => setShowQuestions("role")}>🎯 Practice Interview</button>
            <button className="sidebar-active">📊 Analytics</button>
            <button onClick={showSavedAnswersPage}>💼 Saved Responses</button>
            <button>📄 Resume Review</button>
            <button>⚙️ Settings</button>
            <button className="logout-button" onClick={logoutUser}>
              🚪 Logout
            </button>
          </aside>

          <main className="practice-area">
            <div className="practice-header">
              <div>
                <h1>📊 Interview Analytics</h1>
                <p>Track your mock interview performance over time.</p>
              </div>

              <button onClick={() => setShowQuestions("role")}>+ New Interview</button>
            </div>

            {analytics ? (
              <div className="saved-stats-grid">
                <div className="stat-card">
                  <h3>Total Interviews</h3>
                  <h2>{analytics.total_interviews}</h2>
                </div>

                <div className="stat-card">
                  <h3>Average Score</h3>
                  <h2>{analytics.average_score}/10</h2>
                </div>

                <div className="stat-card">
                  <h3>Highest Score</h3>
                  <h2>{analytics.highest_score}/10</h2>
                </div>

                <div className="stat-card">
                  <h3>Lowest Score</h3>
                  <h2>{analytics.lowest_score}/10</h2>
                </div>
              </div>
            ) : (
              <p>Loading analytics...</p>
            )}

            <div className="chart-card-container">
              <h2>📈 Score Trend</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="id"
                    label={{
                      value: "Interview Number",
                      position: "insideBottom",
                      offset: -5
                    }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    label={{
                      value: "Score",
                      angle: -90,
                      position: "insideLeft"
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#60a5fa"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="feedback-history">
              <h2>📝 Feedback History</h2>

              {analyticsHistory.map((item) => (
                <div className="feedback-history-card" key={item.id}>
                  <div className="feedback-card-header">
                    <div>
                      <h3>{formatRole(item.role)} Interview #{item.id}</h3>
                      <p>
                        <strong>Score:</strong> {item.score}/10
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedFeedbackId(
                          expandedFeedbackId === item.id ? null : item.id
                        )
                      }
                    >
                      {expandedFeedbackId === item.id ? "Hide Feedback" : "View Feedback"}
                    </button>
                  </div>

                  {expandedFeedbackId === item.id && (
                    <pre>{item.feedback}</pre>
                  )}
                </div>
              ))}
            </div>
          </main>
        </section>
      ) : showQuestions === "saved" ? (
        <section className="dashboard-layout">
          <aside className="sidebar">
            <h2>🧠 AI Career Intelligence Platform</h2>
            <p>Made by Malcolm Felix</p>

            <button onClick={() => setShowQuestions("role")}>🎯 Practice Interview</button>
            <button onClick={getAnalytics}>📊 Analytics</button>
            <button className="sidebar-active">💼 Saved Responses</button>
            <button>📄 Resume Review</button>
            <button>⚙️ Settings</button>
            <button className="logout-button" onClick={logoutUser}>
              🚪 Logout
            </button>
          </aside>

          <main className="practice-area">
            <div className="practice-header">
              <div>
                <h1>Saved Interview Responses</h1>
                <p>Review your past interview answers and track your progress over time.</p>
              </div>

              <button onClick={() => setShowQuestions("role")}>+ New Interview</button>
            </div>

            <div className="saved-stats-grid">
              <div className="stat-card">Total Interviews: {savedAnswers.length}</div>
              <div className="stat-card">Average Score: View Analytics</div>
              <div className="stat-card">Highest Score: View Analytics</div>
              <div className="stat-card">Latest Interview: Coming Soon</div>
            </div>

            <div className="saved-dashboard-grid">
              <div className="saved-list-panel">
                <h2>Your Interviews</h2>

                {savedAnswers.length === 0 ? (
                  <p>No saved answers yet.</p>
                ) : (
                  savedAnswers.map((submission) => (
                    <div
                      className="interview-list-card"
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div>
                        <h3>{formatRole(submission.role)} Interview</h3>
                        <p>{submission.answers.length} Questions</p>
                      </div>

                      <span>Submission #{submission.id}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="interview-detail-panel">
                {selectedSubmission ? (
                  <>
                    <h2>{formatRole(selectedSubmission.role)} Interview</h2>

                    <p>Submission #{selectedSubmission.id}</p>

                    {selectedSubmission.answers.map((answer, index) => (
                      <div className="saved-answer-item" key={index}>
                        <strong>Answer {index + 1}</strong>

                        <p>{answer || "No answer provided."}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <h2>Interview Details</h2>
                    <p>Select an interview to view answers.</p>
                  </>
                )}
              </div>
            </div>
          </main>
        </section>
      ) : (
        <section className="dashboard-layout">
          <aside className="sidebar">
            <h2>🧠 AI Career Intelligence Platform</h2>
            <p>Made by Malcolm Felix</p>

            <button className="sidebar-active">🎯 Practice Interview</button>
            <button onClick={getAnalytics}>📊 Analytics</button>
            <button onClick={showSavedAnswersPage}>💼 Saved Responses</button>
            <button>📄 Resume Review</button>
            <button>⚙️ Settings</button>
            <button className="logout-button" onClick={logoutUser}>
              🚪 Logout
            </button>
          </aside>

          <main className="practice-area">
            <div className="practice-header">
              <div>
                <h1>Practice Interview</h1>
                <p>Answer the following question and get AI-powered feedback.</p>
              </div>

              <span className="role-badge">Role: {formatRole(selectedRole)}</span>
            </div>

            {questions.length > 0 && (
              <>
                <div className="single-question-card">
                  <span className="question-count">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>

                  <h2>{questions[currentQuestionIndex].question}</h2>

                  <label>Your Answer</label>

                  <textarea
                    className="single-answer-box"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestionIndex] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestionIndex, e.target.value)
                    }
                  />

                  <button
                    className="ai-feedback-button"
                    onClick={() =>
                      getAIFeedback(
                        questions[currentQuestionIndex].question,
                        answers[currentQuestionIndex]
                      )
                    }
                  >
                    ✨ Get AI Feedback
                  </button>
                </div>

                {loadingFeedback && <p>Generating AI feedback...</p>}

                {aiFeedback && (
                  <div className="ai-feedback-card">
                    <h3>🤖 AI Interview Coach Feedback</h3>
                    <pre>{aiFeedback}</pre>
                  </div>
                )}

                <div className="question-nav">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setAiFeedback("");
                    }}
                  >
                    ← Previous Question
                  </button>

                  <button
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={() => {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setAiFeedback("");
                    }}
                  >
                    Next Question →
                  </button>
                </div>

                <button onClick={submitAnswers}>Submit Answers</button>

                <button className="back-button" onClick={() => setShowQuestions("role")}>
                  Change Role
                </button>
              </>
            )}
          </main>
        </section>
      )}
    </div>
  );
}

export default App;