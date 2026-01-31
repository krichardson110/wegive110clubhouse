import clubhouseLogo from "@/assets/clubhouse-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={clubhouseLogo} 
              alt="Clubhouse" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* Tagline */}
          <p className="text-sm text-muted-foreground text-center">
            Drive 5 Companion • Learn • Grow • Develop
          </p>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Clubhouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
