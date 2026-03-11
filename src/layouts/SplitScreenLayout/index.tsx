type SplitScreenLayoutProps = {
  left: React.ReactNode
  right: React.ReactNode
}

export function SplitScreenLayout({ left, right }: SplitScreenLayoutProps) {
  return (
    <div className="flex min-h-screen">

      {/* LEFT */}
      <div className="w-full xl:w-1/3 flex flex-col min-h-screen">
          {left}
      </div>

      {/* RIGHT */}
      {right && (
        <div className="hidden xl:block xl:w-2/3 sticky top-0 h-screen">
          {right}
        </div>
      )}

    </div>
  );
}