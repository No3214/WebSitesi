import { EnLocaleSync } from "@/components/en-locale-sync";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" data-locale="en">
      <EnLocaleSync />
      {children}
    </div>
  );
}
