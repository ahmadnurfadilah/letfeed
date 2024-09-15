import Account from "./account";
import Sidenav from "./sidenav";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await fetchQuery(
    api.users.viewer,
    {},
    { token: convexAuthNextjsToken() },
  );

  return (
    <ConvexClientProvider>
      <div className="min-h-screen flex bg-gray-50">
        <Sidenav user={user} />

        <div className="flex-1 overflow-x-auto">
          <div className="flex justify-between items-center bg-white border-b border-gray-200 py-4 px-4 md:px-6">
            <div className="flex items-center gap-4"></div>

            <div className="flex items-center space-x-6">
              <Account user={user} />
            </div>
          </div>

          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </ConvexClientProvider>
  );
}
