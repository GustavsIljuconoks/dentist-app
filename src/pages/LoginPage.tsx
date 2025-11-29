import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        console.log("Login attempt:", {
            email: formData.get("email"),
            password: formData.get("password"),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-xl font-semibold text-center text-gray-800">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Sign in to access your patient appointments and
                            records
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="doctor@dentalcare.com"
                                    autoComplete="email"
                                    required
                                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </Label>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
