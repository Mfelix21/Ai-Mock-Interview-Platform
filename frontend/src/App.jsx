import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/questions")
      .then((response) => response.json())
      .then((data) => setQuestions(data.questions))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="app">
      <h1>AI Mock Interview Platform</h1>
      <p className="subtitle">Practice software engineering interviews with AI-powered questions.</p>

      <h2>Interview Questions</h2>

      <div className="question-grid">
        {questions.map((question, index) => (
          <div className="question-card" key={index}>
            <span>Question {index + 1}</span>
            <p>{question}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;