import { ReactNode } from 'react';

const MobileWrapper = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen justify-center bg-[#09090b] relative overflow-hidden">
    {/* Clean matte viewport container simulating a premium mobile screen interface */}
    <div className="relative w-full max-w-[430px] min-h-screen bg-[#09090b] border-l border-r border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 overflow-x-hidden flex flex-col">
      {/* Page Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  </div>
);

export default MobileWrapper;
export type { ReactNode };
