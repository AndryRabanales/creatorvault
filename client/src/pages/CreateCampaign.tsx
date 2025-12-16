import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Loader2, ArrowLeft, DollarSign, Users, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function CreateCampaign() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [creatorsNeeded, setCreatorsNeeded] = useState("1");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");

  const createMutation = trpc.campaign.create.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user && user.role !== "brand" && user.role !== "admin") {
      setLocation("/select-role");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createMutation.mutateAsync({
        title,
        description,
        budget: parseFloat(budget) || 0,
        creatorsNeeded: parseInt(creatorsNeeded) || 1,
        requirements,
        deadline: deadline ? new Date(deadline) : undefined,
      });
      toast.success("Campaign created! Now deposit funds to activate it.");
      setLocation(`/campaign/${result.campaignId}`);
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const budgetNum = parseFloat(budget) || 0;
  const creatorsNum = parseInt(creatorsNeeded) || 1;
  const perCreator = budgetNum / creatorsNum;
  const platformFee = perCreator * 0.2;
  const creatorPayout = perCreator * 0.8;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center h-16">
          <Link href="/dashboard/brand">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Campaign</h1>
            <p className="text-muted-foreground">Set up a new sponsorship campaign for creators</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Product Launch"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you're looking for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Specific requirements for creators (content type, platforms, etc.)"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
                <CardDescription>Set your budget and deadline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Total Budget ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        min="100"
                        step="100"
                        placeholder="1000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creators">Number of Creators</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="creators"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1"
                        value={creatorsNeeded}
                        onChange={(e) => setCreatorsNeeded(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Preview */}
            {budgetNum > 0 && (
              <Card className="mb-6 bg-muted/30">
                <CardHeader>
                  <CardTitle>Payment Breakdown</CardTitle>
                  <CardDescription>How your budget will be distributed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span className="font-medium">${budgetNum.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Creator</span>
                      <span className="font-medium">${perCreator.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (20%)</span>
                      <span>${platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Creator Payout (80%)</span>
                      <span className="font-bold text-green-600">${creatorPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Link href="/dashboard/brand" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
