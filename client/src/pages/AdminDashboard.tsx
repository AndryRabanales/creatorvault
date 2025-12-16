import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Loader2, Users, Building2, Briefcase, DollarSign, LogOut, Shield } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const statsQuery = trpc.admin.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const usersQuery = trpc.admin.getAllUsers.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const campaignsQuery = trpc.admin.getAllCampaigns.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const paymentsQuery = trpc.admin.getAllPayments.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const creatorsQuery = trpc.admin.getAllCreators.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user && user.role !== "admin") {
      setLocation("/");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading || statsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You need admin privileges to view this page.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;

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
            <Badge variant="destructive">Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Creators</p>
                  <p className="text-2xl font-bold">{stats?.totalCreators || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Brands</p>
                  <p className="text-2xl font-bold">{stats?.totalBrands || 0}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Campaigns</p>
                  <p className="text-2xl font-bold">{stats?.totalCampaigns || 0}</p>
                </div>
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold">${stats?.totalPayments?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Registered users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {usersQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">ID</th>
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">Email</th>
                          <th className="text-left py-3 px-4 font-medium">Role</th>
                          <th className="text-left py-3 px-4 font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersQuery.data?.map((u) => (
                          <tr key={u.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">{u.id}</td>
                            <td className="py-3 px-4">{u.name || "-"}</td>
                            <td className="py-3 px-4">{u.email || "-"}</td>
                            <td className="py-3 px-4">
                              <Badge variant={u.role === "admin" ? "destructive" : u.role === "creator" ? "default" : "secondary"}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creators">
            <Card>
              <CardHeader>
                <CardTitle>All Creators</CardTitle>
                <CardDescription>Registered creator profiles</CardDescription>
              </CardHeader>
              <CardContent>
                {creatorsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">Niche</th>
                          <th className="text-left py-3 px-4 font-medium">Followers</th>
                          <th className="text-left py-3 px-4 font-medium">Tier</th>
                          <th className="text-left py-3 px-4 font-medium">Guaranteed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creatorsQuery.data?.map((c) => (
                          <tr key={c.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{c.name}</td>
                            <td className="py-3 px-4">{c.niche || "-"}</td>
                            <td className="py-3 px-4">{c.followers?.toLocaleString() || 0}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{c.tier}</Badge>
                            </td>
                            <td className="py-3 px-4 text-green-600 font-medium">
                              ${parseFloat(c.guaranteedIncome || "0").toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>All campaigns on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">ID</th>
                          <th className="text-left py-3 px-4 font-medium">Title</th>
                          <th className="text-left py-3 px-4 font-medium">Budget</th>
                          <th className="text-left py-3 px-4 font-medium">Creators</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaignsQuery.data?.map((c) => (
                          <tr key={c.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">{c.id}</td>
                            <td className="py-3 px-4 font-medium">{c.title}</td>
                            <td className="py-3 px-4">${parseFloat(c.budget).toLocaleString()}</td>
                            <td className="py-3 px-4">{c.creatorsNeeded}</td>
                            <td className="py-3 px-4">
                              <Badge variant={c.status === "active" ? "default" : "secondary"}>
                                {c.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>All Payments</CardTitle>
                <CardDescription>Payment history across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : paymentsQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments recorded yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">ID</th>
                          <th className="text-left py-3 px-4 font-medium">Type</th>
                          <th className="text-left py-3 px-4 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 font-medium">Fee</th>
                          <th className="text-left py-3 px-4 font-medium">Net</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentsQuery.data?.map((p) => (
                          <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">{p.id}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{p.type}</Badge>
                            </td>
                            <td className="py-3 px-4">${parseFloat(p.amount).toLocaleString()}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              ${parseFloat(p.platformFee || "0").toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-green-600 font-medium">
                              ${parseFloat(p.netAmount).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                                {p.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
