import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { 
  Loader2, DollarSign, Calendar, Briefcase, FileText, Clock, 
  CheckCircle, XCircle, ExternalLink, LogOut, TrendingUp, 
  Star, MessageSquare, BarChart3, Award, ArrowRight, Bell
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// Tier configuration
const TIER_CONFIG = {
  tier1: { name: "Tier 1", income: 500, color: "text-green-600", bgColor: "bg-green-100", range: "10K-50K" },
  tier2: { name: "Tier 2", income: 1000, color: "text-primary", bgColor: "bg-primary/10", range: "50K-200K" },
  tier3: { name: "Tier 3", income: 2000, color: "text-yellow-600", bgColor: "bg-yellow-100", range: "200K+" },
};

export default function CreatorDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const profileQuery = trpc.creator.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const statsQuery = trpc.creator.getStats.useQuery(undefined, { enabled: isAuthenticated });
  const paymentsQuery = trpc.creator.getPayments.useQuery(undefined, { enabled: isAuthenticated });
  const applicationsQuery = trpc.creator.getApplications.useQuery(undefined, { enabled: isAuthenticated });
  const contractsQuery = trpc.creator.getContracts.useQuery(undefined, { enabled: isAuthenticated });
  const activeCampaignsQuery = trpc.campaign.getAll.useQuery();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user && user.role !== "creator" && user.role !== "admin") {
      setLocation("/select-role");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  // Calculate next payment date (1st of next month)
  const nextPaymentDate = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, []);

  // Calculate tier progress
  const tierProgress = useMemo(() => {
    if (!profileQuery.data) return { current: 0, next: 50000, percentage: 0, nextTier: "Tier 2" };
    const followers = profileQuery.data.followers || 0;
    if (followers >= 200000) return { current: followers, next: 200000, percentage: 100, nextTier: "Max" };
    if (followers >= 50000) return { current: followers, next: 200000, percentage: ((followers - 50000) / 150000) * 100, nextTier: "Tier 3" };
    return { current: followers, next: 50000, percentage: (followers / 50000) * 100, nextTier: "Tier 2" };
  }, [profileQuery.data]);

  if (loading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const stats = statsQuery.data;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-6">
              Set up your creator profile to start earning with CreatorVault
            </p>
            <Button onClick={() => setLocation("/onboarding/creator")} className="w-full">
              Complete Onboarding <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[profile.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.tier1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CV</span>
              </div>
              <span className="font-semibold hidden sm:inline">CreatorVault</span>
            </Link>
            <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border-0`}>
              <Award className="w-3 h-3 mr-1" />
              {tierConfig.name}
            </Badge>
            {profile.isVerified && (
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                <CheckCircle className="w-3 h-3 mr-1" /> Verified
              </Badge>
            )}
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="hidden sm:flex">Browse Campaigns</Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4" /></Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="sm"><BarChart3 className="w-4 h-4" /></Button>
            </Link>
            <Link href="/reviews">
              <Button variant="ghost" size="sm"><Star className="w-4 h-4" /></Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold mb-1">Welcome back, {profile.name}!</h1>
            <p className="text-muted-foreground">
              {profile.niche} Creator • {(profile.followers || 0).toLocaleString()} followers
              {profile.averageRating && parseFloat(profile.averageRating) > 0 && (
                <span className="ml-2">
                  • <Star className="w-4 h-4 inline text-yellow-500" /> {parseFloat(profile.averageRating).toFixed(1)}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/marketplace">
              <Button>
                Find Campaigns <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Guaranteed Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${tierConfig.income.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full ${tierConfig.bgColor} flex items-center justify-center`}>
                  <DollarSign className={`w-5 h-5 ${tierConfig.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sponsorship Earnings</p>
                  <p className="text-2xl font-bold">${(stats?.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="text-lg font-bold">{nextPaymentDate}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingPayments ? `$${stats.pendingPayments.toLocaleString()} pending` : 'Guaranteed only'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Campaigns</p>
                  <p className="text-2xl font-bold">{stats?.completedCampaigns || profile.completedCampaigns || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        {tierProgress.nextTier !== "Max" && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">Progress to {tierProgress.nextTier}</p>
                  <p className="text-sm text-muted-foreground">
                    {tierProgress.current.toLocaleString()} / {tierProgress.next.toLocaleString()} followers
                  </p>
                </div>
                <Badge variant="outline">{tierProgress.percentage.toFixed(0)}%</Badge>
              </div>
              <Progress value={tierProgress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {(tierProgress.next - tierProgress.current).toLocaleString()} more followers to unlock {tierProgress.nextTier}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Available Campaigns</CardTitle>
                <CardDescription>Browse and apply to brand sponsorship opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {activeCampaignsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : !activeCampaignsQuery.data || activeCampaignsQuery.data.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No campaigns available</h3>
                    <p className="text-sm text-muted-foreground mb-4">Check back soon for new opportunities!</p>
                    <Button variant="outline" onClick={() => activeCampaignsQuery.refetch()}>
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeCampaignsQuery.data.filter((c: any) => c.status === "active").slice(0, 5).map((campaign: any) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{campaign.title}</h3>
                            <Badge variant="secondary" className="shrink-0">{campaign.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{campaign.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-primary font-semibold">
                              ${parseFloat(campaign.budget).toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              {campaign.creatorsNeeded} creators
                            </span>
                            {campaign.deadline && (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(campaign.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/campaign/${campaign.id}`}>
                          <Button size="sm" className="ml-4 shrink-0">
                            View <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link href="/marketplace">
                        <Button variant="outline">View All Campaigns</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your campaign applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : !applicationsQuery.data || applicationsQuery.data.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No applications yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start applying to campaigns to see them here</p>
                    <Link href="/marketplace">
                      <Button>Browse Campaigns</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applicationsQuery.data.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Campaign #{app.campaignId}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === "pending" && (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                          {app.status === "approved" && (
                            <Badge className="gap-1 bg-green-600">
                              <CheckCircle className="w-3 h-3" /> Approved
                            </Badge>
                          )}
                          {app.status === "rejected" && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="w-3 h-3" /> Rejected
                            </Badge>
                          )}
                          <Link href={`/campaign/${app.campaignId}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>My Contracts</CardTitle>
                <CardDescription>View and sign your sponsorship contracts</CardDescription>
              </CardHeader>
              <CardContent>
                {contractsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : !contractsQuery.data || contractsQuery.data.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No contracts yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Contracts will appear here when you're approved for campaigns
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contractsQuery.data.map((contract: any) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Contract #{contract.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Campaign #{contract.campaignId} • Created {new Date(contract.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {contract.status === "pending" && (
                            <Badge variant="secondary">Pending Signature</Badge>
                          )}
                          {contract.status === "signed" && (
                            <Badge className="bg-green-600">Signed</Badge>
                          )}
                          <Link href={`/contract/${contract.id}`}>
                            <Button size="sm">View Contract</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track your earnings and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : !paymentsQuery.data || paymentsQuery.data.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No payments yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentsQuery.data.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {payment.type === "guaranteed" ? "Guaranteed Income" : "Sponsorship Payment"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +${parseFloat(payment.netAmount).toLocaleString()}
                          </p>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
