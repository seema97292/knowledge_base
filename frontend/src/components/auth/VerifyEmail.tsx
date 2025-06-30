import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      if (!token) return;

      const response = await authAPI.verifyEmail(token);
      setStatus("success");
      setMessage(response.data.message || "Email verified successfully!");
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Verification failed. The link may be invalid or expired.",
      );
    }
  };

  const handleContinueToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-12 w-12 text-red-600" />
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {status !== "loading" && (
            <div className="space-y-4">
              <Button
                onClick={handleContinueToLogin}
                className="w-full"
                variant={status === "success" ? "default" : "outline"}
              >
                {status === "success" ? "Continue to Login" : "Go to Login"}
              </Button>

              {status === "error" && (
                <Button
                  onClick={() => navigate("/register")}
                  variant="ghost"
                  className="w-full"
                >
                  Register Again
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
