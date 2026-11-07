const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const REMOTE_BACKEND = 'https://campuscode-backend-bszo.onrender.com/api';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// mock data for local testing
const MOCK_STUDENT_USER = {
  _id: 'usr_demo_student_01',
  id: 'usr_demo_student_01',
  name: 'Karthik Raja',
  email: 'karthik@campuscode.co.in',
  role: 'STUDENT',
  campusId: 'CC-CHENNAI-802',
  college: 'Anna University, CEG Campus',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  bio: 'Building AI agents and modern web experiences.',
  phone: '+91 98765 43210',
  skills: ['React', 'TypeScript', 'Python', 'TailwindCSS', 'Node.js'],
  stats: { registered: 3, ongoing: 1, completed: 2, certificates: 2, points: 1420 },
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Karthik'
};

const MOCK_ORGANIZER_USER = {
  _id: 'usr_demo_org_01',
  id: 'usr_demo_org_01',
  name: 'Priya Narayanan',
  email: 'priya.organizer@campuscode.co.in',
  role: 'ORGANIZER',
  organization: 'Chennai Tech Council',
  phone: '+91 98401 23456',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya'
};

const MOCK_ADMIN_USER = {
  _id: 'usr_demo_admin_01',
  id: 'usr_demo_admin_01',
  name: 'CampusCode Administrator',
  email: 'admin@campuscode.co.in',
  role: 'ADMIN',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
};

// Available events for discovery
const MOCK_HACKATHONS = [
  {
    _id: 'hack_01',
    id: 'hack_01',
    code: 'CC-AI-01',
    title: 'FirstCommit National AI Sprint',
    name: 'FirstCommit National AI Sprint',
    hackathon_name: 'FirstCommit National AI Sprint',
    tagline: 'Build production-grade AI agents in 48 hours',
    description: 'The premier national student hackathon challenging innovators to design, test, and ship autonomous AI agents and intelligent systems.',
    short_description: 'Build production-grade AI agents in 48 hours.',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    banner_web_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    status: 'LIVE SPRINT',
    state: 'LIVE',
    event_type: 'hackathon',
    mode: 'ONLINE',
    event_mode: 'ONLINE',
    max_team_size: 4,
    team_size: '2 - 4 Builders',
    prizePool: '₹2,50,000',
    participantsCount: 1240,
    startDate: '2026-11-15T09:00:00Z',
    start_date: '2026-11-15T09:00:00Z',
    endDate: '2026-11-17T18:00:00Z',
    track: 'Artificial Intelligence',
    tracks: ['Artificial Intelligence', 'Agentic Workflows', 'Developer Tools'],
    organizer: 'CampusCode Chennai',
    rounds: [
      { round: 1, name: 'Idea Submission', status: 'COMPLETED' },
      { round: 2, name: 'Prototype Build', status: 'ACTIVE' },
      { round: 3, name: 'Grand Finale Demo', status: 'UPCOMING' }
    ]
  },
  {
    _id: 'hack_02',
    id: 'hack_02',
    code: 'CC-WEB-02',
    title: 'NextWeb Digital Experience Arena',
    name: 'NextWeb Digital Experience Arena',
    hackathon_name: 'NextWeb Digital Experience Arena',
    tagline: 'Design and ship the future of interactive web applications',
    description: 'Frontend and full-stack battleground focused on fluid micro-interactions, generative UI, and 3D web experiences.',
    short_description: 'Fluid micro-interactions, generative UI, and 3D web experiences.',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    banner_web_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    status: 'OPEN',
    state: 'OPEN',
    event_type: 'hackathon',
    mode: 'HYBRID · CHENNAI',
    event_mode: 'HYBRID',
    max_team_size: 3,
    team_size: '1 - 3 Builders',
    prizePool: '₹1,50,000',
    participantsCount: 860,
    startDate: '2026-11-25T10:00:00Z',
    start_date: '2026-11-25T10:00:00Z',
    endDate: '2026-11-27T20:00:00Z',
    track: 'Web Development',
    tracks: ['Web Development', 'UI/UX Design', 'Full-stack Systems']
  },
  {
    _id: 'hack_03',
    id: 'hack_03',
    code: 'CC-IOT-03',
    title: 'Smart Campus IoT & Hardware Hack',
    name: 'Smart Campus IoT & Hardware Hack',
    hackathon_name: 'Smart Campus IoT & Hardware Hack',
    tagline: 'Intelligent automation for modern university campuses',
    description: 'Build connected sensor networks and ambient intelligence systems to improve student living, lab equipment monitoring, and green campus operations.',
    short_description: 'Connected sensor networks and ambient intelligence systems.',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    banner_web_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    status: 'UPCOMING',
    state: 'UPCOMING',
    event_type: 'hackathon',
    mode: 'IN-PERSON',
    event_mode: 'IN-PERSON',
    max_team_size: 4,
    team_size: '2 - 4 Builders',
    prizePool: '₹1,00,000',
    participantsCount: 540,
    startDate: '2026-12-05T09:00:00Z',
    start_date: '2026-12-05T09:00:00Z',
    endDate: '2026-12-06T18:00:00Z',
    track: 'Smart Technology',
    tracks: ['Smart Technology', 'IoT Hardware', 'Sustainability']
  },
  {
    _id: 'quiz_01',
    id: 'quiz_01',
    code: 'CC-QZ-01',
    title: 'Algorithms & Distributed Systems Quiz',
    name: 'Algorithms & Distributed Systems Quiz',
    hackathon_name: 'Algorithms & Distributed Systems Quiz',
    tagline: 'Timed 30-minute speed evaluation',
    description: 'Compete in a timed 30-minute speed evaluation on data structures, algorithmic complexity, and concurrency.',
    short_description: 'Timed 30-minute speed evaluation on algorithms.',
    banner: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    banner_web_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    state: 'OPEN',
    event_type: 'quiz',
    mode: 'ONLINE',
    event_mode: 'ONLINE',
    max_team_size: 1,
    team_size: 'Solo Builder',
    prizePool: '₹50,000',
    participantsCount: 920,
    startDate: '2026-11-12T14:00:00Z',
    start_date: '2026-11-12T14:00:00Z',
    endDate: '2026-11-12T15:00:00Z',
    track: 'Computer Science',
    tracks: ['Algorithms', 'Data Structures']
  }
];

