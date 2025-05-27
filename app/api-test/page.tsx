import { ApiTest } from "@/components/api-test";
import { TestNavigation } from "@/components/test-navigation";

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        API Integration Test
      </h1>
      <TestNavigation />
      <ApiTest />
    </div>
  );
}
