const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-impact-amber flex items-center justify-center shadow-lg">
              <span className="text-xl font-display text-white">IB</span>
            </div>
            <div>
              <span className="font-display text-lg tracking-wide text-foreground">IMPACT</span>
              <span className="font-display text-lg tracking-wide text-primary ml-1">BASEBALL</span>
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-sm text-muted-foreground text-center">
            Companion to Drive 5 • Mind • Body • Spirit
          </p>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Impact Baseball. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
