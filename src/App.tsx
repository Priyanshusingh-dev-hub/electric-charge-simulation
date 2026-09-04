import { useState } from 'react';
import SimulationCanvas from './SimulationCanvas';

type ParticleType='proton'|'electron';

export default function App(){
 const [p1Type,setP1Type]=useState<ParticleType>('proton');
 const [p2Type,setP2Type]=useState<ParticleType>('electron');
 const [showArrows,setShowArrows]=useState(true),[showDistance,setShowDistance]=useState(true),[showField,setShowField]=useState(false),[realTimePhysics,setRealTimePhysics]=useState(false);
 const [isPlaying,setIsPlaying]=useState(false),[chargeStrength,setChargeStrength]=useState(1),[simSpeed,setSimSpeed]=useState(1),[resetTrigger,setResetTrigger]=useState(0);
 const [dist,setDist]=useState(400),[force,setForce]=useState(0),[status,setStatus]=useState<'ATTRACTION'|'REPULSION'>('ATTRACTION');
 const chintu=()=>p1Type!==p2Type?"Arre! Ek positive aur ek negative charge hai. Opposite charges ek dusre ko attract karte hain! ❤️":p1Type==='proton'?"Dono positive hain! Like charges ek dusre ko repel karte hain! 💥":"Dono negative electrons hain! Like charges hamesha repel karenge! 💥";
 const reset=()=>{setP1Type('proton');setP2Type('electron');setIsPlaying(false);setResetTrigger(x=>x+1)};
 return <div className="app">
  <main className="sim-area">
   <div className="topbar">
    <div className="card title-card"><span style={{fontSize:24}}>⚡</span><h1>Electric Charge Simulation</h1></div>
    <div className="card stats"><div><div className="stat-label">Distance (r)</div><div className="stat-value">{dist} px ({(dist*.01).toFixed(2)}m)</div></div><div className="divider"/><div><div className="stat-label">Force (F)</div><div className="stat-value">{force} N</div></div></div>
   </div>
   <div className="canvas-wrap"><SimulationCanvas p1Type={p1Type} p2Type={p2Type} showArrows={showArrows} showDistance={showDistance} showField={showField} realTimePhysics={realTimePhysics} isPlaying={isPlaying} chargeStrength={chargeStrength} simSpeed={simSpeed} onUpdateStats={(d,f,s)=>{setDist(d);setForce(f);setStatus(s)}} resetTrigger={resetTrigger}/></div>
   <div className="bottom">
    <div className="card chintu"><div className="alien">👽</div><div><div className="chintu-title">Chintu Alien Explains! 🧠</div><div className="chintu-text">{chintu()}</div></div></div>
    <div className="card status-card"><div className="small">Coulomb's Law</div><div className="formula">F = k |q₁q₂| / r²</div><div className={status==='ATTRACTION'?'attract':'repel'}>{status==='ATTRACTION'?'🟢 ATTRACTION ❤️':'🔴 REPULSION 💥'}</div></div>
   </div>
  </main>
  <aside className="controls">
   <h2>⚙️ Simulation Controls</h2>
   <div className="section"><div className="section-title">PARTICLES</div>
    <label>Particle 1</label><select value={p1Type} onChange={e=>setP1Type(e.target.value as ParticleType)}><option value="proton">Proton (+)</option><option value="electron">Electron (-)</option></select>
    <label>Particle 2</label><select value={p2Type} onChange={e=>setP2Type(e.target.value as ParticleType)}><option value="proton">Proton (+)</option><option value="electron">Electron (-)</option></select>
   </div>
   <div className="section"><div className="section-title">VISUAL TOGGLES</div>
    {[['Show Force Arrows',showArrows,setShowArrows],['Show Distance',showDistance,setShowDistance],['Show Field Lines',showField,setShowField],['Real-time Physics',realTimePhysics,setRealTimePhysics]].map(([n,v,s])=><label className="toggle" key={String(n)}><input type="checkbox" checked={Boolean(v)} onChange={e=>(s as any)(e.target.checked)}/>{String(n)}</label>)}
   </div>
   <div className="section"><div className="section-title">ADVANCED</div>
    <div className="range-row"><span>Charge Strength</span><span>{chargeStrength.toFixed(1)}x</span></div><input type="range" min=".1" max="5" step=".1" value={chargeStrength} onChange={e=>setChargeStrength(+e.target.value)}/>
    {realTimePhysics&&<><div className="range-row"><span>Simulation Speed</span><span>{simSpeed}x</span></div><input type="range" min=".5" max="2" step=".5" value={simSpeed} onChange={e=>setSimSpeed(+e.target.value)}/><button className={'primary '+(isPlaying?'pause':'')} onClick={()=>setIsPlaying(!isPlaying)}>{isPlaying?'⏸ Pause Simulation':'▶ Start Physics'}</button></>}
   </div>
   <button className="reset" onClick={reset}>↻ Reset Default Experiment</button>
  </aside>
 </div>
}