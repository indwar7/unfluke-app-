import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  InputGroup,
  UncontrolledTooltip,
} from "reactstrap";
import { chatbotSocket } from "../../../socket";
import "./ChatbotDemo.css";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourcesModal from "./SourcesModal";
import { ToastContainer } from "react-toastify";
import axios from "axios";

const MarkdownContainer = styled.div`
  margin: 0;
  padding: 0;

  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  ul,
  ol {
    margin: 0;
    padding: 2;
  }

  p:last-child {
    margin-bottom: 0; /* Remove extra space at the end */
  }
`;

const ChatbotDemo = () => {
  const [input, setInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState("Educational");
  const [chatHistory, addChatHistory] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const uniqueUserIdRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const divRef = useRef(null);
  const [limitExhausted, setLimitExhausted] = useState(false);

  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [sources, setSources] = useState({});

  // Initialize the unique user ID only once
  if (uniqueUserIdRef.current === null) {
    uniqueUserIdRef.current = new Date().getMilliseconds();
  }

  const bots = ["Educational"];

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleEdBotChat();
    }
  };

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const handleSelect = (option) => {
    setSelectedBot(option);
  };

  const scrollToBottom = () => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  };

  const handleEdBotChat = async () => {
    if (limitExhausted) return;

    if (!loading && input.trim()) {
      try {
        addChatHistory((prevHistory) => [
          ...prevHistory,
          { role: "user", content: input },
        ]);

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input, mode: selectedBot },
          { sender: "bot-stream", text: "", mode: selectedBot },
        ]);
        setLoading(true);
        setInput("");

        chatbotSocket.emit("chat", {
          userid: "guest",
          uniquetoken: uniqueUserIdRef.current,
          message: input,
          api_key: process.env.REACT_APP_CHATBOT_TOKEN,
          chat_history: chatHistory,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (chatbotSocket) {
      // Listen for real-time messages from backend
      chatbotSocket.on("chat_response", (data) => {
        if (data["unique_token"] == uniqueUserIdRef.current) {
          const newContent = data.message;
          setStreamingMessage((prev) =>
            (prev + newContent).replace("<<IKNOW>>", "")
          );
        }
      });

      chatbotSocket.on("error", () => {
        alert("An error occurred. Please try again later.");
        setLoading(false);
      });

      chatbotSocket.on("stream_ended", (data) => {
        const setDemoUsage = async () => {
          try {
            const response = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/aichat/setDemoUsed`
            );
            if (response) setLimitExhausted(true);
          } catch (error) {
            console.error("Error checking chatbot usage", error);
          }
        };

        if (data["unique_token"] == uniqueUserIdRef.current) {
          const docs = data.docs;

          setMessages((prevMessages) => [
            ...prevMessages.slice(0, prevMessages.length - 1),
            {
              sender: "bot",
              text: data.message,
              mode: selectedBot,
              docs: data.message.indexOf("<<IKNOW>>") !== -1 ? docs : {},
            },
          ]);

          addChatHistory((prevHistory) => [
            ...prevHistory,
            { role: "assistant", content: data.message },
          ]);

          setStreamingMessage("");
          setLoading(false);
          setDemoUsage();
        }
      });

      return () => {
        chatbotSocket.off("chat_response");
        chatbotSocket.off("stream_ended");
        chatbotSocket.off("error");
      };
    }
  });

  useEffect(() => {
    if (!limitExhausted) {
      const checkUsage = async () => {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/aichat/getDemoUsed`
          );
          if (response) setLimitExhausted(response.used);
        } catch (error) {
          console.error("Error checking chatbot usage", error);
        }
      };

      checkUsage();
    }
  }, [limitExhausted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {sourcesModalOpen && (
        <SourcesModal
          sourcesModalOpen={sourcesModalOpen}
          setSourcesModalOpen={setSourcesModalOpen}
          sources={sources}
        />
      )}

      <ToastContainer />

      <div className="chatbot-demo-container">
        <div className="chat-window">
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              textAlign: "center",
              minHeight: "600px",
            }}
            ref={divRef}
          >
            {messages.length > 0 ? (
              messages
                .filter((msg) => msg.mode === selectedBot)
                .map((msg, index) => (
                  <>
                    <div className="hstack">
                      {msg.sender.startsWith("bot") && (
                        <div className="bot-logo" />
                      )}
                      {msg.sender !== "bot-stream" && (
                        <div
                          key={index}
                          className={`message ${
                            msg.sender === "user" ? "user" : "bot"
                          } ${msg.sender === "bot-loading" && "bot-loading"}`}
                        >
                          <MarkdownContainer>
                            {
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.text.replace("<<IKNOW>>", "")}
                              </ReactMarkdown>
                            }
                          </MarkdownContainer>
                        </div>
                      )}
                      {msg.sender === "bot-stream" &&
                        index === messages.length - 1 &&
                        streamingMessage && (
                          <div className={`message bot`}>
                            <MarkdownContainer>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {streamingMessage}
                              </ReactMarkdown>
                            </MarkdownContainer>
                          </div>
                        )}
                    </div>
                  </>
                ))
            ) : (
              <h4 className="mt-3">Hi! I'm the Unfluke bot!</h4>
            )}
          </div>
        </div>

        <Form onSubmit={(e) => e.preventDefault()}>
          <FormGroup className="input-container p-0">
            <InputGroup>
              {/*<Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                                <DropdownToggle caret>
                                {selectedBot}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {
                                        bots.map((name)=>
                                            <DropdownItem onClick={() => handleSelect(name)}>{name}</DropdownItem>
                                        )
                                    }
                                </DropdownMenu>
                            </Dropdown>*/}
              {limitExhausted && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      color: "white",
                      fontSize: "1rem",
                      textAlign: "center",
                      padding: "0.8rem",
                      backgroundColor: "rgba(0, 0, 0, 1)",
                      borderRadius: "8px",
                    }}
                  >
                    To use more of the chatbot, please{" "}
                    <a
                      href="https://unfluke.in/login"
                      style={{
                        color: "#007bff",
                        textDecoration: "underline",
                      }}
                    >
                      sign in
                    </a>
                    .
                  </div>
                </div>
              )}
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading || limitExhausted}
                style={{
                  fontSize: "medium",
                }}
              />
              <Button
                color="primary"
                onClick={handleEdBotChat}
                disabled={loading || limitExhausted}
              >
                <i
                  className="ri-send-plane-2-fill align-bottom"
                  style={{
                    fontSize: 18,
                  }}
                ></i>
              </Button>
            </InputGroup>
          </FormGroup>
        </Form>
      </div>
    </>
  );
};

export default ChatbotDemo;
