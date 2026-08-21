export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <span role="status" aria-label="Carregando" className={`inline-block ${s} rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin dark:border-slate-700 dark:border-t-blue-400`} />
  );
}
