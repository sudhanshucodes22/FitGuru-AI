import { useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, MessageCircle, Dumbbell, User, LayoutDashboard, Trophy } from 'lucide-react';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { path: '/tracker', icon: LayoutDashboard, label: 'Tracker' },
  { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { path: '/badges', icon: Trophy, label: 'Badges' },
  { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
                active ? 'text-primary glow-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[9px] font-semibold tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
