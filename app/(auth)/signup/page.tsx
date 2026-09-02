import Link from 'next/link';
import { Truck } from 'lucide-react';
import { signUpAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const defaultRole = searchParams.role === 'truck_owner' ? 'truck_owner' : 'shipper';

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Link href="/" className="mb-2 flex items-center gap-2 font-bold text-lg">
            <Truck className="h-6 w-6 text-primary" aria-hidden />
            BackHaul
          </Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Turn empty miles into earning miles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role">I am a</Label>
              <Select id="role" name="role" defaultValue={defaultRole} required>
                <option value="truck_owner">Truck / Fleet Owner</option>
                <option value="shipper">Shipper</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" placeholder="+91XXXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
            </div>
            <Button type="submit" className="w-full">Create account</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
