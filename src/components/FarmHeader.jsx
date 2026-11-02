
import Image from "next/image";

export default function FarmHeader({ user }) {
  return (
    <header className="relative z-50 flex-none grid grid-cols-1 items-center gap-4 border-b-2 border-emerald-700 bg-white px-6 py-3 shadow-sm md:grid-cols-[185px_1fr_210px]">
      {/* Farm logo */}
      <div className="flex justify-center">
        <Image
          src="/logos/greenLogoTractor.png"
          alt="Pleasant Grove Farms tractor logo"
          width={185}
          height={135}
          className="h-auto w-[185px] object-contain"
          priority
        />
      </div>

      {/* Centered farm title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-950 lg:text-3xl">
          PLEASANT GROVE FARMS
        </h1>

        <p className="mt-1 text-lg font-semibold text-emerald-700 lg:text-xl">
          Business Management System
        </p>
      </div>

      {/* Authenticated user */}
      <div className="flex items-center justify-center rounded-lg border border-green-900 bg-emerald-600 px-4 py-4 text-black">
        <div className="text-center">
          <p className="font-bold">
            {user?.name ?? "User"}
          </p>
          <p className="text-sm">
            {user?.role ?? ""}
          </p>
        </div>
      </div>
    </header>
  );
}
