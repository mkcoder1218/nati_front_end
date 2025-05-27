"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Lock,
  Database,
  Home,
  BarChart2,
  Building2,
} from "lucide-react";

export function TestNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={isActive("/") ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>

          <Button
            variant={isActive("/api-test") ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/api-test">
              <Activity className="mr-2 h-4 w-4" />
              API Test
            </Link>
          </Button>

          <Button
            variant={isActive("/auth-test") ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/auth-test">
              <Lock className="mr-2 h-4 w-4" />
              Auth Test
            </Link>
          </Button>

          <Button
            variant={isActive("/data-test") ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/data-test">
              <Database className="mr-2 h-4 w-4" />
              Data Test
            </Link>
          </Button>

          <Button
            variant={isActive("/government-test") ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/government-test">
              <BarChart2 className="mr-2 h-4 w-4" />
              Government Test
            </Link>
          </Button>

          <Button
            variant={isActive("/admin-test") ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/admin-test">
              <Building2 className="mr-2 h-4 w-4" />
              Admin Test
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
