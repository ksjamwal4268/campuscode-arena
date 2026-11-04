// 3D flight corridor and scroll animations for landing page
// Uses Three.js for depth perspective + canvas grid + synced DOM stage transitions

(function() {
  'use strict';

  const STAGE_CONFIG = [
    { index: 0, center: 0.04, label: 'THE ARENA ENTRY' },
    { index: 1, center: 0.16, label: 'WHAT IS CAMPUSCODE?' },
    { index: 2, center: 0.28, label: 'THE EXPERIENCE' },
    { index: 3, center: 0.40, label: 'HOW IT WORKS · DISCOVER' },
    { index: 4, center: 0.52, label: 'HOW IT WORKS · TEAM UP' },
    { index: 5, center: 0.64, label: 'HOW IT WORKS · BUILD' },
    { index: 6, center: 0.76, label: 'HOW IT WORKS · SHIP' },
    { index: 7, center: 0.88, label: 'ACTIVE HACKATHONS' },
    { index: 8, center: 0.98, label: 'MISSION CONTROL' }
  ];

  let flightUniverse = null;
  let threeScene = null, threeCamera = null, threeRenderer = null;
  let runwayGrid = null, ceilGrid = null, particleSystem = null;
  let floatingRings = [], floatingMonoliths = [];
  let mouseX = 0, mouseY = 0;
  let targetFlightZ = 450, currentFlightZ = 450;
  let targetProgress = 0, currentProgress = 0;
  let isRunning = false;

  // route check - only mount 3d scene on landing page
  function checkRoute() {
    const path = window.location.pathname;
    const isLanding = (path === '/' || path === '' || path.endsWith('index.html') || window.location.protocol === 'file:');

    if (isLanding) {
      document.body.classList.add('landing-flight-active');
      if (!flightUniverse) {
        buildFlightUniverse();
      } else {
        flightUniverse.style.display = 'block';
      }
      attachCardParallaxTilt();
      if (!isRunning) {
        isRunning = true;
        initThreeJS();
      }
    } else {
      document.body.classList.remove('landing-flight-active');
      if (flightUniverse) {
        flightUniverse.style.display = 'none';
      }
      isRunning = false;
    }
  }

  // build landing dom outside #root
  function buildFlightUniverse() {
    if (document.getElementById('cc-3d-flight-universe')) {
      flightUniverse = document.getElementById('cc-3d-flight-universe');
      return;
    }

    flightUniverse = document.createElement('div');
    flightUniverse.id = 'cc-3d-flight-universe';
    flightUniverse.innerHTML = `
      <!-- scroll runway -->
      <div id="cc-flight-scroll-track"></div>

      <!-- viewport -->
      <div id="cc-flight-sticky-viewport">
        <canvas id="cc-flight-canvas"></canvas>

        <!-- navbar -->
        <header class="cc-flight-nav">
          <button class="cc-nav-brand" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="CampusCode Home">
            <div class="cc-brand-icon">
              <span></span><span></span><span></span>
            </div>
            <div class="cc-brand-text">
              <strong>CAMPUSCODE</strong>
              <small>HACKATHON ARENA</small>
            </div>
          </button>

          <div class="cc-nav-stage-meter" id="ccNavStageMeter">
            <span class="cc-nav-pulse"></span>
            <span class="cc-nav-stage-label" id="ccNavStageLabel">THE ARENA ENTRY</span>
          </div>

          <div class="cc-nav-actions">
            <button class="cc-btn cc-btn-login" onclick="window.location.href='/login'">LOGIN</button>
            <button class="cc-btn cc-btn-primary" onclick="window.location.href='/register'">JOIN CAMPUSCODE ↗</button>
          </div>
        </header>

        <!-- stages -->
        <div id="cc-flight-stages">

          <!-- hero -->
          <div class="cc-stage" data-stage="0">
            <div class="cc-stage-badge">
              <span>CAMPUSCODE · NATIONAL HACKATHON ARENA</span>
            </div>
            <h1 class="cc-hero-title">
              BUILD.<br>
              <span class="text-purple">COMPETE.</span><br>
              SHIP.
            </h1>
            <p class="cc-stage-desc">
              The competitive platform where engineering students turn ambitious ideas into shipped software, verifiable credentials, and proof of work.
            </p>
            <div class="cc-hero-actions">
              <button class="cc-btn cc-btn-primary cc-btn-lg" onclick="window.ccFlyTo(1)">EXPLORE ARENA ↓</button>
              <button class="cc-btn cc-btn-outline cc-btn-lg" onclick="window.location.href='/register'">JOIN AS BUILDER ↗</button>
            </div>
          </div>

          <!-- what is campuscode -->
          <div class="cc-stage stage-hidden" data-stage="1">
            <div class="cc-stage-badge lime-badge">
              <span>ARCHITECTURE & PLATFORM</span>
            </div>
            <h2 class="cc-stage-title">WHERE STUDENTS BUILD.</h2>
            <p class="cc-stage-desc">
              CampusCode connects students, teams, college chapters, and enterprise hackathons into one unified engineering ecosystem.
            </p>
            <div class="cc-card-grid-3">
              <!-- comet card 1 -->
              <div class="cc-comet-card" data-comet="true">
                <div class="cc-comet-glare"></div>
                <div class="cc-comet-visual">
                  <span class="cc-comet-pill"><span class="dot-lime"></span>PRODUCTION</span>
                  <img loading="lazy" src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" alt="Real Impact Terminal" />
                </div>
                <div class="cc-comet-footer">
                  <span>REAL IMPACT</span>
                  <span class="cc-comet-tag">#CC-01</span>
                </div>
                <p class="cc-comet-desc">Build and deploy production software that solves verified enterprise, open-source, and campus challenges.</p>
              </div>

              <!-- comet card 2 -->
              <div class="cc-comet-card" data-comet="true">
                <div class="cc-comet-glare"></div>
                <div class="cc-comet-visual">
                  <span class="cc-comet-pill"><span class="dot-lime"></span>ARENA SCORING</span>
                  <img loading="lazy" src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" alt="Fair Competition Radar" />
                </div>
                <div class="cc-comet-footer">
                  <span>FAIR COMPETITION</span>
                  <span class="cc-comet-tag">#CC-02</span>
                </div>
                <p class="cc-comet-desc">Transparent multi-stage judging, automated repository screening, and live dynamic leaderboards.</p>
              </div>

              <!-- comet card 3 -->
              <div class="cc-comet-card" data-comet="true">
                <div class="cc-comet-glare"></div>
                <div class="cc-comet-visual">
                  <span class="cc-comet-pill"><span class="dot-lime"></span>PASSPORT</span>
                  <img loading="lazy" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" alt="Proof of Work Wave" />
                </div>
                <div class="cc-comet-footer">
                  <span>PROOF OF WORK</span>
                  <span class="cc-comet-tag">#CC-03</span>
                </div>
                <p class="cc-comet-desc">Every commit, sprint, and win is cryptographically bound to your official builder passport.</p>
              </div>
            </div>
          </div>

          <!-- video -->
          <div class="cc-stage stage-hidden" data-stage="2">
            <div class="cc-stage-badge">
              <span>THE EXPERIENCE FILM</span>
            </div>
            <h2 class="cc-stage-title">BUILD TOGETHER.</h2>
            <p class="cc-stage-desc">Experience the energy of 48-hour sprints, high-stakes peer code reviews, and live final showdowns.</p>
            <div class="cc-video-monolith">
              <div class="cc-video-topbar">
                <span>CAMPUSCODE FILM</span>
                <span>WHAT IS CAMPUSCODE? (00:30)</span>
                <span>● AUTO-PLAYING</span>
              </div>
              <div class="cc-video-player-wrap">
                <video id="ccExperienceVideo" src="/videos/what-is-campuscode.mp4" playsinline loop muted autoplay></video>
                <div class="cc-video-hint" id="ccVideoAudioToggle" onclick="window.toggleVideoAudio()">🔊 CLICK FOR SOUND</div>
              </div>
            </div>
          </div>

          <!-- discover -->
          <div class="cc-stage stage-hidden" data-stage="3">
            <div class="cc-stage-badge">
              <span>HOW IT WORKS · DISCOVER</span>
            </div>
            <div class="cc-how-monolith">
              <div class="cc-monolith-header">
                <span class="cc-monolith-pill">PHASE 1 · DISCOVER CHALLENGES</span>
              </div>
              <h3 class="cc-monolith-title">DISCOVER</h3>
              <div class="cc-monolith-subtitle">Find hackathons tailored to your tech stack.</div>
              <p class="cc-monolith-desc">
                Browse national sprints, campus qualifiers, and corporate innovation bounties. Filter by track, prize money, mode, and eligibility to find problems matching your exact strengths.
              </p>
              <div class="cc-tag-cloud">
                <span class="cc-tag"># AI AGENTS</span>
                <span class="cc-tag"># FULL-STACK DEV</span>
                <span class="cc-tag"># DISTRIBUTED SYSTEMS</span>
                <span class="cc-tag"># WEB3 & FINTECH</span>
                <span class="cc-tag"># GENERATIVE UI</span>
              </div>
            </div>
          </div>

          <!-- team up -->
          <div class="cc-stage stage-hidden" data-stage="4">
            <div class="cc-stage-badge lime-badge">
              <span>HOW IT WORKS · TEAM UP</span>
            </div>
            <div class="cc-how-monolith">
              <div class="cc-monolith-header">
                <span class="cc-monolith-pill">PHASE 2 · QUANTUM SQUAD RADAR</span>
              </div>
              <h3 class="cc-monolith-title">TEAM UP</h3>
              <div class="cc-monolith-subtitle">Assemble high-synergy squads or fly solo.</div>
              <p class="cc-monolith-desc">
                Never lose because of missing teammates. Hackmate Radar matches complementary frontend, backend, ML, and UI designers across Anna University, IITs, and top tech institutes.
              </p>
              <div class="cc-tag-cloud">
                <span class="cc-tag" style="border-color: #a8e62e;">✦ Karthik (AI / Python)</span>
                <span class="cc-tag" style="border-color: #7665ff;">✦ Priya (Full-Stack / React)</span>
                <span class="cc-tag" style="border-color: #a8e62e;">✦ Arun (Systems / Rust)</span>
              </div>
            </div>
          </div>

          <!-- build -->
          <div class="cc-stage stage-hidden" data-stage="5">
            <div class="cc-stage-badge">
              <span>HOW IT WORKS · BUILD</span>
            </div>
            <div class="cc-how-monolith">
              <div class="cc-monolith-header">
                <span class="cc-monolith-pill">PHASE 3 · AUTONOMOUS SPRINT ENGINE</span>
              </div>
              <h3 class="cc-monolith-title">BUILD</h3>
              <div class="cc-monolith-subtitle">Build during intense sprints with intelligent copilots.</div>
              <p class="cc-monolith-desc">
                Accelerate with built-in IdeaCheck originality analysis, automated commit telemetry, milestone reminders, and 24/7 RuleBot mentor guidance throughout the hackathon.
              </p>
              <div class="cc-tag-cloud">
                <span class="cc-tag">Milestone Tracking</span>
                <span class="cc-tag">RuleBot Compliance Audits</span>
                <span class="cc-tag">Instant IdeaCheck</span>
              </div>
            </div>
          </div>

          <!-- ship -->
          <div class="cc-stage stage-hidden" data-stage="6">
            <div class="cc-stage-badge lime-badge">
              <span>HOW IT WORKS · SHIP</span>
            </div>
            <div class="cc-how-monolith">
              <div class="cc-monolith-header">
                <span class="cc-monolith-pill">PHASE 4 · DEPLOYMENT & VERIFICATION</span>
              </div>
              <h3 class="cc-monolith-title">SHIP</h3>
              <div class="cc-monolith-subtitle">Deploy verified projects and claim builder medals.</div>
              <p class="cc-monolith-desc">
                Ship live URLs, code repositories, and demo videos directly to the judges. Transparent rubrics evaluate originality, technical depth, and presentation for instant leaderboard points.
              </p>
              <div class="cc-tag-cloud">
                <span class="cc-tag">₹2,50,000+ Prize Pools</span>
                <span class="cc-tag">Verifiable Digital Credentials</span>
                <span class="cc-tag">National Campus Ranks</span>
              </div>
            </div>
          </div>

          <!-- hackathons -->
          <div class="cc-stage stage-hidden" data-stage="7">
            <div class="cc-stage-badge">
              <span>LIVE ARENA</span>
            </div>
            <h2 class="cc-stage-title">ENTER THE ARENA</h2>
            <p class="cc-stage-desc">Real challenges. Real cash prizes. Real engineering recognition.</p>
            <div class="cc-hack-grid">
              <div class="cc-hack-card">
                <span class="cc-hack-badge badge-live">● LIVE SPRINT ACTIVE</span>
                <h3 class="cc-hack-name">FirstCommit National AI Sprint</h3>
                <div class="cc-hack-prize">₹2,50,000 POOL · 1,240 BUILDERS</div>
                <p class="cc-hack-desc">Build autonomous AI agents, tool-calling systems, and multimodal applications in 48 hours.</p>
                <button class="cc-btn cc-btn-primary cc-btn-sm" onclick="window.demoLogin('STUDENT')">ENTER ARENA ↗</button>
              </div>

              <div class="cc-hack-card">
                <span class="cc-hack-badge badge-open">✦ REGISTRATION OPEN</span>
                <h3 class="cc-hack-name">NextWeb Digital Experience Arena</h3>
                <div class="cc-hack-prize">₹1,50,000 POOL · 890 BUILDERS</div>
                <p class="cc-hack-desc">Design and ship high-performance web experiences featuring 3D flight physics and generative UI.</p>
                <button class="cc-btn cc-btn-outline cc-btn-sm" onclick="window.demoLogin('STUDENT')">REGISTER SQUAD ↗</button>
              </div>
            </div>
          </div>

          <!-- final cta -->
          <div class="cc-stage stage-hidden" data-stage="8">
            <div class="cc-stage-badge lime-badge">
              <span>MISSION CONTROL</span>
            </div>
            <h2 class="cc-stage-title">YOUR NEXT PROJECT<br>STARTS HERE.</h2>
            <p class="cc-stage-desc">
              Join 10,000+ student developers across 120+ campuses building the future. Claim your verified builder profile today.
            </p>
            <div class="cc-hero-actions" style="margin-bottom: 20px;">
              <button class="cc-btn cc-btn-primary cc-btn-lg" onclick="window.location.href='/register'">JOIN CAMPUSCODE ↗</button>
              <button class="cc-btn cc-btn-lime cc-btn-lg" onclick="window.demoLogin('STUDENT')">STUDENT DASHBOARD 🎓</button>
              <button class="cc-btn cc-btn-outline cc-btn-lg" onclick="window.location.href='/login'">SIGN IN ↗</button>
            </div>
            <button class="cc-back-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">↑ REPLAY 3D FLIGHT CORRIDOR</button>
          </div>

        </div>

        <!-- hud -->
        <div class="cc-flight-bottom-hud">
          <div class="cc-flight-scroll-pill">
            <span class="cc-scroll-arrow">↓</span>
            <span>SCROLL TO FLY FORWARD THROUGH SPACE</span>
          </div>
        </div>

        <!-- progress bar -->
        <div class="cc-flight-progress-bar" id="ccFlightProgressBar"></div>
      </div>
    `;

    document.body.appendChild(flightUniverse);
  }

  // three.js setup
  function initThreeJS() {
    if (typeof THREE === 'undefined') {
      setTimeout(initThreeJS, 100);
      return;
    }

    const canvas = document.getElementById('cc-flight-canvas');
    const viewport = document.getElementById('cc-flight-sticky-viewport');
    if (!canvas || !viewport) return;

    const w = viewport.clientWidth || window.innerWidth;
    const h = viewport.clientHeight || window.innerHeight;

    // scene background & fog
    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0xf7f7f4);
    threeScene.fog = new THREE.FogExp2(0xf7f7f4, 0.00075);

    // camera
    threeCamera = new THREE.PerspectiveCamera(58, w / h, 0.1, 4500);
    threeCamera.position.set(0, 15, 450);

    // renderer
    threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    threeRenderer.setSize(w, h);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // floor grid
    runwayGrid = new THREE.GridHelper(5000, 160, 0x7665ff, 0xdeded8);
    runwayGrid.position.set(0, -42, -1600);
    threeScene.add(runwayGrid);

    // ceiling grid
    ceilGrid = new THREE.GridHelper(5000, 160, 0xa8e62e, 0xededeb);
    ceilGrid.position.set(0, 115, -1600);
    threeScene.add(ceilGrid);

    // torus rings along z-axis
    floatingRings = [];
    const ringColors = [0x7665ff, 0xa8e62e, 0x7665ff, 0x82b91a, 0x7665ff, 0xa8e62e, 0x7665ff, 0xa8e62e, 0x7665ff];
    for (let i = 0; i < 9; i++) {
      const stageConfig = STAGE_CONFIG[i];
      const portalZ = 450 - (stageConfig.center * 3750);

      const ringGeo = new THREE.TorusGeometry(48, 1.2, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i % ringColors.length],
        transparent: true,
        opacity: 0.42
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 16, portalZ);
      threeScene.add(ring);
      floatingRings.push(ring);
    }

    // floating wireframe shapes
    floatingMonoliths = [];
    for (let i = 0; i < 28; i++) {
      const isIcosa = (i % 2 === 0);
      const geo = isIcosa ? new THREE.IcosahedronGeometry(14, 0) : new THREE.BoxGeometry(16, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x7665ff : 0xa8e62e,
        wireframe: true,
        transparent: true,
        opacity: 0.38
      });
      const mesh = new THREE.Mesh(geo, mat);

      const side = (i % 2 === 0 ? 1 : -1);
      const x = side * (105 + Math.random() * 90);
      const y = -15 + Math.random() * 75;
      const z = 350 - (i * 135);

      mesh.position.set(x, y, z);
      threeScene.add(mesh);
      floatingMonoliths.push({
        mesh: mesh,
        baseY: y,
        rotX: 0.006 + Math.random() * 0.012,
        rotY: 0.008 + Math.random() * 0.014,
        phase: Math.random() * Math.PI * 2
      });
    }

    // particles
    const pCount = 2600;
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const cPurple = new THREE.Color(0x7665ff);
    const cLime = new THREE.Color(0xa8e62e);

    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 650;
      pPos[i + 1] = (Math.random() - 0.5) * 230 + 30;
      pPos[i + 2] = (Math.random() - 0.5) * 4200 - 1500;

      const c = Math.random() > 0.5 ? cPurple : cLime;
      pCol[i] = c.r;
      pCol[i + 1] = c.g;
      pCol[i + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });
    particleSystem = new THREE.Points(pGeo, pMat);
    threeScene.add(particleSystem);

    // mouse move handler
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // resize handler
    window.addEventListener('resize', () => {
      if (!threeCamera || !threeRenderer) return;
      const w2 = viewport.clientWidth || window.innerWidth;
      const h2 = viewport.clientHeight || window.innerHeight;
      threeCamera.aspect = w2 / h2;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(w2, h2);
    });

    startRenderLoop();
  }

  // render loop
  let clock = 0;
  function startRenderLoop() {
    function animate() {
      if (!isRunning) return;
      requestAnimationFrame(animate);
      clock += 0.015;

      // smooth progress and camera position
      currentProgress += (targetProgress - currentProgress) * 0.09;
      currentFlightZ += (targetFlightZ - currentFlightZ) * 0.09;

      if (threeCamera) {
        threeCamera.position.z = currentFlightZ;
        threeCamera.position.x = mouseX * 24;
        threeCamera.position.y = 15 - (mouseY * 16) + Math.sin(clock * 1.2) * 1.4;
        threeCamera.rotation.z = -mouseX * 0.035;
      }

      // rotate rings
      floatingRings.forEach((r, idx) => {
        r.rotation.z += 0.005 * (idx % 2 === 0 ? 1 : -1);
      });

      // float monoliths
      floatingMonoliths.forEach(item => {
        item.mesh.rotation.x += item.rotX;
        item.mesh.rotation.y += item.rotY;
        item.mesh.position.y = item.baseY + Math.sin(clock * 1.5 + item.phase) * 5;
      });

      // spin particle field
      const flightSpeed = Math.abs(targetProgress - currentProgress);
      if (particleSystem) {
        particleSystem.rotation.z += 0.0003 + (flightSpeed * 0.025);
      }

      if (threeRenderer && threeScene && threeCamera) {
        threeRenderer.render(threeScene, threeCamera);
      }

      updateStageTransforms(currentProgress);
    }
    animate();
  }

  // card tilt and cursor glare
  function attachCardParallaxTilt() {
    // general card tilt
    const generalCards = document.querySelectorAll('.cc-how-monolith, .cc-hack-card');
    generalCards.forEach(card => {
      if (card.dataset.tiltActive) return;
      card.dataset.tiltActive = 'true';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotX = (y / -14).toFixed(1);
        const rotY = (x / 16).toFixed(1);
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px) scale(1.02)`;
        card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease';
      });
    });

    // comet cards with dynamic glare
    const cometCards = document.querySelectorAll('.cc-comet-card');
    cometCards.forEach(card => {
      if (card.dataset.cometActive) return;
      card.dataset.cometActive = 'true';

      const glare = card.querySelector('.cc-comet-glare');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xCenter = x - rect.width / 2;
        const yCenter = y - rect.height / 2;

        const rotX = (yCenter / -9).toFixed(2);
        const rotY = (xCenter / 11).toFixed(2);

        card.style.transform = `perspective(850px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(14px) scale(1.025)`;
        card.style.transition = 'transform 0.08s ease-out';

        if (glare) {
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle 190px at ${x}px ${y}px, rgba(118, 101, 255, 0.32), rgba(168, 230, 46, 0.16) 45%, transparent 75%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(850px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
        card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease';
        if (glare) {
          glare.style.opacity = '0';
        }
      });
    });
  }

  // sidebar auto-reveal when hovering near left edge or 3-bar trigger
  function setupHoverSlidebars() {
    let hideTimeout = null;

    document.addEventListener('mousemove', (e) => {
      const activeSidebar = document.querySelector('.student-sidebar');
      if (!activeSidebar) return;

      const triggerBtn = document.getElementById('cc-3lines-trigger');
      const isOverTrigger = triggerBtn && triggerBtn.matches(':hover');
      const isOverSidebar = activeSidebar.matches(':hover') || (e.clientX <= 265 && activeSidebar.classList.contains('hover-expanded'));

      // expand sidebar if cursor is near left edge (within 52px) or hovering trigger
      if (e.clientX <= 52 || isOverTrigger) {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        activeSidebar.classList.add('hover-expanded');
        document.body.classList.add('sidebar-is-expanded');
      } else if (e.clientX > 275 && !isOverTrigger) {
        // collapse when cursor leaves sidebar area into main content
        if (activeSidebar.classList.contains('hover-expanded') && !hideTimeout) {
          hideTimeout = setTimeout(() => {
            activeSidebar.classList.remove('hover-expanded');
            document.body.classList.remove('sidebar-is-expanded');
            hideTimeout = null;
          }, 140);
        }
      }
    }, { passive: true });
  }

  // navigation drawer trigger
  function setupStudentSidebar3Bars() {
    const isStudent = window.location.pathname.startsWith('/student');
    const existingBtn = document.getElementById('cc-3lines-trigger');

    if (!isStudent) {
      if (existingBtn) existingBtn.remove();
      return;
    }

    if (!existingBtn) {
      const btn = document.createElement('button');
      btn.id = 'cc-3lines-trigger';
      btn.className = 'cc-3lines-trigger';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Toggle Navigation Menu');
      btn.setAttribute('title', 'Menu');
      btn.innerHTML = `
        <span class="cc-bar cc-bar-1"></span>
        <span class="cc-bar cc-bar-2"></span>
        <span class="cc-bar cc-bar-3"></span>
      `;

      btn.addEventListener('mouseenter', () => {
        const sidebar = document.querySelector('.student-sidebar');
        if (sidebar) {
          sidebar.classList.add('hover-expanded');
          document.body.classList.add('sidebar-is-expanded');
        }
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sidebar = document.querySelector('.student-sidebar');
        if (sidebar) {
          const isOpen = sidebar.classList.toggle('hover-expanded');
          document.body.classList.toggle('sidebar-is-expanded', isOpen);
        }
      });

      document.body.appendChild(btn);
    }
  }

  // round 1: keep only events, my events, and profile on the left sidebar
  function filterStudentSidebarItems() {
    const isStudent = window.location.pathname.startsWith('/student');
    if (!isStudent) return;

    const sidebarItems = document.querySelectorAll('.student-sidebar .student-nav-item');
    if (!sidebarItems || sidebarItems.length === 0) return;

    const allowedNames = ['events', 'my events', 'profile'];
    let eventsButton = null;
    let hasAllowedActive = false;

    sidebarItems.forEach(item => {
      const text = (item.textContent || '').trim().toLowerCase();
      // check if it matches events, my events, or profile
      const isMyEvents = text.includes('my events');
      const isEvents = text.includes('events') && !isMyEvents;
      const isProfile = text.includes('profile');

      if (isEvents) eventsButton = item;

      if (isMyEvents || isEvents || isProfile) {
        item.classList.add('round1-visible');
        item.style.setProperty('display', 'flex', 'important');
        if (item.classList.contains('active')) {
          hasAllowedActive = true;
        }
      } else {
        item.classList.remove('round1-visible');
        item.style.setProperty('display', 'none', 'important');
      }
    });

    // on initial load, if on overview or disconnected tab, switch to events
    if (!hasAllowedActive && eventsButton && !window.__switchedToEventsOnce) {
      window.__switchedToEventsOnce = true;
      eventsButton.click();
    }
  }

  // update stages based on scroll progress
  function updateStageTransforms(progress) {
    const stageElements = document.querySelectorAll('#cc-flight-stages .cc-stage');
    if (!stageElements || stageElements.length === 0) return;

    const spacing = 0.12;
    let activeStageIndex = 0;
    let minDistance = 999;

    stageElements.forEach((el, idx) => {
      const config = STAGE_CONFIG[idx];
      if (!config) return;

      const diff = (progress - config.center) / spacing;
      const absDiff = Math.abs(diff);

      if (absDiff < minDistance) {
        minDistance = absDiff;
        activeStageIndex = idx;
      }

      // hide stages outside the active window
      if (absDiff >= 0.78) {
        el.classList.add('stage-hidden');
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      el.classList.remove('stage-hidden');

      // translate along z and scale based on scroll distance
      const zTranslate = -diff * 650;
      const scale = 1.0 + (diff * 0.35);

      let opacity = 1.0;
      if (absDiff > 0.35) {
        opacity = Math.max(0, 1.0 - (absDiff - 0.35) / 0.43);
      }

      const blur = Math.max(0, (absDiff - 0.3) * 6);

      el.style.transform = `translate3d(0, 0, ${zTranslate.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : 'none';
      el.style.pointerEvents = (absDiff < 0.4) ? 'auto' : 'none';
    });

    const stageLabel = document.getElementById('ccNavStageLabel');
    if (stageLabel && STAGE_CONFIG[activeStageIndex]) {
      stageLabel.textContent = STAGE_CONFIG[activeStageIndex].label;
    }

    const progressBar = document.getElementById('ccFlightProgressBar');
    if (progressBar) {
      progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    // sync stage 2 video
    const video = document.getElementById('ccExperienceVideo');
    if (video) {
      const videoDist = Math.abs(progress - STAGE_CONFIG[2].center);
      if (videoDist < 0.12) {
        if (video.paused) video.play().catch(() => {});
      } else {
        if (!video.paused) video.pause();
      }
    }
  }

  // scroll handler
  function onScroll() {
    if (!flightUniverse || !isRunning) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = (document.documentElement.scrollHeight || 7000) - window.innerHeight;
    const rawProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

    targetProgress = Math.min(1, Math.max(0, rawProgress));
    targetFlightZ = 450 - (targetProgress * 3750);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // helper functions
  window.ccFlyTo = function(stageIdx) {
    const config = STAGE_CONFIG[stageIdx];
    if (!config) return;
    const maxScroll = (document.documentElement.scrollHeight || 7000) - window.innerHeight;
    const targetScrollY = config.center * maxScroll;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  };

  window.toggleVideoAudio = function() {
    const video = document.getElementById('ccExperienceVideo');
    const hint = document.getElementById('ccVideoAudioToggle');
    if (!video || !hint) return;
    video.muted = !video.muted;
    hint.textContent = video.muted ? '🔊 CLICK FOR SOUND' : '🔇 CLICK TO MUTE';
  };

  // init
  function boot() {
    checkRoute();
    setupHoverSlidebars();
    setupStudentSidebar3Bars();
    filterStudentSidebarItems();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('popstate', () => {
    checkRoute();
    setupStudentSidebar3Bars();
    filterStudentSidebarItems();
  });
  setInterval(() => {
    checkRoute();
    setupStudentSidebar3Bars();
    filterStudentSidebarItems();
  }, 400);

})();
