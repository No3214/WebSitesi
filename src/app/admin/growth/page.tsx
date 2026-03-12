"use client";

import { useState, useEffect } from "react";
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

  // Mock "Active Optimization" effect to use setters
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, ads: Math.min(100, prev.ads + (Math.random() > 0.5 ? 1 : 0)) }));
      
      if (Math.random() > 0.8) {
        setLeads(prev => [
          { id: Date.now(), name: "Yeni Fırsat Şirketi", type: "Corporate", status: "New", score: 8.5 },
          ...prev.slice(0, 2)
        ]);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

        {/* BENTO GRID KPI MONITOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
          {[
            { label: "Ads Health", val: stats.ads + "%", color: "text-blue-400", desc: "Performance optimization active", size: "col-span-1" },
            { label: "SEO Citability", val: stats.seo + "%", color: "text-emerald-400", desc: "GEO algorithms satisfied", size: "col-span-1" },
            { label: "Design AI", val: "Active", color: "text-rose-400", desc: "Visual DNA mapping online", size: "col-span-1" },
            { label: "SEO Health", val: "94/100", color: "text-purple-400", desc: "Last audit: 10m ago", size: "col-span-1" },
            { 
              label: "System Status", 
              val: "Autonomous Mastery", 
              color: "text-white", 
              desc: "Auto-Pilot orchestrator running 7/24 on Railway", 
              size: "md:col-span-2 lg:col-span-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" 
            },
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
              transition={{ delay: i * 0.05 }}
              className={`p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group ${kpi.size}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="w-24 h-24 rounded-full border-4 border-white" />
              </div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">{kpi.label}</p>
              <p className={`text-5xl font-serif mt-4 tracking-tighter ${kpi.color}`}>{kpi.val}</p>
              <p className="text-gray-500 text-xs mt-4 font-light">{kpi.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* DETAILED MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* LEAD FEED - PREMIUM LIST */}
          <div className="lg:col-span-2 p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-serif">Lead Hunter: Aktif Fırsatlar</h3>
              <div className="px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                LIVE SCANNING
              </div>
            </div>
            
            <div className="space-y-4">
              {leads.map((lead) => (
                <motion.div 
                  key={lead.id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className="flex items-center justify-between p-7 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-serif border border-white/10 group-hover:scale-110 transition-transform">
                      {lead.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-xl tracking-tight">{lead.name}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{lead.type} · Score: {lead.score}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lead.status === 'Hot' ? 'bg-red-500 text-white' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="mt-10 w-full py-5 rounded-2xl bg-white text-black font-black hover:bg-[#f7f4ec] transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl">
              YENİ FIRSATLARI TARA (MCP PROXY ACTIVE)
            </button>
          </div>

          {/* ORCHESTRATOR LOGS - TERMINAL STYLE */}
          <div className="p-10 rounded-3xl bg-black border border-white/10 shadow-3xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <span className="ml-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Auto-Pilot Terminal</span>
            </div>
            <div className="space-y-5 font-mono text-[11px] leading-relaxed">
              <p className="text-gray-500">{">>>"} Initializing Expert Mastery Protocol...</p>
              <p><span className="text-emerald-500">[OK]</span> SalesAgent: Context injected.</p>
              <p><span className="text-emerald-500">[OK]</span> GEO-Engine: &apos;About&apos; optimized.</p>
              <p><span className="text-blue-400">[INFO]</span> AuditRunner: Periodic check complete.</p>
              <p className="text-purple-400 animate-pulse">[BUSY] LeadHunter: Scanning LinkedIn API via MCP...</p>
              <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[10px] text-gray-600">-- Intelligence Feed --</p>
                <div className="h-[2px] w-full bg-white/5 my-4" />
                <p className="text-emerald-400">MATCH: Luxury Events Hub</p>
                <p>PROBABILITY: 0.94</p>
                <p>ACTION: Expert Bridge Initiated</p>
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
