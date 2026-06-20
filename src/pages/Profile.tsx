import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Leaf, Globe, Watch, Shield, LogOut, 
  ChevronRight, User, X, Check, Loader2, Trophy 
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const settings = [
  { icon: Bell, label: 'Notifications', color: 'text-orange-400' },
  { icon: Leaf, label: 'Diet Preferences', color: 'text-emerald-400' },
  { icon: Globe, label: 'Language', color: 'text-cyan-400' },
  { icon: Watch, label: 'Connect Wearable', color: 'text-indigo-400' },
  { icon: Shield, label: 'Privacy & Data', color: 'text-pink-400' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', toast: 'Language updated to English!' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', toast: 'भाषा हिन्दी में बदल दी गई है!' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', toast: '¡Idioma cambiado a Español!' },
  { code: 'fr', name: 'French', nativeName: 'Français', toast: 'Langue changée en Français !' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', toast: 'Sprache auf Deutsch geändert!' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', toast: '言語が日本語に変更されました！' }
];

const DIETS = ['Balanced', 'Vegetarian', 'Vegan', 'Keto', 'High Protein', 'Carnivore'];
const ALLERGIES = ['Gluten-Free', 'Nut-Free', 'Dairy-Free', 'Seafood-Free', 'Soy-Free'];

const Profile = () => {
  const { user, setIsOnboarded } = useApp();
  const navigate = useNavigate();
  const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);

  // Active drawer/modal
  const [activeSetting, setActiveSetting] = useState<string | null>(null);

  // States with localStorage persistence
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('fg_settings_notifications');
    return saved ? JSON.parse(saved) : { workoutReminder: true, soundEffects: true, voiceCoach: true, pushNotification: false };
  });

  const [diet, setDiet] = useState(() => {
    const saved = localStorage.getItem('fg_settings_diet');
    return saved ? JSON.parse(saved) : { dietStyle: 'Balanced', allergies: [] };
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('fg_settings_lang') || 'English';
  });

  const [wearables, setWearables] = useState(() => {
    const saved = localStorage.getItem('fg_settings_wearables');
    return saved ? JSON.parse(saved) : { appleWatch: false, fitbit: false, garmin: false, googleFit: false };
  });

  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('fg_settings_privacy');
    return saved ? JSON.parse(saved) : { publicProfile: false, cloudSync: true };
  });

  // Connecting animation state
  const [connectingWearable, setConnectingWearable] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem('fg_settings_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fg_settings_diet', JSON.stringify(diet));
  }, [diet]);

  useEffect(() => {
    localStorage.setItem('fg_settings_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('fg_settings_wearables', JSON.stringify(wearables));
  }, [wearables]);

  useEffect(() => {
    localStorage.setItem('fg_settings_privacy', JSON.stringify(privacy));
  }, [privacy]);

  const handleToggleWearable = (key: string) => {
    const wearableKey = key as keyof typeof wearables;
    const readableName = getWearableName(key);

    if (wearables[wearableKey]) {
      setWearables(prev => ({ ...prev, [wearableKey]: false }));
      toast.success(`Disconnected from ${readableName}`);
    } else {
      setConnectingWearable(key);
      setTimeout(() => {
        setWearables(prev => ({ ...prev, [wearableKey]: true }));
        setConnectingWearable(null);
        toast.success(`Connected to ${readableName} successfully!`);
      }, 1200);
    }
  };

  const getWearableName = (key: string) => {
    switch (key) {
      case 'appleWatch': return 'Apple Watch';
      case 'fitbit': return 'Fitbit';
      case 'garmin': return 'Garmin Connect';
      case 'googleFit': return 'Google Fit';
      default: return key;
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        user,
        notifications,
        diet,
        lang,
        wearables,
        privacy,
        exportedAt: new Date().toISOString()
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fitguru_profile_${user.name.toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExporting(false);
      toast.success("Health history exported successfully!");
    }, 1200);
  };

  const handleClearCache = () => {
    const confirm = window.confirm("Are you sure you want to clear your local database and preferences? This action is irreversible.");
    if (confirm) {
      localStorage.clear();
      toast.success("Preferences reset. Logging out...");
      setTimeout(() => {
        setIsOnboarded(false);
        navigate('/');
      }, 1000);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button 
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-primary' : 'bg-white/10'
      }`}
    >
      <div 
        className={`w-5 h-5 rounded-full bg-black shadow-md transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="pb-20 min-h-screen bg-[#0D0D0D] text-white">
      <div className="p-5 pt-8">
        {/* Avatar & Name */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <User size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl text-foreground">{user.name}</h1>
            <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-medium tracking-wide uppercase">🎯 {user.goal}</span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            { label: 'Weight', value: `${user.weight}kg` },
            { label: 'Height', value: `${user.height}cm` },
            { label: 'BMI', value: bmi },
            { label: 'Age', value: `${user.age}` },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 text-center border border-white/5">
              <p className="font-heading text-lg text-primary">{s.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress Photos */}
        <div className="mt-6">
          <h2 className="font-heading text-lg text-foreground mb-3 uppercase tracking-wide text-white/80">Progress Photos</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Before', 'After'].map((l) => (
              <div key={l} className="glass rounded-2xl h-40 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <User size={32} className="text-white/20 mb-1 group-hover:text-primary transition-colors" />
                <span className="text-xs text-white/40 group-hover:text-white transition-colors">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mt-6 space-y-2">
          {settings.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveSetting(s.label)}
              className="w-full glass rounded-xl px-4 py-4 flex items-center justify-between border border-white/5 hover:border-primary/20 transition-all hover:scale-[1.01] active:scale-95 duration-200"
            >
              <div className="flex items-center gap-3">
                <s.icon size={18} className={s.color} />
                <span className="text-sm font-medium text-white/80">{s.label}</span>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </motion.button>
          ))}

          <button
            onClick={() => { 
              localStorage.removeItem('fitguru_token');
              setIsOnboarded(false); 
              navigate('/'); 
            }}
            className="w-full glass rounded-xl px-4 py-4 flex items-center gap-3 mt-4 border border-red-500/10 hover:border-red-500/30 transition-all hover:scale-[1.01] active:scale-95 duration-200"
          >
            <LogOut size={18} className="text-red-500" />
            <span className="text-sm font-semibold text-red-500">Log Out</span>
          </button>
        </div>
      </div>

      {/* Dynamic Settings Drawers */}
      <AnimatePresence>
        {activeSetting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end justify-center"
            onClick={() => setActiveSetting(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[430px] glass rounded-t-[40px] p-6 pb-28 max-h-[85vh] overflow-y-auto border-t border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl font-black tracking-wide uppercase text-primary">{activeSetting}</h2>
                <button
                  onClick={() => setActiveSetting(null)}
                  className="bg-white/5 p-2 rounded-full hover:bg-white/15 transition-all text-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 1. NOTIFICATIONS */}
              {activeSetting === 'Notifications' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="font-medium text-sm">Workout Reminders</p>
                      <p className="text-xs text-white/40">Alert when scheduled exercises are due.</p>
                    </div>
                    <Toggle 
                      checked={notifications.workoutReminder} 
                      onChange={() => setNotifications({ ...notifications, workoutReminder: !notifications.workoutReminder })} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="font-medium text-sm">Rep Sound Effects</p>
                      <p className="text-xs text-white/40">Acoustic bell indicator when a rep finishes.</p>
                    </div>
                    <Toggle 
                      checked={notifications.soundEffects} 
                      onChange={() => setNotifications({ ...notifications, soundEffects: !notifications.soundEffects })} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="font-medium text-sm">Real-time Voice Coach</p>
                      <p className="text-xs text-white/40">Speech feedback from our posture agent.</p>
                    </div>
                    <Toggle 
                      checked={notifications.voiceCoach} 
                      onChange={() => setNotifications({ ...notifications, voiceCoach: !notifications.voiceCoach })} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">Push Notifications</p>
                      <p className="text-xs text-white/40">Receive weekly summaries & updates.</p>
                    </div>
                    <Toggle 
                      checked={notifications.pushNotification} 
                      onChange={() => setNotifications({ ...notifications, pushNotification: !notifications.pushNotification })} 
                    />
                  </div>
                </div>
              )}

              {/* 2. DIET PREFERENCES */}
              {activeSetting === 'Diet Preferences' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-2 block">Dietary Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DIETS.map(d => (
                        <button
                          key={d}
                          onClick={() => setDiet({ ...diet, dietStyle: d })}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            diet.dietStyle === d
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-white/5 border-transparent text-white/60 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-2 block">Allergies & Exclusions</label>
                    <div className="space-y-2">
                      {ALLERGIES.map(a => {
                        const isChecked = diet.allergies.includes(a);
                        return (
                          <button
                            key={a}
                            onClick={() => {
                              const nextAllergies = isChecked
                                ? diet.allergies.filter((x: string) => x !== a)
                                : [...diet.allergies, a];
                              setDiet({ ...diet, allergies: nextAllergies });
                            }}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                          >
                            <span className="text-sm font-medium text-white/80">{a}</span>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                              isChecked ? 'bg-primary border-primary text-black' : 'border-white/20'
                            }`}>
                              {isChecked && <Check size={14} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LANGUAGE */}
              {activeSetting === 'Language' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-2 block">Choose App Language</label>
                  {LANGUAGES.map(l => {
                    const isSelected = lang === l.name;
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.name);
                          toast.success(l.toast);
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                          isSelected
                            ? 'bg-primary/5 border-primary/30 text-white font-bold'
                            : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-semibold">{l.name}</span>
                          <span className="text-[10px] text-white/40">{l.nativeName}</span>
                        </div>
                        {isSelected && <Check size={18} className="text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. CONNECT WEARABLE */}
              {activeSetting === 'Connect Wearable' && (
                <div className="space-y-4">
                  {[
                    { id: 'appleWatch', desc: 'Sync workout heart rate and active calories.' },
                    { id: 'fitbit', desc: 'Sync steps and daily active zone minutes.' },
                    { id: 'garmin', desc: 'Sync runs, cycles, and recovery indexes.' },
                    { id: 'googleFit', desc: 'Sync global activity metrics from Android.' }
                  ].map(w => {
                    const isConnected = wearables[w.id as keyof typeof wearables];
                    const isConnecting = connectingWearable === w.id;
                    const name = getWearableName(w.id);

                    return (
                      <div key={w.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{name}</p>
                          <p className="text-xs text-white/40 mt-0.5 leading-snug">{w.desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggleWearable(w.id)}
                          disabled={!!connectingWearable}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-w-[90px] flex items-center justify-center ${
                            isConnected 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                              : 'bg-primary text-black hover:scale-[1.02] active:scale-95 font-black'
                          }`}
                        >
                          {isConnecting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isConnected ? (
                            'Disconnect'
                          ) : (
                            'Connect'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. PRIVACY & DATA */}
              {activeSetting === 'Privacy & Data' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="font-medium text-sm">Public Workout Profile</p>
                      <p className="text-xs text-white/40">Allow other users to search your streak record.</p>
                    </div>
                    <Toggle 
                      checked={privacy.publicProfile} 
                      onChange={() => setPrivacy({ ...privacy, publicProfile: !privacy.publicProfile })} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="font-medium text-sm">Cloud Data Syncing</p>
                      <p className="text-xs text-white/40">Securely back up health data to server storage.</p>
                    </div>
                    <Toggle 
                      checked={privacy.cloudSync} 
                      onChange={() => setPrivacy({ ...privacy, cloudSync: !privacy.cloudSync })} 
                    />
                  </div>

                  <div className="pt-3 space-y-3">
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Generating Archive...</span>
                        </>
                      ) : (
                        <span>Export Health History (JSON)</span>
                      )}
                    </button>

                    <button
                      onClick={handleClearCache}
                      className="w-full h-12 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-bold text-red-400"
                    >
                      Reset App Cache & Database
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Profile;

