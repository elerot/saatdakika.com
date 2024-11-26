import { fetchRSSFeed, NewsItem } from './rss-parser';

export class RSSFeeds {
  private feeds: { url: string; name: string }[];

  constructor() {
    this.feeds = [
      { url: 'https://www.hurriyet.com.tr/rss/anasayfa', name: 'Hürriyet' },
      { url: 'https://www.milliyet.com.tr/rss/rssNew/gundemRss.xml', name: 'Milliyet' },
      { url: 'https://www.sozcu.com.tr/rss/tum-haberler.xml', name: 'Sözcü' },
      { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', name: 'Sabah' },
      { url: 'https://www.haberturk.com/rss', name: 'Habertürk' },
      { url: 'https://www.ntv.com.tr/gundem.rss', name: 'NTV' },
      { url: 'https://www.cnnturk.com/feed/rss/all/news', name: 'CNN Türk' },
      { url: 'https://www.trthaber.com/manset_articles.rss', name: 'TRT Haber' },
      { url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', name: 'Anadolu Ajansı' },
      { url: 'https://www.dha.com.tr/rss', name: 'Demirören Haber Ajansı' },
    ];
  }

  getFeeds() {
    return this.feeds;
  }

  async fetchAllNews(): Promise<NewsItem[]> {
    const fetchPromises = this.feeds.map(feed => fetchRSSFeed(feed.url, feed.name));
    const newsArrays = await Promise.all(fetchPromises);
    return newsArrays.flat();
  }

  getSourceNames(): string[] {
    return this.feeds.map(feed => feed.name);
  }
}

