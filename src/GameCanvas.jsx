import React, { useRef, useEffect } from 'react';
import { playPopSound } from './audio';

const GameCanvas = ({ 
  gameState, 
  setScore, 
  setLives, 
  lives, 
  round, 
  setRound, 
  onGameOver, 
  onWin,
  sonicScreamReady,
  setSonicScreamReady
}) => {
  const canvasRef = useRef(null);
  
  // Game state refs (mutable without re-rendering)
  const stateRef = useRef({
    animals: [],
    drones: [],
    particles: [],
    shields: [], // shield dots from dragging
    mouse: { x: 0, y: 0, isDragging: false },
    lastTime: 0,
    spawnTimer: 0,
    droneSpawnTimer: 0,
    roundTimer: 0,
    rescuedInRound: 0,
    sonicScreamActive: 0,
    currentRound: 1
  });

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial state
    stateRef.current = {
      ...stateRef.current,
      animals: [],
      drones: [],
      particles: [],
      shields: [],
      lastTime: performance.now(),
      spawnTimer: 0,
      droneSpawnTimer: 0,
      roundTimer: 0,
      rescuedInRound: 0,
      sonicScreamActive: 0,
      currentRound: 1
    };

    let animationFrameId;

    // Helpers
    const spawnAnimal = () => {
      const types = ['blossom', 'buttercup', 'professor', 'mayor', 'bellum', 'octi'];
      const type = types[Math.floor(Math.random() * types.length)];
      const width = 40;
      const x = Math.random() * (canvas.width - width * 2) + width;
      stateRef.current.animals.push({
        x, y: -50, width: 40, height: 40, type,
        bubbled: false, vy: 100 + (stateRef.current.currentRound * 20),
        wobbleOffset: Math.random() * Math.PI * 2
      });
    };

    const spawnDrone = () => {
      const width = 45;
      const speed = 120 + (stateRef.current.currentRound * 25);
      const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      
      let x, y, vx, vy;
      if (edge === 0) { // Top
        x = Math.random() * canvas.width;
        y = -50;
        vx = (Math.random() - 0.5) * speed;
        vy = speed;
      } else if (edge === 1) { // Right
        x = canvas.width + 50;
        y = Math.random() * canvas.height;
        vx = -speed;
        vy = (Math.random() - 0.5) * speed;
      } else if (edge === 2) { // Bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 50;
        vx = (Math.random() - 0.5) * speed;
        vy = -speed;
      } else { // Left
        x = -50;
        y = Math.random() * canvas.height;
        vx = speed;
        vy = (Math.random() - 0.5) * speed;
      }

      stateRef.current.drones.push({
        x, y, width: 45, height: 45, vx, vy
      });
    };

    const spawnParticles = (x, y, color) => {
      for (let i = 0; i < 15; i++) {
        stateRef.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 200,
          vy: (Math.random() - 0.5) * 200,
          life: 1.0,
          color
        });
      }
    };

    const drawBlossom = (ctx, x, y, size) => {
      // Hair (Orange)
      ctx.fillStyle = '#ff7f00';
      ctx.beginPath(); ctx.arc(x, y, size/2 + 2, 0, Math.PI*2); ctx.fill();
      // Bow (Red)
      ctx.fillStyle = '#ff0000';
      ctx.beginPath(); ctx.moveTo(x, y - size/2); ctx.lineTo(x - 15, y - size); ctx.lineTo(x, y - size/2 - 5); ctx.lineTo(x + 15, y - size); ctx.fill();
      // Face (Peach)
      ctx.fillStyle = '#ffddca';
      ctx.beginPath(); ctx.arc(x, y + 2, size/2 - 2, 0, Math.PI*2); ctx.fill();
      // Eyes (Pink)
      ctx.fillStyle = '#ff9ff3';
      ctx.beginPath(); ctx.arc(x - 8, y + 2, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8, y + 2, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x - 8, y + 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8, y + 2, 3, 0, Math.PI*2); ctx.fill();
      // Dress (Pink)
      ctx.fillStyle = '#ff9ff3';
      ctx.fillRect(x - 10, y + size/2 - 4, 20, 10);
    };

    const drawButtercup = (ctx, x, y, size) => {
      // Hair (Black)
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x, y, size/2 + 2, 0, Math.PI*2); ctx.fill();
      // Hair flips
      ctx.beginPath(); ctx.moveTo(x - size/2, y); ctx.lineTo(x - size/2 - 10, y + 10); ctx.lineTo(x - size/2 + 5, y + 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + size/2, y); ctx.lineTo(x + size/2 + 10, y + 10); ctx.lineTo(x + size/2 - 5, y + 5); ctx.fill();
      // Face
      ctx.fillStyle = '#ffddca';
      ctx.beginPath(); ctx.arc(x, y + 2, size/2 - 2, 0, Math.PI*2); ctx.fill();
      // Eyes (Green, angry angle)
      ctx.fillStyle = '#2ed573';
      ctx.beginPath(); ctx.arc(x - 8, y + 2, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8, y + 2, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x - 8, y + 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8, y + 2, 3, 0, Math.PI*2); ctx.fill();
      // Angry eyebrows
      ctx.lineWidth = 2; ctx.strokeStyle = '#000';
      ctx.beginPath(); ctx.moveTo(x - 15, y - 5); ctx.lineTo(x - 2, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 15, y - 5); ctx.lineTo(x + 2, y); ctx.stroke();
      // Dress (Green)
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(x - 10, y + size/2 - 4, 20, 10);
    };

    const drawProfessor = (ctx, x, y, size) => {
      // Head (tall rectangle)
      ctx.fillStyle = '#ffddca';
      ctx.fillRect(x - 12, y - size/2, 24, size);
      // Hair (Black boxy)
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 14, y - size/2 - 5, 28, 10);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x - 5, y - 5, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 5, y - 5, 2, 0, Math.PI*2); ctx.fill();
      // Pipe
      ctx.fillStyle = '#555';
      ctx.fillRect(x + 5, y + 5, 15, 3);
      ctx.fillRect(x + 17, y + 2, 5, 6);
      // Coat
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 15, y + size/2 - 5, 30, 15);
      // Tie
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 2, y + size/2 - 5, 4, 10);
    };

    const drawMayor = (ctx, x, y, size) => {
      // Hat (Purple top hat)
      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(x - 10, y - size/2 - 15, 20, 20);
      ctx.fillRect(x - 15, y - size/2 + 5, 30, 4);
      // Face
      ctx.fillStyle = '#ffddca';
      ctx.beginPath(); ctx.arc(x, y + 10, size/2 - 4, 0, Math.PI*2); ctx.fill();
      // Monocle
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + 6, y + 6, 4, 0, Math.PI*2); ctx.stroke();
      // Mustache (White big)
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x - 6, y + 15, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 6, y + 15, 6, 0, Math.PI*2); ctx.fill();
    };

    const drawBellum = (ctx, x, y, size) => {
      // Massive Orange Hair hiding face
      ctx.fillStyle = '#e67e22';
      ctx.beginPath(); ctx.arc(x, y - 5, size/2 + 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - 10, y + 10, size/2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 10, y + 10, size/2, 0, Math.PI*2); ctx.fill();
      // Red Dress body
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath(); ctx.moveTo(x - 10, y + size/2 - 5); ctx.lineTo(x + 10, y + size/2 - 5); 
      ctx.lineTo(x + 15, y + size/2 + 15); ctx.lineTo(x - 15, y + size/2 + 15); ctx.fill();
    };

    const drawOcti = (ctx, x, y, size) => {
      // Purple Octopus
      ctx.fillStyle = '#a29bfe';
      ctx.beginPath(); ctx.arc(x, y - 5, size/2 - 2, 0, Math.PI*2); ctx.fill();
      // Tentacles
      for(let i=0; i<4; i++) {
         ctx.beginPath(); ctx.arc(x - 12 + i*8, y + 10, 5, 0, Math.PI*2); ctx.fill();
      }
      // Eyes (Button eyes)
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x - 6, y - 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 6, y - 2, 3, 0, Math.PI*2); ctx.fill();
      // X in eyes
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 8, y - 4); ctx.lineTo(x - 4, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x - 8, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x + 8, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 8, y - 4); ctx.lineTo(x + 4, y); ctx.stroke();
    };

    const drawDrone = (ctx, x, y, size) => {
      ctx.fillStyle = '#2d3436';
      // Main UFO body
      ctx.beginPath(); ctx.ellipse(x, y, size, size/2, 0, 0, Math.PI*2); ctx.fill();
      // Dome
      ctx.fillStyle = 'rgba(116, 185, 255, 0.6)';
      ctx.beginPath(); ctx.ellipse(x, y - size/4, size/1.5, size/2.5, 0, Math.PI, 0); ctx.fill();
      // Brain/Eye (Mojo Jojo style)
      ctx.fillStyle = '#ff7675';
      ctx.beginPath(); ctx.arc(x, y - size/4, size/3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#d63031';
      ctx.beginPath(); ctx.arc(x, y - size/4, size/6, 0, Math.PI*2); ctx.fill();
      // Lights
      ctx.fillStyle = '#feca57';
      ctx.beginPath(); ctx.arc(x - size/1.5, y, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + size/1.5, y, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y + size/3, 4, 0, Math.PI*2); ctx.fill();
    };

    const drawBubble = (ctx, x, y, size) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(72, 219, 251, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, size/2 + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x - size/4, y - size/4, 8, 4, -Math.PI/4, 0, Math.PI * 2);
      ctx.fill();
    };

    const update = (time) => {
      let dt = (time - stateRef.current.lastTime) / 1000;
      stateRef.current.lastTime = time;
      if (dt > 0.1) dt = 0.016; // Clamp dt if tab was hidden to prevent instant game overs

      const s = stateRef.current;

      // Sonic Scream effect
      if (s.sonicScreamActive > 0) {
        s.sonicScreamActive -= dt;
        if (s.sonicScreamActive <= 0) s.sonicScreamActive = 0;
      }

      // Spawning
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        spawnAnimal();
        s.spawnTimer = Math.max(0.5, 2.5 - (s.currentRound * 0.15));
      }

      s.droneSpawnTimer -= dt;
      if (s.droneSpawnTimer <= 0) {
        if (Math.random() < 0.5 + (s.currentRound * 0.05)) {
          spawnDrone();
        }
        s.droneSpawnTimer = Math.max(1, 3 - (s.currentRound * 0.2));
      }

      // Round logic
      if (s.rescuedInRound >= 5 + s.currentRound * 2) {
        s.rescuedInRound = 0;
        if (s.currentRound < 12) {
          s.currentRound++;
          setRound(s.currentRound); // update UI
          if (s.currentRound % 3 === 0) setSonicScreamReady(true);
        } else {
          onWin();
          return;
        }
      }

      // Update Shield (fade out old shield parts)
      s.shields = s.shields.filter(sh => {
        sh.life -= dt * 2;
        return sh.life > 0;
      });

      // Update Animals
      for (let i = s.animals.length - 1; i >= 0; i--) {
        const a = s.animals[i];
        if (a.bubbled) {
          a.y -= (150 * dt); // Float up
          a.x += Math.sin(time / 200 + a.wobbleOffset) * 1; // Wobble
          
          if (a.y < -50) {
            // Rescued!
            s.animals.splice(i, 1);
            setScore(sc => sc + 10);
            s.rescuedInRound++;
            spawnParticles(a.x, 0, '#fff');
          }
        } else {
          a.y += a.vy * dt; // Fall down
          if (a.y > canvas.height + 50) {
            // Fell to ground!
            s.animals.splice(i, 1);
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) setTimeout(onGameOver, 0);
              return newLives;
            });
            spawnParticles(a.x, canvas.height, '#ff9ff3');
          }
        }
      }

      // Update Drones
      for (let i = s.drones.length - 1; i >= 0; i--) {
        const d = s.drones[i];
        
        // Push drone away with shield
        for (const sh of s.shields) {
          const dx = d.x - sh.x;
          const dy = d.y - sh.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 60) {
            d.vx += (dx / dist) * 200 * dt;
            d.vy -= 150 * dt; // Push up
          }
        }

        // Chase bubbled animals
        let target = null;
        let minDist = Infinity;
        for (const a of s.animals) {
          if (a.bubbled && a.y > 0) {
            const dist = Math.hypot(a.x - d.x, a.y - d.y);
            if (dist < minDist) {
              minDist = dist;
              target = a;
            }
          }
        }
        
        if (target) {
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const mag = Math.sqrt(dx*dx + dy*dy) || 1;
          const speed = 120 + (s.currentRound * 25);
          // Steer towards target
          d.vx += (dx / mag * speed - d.vx) * dt * 2.5;
          d.vy += (dy / mag * speed - d.vy) * dt * 2.5;
        }

        d.x += d.vx * dt;
        d.y += d.vy * dt;

        // Check collision with bubbled animals
        let droneDestroyed = false;
        for (let j = s.animals.length - 1; j >= 0; j--) {
          const a = s.animals[j];
          if (a.bubbled) {
            const dist = Math.hypot(d.x - a.x, d.y - a.y);
            if (dist < (d.width/2 + a.width/2 + 10)) {
              // Pop!
              a.bubbled = false;
              a.vy = 200; // fall faster after pop
              spawnParticles(a.x, a.y, '#48dbfb');
              // drone gets destroyed on pop
              s.drones.splice(i, 1);
              droneDestroyed = true;
              break;
            }
          }
        }

        if (droneDestroyed) continue;

        // Despawn if way off screen
        if (d.x < -200 || d.x > canvas.width + 200 || d.y < -200 || d.y > canvas.height + 200) {
          s.drones.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Draw everything
      // Background gradient based on round
      const skyHue = 200 - (s.currentRound * 5); // gets slightly darker/purple
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, `hsl(${skyHue}, 80%, 70%)`);
      grad.addColorStop(1, `hsl(${skyHue}, 60%, 90%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds (static background elements, simplified)
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(100, 100, 50, 0, Math.PI*2);
      ctx.arc(150, 100, 60, 0, Math.PI*2);
      ctx.arc(200, 100, 40, 0, Math.PI*2);
      ctx.fill();

      // Sonic Scream overlay
      if (s.sonicScreamActive > 0) {
        ctx.fillStyle = `rgba(251, 197, 49, ${s.sonicScreamActive * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${s.sonicScreamActive})`;
        ctx.font = 'bold 60px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("SONIC SCREAM!", canvas.width/2, canvas.height/2);
      }

      // Draw shield trail
      s.shields.forEach(sh => {
        ctx.fillStyle = `rgba(72, 219, 251, ${sh.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 25, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${sh.life})`;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 10, 0, Math.PI*2);
        ctx.fill();
      });

      // Draw Characters
      s.animals.forEach(a => {
        if (a.bubbled) drawBubble(ctx, a.x, a.y, a.width);
        if (a.type === 'blossom') drawBlossom(ctx, a.x, a.y, a.width);
        else if (a.type === 'buttercup') drawButtercup(ctx, a.x, a.y, a.width);
        else if (a.type === 'professor') drawProfessor(ctx, a.x, a.y, a.width);
        else if (a.type === 'mayor') drawMayor(ctx, a.x, a.y, a.width);
        else if (a.type === 'bellum') drawBellum(ctx, a.x, a.y, a.width);
        else if (a.type === 'octi') drawOcti(ctx, a.x, a.y, a.width);
      });

      // Draw Drones
      s.drones.forEach(d => {
        drawDrone(ctx, d.x, d.y, d.width);
      });

      // Draw Particles
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + p.life * 3, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState, setScore, setLives, setRound, onGameOver, onWin, setSonicScreamReady]);

  // Handle Input
  const handlePointerDown = (e) => {
    if (gameState !== 'playing') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    stateRef.current.mouse.isDragging = true;
    stateRef.current.mouse.x = x;
    stateRef.current.mouse.y = y;

    // Check click on animal (with generous hitbox)
    let clickedAnimal = false;
    for (let a of stateRef.current.animals) {
      if (!a.bubbled && Math.hypot(a.x - x, a.y - y) < a.width + 15) {
        a.bubbled = true;
        clickedAnimal = true;
        playPopSound(); // cute pop sound
        // spawn click particles
        for(let i=0; i<5; i++) {
          stateRef.current.particles.push({
             x, y, vx: (Math.random()-0.5)*100, vy: (Math.random()-0.5)*100, life: 0.8, color: '#48dbfb'
          });
        }
      }
    }

    if (!clickedAnimal) {
       // Add initial shield dot
       stateRef.current.shields.push({ x, y, life: 1.0 });
    }
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.mouse.isDragging || gameState !== 'playing') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check distance from last shield dot to add a new one (throttle and interpolate)
    const shields = stateRef.current.shields;
    if (shields.length === 0) {
      stateRef.current.shields.push({ x, y, life: 1.0 });
    } else {
      const last = shields[shields.length-1];
      const dist = Math.hypot(last.x - x, last.y - y);
      if (dist > 10) {
        // Interpolate to create a continuous trail of bubbles
        const steps = Math.floor(dist / 10);
        for (let i = 1; i <= steps; i++) {
          const ix = last.x + (x - last.x) * (i / steps);
          const iy = last.y + (y - last.y) * (i / steps);
          stateRef.current.shields.push({ x: ix, y: iy, life: 1.0 });
        }
      }
    }
  };

  const handlePointerUp = () => {
    stateRef.current.mouse.isDragging = false;
  };

  useEffect(() => {
    const triggerSonicScream = () => {
      if (sonicScreamReady && gameState === 'playing') {
        stateRef.current.sonicScreamActive = 1.0;
        
        // Pop all drones
        stateRef.current.drones.forEach(d => {
          for (let i = 0; i < 15; i++) {
            stateRef.current.particles.push({
              x: d.x, y: d.y, vx: (Math.random()-0.5)*400, vy: (Math.random()-0.5)*400, life: 1.0, color: '#fbc531'
            });
          }
        });
        stateRef.current.drones = [];
        
        setSonicScreamReady(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // prevent default scrolling
        triggerSonicScream();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-sonic-scream', triggerSonicScream);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-sonic-scream', triggerSonicScream);
    };
  }, [sonicScreamReady, setSonicScreamReady, gameState]);

  return (
    <canvas 
      ref={canvasRef} 
      className="game-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export default GameCanvas;
