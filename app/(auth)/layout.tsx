export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface-base px-4 py-8 font-sans text-text-primary">
      {children}
    </div>
  );
}
