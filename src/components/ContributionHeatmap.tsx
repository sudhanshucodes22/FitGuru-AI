import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, eachDayOfInterval, startOfYear, endOfYear, subYears, isSameDay, getDay, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface HeatmapProps {
    year: number;
    completedDates: string[]; // ['2025-03-30', ...]
    habitNamesByDate?: Record<string, string[]>;
}

const ContributionHeatmap: React.FC<HeatmapProps> = ({ year, completedDates, habitNamesByDate = {} }) => {
    const days = useMemo(() => {
        const start = startOfYear(new Date(year, 0, 1));
        const end = endOfYear(new Date(year, 0, 1));
        return eachDayOfInterval({ start, end });
    }, [year]);

    const months = useMemo(() => {
        const start = startOfYear(new Date(year, 0, 1));
        const end = endOfYear(new Date(year, 0, 1));
        return eachMonthOfInterval({ start, end });
    }, [year]);

    const getColor = (count: number) => {
        if (count === 0) return '#1E1E1E';
        if (count <= 2) return '#C6FF0033';
        if (count <= 4) return '#C6FF0066';
        if (count <= 6) return '#C6FF00AA';
        return '#C6FF00';
    };

    const today = new Date();

    // Group days into weeks (columns)
    const columns: Date[][] = [];
    let currentWeek: Date[] = [];

    // Pad the first week if necessary
    const firstDayOfYear = days[0];
    const paddingDays = getDay(firstDayOfYear) === 0 ? 6 : getDay(firstDayOfYear) - 1; // Adjust for Mon-Sun

    // Actually, GitHub style is Sun-Sat columns, but user asked for row labels Mon-Sun and columns as weeks.
    // We'll align with Mon-Sun rows.

    days.forEach((day) => {
        currentWeek.push(day);
        if (getDay(day) === 0 || day === days[days.length - 1]) { // Sunday is 0
            columns.push(currentWeek);
            currentWeek = [];
        }
    });

    return (
        <div className="w-full overflow-x-auto hide-scrollbar py-4 px-1">
            <div className="min-w-[650px]">
                {/* Month Labels */}
                <div className="flex text-[10px] text-muted-foreground mb-2 ml-8">
                    {months.map((month, i) => {
                        const startOfM = startOfMonth(month);
                        // Rough calc for positioning
                        const weekIndex = columns.findIndex(col => col.some(d => isSameDay(d, startOfM)));
                        if (weekIndex === -1) return null;
                        return (
                            <div key={i} className="absolute" style={{ left: `${weekIndex * 15 + 32}px` }}>
                                {format(month, 'MMM')}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-2 pt-4">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-2 justify-around py-1 h-[105px]">
                        <span>M</span>
                        <span>W</span>
                        <span>F</span>
                    </div>

                    <div className="flex gap-[3px]">
                        {columns.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-[3px]">
                                {/* Ensure 7 rows even if week is partial */}
                                {Array.from({ length: 7 }).map((_, dayIdx) => {
                                    const day = week.find(d => {
                                        const dIdx = getDay(d) === 0 ? 6 : getDay(d) - 1;
                                        return dIdx === dayIdx;
                                    });

                                    if (!day) return <div key={dayIdx} className="w-[12px] h-[12px]" />;

                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const count = completedDates.filter(d => d === dateStr).length;
                                    const habits = habitNamesByDate[dateStr] || [];
                                    const isToday = isSameDay(day, today);

                                    return (
                                        <TooltipProvider key={dayIdx}>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: (weekIdx * 7 + dayIdx) * 0.001 }}
                                                        className={`w-[12px] h-[12px] rounded-sm transition-colors duration-300 cursor-pointer ${isToday ? 'border border-white/50 ring-1 ring-white/20' : ''}`}
                                                        style={{ backgroundColor: getColor(count) }}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="glass border-border p-2 min-w-[120px]">
                                                    <p className="text-[10px] font-bold">{format(day, 'MMMM d, yyyy')}</p>
                                                    <p className="text-[10px] text-primary">{count} habits completed</p>
                                                    {habits.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {habits.map((h, i) => (
                                                                <span key={i} className="text-[8px] bg-white/10 px-1 rounded-sm">{h}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionHeatmap;
