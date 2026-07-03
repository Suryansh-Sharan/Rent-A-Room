import Link from 'next/link';
import { Sparkles, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/20 mt-auto">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient">
                <Sparkles className="h-4 w-4 text-obsidian" />
              </div>
              <span className="font-bold text-lg">
                <span className="gold-text">AI</span>
                <span> Rent Finder</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered compatibility matching connects the right tenants with the right rooms.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                <button key={i} className="h-8 w-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              {['How It Works', 'AI Matching', 'Pricing', 'Changelog'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 AI Rent Finder. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="gold-text font-semibold">AI Compatibility Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
