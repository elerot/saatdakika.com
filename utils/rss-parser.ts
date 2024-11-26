import { parseString } from 'xml2js';

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  imageUrl?: string;
  category: string;
}

function removeImgTags(html: string): string {
  return html.replace(/<img[^>]*>/g, '');
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function extractImageUrl(item: any): string | undefined {
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  if (item.enclosure && item.enclosure['$'] && item.enclosure['$'].url) {
    return item.enclosure['$'].url;
  }
  const imgMatch = item.description?.match(/<img[^>]+src="?([^"\s]+)"?\s*\/>/);
  return imgMatch ? imgMatch[1] : undefined;
}

function extractCategory(item: any): string {
  if (item.category) {
    return Array.isArray(item.category) ? item.category[0] : item.category;
  }
  return 'Genel';
}

export async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xml = await response.text();
    
    return new Promise((resolve, reject) => {
      parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const channel = result.rss?.channel || result.feed;
          if (!channel) {
            reject(new Error('Invalid RSS format'));
            return;
          }
          const items = Array.isArray(channel.item) ? channel.item : [channel.item];
          const newsItems: NewsItem[] = items
            .filter((item: any) => item && item.title && item.link) // Filter out invalid items
            .map((item: any) => ({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate || item.published || new Date().toISOString(),
              description: stripHtmlTags(removeImgTags(item.description || '')),
              source: sourceName,
              imageUrl: extractImageUrl(item),
              category: extractCategory(item),
            }));
          resolve(newsItems);
        }
      });
    });
  } catch (error) {
    console.error(`RSS feed çekilirken hata oluştu (${sourceName}):`, error);
    return [];
  }
}

