import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Loader2, ArrowLeft, TrendingUp, DollarSign, Users, Eye, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function Analytics() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const statsQuery = trpc.creator.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "creator" });
  const profileQuery = trpc.creator.getProfile.useQuery(undefined, { enabled: isAuthenticated && user?.role === "creator" });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user && user.role !== "creator" && user.role !== "admin") {
      setLocation("/select-role");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading || statsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = statsQuery.data;
  const profile = profileQuery.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/creator">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Analytics</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${stats?.totalEarnings?.toLocaleString() || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">${stats?.pendingPayments?.toLocaleString() || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Campaigns</p>
                  <p className="text-2xl font-bold">{stats?.completedCampaigns || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Applications</p>
                  <p className="text-2xl font-bold">{stats?.activeApplications || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your creator profile statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Tier</span>
                  <span className="font-semibold capitalize">{profile?.tier || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Guaranteed Income</span>
                  <span className="font-semibold text-green-600">
                    ${profile?.guaranteedIncome ? parseFloat(profile.guaranteedIncome).toLocaleString() : 0}/month
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Total Followers</span>
                  <span className="font-semibold">{profile?.followers?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-semibold">
                    {profile?.averageRating ? `${profile.averageRating} ⭐` : "No reviews yet"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Verification Status</span>
                  <span className={`font-semibold ${profile?.isVerified ? "text-green-600" : "text-yellow-600"}`}>
                    {profile?.isVerified ? "Verified ✓" : "Pending"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>How your earnings are distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Sponsorship Earnings</span>
                    <span className="text-lg font-bold text-primary">${stats?.totalEarnings?.toLocaleString() || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Earnings from completed sponsorship campaigns (80% of campaign budget after platform fee)
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Guaranteed Income</span>
                    <span className="text-lg font-bold text-green-600">
                      ${profile?.guaranteedIncome ? parseFloat(profile.guaranteedIncome).toLocaleString() : 0}/month
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly guaranteed payment based on your tier level
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Platform Fee:</strong> 20% is deducted from each sponsorship payment to cover platform operations and support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
