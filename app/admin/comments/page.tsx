"use client";

import { useEffect, useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import { Check, MessageSquare, Loader2, Search, X, Reply } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchPendingComments,
  fetchReviewedComments,
  updateCommentStatus,
} from "@/store/slices/adminSlice";
import { addAdminResponse } from "@/store/slices/commentSlice";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";

export default function ModerateCommentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { pendingComments, reviewedComments, loading, error } = useAppSelector(
    (state) => state.admin
  );
  const { submitting } = useAppSelector((state) => state.comment);
  const [searchQuery, setSearchQuery] = useState("");
  const [responseText, setResponseText] = useState<{ [key: string]: string }>(
    {}
  );
  const [showResponseForm, setShowResponseForm] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    dispatch(fetchPendingComments());
    dispatch(fetchReviewedComments());
  }, [dispatch]);

  const handleApprove = async (commentId: string) => {
    try {
      await dispatch(
        updateCommentStatus({
          commentId,
          status: "approved",
        })
      ).unwrap();

      toast({
        title: t("success") || "Success",
        description: t("comment_approved") || "Comment has been approved",
      });
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("action_failed") || "Failed to approve comment",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      await dispatch(
        updateCommentStatus({
          commentId,
          status: "rejected",
        })
      ).unwrap();

      toast({
        title: t("success") || "Success",
        description: t("comment_rejected") || "Comment has been rejected",
      });
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("action_failed") || "Failed to reject comment",
        variant: "destructive",
      });
    }
  };

  const handleAddResponse = async (commentId: string) => {
    const response = responseText[commentId];
    if (!response || !response.trim()) {
      toast({
        title: t("error") || "Error",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        addAdminResponse({ commentId, response: response.trim() })
      ).unwrap();

      // Clear the response text and hide the form
      setResponseText((prev) => ({ ...prev, [commentId]: "" }));
      setShowResponseForm((prev) => ({ ...prev, [commentId]: false }));

      toast({
        title: t("success") || "Success",
        description: "Response added successfully",
      });

      // Refresh the comments to get updated data with replies
      dispatch(fetchPendingComments());
      dispatch(fetchReviewedComments());
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: "Failed to add response",
        variant: "destructive",
      });
    }
  };

  const toggleResponseForm = (commentId: string) => {
    setShowResponseForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Filter comments based on search query
  const filteredComments = (comments: any[]) => {
    if (!searchQuery) return comments;
    return comments.filter(
      (comment) =>
        comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("moderate_comments") || "Feedback Moderation"}
          </h2>
          <p className="text-muted-foreground">
            {t("moderate_comments_description") ||
              "Review and manage user feedback submissions"}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(fetchPendingComments());
              dispatch(fetchReviewedComments());
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
              </svg>
            )}
            Refresh
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center px-3 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>
                <strong>{pendingComments.length}</strong> pending
              </span>
            </div>
            <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
              <Check className="h-4 w-4 mr-2" />
              <span>
                <strong>
                  {
                    reviewedComments.filter((c) => c.status === "approved")
                      .length
                  }
                </strong>{" "}
                approved
              </span>
            </div>
            <div className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md border border-red-200">
              <X className="h-4 w-4 mr-2" />
              <span>
                <strong>
                  {
                    reviewedComments.filter((c) => c.status === "rejected")
                      .length
                  }
                </strong>{" "}
                rejected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                t("search_comments") || "Search by content or user..."
              }
              className="w-full pl-10 py-5 border-muted bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading feedback data...
          </p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
                <X className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  dispatch(fetchPendingComments());
                  dispatch(fetchReviewedComments());
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                {t("retry") || "Retry Loading"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <div className="border-b mb-6">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
              <TabsTrigger
                value="pending"
                className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 h-auto"
              >
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t("pending_comments") || "Pending Feedback"}
                  <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                    {pendingComments.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="reviewed"
                className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 h-auto"
              >
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  {t("reviewed_comments") || "Processed Feedback"}
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {reviewedComments.length}
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="pending" className="space-y-5">
            {filteredComments(pendingComments).map((comment) => (
              <Card
                key={comment.comment_id}
                className="overflow-hidden border-muted bg-card hover:border-muted-foreground/20 transition-all duration-200"
              >
                <div className="border-l-4 border-amber-400 pl-0">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm font-bold">
                            {comment.user_name
                              ? comment.user_name.charAt(0).toUpperCase()
                              : "A"}
                          </div>
                          {comment.user_name || t("anonymous") || "Anonymous"}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <HydratedDate dateString={comment.created_at} />
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {t("pending_review") || "Awaiting Review"}
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
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          User Replies:
                        </h4>
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.reply_id}
                            className="bg-green-50 border border-green-200 p-3 rounded-md ml-4"
                          >
                            <div className="flex items-center mb-2">
                              <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-800">
                                {reply.user_name || "User"} replied
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

                    {/* Response Form */}
                    {showResponseForm[comment.comment_id] && (
                      <div className="mb-4 space-y-2">
                        <Textarea
                          placeholder="Write your response to the user..."
                          value={responseText[comment.comment_id] || ""}
                          onChange={(e) =>
                            setResponseText((prev) => ({
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
                            onClick={() =>
                              toggleResponseForm(comment.comment_id)
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAddResponse(comment.comment_id)
                            }
                            disabled={submitting}
                          >
                            {submitting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Reply className="mr-2 h-4 w-4" />
                            )}
                            Send Response
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {!comment.admin_response && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            onClick={() =>
                              toggleResponseForm(comment.comment_id)
                            }
                          >
                            <Reply className="mr-1.5 h-4 w-4" />
                            Respond
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleReject(comment.comment_id)}
                        >
                          <X className="mr-1.5 h-4 w-4" />
                          {t("reject") || "Reject"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                          onClick={() => handleApprove(comment.comment_id)}
                        >
                          <Check className="mr-1.5 h-4 w-4" />
                          {t("approve") || "Approve"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
            {filteredComments(pendingComments).length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">
                  {t("no_pending_comments") || "No Pending Feedback"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-1">
                  {t("all_comments_reviewed") ||
                    "All feedback submissions have been reviewed. New submissions will appear here."}
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="reviewed" className="space-y-5">
            {filteredComments(reviewedComments).map((comment) => (
              <Card
                key={comment.comment_id}
                className={`overflow-hidden border-muted bg-card hover:border-muted-foreground/20 transition-all duration-200 ${
                  comment.status === "approved"
                    ? "border-l-4 border-green-400 pl-0"
                    : "border-l-4 border-red-400 pl-0"
                }`}
              >
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm font-bold">
                          {comment.user_name
                            ? comment.user_name.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        {comment.user_name || t("anonymous") || "Anonymous"}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <HydratedDate dateString={comment.created_at} />
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium flex items-center ${
                          comment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {comment.status === "approved" ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : (
                          <X className="mr-1 h-3 w-3" />
                        )}
                        {comment.status === "approved"
                          ? t("approved") || "Approved"
                          : t("rejected") || "Rejected"}
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
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        User Replies:
                      </h4>
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.reply_id}
                          className="bg-green-50 border border-green-200 p-3 rounded-md ml-4"
                        >
                          <div className="flex items-center mb-2">
                            <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">
                              {reply.user_name || "User"} replied
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

                  {/* Response Form for Reviewed Comments */}
                  {showResponseForm[comment.comment_id] && (
                    <div className="mb-4 space-y-2">
                      <Textarea
                        placeholder="Write your response to the user..."
                        value={responseText[comment.comment_id] || ""}
                        onChange={(e) =>
                          setResponseText((prev) => ({
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
                          onClick={() => toggleResponseForm(comment.comment_id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddResponse(comment.comment_id)}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Reply className="mr-2 h-4 w-4" />
                          )}
                          Send Response
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Response Button for Reviewed Comments */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      onClick={() => toggleResponseForm(comment.comment_id)}
                    >
                      <Reply className="mr-1.5 h-4 w-4" />
                      {comment.admin_response
                        ? "Add Another Response"
                        : "Respond"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {reviewedComments.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">
                  {t("no_reviewed_comments") || "No Processed Feedback"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-1">
                  {t("no_reviews_yet") ||
                    "You haven't processed any feedback submissions yet. Approved or rejected items will appear here."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
