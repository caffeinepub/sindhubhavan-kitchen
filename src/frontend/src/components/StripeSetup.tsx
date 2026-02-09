import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useSetStripeConfiguration, useIsCallerAdmin } from '../hooks/useQueries';
import { toast } from 'sonner';
import { StripeConfiguration } from '../backend';

export default function StripeSetup() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const setStripeConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const countryList = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countryList.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    try {
      const config: StripeConfiguration = {
        secretKey: secretKey.trim(),
        allowedCountries: countryList,
      };

      await setStripeConfig.mutateAsync(config);
      toast.success('Stripe configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save Stripe configuration:', error);
      toast.error('Failed to save Stripe configuration');
    }
  };

  if (adminLoading) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardContent className="py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-center">Payment System Not Configured</CardTitle>
            <CardDescription className="text-center">
              The payment system needs to be configured by an administrator before orders can be placed.
              Please contact the restaurant owner.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-center text-2xl">Configure Stripe Payment</CardTitle>
          <CardDescription className="text-center">
            Set up your Stripe account to accept payments from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need a Stripe account to accept payments. Visit{' '}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                stripe.com
              </a>{' '}
              to create an account and get your secret key.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key *</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_test_..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Your Stripe secret key (starts with sk_test_ or sk_live_)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Allowed Countries *</Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="US,CA,GB"
                required
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of 2-letter country codes (e.g., US, CA, GB)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={setStripeConfig.isPending}
            >
              {setStripeConfig.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Configuration...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
