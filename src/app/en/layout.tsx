import { EnLocaleSync } from "@/components/en-locale-sync";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnLocaleSync />
      {children}
    </>
  );
}
