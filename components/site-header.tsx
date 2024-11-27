import Link from "next/link"
import { Clock, RefreshCw } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SiteHeaderProps {
  onSearch: (term: string) => void;
  onRefresh: () => void;
  sources: string[];
  newsCounts: Record<string, number>;
  maxNewsCounts: Record<string, number>;
  onSourceSelect: (source: string | null) => void;
  selectedSource: string | null;
}

export function SiteHeader({ onSearch, onRefresh, sources, newsCounts, maxNewsCounts, onSourceSelect, selectedSource }: SiteHeaderProps) {
  const totalNewsCount = Object.values(newsCounts).reduce((sum, count) => sum + count, 0);
  const totalMaxNewsCount = Object.values(maxNewsCounts).reduce((sum, count) => sum + count, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4">
        <div className="flex flex-col items-center py-2"> {/* Updated className */}
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <Link href="/" className="text-2xl font-bold text-primary">
                SaatDakika
              </Link>
            </div>
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          <div className="w-full mb-4">
            <Input 
              className="w-full"
              placeholder="Haberlerde ara..." 
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <div className="w-full">
            <div className="flex flex-wrap gap-2 max-h-[4.5rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <Badge
                variant={selectedSource === null ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap mb-2"
                onClick={() => onSourceSelect(null)}
              >
                Tümü ({totalNewsCount}/{totalMaxNewsCount})
              </Badge>
              {sources.map((source) => {
                const count = newsCounts[source] || 0;
                const maxCount = maxNewsCounts[source] || 0;
                return (
                  <Badge
                    key={source}
                    variant={selectedSource === source ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap mb-2 ${count === 0 && maxCount === 0 ? 'opacity-50' : ''}`}
                    onClick={() => onSourceSelect(source)}
                  >
                    {source} ({count}/{maxCount})
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

