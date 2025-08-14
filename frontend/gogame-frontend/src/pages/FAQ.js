import React, { useState } from 'react';
import faqstyle from "./FAQ.module.css";

/*  This is a simple FAQ component that displays a list of questions and answers. 
    If this list were to grow, we would want to consider fetching it from a server or
    storing it in a more dynamic way. Since this is a short finite list, we can hardcode it no problem. */
const faqData = [
  {
    question: "What is Go?",
    answer: "Go is an ancient strategy board game that originated in China over 2,500 years ago. Two players take turns placing stones to surround more territory than their opponent."
  },
  {
    question: "How do I navigate this site?",
    answer: `Use the navigation bar at the top of the page to access different sections: 
• "Play" lets you challenge the AI.
• "Multiplayer" connects you with another player.
• "SGF Viewer" helps you explore and study past Go games.`
  },
  {
    question: "What’s the difference between Single Player and Multiplayer?",
    answer: "Single Player lets you play against an AI opponent. Multiplayer pairs you with another human player for a live game session."
  },
  {
    question: "Where can I learn the rules of Go?",
    answer: "Click the 'Rules' tab in the navigation bar for a full overview. It covers how to place stones, capture territory, and how scoring works."
  },
  {
    question: "How can I improve my Go skills?",
    answer: `Practice regularly, review your games, and study strategies from stronger players. 
You can also explore the SGF Viewer to learn from real recorded games and tactics used by others.`
  }
];

/* ======================
   FULL FAQ COMPONENT
   - Displays a list of questions and answers.
   - Allows users to expand/collapse answers.
   - Uses local state to track which answer is currently expanded.
   - Simple and effective for a short FAQ list.
   - Can be easily expanded with more questions or fetched from an API if needed.
   ====================== */

function FAQ() {
  // Can only expand one answer at a time, so we keep track of the currently expanded index.
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Function to toggle the visibility of an answer 
  // based on the index of the question clicked.
  // If the same question is clicked again, it collapses the answer.
  const toggleAnswer = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={faqstyle.faqContainer}>
      <div className= {faqstyle.faqContent}>
        <h1 className={faqstyle.faqTitle}>Frequently Asked Questions</h1>
        {/* Looks for through the list for the index of the question clicked and toggles the answer visibility. */}
        {faqData.map((item, index) => (
          <div key={index} className={faqstyle.faqItem}>
            {/* Button to toggle the answer visibility. */}
            <button
              className={faqstyle.faqQuestion}
              onClick={() => toggleAnswer(index)}
            >
              {item.question}
              {/* Set up an icon to indicate whether the answer is expanded or collapsed. */}
              <span className={faqstyle.icon}>
                {expandedIndex === index ? "−" : "+"}
              </span>
            </button>
            {/* Condition to check if the current index matches the expanded index and displays the answer. */}
            {expandedIndex === index && (
              <div className={faqstyle.answer}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
