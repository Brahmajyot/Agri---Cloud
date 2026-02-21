import { useState } from "react";

// Number is loaded from .env — never hardcoded in source
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string;

const DEFAULT_MESSAGE = "Hi! I need support with AgriCloud. 🌾";

export default function WhatsAppFeedback() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const handleSend = () => {
        const text = message.trim() || DEFAULT_MESSAGE;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        setOpen(false);
        setMessage("");
    };

    return (
        <>
            {/* Floating WhatsApp Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Open WhatsApp Support"
                className="whatsapp-fab"
                title="Chat with Support on WhatsApp"
            >
                {/* WhatsApp SVG Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    fill="white"
                    width="28"
                    height="28"
                >
                    <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.65 4.76 1.78 6.76L2 30l7.44-1.74A13.92 13.92 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.6l-.42-.25-4.42 1.03 1.06-4.3-.27-.44A11.5 11.5 0 1 1 16 27.5zm6.3-8.57c-.34-.17-2.02-1-2.33-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69a10.27 10.27 0 0 1-1.89-2.36c-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.54-.28-.67-.56-.58-.77-.59l-.65-.01c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79 0 1.64 1.2 3.23 1.37 3.45.17.22 2.36 3.6 5.72 5.05.8.35 1.42.55 1.91.71.8.26 1.53.22 2.11.13.64-.1 2.02-.82 2.3-1.62.28-.79.28-1.47.2-1.61-.08-.14-.31-.22-.65-.39z" />
                </svg>
            </button>

            {/* Feedback Popup */}
            {open && (
                <div className="whatsapp-popup" role="dialog" aria-modal="true" aria-label="WhatsApp Support">
                    {/* Header */}
                    <div className="whatsapp-popup-header">
                        <div className="whatsapp-avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" width="22" height="22">
                                <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.65 4.76 1.78 6.76L2 30l7.44-1.74A13.92 13.92 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.6l-.42-.25-4.42 1.03 1.06-4.3-.27-.44A11.5 11.5 0 1 1 16 27.5zm6.3-8.57c-.34-.17-2.02-1-2.33-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69a10.27 10.27 0 0 1-1.89-2.36c-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.54-.28-.67-.56-.58-.77-.59l-.65-.01c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79 0 1.64 1.2 3.23 1.37 3.45.17.22 2.36 3.6 5.72 5.05.8.35 1.42.55 1.91.71.8.26 1.53.22 2.11.13.64-.1 2.02-.82 2.3-1.62.28-.79.28-1.47.2-1.61-.08-.14-.31-.22-.65-.39z" />
                            </svg>
                        </div>
                        <div className="whatsapp-popup-title">
                            <p className="whatsapp-popup-name">AgriCloud Support</p>
                            <p className="whatsapp-popup-status">🟢 Typically replies in minutes</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="whatsapp-close-btn"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat Bubble */}
                    <div className="whatsapp-chat-area">
                        <div className="whatsapp-bubble">
                            👋 Hi there! How can we help you today? Send us a message and we'll get back to you on WhatsApp!
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="whatsapp-input-area">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="whatsapp-textarea"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button onClick={handleSend} className="whatsapp-send-btn" aria-label="Send message">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        .whatsapp-fab {
          position: fixed;
          bottom: 90px;
          right: 20px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25d366, #128c7e);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: wa-pulse 2.5s infinite;
        }
        .whatsapp-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(37,211,102,0.7);
        }
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.5); }
          50% { box-shadow: 0 4px 32px rgba(37,211,102,0.85); }
        }

        /* On mobile, keep above bottom nav */
        @media (max-width: 768px) {
          .whatsapp-fab {
            bottom: 80px;
            right: 16px;
          }
          .whatsapp-popup {
            bottom: 144px !important;
            right: 8px !important;
            width: calc(100vw - 16px) !important;
          }
        }

        .whatsapp-popup {
          position: fixed;
          bottom: 160px;
          right: 20px;
          z-index: 9998;
          width: 320px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
          animation: wa-slide-up 0.25s ease;
        }
        @keyframes wa-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .whatsapp-popup-header {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #25d366, #128c7e);
          padding: 14px 16px;
        }
        .whatsapp-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .whatsapp-popup-title { flex: 1; }
        .whatsapp-popup-name {
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          margin: 0;
        }
        .whatsapp-popup-status {
          font-size: 11px;
          color: rgba(255,255,255,0.85);
          margin: 2px 0 0;
        }
        .whatsapp-close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          line-height: 1;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .whatsapp-close-btn:hover { opacity: 1; }

        .whatsapp-chat-area {
          background: #ece5dd url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' opacity='0.07'%3E%3Ccircle cx='10' cy='10' r='8' fill='%23128c7e'/%3E%3C/svg%3E");
          padding: 16px;
          min-height: 80px;
        }
        .whatsapp-bubble {
          background: #fff;
          border-radius: 0 12px 12px 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #333;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          line-height: 1.5;
          position: relative;
        }

        .whatsapp-input-area {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: #f0f0f0;
          padding: 10px 12px;
          border-top: 1px solid #ddd;
        }
        .whatsapp-textarea {
          flex: 1;
          border: none;
          border-radius: 20px;
          padding: 8px 14px;
          font-size: 13px;
          resize: none;
          outline: none;
          background: #fff;
          color: #333;
          line-height: 1.4;
        }
        .whatsapp-textarea::placeholder { color: #aaa; }
        .whatsapp-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25d366, #128c7e);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .whatsapp-send-btn:hover { transform: scale(1.08); }
      `}</style>
        </>
    );
}
