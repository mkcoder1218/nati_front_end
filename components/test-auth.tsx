"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useAppSelector } from "@/hooks/use-redux";

export function TestAuth() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAuthJWT = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/test/auth-jwt');
      console.log('Auth JWT test response:', response.data);
      setTestResult(response.data);
    } catch (error: any) {
      console.error('Auth JWT test error:', error);
      setError(error.message || 'Failed to test auth JWT');
    } finally {
      setLoading(false);
    }
  };

  const testOfficeVote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use a test office ID
      const officeId = '2f30f4b6-99d8-42dc-96ce-e52bd71da5d9';
      const response = await api.post(`/test/office-vote/${officeId}`, {
        vote_type: 'upvote'
      });
      console.log('Office vote test response:', response.data);
      setTestResult(response.data);
    } catch (error: any) {
      console.error('Office vote test error:', error);
      setError(error.message || 'Failed to test office vote');
    } finally {
      setLoading(false);
    }
  };

  const testRealOfficeVote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use a test office ID
      const officeId = '2f30f4b6-99d8-42dc-96ce-e52bd71da5d9';
      const response = await api.post(`/office-votes/office/${officeId}`, {
        vote_type: 'upvote'
      });
      console.log('Real office vote response:', response.data);
      setTestResult(response.data);
    } catch (error: any) {
      console.error('Real office vote error:', error);
      setError(error.message || 'Failed to test real office vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2">Authentication Status:</p>
          <pre className="bg-muted p-2 rounded text-sm">
            {JSON.stringify({ isAuthenticated, user }, null, 2)}
          </pre>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={testAuthJWT} disabled={loading}>
            Test Auth JWT
          </Button>
          <Button onClick={testOfficeVote} disabled={loading}>
            Test Office Vote
          </Button>
          <Button onClick={testRealOfficeVote} disabled={loading}>
            Test Real Office Vote
          </Button>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-2 rounded">
            {error}
          </div>
        )}
        
        {testResult && (
          <div>
            <p className="mb-2">Test Result:</p>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
