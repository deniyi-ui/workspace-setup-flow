import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingLayout,
});

const stepByPath: Record<string, number> = {
  "/onboarding/profile": 1,
  "/onboarding/connect": 2,
  "/onboarding/invite": 3,
};

function OnboardingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const step = stepByPath[pathname];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          FieldWorkz OS
        </span>
        {step && (
          <span className="text-xs text-muted-foreground">Step {step} of 3</span>
        )}
      </header>
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:pt-16">
        <Outlet />
      </main>
    </div>
  );
}
