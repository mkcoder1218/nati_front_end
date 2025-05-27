'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { getSentimentStats } from '@/store/slices/sentimentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/translation-context';

export function Statistics() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.sentiment);
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch sentiment stats on component mount
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'official')) {
      dispatch(getSentimentStats());
    }
  }, [dispatch, user]);
  
  // Only show statistics for admin and official users
  if (!user || (user.role !== 'admin' && user.role !== 'official')) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>{t('statistics_restricted')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for charts
  const sentimentData = [
    { name: t('positive'), value: stats?.sentimentCounts?.positive || 0 },
    { name: t('neutral'), value: stats?.sentimentCounts?.neutral || 0 },
    { name: t('negative'), value: stats?.sentimentCounts?.negative || 0 },
  ];
  
  const categoryData = Object.entries(stats?.categoryCounts || {}).map(([category, count]) => ({
    name: category,
    value: count as number,
  }));
  
  const languageData = Object.entries(stats?.languageCounts || {}).map(([language, count]) => ({
    name: language === 'amharic' ? t('amharic') : t('english'),
    value: count as number,
  }));
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('statistics')}</h2>
        <p className="text-muted-foreground">{t('feedback_statistics')}</p>
      </div>
      
      <Tabs defaultValue="sentiment">
        <TabsList>
          <TabsTrigger value="sentiment">{t('sentiment')}</TabsTrigger>
          <TabsTrigger value="category">{t('category')}</TabsTrigger>
          <TabsTrigger value="language">{t('language')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sentiment_distribution')}</CardTitle>
              <CardDescription>{t('sentiment_distribution_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('feedback_by_category')}</CardTitle>
              <CardDescription>{t('feedback_by_category_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('feedback_by_language')}</CardTitle>
              <CardDescription>{t('feedback_by_language_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
