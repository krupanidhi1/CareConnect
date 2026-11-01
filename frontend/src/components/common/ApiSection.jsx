import React from "react";
import BackendNotice from "@/components/common/BackendNotice";
import ErrorState from "@/components/common/ErrorState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

/**
 * Renders the four honest states of an API-backed panel:
 * not connected → loading → error → data (via children).
 */
export default function ApiSection({
  resource,
  endpoints,
  noticeTitle,
  noticeDescription,
  skeletonRows = 3,
  children,
}) {
  if (!resource.configured) {
    return (
      <BackendNotice
        title={noticeTitle}
        description={noticeDescription}
        endpoints={endpoints}
      />
    );
  }
  if (resource.loading) return <LoadingSkeleton rows={skeletonRows} />;
  if (resource.error) return <ErrorState error={resource.error} onRetry={resource.refresh} />;
  return children(resource.data);
}