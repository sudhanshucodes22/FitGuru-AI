import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const goals = ['Lose Weight', 'Build Muscle', 'Stay Flexible', 'Eat Healthy'];

const SignUp = () => {
  const navigate = useNavigate();
  const { setIsOnboarded, setUser, user } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('Build Muscle');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.auth.signup({ name: name || 'Alex', goal: selectedGoal, email, password });
      setUser(res.user);
      setIsOnboarded(true);
      navigate('/home');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-heading text-4xl text-foreground mb-1">Join FitGuru AI</h1>
        <p className="text-muted-foreground mb-8">Your personal AI trainer awaits</p>

        <div className="flex gap-3 mb-6">
          <Button variant="outline" className="flex-1 h-12 gap-2 rounded-xl border-border">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </Button>
          <Button variant="outline" className="flex-1 h-12 gap-2 rounded-xl border-border">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
            Apple
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-muted-foreground text-xs">or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-0"
          />
          <Input 
            placeholder="Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-0" 
          />
          <Input 
            placeholder="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-0" 
          />

          <div className="pt-3">
            <p className="text-sm text-muted-foreground mb-3">Set your goal</p>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${selectedGoal === g
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Button disabled={isLoading} type="submit" className="w-full h-13 rounded-xl text-lg font-heading tracking-wider mt-4">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account? <span className="text-primary cursor-pointer">Log in</span>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
