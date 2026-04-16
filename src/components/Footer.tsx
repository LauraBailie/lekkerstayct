export default function Footer() {
  return (
    <footer className="bg-ocean-dark py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-primary-foreground/70 text-sm">
          Built in one day at SA Startup Week by Laura Bailie • Powered by{' '}
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">
            Lovable
          </a>
        </p>
      </div>
    </footer>
  );
}
