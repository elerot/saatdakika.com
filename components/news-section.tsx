import { NewsItem } from "@/utils/rss-parser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import React, { useState } from "react"
import AdBanner from "./AdBanner"
import AdBannerYndx from "./AdBannerYndx"
import IframeModal from './IframeModal'

interface NewsSectionProps {
  news: NewsItem[];
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

// const components = [<AdBanner key={uuidv4()}/>, <AdBannerYndx key={uuidv4()}/>];
// const randomIndex = Math.floor(Math.random()*2);
const AdCard = () => (
  <Card className="flex flex-col h-full">
    <CardContent className="flex-grow flex items-center justify-center">
      <div id="adContainer" className="w-full h-full min-h-[50px]">
        {/* <AdBanner/> */}
        {/* {components[randomIndex]} */}
        <AdBannerYndx key={uuidv4()}/>
      </div>
    </CardContent>
  </Card>
);

export function NewsSection({ news }: NewsSectionProps) {
  const [openArticleUrl, setOpenArticleUrl] = useState<string | null>(null);

  

  function removeLastSentence(description: string): string {
    const sentences = description.split('.');
    if (sentences[sentences.length - 1].trim().toLowerCase() === 'devamı için tıklayınız') {
      sentences.pop();
    }
    return sentences.join('.').trim();
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" >
        {news.map((item, index) => (
          <React.Fragment key={uuidv4()}>
            <Card key={item.link} className="flex flex-col">
              <CardHeader className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary">{item.source}</Badge>
                </div>
                {item.imageUrl && (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg"
                    />
                  </div>
                )}
                <CardTitle className="text-lg">
                  <Link href={item.link} target="_blank" rel="nofollow" className="hover:underline">
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription>{new Date(item.pubDate).toLocaleString('tr-TR')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground space-y-2">
                  {removeLastSentence(item.description).split('\n').slice(0, 3).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button className="w-full" onClick={() => setOpenArticleUrl(item.link)}>
                  Haberi Oku
                </Button>
              </CardContent>
            </Card>
            {(index + 1) % 4 === 0 && <AdCard key={`ad-${index}`} />}
          </React.Fragment>
        ))}
      </div>
      {openArticleUrl && (
        <IframeModal url={openArticleUrl} onClose={() => setOpenArticleUrl(null)} />
      )}
    </>
  )
}

