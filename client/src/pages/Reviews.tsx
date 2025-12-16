import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Loader2, ArrowLeft, Star, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Reviews() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{ type: "creator" | "brand"; id: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";

  const creatorReviewsQuery = trpc.creator.getReviews.useQuery(undefined, { 
    enabled: isAuthenticated && isCreator 
  });
  const brandReviewsQuery = trpc.brand.getReviews.useQuery(undefined, { 
    enabled: isAuthenticated && isBrand 
  });

  const submitReviewMutation = trpc.review.create.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const handleSubmitReview = async () => {
    if (!selectedTarget) return;
    try {
      await submitReviewMutation.mutateAsync({
        contractId: selectedTarget.id, // Using target ID as contract ID
        rating,
        comment,
      });
      toast.success("Review submitted successfully!");
      setShowReviewDialog(false);
      setRating(5);
      setComment("");
      setSelectedTarget(null);
      if (isCreator) {
        utils.creator.getReviews.invalidate();
      } else {
        utils.brand.getReviews.invalidate();
      }
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const reviews = isCreator ? creatorReviewsQuery.data : brandReviewsQuery.data;
  const isLoading = isCreator ? creatorReviewsQuery.isLoading : brandReviewsQuery.isLoading;

  const renderStars = (count: number, interactive = false, onSelect?: (n: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-5 h-5 ${n <= count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
            }`}
            onClick={() => interactive && onSelect?.(n)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href={isCreator ? "/dashboard/creator" : "/dashboard/brand"}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Reviews</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Reviews Received */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews Received</CardTitle>
              <CardDescription>What others say about you</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : !reviews || reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No reviews yet</p>
                  <p className="text-sm">Complete campaigns to receive reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {isCreator ? `Brand #${review.reviewerId}` : `Creator #${review.reviewerId}`}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave a Review */}
          <Card>
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
              <CardDescription>Rate your experience with {isCreator ? "brands" : "creators"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                      Share your experience working with this {isCreator ? "brand" : "creator"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Target ID</Label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border border-border rounded-md"
                        placeholder={`Enter ${isCreator ? "brand" : "creator"} ID`}
                        onChange={(e) => setSelectedTarget({
                          type: isCreator ? "brand" : "creator",
                          id: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <div className="mt-2">
                        {renderStars(rating, true, setRating)}
                      </div>
                    </div>
                    <div>
                      <Label>Comment (optional)</Label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitReview} 
                      disabled={submitReviewMutation.isPending || !selectedTarget?.id}
                      className="w-full"
                    >
                      {submitReviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Review
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Review Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be honest and constructive</li>
                  <li>• Focus on the professional experience</li>
                  <li>• Avoid personal attacks or inappropriate language</li>
                  <li>• Reviews help build trust in our community</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
