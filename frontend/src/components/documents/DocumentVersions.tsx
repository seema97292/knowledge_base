import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { versionsAPI } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  ArrowLeft,
  Clock,
  User,
  Eye,
  GitCompare,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface Version {
  _id: string;
  version: number;
  changedBy: {
    _id: string;
    username: string;
    email: string;
  };
  changedAt: string;
  contentPreview: string;
}

interface VersionData {
  documentId: string;
  documentTitle: string;
  versions: Version[];
}

export default function DocumentVersions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchVersions();
    }
  }, [id]);

  const fetchVersions = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await versionsAPI.getVersions(id);
      setVersionData(response.data);
    } catch (error) {
      console.error("Error fetching versions:", error);
      setError("Failed to load version history");
      toast.error("Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((v) => v !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      setSelectedVersions([selectedVersions[1], versionId]);
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2 && id) {
      navigate(
        `/documents/${id}/versions/${selectedVersions[0]}/compare?with=${selectedVersions[1]}`,
      );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const getVersionBadgeColor = (version: number, totalVersions: number) => {
    if (version === totalVersions) return "default"; // Latest version
    if (version === 1) return "secondary"; // First version
    return "outline"; // Other versions
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
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
            Error loading version history
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/documents/${id}`)}>
            Back to Document
          </Button>
        </div>
      </div>
    );
  }

  if (!versionData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No version history found
          </h3>
          <p className="text-gray-600 mb-4">
            This document doesn't have any version history.
          </p>
          <Button onClick={() => navigate(`/documents/${id}`)}>
            Back to Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/documents/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Document
            </Button>
          </div>

          {selectedVersions.length === 2 && (
            <Button onClick={handleCompareVersions} size="sm">
              <GitCompare className="h-4 w-4 mr-2" />
              Compare Selected Versions
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Version History
          </h1>
          <p className="text-gray-600">
            {versionData.documentTitle} • {versionData.versions.length} version
            {versionData.versions.length !== 1 ? "s" : ""}
          </p>
          {selectedVersions.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              {selectedVersions.length}/2 versions selected for comparison
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {versionData.versions.map((version) => (
          <Card
            key={version._id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVersions.includes(version._id)
                ? "ring-2 ring-blue-500 border-blue-500"
                : ""
            }`}
            onClick={() => handleVersionSelect(version._id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={getVersionBadgeColor(
                      version.version,
                      versionData.versions.length,
                    )}
                  >
                    Version {version.version}
                    {version.version === versionData.versions.length &&
                      " (Latest)"}
                  </Badge>

                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{version.changedBy.username}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(version.changedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link to={`/documents/${id}/versions/${version._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {version.contentPreview}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {versionData.versions.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No versions yet
          </h3>
          <p className="text-gray-600">
            Versions will appear here when the document is edited.
          </p>
        </div>
      )}
    </div>
  );
}
