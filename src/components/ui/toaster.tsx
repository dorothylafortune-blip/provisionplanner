// components/ui/toaster.tsx — Toast notification container
// Uses the 'sonner' library which provides beautiful, stacked toasts.
// Usage anywhere in the app: import { toast } from "sonner"; toast.success("Done!")

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors              // Uses semantic colors: green=success, red=error, etc.
      position="top-center"   // Toasts appear at the top center of the screen
      toastOptions={{
        style: {
          // Match the app's warm terracotta border color
          borderColor: "hsl(38, 20%, 84%)",
        },
      }}
    />
  );
}
