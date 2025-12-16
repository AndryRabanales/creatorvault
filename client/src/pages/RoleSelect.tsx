import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Users, Building2, ArrowRight, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function RoleSelect() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const setRoleMutation = trpc.auth.setRole.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user) {
      if (user.role === "creator") {
        setLocation("/dashboard/creator");
      } else if (user.role === "brand") {
        setLocation("/dashboard/brand");
      } else if (user.role === "admin") {
        setLocation("/admin");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleSelectRole = async (role: "creator" | "brand") => {
    try {
      await setRoleMutation.mutateAsync({ role });
      if (role === "creator") {
        setLocation("/onboarding/creator");
      } else {
        setLocation("/onboarding/brand");
      }
    } catch (error) {
      console.error("Failed to set role:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold">CV</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to CreatorVault</h1>
          <p className="text-muted-foreground">Choose how you want to use the platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={() => handleSelectRole("creator")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>I'm a Creator</CardTitle>
              <CardDescription>
                Monetize your audience with guaranteed income and brand sponsorships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Earn $500-$2000/month guaranteed</li>
                <li>• Access exclusive brand campaigns</li>
                <li>• Secure escrow payments</li>
                <li>• Digital contracts</li>
              </ul>
              <Button className="w-full gap-2" disabled={setRoleMutation.isPending}>
                {setRoleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue as Creator <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={() => handleSelectRole("brand")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>I'm a Brand</CardTitle>
              <CardDescription>
                Connect with authentic creators to promote your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Access verified creators</li>
                <li>• Create targeted campaigns</li>
                <li>• Escrow-protected payments</li>
                <li>• Track campaign performance</li>
              </ul>
              <Button className="w-full gap-2" variant="outline" disabled={setRoleMutation.isPending}>
                {setRoleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue as Brand <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
