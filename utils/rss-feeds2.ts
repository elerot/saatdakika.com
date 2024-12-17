import { fetchRSSFeed, NewsItem } from './rss-parser';

export class RSSFeeds2 {
  private feeds: { url: string; name: string }[];
  private maxCounts: Record<string, number> = {};

  constructor() {
    this.feeds = [
      { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', name: 'Sabah Ana Sayfa' },
      { url: 'https://www.sabah.com.tr/rss/ekonomi.xml', name: 'Sabah Ekonomi' },
      { url: 'https://www.sabah.com.tr/rss/spor.xml', name: 'Sabah Spor' },
      { url: 'https://www.sabah.com.tr/rss/dunya.xml', name: 'Sabah Dünya' },
      { url: 'https://www.takvim.com.tr/rss/anasayfa.xml', name: 'Takvim Ana Sayfa' },
      { url: 'https://www.cnnturk.com/feed/rss/all/news', name: 'CNN Türk Haberler' },
      { url: 'https://www.cnnturk.com/feed/rss/turkiye/news', name: 'CNN Türk Türkiye' },
      { url: 'https://www.cnnturk.com/feed/rss/dunya/news', name: 'CNN Türk Dünya' },
      { url: 'https://www.hurriyet.com.tr/rss/anasayfa', name: 'Hürriyet Ana Sayfa' },
      { url: 'https://www.milliyet.com.tr/rss/rssnew/gundem.xml', name: 'Milliyet Gündem' },
      { url: 'https://www.ntv.com.tr/gundem.rss', name: 'NTV Gündem' },
      { url: 'https://www.haberturk.com/rss/manset.xml', name: 'Habertürk Manşet' },
      { url: 'https://www.cumhuriyet.com.tr/rss/son_dakika.xml', name: 'Cumhuriyet Son Dakika' },
      { url: 'https://www.trthaber.com/manset_articles.rss', name: 'TRT Haber Manşet' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', name: 'Anadolu Ajansı Güncel' },
      { url: 'https://www.yenisafak.com/rss', name: 'Yeni Şafak Ana Sayfa' },
      { url: 'https://www.aksam.com.tr/rss', name: 'Akşam Ana Sayfa' },
      { url: 'https://www.star.com.tr/rss/rss.asp', name: 'Star Gazetesi Ana Sayfa' },
      { url: 'https://www.fotomac.com.tr/rss/anasayfa.xml', name: 'Fotomaç Ana Sayfa' },
      { url: 'https://www.diken.com.tr/feed/', name: 'Diken' },
      { url: 'https://t24.com.tr/rss', name: 'T24 Ana Sayfa' },
      { url: 'https://www.birgun.net/xml/rss.xml', name: 'BirGün Ana Sayfa' },
      { url: 'https://www.evrensel.net/rss/haber.xml', name: 'Evrensel Ana Sayfa' },
      { url: 'https://www.yurtgazetesi.com.tr/service/rss.php', name: 'Yurt Gazetesi Ana Sayfa' },
      { url: 'https://www.gazeteduvar.com.tr/feed', name: 'Gazete Duvar Ana Sayfa' },
      { url: 'https://www.ensonhaber.com/rss/ensonhaber.xml', name: 'EnSonHaber Ana Sayfa' },
      { url: 'https://www.internethaber.com/rss', name: 'İnternet Haber Ana Sayfa' },
      { url: 'https://www.mynet.com/haber/rss/sondakika', name: 'Mynet Son Dakika' },
      { url: 'https://www.ahaber.com.tr/rss/anasayfa.xml', name: 'A Haber Ana Sayfa' },
      { url: 'https://www.bloomberght.com/rss', name: 'Bloomberg HT Ana Sayfa' },
      { url: 'https://www.bbc.com/turkce/index.xml', name: 'BBC Türkçe' },
      { url: 'https://www.odatv4.com/rss', name: 'OdaTV Ana Sayfa' },
      { url: 'https://www.turkiyegazetesi.com.tr/rss/rss.xml', name: 'Türkiye Gazetesi Ana Sayfa' },
      { url: 'https://www.haberx.com/feed', name: 'HaberX Ana Sayfa' },
      { url: 'https://www.gercekgundem.com/rss', name: 'Gerçek Gündem Ana Sayfa' },
      { url: 'https://www.gazetevatan.com/rss/gundem.xml', name: 'Vatan Gazetesi Gündem' },
      { url: 'https://www.turkgun.com/rss/news', name: 'Türkgün Genel' },
      { url: 'https://www.ortadogugazetesi.com/rss', name: 'Ortadoğu Genel' }
    ];

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
}

