'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { profile } from '@/data/profile';

function getContributionLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 10) return 3;
  return 4;
}

export function GitHubContributionGraph() {
  const [githubData, setGithubData] = useState<{
    contributions: Array<Array<{ date: string; contributionCount: number }>>;
    totalContributions: number;
  } | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    count: number;
    dateStr: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    fetch('https://github-contributions-api.deno.dev/r4khul.json')
      .then(res => res.json())
      .then(data => setGithubData(data))
      .catch(err => {
        console.error('Failed to fetch GitHub data:', err);
        // Fallback to hardcoded data if API fails
      });
  }, []);

  const data = useMemo(() => {
    if (!githubData) return [];
    return githubData.contributions.flat().map(c => ({
      date: new Date(c.date),
      count: c.contributionCount
    }));
  }, [githubData]);

  const totalContributions = githubData?.totalContributions || 1612;

  const weeks = useMemo(() => {
    const result: Array<Array<{ date: Date; count: number }>> = [];
    let currentWeek: Array<{ date: Date; count: number }> = [];

    data.forEach((day) => {
      if (day.date.getDay() === 0 && currentWeek.length > 0) {
        result.push([...currentWeek]);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    if (currentWeek.length > 0) result.push([...currentWeek]);
    return result;
  }, [data]);

  const graphWidth = useMemo(() => weeks.length * 9 + (weeks.length - 1) * 3, [weeks]);

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      
      const isMobile = window.innerWidth < 640;
      const padding = isMobile ? 32 : 40;
      const contentWidth = width - padding;
      
      setScale(contentWidth / graphWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [graphWidth]);

  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: { label: string; x: number }[] = [];
    
    weeks.forEach((week, i) => {
      const firstOfMonth = week.find(d => d.date.getDate() === 1);
      if (firstOfMonth) {
        const label = months[firstOfMonth.date.getMonth()];
        if (labels.length === 0 || i - (labels[labels.length - 1].x / 12) > 2) {
           labels.push({ label, x: i * 12 });
        }
      } else if (i === 0 && week[0]) {
        const label = months[week[0].date.getMonth()];
        labels.push({ label, x: 0 });
      }
    });
    return labels;
  }, [weeks]);

  const handleInteraction = useCallback((day: { date: Date; count: number }) => {
    setHoveredDay({
      ...day,
      dateStr: day.date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      })
    });
  }, []);

  return (
    <div className="mt-8 select-none relative" ref={containerRef}>
      <div className="tactile rounded-xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 overflow-hidden relative">
        {/* HUD Hover Info - Anchored to Top Center */}
        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: -4, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -4, x: '-50%' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-4 left-1/2 sm:top-5 z-20 pointer-events-none rounded-md border border-edge-strong bg-surface/95 px-2 py-1 shadow-xl backdrop-blur-sm whitespace-nowrap font-mono text-[10px] flex items-center gap-2"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              <div className="font-bold text-foreground">
                {hoveredDay.count === 0 ? 'No contributions' : `${hoveredDay.count} contribution${hoveredDay.count === 1 ? '' : 's'}`}
              </div>
              <div className="w-[1px] h-3 bg-edge-strong" />
              <div className="text-muted opacity-90">{hoveredDay.dateStr}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#87bbea]">
              {totalContributions.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-wider">contributions</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-muted uppercase tracking-wider">
            <Calendar className="size-3.5 text-faint" />
            <span>Last year</span>
          </div>
        </div>

        {/* Graph Section with Responsive Scaling */}
        <div 
          className="relative origin-top-left"
          style={{ height: `${scale * 105}px` }}
        >
          <div 
            ref={graphRef}
            className="absolute origin-top-left"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="inline-flex flex-col gap-[6px] relative">
              <div className="h-4 relative">
                {monthLabels.map((month, i) => (
                  <span 
                    key={i} 
                    className="absolute text-[9px] font-mono text-faint uppercase tracking-tighter whitespace-nowrap"
                    style={{ left: `${month.x}px` }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = week.find(d => d.date.getDay() === dayIndex);
                      if (!day) {
                        return (
                          <div 
                            key={dayIndex} 
                            className="w-[9px] h-[9px] rounded-[1.5px] bg-transparent" 
                          />
                        );
                      }
                      
                      const level = getContributionLevel(day.count);
                      return (
                        <div
                          key={dayIndex}
                          onMouseMove={() => handleInteraction(day)}
                          onMouseEnter={() => handleInteraction(day)}
                          onTouchStart={() => handleInteraction(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          onTouchEnd={() => setHoveredDay(null)}
                          style={{ backgroundColor: `var(--contrib-${level})` }}
                          className="w-[9px] h-[9px] rounded-[1.5px] cursor-pointer shadow-[0_0.5px_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-130 hover:z-20"
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-3 border-t border-edge-strong/50">
          <a
            href={`https://github.com/${profile.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-muted hover:text-foreground transition-colors group"
          >
            <div className="relative w-4 h-4 overflow-hidden rounded-full border border-edge-strong/30 grayscale group-hover:grayscale-0 transition">
              <Image
                src={`https://github.com/${profile.handle}.png`}
                alt={profile.handle}
                fill
                sizes="16px"
                className="object-cover"
              />
            </div>
            <span className="underline decoration-muted/30 underline-offset-4 group-hover:decoration-foreground/30 transition">@{profile.handle}</span>
            <ArrowUpRight className="size-3 text-faint group-hover:text-foreground transition-colors" />
          </a>

          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-faint">
            <span className="opacity-70">Less</span>
            <div className="flex gap-[3px]">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  style={{ backgroundColor: `var(--contrib-${level})` }}
                  className="w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] rounded-[1.5px]"
                />
              ))}
            </div>
            <span className="opacity-70">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
