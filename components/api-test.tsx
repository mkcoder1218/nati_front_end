'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

export function ApiTest() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testApiConnection = async () => {
    setApiStatus('loading');
    setErrorMessage(null);
    
    try {
      const response = await api.get('/test');
      console.log('API test response:', response.data);
      setApiResponse(response.data);
      setApiStatus('success');
    } catch (error: any) {
      console.error('API test error:', error);
      setApiStatus('error');
      setErrorMessage(error.message || 'Failed to connect to API');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>Test the connection to the backend API</CardDescription>
      </CardHeader>
      <CardContent>
        {apiStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Successfully connected to the backend API.
            </AlertDescription>
          </Alert>
        )}
        
        {apiStatus === 'error' && (
          <Alert className="bg-red-50 border-red-200 mb-4">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              {errorMessage || 'Failed to connect to the backend API.'}
            </AlertDescription>
          </Alert>
        )}
        
        {apiResponse && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium mb-2">API Response:</h4>
            <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={testApiConnection} 
          disabled={apiStatus === 'loading'}
          className="w-full"
        >
          {apiStatus === 'loading' ? 'Testing Connection...' : 'Test API Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
