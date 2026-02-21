import { SignUp } from "@clerk/clerk-react"
import SEO from "@/components/ui/SEO"

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <SEO
                title="Join Agri Cloud — Free B.Sc Agriculture Notes Platform"
                description="Create a free account on Agri Cloud. Upload and access B.Sc Agriculture notes, PYQ papers, and study materials for BHU, HAU, Agra University and all major agriculture universities."
                keywords="join agri cloud, agriculture notes platform, bsc agriculture free notes, agriculture student community"
                canonical="/sign-up"
            />
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </div>
    )
}

