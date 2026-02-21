import { useUser } from "@clerk/clerk-react"
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import api from "@/lib/api"
import { motion } from "framer-motion"
import { FileText, Pencil, Check, X, Download, Trash2, Loader2 } from "lucide-react"
import DeleteModal from "@/components/ui/DeleteModal"
import { toast } from "sonner"

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

export default function Profile() {
    const { user } = useUser()
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)

    // About section
    const [about, setAbout] = useState<string>(() =>
        localStorage.getItem(`agricloud_about_${user?.id}`) || ""
    )
    const [editingAbout, setEditingAbout] = useState(false)
    const [aboutDraft, setAboutDraft] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Delete modal
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

        // Load saved about from localStorage per user
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
        if (wordCount > MAX_WORDS) return
        localStorage.setItem(`agricloud_about_${user?.id}`, aboutDraft)
        setAbout(aboutDraft)
        setEditingAbout(false)
        toast.success("About updated! ✅")
    }

    const cancelAbout = () => {
        setEditingAbout(false)
        setAboutDraft("")
    }

    const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        // Allow typing but show warning when over limit
        setAboutDraft(val)
    }

    const handleDelete = async () => {
        if (!deleteTarget || !user) return
        setIsDeleting(true)
        try {
            await api.delete(`/api/files/${deleteTarget.id}`, {
                data: { userId: user.id }
            })
            setNotes(prev => prev.filter(n => n.id !== deleteTarget.id))
            toast.success("Note deleted 🗑️")
        } catch {
            toast.error("Failed to delete. Try again.")
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    const getDownloadUrl = (url: string) =>
        url.includes("cloudinary.com") ? url.replace("/upload/", "/upload/fl_attachment/") : url

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 md:p-6">

            {/* Delete Modal */}
            <DeleteModal
                isOpen={!!deleteTarget}
                fileName={deleteTarget?.title}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* ── Hero Card ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl border border-[var(--color-border)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-[var(--color-primary)]/25 to-[var(--color-secondary)]/25" />

                <div className="p-6 md:p-8 pt-10 md:pt-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 mt-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-28 h-28 rounded-full p-1 bg-white/10 backdrop-blur-md border border-[var(--color-border)] shadow-xl">
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || "User"}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow" title="Online" />
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left space-y-1 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-main)]">{user.fullName}</h1>
                            <p className="text-[var(--color-text-muted)] flex items-center justify-center md:justify-start gap-2 text-sm">
                                <span>📧</span> {user.primaryEmailAddress?.emailAddress}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">Student</span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">AgriCloud</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-8">
                        <StatCard icon="📤" label="Uploads" value={loading ? "…" : notes.length} />
                        <StatCard icon="🌟" label="Reputation" value="Top 10%" />
                        <StatCard icon="📅" label="Joined" value={new Date(user.createdAt || Date.now()).toLocaleDateString()} />
                    </div>
                </div>
            </motion.div>

            {/* ── About Section ─────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 rounded-2xl border border-[var(--color-border)]"
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-[var(--color-text-main)]">About Me ✍️</h2>
                    {!editingAbout && (
                        <button
                            onClick={startEditAbout}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)]/20 transition-colors"
                        >
                            <Pencil size={12} /> Edit
                        </button>
                    )}
                </div>

                {editingAbout ? (
                    <div className="space-y-3">
                        <textarea
                            ref={textareaRef}
                            value={aboutDraft}
                            onChange={handleAboutChange}
                            rows={5}
                            placeholder="Tell your fellow students about yourself — your stream, interests, or what notes you usually share... 🌾"
                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-3 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all"
                        />
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${wordsLeft < 0 ? "text-red-500" : wordsLeft <= 20 ? "text-amber-500" : "text-[var(--color-text-muted)]"}`}>
                                {wordCount}/{MAX_WORDS} words {wordsLeft < 0 ? "— too long!" : ""}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={cancelAbout} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors">
                                    <X size={13} /> Cancel
                                </button>
                                <button
                                    onClick={saveAbout}
                                    disabled={wordCount > MAX_WORDS || wordCount === 0}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Check size={13} /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {about || (
                            <span className="italic">
                                No bio yet. Click <strong>Edit</strong> to tell your fellow students about yourself! 👋
                            </span>
                        )}
                    </p>
                )}
            </motion.div>

            {/* ── My Uploads ────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="glass-panel p-6 rounded-2xl border border-[var(--color-border)]"
            >
                <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4">
                    My Uploads {!loading && <span className="ml-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">{notes.length}</span>}
                </h2>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-10 text-[var(--color-text-muted)] space-y-2">
                        <div className="text-4xl">📭</div>
                        <p className="font-medium">No uploads yet!</p>
                        <p className="text-sm">Share your notes and help the community 🌱</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note, i) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 transition-all group"
                            >
                                {/* Icon */}
                                <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                                    <FileText size={16} className="text-[var(--color-primary)]" />
                                </div>

                                {/* Title & meta */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[var(--color-text-main)] truncate">{note.title}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {note.subject} · Sem {note.semester} · {new Date(note.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={getDownloadUrl(note.file_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Download"
                                        className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 flex items-center justify-center transition-colors"
                                    >
                                        <Download size={14} className="text-[var(--color-primary)]" />
                                    </a>
                                    <button
                                        title="Delete"
                                        onClick={() => setDeleteTarget(note)}
                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                                    >
                                        <Trash2 size={14} className="text-red-500" />
                                    </button>
                                </div>

                                {/* Deleting indicator */}
                                {isDeleting && deleteTarget?.id === note.id && (
                                    <Loader2 size={16} className="animate-spin text-red-400 shrink-0" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
        <div className="bg-[var(--color-background)]/50 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)]/40 transition-colors text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xl font-bold text-[var(--color-text-main)]">{value}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</div>
        </div>
    )
}
