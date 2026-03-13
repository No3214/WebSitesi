"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Target, 
  Zap, 
  Cpu, 
  Database, 
  ShieldCheck, 
  BarChart3, 
  Globe,
  Smartphone,
  Server
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { GrowthEngine } from "@/lib/growth-engine";

export default function GrowthDashboard() {
  const [conversionVelocity, setConversionVelocity] = useState(0.85);
  const [health, setHealth] = useState(GrowthEngine.checkHealth());

  useEffect(() => {
    const interval = setInterval(() => {
      setConversionVelocity(v => Math.min(1, v + (Math.random() * 0.01 - 0.005)));
      setHealth(GrowthEngine.checkHealth());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { id: "agent-01", node: "DA_VINCI", role: "Tech Lead", status: "Active", load: "12%" },
    { id: "agent-02", node: "HOPPER", role: "Hospitality Specialist", status: "Scanning", load: "45%" },
    { id: "agent-03", node: "VON_NEUMANN", role: "Gastronomy Expert", status: "Idle", load: "2%" },
    { id: "agent-04", node: "LOVELACE", role: "Growth Architect", status: "Active", load: "88%" },
  ];

  return (
    <div className="min-h-screen bg-[#020203] text-[#a1a1aa] font-sans selection:bg-emerald-500/30">
      <SiteHeader />
      
      <main className="container max-w-[1400px] mx-auto px-6 py-24 md:py-32">
        
        {/* TECH HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <Activity size={20} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.4em]">Node-10.0.42.10 ONLINE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-4">
              SNAKEEZY <span className="text-emerald-500">GROWTH</span>
            </h1>
            <p className="max-w-xl text-lg text-zinc-500 leading-relaxed">
              Otonom büyüme ajanları ve davranış analitiği merkezi. Veri odaklı lüks yönetimi istatistikleri.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-end text-right"
          >
            <div className="text-zinc-600 font-mono text-xs mb-2">LAST_SYNC: {new Date().toLocaleTimeString()}</div>
            <div className="flex gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">CONVERSION VELOCITY</div>
                <div className="text-2xl font-mono text-emerald-400">{(conversionVelocity * 10).toFixed(2)}x</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">ACTIVE AGENTS</div>
                <div className="text-2xl font-mono text-white">11/11</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* PRIMARY METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Direct Booking ROI", value: "+24.8%", icon: <Zap className="text-amber-400" />, trend: "up" },
            { label: "AI Satisfaction", value: "98.2%", icon: <Cpu className="text-blue-400" />, trend: "steady" },
            { label: "Lead Capture Rate", value: "12.4%", icon: <Target className="text-rose-400" />, trend: "up" },
            { label: "Data Integrity", value: "99.9%", icon: <ShieldCheck className="text-emerald-400" />, trend: "steady" },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-900/50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-zinc-800/50 rounded-lg group-hover:scale-110 transition-transform">
                  {metric.icon}
                </div>
                <span className="text-[10px] text-emerald-500 font-mono">STABLE</span>
              </div>
              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{metric.label}</div>
              <div className="text-3xl font-mono font-bold text-white tracking-tighter">{metric.value}</div>
            </motion.div>
          ))}
        </div>

        {/* MAIN ANALYSIS BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LOGS / AGENT STATUS */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Server size={18} className="text-zinc-600" />
                <h2 className="font-bold text-white tracking-tight">AGENT FLEET MONITOR</h2>
              </div>
              <button className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">PURGE_CACHE</button>
            </div>

            <div className="space-y-3">
              {agents.map((agent, i) => (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
                    <div>
                      <div className="text-xs font-mono text-white tracking-tight">{agent.id}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">{agent.role}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-12 text-[11px] font-mono">
                    <div className="text-zinc-500">NODE: <span className="text-zinc-300">{agent.node}</span></div>
                    <div className="text-zinc-500 w-16">LOAD: <span className="text-emerald-500">{agent.load}</span></div>
                  </div>
                  <div className="text-[10px] font-bold bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
                    {agent.status}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* NEW: SECURITY HARDENING NODE */}
            <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <ShieldCheck className="text-emerald-400" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tighter">AI Security Hardening</p>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-tight">Status: ACTIVE · Rate Limit: 5req/min · Guardrail: ON</p>
                </div>
              </div>
              <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                VERIFIED
              </div>
            </div>

            <button className="mt-8 w-full py-5 rounded-2xl bg-white text-black font-black hover:bg-[#f7f4ec] transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl">
              YENİ FIRSATLARI TARA (MCP PROXY ACTIVE)
            </button>

            <div className="mt-8 p-6 bg-black border border-zinc-800 rounded-xl font-mono text-[11px]">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-zinc-500 uppercase">SYSTEM_ORCHESTRATOR_LOGS</span>
               </div>
               <div className="space-y-1.5">
                  <p><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-blue-400">INIT</span> expert_bridge_gastronomy_plugin_master</p>
                  <p><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-emerald-400">PUSH</span> behavior_event: intent_to_book_high_velocity</p>
                  <p><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-amber-400">WARN</span> geofence_boundary: anonymous_access_detected_vpn_bypass</p>
                  <p className="animate-pulse">{">"} Root: Scan cycle complete (48.2ms)</p>
               </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: GROWTH FUNNEL */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 size={18} className="text-emerald-400" />
                <h2 className="font-bold text-white tracking-tight">GROWTH FUNNEL</h2>
              </div>
              <div className="space-y-6">
                {[
                  { label: "Awareness", val: 88, color: "bg-emerald-500" },
                  { label: "Intent", val: 64, color: "bg-blue-500" },
                  { label: "Conversion", val: 32, color: "bg-amber-500" },
                ].map((step, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span>{step.label}</span>
                      <span className="text-white">{step.val}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${step.val}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full ${step.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  &quot;System predicts +4.2% lift in direct booking velocity after Phase 29 assets stabilization.&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="p-8 bg-black border border-zinc-800 rounded-3xl group hover:border-zinc-700 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity size={80} />
                </div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Engine Health</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-white">{health.status}</h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mb-2" />
                </div>
                <p className="text-[10px] text-zinc-600 font-mono mt-4">AI ENGAGEMENT: {(health.metrics.ai_engagement * 100).toFixed(0)}%</p>
              </div>

              <div className="p-8 bg-black border border-zinc-800 rounded-3xl group hover:border-zinc-700 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Globe size={80} />
                </div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Brand Alignment</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-white">94%</h3>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mb-2" />
                </div>
                <p className="text-[10px] text-zinc-600 font-mono mt-4">DRIFT CHECK: OPTIMAL</p>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                 <Globe size={18} className="text-zinc-500" />
                 <h2 className="font-bold text-white tracking-tight">INFRASTRUCTURE</h2>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <Smartphone size={16} className="text-zinc-600 mb-2" />
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Edge Nodes</div>
                    <div className="text-lg font-mono text-white">22</div>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <Database size={16} className="text-zinc-600 mb-2" />
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Redis Sync</div>
                    <div className="text-lg font-mono text-emerald-400">READY</div>
                  </div>
               </div>
            </div>
          </div>

        </div>

      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}
