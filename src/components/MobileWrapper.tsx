import { ReactNode } from 'react';

const MobileWrapper = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen justify-center bg-background">
    <div className="relative w-full max-w-[430px] min-h-screen">
      {children}
    </div>
  </div>
);

export default MobileWrapper;
