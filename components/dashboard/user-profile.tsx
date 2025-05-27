'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Phone, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { fetchReviewsByUser } from '@/store/slices/reviewSlice';
import { updateUser } from '@/store/slices/userSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/translation-context';
import { ReviewList } from './review-list';

export function UserProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userReviews, loading: reviewsLoading, error: reviewsError } = useAppSelector((state) => state.review);
  
  const [formState, setFormState] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state with user data
  useEffect(() => {
    if (user) {
      setFormState({
        full_name: user.full_name,
        phone_number: user.phone_number,
        password: '',
        confirmPassword: '',
      });
      
      // Fetch user reviews
      dispatch(fetchReviewsByUser(user.user_id));
    }
  }, [dispatch, user]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t('error'),
        description: t('not_logged_in'),
        variant: 'destructive',
      });
      return;
    }
    
    // Validate passwords match if changing password
    if (formState.password && formState.password !== formState.confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwords_dont_match'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Only include fields that have changed
      const updateData: any = {};
      
      if (formState.full_name !== user.full_name) {
        updateData.full_name = formState.full_name;
      }
      
      if (formState.phone_number !== user.phone_number) {
        updateData.phone_number = formState.phone_number;
      }
      
      if (formState.password) {
        updateData.password = formState.password;
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await dispatch(updateUser({
          userId: user.user_id,
          data: updateData,
        })).unwrap();
        
        toast({
          title: t('success'),
          description: t('profile_updated'),
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('profile_update_failed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>{t('not_logged_in')}</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/sign-in')}
            >
              {t('sign_in')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const reviews = userReviews[user.user_id] || [];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('profile')}</h2>
        <p className="text-muted-foreground">{t('manage_your_account')}</p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('my_reviews')}</TabsTrigger>
          <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.full_name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="font-medium">{t('account_information')}</div>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{t('role')}: {t(user.role)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{t('email')}: {user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{t('phone')}: {user.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{t('member_since')}: {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="font-medium">{t('activity_summary')}</div>
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between">
                      <span>{t('reviews_submitted')}</span>
                      <span className="font-medium">{reviews.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setIsEditing(true)}>{t('edit_profile')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('my_reviews')}</CardTitle>
              <CardDescription>{t('reviews_you_submitted')}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {reviewsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reviewsError ? (
                <div className="text-center text-destructive">
                  <p>{reviewsError}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => dispatch(fetchReviewsByUser(user.user_id))}
                  >
                    {t('retry')}
                  </Button>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  <p>{t('no_reviews_yet')}</p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/dashboard/offices')}
                  >
                    {t('find_offices_to_review')}
                  </Button>
                </div>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('account_settings')}</CardTitle>
              <CardDescription>{t('update_your_profile')}</CardDescription>
            </CardHeader>
            <Separator />
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">{t('full_name')}</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formState.full_name}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">{t('phone_number')}</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formState.phone_number}
                    onChange={handleChange}
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
                
                {isEditing && (
                  <>
                    <Separator />
                    <div className="grid gap-2">
                      <Label htmlFor="password">{t('new_password')}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formState.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder={t('leave_blank_to_keep_current')}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formState.confirmPassword}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder={t('leave_blank_to_keep_current')}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormState({
                          full_name: user.full_name,
                          phone_number: user.phone_number,
                          password: '',
                          confirmPassword: '',
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? t('saving') : t('save_changes')}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    {t('edit_profile')}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
