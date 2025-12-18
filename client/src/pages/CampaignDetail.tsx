import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams, Link } from "wouter";
import {
  Loader2, ArrowLeft, DollarSign, Users, Calendar, CheckCircle,
  XCircle, Clock, Send, ExternalLink, FileText, Building2, User
} from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [applicationMessage, setApplicationMessage] = useState("");
  const [deliverableLink, setDeliverableLink] = useState("");
  const [deliverableDescription, setDeliverableDescription] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showDeliverableDialog, setShowDeliverableDialog] = useState(false);

  const campaignId = parseInt(id || "0");
  const campaignQuery = trpc.campaign.getById.useQuery({ id: campaignId }, { enabled: campaignId > 0 });
  const creatorProfileQuery = trpc.creator.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "creator"
  });
  const applicationsQuery = trpc.campaign.getApplications.useQuery(
    { campaignId },
    { enabled: campaignId > 0 }
  );

  const applyMutation = trpc.application.applyToCampaign.useMutation();
  const approveMutation = trpc.application.approve.useMutation();
  const rejectMutation = trpc.application.reject.useMutation();
  const submitDeliverableMutation = trpc.deliverable.submit.useMutation();
  const approveDeliverableMutation = trpc.deliverable.approve.useMutation();
  const activateMutation = trpc.campaign.activate.useMutation();

  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({
        campaignId,
        message: applicationMessage,
      });
      toast.success("Application submitted successfully!");
      setShowApplyDialog(false);
      setApplicationMessage("");
      utils.campaign.getApplications.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    }
  };

  const handleApprove = async (applicationId: number) => {
    try {
      await approveMutation.mutateAsync({ applicationId });
      toast.success("Creator approved! Contract generated.");
      utils.campaign.getApplications.invalidate();
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      await rejectMutation.mutateAsync({ applicationId });
      toast.success("Application rejected");
      utils.campaign.getApplications.invalidate();
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const handleSubmitDeliverable = async (applicationId: number) => {
    if (!deliverableLink) {
      toast.error("Please provide a link to your content");
      return;
    }
    try {
      await submitDeliverableMutation.mutateAsync({
        applicationId,
        link: deliverableLink,
        description: deliverableDescription,
      });
      toast.success("Deliverable submitted!");
      setShowDeliverableDialog(false);
      setDeliverableLink("");
      setDeliverableDescription("");
      utils.campaign.getApplications.invalidate();
    } catch (error) {
      toast.error("Failed to submit deliverable");
    }
  };

  const handleApproveDeliverable = async (deliverableId: number) => {
    try {
      await approveDeliverableMutation.mutateAsync({ deliverableId });
      toast.success("Deliverable approved! Payment will be processed.");
      utils.campaign.getApplications.invalidate();
    } catch (error) {
      toast.error("Failed to approve deliverable");
    }
  };

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync({ id: campaignId });
      toast.success("Campaign activated! Funds deposited.");
      utils.campaign.getById.invalidate({ id: campaignId });
    } catch (error) {
      toast.error("Failed to activate campaign");
    }
  };

  if (loading || campaignQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaignQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">This campaign may have been removed or doesn't exist.</p>
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const campaign = campaignQuery.data;
  const applications = applicationsQuery.data || [];
  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";
  const myApplication = isCreator && creatorProfileQuery.data
    ? applications.find((a: any) => a.creatorId === creatorProfileQuery.data?.id)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CV</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                    <CardDescription className="mt-2">{campaign.description}</CardDescription>
                  </div>
                  <Badge className={
                    campaign.status === "active" ? "bg-green-600" :
                      campaign.status === "completed" ? "bg-blue-600" :
                        "bg-yellow-600"
                  }>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">${parseFloat(campaign.budget).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{campaign.creatorsNeeded}</p>
                    <p className="text-sm text-muted-foreground">Creators Needed</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-lg font-bold">
                      {campaign.deadline
                        ? new Date(campaign.deadline).toLocaleDateString()
                        : "No deadline"}
                    </p>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {campaign.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Brand Actions: Activate Flow */}
            {isBrand && campaign.status === "draft" && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="w-5 h-5" /> Deposit & Activate
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Your campaign is currently in <b>Draft</b> mode. Deposit the budget to start accepting applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-100 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Budget to Deposit</p>
                      <p className="text-2xl font-bold text-green-600">${parseFloat(campaign.budget).toLocaleString()}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                        Held in Escrow
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleActivate}
                    disabled={activateMutation.isPending}
                  >
                    {activateMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <DollarSign className="w-5 h-5 mr-2" />
                    )}
                    Simulate Deposit & Activate
                  </Button>
                  <p className="text-xs text-center text-green-600 mt-2">
                    * This is a simulation for MVP testing. No real money is charged.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Applications (for Brand owners) */}
            {isBrand && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applications ({applications.length})</CardTitle>
                  <CardDescription>Review and manage creator applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((app: any) => (
                      <div key={app.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Creator #{app.creatorId}</p>
                              <p className="text-sm text-muted-foreground">
                                Applied {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            app.status === "approved" ? "default" :
                              app.status === "rejected" ? "destructive" :
                                "secondary"
                          }>
                            {app.status}
                          </Badge>
                        </div>

                        {app.message && (
                          <p className="mt-3 text-sm text-muted-foreground bg-muted p-3 rounded">
                            "{app.message}"
                          </p>
                        )}

                        {app.status === "pending" && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(app.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}

                        {app.status === "approved" && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm font-medium mb-2">Deliverables</p>
                            {app.deliverables && app.deliverables.length > 0 ? (
                              <div className="space-y-2">
                                {app.deliverables.map((d: any) => (
                                  <div key={d.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <a href={d.contentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" /> View Content
                                    </a>
                                    {d.status === "pending" && (
                                      <Button size="sm" onClick={() => handleApproveDeliverable(d.id)}>
                                        Approve
                                      </Button>
                                    )}
                                    {d.status === "approved" && (
                                      <Badge className="bg-green-600">Approved</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No deliverables submitted yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card (for Creators) */}
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Apply to Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  {myApplication ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {myApplication.status === "pending" && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" /> Pending Review
                          </Badge>
                        )}
                        {myApplication.status === "approved" && (
                          <Badge className="bg-green-600 gap-1">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </Badge>
                        )}
                        {myApplication.status === "rejected" && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" /> Rejected
                          </Badge>
                        )}
                      </div>

                      {myApplication.status === "approved" && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-2">Submit Your Deliverable</p>
                            <Dialog open={showDeliverableDialog} onOpenChange={setShowDeliverableDialog}>
                              <DialogTrigger asChild>
                                <Button className="w-full">
                                  <Send className="w-4 h-4 mr-2" /> Submit Content
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Submit Deliverable</DialogTitle>
                                  <DialogDescription>Share a link to your completed content</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Content Link *</Label>
                                    <Input
                                      placeholder="https://..."
                                      value={deliverableLink}
                                      onChange={(e) => setDeliverableLink(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Description (optional)</Label>
                                    <Textarea
                                      placeholder="Brief description..."
                                      value={deliverableDescription}
                                      onChange={(e) => setDeliverableDescription(e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handleSubmitDeliverable(myApplication.id)}
                                    disabled={!deliverableLink || submitDeliverableMutation.isPending}
                                    className="w-full"
                                  >
                                    {submitDeliverableMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      "Submit"
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <Link href={`/contract/${(myApplication as any).contractId || 0}`}>
                            <Button variant="outline" className="w-full">
                              <FileText className="w-4 h-4 mr-2" /> View Contract
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  ) : (
                    <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" disabled={campaign.status !== "active"}>
                          {campaign.status === "active" ? "Apply Now" : "Campaign Closed"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply to {campaign.title}</DialogTitle>
                          <DialogDescription>Tell the brand why you're a great fit</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Message (optional)</Label>
                            <Textarea
                              placeholder="Why are you interested in this campaign?"
                              value={applicationMessage}
                              onChange={(e) => setApplicationMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button
                            onClick={handleApply}
                            disabled={applyMutation.isPending}
                            className="w-full"
                          >
                            {applyMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Submit Application"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Earnings Estimate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Earnings Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Creator</span>
                    <span className="font-medium">
                      ${(parseFloat(campaign.budget) / (campaign.creatorsNeeded || 1)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (20%)</span>
                    <span className="text-muted-foreground">
                      -${((parseFloat(campaign.budget) / (campaign.creatorsNeeded || 1)) * 0.2).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Your Earnings</span>
                    <span className="font-bold text-green-600">
                      ${((parseFloat(campaign.budget) / (campaign.creatorsNeeded || 1)) * 0.8).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">{campaign.status}</span>
                </div>
                {campaign.niche && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{campaign.niche}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
