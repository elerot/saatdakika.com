import { NewsItem } from "@/utils/rss-parser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import React from "react"
import AdBanner from "./AdBanner"

interface NewsSectionProps {
  news: NewsItem[];
}

const AdCard = () => (
  <Card className="flex flex-col h-full">
    {/* <CardHeader className="relative">
      <CardTitle className="text-lg">Advertisement</CardTitle>
    </CardHeader> */}
    <CardContent className="flex-grow flex items-center justify-center">
      <div id="adContainer" className="w-full h-full min-h-[50px]">
        <AdBanner/>
      </div>
    </CardContent>
  </Card>
);

export function NewsSection({ news }: NewsSectionProps) {

  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
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
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription>{new Date(item.pubDate).toLocaleString('tr-TR')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground space-y-2">
                  {item.description.split('\n').slice(0, 3).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link href={item.link} target="_blank" rel="noopener noreferrer">
                    Haberi Oku
                  </Link>
                </Button>
              </CardContent>
            </Card>
            {(index + 1) % 4 === 0 && <AdCard key={`ad-${index}`} />}
          </React.Fragment>
        ))}
      </div>
    </>
  )
}

