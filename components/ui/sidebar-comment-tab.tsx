"use client";

import * as React from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { submitComment } from "@/store/slices/commentSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface SidebarCommentTabProps {
  className?: string;
}

export const SidebarCommentTab = React.forwardRef<
  HTMLDivElement,
  SidebarCommentTabProps
>(({ className }, ref) => {
  const { user } = useAppSelector((state) => state.auth);
  const { submitting, submitError } = useAppSelector((state) => state.comment);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const [commentText, setCommentText] = React.useState("");

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(submitComment({ content: commentText })).unwrap();
      setCommentText("");
      toast({
        title: "Success",
        description: "Your feedback has been submitted for moderation",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: submitError || "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  // Navigate to admin comments page
  const navigateToCommentsAdmin = () => {
    router.push("/admin/comments");
  };

  // Don't show anything if user is not logged in or is an admin
  if (!user?.user_id || user.role === "admin") {
    return null;
  }

  return (
    <div
      ref={ref}
      data-sidebar="comment-tab"
      className="p-3 space-y-3 bg-card rounded-md border shadow-sm"
    >
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Feedback Portal</span>
        </div>
        {user.role === "admin" && (
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToCommentsAdmin}
            className="text-xs h-7 px-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            <MessageSquare className="mr-1 h-3 w-3" />
            Moderate
          </Button>
        )}
      </div>

      {/* Comment input form */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="feedback-input"
            className="text-xs font-medium text-muted-foreground"
          >
            Share your thoughts with us
          </label>
          <Textarea
            id="feedback-input"
            placeholder="What would you like to tell us about our services?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[120px] resize-none border-muted focus-visible:ring-primary/50"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !commentText.trim()}
            className="w-full bg-primary hover:bg-primary/90"
            size="sm"
          >
            {submitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </span>
            )}
          </Button>

          <div className="flex items-start text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
            <div className="mr-1.5 mt-0.5">
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
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <p>
              Your feedback is valuable to us. All submissions are reviewed by
              administrators before being processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

SidebarCommentTab.displayName = "SidebarCommentTab";
