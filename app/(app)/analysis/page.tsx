import Chat from "./chat";

export default async function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-center mb-4">
        <h1 className="font-bold text-xl">AI Analysis</h1>
      </div>

      <div className="relative">
        <Chat />
      </div>
    </>
  );
}
