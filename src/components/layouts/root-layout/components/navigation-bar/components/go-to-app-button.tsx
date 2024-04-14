import { Button } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * A button that is displayed in the navigation bar that allows the user to go to the Atlas app and access the main functionality.
 * Only displayed when the user is not on a route that has "/app" as a prefix.
 */
export const GoToAppButton = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/app")) {
    return null;
  }

  return (
    <Link href="/app/my-legal-documents">
      <Button type="primary">Go to App</Button>
    </Link>
  );
};
