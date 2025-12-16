import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { 
  Loader2, Search, DollarSign, Users, Calendar, 
  ArrowRight, Briefcase, SlidersHorizontal, X
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getLoginUrl } from "@/const";

const NICHES = [
  "All Categories",
  "Fitness & Health",
  "Beauty & Fashion",
  "Technology",
  "Gaming",
  "Food & Cooking",
  "Travel",
  "Lifestyle",
  "Education",
  "Entertainment",
  "Business & Finance",
];

const BUDGET_RANGES = [
  { label: "Any Budget", min: 0, max: Infinity },
  { label: "$100 - $500", min: 100, max: 500 },
  { label: "$500 - $1,000", min: 500, max: 1000 },
  { label: "$1,000 - $5,000", min: 1000, max: 5000 },
  { label: "$5,000+", min: 5000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "budget-high", label: "Highest Budget" },
  { value: "budget-low", label: "Lowest Budget" },
  { value: "deadline", label: "Deadline Soon" },
];

export default function Marketplace() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const campaignsQuery = trpc.campaign.getAll.useQuery();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All Categories");
  const [selectedBudget, setSelectedBudget] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaignsQuery.data) return [];
    
    let campaigns = campaignsQuery.data.filter((c: any) => c.status === "active");
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      campaigns = campaigns.filter((c: any) => 
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.requirements?.toLowerCase().includes(query)
      );
    }
    
    // Niche filter
    if (selectedNiche !== "All Categories") {
      campaigns = campaigns.filter((c: any) => c.niche === selectedNiche);
    }
    
    // Budget filter
    const budgetRange = BUDGET_RANGES[selectedBudget];
    if (budgetRange && budgetRange.min > 0) {
      campaigns = campaigns.filter((c: any) => {
        const budget = parseFloat(c.budget);
        return budget >= budgetRange.min && budget <= budgetRange.max;
      });
    }
    
    // Sort
    campaigns.sort((a: any, b: any) => {
      switch (sortBy) {
        case "budget-high":
          return parseFloat(b.budget) - parseFloat(a.budget);
        case "budget-low":
          return parseFloat(a.budget) - parseFloat(b.budget);
        case "deadline":
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return campaigns;
  }, [campaignsQuery.data, searchQuery, selectedNiche, selectedBudget, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNiche("All Categories");
    setSelectedBudget(0);
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedNiche !== "All Categories" || selectedBudget > 0;

  if (loading || campaignsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

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
            <Badge variant="outline">Marketplace</Badge>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "creator" && (
              <Link href="/dashboard/creator">
                <Button variant="outline" size="sm">My Dashboard</Button>
              </Link>
            )}
            {user?.role === "brand" && (
              <Link href="/dashboard/brand">
                <Button variant="outline" size="sm">Brand Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Campaign Marketplace</h1>
          <p className="text-muted-foreground">
            Discover brand sponsorship opportunities that match your content style
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">Active</Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NICHES.map((niche) => (
                          <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget Range</label>
                    <Select value={selectedBudget.toString()} onValueChange={(v) => setSelectedBudget(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUDGET_RANGES.map((range, i) => (
                          <SelectItem key={i} value={i.toString()}>{range.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={clearFilters} className="gap-2">
                        <X className="w-4 h-4" /> Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results"
                  : "Check back soon for new sponsorship opportunities"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign: any) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {campaign.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600 ml-2 shrink-0">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          ${parseFloat(campaign.budget).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Budget</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{campaign.creatorsNeeded} creators</span>
                      </div>
                      {campaign.deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(campaign.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {campaign.requirements && (
                      <div className="text-sm text-muted-foreground border-t border-border pt-3">
                        <p className="line-clamp-2">{campaign.requirements}</p>
                      </div>
                    )}

                    <Link href={`/campaign/${campaign.id}`}>
                      <Button className="w-full mt-2">
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
