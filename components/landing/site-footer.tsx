import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="mb-2 font-bold text-lg">BackHaul</div>
          <p className="text-sm text-muted-foreground">
            Turn empty miles into earning miles. An open-source return-load logistics
            marketplace for Indian road freight.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Product</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
            <li><a href="#smart-matching" className="hover:text-foreground">Smart matching</a></li>
            <li><a href="#trust" className="hover:text-foreground">Trust &amp; verification</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Roles</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/signup?role=truck_owner" className="hover:text-foreground">For truck owners</Link></li>
            <li><Link href="/signup?role=shipper" className="hover:text-foreground">For shippers</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Open Source</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="https://github.com/Vansh4600/Truck-return-loader"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                GitHub Repository
              </a>
            </li>
            <li>MIT Licensed</li>
          </ul>
        </div>
      </div>
      <div className="container border-t border-border py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} BackHaul — an open-source project. All statistics on this
        page are demo/sample values unless noted otherwise.
      </div>
    </footer>
  );
}
