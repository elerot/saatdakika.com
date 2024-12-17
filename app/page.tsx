'use client'

import { useEffect, useState, useCallback } from 'react'
import { SiteHeader } from "@/components/site-header"
import { NewsSection } from "@/components/news-section"
import { NewsItem } from '@/utils/rss-parser'
import { RSSFeeds2 } from '@/utils/rss-feeds2'

const rssFeeds = new RSSFeeds2();

export default function Home() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [newsCounts, setNewsCounts] = useState<Record<string, number>>({});
  const [maxNewsCounts, setMaxNewsCounts] = useState<Record<string, number>>({});

  const fetchAllNews = useCallback(async (source: string | null = null) => {
    setIsLoading(true);
    setError(null);
    setAllNews([]);
    setFilteredNews([]);
    setNewsCounts({});

    try {
      const generator = rssFeeds.fetchNewsBySourceIncremental(source);
      for await (const { news, sourceName, maxCount } of generator) {
        setAllNews(prevNews => [...prevNews, ...news]);
        setFilteredNews(prevNews => [...prevNews, ...news]);
        setNewsCounts(prevCounts => ({ ...prevCounts, [sourceName]: (prevCounts[sourceName] || 0) + news.length }));
        setMaxNewsCounts(prevMaxCounts => ({ ...prevMaxCounts, [sourceName]: maxCount }));
      }
    } catch (err) {
      console.error('Haber yükleme hatası:', err);
      setError('Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllNews();
  }, [fetchAllNews]);

  useEffect(() => {
    const filtered = allNews.filter(news =>
      (news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedSource === null || news.source === selectedSource)
    );
    setFilteredNews(filtered);
  }, [searchTerm, allNews, selectedSource]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRefresh = () => {
    fetchAllNews(selectedSource);
  };

  const handleSourceSelect = (source: string | null) => {
    setSelectedSource(source);
    fetchAllNews(source);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        sources={rssFeeds.getSourceNames()}
        newsCounts={newsCounts}
        maxNewsCounts={maxNewsCounts}
        onSourceSelect={handleSourceSelect}
        selectedSource={selectedSource}
      />
      <main className="container mx-auto px-4 py-2">
        {isLoading && allNews.length === 0 ? (
          <div>Haberler yükleniyor...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <NewsSection news={filteredNews} />
        )}
      </main>
    </div>
  )
}

