import Link from "next/link";

export default function Loading() {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="w-full flex flex-col max-w-2xl py-4 mx-auto">
        <div className="w-full h-8 bg-blue-100 animate-pulse rounded mb-2"></div>

        <div className="w-full h-[350px] bg-blue-100 animate-pulse rounded mb-4"></div>
        <div className="w-full h-[64px] bg-blue-100 animate-pulse rounded mb-2"></div>
        <div className="w-full h-[64px] bg-blue-100 animate-pulse rounded mb-2"></div>
        <div className="w-full h-[64px] bg-blue-100 animate-pulse rounded mb-2"></div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-1 underline sticky mt-4 ml-4"
    >
      &lt;
      <span>Back to home</span>
    </Link>
  );
}
