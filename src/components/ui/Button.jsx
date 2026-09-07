export default function Button({ children, variant = 'primary', ...rest }) {
  const base = 'inline-flex items-center justify-center font-body font-bold text-sm px-6 py-3 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';
  const variants = {
    primary: 'bg-cherry text-cream hover:bg-red-600',
    cream: 'bg-cream text-ink hover:bg-banana',
  };
  return <button className={`${base} ${variants[variant]}`} {...rest}>{children}</button>;
}