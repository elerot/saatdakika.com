import { fetchRSSFeed, NewsItem } from './rss-parser';
import { parseString } from 'xml2js';

export class RSSFeeds {
  private feeds: { url: string; name: string }[];
  private maxCounts: Record<string, number> = {};

  constructor() {
    this.feeds = [];
    this.loadFeedsFromXML();
  }

  private async loadFeedsFromXML() {
    try {
      const response = await fetch('/rss-feeds.xml');
      const xmlData = await response.text();
      parseString(xmlData, (err, result) => {
        if (err) {
          console.error('XML parsing error:', err);
          return;
        }
        this.feeds = result['rss-feeds'].feed.map((feed: any) => ({
          url: feed.url[0],
          name: feed.name[0]
        }));
      });
    } catch (error) {
      console.error('Error loading RSS feeds from XML:', error);
    }
  }

  getFeeds() {
    return this.feeds;
  }

  async *fetchAllNewsIncremental(): AsyncGenerator<{ news: NewsItem[], sourceName: string, maxCount: number }> {
    for (const feed of this.feeds) {
      const news = await this.fetchNewsWithRetry(feed);
      this.maxCounts[feed.name] = news.length;
      yield { news: news.slice(0, 3), sourceName: feed.name, maxCount: news.length };
    }
  }

  private async fetchNewsWithRetry(feed: { url: string; name: string }, retries = 2): Promise<NewsItem[]> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const news = await fetchRSSFeed(feed.url, feed.name);
        return news;
      } catch (error) {
        console.error(`Error fetching ${feed.name} (attempt ${attempt + 1}):`, error);
        if (attempt === retries - 1) {
          console.error(`Failed to fetch ${feed.name} after ${retries} attempts`);
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      }
    }
    return []; // This line should never be reached, but TypeScript needs it
  }

  getSourceNames(): string[] {
    return this.feeds.map(feed => feed.name);
  }

  async *fetchNewsBySourceIncremental(sourceName: string | null): AsyncGenerator<{ news: NewsItem[], sourceName: string, maxCount: number }> {
    if (sourceName === null) {
      yield* this.fetchAllNewsIncremental();
    } else {
      const feed = this.feeds.find(f => f.name === sourceName);
      if (!feed) {
        throw new Error(`Source not found: ${sourceName}`);
      }
      const news = await this.fetchNewsWithRetry(feed);
      this.maxCounts[sourceName] = news.length; 
      yield { news, sourceName, maxCount: news.length };
    }
  }

  getMaxCounts(): Record<string, number> {
    return this.maxCounts;
  }

  async testAndFilterFeeds(): Promise<void> {
    const workingFeeds: { url: string; name: string }[] = [];

    for (const feed of this.feeds) {
      try {
        const news = await this.fetchNewsWithRetry(feed, 1); // Sadece bir kez deneyin
        if (news.length > 0) {
          workingFeeds.push(feed);
          console.log(`${feed.name} çalışıyor.`);
        } else {
          console.log(`${feed.name} haber getirmedi.`);
        }
      } catch (error) {
        console.error(`${feed.name} çalışmıyor:`, error);
      }
    }

    this.feeds = workingFeeds;
    console.log(`Toplam çalışan feed sayısı: ${workingFeeds.length}`);
  }
}

