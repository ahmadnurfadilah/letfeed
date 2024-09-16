import ConvexClientProvider from "@/components/ConvexClientProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
