import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentsAPI } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  ArrowLeft,
  Share2,
  UserPlus,
  Mail,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Copy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import type { Document } from "../../types";

interface SharedUser {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  permission: "read" | "edit";
  sharedAt: string;
}

export default function ShareDocument() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await documentsAPI.getById(id);
      setDocument(response.data);
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document");
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail.trim()) {
      toast.error("Please enter a user email");
      return;
    }

    if (!id) return;

    try {
      setSharing(true);

      // The API expects email and permission
      const response = await documentsAPI.share(id, userEmail, permission);

      toast.success(response.data.message || "Document shared successfully");
      setUserEmail("");
      await fetchDocument(); // Refresh document data
    } catch (error: any) {
      console.error("Error sharing document:", error);
      toast.error(error.response?.data?.message || "Failed to share document");
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveAccess = async (userId: string, username: string) => {
    if (!id) return;

    if (!window.confirm(`Remove access for ${username}?`)) {
      return;
    }

    try {
      await documentsAPI.removeAccess(id, userId);
      toast.success(`Access removed for ${username}`);
      await fetchDocument(); // Refresh document data
    } catch (error) {
      console.error("Error removing access:", error);
      toast.error("Failed to remove access");
    }
  };

  const copyShareLink = () => {
    if (document) {
      const shareUrl = `${window.location.origin}/documents/${document._id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    }
  };

  const canManageSharing = () => {
    if (!document || !user) return false;
    return document.author._id === user._id;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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
            Error loading document
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/documents/${id}`)}>
            Back to Document
          </Button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Document not found
          </h3>
          <p className="text-gray-600 mb-4">
            The document you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (!canManageSharing()) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Share2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to manage sharing for this document.
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
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/documents/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Document
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Share2 className="h-8 w-8 mr-3" />
            Share Document
          </h1>
          <p className="text-gray-600">{document.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Share Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Copy className="h-5 w-5 mr-2" />
              Share Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                value={`${window.location.origin}/documents/${document._id}`}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyShareLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Anyone with this link can view the document if it's public.
            </p>
          </CardContent>
        </Card>

        {/* Share with Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Share with Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShare} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="userEmail">User Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Enter user email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="permission">Permission</Label>
                  <select
                    id="permission"
                    value={permission}
                    onChange={(e) =>
                      setPermission(e.target.value as "view" | "edit")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={sharing}
                className="w-full md:w-auto"
              >
                {sharing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Shares */}
        <Card>
          <CardHeader>
            <CardTitle>People with Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Document Owner */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {document.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{document.author.username}</p>
                    <p className="text-sm text-gray-600">
                      {document.author.email}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Owner</Badge>
              </div>

              {/* Shared Users */}
              {document.sharedWith && document.sharedWith.length > 0 ? (
                document.sharedWith.map((share: SharedUser) => (
                  <div
                    key={share._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {share.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{share.user.username}</p>
                        <p className="text-sm text-gray-600">
                          {share.user.email} • Shared{" "}
                          {formatDate(share.sharedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          share.permission === "edit" ? "default" : "secondary"
                        }
                      >
                        {share.permission === "edit" ? (
                          <>
                            <Edit className="h-3 w-3 mr-1" />
                            Can Edit
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            View Only
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRemoveAccess(
                            share.user._id,
                            share.user.username,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="mx-auto h-8 w-8 mb-2" />
                  <p>No users have been shared with yet.</p>
                  <p className="text-sm">
                    Use the form above to share this document.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
