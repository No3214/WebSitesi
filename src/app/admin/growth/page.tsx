"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";

interface GrowthStats {
  ads: number;
  seo: number;
  sales: string;
  leadsFound: number;
  auditDate: string;
}

interface Lead {
  id: number;
  name: string;
  type: string;
  status: 'Hot' | 'Warm' | 'New';
  score: number;
}

export default function GrowthDashboard() {
  const [stats, setStats] = useState<GrowthStats>({
    ads: 88,
    seo: 92,
    sales: "High",
    leadsFound: 14,
    auditDate: new Date().toLocaleDateString()
  });

  const [leads, setLeads] = useState<Lead[]>([
    { id: 1, name: "İzmir Teknoloji Şirketleri", type: "Corporate", status: "Hot", score: 9.4 },
    { id: 2, name: "Luxury Wedding Planners UK", type: "Event", status: "Warm", score: 8.1 },
    { id: 3, name: "Ege Gastronomi Derneği", type: "Corporate", status: "New", score: 7.5 },
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <SiteHeader />
      
      <main className="container py-20" style={{ paddingTop: '120px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionTitle 
            eyebrow="AI COMMAND CENTER"
            title="Kozbeyli Konağı Büyüme Motoru"
            text="Otonom ajanların performansı ve anlık büyüme metrikleri."
          />
        </motion.div>

        {/* STATUS TILES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {[
            { label: "Ads Health", val: stats.ads + "%", color: "text-blue-400" },
            { label: "SEO Citability", val: stats.seo + "%", color: "text-emerald-400" },
            { label: "Sales Readiness", val: stats.sales, color: "text-amber-400" },
            { label: "Total Leads", val: stats.leadsFound, color: "text-purple-400" },
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{kpi.label}</p>
              <p className={`text-4xl font-serif mt-4 ${kpi.color}`}>{kpi.val}</p>
            </motion.div>
          ))}
        </div>

        {/* DETAILED MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          {/* LEAD FEED */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-2xl font-serif mb-8">Lead Hunter: Aktif Fırsatlar</h3>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                  <div>
                    <p className="font-semibold text-lg">{lead.name}</p>
                    <p className="text-sm text-gray-400">{lead.type} · Score: {lead.score}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                    lead.status === 'Hot' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-ivory transition-colors">
              YENİ FIRSATLARI TARA
            </button>
          </div>

          {/* ORCHESTRATOR LOGS */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-serif mb-8">Ajan Protokolü</h3>
            <div className="space-y-6 font-mono text-xs text-gray-400">
              <p><span className="text-emerald-500">[OK]</span> SalesAgent: Context injected.</p>
              <p><span className="text-emerald-500">[OK]</span> GEO-Engine: &apos;About&apos; optimized.</p>
              <p><span className="text-blue-500">[INFO]</span> AuditRunner: Periodic check complete.</p>
              <p className="animate-pulse"><span className="text-purple-500">[ACTIVE]</span> LeadHunter: Scanning LinkedIn API...</p>
              <div className="h-40 bg-black/40 rounded p-4 overflow-hidden border border-white/5">
                <p className="text-gray-600">-- Scanning industries --</p>
                <p>MATCH FOUND: Luxury Events</p>
                <p>CALCULATING SCORE...</p>
                <p>PROBABILITY: 0.89</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding-left: 20px; padding-right: 20px; }
        .text-ivory { color: #f7f4ec; }
        .bg-ivory { background-color: #f7f4ec; }
      `}</style>
    </div>
  );
}
