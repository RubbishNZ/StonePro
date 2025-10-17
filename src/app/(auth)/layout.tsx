type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl sm:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}