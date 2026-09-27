import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Power, Wind, Fan, Thermometer, Settings, Zap, Droplet, Plug, Gauge, Flame, Snowflake, Minus, Plus, AlertTriangle, Maximize2 } from 'lucide-react';

export default function App() {
  const [powerOn, setPowerOn] = useState(false);
  const [acSwitchOn, setAcSwitchOn] = useState(false);
  const [thermostatOn, setThermostatOn] = useState(false);
  
  const [targetTemp, setTargetTemp] = useState(22); 
  const [currentRoomTemp, setCurrentRoomTemp] = useState(35); 
  const [flowLevel, setFlowLevel] = useState(0); 

  const [isFaultActive, setIsFaultActive] = useState(false);
  const isSystemRunning = powerOn && acSwitchOn && thermostatOn && !isFaultActive;

  const containerRef = useRef(null);
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  // ================= RESPONSIVE SCALING LOGIC =================
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1200;
      const baseHeight = 1050; 
      const scaleWidth = window.innerWidth / baseWidth;
      const scaleHeight = window.innerHeight / baseHeight;
      setScale(Math.min(scaleWidth, scaleHeight) * 0.98); 
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const compRef = useRef(null);
  const condRef = useRef(null);
  const evapRef = useRef(null);
  const snowflakeRef = useRef(null);

  const compSpeedRef = useRef(0);
  const condSpeedRef = useRef(0);
  const evapSpeedRef = useRef(0);

  const compRotRef = useRef(0);
  const condRotRef = useRef(0);
  const evapRotRef = useRef(0);
  const snowflakeRotRef = useRef(0);

  useEffect(() => {
    if (isSystemRunning) {
      setFlowLevel(1); 
      const t1 = setTimeout(() => setFlowLevel(2), 2500); 
      const t2 = setTimeout(() => setFlowLevel(3), 5000); 
      const t3 = setTimeout(() => setFlowLevel(4), 7500); 
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setFlowLevel(0);
    }
  }, [isSystemRunning]);

  // ================= TEMPERATURE LOGIC FIX (Increase & Decrease) =================
  useEffect(() => {
    let interval;
    if (isSystemRunning && flowLevel === 4) {
      if (currentRoomTemp > targetTemp) {
        // Cooling down
        interval = setInterval(() => setCurrentRoomTemp(prev => prev > targetTemp ? prev - 1 : prev), 2500);
      } else if (currentRoomTemp < targetTemp) {
        // Warming up naturally if target temp is increased
        interval = setInterval(() => setCurrentRoomTemp(prev => prev < targetTemp ? prev + 1 : prev), 2500);
      }
    } else if (!isSystemRunning && currentRoomTemp < 35 && !isFaultActive) {
      // System off, warming up to 35
      interval = setInterval(() => setCurrentRoomTemp(prev => prev < 35 ? prev + 1 : prev), 1500); 
    }
    return () => clearInterval(interval);
  }, [isSystemRunning, flowLevel, currentRoomTemp, targetTemp, isFaultActive]);

  const tempDiffForLoad = currentRoomTemp - targetTemp; 
  const inverterLoad = isSystemRunning 
    ? (tempDiffForLoad <= 0 ? 10 : Math.min(100, Math.max(10, Math.round(10 + (tempDiffForLoad / 8) * 90))))
    : (isFaultActive ? 100 : 0); 
  const loadFactor = inverterLoad / 100; 
  const animDurationMultiplier = 2.5 - (loadFactor * 2.0); 

  useEffect(() => {
    let animationId;
    const updateFrames = () => {
      const tComp = (flowLevel >= 2 && !isFaultActive) ? (25 * loadFactor) : 0;
      const tCond = (flowLevel >= 2 && !isFaultActive) ? (20 * loadFactor) : 0;
      const tEvap = (flowLevel >= 3 && !isFaultActive) ? (30 * loadFactor) : 0;
      const accel = 0.02; const decel = 0.01; 
      
      compSpeedRef.current += (tComp - compSpeedRef.current) * (tComp > compSpeedRef.current ? accel : decel);
      condSpeedRef.current += (tCond - condSpeedRef.current) * (tCond > condSpeedRef.current ? accel : decel);
      evapSpeedRef.current += (tEvap - evapSpeedRef.current) * (tEvap > evapSpeedRef.current ? accel : decel);

      compRotRef.current = (compRotRef.current + compSpeedRef.current) % 360;
      condRotRef.current = (condRotRef.current + condSpeedRef.current) % 360;
      evapRotRef.current = (evapRotRef.current + evapSpeedRef.current) % 360;

      if (compRef.current) compRef.current.style.transform = `rotate(${compRotRef.current}deg)`;
      if (condRef.current) condRef.current.style.transform = `rotate(${condRotRef.current}deg)`;
      if (evapRef.current) evapRef.current.style.transform = `rotate(${evapRotRef.current}deg)`;

      if ((flowLevel === 4 || currentRoomTemp <= 25) && !isFaultActive) {
          snowflakeRotRef.current = (snowflakeRotRef.current + 1.5) % 360;
          if (snowflakeRef.current) snowflakeRef.current.style.transform = `rotate(${snowflakeRotRef.current}deg)`;
      }
      animationId = requestAnimationFrame(updateFrames);
    };
    animationId = requestAnimationFrame(updateFrames);
    return () => cancelAnimationFrame(animationId);
  }, [flowLevel, loadFactor, currentRoomTemp, isFaultActive]);

  const getRoomStyle = () => {
    if (isFaultActive) return 'border-red-500 bg-red-950/60 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse';
    if (currentRoomTemp >= 30) return 'border-orange-500/50 bg-orange-950/40 shadow-[0_0_40px_rgba(249,115,22,0.15)]'; 
    if (currentRoomTemp >= 24) return 'border-blue-400/40 bg-blue-950/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]'; 
    return 'border-cyan-400/60 bg-cyan-900/40 shadow-[0_0_40px_rgba(34,211,238,0.25)]'; 
  };

  const paths = {
    p1: "M 246 583 L 842 583 L 842 476",
    p1Color: "#ef4444",
    p2: "M 874 420 L 906 420 L 906 535",
    p2Color: "#ef4444",
    p3: "M 906 631 L 906 680 L 280 680 L 280 595 A 12 12 0 0 1 280 571 L 280 480 L 198 480 L 198 464",
    p3Color: "#f97316",
    p4: "M 198 400 L 198 318 L 534 318",
    p4Color: "#22d3ee",
    p5: "M 642 318 L 730 318 L 730 420 L 814 420",
    p5Color: "#3b82f6",
    p6: "M 842 380 L 842 350 L 1060 350 L 1060 750 L 80 750 L 80 583 L 150 583",
    p6Color: "#3b82f6",
  };

  const renderPipe = (pathD, color, isActive) => (
    <g>
      <path d={pathD} stroke={color} strokeWidth="10" fill="none" className="opacity-50 transition-colors duration-1000" strokeLinecap="round" strokeLinejoin="round" />
      {isActive && !isFaultActive && (
        <motion.path 
          d={pathD} stroke="#ffffff" strokeWidth="4" strokeDasharray="12 24" fill="none" strokeLinecap="round" strokeLinejoin="round"
          animate={{ strokeDashoffset: [0, -36] }} transition={{ repeat: Infinity, duration: 1.5 * animDurationMultiplier, ease: "linear" }}
        />
      )}
    </g>
  );

  const HoverBadge = ({ x, y, num, text }) => (
    <div className="absolute group z-40" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <div className="w-6 h-6 bg-black border-2 border-white/60 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-[0_0_15px_rgba(0,0,0,0.9)] cursor-pointer hover:border-cyan-400 hover:text-cyan-400 transition-all">
        {num}
      </div>
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-2 bg-black/95 border border-cyan-500/80 rounded-lg text-[10px] font-bold text-center text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.2)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-90 group-hover:scale-100 duration-200 origin-bottom">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2 h-2 bg-black border-b border-r border-cyan-500/80 rotate-45"></div>
      </div>
    </div>
  );

  const Tooltip = ({ title, desc, position = "top" }) => (
    <div className={`absolute ${position === 'top' ? 'bottom-full mb-3' : position === 'bottom' ? 'top-full mt-3' : position === 'left' ? 'right-full mr-3 top-1/2 -translate-y-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'} w-64 p-3 bg-black/95 border border-cyan-500/50 rounded-xl text-[10px] text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_0_25px_rgba(34,211,238,0.15)] scale-90 group-hover:scale-100`}>
      <div className="font-bold text-cyan-400 mb-1 border-b border-white/10 pb-1 uppercase">{title}</div>
      <div className="leading-relaxed text-[11px] text-gray-300">{desc}</div>
      <div className={`absolute w-3 h-3 bg-black border-cyan-500/50 rotate-45 ${position === 'top' ? 'bottom-[-7px] left-1/2 -translate-x-1/2 border-b border-r' : position === 'bottom' ? 'top-[-7px] left-1/2 -translate-x-1/2 border-t border-l' : position === 'left' ? 'right-[-7px] top-1/2 -translate-y-1/2 border-t border-r' : 'left-[-7px] top-1/2 -translate-y-1/2 border-b border-l'}`}></div>
    </div>
  );

  const BlackArrow = ({ points }) => (
    <polygon points={points} fill="#000" stroke="#fff" strokeWidth="1.5" className="z-10" />
  );

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-[#0b1121] text-white flex items-center justify-center overflow-y-auto overflow-x-hidden relative py-6">
      
      <button onClick={toggleFullScreen} className="absolute top-6 right-6 z-50 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 shadow-lg text-slate-300 hover:text-cyan-400 transition-all" title="Toggle Fullscreen (F11)">
        <Maximize2 className="w-5 h-5" />
      </button>

      {/* Scalable Container for Presentation Mode */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', width: '1152px', height: '950px' }} className="relative flex flex-col justify-between items-center my-auto">
        
        {/* HEADER */}
        <div className="text-center z-10 w-full flex justify-between items-center mb-2">
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Air Conditioning System – Cooling Flow
            </h1>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-mono text-sm shadow-lg transition-all ${isFaultActive ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : isSystemRunning ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
            STATUS: {isFaultActive ? '⚠️ ALARM: SYSTEM TRIPPED' : flowLevel === 0 ? 'SYSTEM STANDBY' : flowLevel < 4 ? 'SYSTEM INITIALIZING...' : 'CYCLE ACTIVE'}
          </div>
        </div>

        {/* HORIZONTAL LIVE FLOW TRACKER */}
        <div className="flex items-center justify-center gap-3 mb-4 w-full bg-slate-900/50 py-2.5 rounded-xl border border-slate-700/50">
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 2 && !isFaultActive ? 'border-red-500 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-gray-700 bg-gray-900 text-gray-500'}`}>
              <Settings className={`w-4 h-4 ${flowLevel >= 2 && !isFaultActive ? 'animate-spin' : ''}`} style={flowLevel >= 2 ? { animationDuration: '3s' } : {}} /> COMPRESSOR
           </div>
           <div className={`text-xl transition-colors duration-500 ${flowLevel >= 2 && !isFaultActive ? 'text-red-500' : 'text-gray-700'}`}>➔</div>
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 2 && !isFaultActive ? 'border-orange-500 bg-orange-950/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-gray-700 bg-gray-900 text-gray-500'}`}>
              <Fan className={`w-4 h-4 ${flowLevel >= 2 && !isFaultActive ? 'animate-spin' : ''}`} /> CONDENSER
           </div>
           <div className={`text-xl transition-colors duration-500 ${flowLevel >= 3 && !isFaultActive ? 'text-orange-500' : 'text-gray-700'}`}>➔</div>
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 3 && !isFaultActive ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'border-gray-700 bg-gray-900 text-gray-500'}`}>
              <Droplet className="w-4 h-4" /> EXPANSION VALVE
           </div>
           <div className={`text-xl transition-colors duration-500 ${flowLevel >= 3 && !isFaultActive ? 'text-cyan-400' : 'text-gray-700'}`}>➔</div>
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 3 && !isFaultActive ? 'border-blue-400 bg-blue-950/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'border-gray-700 bg-gray-900 text-gray-500'}`}>
              <Wind className={`w-4 h-4 ${flowLevel >= 3 && !isFaultActive ? 'animate-pulse' : ''}`} /> EVAPORATOR
           </div>
        </div>

        {/* MAIN BOARD */}
        <div className="w-[1152px] h-[780px] bg-[#161e31] border-2 border-slate-700 rounded-3xl relative shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex-shrink-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none rounded-3xl"></div>

          {isFaultActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 border-2 border-red-400 text-white px-6 py-2 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.8)] z-50 flex items-center gap-3 animate-bounce">
              <AlertTriangle className="w-6 h-6 text-yellow-300 animate-spin" />
              <span className="font-mono font-black text-sm tracking-wider">CRITICAL ALARM: HIGH DISCHARGE PRESSURE OVERLOAD</span>
            </div>
          )}

          {/* INTERACTIVE HOVER BADGES */}
          <HoverBadge x={540} y={583} num="১" text="উচ্চ চাপের গরম গ্যাস (Discharge Line)" />
          <HoverBadge x={906} y={480} num="২" text="গরম গ্যাস কন্ডেন্সারে যাচ্ছে" />
          <HoverBadge x={550} y={680} num="৩" text="উষ্ণ তরল (Warm Liquid Line)" />
          <HoverBadge x={504} y={318} num="৪" text="বরফ-শীতল তরল (Cold Liquid Line)" />
          <HoverBadge x={784} y={420} num="৫" text="তাপ শুষে নেওয়া গ্যাস (Return Gas)" />
          <HoverBadge x={600} y={750} num="৬" text="কম্প্রেসরে ফিরে যাওয়া গ্যাস (Suction Line)" />
          <HoverBadge x={586} y={180} num="৭" text="রুমের গরম বাতাস প্রবেশ" />
          <HoverBadge x={680} y={240} num="৮" text="বিশুদ্ধ ঠান্ডা বাতাস (Supply Air)" />

          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            
            <path d="M 144 92 L 250 92" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M 144 92 L 250 92" stroke="rgba(250,204,21,0.3)" strokeWidth="2" fill="none" />
            <path d="M 314 92 L 390 92" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M 314 92 L 390 92" stroke="rgba(250,204,21,0.3)" strokeWidth="2" fill="none" />
            
            <path d="M 452 200 L 452 160 L 430 160 L 430 132" stroke="#4ade80" strokeWidth="3" fill="none" strokeDasharray="6 6" className="opacity-50" strokeLinejoin="round" />
            
            <path d="M 430 52 L 430 20 L 25 20 L 25 550 L 150 550" stroke="#a855f7" strokeWidth="3" fill="none" className="opacity-40" strokeLinejoin="round" />
            <path d="M 430 52 L 430 20 L 1110 20 L 1110 560 L 1072 560 A 12 12 0 0 1 1048 560 L 962 560" stroke="#a855f7" strokeWidth="3" fill="none" className="opacity-40" strokeLinejoin="round" />

            {/* RENDERING GAS & LIQUID PIPES */}
            {renderPipe(paths.p1, paths.p1Color, flowLevel >= 2)}
            {renderPipe(paths.p2, paths.p2Color, flowLevel >= 2)}
            {renderPipe(paths.p3, paths.p3Color, flowLevel >= 3)}
            {renderPipe(paths.p4, paths.p4Color, flowLevel >= 3)}
            {renderPipe(paths.p5, paths.p5Color, flowLevel >= 3)}
            {renderPipe(paths.p6, paths.p6Color, flowLevel >= 3)}

            <path d="M 780 110 L 586 110 L 586 270" stroke="rgba(255,255,255,0.05)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 780 110 L 586 110 L 586 270" stroke="rgba(249,115,22,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" />
            
            <path d="M 586 366 L 586 480 L 680 480 L 680 330 A 12 12 0 0 1 680 306 L 680 200 L 782 200" stroke="rgba(255,255,255,0.05)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 586 366 L 586 480 L 680 480 L 680 330 A 12 12 0 0 1 680 306 L 680 200 L 782 200" stroke="rgba(34,211,238,0.3)" strokeWidth="2" fill="none" strokeLinejoin="round" className="transition-colors duration-1000" />

            {/* FLUSH BLACK ENTRY ARROWS */}
            <BlackArrow points="836,488 848,488 842,476" /> 
            <BlackArrow points="900,523 912,523 906,535" /> 
            <BlackArrow points="192,476 204,476 198,464" /> 
            <BlackArrow points="522,312 522,324 534,318" /> 
            <BlackArrow points="802,414 802,426 814,420" /> 
            <BlackArrow points="138,577 138,589 150,583" /> 
            
            <BlackArrow points="580,258 592,258 586,270" /> 
            <BlackArrow points="770,194 770,206 782,200" />

            <BlackArrow points="138,544 138,556 150,550" />
            <BlackArrow points="974,554 974,566 962,560" />

            {/* ELECTRICAL FLOW ANIMATIONS */}
            {!isFaultActive && powerOn && ([0, 0.5, 1.0].map(delay => (<motion.circle key={`e1-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)"><animateMotion dur={`${1.5 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 144 92 L 250 92" /></motion.circle>)))}
            {!isFaultActive && powerOn && acSwitchOn && (<>{[0, 0.5, 1.0].map(delay => (<motion.circle key={`e2-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)"><animateMotion dur={`${1.5 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 314 92 L 390 92" /></motion.circle>))} {[0, 0.6, 1.2, 1.8].map(delay => (<motion.circle key={`e3-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)"><animateMotion dur={`${2.5 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 452 200 L 452 160 L 430 160 L 430 132" /></motion.circle>))}</>)}
            
            {/* PIPELINE FLOW ANIMATIONS */}
            {!isFaultActive && flowLevel >= 1 && (
              <>
                <motion.path d="M 430 52 L 430 20 L 25 20 L 25 550 L 150 550" stroke="#a855f7" strokeWidth="4" strokeDasharray="15 15" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, ease: "linear" }} />
                <motion.path d="M 430 52 L 430 20 L 1110 20 L 1110 560 L 1072 560 A 12 12 0 0 1 1048 560 L 962 560" stroke="#a855f7" strokeWidth="4" strokeDasharray="15 15" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 2.5 * animDurationMultiplier, ease: "linear" }} />
              </>
            )}
            
            {/* AIR PARTICLES */}
            {!isFaultActive && flowLevel >= 3 && (
              <g> 
                {[0, 0.5, 1.0].map(delay => (
                  <motion.circle key={`return-air-${delay}`} r="4" fill="#f97316" filter="drop-shadow(0 0 6px #f97316)">
                    <animateMotion dur={`${1.8 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 780 110 L 586 110 L 586 270" />
                  </motion.circle>
                ))}
                {[0, 0.5, 1.0].map(delay => (
                  <motion.circle key={`supply-air-${delay}`} r="4" fill="#22d3ee" filter="drop-shadow(0 0 6px #22d3ee)">
                    <animateMotion dur={`${1.8 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 586 366 L 586 480 L 680 480 L 680 330 A 12 12 0 0 1 680 306 L 680 200 L 782 200" />
                  </motion.circle>
                ))}
              </g>
            )}
          </svg>

          {/* LIVE METERS */}
          <div className={`absolute top-[650px] left-[620px] bg-black/80 border transition-all duration-1000 ${isFaultActive ? 'border-red-500 shadow-[0_0_20px_#ef4444]' : flowLevel >= 2 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-gray-700'} rounded-lg px-3 py-1.5 flex items-center gap-2 z-10 backdrop-blur-sm`}>
             <Gauge className={`w-4 h-4 ${isFaultActive ? 'text-red-500 animate-bounce' : flowLevel >= 2 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
             <div className="flex flex-col">
               <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none">High Side Pressure</span>
               <span className={`font-mono text-sm font-bold leading-none mt-1 transition-all ${isFaultActive ? 'text-red-500 animate-pulse' : flowLevel >= 2 ? 'text-red-400' : 'text-gray-600'}`}>
                 {isFaultActive ? '385 PSI (DANGER)' : flowLevel >= 2 ? `${180 + Math.round(inverterLoad * 0.8)} PSI` : '000 PSI'}
               </span>
             </div>
          </div>

          <div className={`absolute top-[520px] left-[320px] bg-black/80 border transition-all duration-1000 ${flowLevel >= 3 ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-gray-700'} rounded-lg px-3 py-1.5 flex items-center gap-2 z-10 backdrop-blur-sm`}>
             <Gauge className={`w-4 h-4 ${flowLevel >= 3 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`} />
             <div className="flex flex-col">
               <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none">Low Side Pressure</span>
               <span className={`font-mono text-sm font-bold leading-none mt-1 transition-all ${flowLevel >= 3 ? 'text-cyan-300' : 'text-gray-600'}`}>
                 {flowLevel >= 3 ? `${40 + Math.round(inverterLoad * 0.25)} PSI` : '000 PSI'}
               </span>
             </div>
          </div>

          {/* COMPONENT NODES WITH Z-INDEX FIX */}
          <div className="absolute top-[60px] left-[80px] flex flex-col items-center z-20 group hover:z-[100]">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${powerOn ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_20px_#facc15]' : 'bg-gray-800 border-gray-500'}`}>
               <Activity className={`w-8 h-8 ${powerOn ? 'text-gray-900' : 'text-yellow-500'}`} />
             </div>
             <span className="text-[10px] font-bold mt-2 text-gray-300 flex items-center gap-1 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700"><Plug className="w-3 h-3"/> AC SOURCE</span>
             <Tooltip position="bottom" title="AC Power Source" desc="মূল উদ্দেশ্য: পুরো সিস্টেমে 220V এসি বিদ্যুৎ সরবরাহ করা।" />
          </div>

          <div className={`absolute top-[60px] left-[250px] flex flex-col items-center z-20 transition-all group hover:z-[100] ${!powerOn ? 'opacity-50 grayscale' : ''}`}>
             <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${acSwitchOn ? 'border-yellow-400 bg-yellow-400 shadow-[0_0_20px_#facc15]' : 'border-gray-600 bg-gray-800'}`}>
               <Power className={`w-8 h-8 ${acSwitchOn ? 'text-gray-900' : 'text-gray-500'}`} />
             </div>
             <span className="text-[10px] font-bold mt-2 text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700">A/C SWITCH</span>
             <Tooltip position="bottom" title="Main Switch" desc="মূল উদ্দেশ্য: রিমোট সিগন্যাল পেয়ে সিস্টেমের লজিক সার্কিট চালু করা।" />
          </div>

          <div className="absolute top-[52px] left-[390px] flex flex-col items-center z-20 group hover:z-[100]">
             <div className={`w-20 h-20 bg-gray-800 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${flowLevel >= 1 ? 'border-purple-500 shadow-[0_0_25px_#a855f7] bg-purple-900/40' : 'border-gray-600'}`}>
               <Zap className={`w-8 h-8 ${flowLevel >= 1 ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
             </div>
             <span className="text-[9px] font-bold mt-2 text-gray-400 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700 text-center whitespace-nowrap">INVERTER DRIVE</span>
             <Tooltip position="bottom" title="Inverter Drive" desc="মূল উদ্দেশ্য: থার্মোস্ট্যাটের ডেটার ওপর ভিত্তি করে কম্প্রেসর ও ফ্যানের স্পিড ডায়নামিক্যালি নিয়ন্ত্রণ করা।" />
          </div>

          <div className={`absolute top-[200px] left-[420px] flex flex-col items-center z-20 transition-all group hover:z-[100] ${(!powerOn || !acSwitchOn) ? 'opacity-50 grayscale' : ''}`}>
             <span className="text-[10px] font-bold mb-2 text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700">THERMOSTAT</span>
             <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${thermostatOn ? 'border-green-400 bg-green-400 shadow-[0_0_20px_#4ade80]' : 'border-gray-600 bg-gray-800'}`}>
               <Thermometer className={`w-8 h-8 ${thermostatOn ? 'text-gray-900' : 'text-gray-500'} ${isSystemRunning ? 'animate-pulse' : ''}`} />
             </div>
             <Tooltip position="top" title="Thermostat Sensor" desc="মূল উদ্দেশ্য: রুমের তাপমাত্রা মেপে ইনভার্টারকে রিয়ে-টাইম ফিডব্যাক পাঠানো।" />
          </div>

          <div className="absolute top-[535px] left-[150px] flex flex-col items-center z-20 group hover:z-[100]">
             <div className={`w-24 h-24 bg-gray-900 border-2 rounded-2xl flex items-center justify-center transition-all ${isFaultActive ? 'border-red-500 shadow-[0_0_30px_#ef4444] bg-red-950/60' : flowLevel >= 2 ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] bg-red-900/30' : 'border-gray-600'}`}>
                <div ref={compRef}>
                   <Settings className={`w-14 h-14 ${isFaultActive ? 'text-red-500' : flowLevel >= 2 ? 'text-red-500' : 'text-gray-600'}`} />
                </div>
             </div>
             <span className="text-xs font-bold mt-2 text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700">COMPRESSOR</span>
             <Tooltip position="top" title="Compressor" desc="মূল উদ্দেশ্য: রেফ্রিজারেন্ট গ্যাসকে প্রবল চাপে সংকুচিত করে এর তাপমাত্রা ও প্রেসার বহুগুণ বাড়িয়ে দেওয়া।" />
          </div>

          <div className="absolute top-[535px] left-[850px] flex flex-col items-center z-20 group hover:z-[100]">
             <div className={`w-28 h-24 bg-gray-900 border-2 rounded-2xl flex items-center justify-center transition-all duration-1000 ${isFaultActive ? 'border-red-500 shadow-[0_0_30px_#ef4444] bg-red-950/60' : flowLevel >= 2 ? 'border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.4)] bg-orange-900/30' : 'border-gray-600'}`}>
                <div ref={condRef}>
                   <Fan className={`w-14 h-14 transition-colors duration-1000 ${isFaultActive ? 'text-red-500' : flowLevel >= 2 ? 'text-orange-400' : 'text-gray-600'}`} />
                </div>
             </div>
             <span className="text-xs font-bold mt-2 text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700">OUTDOOR CONDENSER</span>
             <Tooltip position="top" title="Outdoor Condenser" desc="মূল উদ্দেশ্য: ফ্যানের সাহায্যে গরম গ্যাস থেকে তাপ বের করে দিয়ে গ্যাসকে উষ্ণ তরলে রূপান্তর করা।" />
          </div>

          <div className="absolute top-[380px] left-[810px] flex flex-col items-center z-20 group hover:z-[100]">
             <div className={`w-16 h-24 bg-gray-900 border-2 rounded-xl flex items-center justify-center relative transition-all duration-1000 overflow-hidden ${flowLevel >= 2 ? 'border-gray-500 shadow-[0_0_20px_rgba(156,163,175,0.2)]' : 'border-gray-600'}`}>
               <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 60 90">
                  <path d="M 30 90 Q 30 50 55 50" stroke="#ef4444" strokeWidth="8" fill="none" />
                  <path d="M 5 50 Q 30 50 30 0" stroke="#3b82f6" strokeWidth="8" fill="none" />
               </svg>
               <Droplet className={`w-5 h-5 absolute z-10 transition-colors duration-1000 ${flowLevel >= 2 ? 'text-gray-400' : 'text-gray-600'}`} />
             </div>
             <span className="text-[10px] font-bold mt-2 text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700">REVERSING VALVE</span>
             <Tooltip position="left" title="Reversing Valve" desc="মূল উদ্দেশ্য: কুলিং বা হিটিং মোড অনুযায়ী রেফ্রিজারেন্ট প্রবাহের দিক (Flow Direction) নিয়ন্ত্রণ করা।" />
          </div>

          <div className="absolute top-[400px] left-[166px] flex flex-col items-center z-20 group hover:z-[100]">
             <div className={`w-16 h-16 bg-gray-900 border-2 rounded-lg flex items-center justify-center transition-all duration-1000 relative ${flowLevel >= 3 ? 'border-cyan-400 shadow-[0_0_20px_#22d3ee] bg-cyan-900/30' : 'border-gray-600'}`}>
               <div className="flex">
                 <div className={`w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-b-[10px] border-b-transparent ${flowLevel >= 3 ? 'border-l-orange-400' : 'border-l-gray-400'}`}></div>
                 <div className={`w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-b-[10px] border-b-transparent ${flowLevel >= 3 ? 'border-r-cyan-400' : 'border-r-gray-400'}`}></div>
               </div>
               <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700 whitespace-nowrap">EXPANSION VALVE</span>
             </div>
             <Tooltip position="right" title="Expansion Valve" desc="মূল উদ্দেশ্য: উচ্চ চাপের তরলকে হঠাৎ একটি সরু ছিদ্র দিয়ে প্রসারিত করে এর চাপ ও তাপমাত্রা কমিয়ে বরফ-শীতল করা।" />
          </div>

          <div className="absolute top-[270px] left-[530px] flex flex-col items-center z-20 w-32 group hover:z-[100]">
             <div className={`w-28 h-24 bg-gray-900 border-2 rounded-2xl flex items-center justify-center transition-all duration-1000 relative ${flowLevel >= 3 ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.5)] bg-cyan-900/30' : 'border-gray-600'}`}>
                <Wind className={`w-12 h-12 transition-colors duration-1000 ${flowLevel >= 3 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`} />
                <div ref={evapRef} className="absolute bottom-2 right-2">
                   <Fan className={`w-6 h-6 transition-colors duration-1000 ${flowLevel >= 3 ? 'text-blue-300' : 'text-gray-700'}`} />
                </div>
             </div>
             <span className="text-[9px] font-bold mt-2 text-gray-300 bg-[#161e31] px-2 py-0.5 rounded border border-gray-700 text-center whitespace-nowrap">INDOOR EVAPORATOR</span>
             <Tooltip position="top" title="Indoor Evaporator" desc="মূল উদ্দেশ্য: রুমের গরম বাতাস শুষে নিয়ে তাকে বরফ-শীতল পাইপের সংস্পর্শে ঠান্ডা করে পুনরায় রুমে ফেরত পাঠানো।" />
          </div>

          {/* TARGET ROOM */}
          <div className={`absolute top-[60px] left-[780px] w-64 h-48 border-2 rounded-2xl p-4 transition-all duration-1000 z-20 backdrop-blur-md flex flex-col items-center justify-between ${getRoomStyle()}`}>
             
             <div className="w-full text-center border-b border-white/20 pb-2 relative">
               <span className="font-bold text-sm tracking-widest text-gray-200">ROOM INTERIOR</span>
               <div className="absolute top-[-5px] right-0">
                  <div ref={snowflakeRef}><Snowflake className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" /></div>
               </div>
             </div>
             
             <div className="flex-1 flex flex-col justify-between items-center w-full pt-3">
               {!isSystemRunning && !isFaultActive ? (
                  <><div className="h-6"></div><span className="text-4xl font-mono font-bold text-orange-500 drop-shadow-[0_0_15px_#f97316]">{currentRoomTemp}°C</span><span className="text-sm font-black tracking-widest text-red-500 animate-pulse bg-red-950/50 px-4 py-1 rounded-full border border-red-500/30 mt-2">SYSTEM OFF</span></>
               ) : isFaultActive ? (
                  <><div className="h-6"></div><span className="text-4xl font-mono font-bold text-red-400 animate-pulse">{currentRoomTemp}°C</span><span className="text-xs font-black tracking-widest text-red-500 bg-red-950/80 px-3 py-1 rounded-full border border-red-500/50 mt-2">TRIPPED (OVERHEAT)</span></>
               ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-cyan-500/30 w-[80%]"><span className="text-xs font-bold text-cyan-300">Set Temp: <span className="text-sm text-cyan-100">{targetTemp}°C</span></span></div>
                    <span className="text-5xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_15px_#22d3ee]">{currentRoomTemp}°C</span>
                    <span className="text-[11px] font-bold tracking-widest text-cyan-300 pb-1">INVERTER LOAD: {inverterLoad}%</span>
                  </>
               )}
             </div>
          </div>

        </div>

        {/* SCADA CONTROL PANEL */}
        <div className="mt-6 w-[1152px] bg-slate-950/90 backdrop-blur-2xl p-6 rounded-2xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between z-30">
          
          <div className="w-[28%] border-r border-slate-800 pr-5 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-cyan-400 font-bold mb-1 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} /> SCADA Control Deck
              </h3>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Hardware-grade cooling simulation with clean piping routes & hover tooltips.
              </p>
            </div>
            
            <div className="mt-3">
              <button onClick={() => setIsFaultActive(!isFaultActive)} className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-mono font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${isFaultActive ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/50'}`}>
                <AlertTriangle className="w-4 h-4" /> {isFaultActive ? 'RESET FAULT STATE' : 'SIMULATE OVERLOAD'}
              </button>
            </div>
          </div>

          <div className="w-[22%] flex justify-center gap-6 px-2">
             <div className="flex flex-col items-center gap-2">
               <span className="text-[9px] font-bold tracking-widest text-gray-400">MAIN LINE</span>
               <button onClick={() => { setPowerOn(!powerOn); if(powerOn) setIsFaultActive(false); }} className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg ${powerOn ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] translate-y-[2px]' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                 <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${powerOn ? 'bg-yellow-400 shadow-[0_0_12px_#facc15]' : 'bg-slate-700'}`}></div>
               </button>
             </div>
             <div className="flex flex-col items-center gap-2">
               <span className="text-[9px] font-bold tracking-widest text-gray-400">AC UNIT</span>
               <button onClick={() => { if(powerOn) setAcSwitchOn(!acSwitchOn) }} disabled={!powerOn} className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg ${!powerOn ? 'bg-slate-950 border-slate-900 opacity-40 cursor-not-allowed' : acSwitchOn ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] translate-y-[2px]' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                 <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${acSwitchOn ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-slate-700'}`}></div>
               </button>
             </div>
             <div className="flex flex-col items-center gap-2">
               <span className="text-[9px] font-bold tracking-widest text-gray-400">THERMOSTAT</span>
               <button onClick={() => { if(powerOn && acSwitchOn) setThermostatOn(!thermostatOn) }} disabled={!powerOn || !acSwitchOn} className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg ${(!powerOn || !acSwitchOn) ? 'bg-slate-950 border-slate-900 opacity-40 cursor-not-allowed' : thermostatOn ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] translate-y-[2px]' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                 <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${thermostatOn ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]' : 'bg-slate-700'}`}></div>
               </button>
             </div>
          </div>

          <div className="w-[26%] border-l border-slate-800 px-5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 mb-2">SYSTEM MODE</span>
            <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] w-full justify-center">
               <button className="flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-1.5">
                 <Snowflake className="w-3 h-3"/> COOLING
               </button>
            </div>
          </div>

          <div className="w-[24%] border-l border-slate-800 pl-5 flex flex-col items-center">
             <span className="text-[10px] font-bold tracking-widest text-gray-400 mb-2">TARGET TEMPERATURE</span>
             <div className={`relative px-4 py-2 rounded-2xl border transition-all duration-500 flex items-center gap-4 bg-slate-900/90 w-full justify-center ${isSystemRunning ? 'border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.25)]' : 'border-slate-700 opacity-40'}`}>
               <button onClick={() => setTargetTemp(Math.max(16, targetTemp - 1))} disabled={!isSystemRunning} className="w-7 h-7 flex items-center justify-center bg-slate-800/80 rounded-xl hover:bg-slate-700 text-cyan-400 border border-slate-700 shadow transition-transform active:scale-95 disabled:opacity-50">
                 <Minus className="w-3.5 h-3.5" />
               </button>
               <div className="flex flex-col items-center min-w-[75px]">
                 <span className="text-2xl font-mono font-black tracking-wider text-cyan-300 drop-shadow-[0_0_10px_#22d3ee]">
                   {targetTemp}°C
                 </span>
                 <span className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mt-0.5 whitespace-nowrap">
                   COOL MODE
                 </span>
               </div>
               <button onClick={() => setTargetTemp(Math.min(30, targetTemp + 1))} disabled={!isSystemRunning} className="w-7 h-7 flex items-center justify-center bg-slate-800/80 rounded-xl hover:bg-slate-700 text-cyan-400 border border-slate-700 shadow transition-transform active:scale-95 disabled:opacity-50">
                 <Plus className="w-3.5 h-3.5" />
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}