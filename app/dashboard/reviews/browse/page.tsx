"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchPublicReviews } from "@/store/slices/reviewSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/translation-context";
import { ReviewList } from "@/components/dashboard/review-list";
import { MessageSquare, Star, TrendingUp, Clock } from "lucide-react";

export default function BrowseReviewsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { publicReviews, loading, error } = useAppSelector((state) => state.review);
  const { user } = useAppSelector((state) => state.auth);

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (user) {
      dispatch(fetchPublicReviews({ limit, sortBy, sortOrder }));
    }
  }, [dispatch, user, limit, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleOrderChange = (newSortOrder: string) => {
    setSortOrder(newSortOrder);
  };

  const handleLoadMore = () => {
    setLimit(prev => prev + 20);
  };

  const getFilteredReviews = (filterType: string) => {
    switch (filterType) {
      case "recent":
        return [...publicReviews].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "highest":
        return [...publicReviews].sort((a, b) => b.rating - a.rating);
      case "lowest":
        return [...publicReviews].sort((a, b) => a.rating - b.rating);
      default:
        return publicReviews;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("authentication_required")}
              </h3>
              <p className="text-muted-foreground">
                {t("please_login_to_browse_reviews")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("browse_reviews")}</h1>
          <p className="text-muted-foreground">
            {t("discover_reviews_from_other_users")}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("sort_by")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">{t("date")}</SelectItem>
              <SelectItem value="rating">{t("rating")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={handleOrderChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("order")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t("descending")}</SelectItem>
              <SelectItem value="asc">{t("ascending")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("all_reviews")}
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("recent")}
          </TabsTrigger>
          <TabsTrigger value="highest" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t("highest_rated")}
          </TabsTrigger>
          <TabsTrigger value="lowest" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("lowest_rated")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-destructive">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => dispatch(fetchPublicReviews({ limit, sortBy, sortOrder }))}
                  >
                    {t("retry")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : publicReviews.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    {t("no_reviews_found")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("no_public_reviews_available")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <ReviewList reviews={publicReviews} />
              {publicReviews.length >= limit && (
                <div className="flex justify-center">
                  <Button onClick={handleLoadMore} variant="outline">
                    {t("load_more")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <ReviewList reviews={getFilteredReviews("recent")} />
        </TabsContent>

        <TabsContent value="highest" className="space-y-4">
          <ReviewList reviews={getFilteredReviews("highest")} />
        </TabsContent>

        <TabsContent value="lowest" className="space-y-4">
          <ReviewList reviews={getFilteredReviews("lowest")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
