import { Search, FileText, Download, Trash2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useUser } from "@clerk/clerk-react"
import { toast } from "sonner"

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

export default function Browse() {
    const { user } = useUser()
    const [searchTerm, setSearchTerm] = useState("")
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotes = async () => {
        try {
            const response = await api.get('/api/files')
            setNotes(response.data)
        } catch (error) {
            console.error("Failed to fetch notes", error)
            toast.error("Failed to load notes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    const handleDelete = async (noteId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return

        try {
            await api.delete(`/api/files/${noteId}`, {
                data: { userId: user?.id }
            })
            toast.success("File deleted successfully")
            setNotes(prev => prev.filter(n => n.id !== noteId))
        } catch (error) {
            console.error("Failed to delete file", error)
            toast.error("Failed to delete file")
        }
    }

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">Browse Notes</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by subject, title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl">
                    <p className="text-lg text-[var(--color-text-muted)]">No notes uploaded yet.</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Go to upload page to contribute!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map((note) => (
                            <NoteCard key={note.id} note={note} currentUserId={user?.id} onDelete={handleDelete} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-[var(--color-text-muted)]">
                            No notes match your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function NoteCard({ note, currentUserId, onDelete }: { note: Note, currentUserId?: string, onDelete: (id: string) => void }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDeleting(true)
        await onDelete(note.id)
        setIsDeleting(false)
    }
    const handleCardClick = () => {
        const fileExtension = note.file_name.split('.').pop()?.toLowerCase()
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')
        const isPdf = fileExtension === 'pdf'

        if (isImage || isPdf) {
            window.open(note.file_url, '_blank')
        } else {
            // Use Google Docs Viewer for other documents (docx, pptx, xlsx)
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(note.file_url)}`
            window.open(viewerUrl, '_blank')
        }
    }

    const getDownloadUrl = (url: string) => {
        // If it's a Cloudinary URL, add fl_attachment to force download
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', '/upload/fl_attachment/')
        }
        return url
    }

    const handleDownloadClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            onClick={handleCardClick}
            className="group frosted-card rounded-2xl p-0 overflow-hidden hover-lift border border-[var(--color-border)] flex flex-col h-full bg-white cursor-pointer"
        >
            <div className="h-40 bg-[var(--color-primary)]/10 flex items-center justify-center relative overflow-hidden group-hover:bg-[var(--color-primary)]/20 transition-colors">
                <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                    <FileText strokeWidth={1} />
                </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
                        {note.subject}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] bg-gray-100 px-2 py-0.5 rounded-full">
                        Sem {note.semester}
                    </span>
                </div>
                <h3 className="font-bold text-[var(--color-text-main)] mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1" title={note.title}>
                    {note.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                    Year: {note.year} • {new Date(note.created_at).toLocaleDateString()}
                </p>
                <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex gap-2">
                    <a
                        href={getDownloadUrl(note.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                        onClick={handleDownloadClick}
                    >
                        <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                            <Download size={14} />
                            Download
                        </Button>
                    </a>
                    {currentUserId === note.user_id && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
