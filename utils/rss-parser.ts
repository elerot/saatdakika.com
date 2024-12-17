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
  // const imgMatch = (item.description??item.content?._)?.match(/<img[^>]+src="?([^"\s]+)"?\s*\/>/);
  const imgMatch = (item.description??item.content?._)?.match(/<img\s[^>]*?src=["']([^"']+)["']/);
  if(imgMatch){
    return imgMatch[0].split("\"")[1];
  }
  //return imgMatch ? imgMatch[1] : undefined;
}

function extractCategory(item: any): string {
  if (item.category) {
    return Array.isArray(item.category) ? item.category[0] : item.category;
  }
  return 'Genel';
}
function extractLinkUrl(item: any): string {
  if (item.link?.$?.href) {
    return item.link.$.href;
  }
  else if (item["atom:link"]?.$?.href) {
    return item["atom:link"].$.href;
  }
  else if (item.link) {
    return item.link;
  }
  else {
    return "";
  }
}

function extractTitle(item: any): string {
  if (item.title?._) {
    return item.title._;
  }
  else 
    return item.title;
}

function truncateText(text, limit) {
  if (text.length > limit) {
    return text.slice(0, limit) + '...';
  }
  return text;
}

export async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    // const response = await fetch(url);
    const response = await fetch(`/api/fetchNews?url=${encodeURIComponent(url)}`);
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
          const items = Array.isArray(channel.item ?? channel.entry) ? (channel.item ?? channel.entry) : [channel.item ?? channel.entry];
          const newsItems: NewsItem[] = items
            .filter((item: any) => item && item.title && (item.link ?? item["atom:link"]?.$?.href)) // Filter out invalid items
            .map((item: any) => ({
              title: extractTitle(item),
              link: extractLinkUrl(item),
              pubDate: item.pubDate || item.published || '',//new Date().toISOString(),
              description: truncateText(stripHtmlTags(removeImgTags((item.description??item.content?._) || '')),450),
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

