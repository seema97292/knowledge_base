import { formatDistanceToNow } from "date-fns";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Clock,
    History,
    User
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { versionsAPI } from "../../lib/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface VersionDetails {
  documentId: string;
  documentTitle: string;
  documentAuthor: {
    _id: string;
    username: string;
    email: string;
  };
  version: {
    _id: string;
    version: number;
    content: string;
    changedBy: {
      _id: string;
      username: string;
      email: string;
    };
    changedAt: string;
  };
}

export default function DocumentVersionView() {
  const { id, versionId } = useParams<{ id: string; versionId: string }>();
  const navigate = useNavigate();
  const [versionDetails, setVersionDetails] = useState<VersionDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && versionId) {
      fetchVersionDetails();
    }
  }, [id, versionId]);

  const fetchVersionDetails = async () => {
    if (!id || !versionId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await versionsAPI.getVersion(id, versionId);
      setVersionDetails(response.data);
    } catch (error) {
      console.error("Error fetching version details:", error);
      setError("Failed to load version details");
      toast.error("Failed to load version details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading version
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/documents/${id}/versions`)}>
            Back to Version History
          </Button>
        </div>
      </div>
    );
  }

  if (!versionDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Version not found
          </h3>
          <p className="text-gray-600 mb-4">
            The version you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate(`/documents/${id}/versions`)}>
            Back to Version History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/documents/${id}/versions`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/documents/${id}/versions`)}
              >
                <History className="h-4 w-4 mr-2" />
                All Versions
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-3xl font-bold">
                {versionDetails.documentTitle}
              </CardTitle>
              <Badge variant="default">
                Version {versionDetails.version.version}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>
                    <strong>Document Author:</strong>{" "}
                    {versionDetails.documentAuthor.username}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>
                    <strong>Version Author:</strong>{" "}
                    {versionDetails.version.changedBy.username}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    <strong>Modified:</strong>{" "}
                    {formatDate(versionDetails.version.changedAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Full Date:</strong>{" "}
                    {formatFullDate(versionDetails.version.changedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> This is a historical version of the
                  document. It may not reflect the current state.
                </p>
              </div>
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: versionDetails.version.content }}
          />

          {!versionDetails.version.content && (
            <div className="text-center py-12 text-gray-500">
              <p>This version of the document was empty.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
