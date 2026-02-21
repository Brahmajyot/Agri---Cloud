import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title: string
    description: string
    keywords?: string
    /** Canonical URL path, e.g. "/browse". Defaults to current URL. */
    canonical?: string
    /** Override OG image. Defaults to site logo. */
    ogImage?: string
    /** Google Search Console verification tag */
    googleVerification?: string
}

const SITE_NAME = 'Agri Cloud'
const BASE_URL = 'https://agri-cloud-tau.vercel.app'
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/logo-Za8sdaGn.png`

/**
 * Drop-in SEO component — place at the top of any page to set
 * page-specific <title>, meta description, keywords, and Open Graph tags.
 *
 * Usage:
 *   <SEO
 *     title="B.Sc Agriculture 1st Semester Notes PDF"
 *     description="Download free B.Sc Agriculture notes..."
 *     keywords="b.sc agriculture 1st semester notes pdf, ..."
 *   />
 */
export default function SEO({
    title,
    description,
    keywords,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    googleVerification,
}: SEOProps) {
    const fullTitle = `${title} | ${SITE_NAME}`
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined

    return (
        <Helmet>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

            {/* Open Graph */}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    )
}
