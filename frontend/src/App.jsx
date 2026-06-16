import { useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [answers, setAnswers] = useState([]);
  const [savedAnswers, setSavedAnswers] = useState([]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);


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
          setShowQuestions(false);
        }
      })
      .catch((error) => console.error(error));
  }

  function logoutUser() {
    setLoggedInUser(null);
    setEmail("");
    setPassword("");
    setAuthMessage("Logged out successfully");
  }

  function getQuestions() {
    fetch(`http://127.0.0.1:8000/questions/${selectedRole}`)
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions);
        setAnswers([]);
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
      .then((data) => alert(data.message))
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
        <section>
          <h1>Select a Role</h1>

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

          <br />
          <br />

          <button disabled={!selectedRole} onClick={getQuestions}>
            Generate Questions
          </button>

          <br />
          <br />

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back Home
          </button>
        </section>
      ) : showQuestions === "saved" ? (
        <section className="saved-page">
          <h1>Saved Interview Responses</h1>
          <p className="page-description">
            Review your past interview answers and track your progress over time.
          </p>

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back Home
          </button>

          <div className="saved-answers-section">
            {savedAnswers.length === 0 ? (
              <p>No saved answers yet.</p>
            ) : (
              savedAnswers.map((submission) => (
                <div className="saved-answer-card" key={submission.id}>
                  <div className="saved-card-header">
                    <h3>{formatRole(submission.role)}</h3>
                    <span>Submission #{submission.id}</span>
                  </div>

                  <div className="saved-answer-list">
                    {submission.answers.map((answer, index) => (
                      <div className="saved-answer-item" key={index}>
                        <strong>Answer {index + 1}</strong>
                        <p>{answer || "No answer provided."}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        <section>
          <h1>Interview Practice</h1>
          <h2>{formatRole(selectedRole)} Interview Questions</h2>

          <div className="interview-info">
            <span>{questions.length} Questions</span>
            <span>Estimated Time: 15 Minutes</span>
            <span>Role-Based Practice</span>
          </div>

          <div className="question-grid">
            {questions.map((question, index) => (
              <div className="question-card" key={index}>
                <span>{question.category}</span>
                <p>{question.question}</p>

                <textarea
                  className="answer-box"
                  placeholder="Type your answer here..."
                  value={answers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />

                <button
                  className="ai-feedback-button"
                  onClick={() => getAIFeedback(question.question, answers[index])}
                >
                  Get AI Feedback
                </button>
              </div>
            ))}
          </div>
          {loadingFeedback && <p>Generating AI feedback...</p>}

          {aiFeedback && (
            <div className="ai-feedback-card">
              <h3>🤖 AI Interview Coach Feedback</h3>
              <pre>{aiFeedback}</pre>
            </div>
          )}

          <button onClick={submitAnswers}>
            Submit Answers
          </button>

          <button className="back-button" onClick={() => setShowQuestions("role")}>
            Change Role
          </button>

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back to Home
          </button>
        </section>
      )}

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h3>🤖 AI Interview</h3>
            <p>Your AI-powered partner for interview preparation and career growth.</p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <p>Home</p>
            <p>Interviews</p>
            <p>History</p>
          </div>

          <div>
            <h4>Built With</h4>
            <p>React • FastAPI</p>
            <p>PostgreSQL • AI</p>
          </div>

          <div>
            <h4>Connect</h4>
            <a href="https://github.com/Mfelix21" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <br />
            <a
              href="https://www.linkedin.com/in/malcolm-felix-91140a250/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <p className="footer-bottom">Built by Malcolm Felix © 2026</p>
      </footer>
    </div>
  );
}

export default App;

