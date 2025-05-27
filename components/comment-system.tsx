"use client";

import { useState } from "react";
import {
  Flag,
  MessageSquare,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/translation-context";

interface Comment {
  id: number | string;
  user: string;
  userRole?: string;
  rating?: number;
  date: string;
  comment: string;
  upvotes: number;
  downvotes: number;
  flagged?: boolean;
  replies?: Comment[];
  isOfficial?: boolean;
}

interface CommentProps {
  comment: Comment;
  onVote: (commentId: number | string, voteType: "upvote" | "downvote") => void;
  onFlag: (commentId: number | string) => void;
  onReply: (commentId: number | string, replyText: string) => void;
  level?: number;
  maxLevel?: number;
}

export function CommentItem({
  comment,
  onVote,
  onFlag,
  onReply,
  level = 0,
  maxLevel = 3,
}: CommentProps) {
  const { t } = useTranslation();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        comment.isOfficial ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground ${
              comment.isOfficial ? "bg-primary" : "bg-muted-foreground"
            }`}
          >
            {comment.user.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{comment.user}</p>
              {comment.userRole && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {comment.userRole}
                </span>
              )}
              {comment.isOfficial && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {t("official")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{comment.date}</p>
          </div>
        </div>
        {comment.rating && (
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < comment.rating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm">{comment.comment}</p>
      <div className="mt-3 flex items-center gap-4">
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onVote(comment.id, "upvote")}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>{comment.upvotes}</span>
        </button>
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onVote(comment.id, "downvote")}
        >
          <ThumbsDown className="h-3 w-3" />
          <span>{comment.downvotes}</span>
        </button>
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsReplying(!isReplying)}
        >
          <MessageSquare className="h-3 w-3" />
          <span>{t("reply")}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFlag(comment.id)}
              className="text-destructive"
            >
              <Flag className="mr-2 h-4 w-4" />
              <span>{t("flag_comment")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {comment.flagged && (
          <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            {t("flagged")}
          </span>
        )}
      </div>

      {isReplying && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder={t("write_reply")}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReplying(false)}
            >
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleReplySubmit}>
              {t("submit_reply")}
            </Button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          <button
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies
              ? t("hide_replies")
              : t("show_replies", { count: comment.replies.length })}
          </button>
          {showReplies && level < maxLevel && (
            <div className="mt-3 space-y-3 border-l-2 border-muted pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onVote={onVote}
                  onFlag={onFlag}
                  onReply={onReply}
                  level={level + 1}
                  maxLevel={maxLevel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CommentList({
  comments,
  onVote,
  onFlag,
  onReply,
}: {
  comments: Comment[];
  onVote: (commentId: number | string, voteType: "upvote" | "downvote") => void;
  onFlag: (commentId: number | string) => void;
  onReply: (commentId: number | string, replyText: string) => void;
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onVote={onVote}
          onFlag={onFlag}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
