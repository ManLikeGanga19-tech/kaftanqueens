import { toast } from 'sonner';

export const showWelcomeToast = (name?: string | null) => {
  const firstName = name?.split(' ')[0] || 'Queen';
  const initial = firstName.charAt(0).toUpperCase();

  toast.custom(() => (
    <div className="flex items-center gap-4 bg-brand-primary text-brand-secondary w-full px-5 py-4 shadow-2xl">
      <div className="w-11 h-11 bg-brand-accent flex items-center justify-center text-brand-primary font-bold font-serif text-lg shrink-0">
        {initial}
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-accent leading-none">
          Welcome back
        </p>
        <p className="font-serif text-base leading-tight text-brand-secondary truncate">
          {firstName}
        </p>
        <p className="text-[9px] uppercase tracking-widest font-medium text-brand-secondary/40 leading-tight">
          Your royal collection awaits
        </p>
      </div>
    </div>
  ), { duration: 4500 });
};
