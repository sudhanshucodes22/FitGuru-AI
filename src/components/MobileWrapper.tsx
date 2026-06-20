import { ReactNode } from 'react';

const MobileWrapper = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen justify-center bg-[#000000] relative overflow-hidden">
    {/* Full Screen Green grid backing for outer screens */}
    <div className="absolute inset-0 pointer-events-none z-0 hud-grid-green opacity-40" />

    {/* The main viewport panel container */}
    <div className="relative w-full max-w-[430px] min-h-screen bg-[#000000] border-l border-r border-[#00ff55]/15 shadow-[0_0_30px_rgba(0,255,85,0.08)] z-10 overflow-x-hidden flex flex-col">
      {/* Laser line sweeping on the viewport screen */}
      <div 
        className="absolute left-0 right-0 h-0.5 pointer-events-none opacity-30 z-50"
        style={{
          background: 'linear-gradient(90deg, transparent, #00ff55, transparent)',
          animation: 'laser-sweep 10s linear infinite',
          boxShadow: '0 0 10px #00ff55'
        }}
      />
      {/* Background grid dedicated for mobile viewport */}
      <div className="absolute inset-0 pointer-events-none z-0 hud-grid-green opacity-70" />
      
      {/* Page Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  </div>
);

export default MobileWrapper;
export type { ReactNode };
