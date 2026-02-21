import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const BASE_URL = 'https://agri-cloud-tau.vercel.app';

const STATIC_ROUTES = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/browse', changefreq: 'daily', priority: 0.9 },
    { url: '/sign-up', changefreq: 'monthly', priority: 0.5 },
    { url: '/sign-in', changefreq: 'monthly', priority: 0.4 },
];

async function generateSitemap() {
    console.log('🗺️  Generating sitemap...');

    let dynamicRoutes = [];

    try {
        // Fetch all notes that have a slug set
        const result = await pool.query(
            "SELECT slug, created_at FROM files WHERE slug IS NOT NULL ORDER BY created_at DESC"
        );

        dynamicRoutes = result.rows.map(row => ({
            url: `/notes/${row.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date(row.created_at).toISOString(),
        }));

        console.log(`   Found ${dynamicRoutes.length} note pages`);
    } catch (err) {
        console.warn('⚠️  Could not fetch notes from DB (continuing with static routes only):', err.message);
    } finally {
        await pool.end();
    }

    const today = new Date().toISOString();
    const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(r => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${r.lastmod ?? today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', xml, 'utf8');
    console.log(`✅ Sitemap written to public/sitemap.xml (${allRoutes.length} URLs)`);
}

generateSitemap().catch(err => {
    console.error('❌ Sitemap generation failed:', err);
    process.exit(1);
});
