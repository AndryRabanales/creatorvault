import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, DollarSign, AlertCircle, Instagram, Youtube, Twitter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const NICHES = [
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
  "Art & Design",
  "Music",
  "Sports",
  "Parenting",
  "Other",
];

function calculateTierPreview(followers: number) {
  if (followers >= 200000) {
    return { tier: "Tier 3", tierKey: "tier3", income: 2000, color: "text-yellow-600", bgColor: "bg-yellow-50" };
  } else if (followers >= 50000) {
    return { tier: "Tier 2", tierKey: "tier2", income: 1000, color: "text-primary", bgColor: "bg-primary/5" };
  } else if (followers >= 10000) {
    return { tier: "Tier 1", tierKey: "tier1", income: 500, color: "text-green-600", bgColor: "bg-green-50" };
  }
  return { tier: "Below minimum", tierKey: "none", income: 0, color: "text-muted-foreground", bgColor: "bg-muted" };
}

export default function CreatorOnboarding() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const createProfileMutation = trpc.creator.createProfile.useMutation();

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  
  // UI state
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const followerCount = parseInt(followers.replace(/,/g, "")) || 0;
  const tierPreview = calculateTierPreview(followerCount);

  // Form validation
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (name.length < 2) errors.push("Name must be at least 2 characters");
    if (name.length > 50) errors.push("Name must be less than 50 characters");
    if (!niche) errors.push("Please select a content niche");
    if (followerCount < 10000) errors.push("Minimum 10,000 followers required");
    if (followerCount > 100000000) errors.push("Please enter a valid follower count");
    if (bio.length > 500) errors.push("Bio must be less than 500 characters");
    
    if (!instagram && !tiktok && !youtube) {
      warnings.push("Adding social links helps brands find you");
    }
    if (bio.length < 50 && bio.length > 0) {
      warnings.push("A longer bio helps brands understand your content");
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  }, [name, niche, followerCount, bio, instagram, tiktok, youtube]);

  // Progress calculation
  const progress = useMemo(() => {
    let completed = 0;
    if (name.length >= 2) completed += 25;
    if (niche) completed += 25;
    if (followerCount >= 10000) completed += 25;
    if (bio.length >= 10) completed += 15;
    if (instagram || tiktok || youtube) completed += 10;
    return Math.min(completed, 100);
  }, [name, niche, followerCount, bio, instagram, tiktok, youtube]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    try {
      const result = await createProfileMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        niche,
        followers: followerCount,
        instagram: instagram.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        youtube: youtube.trim() || undefined,
      });
      
      const tierName = result.tier === "tier1" ? "Tier 1 ($500/mo)" : 
                       result.tier === "tier2" ? "Tier 2 ($1,000/mo)" : 
                       "Tier 3 ($2,000/mo)";
      toast.success(`Welcome to CreatorVault! You've been assigned to ${tierName}`);
      setLocation("/dashboard/creator");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile. Please try again.");
    }
  };

  const formatFollowers = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num ? parseInt(num).toLocaleString() : "";
  };

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
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">CV</span>
              </div>
              <div>
                <h1 className="font-semibold">Creator Onboarding</h1>
                <p className="text-sm text-muted-foreground">Step {step} of 2</p>
              </div>
            </div>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{progress}% complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about yourself and your content</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your creator name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={name.length > 0 && name.length < 2 ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how brands will see you ({name.length}/50 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niche">Content Niche *</Label>
                    <Select value={niche} onValueChange={setNiche}>
                      <SelectTrigger className={!niche ? "" : "border-green-500"}>
                        <SelectValue placeholder="Select your main content category" />
                      </SelectTrigger>
                      <SelectContent>
                        {NICHES.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="followers">Total Followers (all platforms) *</Label>
                    <Input
                      id="followers"
                      placeholder="e.g., 50,000"
                      value={followers}
                      onChange={(e) => setFollowers(formatFollowers(e.target.value))}
                      className={followerCount > 0 && followerCount < 10000 ? "border-red-500" : followerCount >= 10000 ? "border-green-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Combine followers from TikTok, Instagram, YouTube, Twitter, etc. Minimum: 10,000
                    </p>
                  </div>

                  {/* Tier Preview */}
                  {followerCount > 0 && (
                    <div className={`rounded-lg border p-4 ${tierPreview.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Your Tier Assignment</p>
                          <p className={`text-lg font-bold ${tierPreview.color}`}>{tierPreview.tier}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Guaranteed Monthly Income</p>
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className={`w-5 h-5 ${tierPreview.color}`} />
                            <span className={`text-2xl font-bold ${tierPreview.color}`}>
                              {tierPreview.income.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {followerCount >= 10000 ? (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          You qualify for CreatorVault!
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {(10000 - followerCount).toLocaleString()} more followers needed to qualify
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (optional but recommended)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  <Button 
                    type="button"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!name || !niche || followerCount < 10000}
                  >
                    Continue to Social Links
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Help brands find and verify your accounts (optional but recommended)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" /> Instagram Username
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        @
                      </span>
                      <Input
                        id="instagram"
                        placeholder="yourusername"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      TikTok Username
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        @
                      </span>
                      <Input
                        id="tiktok"
                        placeholder="yourusername"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value.replace("@", ""))}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="flex items-center gap-2">
                      <Youtube className="w-4 h-4" /> YouTube Channel URL
                    </Label>
                    <Input
                      id="youtube"
                      placeholder="https://youtube.com/@yourchannel"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                    />
                  </div>

                  {/* Profile Preview */}
                  <div className="rounded-lg border border-border p-4 bg-muted/30">
                    <h4 className="font-medium mb-3">Profile Preview</h4>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                        {name.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{name || "Your Name"}</h3>
                        <p className="text-sm text-muted-foreground">{niche || "Content Niche"}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-sm font-medium ${tierPreview.color}`}>{tierPreview.tier}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{followerCount.toLocaleString()} followers</span>
                        </div>
                        {bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bio}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Validation Messages */}
                  {validation.warnings.length > 0 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                      {validation.warnings.map((warning, i) => (
                        <p key={i} className="text-sm text-yellow-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {warning}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createProfileMutation.isPending || !validation.isValid}
                    >
                      {createProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating Profile...
                        </>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tier Reference */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-center mb-4">Tier Reference</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className={`rounded-lg border p-4 ${tierPreview.tierKey === "tier1" ? "border-green-500 bg-green-50" : "border-border"}`}>
                <p className="font-semibold text-green-600">Tier 1</p>
                <p className="text-muted-foreground text-xs">10K - 50K followers</p>
                <p className="text-lg font-bold text-green-600 mt-1">$500/mo</p>
              </div>
              <div className={`rounded-lg border p-4 ${tierPreview.tierKey === "tier2" ? "border-primary bg-primary/5" : "border-border"}`}>
                <p className="font-semibold text-primary">Tier 2</p>
                <p className="text-muted-foreground text-xs">50K - 200K followers</p>
                <p className="text-lg font-bold text-primary mt-1">$1,000/mo</p>
              </div>
              <div className={`rounded-lg border p-4 ${tierPreview.tierKey === "tier3" ? "border-yellow-500 bg-yellow-50" : "border-border"}`}>
                <p className="font-semibold text-yellow-600">Tier 3</p>
                <p className="text-muted-foreground text-xs">200K+ followers</p>
                <p className="text-lg font-bold text-yellow-600 mt-1">$2,000/mo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
