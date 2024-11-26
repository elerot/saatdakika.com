'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { SiteHeader } from "@/components/site-header"
import { NewsSection } from "@/components/news-section"
import { NewsItem } from '@/utils/rss-parser'
import { RSSFeeds2 } from '@/utils/rss-feeds2'
import Script from 'next/script'

const rssFeeds = new RSSFeeds2();

export default function Home() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [newsCounts, setNewsCounts] = useState<Record<string, number>>({});

  const fetchAllNews = useCallback(async (source: string | null = null) => {
    setIsLoading(true);
    setError(null);
    setAllNews([]);
    setFilteredNews([]);
    setNewsCounts({});

    try {
      const news = await rssFeeds.fetchNewsBySource(source);
      setAllNews(news);
      setFilteredNews(news);
      const counts = news.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setNewsCounts(counts);
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
  };

  const sortedSources = useMemo(() => {
    return rssFeeds.getSourceNames().sort((a, b) => (newsCounts[b] || 0) - (newsCounts[a] || 0));
  }, [newsCounts]);

  return (
    <div className="min-h-screen bg-background">
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4763427752391920`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      <SiteHeader
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        sources={sortedSources}
        newsCounts={newsCounts}
        onSourceSelect={handleSourceSelect}
        selectedSource={selectedSource}
      />
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
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

