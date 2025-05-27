"use client";

import { useEffect, useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import {
  MessageSquare,
  Reply,
  Clock,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchUserComments,
  addCommentReply,
} from "@/store/slices/commentSlice";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";

export default function MyFeedbackPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { userComments, loading, error, submitting } = useAppSelector(
    (state) => state.comment
  );
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    dispatch(fetchUserComments());
  }, [dispatch]);

  const handleAddReply = async (commentId: string) => {
    const content = replyText[commentId];
    if (!content || !content.trim()) {
      toast({
        title: t("error") || "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        addCommentReply({ commentId, content: content.trim() })
      ).unwrap();

      // Clear the reply text and hide the form
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setShowReplyForm((prev) => ({ ...prev, [commentId]: false }));

      toast({
        title: t("success") || "Success",
        description: "Reply added successfully",
      });
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  const toggleReplyForm = (commentId: string) => {
    setShowReplyForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return t("approved") || "Approved";
      case "rejected":
        return t("rejected") || "Rejected";
      default:
        return t("pending_review") || "Pending Review";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading feedback</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Feedback</h2>
        <p className="text-muted-foreground">
          View your submitted feedback and admin responses
        </p>
      </div>

      {userComments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No Feedback Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mt-1">
            You haven't submitted any feedback yet. Use the feedback portal in
            the sidebar to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userComments.map((comment) => (
            <Card key={comment.comment_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                      Your Feedback
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <HydratedDate dateString={comment.created_at} />
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium flex items-center border ${getStatusColor(
                        comment.status
                      )}`}
                    >
                      {getStatusIcon(comment.status)}
                      <span className="ml-1">
                        {getStatusText(comment.status)}
                      </span>
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="bg-muted/50 p-3 rounded-md mb-4">
                  <p className="text-sm">{comment.content}</p>
                </div>

                {/* Admin Response Section */}
                {comment.admin_response && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4">
                    <div className="flex items-center mb-2">
                      <Reply className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">
                        Admin Response{" "}
                        {comment.admin_name && `by ${comment.admin_name}`}
                      </span>
                      {comment.admin_response_at && (
                        <span className="text-xs text-blue-600 ml-auto">
                          <HydratedDate
                            dateString={comment.admin_response_at}
                          />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-700">
                      {comment.admin_response}
                    </p>
                  </div>
                )}

                {/* User Replies Section */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.reply_id}
                        className="bg-green-50 border border-green-200 p-3 rounded-md ml-4"
                      >
                        <div className="flex items-center mb-2">
                          <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Your Reply
                          </span>
                          <span className="text-xs text-green-600 ml-auto">
                            <HydratedDate dateString={reply.created_at} />
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {comment.admin_response &&
                  showReplyForm[comment.comment_id] && (
                    <div className="mb-4 space-y-2">
                      <Textarea
                        placeholder="Write your reply to the admin response..."
                        value={replyText[comment.comment_id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [comment.comment_id]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReplyForm(comment.comment_id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(comment.comment_id)}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}

                {/* Reply Button */}
                {comment.admin_response &&
                  !showReplyForm[comment.comment_id] && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        onClick={() => toggleReplyForm(comment.comment_id)}
                      >
                        <Reply className="mr-1.5 h-4 w-4" />
                        Reply to Admin
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
