import { AuthTest } from "@/components/auth-test";
import { TestNavigation } from "@/components/test-navigation";

export default function AuthTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Authentication Test
      </h1>
      <TestNavigation />
      <AuthTest />
    </div>
  );
}
