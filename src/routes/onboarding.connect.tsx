import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  btnGhost,
  btnPrimary,
  loadOnboarding,
  platforms,
  saveOnboarding,
  type PlatformId,
} from "../lib/onboarding";

export const Route = createFileRoute("/onboarding/connect")({
  head: () => ({
    meta: [
      { title: "Connect a survey platform — FieldWorkz OS" },
      {
        name: "description",
        content: "Connect SurveyCTO, Kobo Toolbox, or ODK Central to FieldWorkz OS.",
      },
    ],
  }),
  component: ConnectStep,
});

type CardState = "idle" | "connecting" | "connected";

function ConnectStep() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState<PlatformId | null>(null);
  const [connected, setConnected] = useState<PlatformId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setConnected(loadOnboarding().connectedPlatform);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function connect(id: PlatformId) {
    if (connecting) return;
    setConnecting(id);
    // Mock OAuth-style redirect: brief redirect state, then return connected
    timer.current = setTimeout(() => {
      setConnecting(null);
      setConnected(id);
      saveOnboarding({ connectedPlatform: id, bannerDismissed: false });
    }, 1800);
  }

  function stateFor(id: PlatformId): CardState {
    if (connecting === id) return "connecting";
    if (connected === id) return "connected";
    return "idle";
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Connect a survey platform
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        FieldWorkz reads from your existing survey account — it doesn't replace it.
      </p>

      <div className="mt-10 space-y-3">
        {platforms.map((p) => {
          const state = stateFor(p.id);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                  {p.mark}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.detail}</p>
                </div>
              </div>

              {state === "idle" && (
                <button
                  onClick={() => connect(p.id)}
                  disabled={connecting !== null}
                  className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Connect
                </button>
              )}
              {state === "connecting" && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
                    aria-hidden="true"
                  />
                  Redirecting to {p.name}…
                </span>
              )}
              {state === "connected" && (
                <span className="flex items-center gap-1.5 rounded-md bg-success-subtle px-2.5 py-1 text-sm font-medium text-accent-foreground">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Connected
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-4">
        {connected ? (
          <button
            className={btnPrimary}
            onClick={() => navigate({ to: "/onboarding/invite" })}
          >
            Continue
          </button>
        ) : (
          <>
            <button
              className={btnSecondary}
              onClick={() => navigate({ to: "/onboarding/invite" })}
            >
              Skip for now
            </button>
            <p className="text-xs text-muted-foreground">
              You can connect a platform anytime from settings.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
          >
            Skip the rest
          </button>
        )}
      </div>
    </div>
  );
}
