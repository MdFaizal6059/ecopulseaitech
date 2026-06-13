import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-foreground group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
