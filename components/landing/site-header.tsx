import Link from 'next/link';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Truck className="h-6 w-6 text-primary" aria-hidden />
          <span>BackHaul</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#smart-matching" className="hover:text-foreground">Smart Matching</a>
          <a href="#trust" className="hover:text-foreground">Trust</a>
          <a href="#open-source" className="hover:text-foreground">Open Source</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
