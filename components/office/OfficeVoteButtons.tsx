import React, { useEffect, useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  voteOnOffice,
  removeVoteFromOffice,
  fetchVotesByOffice,
} from "@/store/slices/officeVoteSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface OfficeVoteButtonsProps {
  officeId: string;
  className?: string;
  showCounts?: boolean;
  size?: "sm" | "md" | "lg";
}

const OfficeVoteButtons: React.FC<OfficeVoteButtonsProps> = ({
  officeId,
  className,
  showCounts = true,
  size = "md",
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { userVotes, votesByOffice, loading } = useAppSelector(
    (state) => state.officeVote
  );

  // Add state to track if a vote action is in progress
  const [isVoting, setIsVoting] = useState(false);
  // Add state to track the last vote action timestamp to prevent rapid clicks
  const [lastVoteTime, setLastVoteTime] = useState(0);

  const userVote = userVotes[officeId];
  const voteCounts = votesByOffice[officeId] || {
    upvotes: 0,
    downvotes: 0,
    total: 0,
    ratio: 0,
  };

  useEffect(() => {
    // Fetch votes for this office if not already loaded
    if (!votesByOffice[officeId] && !loading) {
      dispatch(fetchVotesByOffice(officeId));
    }
  }, [dispatch, officeId, votesByOffice, loading]);

  const handleVote = useCallback(
    (voteType: "upvote" | "downvote") => {
      console.log(`Vote button clicked: ${voteType} for office ${officeId}`);
      console.log("User state:", user);
      console.log("Current user vote:", userVote);

      // Prevent multiple rapid clicks (debounce)
      const now = Date.now();
      if (isVoting || now - lastVoteTime < 1000) {
        console.log(
          "Vote action in progress or too soon after last vote, ignoring"
        );
        return;
      }

      if (!isAuthenticated || !user) {
        console.log("User not logged in, cannot vote");
        toast({
          title: "Authentication Required",
          description: "Please sign in to vote on this office.",
          variant: "destructive",
        });
        return;
      }

      // Set voting state to prevent multiple requests
      setIsVoting(true);
      setLastVoteTime(now);

      try {
        // If user already voted with this type, remove the vote
        if (userVote && userVote.vote_type === voteType) {
          console.log(`Removing existing ${voteType} vote`);
          dispatch(removeVoteFromOffice(officeId))
            .unwrap()
            .then((result) => {
              console.log("Vote removed successfully:", result);
              // No need to fetch additional stats - Redux state is already updated
            })
            .catch((error) => {
              console.error("Error removing vote:", error);
            });
        } else {
          // Otherwise cast or change vote
          console.log(`Casting new ${voteType} vote`);
          dispatch(voteOnOffice({ officeId, voteType }))
            .unwrap()
            .then((result) => {
              console.log("Vote cast successfully:", result);
              // No need to fetch additional stats - Redux state is already updated
            })
            .catch((error) => {
              console.error("Error casting vote:", error);
            });
        }
      } catch (error) {
        console.error("Error during vote action:", error);
      } finally {
        // Reset voting state after a short delay to prevent rapid clicks
        setTimeout(() => {
          setIsVoting(false);
        }, 500);
      }
    },
    [dispatch, officeId, user, userVote, isVoting, lastVoteTime]
  );

  // Determine button sizes based on the size prop
  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-7 min-w-[2.5rem] px-2";
      case "lg":
        return "h-10 min-w-[3.5rem] px-4";
      default:
        return "h-9 min-w-[3rem] px-3";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  // If user is not authenticated, show a simplified version with counts only
  if (!isAuthenticated || !user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(buttonSize, "flex items-center")}
                onClick={() => handleVote("upvote")}
              >
                <ThumbsUp className={iconSize} />
                {showCounts && (
                  <Badge variant="secondary" className="ml-2">
                    {voteCounts.upvotes}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign in to upvote this office</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(buttonSize, "flex items-center")}
                onClick={() => handleVote("downvote")}
              >
                <ThumbsDown className={iconSize} />
                {showCounts && (
                  <Badge variant="secondary" className="ml-2">
                    {voteCounts.downvotes}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign in to downvote this office</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Regular version for authenticated users
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={userVote?.vote_type === "upvote" ? "default" : "outline"}
              className={cn(
                buttonSize,
                "flex items-center",
                userVote?.vote_type === "upvote"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              )}
              onClick={() => handleVote("upvote")}
              disabled={loading || isVoting}
            >
              <ThumbsUp className={iconSize} />
              {showCounts && (
                <Badge variant="secondary" className="ml-2">
                  {voteCounts.upvotes}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {userVote?.vote_type === "upvote"
                ? "Remove upvote"
                : "Upvote this office"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={
                userVote?.vote_type === "downvote" ? "default" : "outline"
              }
              className={cn(
                buttonSize,
                "flex items-center",
                userVote?.vote_type === "downvote"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              )}
              onClick={() => handleVote("downvote")}
              disabled={loading || isVoting}
            >
              <ThumbsDown className={iconSize} />
              {showCounts && (
                <Badge variant="secondary" className="ml-2">
                  {voteCounts.downvotes}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {userVote?.vote_type === "downvote"
                ? "Remove downvote"
                : "Downvote this office"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {userVote && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-7 w-7",
                  buttonSize,
                  "flex items-center justify-center"
                )}
                onClick={() => {
                  if (!isVoting) {
                    setIsVoting(true);
                    dispatch(removeVoteFromOffice(officeId))
                      .unwrap()
                      .then((result) => {
                        console.log("Vote removed successfully:", result);
                        // No need to fetch additional stats - Redux state is already updated
                      })
                      .catch((error) => {
                        console.error("Error removing vote:", error);
                        toast({
                          title: "Error",
                          description:
                            "Failed to remove your vote. Please try again.",
                          variant: "destructive",
                        });
                      })
                      .finally(() => {
                        setTimeout(() => setIsVoting(false), 500);
                      });
                  }
                }}
                disabled={loading || isVoting}
              >
                <X className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove your vote</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default OfficeVoteButtons;
