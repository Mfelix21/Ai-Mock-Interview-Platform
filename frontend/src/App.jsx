import { useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [answers, setAnswers] = useState([]);

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
    fetch("http://127.0.0.1:8000/submit_answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: selectedRole,
        answers: answers,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      })
      .catch((error) => console.error(error));
  }

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
      ) : (
        <section>
          <h1>Interview Practice</h1>
          <h2>
            {selectedRole
              .split("-")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            {" "}Interview Questions
          </h2>

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
              </div>
            ))}
          </div>

          <button onClick={submitAnswers}>Submit Answers</button>

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

