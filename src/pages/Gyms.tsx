import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Map, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';

const filters = ['Price', 'Rating', 'Distance', 'Offers'];

const gyms = [
  { name: "Gold's Gym", distance: '1.2 km', rating: 4.5, price: '₹2,999', originalPrice: '₹5,999', offer: '50% OFF First Month', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { name: 'Anytime Fitness', distance: '2.5 km', rating: 4.3, price: 'FREE', originalPrice: '₹3,499', offer: 'First Month Free', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { name: 'CrossFit Box Elite', distance: '3.8 km', rating: 4.7, price: '₹2,099', originalPrice: '₹3,499', offer: '40% OFF', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
];

const Gyms = () => {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className="pb-20 min-h-screen">
      <div className="p-5 pt-8">
        <div className="flex justify-between items-center">
          <h1 className="font-heading text-3xl text-foreground">Nearby Gyms</h1>
          <button
            onClick={() => setView(view === 'list' ? 'map' : 'list')}
            className="glass rounded-xl p-2"
          >
            {view === 'list' ? <Map size={20} className="text-foreground" /> : <List size={20} className="text-foreground" />}
          </button>
        </div>

        <div className="relative mt-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search gyms near you..." className="pl-9 h-11 rounded-xl bg-secondary border-0" />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(activeFilter === f ? null : f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {view === 'list' ? (
          <div className="mt-4 space-y-3">
            {gyms.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <img src={g.image} alt={g.name} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-foreground">{g.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin size={12} /> {g.distance}
                        <span className="flex items-center gap-0.5"><Star size={12} className="text-primary fill-primary" /> {g.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-muted-foreground">{g.originalPrice}</p>
                      <p className="font-heading text-lg text-primary">{g.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">{g.offer}</span>
                    <Button size="sm" className="rounded-xl text-xs h-8">View Deal</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-4 glass rounded-2xl h-80 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary" />
            <div className="relative z-10 text-center">
              <Map size={40} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Map view</p>
              {/* Mock pins */}
              <div className="flex gap-6 mt-4">
                {gyms.map((g) => (
                  <div key={g.name} className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <MapPin size={14} className="text-primary-foreground" />
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1">{g.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Gyms;
