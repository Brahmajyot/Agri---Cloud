import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy-load the heavy PDF viewer so it's only downloaded when the NoteDetails
// page is actually visited — keeps the main bundle tiny.
const LazyPDFViewer = lazy(() =>
    import('@react-pdf-viewer/core').then(async (coreModule) => {
        const layoutModule = await import('@react-pdf-viewer/default-layout')
        // Import CSS
        await import('@react-pdf-viewer/core/lib/styles/index.css')
        await import('@react-pdf-viewer/default-layout/lib/styles/index.css')

        const { Worker, Viewer } = coreModule
        const { defaultLayoutPlugin } = layoutModule

        function PDFViewerInner({ fileUrl }: { fileUrl: string }) {
            const defaultLayoutPluginInstance = defaultLayoutPlugin()
            // pdfjs worker is served from the CDN — no local copy needed
            const workerUrl =
                'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'

            return (
                <Worker workerUrl={workerUrl}>
                    <Viewer
                        fileUrl={fileUrl}
                        plugins={[defaultLayoutPluginInstance]}
                        initialPage={0}
                    />
                </Worker>
            )
        }

        return { default: PDFViewerInner }
    })
)

interface PDFPreviewProps {
    fileUrl: string
    fileName: string
}

/**
 * Smart file preview:
 * - PDF  → react-pdf-viewer (full in-page viewer)
 * - DOCX/PPTX → Google Docs viewer iframe
 * - Image → native <img>
 * - Other → "Open in new tab" link
 */
export default function PDFPreview({ fileUrl, fileName }: PDFPreviewProps) {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

    if (ext === 'pdf') {
        return (
            <div className="h-[600px] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-full gap-3 text-[var(--color-text-muted)]">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="font-medium">Loading PDF preview…</span>
                        </div>
                    }
                >
                    <LazyPDFViewer fileUrl={fileUrl} />
                </Suspense>
            </div>
        )
    }

    if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) {
        const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
        return (
            <div className="h-[600px] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
                <iframe
                    src={googleUrl}
                    title="Document Preview"
                    className="w-full h-full"
                    allow="fullscreen"
                />
            </div>
        )
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
                <img
                    src={fileUrl}
                    alt={fileName}
                    className="w-full max-h-[600px] object-contain bg-gray-50"
                />
            </div>
        )
    }

    // Fallback for unknown file types
    return (
        <div className="h-40 border border-[var(--color-border)] rounded-2xl flex items-center justify-center text-[var(--color-text-muted)] bg-gray-50">
            <p className="text-sm">
                Preview not available.{' '}
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] underline font-medium"
                >
                    Open file
                </a>
            </p>
        </div>
    )
}
