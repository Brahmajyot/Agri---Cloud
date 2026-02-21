import { useEffect } from "react"

interface DeleteModalProps {
    isOpen: boolean
    fileName?: string
    onConfirm: () => void
    onCancel: () => void
}

export default function DeleteModal({ isOpen, fileName, onConfirm, onCancel }: DeleteModalProps) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    return (
        <div
            className="delete-modal-backdrop"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-label="Delete confirmation"
        >
            <div
                className="delete-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="delete-modal-icon">🗑️</div>

                {/* Text */}
                <h2 className="delete-modal-title">Delete this note?</h2>
                {fileName && (
                    <p className="delete-modal-subtitle">
                        "<span>{fileName}</span>" will be gone forever. No take-backs! 😅
                    </p>
                )}
                {!fileName && (
                    <p className="delete-modal-subtitle">
                        This note will be gone forever. No take-backs! 😅
                    </p>
                )}

                {/* Buttons */}
                <div className="delete-modal-actions">
                    <button className="delete-modal-cancel" onClick={onCancel}>
                        Nah, keep it
                    </button>
                    <button className="delete-modal-confirm" onClick={onConfirm}>
                        Yeah, delete it 🔥
                    </button>
                </div>
            </div>

            <style>{`
        .delete-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: dm-fade-in 0.18s ease;
        }
        @keyframes dm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .delete-modal-card {
          background: #fff;
          border-radius: 24px;
          padding: 36px 28px 28px;
          max-width: 360px;
          width: 100%;
          text-align: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.2);
          animation: dm-pop 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes dm-pop {
          from { transform: scale(0.85) translateY(20px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }

        .delete-modal-icon {
          font-size: 52px;
          margin-bottom: 12px;
          animation: dm-shake 0.5s ease 0.2s;
        }
        @keyframes dm-shake {
          0%,100% { transform: rotate(0deg);   }
          20%     { transform: rotate(-12deg);  }
          40%     { transform: rotate(12deg);   }
          60%     { transform: rotate(-8deg);   }
          80%     { transform: rotate(8deg);    }
        }

        .delete-modal-title {
          font-size: 20px;
          font-weight: 800;
          color: #111;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }

        .delete-modal-subtitle {
          font-size: 13.5px;
          color: #666;
          margin: 0 0 24px;
          line-height: 1.5;
        }
        .delete-modal-subtitle span {
          font-weight: 600;
          color: #333;
        }

        .delete-modal-actions {
          display: flex;
          gap: 10px;
        }

        .delete-modal-cancel {
          flex: 1;
          padding: 12px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #f9fafb;
          color: #444;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .delete-modal-cancel:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .delete-modal-confirm {
          flex: 1;
          padding: 12px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(239,68,68,0.35);
        }
        .delete-modal-confirm:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239,68,68,0.45);
        }
        .delete-modal-confirm:active {
          transform: translateY(0);
        }
      `}</style>
        </div>
    )
}
