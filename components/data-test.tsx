'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { fetchAllOffices } from '@/store/slices/officeSlice';
import { fetchAllServiceGuides } from '@/store/slices/serviceGuideSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Building2, FileText } from 'lucide-react';

export function DataTest() {
  const dispatch = useAppDispatch();
  const { offices, loading: officesLoading, error: officesError } = useAppSelector((state) => state.office);
  const { guides, loading: guidesLoading, error: guidesError } = useAppSelector((state) => state.serviceGuide);
  
  const [activeTab, setActiveTab] = useState('offices');

  const fetchOffices = async () => {
    try {
      await dispatch(fetchAllOffices()).unwrap();
    } catch (error) {
      console.error('Failed to fetch offices:', error);
    }
  };

  const fetchGuides = async () => {
    try {
      await dispatch(fetchAllServiceGuides()).unwrap();
    } catch (error) {
      console.error('Failed to fetch service guides:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Data Fetching Test</CardTitle>
        <CardDescription>Test fetching data from the backend API</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offices">
              <Building2 className="mr-2 h-4 w-4" />
              Offices
            </TabsTrigger>
            <TabsTrigger value="guides">
              <FileText className="mr-2 h-4 w-4" />
              Service Guides
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="offices" className="mt-4">
            {officesError && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {officesError}
                </AlertDescription>
              </Alert>
            )}
            
            {offices.length > 0 && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully fetched {offices.length} offices.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={fetchOffices} 
              disabled={officesLoading}
              className="w-full mb-4"
            >
              {officesLoading ? 'Loading Offices...' : 'Fetch Offices'}
            </Button>
            
            {offices.length > 0 && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Address</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offices.map((office) => (
                      <tr key={office.office_id} className="border-t">
                        <td className="px-4 py-2">{office.name}</td>
                        <td className="px-4 py-2">{office.address}</td>
                        <td className="px-4 py-2">{office.phone_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="guides" className="mt-4">
            {guidesError && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {guidesError}
                </AlertDescription>
              </Alert>
            )}
            
            {guides.length > 0 && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully fetched {guides.length} service guides.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={fetchGuides} 
              disabled={guidesLoading}
              className="w-full mb-4"
            >
              {guidesLoading ? 'Loading Guides...' : 'Fetch Service Guides'}
            </Button>
            
            {guides.length > 0 && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Office</th>
                      <th className="px-4 py-2 text-left">Steps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guides.map((guide) => (
                      <tr key={guide.guide_id} className="border-t">
                        <td className="px-4 py-2">{guide.title}</td>
                        <td className="px-4 py-2">{guide.office_name}</td>
                        <td className="px-4 py-2">{guide.steps?.length || 0} steps</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
