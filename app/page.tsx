import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Gauge,
  ShieldCheck,
  Clock,
  TrendingDown,
  Truck,
  PackageSearch,
  BadgeCheck,
  Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/landing/site-header';
import { SiteFooter } from '@/components/landing/site-footer';
import { MatchScoreBadge, MatchScoreBreakdownList, MatchReasonsList } from '@/components/matching/match-score';
import { DEMO_STATS } from '@/lib/demo/data';

const DEMO_MATCH = {
  scores: {
    routeScore: 95,
    capacityScore: 100,
    timeScore: 90,
    vehicleScore: 100,
    detourScore: 97,
    priceScore: 85,
    reliabilityScore: 92,
    overallScore: 94,
  },
  reasons: [
    'Same return corridor',
    'Truck has sufficient capacity',
    'Pickup is 3.2 km away',
    'Pickup time fits availability',
    'Only 5 km estimated detour',
  ],
};

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
          <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24">
            <div className="flex flex-col justify-center">
              <Badge variant="outline" className="mb-4 w-fit">Open source · MIT licensed</Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Don&apos;t Send Your Truck Back Empty.
              </h1>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                Find verified return loads that match your truck&apos;s route, capacity and
                schedule — or find available trucks for your shipment. Route-aware matching,
                not just pickup-equals-destination.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup?role=truck_owner">
                  <Button size="lg">
                    Find a Return Load <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup?role=shipper">
                  <Button size="lg" variant="outline">Post a Load</Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Demo corridors: Delhi ↔ Kanpur ↔ Lucknow ↔ Agra
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-sm">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">Kanpur → Delhi</CardTitle>
                    <p className="text-sm text-muted-foreground">8.5 Ton · ₹18,500</p>
                  </div>
                  <MatchScoreBadge score={DEMO_MATCH.scores.overallScore} size="lg" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <MatchReasonsList reasons={DEMO_MATCH.reasons} />
                  <div className="rounded-md bg-muted/60 p-3">
                    <MatchScoreBreakdownList scores={DEMO_MATCH.scores} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container py-16">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            Three simple steps to turn a scheduled empty return trip into a paid one.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Truck, title: '1. Set your route', desc: 'Truck owners add their truck, route, availability and minimum price.' },
              { icon: Route, title: '2. Get matched', desc: 'Our route-aware engine scores every open load against your route, capacity and schedule.' },
              { icon: BadgeCheck, title: '3. Accept & haul', desc: 'Accept the load, confirm the booking, and complete the trip through a clear state pipeline.' },
            ].map((s) => (
              <Card key={s.title}>
                <CardHeader>
                  <s.icon className="mb-2 h-8 w-8 text-primary" aria-hidden />
                  <CardTitle>{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{s.desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* For truck owners / shippers */}
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Truck className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>For truck owners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Register your trucks, set your route and schedule, and get ranked return-load
                  recommendations with a clear match score and explanation.</p>
                <ul className="mt-3 list-inside list-disc space-y-1">
                  <li>Mobile-first dashboard built for life on the road</li>
                  <li>Accept or reject loads with one tap</li>
                  <li>Track earnings and empty trips avoided</li>
                </ul>
                <Link href="/signup?role=truck_owner" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Get started as a truck owner</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <PackageSearch className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>For shippers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Post a load with pickup, destination, weight and schedule — get matched with
                  verified trucks already heading your way.</p>
                <ul className="mt-3 list-inside list-disc space-y-1">
                  <li>Ranked truck recommendations, not a random list</li>
                  <li>Track booking status end-to-end</li>
                  <li>Rate truck owners after delivery</li>
                </ul>
                <Link href="/signup?role=shipper" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Get started as a shipper</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Smart matching */}
        <section id="smart-matching" className="container py-16">
          <h2 className="text-center text-3xl font-bold">Smart, explainable matching</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            A deterministic, weighted scoring engine — not a black box. Every recommendation
            comes with a clear reason.
          </p>
          <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-4">
              {[
                { icon: Route, label: 'Route overlap', weight: '30%' },
                { icon: Gauge, label: 'Capacity fit', weight: '20%' },
                { icon: Clock, label: 'Schedule fit', weight: '15%' },
                { icon: Truck, label: 'Vehicle type match', weight: '10%' },
                { icon: MapPin, label: 'Detour distance', weight: '10%' },
                { icon: TrendingDown, label: 'Price alignment', weight: '10%' },
                { icon: ShieldCheck, label: 'Historical reliability', weight: '5%' },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="flex items-center gap-3">
                    <f.icon className="h-5 w-5 text-primary" aria-hidden />
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{f.weight}</span>
                </div>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>94% Match</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchReasonsList reasons={DEMO_MATCH.reasons} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust & verification */}
        <section id="trust" className="border-y border-border bg-muted/30 py-16">
          <div className="container">
            <h2 className="text-center text-3xl font-bold">Trust &amp; verification</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { icon: BadgeCheck, title: 'Verified trucks', desc: 'Vehicle documents (RC, insurance, permit, fitness) reviewed by the admin team.' },
                { icon: ShieldCheck, title: 'Rated marketplace', desc: 'Shippers and truck owners rate each other after every completed trip.' },
                { icon: Route, title: 'Protected messaging', desc: 'Contact details stay private until a booking reaches the right stage.' },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <f.icon className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden />
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Route visualization */}
        <section className="container py-16">
          <h2 className="text-center text-3xl font-bold">Route visibility, always</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            Every match shows the full corridor — pickup, destination, and how it overlaps with
            your planned route.
          </p>
          <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> Delhi</span>
              <span className="flex items-center gap-1">Noida</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-success" /> Kanpur</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-primary to-success" />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Illustrative corridor visualization — demo data
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold">Marketplace at a glance</h2>
              <Badge variant="outline" className="mt-2">Demo values — not live production statistics</Badge>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { label: 'Trucks on platform', value: DEMO_STATS.totalTrucks },
                { label: 'Loads posted', value: DEMO_STATS.totalLoads },
                { label: 'Successful matches', value: DEMO_STATS.successfulMatches },
                { label: 'Empty trips avoided', value: DEMO_STATS.emptyTripsAvoided },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container py-16">
          <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
          <div className="mx-auto mt-10 max-w-2xl space-y-4">
            {[
              { q: 'Is payment processing real?', a: 'No. The MVP ships a clearly-labelled Demo/Mock payment provider. No real money moves through the platform yet.' },
              { q: 'Which cities are supported?', a: 'The MVP focuses on Indian demo corridors (Delhi, Kanpur, Lucknow, Agra, Jaipur, Mumbai, Pune) but the architecture is geography-agnostic.' },
              { q: 'How does matching work?', a: 'A deterministic, weighted rule-based engine scores route overlap, capacity, schedule, vehicle type, detour, price and reliability — fully explainable, no black-box AI.' },
              { q: 'Is this open source?', a: 'Yes, BackHaul is MIT licensed. Contributions are welcome — see CONTRIBUTING.md in the repository.' },
            ].map((f) => (
              <details key={f.q} className="rounded-md border border-border p-4">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Open source */}
        <section id="open-source" className="border-t border-border bg-primary/5 py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">Built in the open</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              BackHaul is a fully open-source project (MIT licensed) — clone it, self-host it, or
              contribute a feature.
            </p>
            <a
              href="https://github.com/Vansh4600/Truck-return-loader"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block"
            >
              <Button size="lg" variant="outline">View on GitHub</Button>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
