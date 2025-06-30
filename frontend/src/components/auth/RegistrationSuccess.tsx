import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Mail, ArrowRight } from "lucide-react";

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <p className="text-gray-600 text-sm">
            We've sent a verification link to your email address
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Almost there!</strong> Please check your email ({email})
              and click the verification link to activate your account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Check your inbox and spam folder</span>
            </div>
            <div className="flex items-start space-x-3">
              <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Click the verification link in the email</span>
            </div>
            <div className="flex items-start space-x-3">
              <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>You'll be able to log in once verified</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate("/login")} className="w-full">
              Continue to Login
            </Button>

            <Button
              onClick={() => navigate("/resend-verification")}
              variant="outline"
              className="w-full"
            >
              Didn't receive the email?
            </Button>
          </div>

          <div className="text-center">
            <a
              href="/register"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Register with a different email
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
