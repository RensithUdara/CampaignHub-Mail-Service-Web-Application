import { Suspense } from "react";
import LoadingState from "@/components/ui/LoadingState";
import ComposeForm from "@/components/compose/ComposeForm";

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          title="Opening composer"
          message="Loading templates, contacts, and editor tools..."
        />
      }
    >
      <ComposeForm />
    </Suspense>
  );
}
