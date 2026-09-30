import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Power, Wind, Fan, Thermometer, Settings, Zap, Droplet, Plug, Gauge, Flame, Snowflake, Minus, Plus, AlertTriangle, Maximize2, Info } from 'lucide-react';

export default function App() {
  const [powerOn, setPowerOn] = useState(false);
  const [acSwitchOn, setAcSwitchOn] = useState(false);
  const [thermostatOn, setThermostatOn] = useState(false);
  
  const [targetTemp, setTargetTemp] = useState(22); 
  const [currentRoomTemp, setCurrentRoomTemp] = useState(35); 
  const [flowLevel, setFlowLevel] = useState(0); 

  const [isFaultActive, setIsFaultActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isSystemRunning = powerOn && acSwitchOn && thermostatOn && !isFaultActive;
  const containerRef = useRef(null);
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current?.webkitRequestFullscreen) { 
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current?.msRequestFullscreen) { 
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { 
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { 
        document.msExitFullscreen();
      }
    }
  };

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1500; 
      const baseHeight = 940; 
      const scaleWidth = window.innerWidth / baseWidth;
      const scaleHeight = window.innerHeight / baseHeight;
      setScale(Math.min(scaleWidth, scaleHeight) * 0.96); 
    };

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(handleResize, 100); 
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const condRef = useRef(null);
  const evapRef = useRef(null);
  const snowflakeRef = useRef(null);

  const condSpeedRef = useRef(0);
  const evapSpeedRef = useRef(0);

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

  useEffect(() => {
    let interval;
    if (isSystemRunning && flowLevel === 4) {
      if (currentRoomTemp > targetTemp) {
        interval = setInterval(() => setCurrentRoomTemp(prev => prev > targetTemp ? prev - 1 : prev), 1200);
      } else if (currentRoomTemp < targetTemp) {
        interval = setInterval(() => setCurrentRoomTemp(prev => prev < targetTemp ? prev + 1 : prev), 1200);
      }
    } else if (!isSystemRunning && currentRoomTemp < 35 && !isFaultActive) {
      interval = setInterval(() => setCurrentRoomTemp(prev => prev < 35 ? prev + 1 : prev), 1200); 
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
      const tCond = (flowLevel >= 2 && !isFaultActive) ? (20 * loadFactor) : 0;
      const tEvap = (flowLevel >= 3 && !isFaultActive) ? (30 * loadFactor) : 0;
      const accel = 0.02; const decel = 0.01; 
      
      condSpeedRef.current += (tCond - condSpeedRef.current) * (tCond > condSpeedRef.current ? accel : decel);
      evapSpeedRef.current += (tEvap - evapSpeedRef.current) * (tEvap > evapSpeedRef.current ? accel : decel);

      condRotRef.current = (condRotRef.current + condSpeedRef.current) % 360;
      evapRotRef.current = (evapRotRef.current + evapSpeedRef.current) % 360;

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
    if (isFaultActive) return 'border-red-500 bg-red-950/80 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse';
    if (currentRoomTemp >= 30) return 'border-orange-500/50 bg-orange-950/50 shadow-[0_0_40px_rgba(249,115,22,0.25)]'; 
    if (currentRoomTemp >= 24) return 'border-blue-400/40 bg-blue-950/40 shadow-[0_0_30px_rgba(59,130,246,0.25)]'; 
    return 'border-cyan-400/60 bg-cyan-900/50 shadow-[0_0_40px_rgba(34,211,238,0.35)]'; 
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
    p5Color: "#6366f1", 
    p6: "M 842 380 L 842 350 L 1060 350 L 1060 750 L 80 750 L 80 583 L 150 583",
    p6Color: "#6366f1", 
  };

  const renderPipe = (pathD, color, isActive, flowMode = null) => (
    <g>
      <path d={pathD} stroke={color} strokeWidth="10" fill="none" className="opacity-50 transition-colors duration-1000" strokeLinecap="round" strokeLinejoin="round" />
      
      {isActive && !isFaultActive && !flowMode && (
        <motion.path 
          d={pathD} stroke="#ffffff" strokeWidth="4" strokeDasharray="12 24" fill="none" strokeLinecap="round" strokeLinejoin="round"
          animate={{ strokeDashoffset: [0, -36] }} transition={{ repeat: Infinity, duration: 1.5 * animDurationMultiplier, ease: "linear" }}
        />
      )}

      {isActive && !isFaultActive && flowMode === 'liquid' && (
        <g>
          <motion.path 
            d={pathD} stroke={color} strokeWidth="8" strokeDasharray="45 15" fill="none" strokeLinecap="round" strokeLinejoin="round" className="opacity-100"
            animate={{ strokeDashoffset: [0, -60] }} transition={{ repeat: Infinity, duration: 1.2 * animDurationMultiplier, ease: "linear" }}
          />
          <motion.path 
            d={pathD} stroke="#ffffff" strokeWidth="2" strokeDasharray="45 15" fill="none" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"
            animate={{ strokeDashoffset: [0, -60] }} transition={{ repeat: Infinity, duration: 1.2 * animDurationMultiplier, ease: "linear" }}
          />
        </g>
      )}

      {isActive && !isFaultActive && flowMode === 'cold-gas' && (
        <g>
          <motion.path d={pathD} stroke="#93c5fd" strokeWidth="12" strokeDasharray="20 40 15 30" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(4px)' }} className="opacity-80" animate={{ strokeDashoffset: [0, -105] }} transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, ease: "linear" }} />
          <motion.path d={pathD} stroke="#e0f2fe" strokeWidth="8" strokeDasharray="10 20 25 15" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(2px)' }} className="opacity-90" animate={{ strokeDashoffset: [0, -70] }} transition={{ repeat: Infinity, duration: 1.5 * animDurationMultiplier, ease: "linear" }} />
          <motion.path d={pathD} stroke="#ffffff" strokeWidth="3" strokeDasharray="4 12" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(0.5px)' }} animate={{ strokeDashoffset: [0, -32] }} transition={{ repeat: Infinity, duration: 1 * animDurationMultiplier, ease: "linear" }} />
        </g>
      )}

      {isActive && !isFaultActive && flowMode === 'hot-gas' && (
        <g>
          <motion.path d={pathD} stroke="#fca5a5" strokeWidth="12" strokeDasharray="20 40 15 30" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(4px)' }} className="opacity-80" animate={{ strokeDashoffset: [0, -105] }} transition={{ repeat: Infinity, duration: 1.2 * animDurationMultiplier, ease: "linear" }} />
          <motion.path d={pathD} stroke="#ef4444" strokeWidth="8" strokeDasharray="10 20 25 15" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(2px)' }} className="opacity-90" animate={{ strokeDashoffset: [0, -70] }} transition={{ repeat: Infinity, duration: 0.9 * animDurationMultiplier, ease: "linear" }} />
          <motion.path d={pathD} stroke="#ffffff" strokeWidth="3" strokeDasharray="4 12" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(0.5px)' }} animate={{ strokeDashoffset: [0, -32] }} transition={{ repeat: Infinity, duration: 0.6 * animDurationMultiplier, ease: "linear" }} />
        </g>
      )}
    </g>
  );

  const HoverBadge = ({ x, y, num, text }) => (
    <div className="absolute group z-40" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <div className="w-6 h-6 bg-[#0f172a] border-2 border-cyan-500/80 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer hover:border-white hover:text-cyan-300 transition-all">
        {num}
      </div>
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900/95 border border-cyan-400 rounded-lg text-[10px] font-bold text-center text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.4)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-90 group-hover:scale-100 duration-200 origin-bottom">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2 h-2 bg-slate-900 border-b border-r border-cyan-400 rotate-45"></div>
      </div>
    </div>
  );

  // UPGRADED TOOLTIP: Ultra High Z-Index, Better Padding, Robust Positioning
  const Tooltip = ({ title, desc, position = "top" }) => {
    let posClasses = "";
    let arrowClasses = "";
    
    if (position === 'top') {
      posClasses = 'bottom-full mb-5 left-1/2 -translate-x-1/2';
      arrowClasses = 'bottom-[-7px] left-1/2 -translate-x-1/2 border-b border-r';
    } else if (position === 'bottom') {
      posClasses = 'top-full mt-5 left-1/2 -translate-x-1/2';
      arrowClasses = 'top-[-7px] left-1/2 -translate-x-1/2 border-t border-l';
    } else if (position === 'left') {
      posClasses = 'right-full mr-5 top-1/2 -translate-y-1/2';
      arrowClasses = 'right-[-7px] top-1/2 -translate-y-1/2 border-t border-r';
    } else if (position === 'right') {
      posClasses = 'left-full ml-5 top-1/2 -translate-y-1/2';
      arrowClasses = 'left-[-7px] top-1/2 -translate-y-1/2 border-b border-l';
    }

    return (
      <div className={`absolute ${posClasses} w-72 p-4 bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-500/80 rounded-2xl text-[11px] text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[99999] shadow-[0_20px_50px_rgba(0,0,0,0.8)] scale-95 group-hover:scale-100`}>
        <div className="font-black text-cyan-300 mb-2 border-b border-slate-700 pb-1.5 uppercase tracking-wider text-xs">{title}</div>
        <div className="leading-relaxed text-[11px] text-gray-300 font-medium">{desc}</div>
        <div className={`absolute w-3.5 h-3.5 bg-slate-900 border-cyan-500/80 rotate-45 ${arrowClasses}`}></div>
      </div>
    );
  };

  const BlackArrow = ({ points }) => (
    <polygon points={points} fill="#020617" stroke="#94a3b8" strokeWidth="1.5" className="z-10" />
  );

  return (
    <div ref={containerRef} className="w-full h-screen bg-[#060b19] text-white overflow-hidden relative">
      
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0b132b] to-[#030712] opacity-100 z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_2px,transparent_2px),linear-gradient(to_bottom,#334155_2px,transparent_2px)] bg-[size:40px_40px] opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-cyan-600/15 blur-[120px] pointer-events-none rounded-full z-0"></div>

      {/* FIXED FULLSCREEN BUTTON */}
      <button onClick={toggleFullScreen} className="absolute top-6 right-8 z-50 px-5 py-3 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-xl border border-slate-500 shadow-[0_0_20px_rgba(0,0,0,0.6)] text-slate-200 hover:text-cyan-400 transition-all flex items-center gap-3">
        <Maximize2 className="w-5 h-5" />
        <span className="font-black tracking-widest text-sm uppercase">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
      </button>

      {/* ABSOLUTE CENTERED CONTAINER */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${scale})`, width: '1500px', height: '920px' }} className="flex flex-col justify-between items-center z-10">
        
        {/* HEADER */}
        <div className="z-10 w-full flex items-center justify-start gap-8 mb-2 pl-4">
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
            Air Conditioning System – Cooling Flow
          </h1>
          <div className={`px-4 py-2 rounded-lg border-2 font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all ${isFaultActive ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : isSystemRunning ? 'bg-[#0f172a]/90 border-cyan-400 text-cyan-300' : 'bg-slate-800/90 border-slate-600 text-slate-400'}`}>
            STATUS: {isFaultActive ? '⚠️ ALARM: SYSTEM TRIPPED' : flowLevel === 0 ? 'SYSTEM STANDBY' : flowLevel < 4 ? 'SYSTEM INITIALIZING...' : 'CYCLE ACTIVE'}
          </div>
        </div>

        {/* HORIZONTAL LIVE FLOW TRACKER */}
        <div className="flex items-center justify-center gap-3 mb-4 w-full bg-slate-900/80 backdrop-blur-lg py-2.5 rounded-xl border-2 border-slate-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 2 && !isFaultActive ? 'border-red-500 bg-red-950/60 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <Settings className={`w-4 h-4 ${flowLevel >= 2 && !isFaultActive ? 'animate-spin' : ''}`} style={flowLevel >= 2 ? { animationDuration: '3s' } : {}} /> COMPRESSOR
           </div>
           <div className={`text-xl transition-colors duration-500 ${flowLevel >= 2 && !isFaultActive ? 'text-red-500 drop-shadow-[0_0_8px_#ef4444]' : 'text-slate-600'}`}>➔</div>
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 2 && !isFaultActive ? 'border-orange-500 bg-orange-950/60 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <Fan className={`w-4 h-4 ${flowLevel >= 2 && !isFaultActive ? 'animate-spin' : ''}`} /> CONDENSER
           </div>
           <div className={`text-xl transition-colors duration-500 ${flowLevel >= 3 && !isFaultActive ? 'text-orange-500 drop-shadow-[0_0_8px_#f97316]' : 'text-slate-600'}`}>➔</div>
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 3 && !isFaultActive ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <Droplet className="w-4 h-4" /> EXPANSION VALVE
           </div>
           <div className={`text-xl transition-colors duration-500 ${flowLevel >= 3 && !isFaultActive ? 'text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]' : 'text-slate-600'}`}>➔</div>
           <div className={`px-4 py-1.5 rounded-lg border-2 font-bold text-xs flex items-center gap-2 transition-all duration-500 ${flowLevel >= 3 && !isFaultActive ? 'border-indigo-400 bg-indigo-950/60 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              <Wind className={`w-4 h-4 ${flowLevel >= 3 && !isFaultActive ? 'animate-pulse' : ''}`} /> EVAPORATOR
           </div>
        </div>

        {/* MIDDLE SECTION: SIDEBAR SCADA + MAIN ENLARGED BOARD */}
        <div className="flex w-full justify-between items-stretch gap-6 relative h-[780px]">
          
          <div className="w-[320px] bg-slate-900/80 backdrop-blur-xl border-2 border-slate-600/70 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col flex-shrink-0 h-full z-20">
             
             <h3 className="text-cyan-300 font-bold text-lg mb-2 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
               <Settings className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} /> SCADA Control
             </h3>
             <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium border-b border-slate-700 pb-4">
               Hardware-grade cooling simulation with clean piping routes & live thermodynamics.
             </p>

             <button onClick={() => setIsFaultActive(!isFaultActive)} className={`w-full py-3 px-4 rounded-xl border-2 text-xs font-mono font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-2 mb-8 shadow-lg ${isFaultActive ? 'bg-red-600 border-red-300 text-white shadow-[0_0_25px_rgba(239,68,68,1)] animate-pulse' : 'bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-900/80 hover:text-white hover:border-red-400'}`}>
               <AlertTriangle className="w-5 h-5" /> {isFaultActive ? 'RESET FAULT STATE' : 'SIMULATE OVERLOAD'}
             </button>

             <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center bg-[#020617] p-3.5 rounded-2xl border border-slate-700 shadow-inner">
                   <span className="text-[11px] font-black tracking-widest text-slate-300 pl-1">MAIN LINE</span>
                   <button onClick={() => { setPowerOn(!powerOn); if(powerOn) setIsFaultActive(false); }} className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 border-2 ${powerOn ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-slate-800 border-slate-600'}`}>
                      <div className={`w-5 h-5 rounded-full transition-all duration-300 ${powerOn ? 'bg-yellow-400 shadow-[0_0_10px_#facc15] translate-x-6' : 'bg-slate-500 translate-x-0'}`}></div>
                   </button>
                </div>
                <div className="flex justify-between items-center bg-[#020617] p-3.5 rounded-2xl border border-slate-700 shadow-inner">
                   <span className="text-[11px] font-black tracking-widest text-slate-300 pl-1">AC UNIT</span>
                   <button onClick={() => { if(powerOn) setAcSwitchOn(!acSwitchOn) }} disabled={!powerOn} className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 border-2 ${!powerOn ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800' : acSwitchOn ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-slate-800 border-slate-600'}`}>
                      <div className={`w-5 h-5 rounded-full transition-all duration-300 ${acSwitchOn ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] translate-x-6' : 'bg-slate-500 translate-x-0'}`}></div>
                   </button>
                </div>
                <div className="flex justify-between items-center bg-[#020617] p-3.5 rounded-2xl border border-slate-700 shadow-inner">
                   <span className="text-[11px] font-black tracking-widest text-slate-300 pl-1">THERMOSTAT</span>
                   <button onClick={() => { if(powerOn && acSwitchOn) setThermostatOn(!thermostatOn) }} disabled={!powerOn || !acSwitchOn} className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 border-2 ${(!powerOn || !acSwitchOn) ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800' : thermostatOn ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : 'bg-slate-800 border-slate-600'}`}>
                      <div className={`w-5 h-5 rounded-full transition-all duration-300 ${thermostatOn ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] translate-x-6' : 'bg-slate-500 translate-x-0'}`}></div>
                   </button>
                </div>
             </div>

             <div className="flex flex-col gap-3 mb-8">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">System Mode</span>
                <div className="p-1.5 bg-[#020617] border border-slate-700 rounded-2xl shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] w-full">
                   <button className="w-full py-4 rounded-xl text-sm font-black tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/80 shadow-[0_0_25px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3">
                     <Snowflake className="w-5 h-5"/> COOLING
                   </button>
                </div>
             </div>

             <div className="flex flex-col gap-3 flex-1 justify-end">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Target Temperature</span>
                <div className={`relative px-5 py-6 rounded-3xl border-2 transition-all duration-500 flex items-center justify-between bg-slate-900/90 w-full shadow-inner ${isSystemRunning ? 'border-cyan-400/80 shadow-[0_0_35px_rgba(34,211,238,0.3)]' : 'border-slate-600 opacity-50'}`}>
                   <button onClick={() => { setTargetTemp(Math.max(16, targetTemp - 1)); }} disabled={!isSystemRunning} className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl hover:bg-slate-700 text-cyan-300 border border-slate-500 shadow-lg transition-transform active:scale-95 disabled:opacity-50 hover:text-white hover:border-cyan-400">
                     <Minus className="w-6 h-6 font-black" />
                   </button>
                   <div className="flex flex-col items-center">
                     <span className="text-4xl font-mono font-black tracking-wider text-cyan-300 drop-shadow-[0_0_15px_#22d3ee]">
                       {targetTemp}°C
                     </span>
                   </div>
                   <button onClick={() => { setTargetTemp(Math.min(30, targetTemp + 1)); }} disabled={!isSystemRunning} className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl hover:bg-slate-700 text-cyan-300 border border-slate-500 shadow-lg transition-transform active:scale-95 disabled:opacity-50 hover:text-white hover:border-cyan-400">
                     <Plus className="w-6 h-6 font-black" />
                   </button>
                </div>
             </div>

          </div>

          <div className="w-[1152px] h-[780px] bg-[#0c1322]/95 backdrop-blur-md border-2 border-slate-600/80 rounded-3xl relative shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex-shrink-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-30 pointer-events-none rounded-3xl"></div>

            <div className="absolute top-[545px] left-[480px] bg-[#020617]/95 backdrop-blur-md border-2 border-red-500/70 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black tracking-wider text-red-400 z-30 whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              [HIGH PRESSURE] HOT GAS (গ্যাসীয়)
            </div>
            
            <div className="absolute top-[695px] left-[380px] bg-[#020617]/95 backdrop-blur-md border-2 border-orange-500/70 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black tracking-wider text-orange-400 z-30 whitespace-nowrap shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              [HIGH PRESSURE] WARM LIQUID (তরল)
            </div>
            
            <div className="absolute top-[280px] left-[200px] bg-[#020617]/95 backdrop-blur-md border-2 border-cyan-400/70 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black tracking-wider text-cyan-300 z-30 whitespace-nowrap shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              [LOW PRESSURE] COLD LIQUID (তরল)
            </div>
            
            <div className="absolute top-[765px] left-[380px] bg-[#020617]/95 backdrop-blur-md border-2 border-indigo-500/70 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black tracking-wider text-indigo-300 z-30 whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              [LOW PRESSURE] COOL GAS (গ্যাসীয়)
            </div>

            {isFaultActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 border-2 border-red-400 text-white px-6 py-2 rounded-xl shadow-[0_0_40px_rgba(239,68,68,1)] z-50 flex items-center gap-3 animate-bounce">
                <AlertTriangle className="w-6 h-6 text-yellow-300 animate-spin" />
                <span className="font-mono font-black text-sm tracking-wider">CRITICAL ALARM: HIGH DISCHARGE PRESSURE OVERLOAD</span>
              </div>
            )}

            <HoverBadge x={540} y={583} num="১" text="উচ্চ চাপের গরম গ্যাস (Discharge Line)" />
            <HoverBadge x={906} y={480} num="২" text="গরম গ্যাস কন্ডেন্সারে যাচ্ছে" />
            <HoverBadge x={550} y={680} num="৩" text="উষ্ণ তরল (Warm Liquid Line)" />
            <HoverBadge x={504} y={318} num="৪" text="বরফ-শীতল তরল (Cold Liquid Line)" />
            <HoverBadge x={784} y={420} num="৫" text="তাপ শুষে নেওয়া গ্যাস (Return Gas)" />
            <HoverBadge x={600} y={750} num="৬" text="কম্প্রেসরে ফিরে যাওয়া গ্যাস (Suction Line)" />
            <HoverBadge x={586} y={180} num="৭" text="রুমের গরম বাতাস প্রবেশ" />
            <HoverBadge x={680} y={240} num="৮" text="বিশুদ্ধ ঠান্ডা বাতাস (Supply Air)" />

            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              <path d="M 144 92 L 250 92" stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M 144 92 L 250 92" stroke="rgba(250,204,21,0.5)" strokeWidth="2" fill="none" />
              <path d="M 314 92 L 390 92" stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M 314 92 L 390 92" stroke="rgba(250,204,21,0.5)" strokeWidth="2" fill="none" />
              
              <path d="M 452 200 L 452 160 L 430 160 L 430 132" stroke="#4ade80" strokeWidth="3" fill="none" strokeDasharray="6 6" className="opacity-70" strokeLinejoin="round" />
              
              <path d="M 430 52 L 430 20 L 25 20 L 25 550 L 150 550" stroke="#a855f7" strokeWidth="3" fill="none" className="opacity-60" strokeLinejoin="round" />
              <path d="M 430 52 L 430 20 L 1110 20 L 1110 560 L 1072 560 A 12 12 0 0 1 1048 560 L 962 560" stroke="#a855f7" strokeWidth="3" fill="none" className="opacity-60" strokeLinejoin="round" />

              {renderPipe(paths.p1, paths.p1Color, flowLevel >= 2, 'hot-gas')}
              {renderPipe(paths.p2, paths.p2Color, flowLevel >= 2, 'hot-gas')}
              {renderPipe(paths.p3, paths.p3Color, flowLevel >= 3, 'liquid')} 
              {renderPipe(paths.p4, paths.p4Color, flowLevel >= 3, 'liquid')} 
              {renderPipe(paths.p5, paths.p5Color, flowLevel >= 3, 'cold-gas')} 
              {renderPipe(paths.p6, paths.p6Color, flowLevel >= 3, 'cold-gas')} 

              <path d="M 780 110 L 586 110 L 586 270" stroke="rgba(255,255,255,0.08)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 780 110 L 586 110 L 586 270" stroke="rgba(249,115,22,0.4)" strokeWidth="2" fill="none" strokeLinejoin="round" />
              
              <path d="M 586 366 L 586 480 L 680 480 L 680 330 A 12 12 0 0 1 680 306 L 680 200 L 782 200" stroke="rgba(255,255,255,0.08)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 586 366 L 586 480 L 680 480 L 680 330 A 12 12 0 0 1 680 306 L 680 200 L 782 200" stroke="rgba(34,211,238,0.4)" strokeWidth="2" fill="none" strokeLinejoin="round" className="transition-colors duration-1000" />

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

              {!isFaultActive && powerOn && ([0, 0.5, 1.0].map(delay => (<motion.circle key={`e1-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)"><animateMotion dur={`${1.5 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 144 92 L 250 92" /></motion.circle>)))}
              {!isFaultActive && powerOn && acSwitchOn && (<>{[0, 0.5, 1.0].map(delay => (<motion.circle key={`e2-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)"><animateMotion dur={`${1.5 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 314 92 L 390 92" /></motion.circle>))} {[0, 0.6, 1.2, 1.8].map(delay => (<motion.circle key={`e3-${delay}`} r="3" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)"><animateMotion dur={`${2.5 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 452 200 L 452 160 L 430 160 L 430 132" /></motion.circle>))}</>)}
              
              {!isFaultActive && flowLevel >= 1 && (
                <>
                  <motion.path d="M 430 52 L 430 20 L 25 20 L 25 550 L 150 550" stroke="#a855f7" strokeWidth="4" strokeDasharray="15 15" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, ease: "linear" }} />
                  <motion.path d="M 430 52 L 430 20 L 1110 20 L 1110 560 L 1072 560 A 12 12 0 0 1 1048 560 L 962 560" stroke="#a855f7" strokeWidth="4" strokeDasharray="15 15" fill="none" animate={{ strokeDashoffset: [0, -30] }} transition={{ repeat: Infinity, duration: 2.5 * animDurationMultiplier, ease: "linear" }} />
                </>
              )}
              
              {!isFaultActive && flowLevel >= 3 && (
                <g> 
                  {[0, 0.5, 1.0].map(delay => (
                    <motion.circle key={`return-air-${delay}`} r="4" fill="#f97316" filter="drop-shadow(0 0 8px #f97316)">
                      <animateMotion dur={`${1.8 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 780 110 L 586 110 L 586 270" />
                    </motion.circle>
                  ))}
                  {[0, 0.5, 1.0].map(delay => (
                    <motion.circle key={`supply-air-${delay}`} r="4" fill="#22d3ee" filter="drop-shadow(0 0 8px #22d3ee)">
                      <animateMotion dur={`${1.8 * animDurationMultiplier}s`} begin={`${delay * animDurationMultiplier}s`} repeatCount="indefinite" path="M 586 366 L 586 480 L 680 480 L 680 330 A 12 12 0 0 1 680 306 L 680 200 L 782 200" />
                    </motion.circle>
                  ))}
                </g>
              )}
            </svg>

            <div className={`absolute top-[650px] left-[620px] bg-[#0b1221]/95 border-2 transition-all duration-1000 ${isFaultActive ? 'border-red-500 shadow-[0_0_20px_#ef4444]' : flowLevel >= 2 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-slate-600'} rounded-lg px-4 py-2 flex items-center gap-3 z-20 backdrop-blur-md`}>
               <Gauge className={`w-5 h-5 ${isFaultActive ? 'text-red-500 animate-bounce' : flowLevel >= 2 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
               <div className="flex flex-col">
                 <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider leading-none">High Side Pressure</span>
                 <span className={`font-mono text-base font-black leading-none mt-1 transition-all ${isFaultActive ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_#ef4444]' : flowLevel >= 2 ? 'text-red-400 drop-shadow-[0_0_8px_#ef4444]' : 'text-gray-500'}`}>
                   {isFaultActive ? '385 PSI (DANGER)' : flowLevel >= 2 ? `${180 + Math.round(inverterLoad * 0.8)} PSI` : '000 PSI'}
                 </span>
               </div>
            </div>

            <div className={`absolute top-[520px] left-[320px] bg-[#0b1221]/95 border-2 transition-all duration-1000 ${flowLevel >= 3 ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'border-slate-600'} rounded-lg px-4 py-2 flex items-center gap-3 z-20 backdrop-blur-md`}>
               <Gauge className={`w-5 h-5 ${flowLevel >= 3 ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
               <div className="flex flex-col">
                 <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider leading-none">Low Side Pressure</span>
                 <span className={`font-mono text-base font-black leading-none mt-1 transition-all ${flowLevel >= 3 ? 'text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]' : 'text-gray-500'}`}>
                   {flowLevel >= 3 ? `${40 + Math.round(inverterLoad * 0.25)} PSI` : '000 PSI'}
                 </span>
               </div>
            </div>

            {/* SUPER HIGH Z-INDEX WRAPPERS FOR TOOLTIPS */}
            <div className="absolute top-[60px] left-[80px] flex flex-col items-center z-20 group hover:z-[9999]">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${powerOn ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_25px_#facc15]' : 'bg-slate-800 border-slate-600'}`}>
                 <Activity className={`w-8 h-8 ${powerOn ? 'text-gray-900' : 'text-yellow-500'}`} />
               </div>
               <span className="text-[10px] font-bold mt-2 text-white flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md"><Plug className="w-3 h-3"/> AC SOURCE</span>
               <Tooltip position="bottom" title="AC Power Source" desc="মূল কাজ: পুরো সিস্টেমে নিরবচ্ছিন্ন 220V এসি বিদ্যুৎ সরবরাহ করা।" />
            </div>

            <div className={`absolute top-[60px] left-[250px] flex flex-col items-center z-20 transition-all group hover:z-[9999] ${!powerOn ? 'opacity-50 grayscale' : ''}`}>
               <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${acSwitchOn ? 'border-yellow-400 bg-yellow-400 shadow-[0_0_25px_#facc15]' : 'border-slate-600 bg-slate-800'}`}>
                 <Power className={`w-8 h-8 ${acSwitchOn ? 'text-gray-900' : 'text-gray-400'}`} />
               </div>
               <span className="text-[10px] font-bold mt-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md">A/C SWITCH</span>
               <Tooltip position="bottom" title="Main Switch" desc="মূল কাজ: রিমোট থেকে সিগন্যাল পেয়ে সিস্টেমের মূল লজিক সার্কিট চালু বা বন্ধ করা।" />
            </div>

            <div className="absolute top-[52px] left-[390px] flex flex-col items-center z-20 group hover:z-[9999]">
               <div className={`w-20 h-20 bg-[#1e293b] border-2 rounded-xl flex flex-col items-center justify-center transition-all ${flowLevel >= 1 ? 'border-purple-400 shadow-[0_0_30px_#a855f7] bg-purple-900/50' : 'border-slate-600'}`}>
                 <Zap className={`w-8 h-8 ${flowLevel >= 1 ? 'text-purple-300 animate-pulse drop-shadow-[0_0_8px_#c084fc]' : 'text-slate-400'}`} />
               </div>
               <span className="text-[9px] font-bold mt-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md text-center whitespace-nowrap">INVERTER DRIVE</span>
               <Tooltip position="bottom" title="Inverter Drive" desc="মূল কাজ: থার্মোস্ট্যাটের ফিডব্যাক অনুযায়ী কম্প্রেসর ও ফ্যানের স্পিড ডায়নামিক্যালি নিয়ন্ত্রণ করা, যা প্রচুর বিদ্যুৎ সাশ্রয় করে।" />
            </div>

            <div className={`absolute top-[200px] left-[420px] flex flex-col items-center z-20 transition-all group hover:z-[9999] ${(!powerOn || !acSwitchOn) ? 'opacity-50 grayscale' : ''}`}>
               <span className="text-[10px] font-bold mb-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md">THERMOSTAT</span>
               <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${thermostatOn ? 'border-green-400 bg-green-400 shadow-[0_0_25px_#4ade80]' : 'border-slate-600 bg-slate-800'}`}>
                 <Thermometer className={`w-8 h-8 ${thermostatOn ? 'text-gray-900' : 'text-gray-400'} ${isSystemRunning ? 'animate-pulse' : ''}`} />
               </div>
               <Tooltip position="bottom" title="Thermostat Sensor" desc="মূল কাজ: রুমের বর্তমান তাপমাত্রা নিখুঁতভাবে পরিমাপ করে ইনভার্টার ড্রাইভকে রিয়েল-টাইম ডেটা পাঠানো।" />
            </div>

            <div className="absolute top-[535px] left-[150px] flex flex-col items-center z-20 group hover:z-[9999]">
               <div className={`w-24 h-24 bg-[#1a233a]/90 backdrop-blur-md border-2 rounded-2xl flex flex-col items-center transition-all duration-1000 relative overflow-hidden ${isFaultActive ? 'border-red-500 shadow-[0_0_40px_#ef4444]' : flowLevel >= 2 ? 'border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'border-slate-500'}`}>
                  
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                      <path d="M 0 50 L 20 50 L 20 15 L 30 15" fill="none" stroke="#334155" strokeWidth="10" strokeLinejoin="round" />
                      <path d="M 100 50 L 80 50 L 80 15 L 70 15" fill="none" stroke="#334155" strokeWidth="10" strokeLinejoin="round" />
                      
                      <rect x="30" y="10" width="40" height="65" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="2" />

                      {flowLevel >= 2 && !isFaultActive && (
                          <motion.g animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, times: [0, 0.35, 0.55, 0.85, 1] }}>
                              <motion.path d="M 0 50 L 20 50 L 20 15 L 35 15" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinejoin="round" style={{ filter: 'blur(1px)' }} />
                              <motion.path d="M 0 50 L 20 50 L 20 15 L 35 15" fill="none" stroke="#e0e7ff" strokeWidth="2" strokeDasharray="3 6" strokeLinejoin="round" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                          </motion.g>
                      )}

                      {flowLevel >= 2 && !isFaultActive && (
                          <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, times: [0, 0.35, 0.55, 0.85, 1] }}>
                              <motion.path d="M 65 15 L 80 15 L 80 50 L 100 50" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinejoin="round" style={{ filter: 'blur(1px)' }} />
                              <motion.path d="M 65 15 L 80 15 L 80 50 L 100 50" fill="none" stroke="#fee2e2" strokeWidth="2" strokeDasharray="3 6" strokeLinejoin="round" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} />
                          </motion.g>
                      )}

                      <motion.rect x="32" y="12" width="36" rx="1"
                          animate={flowLevel >= 2 && !isFaultActive ? {
                              height: [10, 46, 10, 10, 10], 
                              fill: ['#6366f1', '#6366f1', '#ef4444', '#ef4444', '#6366f1'], 
                              filter: ['blur(1px)', 'blur(2px)', 'blur(3px) brightness(1.5)', 'blur(3px) brightness(1.5)', 'blur(1px)']
                          } : { height: 30, fill: '#334155' }}
                          transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, times: [0, 0.35, 0.55, 0.85, 1], ease: "easeInOut" }}
                      />

                      <motion.g
                          animate={flowLevel >= 2 && !isFaultActive ? {
                              y: [22, 58, 22, 22, 22] 
                          } : { y: 42 }}
                          transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, times: [0, 0.35, 0.55, 0.85, 1], ease: "easeInOut" }}
                      >
                          <rect x="32" y="0" width="36" height="15" fill="#cbd5e1" rx="2" />
                          <line x1="32" y1="4" x2="68" y2="4" stroke="#475569" strokeWidth="1.5" />
                          <line x1="32" y1="8" x2="68" y2="8" stroke="#475569" strokeWidth="1.5" />
                          <line x1="32" y1="12" x2="68" y2="12" stroke="#475569" strokeWidth="1.5" />
                          <circle cx="50" cy="15" r="3" fill="#0f172a" />
                      </motion.g>

                      <motion.line x1="50" x2="50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round"
                          animate={flowLevel >= 2 && !isFaultActive ? {
                              y1: [37, 73, 37, 37, 37],
                              y2: [75, 95, 75, 75, 75]
                          } : { y1: 57, y2: 85 }}
                          transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, times: [0, 0.35, 0.55, 0.85, 1], ease: "easeInOut" }}
                      />

                      <circle cx="50" cy="85" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                      <motion.g
                          style={{ transformOrigin: "50px 85px" }}
                          animate={flowLevel >= 2 && !isFaultActive ? {
                              rotate: [0, 180, 360, 360, 360]
                          } : { rotate: 0 }}
                          transition={{ repeat: Infinity, duration: 2 * animDurationMultiplier, times: [0, 0.35, 0.55, 0.85, 1], ease: "easeInOut" }}
                      >
                          <line x1="50" y1="85" x2="50" y2="75" stroke="#94a3b8" strokeWidth="4" />
                          <circle cx="50" cy="75" r="4" fill="#ffffff" />
                      </motion.g>
                  </svg>

               </div>
               <span className="text-xs font-bold mt-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md">COMPRESSOR</span>
               <Tooltip position="top" title="Compressor (কম্প্রেসর)" desc="এসির হৃৎপিণ্ড! মেকানিক্যাল পিস্টনের মাধ্যমে এটি নিম্ন-চাপের গ্যাসকে সজোরে সংকুচিত করে অত্যন্ত উত্তপ্ত ও উচ্চ-চাপের (Super-heated) গ্যাসে পরিণত করে।" />
            </div>

            <div className="absolute top-[535px] left-[850px] flex flex-col items-center z-20 group hover:z-[9999]">
               <div className={`w-28 h-24 bg-[#1a233a]/90 backdrop-blur-md border-2 rounded-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${isFaultActive ? 'border-red-500 shadow-[0_0_40px_#ef4444]' : flowLevel >= 2 ? 'border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.6)]' : 'border-slate-500'}`}>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none z-0">
                     <div ref={condRef}>
                         <Fan className={`w-24 h-24 transition-colors duration-1000 ${isFaultActive || flowLevel >= 2 ? 'text-white' : 'text-slate-400'}`} />
                     </div>
                  </div>
                  
                  <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <defs>
                         <linearGradient id="condCoilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                             <stop offset="0%" stopColor="#ef4444" /> 
                             <stop offset="100%" stopColor="#f97316" /> 
                         </linearGradient>
                     </defs>
                     
                     <path d="M 50 -5 L 50 15 Q 50 25 40 25 L 20 25 Q 10 25 10 35 L 10 45 Q 10 55 20 55 L 80 55 Q 90 55 90 65 L 90 75 Q 90 85 80 85 L 60 85 Q 50 85 50 95 L 50 105"
                           fill="none" stroke={flowLevel >= 2 && !isFaultActive ? "url(#condCoilGradient)" : "#475569"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="opacity-100 transition-colors duration-1000" />
                           
                     {flowLevel >= 2 && !isFaultActive && (
                         <motion.path d="M 50 -5 L 50 15 Q 50 25 40 25 L 20 25 Q 10 25 10 35 L 10 45 Q 10 55 20 55 L 80 55 Q 90 55 90 65 L 90 75 Q 90 85 80 85 L 60 85 Q 50 85 50 95 L 50 105" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 16" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} />
                     )}
                  </svg>
                  
                  {flowLevel >= 2 && !isFaultActive && (
                     <div className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                        {[15, 35, 50, 65, 85].map((x, i) => (
                           <motion.div key={`cond-air-${i}`} className="absolute w-2 h-4 rounded-full blur-[1px]" style={{ left: `${x}%`, top: '115%' }} 
                              animate={{ 
                                 top: ['115%', '-15%'], 
                                 backgroundColor: ['#38bdf8', '#38bdf8', '#ef4444', '#ef4444'], 
                                 scale: [1, 1, 1.5, 2] 
                              }} 
                              transition={{ 
                                 duration: 1.2, 
                                 repeat: Infinity, 
                                 delay: i * 0.25, 
                                 ease: "linear",
                                 times: [0, 0.4, 0.6, 1] 
                              }} 
                           />
                        ))}
                     </div>
                  )}
               </div>
               <span className="text-xs font-bold mt-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md">OUTDOOR CONDENSER</span>
               <Tooltip position="top" title="Outdoor Condenser" desc="ফ্যানের সাহায্যে গরম গ্যাস থেকে বাইরের বাতাসে তাপ বের করে দেয়। ফলে তাপ হারিয়ে গ্যাসটি উচ্চ-চাপের উষ্ণ তরলে পরিণত হয়।" />
            </div>

            <div className="absolute top-[380px] left-[810px] flex flex-col items-center z-20 group hover:z-[9999]">
               <div className={`w-16 h-24 bg-[#1a233a]/90 backdrop-blur-md border-2 rounded-xl flex items-center justify-center relative transition-all duration-1000 overflow-hidden ${flowLevel >= 2 ? 'border-slate-400 shadow-[0_0_20px_rgba(156,163,175,0.4)]' : 'border-slate-600'}`}>
                 <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 60 90">
                    <path d="M 30 90 Q 30 50 55 50" stroke="#ef4444" strokeWidth="8" fill="none" />
                    <path d="M 5 50 Q 30 50 30 0" stroke="#3b82f6" strokeWidth="8" fill="none" />
                 </svg>
                 <Droplet className={`w-6 h-6 absolute z-10 transition-colors duration-1000 ${flowLevel >= 2 ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-slate-500'}`} />
               </div>
               <span className="text-[10px] font-bold mt-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md">REVERSING VALVE</span>
               <Tooltip position="left" title="Reversing Valve" desc="রেফ্রিজারেন্ট প্রবাহের দিক (Flow direction) পরিবর্তন করে। এর মাধ্যমেই এসি কুলিং বা হিটিং মোডে চলতে পারে।" />
            </div>

            <div className="absolute top-[400px] left-[166px] flex flex-col items-center z-20 group hover:z-[9999]">
               <div className={`w-16 h-16 bg-[#1a233a]/90 backdrop-blur-md border-2 rounded-xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${flowLevel >= 3 ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]' : 'border-slate-500'}`}>
                  
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0">
                      <path d="M 35 100 L 35 65 L 47 60 L 53 60 L 65 65 L 65 100 Z" fill={flowLevel >= 3 && !isFaultActive ? "#f97316" : "#334155"} />
                      <path d="M 35 0 L 35 45 L 47 50 L 53 50 L 65 45 L 65 0 Z" fill={flowLevel >= 3 && !isFaultActive ? "#22d3ee" : "#334155"} opacity="0.9" />

                      <path d="M 35 100 L 35 65 L 45 60 L 45 50 L 35 45 L 35 0 M 65 100 L 65 65 L 55 60 L 55 50 L 65 45 L 65 0" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinejoin="round"/>
                      
                      <path d="M 0 55 L 43 55 L 45 52 L 43 49 L 0 49 Z" fill="#cbd5e1" />
                      <rect x="0" y="50" width="43" height="4" fill="#f8fafc" />

                      {flowLevel >= 3 && !isFaultActive && (
                          <g>
                              <motion.line x1="45" y1="50" x2="35" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} />
                              <motion.line x1="50" y1="50" x2="50" y2="15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} />
                              <motion.line x1="55" y1="50" x2="65" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                          </g>
                      )}
                  </svg>

               </div>
               <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md whitespace-nowrap">EXPANSION VALVE</span>
               <Tooltip position="right" title="Expansion Valve" desc="উচ্চ-চাপের উষ্ণ তরলকে অত্যন্ত সরু ছিদ্রপথে পার করে হঠাৎ চাপ কমিয়ে দেয়। ফলে তরলটি মুহূর্তের মধ্যে বরফ-শীতল হয়ে যায়।" />
            </div>

            <div className="absolute top-[270px] left-[530px] flex flex-col items-center z-20 w-32 group hover:z-[9999]">
               <div className={`w-28 h-24 bg-[#1a233a]/90 backdrop-blur-md border-2 rounded-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${flowLevel >= 3 ? 'border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]' : 'border-slate-500'}`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none z-0">
                     <div ref={evapRef}>
                         <Fan className={`w-24 h-24 transition-colors duration-1000 ${flowLevel >= 3 && !isFaultActive ? 'text-white' : 'text-slate-400'}`} />
                     </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <defs>
                         <linearGradient id="evapCoilGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#22d3ee" /> 
                             <stop offset="100%" stopColor="#6366f1" /> 
                         </linearGradient>
                     </defs>
                     <path d="M -5 50 L 15 50 A 15 15 0 0 1 30 35 L 30 25 A 10 10 0 0 1 50 25 L 50 75 A 10 10 0 0 0 70 75 L 70 50 L 105 50"
                           fill="none" stroke={flowLevel >= 3 && !isFaultActive ? "url(#evapCoilGradient)" : "#475569"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="opacity-100 transition-colors duration-1000" />
                     {flowLevel >= 3 && !isFaultActive && (
                         <motion.path d="M -5 50 L 15 50 A 15 15 0 0 1 30 35 L 30 25 A 10 10 0 0 1 50 25 L 50 75 A 10 10 0 0 0 70 75 L 70 50 L 105 50" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 16" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} />
                     )}
                  </svg>
                  {flowLevel >= 3 && !isFaultActive && (
                     <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
                        {[15, 35, 65, 85].map((x, i) => (
                           <motion.div key={`evap-air-${i}`} className="absolute w-2 h-4 rounded-full blur-[1px]" style={{ left: `${x}%`, top: '-15%' }} animate={{ top: ['-15%', '115%'], backgroundColor: ['#f97316', '#f97316', '#22d3ee', '#22d3ee'] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: "linear", times: [0, 0.3, 0.7, 1] }} />
                        ))}
                     </div>
                  )}
               </div>
               <span className="text-[9px] font-bold mt-2 text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 shadow-md text-center whitespace-nowrap">INDOOR EVAPORATOR</span>
               <Tooltip position="top" title="Indoor Evaporator" desc="ব্লোয়ার ফ্যান রুমের গরম বাতাস টানে। বরফ-শীতল কয়েলের মাধ্যমে সেই তাপ শুষে নিয়ে বাতাসকে ঠান্ডা করে পুনরায় রুমে পাঠায়।" />
            </div>

            <div className={`absolute top-[60px] left-[780px] w-64 h-48 border-2 rounded-2xl p-4 transition-all duration-1000 z-20 backdrop-blur-xl flex flex-col items-center justify-between ${getRoomStyle()}`}>
               <div className="w-full text-center border-b border-white/30 pb-2 relative">
                 <span className="font-bold text-sm tracking-widest text-white">ROOM INTERIOR</span>
                 <div className="absolute top-[-5px] right-0">
                    <div ref={snowflakeRef}><Snowflake className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]" /></div>
                 </div>
               </div>
               <div className="flex-1 flex flex-col justify-between items-center w-full pt-3">
                 {!isSystemRunning && !isFaultActive ? (
                    <><div className="h-6"></div><span className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_15px_#f97316]">{currentRoomTemp}°C</span><span className="text-sm font-black tracking-widest text-red-400 animate-pulse bg-red-950/80 px-4 py-1 rounded-full border border-red-500/50 mt-2 shadow-lg">SYSTEM OFF</span></>
                 ) : isFaultActive ? (
                    <><div className="h-6"></div><span className="text-4xl font-mono font-bold text-red-500 animate-pulse drop-shadow-[0_0_15px_#ef4444]">{currentRoomTemp}°C</span><span className="text-xs font-black tracking-widest text-white bg-red-600 px-3 py-1 rounded-full border border-red-400 mt-2 shadow-[0_0_15px_#ef4444]">TRIPPED (OVERHEAT)</span></>
                 ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-cyan-400/50 w-[80%] shadow-inner"><span className="text-xs font-bold text-cyan-300">Set Temp: <span className="text-sm text-white">{targetTemp}°C</span></span></div>
                      <span className="text-5xl font-mono font-bold text-cyan-300 drop-shadow-[0_0_20px_#22d3ee]">{currentRoomTemp}°C</span>
                      <span className="text-[11px] font-bold tracking-widest text-cyan-200 pb-1">INVERTER LOAD: {inverterLoad}%</span>
                    </>
                 )}
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}