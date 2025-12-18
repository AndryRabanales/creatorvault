
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiUrl } from "@/const";
import { toast } from "sonner";

export default function DevLogin() {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const handleLogin = async (role: "creator" | "brand", defaultEmail: string, defaultName: string) => {
        setLoading(true);
        const loginEmail = email || defaultEmail;
        const loginName = name || defaultName;

        try {
            const response = await fetch(`${getApiUrl()}/api/auth/dev-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, role, name: loginName }),
            });

            if (!response.ok) throw new Error("Login failed");

            const data = await response.json();
            toast.success(`Logged in as ${data.user.name}`);

            // Redirect based on role
            if (role === "creator") {
                setLocation("/dashboard/creator");
            } else {
                setLocation("/dashboard/brand");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">CreatorVault Dev Login</CardTitle>
                    <CardDescription>
                        Simulate login for testing MVP features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="creator" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="creator">Creator</TabsTrigger>
                            <TabsTrigger value="brand">Brand</TabsTrigger>
                        </TabsList>

                        <div className="space-y-4 mb-6">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="custom-email">Custom Email (Optional)</Label>
                                <Input
                                    id="custom-email"
                                    type="email"
                                    placeholder="Enter custom email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="custom-name">Custom Name (Optional)</Label>
                                <Input
                                    id="custom-name"
                                    type="text"
                                    placeholder="Enter custom name..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <TabsContent value="creator" className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                <p className="text-sm text-blue-800 font-medium mb-1">Test Persona: Juan Pérez</p>
                                <p className="text-xs text-blue-600">Tier 2 Creator • 92k Followers</p>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => handleLogin("creator", "juan@example.com", "Juan Pérez")}
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login as Creator"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="brand" className="space-y-4">
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                                <p className="text-sm text-orange-800 font-medium mb-1">Test Persona: Nike</p>
                                <p className="text-xs text-orange-600">Enterprise Brand • Active Campaigns</p>
                            </div>
                            <Button
                                className="w-full"
                                variant="default"
                                size="lg"
                                onClick={() => handleLogin("brand", "marketing@nike.com", "Nike")}
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login as Brand"}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
