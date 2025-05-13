import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function UnauthorizedPage() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <ShieldX className="h-24 w-24 text-red-500" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-gray-600">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="mt-8 space-y-4">
          <Button asChild variant="default" className="w-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
