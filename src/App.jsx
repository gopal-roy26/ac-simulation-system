import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Power, Wind, Fan, Thermometer, Settings, Zap, Droplet, Plug, Gauge } from 'lucide-react';

export default function App() {
  // Interactive States
  const [powerOn, setPowerOn] = useState(false);
  const [acSwitchOn, setAcSwitchOn] = useState(false);
  const [thermostatOn, setThermostatOn] = useState(false);
  const [targetTemp, setTargetTemp] = useState(16); // New Temperature State

  const isSystemRunning = powerOn && acSwitchOn && thermostatOn;

  // Inverter Logic (Speed Control based on target temperature)
  const speedMultiplier = isSystemRunning ? (0.3 + ((targetTemp - 16) / 14) * 2.0) : 1;
  const inverterLoad = Math.round(10 + ((30 - targetTemp) / 14) * 90); // 100% at 16°C, 10% at 30°C

  // Tooltip Component
  const Tooltip = ({ title, desc, position = "top" }) => (
    <div className={`absolute ${position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} left-1/2 -translate-x-1/2 w-56 p-3 bg-black/90 border border-cyan-500/50 rounded-xl text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-90 group-hover:scale-100`}>
      <div className="font-bold text-cyan-400 mb-1 border-b border-white/10 pb-1">{title}</div>
      <div className="leading-relaxed">{desc}</div>
      <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-cyan-500/50 rotate-45 ${position === 'top' ? 'bottom-[-7px] border-b border-r' : 'top-[-7px] border-t border-l'}`}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1121] text-white flex flex-col items-center p-6 font-sans overflow-x-hidden">
      
      {/* Header Updated to Match Presentation Topic */}
      <div className="text-center mb-6 z-10 w-full max-w-[1152px] flex justify-between items-end">
        <div className="text-left">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Air Conditioning System – Functional Flow
          </h1>
          <p className="text-gray-400 mt-1">Live Functional Simulation: Interactive Air & Refrigerant Cycle</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border font-mono text-sm shadow-lg transition-all ${isSystemRunning ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
          STATUS: {isSystemRunning ? 'COOLING CYCLE ACTIVE' : 'SYSTEM STANDBY'}
        </div>
      </div>

      {/* Main Interactive Board */}
      <div className="w-[1152px] h-[720px] bg-[#161e31] border-2 border-slate-700 rounded-3xl relative shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex-shrink-0">
        
        {/* Engineering Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none rounded-3xl"></div>

        {/* ================= SVG PIPING & WIRING ================= */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {/* Electrical Wiring */}
          <path d="M 144 92 L 250 92" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M 144 92 L 250 92" stroke="rgba(250,204,21,0.3)" strokeWidth="2" fill="none" />
          <path d="M 314 92 L 420 92" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M 314 92 L 420 92" stroke="rgba(250,204,21,0.3)" strokeWidth="2" fill="none" />
          <path d="M 282 124 L 282 272 L 420 272" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 282 124 L 282 272 L 420 272" stroke="rgba(250,204,21,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <path d="M 452 200 L 452 124" stroke="#4ade80" strokeWidth="3" fill="none" strokeDasharray="6 6" className="opacity-50" />
          <path d="M 452 60 L 452 24 L 30 24 L 30 568 L 150 568" stroke="#a855f7" strokeWidth="3" fill="none" className="opacity-40" strokeLinejoin="round" />
          <path d="M 452 60 L 452 24 L 1050 24 L 1050 568 L 912 568" stroke="#a855f7" strokeWidth="3" fill="none" className="opacity-40" strokeLinejoin="round" />

          {/* Mechanical Refrigerant Pipes */}
          <path d="M 246 568 L 800 568" stroke="#ef4444" strokeWidth="10" fill="none" className="opacity-50" />
          <path d="M 856 520 L 856 440" stroke="#f97316" strokeWidth="10" fill="none" className="opacity-50" />
          <path d="M 828 400 L 230 400" stroke="#f97316" strokeWidth="10" fill="none" className="opacity-50" />
          <path d="M 198 360 L 198 320 L 550 320" stroke="#22d3ee" strokeWidth="10" fill="none" className="opacity-50" strokeLinejoin="round" />
          <path d="M 606 326 L 606 460 L 198 460 L 198 520" stroke="#3b82f6" strokeWidth="10" fill="none" className="opacity-50" strokeLinejoin="round" />

          {/* Air Ducts */}
          <path d="M 750 110 L 606 110 L 606 230" stroke="rgba(255,255,255,0.05)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 750 110 L 606 110 L 606 230" stroke="rgba(249,115,22,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <path d="M 662 278 L 820 278 L 820 204" stroke="rgba(255,255,255,0.05)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 662 278 L 820 278 L 820 204" stroke="rgba(34,211,238,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />

          {/* DYNAMIC FLOW ANIMATIONS */}
          {powerOn && ([0, 0.5, 1.0].map(delay => (<motion.circle key={`p1-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)"><animateMotion dur={`${1.5 * speedMultiplier}s`} begin={`${delay * speedMultiplier}s`} repeatCount="indefinite" path="M 144 92 L 250 92" /></motion.circle>)))}
          {powerOn && acSwitchOn && (<>{[0, 0.5, 1.0].map(delay => (<motion.circle key={`p2-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)"><animateMotion dur={`${1.5 * speedMultiplier}s`} begin={`${delay * speedMultiplier}s`} repeatCount="indefinite" path="M 314 92 L 420 92" /></motion.circle>))} {[0, 0.6, 1.2, 1.8].map(delay => (<motion.circle key={`p3-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)"><animateMotion dur={`${2.5 * speedMultiplier}s`} begin={`${delay * speedMultiplier}s`} repeatCount="indefinite" path="M 282 124 L 282 272 L 420 272" /></motion.circle>))}</>)}
          
          {isSystemRunning && (
            <g key={`speed-${speedMultiplier}`}>
              <motion.path d="M 452 200 L 452 124" stroke="#4ade80" strokeWidth="4" strokeDasharray="6 6" fill="none" animate={{ strokeDashoffset: [0, -12] }} transition={{ repeat: Infinity, duration: 0.5 * speedMultiplier, ease: "linear" }} />
              <motion.path d="M 452 60 L 452 24 L 30 24 L 30 568 L 150 568" stroke="#a855f7" strokeWidth="4" strokeDasharray="15 15" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 2 * speedMultiplier, ease: "linear" }} />
              <motion.path d="M 452 60 L 452 24 L 1050 24 L 1050 568 L 912 568" stroke="#a855f7" strokeWidth="4" strokeDasharray="15 15" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 2.5 * speedMultiplier, ease: "linear" }} />

              <motion.path d="M 246 568 L 800 568" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 18" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 0.8 * speedMultiplier, ease: "linear" }} />
              <motion.path d="M 856 520 L 856 440" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 18" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 0.5 * speedMultiplier, ease: "linear" }} />
              <motion.path d="M 828 400 L 230 400" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 18" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 1.5 * speedMultiplier, ease: "linear" }} />
              <motion.path d="M 198 360 L 198 320 L 550 320" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 18" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 1 * speedMultiplier, ease: "linear" }} />
              <motion.path d="M 606 326 L 606 460 L 198 460 L 198 520" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 18" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 1.5 * speedMultiplier, ease: "linear" }} />

              {[0, 0.5, 1.0].map(delay => (<motion.circle key={`hot-air-${delay}`} r="4" fill="#f97316" filter="drop-shadow(0 0 6px #f97316)"><animateMotion dur={`${1.5 * speedMultiplier}s`} begin={`${delay * speedMultiplier}s`} repeatCount="indefinite" path="M 750 110 L 606 110 L 606 230" /></motion.circle>))}
              {[0, 0.5, 1.0].map(delay => (<motion.circle key={`cold-air-${delay}`} r="4" fill="#22d3ee" filter="drop-shadow(0 0 6px #22d3ee)"><animateMotion dur={`${1.5 * speedMultiplier}s`} begin={`${delay * speedMultiplier}s`} repeatCount="indefinite" path="M 662 278 L 820 278 L 820 204" /></motion.circle>))}
            </g>
          )}
        </svg>

        {/* LIVE DIGITAL METERS */}
        <div className={`absolute top-[580px] left-[520px] bg-black/80 border transition-all duration-1000 ${isSystemRunning ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-gray-700'} rounded-lg px-3 py-1.5 flex items-center gap-2 z-10 backdrop-blur-sm`}>
           <Gauge className={`w-4 h-4 ${isSystemRunning ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
           <div className="flex flex-col">
             <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none">High Side Pressure</span>
             <span className={`font-mono text-sm font-bold leading-none mt-1 transition-all ${isSystemRunning ? 'text-red-400' : 'text-gray-600'}`}>
               {isSystemRunning ? `${180 + Math.round(inverterLoad * 0.8)} PSI` : '000 PSI'}
             </span>
           </div>
        </div>

        <div className={`absolute top-[370px] left-[320px] bg-black/80 border transition-all duration-1000 ${isSystemRunning ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-gray-700'} rounded-lg px-3 py-1.5 flex items-center gap-2 z-10 backdrop-blur-sm`}>
           <Gauge className={`w-4 h-4 ${isSystemRunning ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`} />
           <div className="flex flex-col">
             <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none">Low Side Pressure</span>
             <span className={`font-mono text-sm font-bold leading-none mt-1 transition-all ${isSystemRunning ? 'text-cyan-300' : 'text-gray-600'}`}>
               {isSystemRunning ? `${40 + Math.round(inverterLoad * 0.25)} PSI` : '000 PSI'}
             </span>
           </div>
        </div>

        {/* STEP-BY-STEP FLOW INDICATOR LABELS */}
        <div className="absolute top-[40px] left-[140px] flex items-center gap-2 z-10">
          <span className="bg-yellow-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">১</span>
          <span className="text-[11px] text-yellow-400 font-bold tracking-wider bg-[#161e31] border border-yellow-500/30 px-2 py-0.5 rounded">220V AC বিদ্যুৎ</span>
        </div>
        <div className="absolute top-[160px] left-[305px] flex items-center gap-2 z-10">
          <span className="bg-green-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">২</span>
          <span className="text-[11px] text-green-400 font-bold tracking-wider bg-[#161e31] border border-green-500/30 px-2 py-0.5 rounded">অ্যাক্টিভেশন সিগন্যাল</span>
        </div>
        <div className="absolute top-[6px] left-[680px] flex items-center gap-2 z-10">
          <span className="bg-purple-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৩</span>
          <span className="text-[11px] text-purple-400 font-bold tracking-wider bg-[#161e31] border border-purple-500/30 px-2 py-0.5 rounded">কম্প্রেসর ও ফ্যান পাওয়ার</span>
        </div>
        <div className="absolute top-[75px] left-[500px] flex items-center gap-2 z-10">
          <span className="bg-orange-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৪</span>
          <span className="text-[11px] text-orange-500 font-bold tracking-widest bg-[#161e31] border border-orange-500/30 px-3 py-1 rounded">রুমের গরম বাতাস প্রবেশ</span>
        </div>
        <div className="absolute top-[480px] left-[320px] flex items-center gap-2 z-10">
          <span className="bg-blue-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৫</span>
          <span className="text-[12px] text-blue-400 font-bold tracking-wider bg-[#161e31] border border-blue-500/30 px-3 py-1 rounded">তাপ শুষে নেওয়া গ্যাস (Return Gas)</span>
        </div>
        <div className="absolute top-[615px] left-[450px] flex items-center gap-2 z-10">
          <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৬</span>
          <span className="text-[12px] text-red-400 font-bold tracking-wider bg-[#161e31] border border-red-500/30 px-3 py-1 rounded">উচ্চ চাপের গরম গ্যাস (Hot Gas)</span>
        </div>
        <div className="absolute top-[420px] left-[450px] flex items-center gap-2 z-10">
          <span className="bg-orange-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৭</span>
          <span className="text-[12px] text-orange-400 font-bold tracking-wider bg-[#161e31] border border-orange-500/30 px-3 py-1 rounded">উচ্চ তাপমাত্রার তরল (Warm Liquid)</span>
        </div>
        <div className="absolute top-[280px] left-[160px] flex items-center gap-2 z-10">
          <span className="bg-cyan-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৮</span>
          <span className="text-[12px] text-cyan-400 font-bold tracking-wider bg-[#161e31] border border-cyan-500/30 px-3 py-1 rounded">বরফ-শীতল তরল (Cold Liquid)</span>
        </div>
        <div className="absolute top-[305px] left-[700px] flex items-center gap-2 z-10">
          <span className="bg-cyan-500 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-xs">৯</span>
          <span className="text-[11px] text-cyan-400 font-bold tracking-widest bg-[#161e31] border border-cyan-500/30 px-3 py-1 rounded">বিশুদ্ধ ঠান্ডা বাতাস (Supply)</span>
        </div>

        {/* INTERACTIVE COMPONENT NODES WITH TOOLTIPS */}
        <motion.div onClick={() => setPowerOn(!powerOn)} className="absolute top-[60px] left-[80px] flex flex-col items-center z-20 hover:z-50 cursor-pointer group">
           <Tooltip position="bottom" title="AC Power Source" desc="সিস্টেমের মূল বিদ্যুৎ সরবরাহ কেন্দ্র। এখান থেকেই 220V এসি ভোল্টেজ পুরো সিস্টেমে সাপ্লাই হয়।" />
           <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${powerOn ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_20px_#facc15]' : 'bg-gray-800 border-gray-500 group-hover:bg-gray-700'}`}>
             <Activity className={`w-8 h-8 ${powerOn ? 'text-gray-900' : 'text-yellow-500'}`} />
           </div>
           <span className="text-[10px] font-bold mt-2 text-gray-300 flex items-center gap-1 bg-[#161e31] px-1 rounded"><Plug className="w-3 h-3"/> AC SOURCE</span>
        </motion.div>

        <motion.div onClick={() => { if(powerOn) setAcSwitchOn(!acSwitchOn) }} className={`absolute top-[60px] left-[250px] flex flex-col items-center z-20 hover:z-50 transition-all ${!powerOn ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer group'}`}>
           <Tooltip position="bottom" title="A/C Main Switch" desc="এটি এসির প্রধান সুইচ (যেমন রিমোট)। এটি অন করলে বিদ্যুৎ কন্ট্রোল সার্কিট এবং থার্মোস্ট্যাটে পৌঁছে যায়।" />
           <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${acSwitchOn ? 'border-yellow-400 bg-yellow-400 shadow-[0_0_20px_#facc15]' : 'border-gray-600 bg-gray-800 group-hover:bg-gray-700'}`}>
             <Power className={`w-8 h-8 ${acSwitchOn ? 'text-gray-900' : 'text-gray-500'}`} />
           </div>
           <span className="text-[10px] font-bold mt-2 text-gray-300 bg-[#161e31] px-1 rounded">A/C SWITCH</span>
        </motion.div>

        <div className="absolute top-[52px] left-[412px] flex flex-col items-center z-20 hover:z-50 group">
           <Tooltip position="bottom" title="Relay Module" desc="একটি সেফটি সুইচ! থার্মোস্ট্যাটের ছোট সিগন্যাল পেয়ে এটি চালু হয় এবং মেইন লাইন থেকে সরাসরি কম্প্রেসরে হাই-ভোল্টেজ পাওয়ার পাঠিয়ে দেয়।" />
           <div className={`w-20 h-20 bg-gray-800 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${isSystemRunning ? 'border-purple-500 shadow-[0_0_25px_#a855f7] bg-purple-900/40' : 'border-gray-600 hover:bg-gray-700'}`}>
             <Zap className={`w-8 h-8 ${isSystemRunning ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
           </div>
           <span className="text-[10px] font-bold mt-2 text-gray-400 bg-[#161e31] px-1 rounded">RELAY</span>
        </div>

        <motion.div onClick={() => { if(powerOn && acSwitchOn) setThermostatOn(!thermostatOn) }} className={`absolute top-[200px] left-[420px] flex flex-col items-center z-20 hover:z-50 transition-all ${(!powerOn || !acSwitchOn) ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer group'}`}>
           <Tooltip position="top" title="Thermostat Sensor" desc="এটি রুমের তাপমাত্রা মাপে। রুম গরম থাকলে এটি রিলেকে সিগন্যাল দিয়ে কম্প্রেসর চালু করে, আর ঘর ঠান্ডা হয়ে গেলে সিগন্যাল বন্ধ করে দেয়।" />
           <span className="text-[10px] font-bold mb-2 text-gray-300 bg-[#161e31] px-1 rounded">THERMOSTAT</span>
           <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${thermostatOn ? 'border-green-400 bg-green-400 shadow-[0_0_20px_#4ade80]' : 'border-gray-600 bg-gray-800 group-hover:bg-gray-700'}`}>
             <Thermometer className={`w-8 h-8 ${thermostatOn ? 'text-gray-900' : 'text-gray-500'}`} />
           </div>
        </motion.div>

        {/* Compressor */}
        <div className="absolute top-[520px] left-[150px] flex flex-col items-center z-20 hover:z-50 group">
           <Tooltip position="top" title="Compressor (হার্ট)" desc="এসির সবচেয়ে গুরুত্বপূর্ণ অংশ! এটি রেফ্রিজারেন্ট গ্যাসকে প্রবল চাপে সংকুচিত করে। ইনভার্টার এসিতে এর স্পিড অটোমেটিক কন্ট্রোল হয়।" />
           <motion.div animate={isSystemRunning ? { x: [-1, 1, -1] } : {}} transition={{ repeat: Infinity, duration: 0.1 * speedMultiplier }} className={`w-24 h-24 bg-gray-900 border-2 rounded-2xl flex items-center justify-center transition-all ${isSystemRunning ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] bg-red-900/30' : 'border-gray-600 hover:bg-gray-800'}`}>
              <motion.div animate={{ rotate: isSystemRunning ? 360 : 0 }} transition={{ repeat: Infinity, duration: 0.3 * speedMultiplier, ease: "linear" }}>
                 <Settings className={`w-14 h-14 ${isSystemRunning ? 'text-red-500' : 'text-gray-600'}`} />
              </motion.div>
           </motion.div>
           <span className="text-xs font-bold mt-2 text-gray-300 bg-[#161e31] px-1 rounded">COMPRESSOR</span>
        </div>

        {/* Condenser Fan */}
        <div className="absolute top-[520px] left-[800px] flex flex-col items-center z-20 hover:z-50 group">
           <Tooltip position="top" title="Condenser (আউটডোর ইউনিট)" desc="কম্প্রেসর থেকে আসা মারাত্মক উত্তপ্ত গ্যাসকে কন্ডেনসার ফ্যান বাইরের বাতাসে ঠান্ডা করে। স্পিড বাড়লে এটি দ্রুত তাপ বের করে।" />
           <div className={`w-28 h-24 bg-gray-900 border-2 rounded-2xl flex items-center justify-center transition-all ${isSystemRunning ? 'border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.4)] bg-orange-900/30' : 'border-gray-600 hover:bg-gray-800'}`}>
              <motion.div animate={{ rotate: isSystemRunning ? 360 : 0 }} transition={{ repeat: Infinity, duration: 0.15 * speedMultiplier, ease: "linear" }}>
                 <Fan className={`w-14 h-14 ${isSystemRunning ? 'text-orange-400' : 'text-gray-600'}`} />
              </motion.div>
           </div>
           <span className="text-xs font-bold mt-2 text-gray-300 bg-[#161e31] px-1 rounded">CONDENSER</span>
        </div>

        <div className="absolute top-[360px] left-[828px] flex flex-col items-center z-20 hover:z-50 group">
           <Tooltip position="left" title="Drier Filter" desc="কন্ডেনসার থেকে আসা তরল রেফ্রিজারেন্টের ভেতরে থাকা যেকোনো ময়লা বা আর্দ্রতা (Moisture) ছেঁকে পরিষ্কার করে, যাতে সিস্টেম জ্যাম না হয়।" />
           <div className={`w-14 h-20 bg-gray-900 border-2 rounded-full flex flex-col items-center justify-center transition-all ${isSystemRunning ? 'border-orange-400 bg-orange-900/30' : 'border-gray-600 hover:bg-gray-800'}`}>
             <Droplet className={`w-6 h-6 ${isSystemRunning ? 'text-orange-400' : 'text-gray-600'}`} />
           </div>
           <span className="text-[10px] font-bold mt-2 text-gray-300 bg-[#161e31] px-1 rounded">DRIER FILTER</span>
        </div>

        <div className="absolute top-[360px] left-[166px] flex flex-col items-center z-20 hover:z-50 group">
           <Tooltip position="right" title="Expansion Valve" desc="সিস্টেমের ম্যাজিক পার্ট! এটি উচ্চ চাপের তরলকে হঠাৎ একটি সরু ছিদ্র দিয়ে প্রসারিত করে। চাপ কমে যাওয়ার কারণে তরলটি মুহূর্তের মধ্যে বরফ-শীতল হয়ে যায়।" />
           <div className={`w-16 h-16 bg-gray-900 border-2 rounded-lg flex items-center justify-center transition-all ${isSystemRunning ? 'border-cyan-400 shadow-[0_0_20px_#22d3ee] bg-cyan-900/30' : 'border-gray-600 hover:bg-gray-800'}`}>
             <div className="flex">
               <div className={`w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-b-[10px] border-b-transparent ${isSystemRunning ? 'border-l-orange-400' : 'border-l-gray-400'}`}></div>
               <div className={`w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-b-[10px] border-b-transparent ${isSystemRunning ? 'border-r-cyan-400' : 'border-r-gray-400'}`}></div>
             </div>
           </div>
           <span className="text-[10px] font-bold mt-2 text-gray-300 bg-[#161e31] px-1 rounded">EXPANSION VALVE</span>
        </div>

        {/* Evaporator Fan */}
        <div className="absolute top-[230px] left-[550px] flex flex-col items-center z-20 hover:z-50 group">
           <Tooltip position="top" title="Evaporator (ইনডোর ইউনিট)" desc="এটি আপনার রুমের ভেতরের অংশ। এক্সপেনশন ভালভ থেকে আসা বরফ-শীতল তরলটি এখানে ঢুকে রুমের বাতাস থেকে তাপ শুষে নেয় এবং ব্লোয়ার ফ্যানের সাহায্যে ঠান্ডা বাতাস আপনার রুমে ছুড়ে দেয়।" />
           <div className={`w-28 h-24 bg-gray-900 border-2 rounded-2xl flex items-center justify-center transition-all relative ${isSystemRunning ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.5)] bg-cyan-900/30' : 'border-gray-600 hover:bg-gray-800'}`}>
              <Wind className={`w-12 h-12 ${isSystemRunning ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`} />
              <motion.div className="absolute bottom-2 right-2" animate={{ rotate: isSystemRunning ? 360 : 0 }} transition={{ repeat: Infinity, duration: 0.2 * speedMultiplier, ease: "linear" }}>
                 <Fan className={`w-6 h-6 ${isSystemRunning ? 'text-blue-300' : 'text-gray-700'}`} />
              </motion.div>
           </div>
           <span className="text-xs font-bold mt-2 text-gray-300 bg-[#161e31] px-1 rounded">EVAPORATOR</span>
        </div>

        {/* ================= TARGET ROOM WITH INVERTER TEMP CONTROLS ================= */}
        <div className={`absolute top-[60px] left-[750px] w-64 h-36 border-2 rounded-2xl flex flex-col p-4 transition-all duration-1000 z-20 hover:z-50 backdrop-blur-md group ${isSystemRunning ? 'border-cyan-500/50 bg-cyan-900/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'border-orange-500/50 bg-orange-900/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:bg-gray-800/50'}`}>
           <Tooltip position="bottom" title="Room Temp Control" desc="এসি চলাকালীন '+' বা '-' বাটনে ক্লিক করে তাপমাত্রা কমান বা বাড়ান। তাপমাত্রা কমালে এসির স্পিড বেড়ে যাবে (Inverter Tech)!" />
           <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
             <span className="font-bold text-xs tracking-widest text-gray-300">ROOM INTERIOR</span>
             <Thermometer className={`w-5 h-5 transition-colors duration-1000 ${isSystemRunning ? 'text-cyan-400' : 'text-orange-500'}`} />
           </div>
           
           <div className="flex-1 flex flex-col justify-center items-center relative">
             {/* Temperature Controls */}
             {isSystemRunning ? (
               <div className="flex items-center gap-4 bg-cyan-900/40 px-3 py-1 rounded-full border border-cyan-500/50">
                 <button onClick={() => setTargetTemp(Math.max(16, targetTemp - 1))} className="text-xl font-bold text-cyan-400 hover:text-white hover:scale-110 transition-transform">-</button>
                 <span className="text-3xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_15px_#22d3ee]">
                   {targetTemp}°C
                 </span>
                 <button onClick={() => setTargetTemp(Math.min(30, targetTemp + 1))} className="text-xl font-bold text-cyan-400 hover:text-white hover:scale-110 transition-transform">+</button>
               </div>
             ) : (
               <span className="text-4xl font-mono font-bold text-orange-500 drop-shadow-[0_0_15px_#f97316]">35°C</span>
             )}

             {/* Inverter Load Indicator */}
             <span className={`text-[10px] mt-2 font-bold tracking-widest transition-all duration-1000 ${isSystemRunning ? 'text-cyan-300' : 'text-orange-400'}`}>
               {isSystemRunning ? `INVERTER LOAD: ${inverterLoad}%` : 'HOT & HUMID'}
             </span>
           </div>
        </div>

      </div>

      {/* Control Instruction Panel */}
      <div className="mt-8 w-full max-w-[1152px] bg-gray-800/80 p-6 rounded-2xl border border-gray-600 shadow-lg flex items-center gap-6 backdrop-blur-sm">
        <div className="flex-1">
          <h3 className="text-cyan-400 font-bold mb-2 text-xl">Interactive Control Guide:</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${powerOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <strong>Step 1:</strong> Click the <span className="text-yellow-400 font-bold">AC SOURCE</span> (Top Left) to provide power.
            </li>
            <li className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${acSwitchOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <strong>Step 2:</strong> Click the <span className="text-yellow-400 font-bold">A/C SWITCH</span> to route electricity.
            </li>
            <li className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${thermostatOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <strong>Step 3:</strong> Click the <span className="text-green-400 font-bold">THERMOSTAT</span> to trigger the Relay and start cooling!
            </li>
          </ul>
        </div>
        {isSystemRunning && (
          <div className="w-64 bg-cyan-900/30 border border-cyan-500/50 rounded-xl p-4 text-center animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Thermometer className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-cyan-300 font-bold">Inverter Tech is Active!</div>
            <div className="text-xs text-cyan-400/70 mt-1">Adjust temp to change speed</div>
          </div>
        )}
      </div>
    </div>
  );
}