import { Metadata } from "next";
import { HistoryClient } from "@/components/history-client";

export const metadata: Metadata = {
  title: "Beyaz Saray'dan Kozbeyli'ye: Tarihimiz | Kozbeyli Konağı",
  description: "500 yıllık tescilli taş mimari, Horasan harcı sırları ve bir aile mirasının restorasyon hikayesi. Kozbeyli Konağı'nın 'Living Museum' felsefesini keşfedin.",
  keywords: ["kozbeyli tarihi", "horasan harcı nedir", "restorasyon projeleri izmir", "osmanlı sivil mimari", "taş konak tarihi"],
};

export default function HistoryPage() {
  return <HistoryClient />;
}
