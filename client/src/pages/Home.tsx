import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, Shield, DollarSign, Users, Zap, CheckCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "creator") {
        setLocation("/dashboard/creator");
      } else if (user.role === "brand") {
        setLocation("/dashboard/brand");
      } else if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/select-role");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const features = [
    {
      icon: DollarSign,
      title: "Guaranteed Income",
      description: "Earn $500-$2000/month guaranteed based on your audience size",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Escrow protection ensures you get paid for your work",
    },
    {
      icon: Users,
      title: "Quality Brands",
      description: "Connect with vetted brands looking for authentic creators",
    },
    {
      icon: Zap,
      title: "Simple Process",
      description: "Apply to campaigns, deliver content, get paid automatically",
    },
  ];

  const tiers = [
    { followers: "10K - 50K", income: "$500/mo", tier: "Tier 1" },
    { followers: "50K - 200K", income: "$1,000/mo", tier: "Tier 2" },
    { followers: "200K+", income: "$2,000/mo", tier: "Tier 3" },
  ];

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CV</span>
            </div>
            <span className="font-semibold text-lg">CreatorVault</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Button asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <CheckCircle className="w-4 h-4" />
              Trusted by 1,000+ creators
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Turn Your Audience Into{" "}
              <span className="text-primary">Guaranteed Income</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              CreatorVault connects content creators with brands, offering guaranteed monthly income 
              plus sponsorship opportunities. Secure payments, digital contracts, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href={getLoginUrl()} className="gap-2">
                  Start Earning <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#pricing">View Pricing Tiers</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Creators Love Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We handle the business side so you can focus on creating amazing content
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Guaranteed Monthly Income</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your tier is based on your total follower count across platforms
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, index) => (
              <div
                key={tier.tier}
                className={`rounded-xl p-6 border ${
                  index === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-sm font-medium mb-2">{tier.tier}</div>
                <div className="text-3xl font-bold mb-2">{tier.income}</div>
                <div className={`text-sm ${index === 1 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {tier.followers} followers
                </div>
                <div className={`mt-4 pt-4 border-t ${index === 1 ? "border-primary-foreground/20" : "border-border"}`}>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Guaranteed monthly payment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Access to all campaigns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Digital contracts
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Brands Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">For Brands</h2>
            <p className="text-muted-foreground mb-8">
              Access a curated network of authentic creators. Create campaigns, 
              review applications, and manage sponsorships all in one platform.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-primary">1,000+</div>
                <div className="text-sm text-muted-foreground">Verified Creators</div>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-primary">20%</div>
                <div className="text-sm text-muted-foreground">Platform Fee</div>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Escrow Protected</div>
              </div>
            </div>
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Create Brand Account</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">CV</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © 2025 CreatorVault. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