// Student's registered events (My Events)
const MOCK_MY_HACKATHONS = [
  {
    _id: 'reg_01',
    id: 'reg_01',
    hackathon_id: 'hack_01',
    participant_id: 'CC-CHENNAI-802',
    registration_id: 'REG-2026-CC-8942',
    registration_status: 'CONFIRMED · ROUND 2 ACTIVE',
    status: 'ACTIVE',
    title: 'FirstCommit National AI Sprint',
    name: 'FirstCommit National AI Sprint',
    hackathon_name: 'FirstCommit National AI Sprint',
    banner_web_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-11-15T09:00:00Z',
    startDate: '2026-11-15T09:00:00Z',
    team_name: 'NeuralFounders',
    team: { id: 'team_01', name: 'NeuralFounders' },
    hackathon: {
      id: 'hack_01',
      title: 'FirstCommit National AI Sprint',
      name: 'FirstCommit National AI Sprint',
      banner_web_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Build production-grade AI agents in 48 hours',
      description: 'The premier national student hackathon challenging innovators to design, test, and ship autonomous AI agents and intelligent systems.'
    }
  },
  {
    _id: 'reg_02',
    id: 'reg_02',
    hackathon_id: 'hack_02',
    participant_id: 'CC-CHENNAI-802',
    registration_id: 'REG-2026-CC-4190',
    registration_status: 'CONFIRMED',
    status: 'UPCOMING',
    title: 'NextWeb Digital Experience Arena',
    name: 'NextWeb Digital Experience Arena',
    hackathon_name: 'NextWeb Digital Experience Arena',
    banner_web_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-11-25T10:00:00Z',
    startDate: '2026-11-25T10:00:00Z',
    team_name: 'PixelCraft',
    team: { id: 'team_02', name: 'PixelCraft' },
    hackathon: {
      id: 'hack_02',
      title: 'NextWeb Digital Experience Arena',
      name: 'NextWeb Digital Experience Arena',
      banner_web_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Design and ship the future of interactive web applications',
      description: 'Frontend and full-stack battleground focused on fluid micro-interactions, generative UI, and 3D web experiences.'
    }
  },
  {
    _id: 'reg_03',
    id: 'reg_03',
    hackathon_id: 'hack_03',
    participant_id: 'CC-CHENNAI-802',
    registration_id: 'REG-2026-CC-1055',
    registration_status: 'CONFIRMED',
    status: 'UPCOMING',
    title: 'Smart Campus IoT & Hardware Hack',
    name: 'Smart Campus IoT & Hardware Hack',
    hackathon_name: 'Smart Campus IoT & Hardware Hack',
    banner_web_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    banner_mobile_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-12-05T09:00:00Z',
    startDate: '2026-12-05T09:00:00Z',
    team_name: 'Solo Builder',
    team: { id: 'team_03', name: 'Solo Builder' },
    hackathon: {
      id: 'hack_03',
      title: 'Smart Campus IoT & Hardware Hack',
      name: 'Smart Campus IoT & Hardware Hack',
      banner_web_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Intelligent automation for modern university campuses',
      description: 'Build connected sensor networks and ambient intelligence systems to improve student living, lab equipment monitoring, and green campus operations.'
    }
  }
];

