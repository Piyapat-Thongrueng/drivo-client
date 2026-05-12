"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/Button";

export function LogoutButton(): React.JSX.Element {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="md"
      disabled={isLoading}
      onClick={handleLogout}
    >
      {isLoading ? "Logging out…" : "Logout"}
    </Button>
  );
}
