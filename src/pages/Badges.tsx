import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Zap, Crown, Shield, 
  Sparkles, Medal, Dumbbell, Calendar, Apple, 
  Lock, X, Award, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';


interface Criterion {
  name: string;
  target: string;
  current: string;
  completed: boolean;
}

interface Badge {
  id: string;
  name: string;
  category: 'camera' | 'streak' | 'habits' | 'diet' | 'onboarding';
  desc: string;
  unlocked: boolean;
  xp: number;
  tier: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  unlockedAt?: string;
  criteria: Criterion[];
}

interface Tier {
  name: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  desc: string;
  colorClass: string;
  glowClass: string;
  borderClass: string;
  textClass: string;
  badges: Badge[];
}

// Custom Premium SVG Badge Renderer (Hollywood JARVIS style)
const BadgeVisual = ({ id, tier, unlocked }: { id: string; tier: string; unlocked: boolean }) => {
  const colors = {
    DIAMOND: {
      primary: '#A855F7',
      secondary: '#6366F1',
      glow: 'rgba(168, 85, 247, 0.45)',
      bg: 'rgba(49, 12, 107, 0.15)'
    },
    PLATINUM: {
      primary: '#06B6D4',
      secondary: '#3B82F6',
      glow: 'rgba(6, 182, 212, 0.45)',
      bg: 'rgba(10, 48, 87, 0.15)'
    },
    GOLD: {
      primary: '#FBBF24',
      secondary: '#EA580C',
      glow: 'rgba(251, 191, 36, 0.45)',
      bg: 'rgba(74, 45, 10, 0.15)'
    },
    SILVER: {
      primary: '#CBD5E1',
      secondary: '#64748B',
      glow: 'rgba(203, 213, 225, 0.35)',
      bg: 'rgba(30, 41, 59, 0.15)'
    },
    BRONZE: {
      primary: '#F97316',
      secondary: '#7C2D12',
      glow: 'rgba(249, 115, 22, 0.35)',
      bg: 'rgba(67, 20, 7, 0.15)'
    }
  }[tier as 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'] || {
    primary: '#FFF',
    secondary: '#888',
    glow: 'rgba(255,255,255,0.2)',
    bg: 'rgba(0,0,0,0.2)'
  };

  const filterId = `glow-${tier}-${id}`;
  const gradId = `grad-${tier}-${id}`;
  const innerGradId = `inner-${tier}-${id}`;

  const renderIconContent = () => {
    switch (id) {
      // DIAMOND
      case 'd1': // Diamond Legend (Crown)
        return (
          <path d="M28 45 L36 58 H64 L72 45 L59 51 L50 35 L41 51 Z M36 58 L36 65 H64 L64 58" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'd2': // Diamond Beast (Zap)
        return (
          <path d="M55 30 L32 53 H48 L42 70 L68 47 H52 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        );
      case 'd3': // Ultimate Athlete (Shield with Wings)
        return (
          <g>
            <path d="M50 30 L70 36 V54 C70 66 50 72 50 72 C50 72 30 66 30 54 V36 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M42 50 L48 56 L58 46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      
      // PLATINUM
      case 'p1': // Platinum Warrior (Helmet)
        return (
          <g>
            <path d="M50 28 C38 28 32 38 32 52 L35 63 H44 L46 50 L50 54 L54 50 L56 63 H65 L68 52 C68 38 62 28 50 28 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M50 28 V18 L58 22 M50 18 L42 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'p2': // Platinum Elite (Shining Star)
        return (
          <path d="M50 25 L56 41 L73 43 L61 54 L65 70 L50 62 L35 70 L39 54 L27 43 L44 41 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        );
      case 'p3': // Diet Champion (Laurel Wreath)
        return (
          <g>
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M36 40 L36 58 M64 40 L64 58 M43 62 Q50 67 57 62" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // GOLD
      case 'g1': // Gold Fitness Pro (Dumbbell)
        return (
          <path d="M28 45 V55 M36 40 V60 M36 50 H64 M64 40 V60 M72 45 V55 M28 47 Q32 50 28 53 M72 47 Q68 50 72 53" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'g2': // Endurance Master (Running winged timer)
        return (
          <g>
            <circle cx="50" cy="48" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M50 34 V39 M50 48 H58 M61 37 L57 41" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 48 C26 38 36 31 40 31 M74 48 C74 38 64 31 60 31" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'g3': // Strength Builder (Barbell / Trending Up)
        return (
          <g>
            <path d="M30 62 L45 47 L55 55 L70 38" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M58 38 H70 V50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // SILVER
      case 's1': // Silver Achiever (Concentric Target)
        return (
          <g>
            <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
          </g>
        );
      case 's2': // Silver Consistent (Calendar)
        return (
          <g>
            <rect x="32" y="34" width="36" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M32 44 H68 M42 30 V36 M58 30 V36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="43" cy="52" r="2" fill="currentColor" />
            <circle cx="57" cy="52" r="2" fill="currentColor" />
            <circle cx="50" cy="60" r="2" fill="currentColor" />
          </g>
        );
      case 's3': // Silver Athlete (Running Sneaker)
        return (
          <path d="M30 58 Q38 38 50 38 Q58 38 68 46 V58 Z M43 38 V58 M55 42 V58" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        );

      // BRONZE
      case 'b1': // Bronze Starter (Play)
        return (
          <path d="M40 33 L65 50 L40 67 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'b2': // Bronze Performer (Plus)
        return (
          <path d="M50 30 V70 M30 50 H70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        );
      case 'b3': // Bronze Challenger (Message)
        return (
          <path d="M30 35 H70 V59 H42 L30 69 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );

      default:
        return null;
    }
  };

  const renderWrapper = () => {
    switch (tier) {
      case 'DIAMOND':
        return (
          <g>
            {/* Hexagonal diamond base */}
            <polygon 
              points="50,10 87,30 87,70 50,90 13,70 13,30" 
              fill={colors.bg} 
              stroke={`url(#${gradId})`} 
              strokeWidth="4" 
              filter={unlocked ? `url(#${filterId})` : undefined} 
              strokeLinejoin="round"
            />
            <polygon 
              points="50,20 78,35 78,65 50,80 22,65 22,35" 
              fill="none" 
              stroke={`url(#${innerGradId})`} 
              strokeWidth="1.5" 
              strokeOpacity="0.4"
            />
            {/* Facet lines */}
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
            <line x1="13" y1="30" x2="87" y2="70" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
            <line x1="13" y1="70" x2="87" y2="30" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
          </g>
        );
      case 'PLATINUM':
        return (
          <g>
            {/* Octagonal modern shield */}
            <polygon 
              points="50,10 82,20 88,52 68,88 32,88 12,52 18,20" 
              fill={colors.bg} 
              stroke={`url(#${gradId})`} 
              strokeWidth="4" 
              filter={unlocked ? `url(#${filterId})` : undefined} 
              strokeLinejoin="round"
            />
            <polygon 
              points="50,18 76,26 80,50 64,80 36,80 20,50 24,26" 
              fill="none" 
              stroke={`url(#${innerGradId})`} 
              strokeWidth="1.5" 
              strokeOpacity="0.4"
            />
          </g>
        );
      case 'GOLD':
        return (
          <g>
            {/* Circular crest with sunburst details */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill={colors.bg} 
              stroke={`url(#${gradId})`} 
              strokeWidth="4" 
              filter={unlocked ? `url(#${filterId})` : undefined}
            />
            <circle cx="50" cy="50" r="33" fill="none" stroke={`url(#${innerGradId})`} strokeWidth="1.8" strokeDasharray="6 3" strokeOpacity="0.6" />
            <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />
          </g>
        );
      case 'SILVER':
        return (
          <g>
            {/* Circular coin */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill={colors.bg} 
              stroke={`url(#${gradId})`} 
              strokeWidth="3.5" 
              filter={unlocked ? `url(#${filterId})` : undefined}
            />
            <circle cx="50" cy="50" r="32" fill="none" stroke={`url(#${innerGradId})`} strokeWidth="1.5" strokeOpacity="0.4" />
          </g>
        );
      case 'BRONZE':
        return (
          <g>
            {/* Hexagonal sharp shield */}
            <polygon 
              points="50,10 86,28 86,72 50,90 14,72 14,28" 
              fill={colors.bg} 
              stroke={`url(#${gradId})`} 
              strokeWidth="3.5" 
              filter={unlocked ? `url(#${filterId})` : undefined}
              strokeLinejoin="round"
            />
            <polygon 
              points="50,18 78,33 78,67 50,82 22,67 22,33" 
              fill="none" 
              stroke={`url(#${innerGradId})`} 
              strokeWidth="1.5" 
              strokeOpacity="0.3"
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`w-full h-full transition-all duration-500 ${unlocked ? 'text-white' : 'text-white/20'}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={unlocked ? colors.primary : '#334155'} />
          <stop offset="50%" stopColor={unlocked ? '#FFFFFF' : '#475569'} />
          <stop offset="100%" stopColor={unlocked ? colors.secondary : '#1E293B'} />
        </linearGradient>
        
        <linearGradient id={innerGradId} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={unlocked ? colors.primary : '#334155'} />
          <stop offset="100%" stopColor={unlocked ? colors.secondary : '#1E293B'} />
        </linearGradient>

        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="0" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8" />
          </feComponentTransfer>
          <feFlood floodColor={colors.primary} />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {renderWrapper()}
      
      <g className="translate-y-0.5">
        {renderIconContent()}
      </g>
    </svg>
  );
};

const INITIAL_TIERS: Tier[] = [
  {
    name: 'DIAMOND',
    desc: 'The ultimate recognition for elite fitness legends.',
    colorClass: 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400',
    glowClass: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    borderClass: 'border-indigo-500/30',
    textClass: 'text-indigo-300',
    badges: [
      { 
        id: 'd1', 
        name: 'Diamond Legend', 
        category: 'streak',
        desc: 'Maintain a daily workout streak of 60 consecutive days.', 
        unlocked: true, 
        xp: 5000, 
        tier: 'DIAMOND',
        unlockedAt: '2026-05-15', 
        criteria: [
          { name: 'Daily workout streak log', target: '60 days', current: '60 days', completed: true },
          { name: 'Weekly weight verification checks', target: '8 weeks', current: '8 weeks', completed: true }
        ]
      },
      { 
        id: 'd2', 
        name: 'Diamond Beast', 
        category: 'camera',
        desc: 'Record 300 minutes of intensive camera posture tracking.', 
        unlocked: true, 
        xp: 3000, 
        tier: 'DIAMOND',
        unlockedAt: '2026-06-10', 
        criteria: [
          { name: 'Camera pose detection active log', target: '300 min', current: '300 min', completed: true },
          { name: 'Exercise sets tracked under analysis', target: '50 sets', current: '50 sets', completed: true }
        ]
      },
      { 
        id: 'd3', 
        name: 'Ultimate Athlete', 
        category: 'camera',
        desc: 'Complete all default exercises at 95%+ posture score.', 
        unlocked: false, 
        xp: 8000, 
        tier: 'DIAMOND',
        criteria: [
          { name: 'Average posture rating score', target: '>= 95%', current: '91%', completed: false },
          { name: 'Continuous pull-ups without warning', target: '10 reps', current: '7 reps', completed: false }
        ]
      }
    ]
  },
  {
    name: 'PLATINUM',
    desc: 'For those who go above and beyond.',
    colorClass: 'bg-cyan-950/20 border-cyan-500/20 text-cyan-400',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-300',
    badges: [
      { 
        id: 'p1', 
        name: 'Platinum Warrior', 
        category: 'camera',
        desc: 'Perfect 10 pullups in a single session.', 
        unlocked: true, 
        xp: 2500, 
        tier: 'PLATINUM',
        unlockedAt: '2026-04-12', 
        criteria: [
          { name: 'Correct posture pullup count', target: '10 reps', current: '10 reps', completed: true },
          { name: 'Wrist-to-shoulder height alignment', target: '>= 90%', current: '96%', completed: true }
        ]
      },
      { 
        id: 'p2', 
        name: 'Platinum Elite', 
        category: 'camera',
        desc: 'Complete 20 posture-correct yoga checks.', 
        unlocked: true, 
        xp: 2000, 
        tier: 'PLATINUM',
        unlockedAt: '2026-05-02', 
        criteria: [
          { name: 'Stable camera posture checks', target: '20 sessions', current: '20 sessions', completed: true },
          { name: 'Tree pose alignment duration', target: '60s', current: '60s', completed: true }
        ]
      },
      { 
        id: 'p3', 
        name: 'Diet Champion', 
        category: 'diet',
        desc: 'Follow diet plans correctly and achieve macro guidelines.', 
        unlocked: true, 
        xp: 1500, 
        tier: 'PLATINUM',
        unlockedAt: '2026-05-28', 
        criteria: [
          { name: 'Follow AI protein target daily', target: '14 days', current: '14 days', completed: true },
          { name: 'Stay below daily carbohydrate limit', target: '14 days', current: '14 days', completed: true }
        ]
      }
    ]
  },
  {
    name: 'GOLD',
    desc: 'Celebrating your dedication and outstanding progress.',
    colorClass: 'bg-yellow-950/20 border-yellow-500/20 text-yellow-400',
    glowClass: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]',
    borderClass: 'border-yellow-500/30',
    textClass: 'text-yellow-300',
    badges: [
      { 
        id: 'g1', 
        name: 'Gold Fitness Pro', 
        category: 'camera',
        desc: 'Record a bicep curl set with zero warnings.', 
        unlocked: true, 
        xp: 1000, 
        tier: 'GOLD',
        unlockedAt: '2026-03-30', 
        criteria: [
          { name: 'Posture warnings during curl set', target: '0 warnings', current: '0 warnings', completed: true },
          { name: 'Elbows locked stance check', target: '100%', current: '100%', completed: true }
        ]
      },
      { 
        id: 'g2', 
        name: 'Endurance Master', 
        category: 'streak',
        desc: 'Keep a posture check active for 15 minutes.', 
        unlocked: false, 
        xp: 1000, 
        tier: 'GOLD',
        criteria: [
          { name: 'Posture detection analysis active time', target: '15 min', current: '12 min', completed: false },
          { name: 'Active workout calorie consumption', target: '400 kcal', current: '350 kcal', completed: false }
        ]
      },
      { 
        id: 'g3', 
        name: 'Strength Builder', 
        category: 'camera',
        desc: 'Perform 100 total squats under camera analysis.', 
        unlocked: true, 
        xp: 800, 
        tier: 'GOLD',
        unlockedAt: '2026-04-20', 
        criteria: [
          { name: 'Camera verified squats count', target: '100 squats', current: '100 squats', completed: true },
          { name: 'Hips-to-knees alignment score', target: '>= 90%', current: '94%', completed: true }
        ]
      }
    ]
  },
  {
    name: 'SILVER',
    desc: 'Honoring your consistency and hard work.',
    colorClass: 'bg-slate-900/20 border-slate-500/20 text-slate-300',
    glowClass: 'shadow-[0_0_20px_rgba(148,163,184,0.25)]',
    borderClass: 'border-slate-500/30',
    textClass: 'text-slate-300',
    badges: [
      { 
        id: 's1', 
        name: 'Silver Achiever', 
        category: 'onboarding',
        desc: 'Register a new profile and set your goal.', 
        unlocked: true, 
        xp: 500, 
        tier: 'SILVER',
        unlockedAt: '2026-03-19', 
        criteria: [
          { name: 'Set primary objective goal', target: 'Done', current: 'Done', completed: true },
          { name: 'Complete profile metadata setup', target: 'Done', current: 'Done', completed: true }
        ]
      },
      { 
        id: 's2', 
        name: 'Silver Consistent', 
        category: 'habits',
        desc: 'Complete 5 days of habit tracking.', 
        unlocked: true, 
        xp: 500, 
        tier: 'SILVER',
        unlockedAt: '2026-03-24', 
        criteria: [
          { name: 'Habit list daily completions', target: '5 days', current: '5 days', completed: true },
          { name: '3L Water daily target checks', target: '5 days', current: '5 days', completed: true }
        ]
      },
      { 
        id: 's3', 
        name: 'Silver Athlete', 
        category: 'diet',
        desc: 'Scan 5 healthy meals using the AI Scanner.', 
        unlocked: true, 
        xp: 400, 
        tier: 'SILVER',
        unlockedAt: '2026-04-05', 
        criteria: [
          { name: 'Meal analysis photo scans count', target: '5 scans', current: '5 scans', completed: true },
          { name: 'AI registered healthy ingredients', target: '3 plates', current: '3 plates', completed: true }
        ]
      }
    ]
  },
  {
    name: 'BRONZE',
    desc: 'Every journey starts here. Take the first step!',
    colorClass: 'bg-orange-950/20 border-orange-500/20 text-orange-400',
    glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]',
    borderClass: 'border-orange-500/30',
    textClass: 'text-orange-300',
    badges: [
      { 
        id: 'b1', 
        name: 'Bronze Starter', 
        category: 'onboarding',
        desc: 'Complete your first onboarding session.', 
        unlocked: true, 
        xp: 200, 
        tier: 'BRONZE',
        unlockedAt: '2026-03-19', 
        criteria: [
          { name: 'Complete welcome tutorial steps', target: 'Done', current: 'Done', completed: true },
          { name: 'Access AI health coach system', target: 'Done', current: 'Done', completed: true }
        ]
      },
      { 
        id: 'b2', 
        name: 'Bronze Performer', 
        category: 'camera',
        desc: 'Count your first 10 reps of squats.', 
        unlocked: true, 
        xp: 200, 
        tier: 'BRONZE',
        unlockedAt: '2026-03-20', 
        criteria: [
          { name: 'Squat camera reps recorded', target: '10 reps', current: '10 reps', completed: true },
          { name: 'Stance validation check passed', target: 'Done', current: 'Done', completed: true }
        ]
      },
      { 
        id: 'b3', 
        name: 'Bronze Challenger', 
        category: 'diet',
        desc: 'Send your first message to the AI health coach.', 
        unlocked: true, 
        xp: 200, 
        tier: 'BRONZE',
        unlockedAt: '2026-03-20', 
        criteria: [
          { name: 'AI diet consultation logs', target: '1 question', current: '1 question', completed: true },
          { name: 'Meal replacement chat queries', target: '1 query', current: '1 query', completed: true }
        ]
      }
    ]
  }
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All', icon: Award },
  { id: 'camera', label: 'Camera Checks', icon: Shield },
  { id: 'streak', label: 'Daily Streaks', icon: Trophy },
  { id: 'habits', label: 'Habit Tracker', icon: Calendar },
  { id: 'diet', label: 'Nutrition & Diet', icon: Apple }
];

const Badges = () => {
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Compute stats
  const totalBadgesLimit = INITIAL_TIERS.reduce((acc, tier) => acc + tier.badges.length, 0);
  const totalBadgesCount = INITIAL_TIERS.reduce(
    (acc, tier) => acc + tier.badges.filter(b => b.unlocked).length, 0
  );

  const getFilteredBadges = (badges: Badge[]) => {
    if (activeFilter === 'all') return badges;
    return badges.filter(b => b.category === activeFilter);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-24 pt-8 px-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-heading text-3xl tracking-wide uppercase">Achievements</h1>
      </div>

      {/* Stats Banner */}
      <div className="glass rounded-3xl p-5 border border-white/5 flex justify-between items-center mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Trophy className="text-primary w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Rewards Tracker</p>
            <p className="font-heading text-xl text-primary mt-0.5">My Achievements</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase font-bold">Unlocked</p>
            <p className="font-heading text-base text-primary">{totalBadgesCount}/{totalBadgesLimit}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase font-bold">XP Score</p>
            <p className="font-heading text-base text-primary">17,400</p>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-6">
        {CATEGORY_FILTERS.map(f => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive 
                  ? 'bg-primary border-primary text-black shadow-[0_0_12px_rgba(198,255,0,0.35)]'
                  : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tiers List */}
      <div className="space-y-8">
        {INITIAL_TIERS.map((tier) => {
          const filteredBadges = getFilteredBadges(tier.badges);
          if (filteredBadges.length === 0) return null;

          return (
            <div key={tier.name} className="space-y-4">
              {/* Tier Header */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`font-heading text-lg tracking-wider font-black ${tier.textClass}`}>
                    {tier.name} TIER
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{tier.desc}</p>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-3 gap-3">
                {filteredBadges.map((badge) => {
                  const completedCount = badge.criteria.filter(c => c.completed).length;
                  const totalCount = badge.criteria.length;
                  const progressPct = Math.round((completedCount / totalCount) * 100);

                  return (
                    <motion.button
                      key={badge.id}
                      whileHover={{ scale: badge.unlocked ? 1.04 : 1.0 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedBadge(badge)}
                      className={`glass rounded-2xl p-3 flex flex-col items-center text-center justify-center border aspect-square relative transition-all duration-300 ${
                        badge.unlocked 
                          ? `${tier.colorClass} ${tier.borderClass} ${tier.glowClass}`
                          : 'bg-white/2 border-white/5 text-white/25'
                      }`}
                    >
                      {!badge.unlocked && (
                        <div className="absolute top-2 right-2 text-white/30">
                          <Lock size={12} />
                        </div>
                      )}
                      
                      <div className="w-16 h-16 flex items-center justify-center">
                        <BadgeVisual id={badge.id} tier={tier.name} unlocked={badge.unlocked} />
                      </div>

                      <span className={`text-[9px] font-bold mt-2 leading-tight line-clamp-2 ${
                        badge.unlocked ? 'text-white/80' : 'text-white/25'
                      }`}>
                        {badge.name}
                      </span>

                      {/* Card Progress Line */}
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-3">
                        <div 
                          className={`h-full transition-all duration-500 ${badge.unlocked ? 'bg-primary' : 'bg-white/10'}`} 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Details Dialog */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-[370px] glass rounded-[36px] p-6 border border-white/10 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/60"
              >
                <X size={16} />
              </button>

              {/* Title & Icon Header */}
              <div className="flex flex-col items-center text-center mt-4">
                <div className="h-28 w-28 flex items-center justify-center">
                  <BadgeVisual id={selectedBadge.id} tier={selectedBadge.tier} unlocked={selectedBadge.unlocked} />
                </div>

                <h3 className="font-heading text-xl mt-4 text-white leading-tight">{selectedBadge.name}</h3>
                
                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2 border ${
                  selectedBadge.unlocked 
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}>
                  {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              {/* Unlock Requirement Statement */}
              <p className="text-center text-[11px] text-white/50 mt-4 leading-relaxed px-2">
                {selectedBadge.desc}
              </p>

              {/* Checklist Criteria Details */}
              <div className="mt-5 space-y-2">
                <p className="font-semibold text-white/30 text-[9px] uppercase tracking-widest pl-1">
                  Achievement Criteria Checklist
                </p>
                
                {selectedBadge.criteria.map((c, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      c.completed 
                        ? 'bg-primary/5 border-primary/20 text-white/80' 
                        : 'bg-white/2 border-white/5 text-white/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[70%]">
                      <div className={`p-0.5 rounded-md mt-0.5 ${
                        c.completed ? 'bg-primary text-black' : 'bg-white/5 text-white/20'
                      }`}>
                        {c.completed ? <Check size={10} strokeWidth={4} /> : <Lock size={10} />}
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[11px] font-medium">{c.name}</p>
                        <p className={`text-[9px] mt-0.5 ${c.completed ? 'text-primary/70' : 'text-white/30'}`}>
                          Target: {c.target}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold ${
                        c.completed ? 'text-primary' : 'text-white/40'
                      }`}>
                        {c.current}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards Stats Footer */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-1">
                <div className="glass p-3 rounded-xl border border-white/5 text-center">
                  <p className="text-[9px] text-white/40 uppercase font-bold">Reward</p>
                  <p className="font-heading text-sm text-primary">+{selectedBadge.xp} XP</p>
                </div>
                <div className="glass p-3 rounded-xl border border-white/5 text-center">
                  <p className="text-[9px] text-white/40 uppercase font-bold">Unlocked on</p>
                  <p className="font-heading text-xs text-white/80 pt-0.5">
                    {selectedBadge.unlockedAt ? selectedBadge.unlockedAt : 'Locked'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default Badges;
