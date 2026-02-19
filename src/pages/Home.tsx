import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { BookOpen, Upload, Users } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col gap-16 py-10 md:py-20">
            {/* Hero */}
            <section className="text-center space-y-6 animate-fade-in">
                <div className="inline-flex items-center rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
                    🌱 For Agriculture Students
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-[var(--color-text-main)]">
                    Share Knowledge, <br className="hidden md:inline" />
                    <span className="text-[var(--color-primary)]">Grow Together.</span>
                </h1>
                <p className="mx-auto max-w-[600px] text-lg text-[var(--color-text-muted)]">
                    The premium platform for sharing notes, research papers, and study materials within the agriculture community.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link to="/browse">
                        <Button size="lg" className="gap-2">
                            Browse Notes <BookOpen size={18} />
                        </Button>
                    </Link>
                    <Link to="/upload">
                        <Button size="lg" variant="outline" className="gap-2">
                            Upload Now <Upload size={18} />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid gap-8 md:grid-cols-3">
                <FeatureCard
                    icon={<Upload className="text-[var(--color-primary)]" />}
                    title="Easy Upload"
                    description="Drag & drop your PDF, DOCX, or PPT files. We handle the rest."
                />
                <FeatureCard
                    icon={<Search className="text-[var(--color-secondary)]" />}
                    title="Smart Search"
                    description="Find exactly what you need by subject, semester, or tags."
                />
                <FeatureCard
                    icon={<Users className="text-[var(--color-primary-dark)]" />}
                    title="Community"
                    description="Connect with peers and share valuable insights."
                />
            </section>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="frosted-card p-6 rounded-2xl border border-[var(--color-border)] hover-lift">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-bold text-[var(--color-text-main)]">{title}</h3>
            <p className="text-[var(--color-text-muted)]">{description}</p>
        </div>
    )
}

function Search({ className }: { className?: string }) {
    // Lucide Search import was shadowed, redefining locally or just using the import
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
