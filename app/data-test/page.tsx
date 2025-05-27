import { DataTest } from '@/components/data-test';
import { TestNavigation } from '@/components/test-navigation';

export default function DataTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Data Fetching Test</h1>
      <TestNavigation />
      <DataTest />
    </div>
  );
}
