import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The club app uses Firebase Auth (browser-only), so it renders on the client.
const ClubApp = lazy(() => import("@/legacy/App.jsx"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VIT Health Club — Smart Health Club Management" },
      { name: "description", content: "Events, attendance, reports and approvals for VIT Health Club students, board members and faculty." },
      { property: "og:title", content: "VIT Health Club — Smart Health Club Management" },
      { property: "og:description", content: "Your campus health club, all in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const Loading = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "DM Sans, sans-serif", color: "#637383" }}>
    Loading your club…
  </div>
);

function Index() {
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <ClubApp />
      </Suspense>
    </ClientOnly>
  );
}
