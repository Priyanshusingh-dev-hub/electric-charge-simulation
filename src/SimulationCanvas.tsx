import React, { useEffect, useRef } from 'react';

type ParticleType = 'proton' | 'electron';

interface Particle { x:number; y:number; type:ParticleType; vx:number; vy:number; }

interface SimProps {
  p1Type: ParticleType; p2Type: ParticleType;
  showArrows:boolean; showDistance:boolean; showField:boolean;
  realTimePhysics:boolean; isPlaying:boolean;
  chargeStrength:number; simSpeed:number;
  onUpdateStats:(dist:number, force:number, status:'ATTRACTION'|'REPULSION')=>void;
  resetTrigger:number;
}

export default function SimulationCanvas(props: SimProps) {
  const {p1Type,p2Type,showArrows,showDistance,showField,realTimePhysics,isPlaying,chargeStrength,simSpeed,onUpdateStats,resetTrigger}=props;
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const p1=useRef<Particle>({x:200,y:300,type:p1Type,vx:0,vy:0});
  const p2=useRef<Particle>({x:600,y:300,type:p2Type,vx:0,vy:0});
  const dragging=useRef<1|2|null>(null);

  useEffect(()=>{ p1.current.type=p1Type },[p1Type]);
  useEffect(()=>{ p2.current.type=p2Type },[p2Type]);

  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    const resize=()=>{ c.width=c.parentElement?.clientWidth||800; c.height=c.parentElement?.clientHeight||600; };
    resize();
    p1.current={x:c.width*.3,y:c.height/2,type:p1Type,vx:0,vy:0};
    p2.current={x:c.width*.7,y:c.height/2,type:p2Type,vx:0,vy:0};
  },[resetTrigger,p1Type,p2Type]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); if(!ctx) return;
    const resize=()=>{ canvas.width=canvas.parentElement?.clientWidth||800; canvas.height=canvas.parentElement?.clientHeight||600; };
    window.addEventListener('resize',resize); resize();

    const pos=(e:MouseEvent|TouchEvent)=>{
      const r=canvas.getBoundingClientRect();
      const t='touches' in e ? e.touches[0] : e as MouseEvent;
      return {x:t.clientX-r.left,y:t.clientY-r.top};
    };
    const down=(e:MouseEvent|TouchEvent)=>{
      const m=pos(e);
      if(Math.hypot(m.x-p1.current.x,m.y-p1.current.y)<42) dragging.current=1;
      else if(Math.hypot(m.x-p2.current.x,m.y-p2.current.y)<42) dragging.current=2;
    };
    const move=(e:MouseEvent|TouchEvent)=>{
      if(!dragging.current) return;
      e.preventDefault(); const m=pos(e);
      const p=dragging.current===1?p1.current:p2.current;
      p.x=m.x;p.y=m.y;p.vx=0;p.vy=0;
    };
    const up=()=>{dragging.current=null};
    canvas.addEventListener('mousedown',down); canvas.addEventListener('mousemove',move);
    window.addEventListener('mouseup',up);
    canvas.addEventListener('touchstart',down,{passive:false});
    canvas.addEventListener('touchmove',move,{passive:false});
    window.addEventListener('touchend',up);

    let frame=0,last=performance.now(),statT=0;
    const drawArrow=(x:number,y:number,a:number,len:number,color:string)=>{
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();
      const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;
      ctx.beginPath();ctx.moveTo(ex,ey);
      ctx.lineTo(ex-Math.cos(a-.55)*14,ey-Math.sin(a-.55)*14);
      ctx.lineTo(ex-Math.cos(a+.55)*14,ey-Math.sin(a+.55)*14);ctx.closePath();ctx.fill();
    };
    const particle=(p:Particle)=>{
      const proton=p.type==='proton', color=proton?'#ef4444':'#3b82f6';
      const g=ctx.createRadialGradient(p.x,p.y,8,p.x,p.y,42);
      g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(p.x,p.y,42,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,26,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='white';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(proton?'+':'−',p.x,p.y+1);
      ctx.font='12px sans-serif';ctx.fillText(proton?'Proton':'Electron',p.x,p.y+43);
    };

    const loop=(time:number)=>{
      const dt=Math.min((time-last)/1000,.05);last=time;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      const dx=p2.current.x-p1.current.x,dy=p2.current.y-p1.current.y;
      const dist=Math.max(Math.hypot(dx,dy),10);
      const q1=p1.current.type==='proton'?1:-1,q2=p2.current.type==='proton'?1:-1;
      const raw=(500000*Math.abs(q1*q2)*chargeStrength)/(dist*dist);
      const f=Math.min(raw,500), attract=q1*q2<0,angle=Math.atan2(dy,dx);

      statT+=dt;if(statT>.1){onUpdateStats(Math.round(dist),Number(raw.toFixed(2)),attract?'ATTRACTION':'REPULSION');statT=0;}

      if(realTimePhysics&&isPlaying&&!dragging.current){
        const dir=attract?1:-1;
        const ax=Math.cos(angle)*f*dir*simSpeed*.1,ay=Math.sin(angle)*f*dir*simSpeed*.1;
        p1.current.vx=(p1.current.vx+ax)*.95;p1.current.vy=(p1.current.vy+ay)*.95;
        p2.current.vx=(p2.current.vx-ax)*.95;p2.current.vy=(p2.current.vy-ay)*.95;
        [p1.current,p2.current].forEach(p=>{p.x+=p.vx;p.y+=p.vy;
          if(p.x<28||p.x>canvas.width-28)p.vx*=-.5,p.x=Math.max(28,Math.min(canvas.width-28,p.x));
          if(p.y<28||p.y>canvas.height-28)p.vy*=-.5,p.y=Math.max(28,Math.min(canvas.height-28,p.y));
        });
      }

      if(showField){
        ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;
        for(let x=25;x<canvas.width;x+=45) for(let y=25;y<canvas.height;y+=45){
          const field=(p:Particle,q:number)=>{
            const X=x-p.x,Y=y-p.y,r2=Math.max(X*X+Y*Y,900),r=Math.sqrt(r2);
            return {x:q*X/(r2*r),y:q*Y/(r2*r)};
          };
          const a=field(p1.current,q1),b=field(p2.current,q2),ex=a.x+b.x,ey=a.y+b.y,m=Math.hypot(ex,ey);
          if(!Number.isFinite(m)||m===0)continue;
          const ux=ex/m,uy=ey/m;
          ctx.beginPath();ctx.moveTo(x-ux*8,y-uy*8);ctx.lineTo(x+ux*8,y+uy*8);ctx.stroke();
        }
      }

      if(showDistance){
        ctx.setLineDash([6,6]);ctx.strokeStyle='#64748b';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(p1.current.x,p1.current.y);ctx.lineTo(p2.current.x,p2.current.y);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#cbd5e1';ctx.font='13px sans-serif';ctx.textAlign='center';
        ctx.fillText(`${Math.round(dist)} px`,p1.current.x+dx/2,p1.current.y+dy/2-12);
      }

      if(showArrows){
        const len=Math.min(Math.max(f*2,25),100);
        if(attract){drawArrow(p1.current.x+Math.cos(angle)*32,p1.current.y+Math.sin(angle)*32,angle,len,'#10b981');
          drawArrow(p2.current.x-Math.cos(angle)*32,p2.current.y-Math.sin(angle)*32,angle+Math.PI,len,'#10b981');}
        else {drawArrow(p1.current.x-Math.cos(angle)*32,p1.current.y-Math.sin(angle)*32,angle+Math.PI,len,'#ef4444');
          drawArrow(p2.current.x+Math.cos(angle)*32,p2.current.y+Math.sin(angle)*32,angle,len,'#ef4444');}
      }
      particle(p1.current);particle(p2.current);
      frame=requestAnimationFrame(loop);
    };
    frame=requestAnimationFrame(loop);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);
      canvas.removeEventListener('mousedown',down);canvas.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);
      canvas.removeEventListener('touchstart',down);canvas.removeEventListener('touchmove',move);window.removeEventListener('touchend',up);};
  },[showArrows,showDistance,showField,realTimePhysics,isPlaying,chargeStrength,simSpeed,onUpdateStats]);

  return <canvas ref={canvasRef} style={{width:'100%',height:'100%',touchAction:'none',cursor:'grab'}} />;
}