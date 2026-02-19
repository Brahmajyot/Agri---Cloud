import { FileIcon, UploadCloud, X, Check, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { toast } from "sonner"
import api from "@/lib/api"
import { useUser } from "@clerk/clerk-react"

export default function UploadPage() {
    const { user } = useUser();
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    // Metadata State
    const [title, setTitle] = useState("")
    const [subject, setSubject] = useState("")
    const [semester, setSemester] = useState("")
    const [year, setYear] = useState("")

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles])
        setUploadSuccess(false) // Reset success state on new file drop
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const handleUpload = async () => {
        if (files.length === 0) return
        if (!title || !subject || !semester || !year) {
            toast.error("Please fill in all fields.")
            return
        }

        setIsUploading(true)
        setUploadSuccess(false)

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            toast.error("Cloudinary configuration is missing.")
            setIsUploading(false)
            return
        }

        try {
            const uploadPromises = files.map(file => {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("upload_preset", uploadPreset)
                // formData.append("cloud_name", cloudName) // Not needed in body usually if in URL, but harmless

                return axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                    formData
                )
            })

            const responses = await Promise.all(uploadPromises)

            // Save metadata to Backend
            const savePromises = responses.map((res, index) => {
                return api.post('/api/files', {
                    title,
                    subject,
                    semester,
                    year,
                    fileUrl: res.data.secure_url,
                    fileName: files[index].name,
                    userId: user?.id
                });
            });

            await Promise.all(savePromises);

            setUploadSuccess(true)
            setFiles([]) // Clear files after successful upload
            // Reset form
            setTitle("")
            setSubject("")
            setSemester("")
            setYear("")

            toast.success("All files uploaded successfully!")
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Failed to upload files. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">Upload Notes</h1>
                <p className="text-[var(--color-text-muted)]">Share your knowledge with the community.</p>
            </div>

            {/* Metadata Inputs */}
            {!uploadSuccess && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Note Title (e.g., Soil Mechanics)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Subject / Course Name"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-sm"
                    />
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-sm bg-white"
                    >
                        <option value="" disabled>Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-sm bg-white"
                    >
                        <option value="" disabled>Select Year</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                </div>
            )}

            {!uploadSuccess ? (
                <div
                    {...getRootProps()}
                    className={`
          border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}
        `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-[var(--color-primary)]">
                            <UploadCloud size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-[var(--color-text-muted)]">PDF, DOCX, PPTX (Max 10MB)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Upload Complete!</h2>
                    <p className="text-[var(--color-text-muted)]">Your notes have been successfully uploaded.</p>
                    <Button onClick={() => setUploadSuccess(false)} variant="outline" className="mt-4">
                        Upload More
                    </Button>
                </div>
            )}

            {files.length > 0 && !uploadSuccess && (
                <div className="space-y-4">
                    <h3 className="font-semibold">Selected Files</h3>
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 glass-panel rounded-xl">
                            <div className="flex items-center gap-3">
                                <FileIcon className="text-[var(--color-primary)]" size={20} />
                                <div>
                                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter((_, i) => i !== idx))} disabled={isUploading}>
                                <X size={18} />
                            </Button>
                        </div>
                    ))}
                    <Button
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all"
                        size="lg"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${files.length} Files`
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
