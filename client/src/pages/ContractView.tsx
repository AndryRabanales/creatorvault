import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams, Link } from "wouter";
import { Loader2, ArrowLeft, CheckCircle, Clock, FileText, DollarSign, PenTool } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function ContractView() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const contractQuery = trpc.contract.getById.useQuery({ id: parseInt(id || "0") }, { enabled: !!id });
  const creatorProfileQuery = trpc.creator.getProfile.useQuery(undefined, { enabled: isAuthenticated && user?.role === "creator" });
  const brandProfileQuery = trpc.brand.getProfile.useQuery(undefined, { enabled: isAuthenticated && user?.role === "brand" });
  
  const signMutation = trpc.contract.sign.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const handleSign = async () => {
    try {
      await signMutation.mutateAsync({ contractId: parseInt(id || "0") });
      toast.success("Contract signed successfully!");
      utils.contract.getById.invalidate();
    } catch (error) {
      toast.error("Failed to sign contract");
    }
  };

  if (loading || contractQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const contract = contractQuery.data;

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Contract not found</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.role === "creator";
  const isBrand = user?.role === "brand";
  const canSign = (isCreator && creatorProfileQuery.data?.id === contract.creatorId && !contract.creatorSigned) ||
                  (isBrand && brandProfileQuery.data?.id === contract.brandId && !contract.brandSigned);

  const backUrl = isCreator ? "/dashboard/creator" : "/dashboard/brand";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center h-16">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Contract Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Contract #{contract.id}</h1>
              </div>
              <p className="text-muted-foreground">Campaign #{contract.campaignId}</p>
            </div>
            <div>
              {contract.status === "pending" && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" /> Pending Signatures
                </Badge>
              )}
              {contract.status === "active" && (
                <Badge className="bg-green-600 gap-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </Badge>
              )}
              {contract.status === "completed" && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Signature Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Signature Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${contract.brandSigned ? 'border-green-500 bg-green-50' : 'border-border'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {contract.brandSigned ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">Brand</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {contract.brandSigned 
                      ? `Signed on ${new Date(contract.brandSignedAt!).toLocaleDateString()}`
                      : "Awaiting signature"
                    }
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${contract.creatorSigned ? 'border-green-500 bg-green-50' : 'border-border'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {contract.creatorSigned ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">Creator</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {contract.creatorSigned 
                      ? `Signed on ${new Date(contract.creatorSignedAt!).toLocaleDateString()}`
                      : "Awaiting signature"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Payment</span>
                  <span className="font-medium">${parseFloat(contract.paymentAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (20%)</span>
                  <span className="font-medium">${parseFloat(contract.platformFee).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Creator Payout</span>
                  <span className="font-bold text-green-600 text-lg">${parseFloat(contract.creatorPayout).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Terms */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contract Terms</CardTitle>
              <CardDescription>Please read carefully before signing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
                {contract.terms || "No terms specified"}
              </div>
            </CardContent>
          </Card>

          {/* Sign Button */}
          {canSign && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="text-center">
                  <PenTool className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Sign?</h3>
                  <p className="text-muted-foreground mb-4">
                    By signing this contract, you agree to all the terms and conditions above.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleSign} 
                    disabled={signMutation.isPending}
                    className="gap-2"
                  >
                    {signMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        Accept & Sign Contract
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already Signed Message */}
          {!canSign && contract.status !== "completed" && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6 text-center">
                {((isCreator && contract.creatorSigned) || (isBrand && contract.brandSigned)) ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">You've Signed This Contract</h3>
                    <p className="text-muted-foreground">
                      Waiting for the other party to sign.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Awaiting Signatures</h3>
                    <p className="text-muted-foreground">
                      This contract is pending signatures from both parties.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Completed Message */}
          {contract.status === "completed" && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Contract Completed</h3>
                <p className="text-muted-foreground">
                  This contract has been fulfilled and payment has been processed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
