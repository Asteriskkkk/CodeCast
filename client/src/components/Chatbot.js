import { useState, useEffect, useRef } from "react";
import axios from "axios";

function Chatbot({ currentCode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/generate`,
        { contextCode: currentCode, message: input },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.generatedCode || "No response from server." }
      ]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error fetching response. Please try again later." }
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="bg-dark text-light p-3 rounded shadow-sm" style={{ width: "auto" }}>
      {/* Chat Header */}
      <div className="fw-bold text-center mb-2">Chat Assistant</div>

      {/* Messages Container */}
      <div className="p-2 bg-secondary rounded" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={index} className={`text-${msg.sender === "user" ? "end" : "start"} mb-2`}>
            <span className="fw-bold">{msg.sender === "user" ? "You: " : "Assistant: "}</span> {msg.text}
          </div>
        ))}
        {isTyping && <div className="text-start text-muted">Assistant is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Send Button */}
      <div className="d-flex mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="form-control me-2"
          placeholder="Type a message..."
          autoFocus
        />
        <button onClick={sendMessage} className="btn btn-primary">Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
