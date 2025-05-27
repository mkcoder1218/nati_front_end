"use client";

import { useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import { 
  Check, 
  Flag, 
  MessageSquare, 
  Star, 
  Trash2, 
  X, 
  Reply,
  AlertTriangle,
  User
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/translation-context";

interface Review {
  review_id: string;
  user_id?: string;
  office_id: string;
  rating: number;
  comment?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  status: "pending" | "approved" | "flagged" | "rejected" | "resolved";
  user_name?: string;
  office_name?: string;
  replies?: any[];
}

interface ReviewCardProps {
  review: Review;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onFlag: (reviewId: string) => void;
  onAddResponse: (reviewId: string) => void;
  onToggleResponseForm: (reviewId: string) => void;
  showResponseForm: Record<string, boolean>;
  responseText: Record<string, string>;
  setResponseText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submitting: boolean;
}

export function ReviewCard({
  review,
  onApprove,
  onReject,
  onFlag,
  onAddResponse,
  onToggleResponseForm,
  showResponseForm,
  responseText,
  setResponseText,
  submitting
}: ReviewCardProps) {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "flagged":
        return <Badge variant="destructive" className="bg-amber-100 text-amber-800">Flagged</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "A"; // Anonymous
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card className={`${review.status === 'flagged' ? 'border-amber-300 bg-amber-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {review.is_anonymous ? <User className="h-4 w-4" /> : getUserInitials(review.user_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">
                {review.is_anonymous ? "Anonymous User" : (review.user_name || "Unknown User")}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Reviewed {review.office_name || "Unknown Office"}</span>
                <span>•</span>
                <HydratedDate dateString={review.created_at} />
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(review.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {getRatingStars(review.rating)}
          </div>
          <span className="text-sm font-medium">{review.rating}/5</span>
        </div>

        {/* Comment */}
        {review.comment && (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">{review.comment}</p>
          </div>
        )}

        {/* Replies */}
        {review.replies && review.replies.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Reply className="h-4 w-4" />
                Responses ({review.replies.length})
              </h4>
              {review.replies.map((reply, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{reply.user_name || "Admin"}</span>
                    <span>•</span>
                    <HydratedDate dateString={reply.created_at} />
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Form */}
        {showResponseForm[review.review_id] && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Admin Response</label>
              <Textarea
                placeholder="Write your response to this review..."
                value={responseText[review.review_id] || ""}
                onChange={(e) =>
                  setResponseText(prev => ({
                    ...prev,
                    [review.review_id]: e.target.value,
                  }))
                }
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleResponseForm(review.review_id)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAddResponse(review.review_id)}
                  disabled={submitting || !responseText[review.review_id]?.trim()}
                >
                  <Reply className="mr-2 h-4 w-4" />
                  Send Response
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleResponseForm(review.review_id)}
            disabled={submitting}
          >
            <Reply className="mr-1 h-4 w-4" />
            Respond
          </Button>
        </div>
        
        <div className="flex gap-2">
          {review.status !== "approved" && (
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
              onClick={() => onApprove(review.review_id)}
              disabled={submitting}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
          )}
          
          {review.status !== "flagged" && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
              onClick={() => onFlag(review.review_id)}
              disabled={submitting}
            >
              <Flag className="mr-1 h-4 w-4" />
              Flag
            </Button>
          )}
          
          {review.status !== "rejected" && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onReject(review.review_id)}
              disabled={submitting}
            >
              <X className="mr-1 h-4 w-4" />
              Reject
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
