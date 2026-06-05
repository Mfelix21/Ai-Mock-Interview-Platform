import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/questions")
      .then((response) => response.json())
      .then((data) => setQuestions(data.questions))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="app">
      {showQuestions === false ? (
        <section className="hero">
          <h1>AI Mock Interview Platform</h1>
          <p>
            Practice technical interviews with role-specific questions and
            AI-powered feedback.
          </p>

          <button onClick={() => setShowQuestions("role")}>
            Start Interview
          </button>
        </section>
      ) : showQuestions === "role" ? (
        <section>
          <h1>Select a Role</h1>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Choose a role</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Product Manager">Product Manager</option>
          </select>

          <br />
          <br />

          <button disabled={!selectedRole} onClick={() => setShowQuestions(true)}>
            Generate Questions
          </button>

          <br />
          <br />

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back Home
          </button>
        </section>
      ) : (
        <section>
          <h1>Interview Practice</h1>
          <h2>{selectedRole} Interview Questions</h2>

          <div className="question-grid">
            {questions.map((question, index) => (
              <div className="question-card" key={index}>
                <span>Question {index + 1}</span>
                <p>{question}</p>
              </div>
            ))}
          </div>

          <button className="back-button" onClick={() => setShowQuestions("role")}>
            Change Role
          </button>

          <button className="back-button" onClick={() => setShowQuestions(false)}>
            Back to Home
          </button>
        </section>
      )}

      <footer className="footer">
        <h3>AI Mock Interview Platform</h3>
        <p>React • FastAPI • REST APIs</p>

        <div className="footer-links">
          <a href="https://github.com/Mfelix21" target="_blank" rel="noreferrer">
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/malcolm-felix-91140a250/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>

        <p>Built by Malcolm Felix © 2026</p>
      </footer>
    </div>
  );
}

export default App;