import { useUser } from "@clerk/clerk-react"
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import api from "@/lib/api"
import { motion } from "framer-motion"
import { FileText, Pencil, Check, X, Download, Trash2, Loader2, Upload } from "lucide-react"
import DeleteModal from "@/components/ui/DeleteModal"
import { toast } from "sonner"
import { Link } from "react-router-dom"

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
const MAX_WORDS = 150

interface Note {
    id: string
    title: string
    subject: string
    semester: string
    year: string
    file_url: string
    file_name: string
    created_at: string
    user_id: string
}

function countWords(text: string) {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

function getDownloadUrl(url: string) {
    return url.includes("cloudinary.com") ? url.replace("/upload/", "/upload/fl_attachment/") : url
}

export default function Profile() {
    const { user } = useUser()
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)

    const [about, setAbout] = useState<string>("")
    const [editingAbout, setEditingAbout] = useState(false)
    const [aboutDraft, setAboutDraft] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const wordCount = countWords(aboutDraft)
    const wordsLeft = MAX_WORDS - wordCount

    const fetchNotes = async () => {
        if (!user) return
        try {
            const response = await api.get(`/api/files?userId=${user.id}`)
            setNotes(response.data)
        } catch (error) {
            console.error("Failed to fetch notes", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) return
        const saved = localStorage.getItem(`agricloud_about_${user.id}`)
        if (saved) setAbout(saved)
        fetchNotes()
        const socket = io(SOCKET_URL)
        socket.on("files_updated", () => fetchNotes())
        return () => { socket.disconnect() }
    }, [user])

    const startEditAbout = () => {
        setAboutDraft(about)
        setEditingAbout(true)
        setTimeout(() => textareaRef.current?.focus(), 50)
    }

    const saveAbout = () => {
        if (wordCount > MAX_WORDS || wordCount === 0) return
        localStorage.setItem(`agricloud_about_${user?.id}`, aboutDraft)
        setAbout(aboutDraft)
        setEditingAbout(false)
        toast.success("Bio saved! ✅")
    }

    const cancelAbout = () => { setEditingAbout(false); setAboutDraft("") }

    const handleDelete = async () => {
        if (!deleteTarget || !user) return
        setIsDeleting(true)
        try {
            await api.delete(`/api/files/${deleteTarget.id}`, { data: { userId: user.id } })
            setNotes(prev => prev.filter(n => n.id !== deleteTarget.id))
            toast.success("Note deleted 🗑️")
        } catch {
            toast.error("Failed to delete. Try again.")
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    if (!user) return null

    const joinedDate = new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", {
        month: "short", year: "numeric"
    })

    return (
        <div className="pb-10 animate-fade-in">
            <DeleteModal
                isOpen={!!deleteTarget}
                fileName={deleteTarget?.title}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* ── Cover + Avatar ─────────────────────────── */}
            <div className="relative">
                {/* Cover banner */}
                <div className="h-32 sm:h-44 w-full rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-secondary)] relative overflow-hidden">
                    {/* decorative blobs */}
                    <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ position: "absolute", bottom: "-20%", left: "5%", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <span className="text-8xl">🌾</span>
                    </div>
                </div>

                {/* Avatar — overlapping cover */}
                <div className="absolute left-4 sm:left-8" style={{ bottom: "-44px" }}>
                    <div className="relative inline-block">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-white">
                            <img
                                src={user.imageUrl}
                                alt={user.fullName || "User"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span title="Online" className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                </div>
            </div>

            {/* ── Name / Email / Badges ─────────────────── */}
            <div className="mt-14 sm:mt-16 px-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-main)] leading-tight">
                            {user.fullName}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">🎓 Student</span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600">🌟 AgriCloud</span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">📅 Since {joinedDate}</span>
                        </div>
                    </div>

                    {/* Upload CTA */}
                    <Link to="/upload">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all mt-1">
                            <Upload size={13} /> Upload Note
                        </button>
                    </Link>
                </div>

                {/* ── Stats row ──────────────────────────── */}
                <div className="grid grid-cols-3 gap-2 mt-5">
                    <StatPill icon="📤" label="Uploads" value={loading ? "…" : notes.length} />
                    <StatPill icon="🌟" label="Reputation" value="Top 10%" />
                    <StatPill icon="📚" label="Community" value="Active" />
                </div>
            </div>

            {/* ── About Me ──────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 mx-0 bg-white rounded-2xl border border-[var(--color-border)] p-4 shadow-sm"
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-[var(--color-text-main)]">About Me ✍️</h2>
                    {!editingAbout && (
                        <button
                            onClick={startEditAbout}
                            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)]/20 active:scale-95 transition-all"
                        >
                            <Pencil size={10} /> Edit
                        </button>
                    )}
                </div>

                {editingAbout ? (
                    <div className="space-y-2">
                        <textarea
                            ref={textareaRef}
                            value={aboutDraft}
                            onChange={e => setAboutDraft(e.target.value)}
                            rows={4}
                            placeholder="Tell your fellow students about yourself — your stream, interests, favourite subjects... 🌾"
                            className="w-full rounded-xl border border-[var(--color-border)] bg-gray-50 p-3 text-sm text-[var(--color-text-main)] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all"
                        />
                        <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-medium ${wordsLeft < 0 ? "text-red-500" : wordsLeft <= 20 ? "text-amber-500" : "text-gray-400"}`}>
                                {wordCount}/{MAX_WORDS} words{wordsLeft < 0 ? " — too long!" : ""}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={cancelAbout} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all">
                                    <X size={11} /> Cancel
                                </button>
                                <button
                                    onClick={saveAbout}
                                    disabled={wordCount > MAX_WORDS || wordCount === 0}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                                >
                                    <Check size={11} /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {about || <span className="italic text-gray-400">No bio yet — tap <strong className="text-[var(--color-primary)]">Edit</strong> to introduce yourself! 👋</span>}
                    </p>
                )}
            </motion.div>

            {/* ── My Uploads ────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-4 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden"
            >
                {/* Section header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                    <h2 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                        My Uploads
                        {!loading && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                {notes.length}
                            </span>
                        )}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
                        <span className="text-5xl">📭</span>
                        <p className="font-semibold text-[var(--color-text-muted)] text-sm">No uploads yet!</p>
                        <p className="text-xs text-gray-400">Share your notes and help the community 🌱</p>
                        <Link to="/upload">
                            <button className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all">
                                Upload your first note
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {notes.map((note, i) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                {/* File icon */}
                                <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                    <FileText size={15} className="text-[var(--color-primary)]" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[var(--color-text-main)] truncate leading-tight">
                                        {note.title}
                                    </p>
                                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                                        {note.subject} · Sem {note.semester} · {new Date(note.created_at).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                {/* Action buttons — always visible on mobile */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <a
                                        href={getDownloadUrl(note.file_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Download"
                                        className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 flex items-center justify-center transition-colors active:scale-95"
                                    >
                                        <Download size={13} className="text-[var(--color-primary)]" />
                                    </a>
                                    <button
                                        title="Delete"
                                        onClick={() => setDeleteTarget(note)}
                                        disabled={isDeleting && deleteTarget?.id === note.id}
                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors active:scale-95"
                                    >
                                        {isDeleting && deleteTarget?.id === note.id
                                            ? <Loader2 size={13} className="animate-spin text-red-400" />
                                            : <Trash2 size={13} className="text-red-500" />
                                        }
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: string | number }) {
    return (
        <div className="flex flex-col items-center justify-center py-3 px-1 bg-white rounded-xl border border-[var(--color-border)] shadow-sm text-center">
            <span className="text-lg leading-tight">{icon}</span>
            <span className="text-sm sm:text-base font-extrabold text-[var(--color-text-main)] mt-0.5 leading-tight">{value}</span>
            <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{label}</span>
        </div>
    )
}
