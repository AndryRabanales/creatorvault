import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Loader2, DollarSign, Users, Briefcase, FileText, Plus, LogOut, Eye, CheckCircle, Clock } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function BrandDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const profileQuery = trpc.brand.getProfile.useQuery();
  const statsQuery = trpc.brand.getStats.useQuery(undefined, { enabled: isAuthenticated });
  const campaignsQuery = trpc.brand.getCampaigns.useQuery(undefined, { enabled: isAuthenticated });
  const contractsQuery = trpc.brand.getContracts.useQuery(undefined, { enabled: isAuthenticated });

  // Redirect to onboarding if profile doesn't exist
  useEffect(() => {
    if (!profileQuery.isLoading && !profileQuery.data) {
      setLocation('/onboarding/brand');
    }
  }, [profileQuery.data, profileQuery.isLoading, setLocation]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user && user.role !== "brand" && user.role !== "admin") {
      setLocation("/select-role");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const profile = profileQuery.data;
  const stats = statsQuery.data;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => setLocation("/onboarding/brand")}>Complete Onboarding</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CV</span>
              </div>
              <span className="font-semibold">CreatorVault</span>
            </Link>
            <Badge variant="outline">Brand</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/campaign/create">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm">Messages</Button>
            </Link>
            <Link href="/reviews">
              <Button variant="ghost" size="sm">Reviews</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome, {profile.companyName}</h1>
          <p className="text-muted-foreground">{profile.industry}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{(stats?.activeCampaigns || 0) + (stats?.completedCampaigns || 0)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{stats?.activeCampaigns || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${stats?.totalSpent?.toLocaleString() || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Contracts</p>
                  <p className="text-2xl font-bold">{stats?.totalCreatorsHired || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Campaigns</CardTitle>
                  <CardDescription>Manage your sponsorship campaigns</CardDescription>
                </div>
                <Link href="/campaign/create">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Campaign
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {campaignsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : campaignsQuery.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No campaigns yet</p>
                    <Link href="/campaign/create">
                      <Button>Create Your First Campaign</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaignsQuery.data?.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{campaign.title}</h3>
                            {getStatusBadge(campaign.status || "draft")}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-primary font-medium">${parseFloat(campaign.budget).toLocaleString()} budget</span>
                            <span className="text-muted-foreground">{campaign.creatorsNeeded} creators</span>
                            {campaign.deadline && (
                              <span className="text-muted-foreground">
                                Due {new Date(campaign.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/campaign/${campaign.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Manage
                          </Button>
                        </Link>
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
                <CardTitle>Contracts</CardTitle>
                <CardDescription>View contracts with creators</CardDescription>
              </CardHeader>
              <CardContent>
                {contractsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : contractsQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No contracts yet. Approve creator applications to generate contracts.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contractsQuery.data?.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Contract #{contract.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Campaign #{contract.campaignId} • Creator #{contract.creatorId}
                          </p>
                          <p className="text-sm text-primary font-medium mt-1">
                            ${parseFloat(contract.paymentAmount).toLocaleString()} total
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {contract.creatorSigned && contract.brandSigned ? (
                            <Badge className="bg-green-600 gap-1">
                              <CheckCircle className="w-3 h-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" /> Pending Signatures
                            </Badge>
                          )}
                          <Link href={`/contract/${contract.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
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
