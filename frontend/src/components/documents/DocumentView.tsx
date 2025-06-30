import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Edit,
  Globe,
  History,
  Lock,
  Trash2,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { documentsAPI } from "../../lib/api";
import type { Document } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  useEffect(() => {
    fetchDocument();
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

  const handleDelete = async () => {
    if (
      !document ||
      !window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await documentsAPI.delete(document._id);
      toast.success("Document deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleToggleVisibility = async () => {
    if (!document) return;

    const newVisibility =
      document.visibility === "public" ? "private" : "public";

    try {
      setIsUpdatingVisibility(true);
      await documentsAPI.updateVisibility(document._id, newVisibility);

      setDocument({
        ...document,
        visibility: newVisibility,
      });

      toast.success(`Document is now ${newVisibility}`);
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update document visibility");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const canEdit = () => {
    if (!document || !user) return false;

    return (
      document.author._id === user._id ||
      document.sharedWith?.some(
        (share: any) =>
          share.user._id === user._id && share.permission === "edit",
      )
    );
  };

  const canDelete = () => {
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
          <Button onClick={() => navigate("/")}>Go back</Button>
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
            The document you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button onClick={() => navigate("/")}>Go back</Button>
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                  className="flex items-center space-x-1"
                >
                  {document.visibility === "public" ? (
                    <>
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </>
                  )}
                </Button>
              )}

              {!canEdit() && (
                <Badge
                  variant={
                    document.visibility === "public" ? "default" : "secondary"
                  }
                >
                  {document.visibility === "public" ? (
                    <>
                      <Globe className="mr-1 h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="mr-1 h-3 w-3" />
                      Private
                    </>
                  )}
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/documents/${document._id}/versions`)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>

              {canEdit() && (
                <>
                  <Link to={`/documents/${document._id}/edit`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </>
              )}

              {canDelete() && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <CardTitle className="text-3xl font-bold">
              {document.title}
            </CardTitle>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>By {document.author?.username || "Unknown"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(document.createdAt)}</span>
              </div>
              {document.updatedAt !== document.createdAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {formatDate(document.updatedAt)}
                    {document.lastModifiedBy &&
                      document.lastModifiedBy._id !== document.author._id && (
                        <span> by {document.lastModifiedBy.username}</span>
                      )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />

          {!document.content && (
            <div className="text-center py-12 text-gray-500">
              <p>This document is empty.</p>
              {canEdit() && (
                <Link to={`/documents/${document._id}/edit`}>
                  <Button className="mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Start editing
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
