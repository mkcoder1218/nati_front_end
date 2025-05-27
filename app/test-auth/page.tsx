"use client";

import { TestAuth } from "@/components/test-auth";

export default function TestAuthPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      <TestAuth />
    </div>
  );
}
