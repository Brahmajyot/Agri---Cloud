import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Download, Calendar, BookOpen, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SEO from '@/components/ui/SEO'
import PDFPreview from '@/components/ui/PDFPreview'
import api from '@/lib/api'

interface Note {
    id: string
    title: string
    subject: string
    semester: string
    year: string
    file_url: string
    file_name: string
    created_at: string
    slug: string
}

export default function NoteDetails() {
    const { slug } = useParams<{ slug: string }>()
    const [note, setNote] = useState<Note | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!slug) return
        setLoading(true)
        api.get(`/api/files/slug/${slug}`)
            .then(res => setNote(res.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [slug])

    const getDownloadUrl = (url: string) =>
        url.includes('cloudinary.com')
            ? url.replace('/upload/', '/upload/fl_attachment/')
            : url

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        )
    }

    if (notFound || !note) {
        return (
            <div className="text-center py-24 space-y-4">
                <p className="text-5xl">📄</p>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Note not found</h1>
                <p className="text-[var(--color-text-muted)]">
                    This note may have been deleted or the link is incorrect.
                </p>
                <Link to="/browse">
                    <Button variant="outline" className="gap-2 mt-4">
                        <ArrowLeft size={16} /> Browse all notes
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Dynamic SEO — every note gets its own search-optimised title */}
            <SEO
                title={`${note.title} — B.Sc Agriculture Semester ${note.semester} Notes PDF`}
                description={`Download ${note.title} for B.Sc Agriculture Semester ${note.semester}. Free study material covering ${note.subject} for agriculture students in India.`}
                keywords={`${note.title.toLowerCase()}, b.sc agriculture semester ${note.semester} notes pdf, ${note.subject.toLowerCase()} notes, bsc agriculture study material free download`}
                canonical={`/notes/${note.slug}`}
            />

            {/* Back link */}
            <Link
                to="/browse"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors font-medium"
            >
                <ArrowLeft size={16} /> Back to Browse
            </Link>

            {/* Header card */}
            <div className="frosted-card rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
                <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                        {note.subject}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] bg-gray-100 px-3 py-1 rounded-full">
                        Semester {note.semester}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] bg-gray-100 px-3 py-1 rounded-full">
                        Year {note.year}
                    </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] leading-snug">
                    {note.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-sm text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5">
                        <BookOpen size={15} /> {note.subject}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <GraduationCap size={15} /> B.Sc Agriculture — Sem {note.semester}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={15} />
                        {new Date(note.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                    <a
                        href={getDownloadUrl(note.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                    >
                        <Button
                            size="lg"
                            className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full px-8 shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:scale-105 active:scale-95"
                        >
                            <Download size={18} /> Download PDF
                        </Button>
                    </a>
                    <a
                        href={note.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button size="lg" variant="outline" className="gap-2 rounded-full px-6">
                            Open in new tab
                        </Button>
                    </a>
                </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-[var(--color-secondary)]">
                    📄 Quick Preview
                </h2>
                <PDFPreview fileUrl={note.file_url} fileName={note.file_name} />
            </div>
        </div>
    )
}