function handleApiRequest(req, res, pathname) {
  const authHeader = req.headers['authorization'] || '';
  const isDemo = authHeader.includes('demo-') || authHeader.includes('campuscode-demo') || !authHeader;

  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const cleanPath = urlObj.pathname.replace(/^\/api/, '');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // demo auth endpoint
  if (cleanPath === '/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      const email = (parsed.email || '').toLowerCase();
      const role = (parsed.role || '').toUpperCase();

      if (email.includes('admin') || role === 'ADMIN') {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, token: 'demo-admin-token-2026', user: MOCK_ADMIN_USER }));
        return;
      }

      if (email.includes('org') || role === 'ORGANIZER') {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, token: 'demo-organizer-token-2026', user: MOCK_ORGANIZER_USER }));
        return;
      }

      if (email.includes('student') || role === 'STUDENT' || email === 'demo@campuscode.co.in' || parsed.password === 'demo123' || !email) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, token: 'demo-student-token-2026', user: MOCK_STUDENT_USER }));
        return;
      }

      forwardToLiveBackend(req, res, body);
    });
    return;
  }

  // handle joining an event
  if (cleanPath.includes('/join') && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: 'Hackathon joined successfully!' }));
    return;
  }

  // health check
  if (cleanPath === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  // user profile endpoint
  if (cleanPath === '/users/me') {
    let user = MOCK_STUDENT_USER;
    if (authHeader.includes('organizer') || authHeader.includes('org')) {
      user = MOCK_ORGANIZER_USER;
    } else if (authHeader.includes('admin')) {
      user = MOCK_ADMIN_USER;
    }
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, user }));
    return;
  }

  // organizer dashboard & operations
  if (cleanPath.startsWith('/dashboard/organizer')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      stats: {
        total_participants: 2640,
        active_hackathons: 2,
        completed_hackathons: 1,
        submissions_pending: 12
      },
      hackathons: MOCK_HACKATHONS,
      events: MOCK_HACKATHONS,
      data: MOCK_HACKATHONS
    }));
    return;
  }

  if (cleanPath.includes('/hackathons/organizer/my-hackathons')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      hackathons: MOCK_HACKATHONS,
      events: MOCK_HACKATHONS,
      data: MOCK_HACKATHONS
    }));
    return;
  }

  // admin dashboard & operations
  if (cleanPath.startsWith('/dashboard/admin')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      statistics: {
        total_users: 3420,
        total_hackathons: 18,
        active_hackathons: 3,
        pending_approvals: 2,
        total_certificates: 490
      },
      stats: {
        total_users: 3420,
        total_hackathons: 18,
        active_hackathons: 3,
        pending_approvals: 2
      }
    }));
    return;
  }

  if (cleanPath === '/users/admin/all') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      users: [
        MOCK_STUDENT_USER,
        MOCK_ORGANIZER_USER,
        MOCK_ADMIN_USER,
        {
          _id: 'usr_demo_student_02',
          id: 'usr_demo_student_02',
          name: 'Ananya Sharma',
          email: 'ananya@campuscode.co.in',
          role: 'STUDENT',
          college: 'IIT Madras',
          department: 'Electrical Engineering'
        },
        {
          _id: 'usr_demo_student_03',
          id: 'usr_demo_student_03',
          name: 'Rohan Verma',
          email: 'rohan@campuscode.co.in',
          role: 'STUDENT',
          college: 'BITS Pilani',
          department: 'Computer Science'
        }
      ]
    }));
    return;
  }

  if (cleanPath.includes('/hackathons/admin/pending-approvals')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      hackathons: [
        {
          _id: 'hack_pending_01',
          id: 'hack_pending_01',
          title: 'Decentralized Finance & Web3 Buildathon',
          organizer: 'Blockchain Builders Club',
          mode: 'ONLINE',
          prizePool: '₹1,75,000',
          status: 'PENDING_APPROVAL',
          submitted_at: '2026-11-06T12:00:00Z'
        }
      ]
    }));
    return;
  }

  // public & student digital ID card
  if (cleanPath.includes('/digital-id')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      verified: true,
      digital_card: {
        participant: {
          name: 'Karthik Raja',
          campus_id: 'CC-CHENNAI-802',
          college: 'Anna University, CEG Campus',
          department: 'Computer Science & Engineering',
          year: '3rd Year',
          skills: ['React', 'TypeScript', 'Python', 'TailwindCSS', 'Node.js']
        },
        statistics: {
          registered: 3,
          ongoing: 1,
          completed: 2,
          certificates: 2,
          points: 1420
        },
        verification: {
          status: 'ACTIVE',
          verified: true,
          verified_at: '2026-11-01T10:00:00Z'
        }
      }
    }));
    return;
  }

  // certificates verification & listings
  if (cleanPath.includes('/certificates/verify/')) {
    const parts = cleanPath.split('/certificates/verify/');
    const code = parts[1] || 'CC-2026-FC-8942';
    res.writeHead(200);
    res.end(JSON.stringify({
      valid: true,
      certificate: {
        holder_name: 'Karthik Raja',
        hackathon_title: 'FirstCommit National AI Sprint',
        type: 'WINNER',
        place: 1,
        code: decodeURIComponent(code),
        issued_at: '2026-10-20T00:00:00Z'
      }
    }));
    return;
  }

  if (cleanPath.includes('/certificates')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      certificates: [
        {
          _id: 'cert_01',
          id: 'cert_01',
          hackathonTitle: 'FirstCommit National AI Sprint',
          type: 'Winner · 1st Place National Trophy',
          code: 'CC-2026-FC-8942',
          issuedAt: '2026-10-20'
        },
        {
          _id: 'cert_02',
          id: 'cert_02',
          hackathonTitle: 'ReBuild 2026 AI Arena Round 1',
          type: 'Top 20 Finalist Selection',
          code: 'CC-2026-RB-1022',
          issuedAt: '2026-11-06'
        }
      ]
    }));
    return;
  }

  // student's joined events (My Events)
  if (cleanPath.includes('my-hackathons')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      hackathons: MOCK_MY_HACKATHONS,
      registrations: MOCK_MY_HACKATHONS,
      data: MOCK_MY_HACKATHONS
    }));
    return;
  }

  // browse events (Events)
  if (cleanPath === '/hackathons' || cleanPath === '/student/hackathons') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      hackathons: MOCK_HACKATHONS,
      events: MOCK_HACKATHONS,
      data: MOCK_HACKATHONS
    }));
    return;
  }

  // student main dashboard overview
  if (cleanPath.startsWith('/student/dashboard') || cleanPath.startsWith('/dashboard')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      stats: {
        registered: 3,
        registered_count: 3,
        ongoing: 1,
        ongoing_count: 1,
        completed: 2,
        completed_count: 2,
        certificates: 2,
        certificate_count: 2,
        rank: 4
      },
      current_event: {
        id: 'hack_01',
        code: 'CC-AI-2026',
        slug: 'firstcommit-ai-sprint',
        title: 'FirstCommit National AI Sprint',
        name: 'FirstCommit National AI Sprint',
        hackathon_name: 'FirstCommit National AI Sprint',
        description: 'Build production-grade AI agents in 48 hours with autonomous tool-calling systems and verified benchmarks.',
        status: 'LIVE SPRINT ACTIVE',
        mode: 'ONLINE',
        event_mode: 'ONLINE',
        startDate: '2026-11-15T09:00:00Z',
        start_date: '2026-11-15T09:00:00Z'
      },
      user: MOCK_STUDENT_USER,
      notifications: [
        {
          id: 'notif_01',
          title: 'FirstCommit Round 2 is Live',
          message: 'Submit your prototype GitHub repository before the countdown timer expires.',
          body: 'Round 2 prototype build window is active.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false
        },
        {
          id: 'notif_02',
          title: 'Founder Pass Verified',
          message: 'Anna University, CEG Campus badge successfully linked to your builder profile.',
          body: 'Profile verified with national credentials.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_read: true
        }
      ],
      registeredEvents: MOCK_MY_HACKATHONS,
      upcoming: MOCK_HACKATHONS
    }));
    return;
  }

  // HackMate AI team formation
  if (cleanPath.includes('/hackmate')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      hackathon: MOCK_HACKATHONS[0],
      teams: [
        {
          id: 'team_01',
          name: 'NeuralFounders',
          code: 'NF-892',
          leader_id: 'usr_demo_student_01',
          members: [
            { user_id: 'usr_demo_student_01', name: 'Karthik Raja', role: 'Team Lead', skills: ['React', 'Node.js'] },
            { user_id: 'usr_demo_student_02', name: 'Ananya Sharma', role: 'AI / ML Engineer', skills: ['Python', 'PyTorch'] }
          ],
          open_roles: ['UI/UX Designer', 'DevOps Specialist']
        },
        {
          id: 'team_02',
          name: 'AgenticPulse',
          code: 'AP-410',
          leader_id: 'usr_demo_student_03',
          members: [
            { user_id: 'usr_demo_student_03', name: 'Rohan Verma', role: 'Full Stack', skills: ['Next.js', 'Go'] }
          ],
          open_roles: ['Prompt Engineer', 'Agent Architect']
        }
      ],
      recommended_teammates: [
        {
          id: 'cand_01',
          name: 'Devika Krishnan',
          college: 'IIT Madras',
          skills: ['Three.js', 'WebGL', 'Creative Dev'],
          match_score: '96%'
        },
        {
          id: 'cand_02',
          name: 'Sameer Patel',
          college: 'CEG Anna University',
          skills: ['FastAPI', 'LangChain', 'Docker'],
          match_score: '91%'
        }
      ]
    }));
    return;
  }

  // IdeaCheck AI
  if (cleanPath.includes('/ideacheck')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        score: 95,
        similarity_check: {
          similarity_score: 12,
          is_original: true,
          matched_project: 'No duplicate submission found in registry'
        },
        idea_evaluation: {
          score: 95,
          rating: 'Exceptional',
          status: 'HIGH FEASIBILITY · APPROVED'
        },
        ai_analysis: {
          novelty: 'High',
          viability: 'Production-ready',
          strengths: [
            'High real-world applicability for hackathon builders',
            'Modern full-stack tech stack with resilient architecture',
            'Clear path to MVP execution within sprint timeframe'
          ],
          suggestions: [
            'Prepare automated benchmark suite for final demo evaluation'
          ]
        }
      }));
    });
    return;
  }

  // RuleBot AI
  if (cleanPath.includes('/rulebot')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      answer: 'CampusCode RuleBot: All code must be authored during the active sprint window. Open source packages, frameworks (React, Vite, Three.js) and standard AI model APIs are permitted. Citations should be documented in your repository README.'
    }));
    return;
  }

  // Announcements and Communications
  if (cleanPath.includes('/announcements') || cleanPath.includes('/communication') || cleanPath.includes('/official')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      announcements: [
        {
          id: 'ann_01',
          title: 'Round 2 Hackathon Finalist Briefing',
          content: 'Congratulations to the 22 finalist teams advancing to Round 2! Prototype build submissions open today.',
          author: 'Hackathon Organizing Committee',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'ann_02',
          title: 'Cloud Infrastructure & API Keys Issued',
          content: 'Check your team workspace for allocated GPU and model inference tokens.',
          author: 'Platform Ops',
          created_at: new Date(Date.now() - 43200000).toISOString()
        }
      ]
    }));
    return;
  }

  // notifications
  if (cleanPath.includes('/notifications')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      unread: 1,
      notifications: [
        {
          id: 'notif_01',
          title: 'Welcome to CampusCode Arena Round 2!',
          message: 'All portals (Student, Organizer, Admin) and AI tools are fully active.',
          read: false,
          is_read: false,
          createdAt: new Date().toISOString()
        }
      ]
    }));
    return;
  }

  // rounds
  if (cleanPath.includes('/rounds')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      rounds: [
        { round: 1, name: 'Idea Submission', status: 'COMPLETED' },
        { round: 2, name: 'Prototype Build', status: 'ACTIVE' },
        { round: 3, name: 'Grand Finale Demo', status: 'UPCOMING' }
      ]
    }));
    return;
  }

  // teams
  if (cleanPath.includes('/teams')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      teams: [
        {
          id: 'team_01',
          name: 'NeuralFounders',
          members: [
            { name: 'Karthik Raja', role: 'Team Lead' },
            { name: 'Ananya Sharma', role: 'Frontend & AI' }
          ]
        }
      ]
    }));
    return;
  }

  // Fallback for mocked demo endpoints
  if (isDemo || cleanPath.startsWith('/student') || cleanPath.startsWith('/organizer') || cleanPath.startsWith('/admin')) {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: 'ok', data: [] }));
    return;
  }

  forwardToLiveBackend(req, res);
}

function forwardToLiveBackend(req, res, initialBody) {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);
  const targetUrl = new URL(REMOTE_BACKEND + parsed.pathname.replace(/^\/api/, '') + parsed.search);

  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host
    }
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Backend unreachable, please retry.' }));
  });

  if (initialBody) {
    proxyReq.write(initialBody);
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // api routes
  if (pathname.startsWith('/api')) {
    handleApiRequest(req, res, pathname);
    return;
  }

  let filePath = path.join(PUBLIC_DIR, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // spa routing fallback
  if (!fs.existsSync(filePath)) {
    if (!path.extname(pathname)) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
