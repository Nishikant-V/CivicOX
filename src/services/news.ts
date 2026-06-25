// GDELT 2.0 DOC API — public, no API key required
// https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
const BASE_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

export interface NewsArticle {
  title: string;
  source: string;
  publishedDate: string;
  link: string;
}

interface GdeltArticle {
  title: string;
  domain: string;
  seendate: string;
  url: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

function parseGdeltDate(seendate: string): string {
  // Format YYYYMMDDTHHMMSSZ to YYYY-MM-DD
  if (seendate && seendate.length >= 8) {
    const year = seendate.substring(0, 4);
    const month = seendate.substring(4, 6);
    const day = seendate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return seendate || 'Unknown Date';
}

export async function getCityNews(
  cityName: string,
  signal: AbortSignal,
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    query: cityName,
    mode: 'artlist',
    format: 'json',
    maxrecords: '10',
  });

  const response = await fetch(`${BASE_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`News API error: ${response.status}`);
  }

  const data: GdeltResponse = await response.json();
  const articles = data.articles ?? [];

  return articles.map((art) => ({
    title: art.title || 'Untitled Article',
    source: art.domain || 'Unknown Source',
    publishedDate: parseGdeltDate(art.seendate),
    link: art.url,
  }));
}
