import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Edit2, Trash2, Check, ChevronRight,
    Settings, History, Calendar, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import BottomNav from '@/components/BottomNav';
import ContributionHeatmap from '@/components/ContributionHeatmap';
import { format, isSameDay, subDays, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Habit {
    id: string;
    name: string;
    time?: string;
    category: 'Fitness' | 'Diet' | 'Mental' | 'Sleep' | 'Custom';
    color: string;
    completedDates: string[]; // ['2025-03-30', ...]
}

const CATEGORIES = ['Fitness', 'Diet', 'Mental', 'Sleep', 'Custom'];
const COLORS = ['#C6FF00', '#00E5FF', '#FF1744', '#D400FF', '#FF9100'];

const Tracker: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Form State
    const [formName, setFormName] = useState('');
    const [formTime, setFormTime] = useState('');
    const [formCategory, setFormCategory] = useState<Habit['category']>('Fitness');
    const [formColor, setFormColor] = useState(COLORS[0]);

    // Persistence
    useEffect(() => {
        api.tracker.getHabits()
            .then((data) => {
                // If backend returns data, set it
                if (data && data.length > 0) {
                    setHabits(data);
                } else {
                    // Seed habits if empty
                    const mockHabits: Habit[] = [
                        {
                            id: '1', name: 'Morning Cardio', category: 'Fitness', color: COLORS[0],
                            completedDates: generateMockDates(60), time: '07:00 AM'
                        },
                        {
                            id: '2', name: 'Drink 3L Water', category: 'Diet', color: COLORS[1],
                            completedDates: generateMockDates(80), time: 'All Day'
                        },
                        {
                            id: '3', name: '10m Meditation', category: 'Mental', color: COLORS[3],
                            completedDates: generateMockDates(40), time: '09:00 PM'
                        }
                    ];
                    setHabits(mockHabits);
                    api.tracker.saveHabits(mockHabits).catch(console.error);
                }
            })
            .catch((err) => {
                console.error("Failed to load habits from server, falling back to local storage:", err);
                const saved = localStorage.getItem('fitguru_habits');
                if (saved) {
                    setHabits(JSON.parse(saved));
                }
            });
    }, []);

    useEffect(() => {
        if (habits.length > 0) {
            localStorage.setItem('fitguru_habits', JSON.stringify(habits));
            api.tracker.saveHabits(habits).catch((err) => {
                console.error("Failed to save habits to server:", err);
            });
        }
    }, [habits]);

    function generateMockDates(count: number) {
        const dates = [];
        for (let i = 0; i < 365; i++) {
            if (Math.random() < count / 100) {
                dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
            }
        }
        return dates;
    }

    const toggleHabit = (id: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        setHabits(habits.map(h => {
            if (h.id === id) {
                const isDone = h.completedDates.includes(today);
                return {
                    ...h,
                    completedDates: isDone
                        ? h.completedDates.filter(d => d !== today)
                        : [...h.completedDates, today]
                };
            }
            return h;
        }));
        toast.success('Progress updated!');
    };

    const handleSaveHabit = () => {
        if (!formName) return;

        if (editingHabit) {
            setHabits(habits.map(h => h.id === editingHabit.id ? {
                ...h,
                name: formName,
                time: formTime,
                category: formCategory,
                color: formColor
            } : h));
            setEditingHabit(null);
        } else {
            const newH: Habit = {
                id: Date.now().toString(),
                name: formName,
                time: formTime,
                category: formCategory,
                color: formColor,
                completedDates: []
            };
            setHabits([...habits, newH]);
        }
        resetForm();
        setIsAddMode(false);
    };

    const resetForm = () => {
        setFormName('');
        setFormTime('');
        setFormCategory('Fitness');
        setFormColor(COLORS[0]);
    };

    const deleteHabit = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    const allCompletedDates = useMemo(() => {
        return habits.flatMap(h => h.completedDates);
    }, [habits]);

    const habitNamesByDate = useMemo(() => {
        const map: Record<string, string[]> = {};
        habits.forEach(h => {
            h.completedDates.forEach(date => {
                if (!map[date]) map[date] = [];
                map[date].push(h.name);
            });
        });
        return map;
    }, [habits]);

    const totalCompletions = allCompletedDates.length;

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white pb-24 px-5 pt-8 overflow-x-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-heading text-4xl tracking-wider">TRACKER</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    className="glass rounded-full text-primary"
                    onClick={() => setIsManagerOpen(true)}
                >
                    <Settings size={20} />
                </Button>
            </div>

            {/* My Habits Section */}
            <section className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="font-heading text-xl text-primary/80 tracking-wide uppercase">My Habits</h2>
                </div>

                <div className="space-y-3">
                    {habits.map((habit) => (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
                            onClick={() => toggleHabit(habit.id)}
                        >
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1"
                                style={{ backgroundColor: habit.color }}
                            />
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${habit.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))
                                ? 'bg-primary text-black scale-110'
                                : 'bg-white/5 text-white/40'
                                }`}>
                                <Check size={24} strokeWidth={3} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-heading text-lg leading-none mb-1">{habit.name}</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-tighter">{habit.time || 'flexible'} • {habit.category}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/20 hover:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setHistoryHabit(habit);
                                }}
                            >
                                <History size={16} />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Global Heatmap Section */}
            <section className="glass rounded-3xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-heading text-xl">Consistency — {selectedYear}</h2>
                    <div className="flex gap-2">
                        {[2024, 2025, 2026].map(y => (
                            <button
                                key={y}
                                onClick={() => setSelectedYear(y)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${selectedYear === y ? 'bg-primary text-black' : 'bg-white/5 text-white/30'
                                    }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-primary font-heading text-2xl mb-4">
                    {totalCompletions} <span className="text-white/40 text-sm">habits completed this year</span>
                </p>

                <ContributionHeatmap
                    year={selectedYear}
                    completedDates={allCompletedDates}
                    habitNamesByDate={habitNamesByDate}
                />
            </section>

            {/* Habit Manager Modal */}
            <AnimatePresence>
                {isManagerOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end justify-center"
                        onClick={() => setIsManagerOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-[430px] glass rounded-t-[40px] p-8 pb-32 max-h-[85vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="font-heading text-3xl font-black">Manage Habits</h2>
                                <button
                                    onClick={() => {
                                        setIsManagerOpen(false);
                                        setIsAddMode(false);
                                        setEditingHabit(null);
                                    }}
                                    className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {!isAddMode && !editingHabit ? (
                                <div className="space-y-4">
                                    {habits.map(h => (
                                        <div key={h.id} className="flex items-center justify-between glass p-4 rounded-2xl border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                                                <span className="font-heading text-lg">{h.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-white/40 hover:text-primary transition-all"
                                                    onClick={() => {
                                                        setEditingHabit(h);
                                                        setFormName(h.name);
                                                        setFormTime(h.time || '');
                                                        setFormCategory(h.category);
                                                        setFormColor(h.color);
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-white/40 hover:text-red-500 transition-all"
                                                    onClick={() => deleteHabit(h.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-primary text-black font-heading text-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                        onClick={() => setIsAddMode(true)}
                                    >
                                        ADD NEW HABIT
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Habit Name</label>
                                        <Input
                                            value={formName}
                                            onChange={e => setFormName(e.target.value)}
                                            placeholder="e.g., Cold Shower"
                                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Time</label>
                                            <Input
                                                value={formTime}
                                                onChange={e => setFormTime(e.target.value)}
                                                placeholder="e.g., 8:00 AM"
                                                className="h-12 bg-white/5 border-white/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Category</label>
                                            <Select
                                                value={formCategory}
                                                onValueChange={(v: any) => setFormCategory(v)}
                                            >
                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent className="glass border-white/10 rounded-xl">
                                                    {CATEGORIES.map(c => (
                                                        <SelectItem key={c} value={c} className="focus:bg-primary/20">{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block text-center">Assign Color</label>
                                        <div className="flex justify-center gap-4">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setFormColor(c)}
                                                    className={`w-10 h-10 rounded-full transition-all border-4 ${formColor === c ? 'border-white scale-125' : 'border-black hover:scale-110'
                                                        }`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-14 rounded-2xl glass border-white/5 font-heading text-lg"
                                            onClick={() => {
                                                setIsAddMode(false);
                                                setEditingHabit(null);
                                                resetForm();
                                            }}
                                        >
                                            CANCEL
                                        </Button>
                                        <Button
                                            className="flex-1 h-14 rounded-2xl bg-primary text-black font-heading text-lg"
                                            onClick={handleSaveHabit}
                                        >
                                            {editingHabit ? 'SAVE CHANGES' : 'CREATE HABIT'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Individual Habit History Modal */}
            <AnimatePresence>
                {historyHabit && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[60] bg-[#0D0D0D] flex flex-col p-8 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: historyHabit.color }} />
                                <h2 className="font-heading text-4xl">{historyHabit.name}</h2>
                            </div>
                            <button
                                onClick={() => setHistoryHabit(null)}
                                className="bg-white/5 p-3 rounded-2xl"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="glass p-5 rounded-3xl">
                                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Total Wins</p>
                                <p className="font-heading text-3xl text-primary">{historyHabit.completedDates.length}</p>
                            </div>
                            <div className="glass p-5 rounded-3xl">
                                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Consistency</p>
                                <p className="font-heading text-3xl text-primary">
                                    {Math.round((historyHabit.completedDates.length / 365) * 100)}%
                                </p>
                            </div>
                        </div>

                        <div className="glass rounded-[40px] p-8 mb-8 border-white/5">
                            <h3 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-primary" /> Completion History
                            </h3>
                            <ContributionHeatmap
                                year={2025}
                                completedDates={historyHabit.completedDates}
                            />
                        </div>

                        <div className="glass rounded-3xl p-6 mt-auto">
                            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "68%" }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <p className="text-center text-xs text-white/40 font-bold uppercase tracking-widest">
                                Completed 68% of days this year
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
};

export default Tracker;
