import { fetchRSSFeed, NewsItem } from './rss-parser';

export class RSSFeeds2 {
  private feeds: { url: string; name: string }[];

  constructor() {
    this.feeds = [
      { url: 'https://www.ntv.com.tr/gundem.rss', name: 'NTV Gündem' },
      { url: 'https://www.ntv.com.tr/turkiye.rss', name: 'NTV Türkiye' },
      { url: 'https://www.ntv.com.tr/dunya.rss', name: 'NTV Dünya' },
      { url: 'https://www.ntv.com.tr/ekonomi.rss', name: 'NTV Ekonomi' },
      { url: 'https://www.ntv.com.tr/spor.rss', name: 'NTV Spor' },
      { url: 'https://www.ntv.com.tr/teknoloji.rss', name: 'NTV Teknoloji' },
      { url: 'https://www.ntv.com.tr/yasam.rss', name: 'NTV Yaşam' },
      { url: 'https://www.ntv.com.tr/saglik.rss', name: 'NTV Sağlık' },
      { url: 'https://www.ntv.com.tr/sanat.rss', name: 'NTV Sanat' },
      { url: 'https://www.ntv.com.tr/otomobil.rss', name: 'NTV Otomobil' },
      { url: 'https://www.ntv.com.tr/egitim.rss', name: 'NTV Eğitim' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', name: 'AA Güncel' },
      { url: 'https://www.haberturk.com/rss', name: 'Habertürk' },
      { url: 'https://www.hurriyet.com.tr/rss/anasayfa', name: 'Hürriyet Ana Sayfa' },
      { url: 'https://www.hurriyet.com.tr/rss/gundem', name: 'Hürriyet Gündem' },
      { url: 'https://www.hurriyet.com.tr/rss/ekonomi', name: 'Hürriyet Ekonomi' },
      { url: 'https://www.hurriyet.com.tr/rss/spor', name: 'Hürriyet Spor' },
      { url: 'http://www.milliyet.com.tr/rss/rssNew/gundemRss.xml', name: 'Milliyet Gündem' },
      { url: 'http://www.milliyet.com.tr/rss/rssNew/ekonomiRss.xml', name: 'Milliyet Ekonomi' },
      { url: 'http://www.milliyet.com.tr/rss/rssNew/dunyaRss.xml', name: 'Milliyet Dünya' },
      { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', name: 'Sabah Ana Sayfa' },
      { url: 'https://www.sabah.com.tr/rss/ekonomi.xml', name: 'Sabah Ekonomi' },
      { url: 'https://www.sabah.com.tr/rss/spor.xml', name: 'Sabah Spor' },
      { url: 'https://www.sabah.com.tr/rss/dunya.xml', name: 'Sabah Dünya' },
      { url: 'https://www.takvim.com.tr/rss/anasayfa.xml', name: 'Takvim Ana Sayfa' },
      { url: 'https://www.cnnturk.com/feed/rss/all/news', name: 'CNN Türk Haberler' },
      { url: 'https://www.cnnturk.com/feed/rss/turkiye/news', name: 'CNN Türk Türkiye' },
      { url: 'https://www.cnnturk.com/feed/rss/dunya/news', name: 'CNN Türk Dünya' },
      { url: 'http://www.trthaber.com/sondakika.rss', name: 'TRT Haber Son Dakika' },
    ];
  }

  getFeeds() {
    return this.feeds;
  }

  async fetchAllNews(): Promise<NewsItem[]> {
    const batchSize = 5; // Aynı anda çekilecek RSS feed sayısı
    const allNews: NewsItem[] = [];

    for (let i = 0; i < this.feeds.length; i += batchSize) {
      const batch = this.feeds.slice(i, i + batchSize);
      const batchPromises = batch.map(feed => this.fetchNewsWithRetry(feed));
      const batchResults = await Promise.all(batchPromises);
      allNews.push(...batchResults.flat());
    }

    return allNews;
  }

  private async fetchNewsWithRetry(feed: { url: string; name: string }, retries = 3): Promise<NewsItem[]> {
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

  async fetchNewsBySource(sourceName: string | null): Promise<NewsItem[]> {
    if (sourceName === null) {
      return this.fetchAllNews();
    }
    const feed = this.feeds.find(f => f.name === sourceName);
    if (!feed) {
      throw new Error(`Source not found: ${sourceName}`);
    }
    return this.fetchNewsWithRetry(feed);
  }
}

