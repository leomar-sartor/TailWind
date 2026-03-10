type SplitScreenLayoutProps = {
  left: React.ReactNode
  right: React.ReactNode
}

export function SplitScreenLayout({ left, right }: SplitScreenLayoutProps) {
  return (
    <div className="h-screen w-full flex flex-col xl:flex-row">

      <div className="flex h-screen justify-center p-8 xl:w-1/3 ">
          {left}
      </div>

      {right && (
        <div className="hidden xl:flex xl:w-2/3">
          {right}
        </div>
      )}

    </div>
  );
}