import Link from 'next/link';
import { Truck } from 'lucide-react';
import { signInAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Link href="/" className="mb-2 flex items-center gap-2 font-bold text-lg">
            <Truck className="h-6 w-6 text-primary" aria-hidden />
            BackHaul
          </Link>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Access your truck owner, shipper, or admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">Log in</Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo accounts (after seeding): owner1@demo.backhaul.dev / shipper1@demo.backhaul.dev,
            password <code>Demo@12345</code>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
