// Edit this file to update links, projects and contact info.
export const SITE = {
  photo: '/foto01.png',
  pixelPhoto: '/fotopixel.jpg',
  email: 'bianchimaniciroe@gmail.com',
  whatsapp: '+5491165026238',
  cv: { es: '/cv/CVCiroBianchimaniESP.pdf', en: '/cv/CVCiroBianchimaniENG2026.pdf' },
  social: [
    { icon: 'ri-github-line', url: 'https://github.com/Cbianchc', label: 'GitHub' },
    { icon: 'ri-linkedin-box-line', url: 'https://www.linkedin.com/in/cirobianchimani/', label: 'LinkedIn' },
    // { icon: 'ri-instagram-line', url: 'https://www.instagram.com/profecirob/', label: 'Instagram' },
  ],
};

// img: static capture. video: optional short WebM/MP4 in /public/projects (plays on hover).
// tech: names must match items in STACK; they power the "pick a technology" feature.
const A = '/projects/taskmaster1.png',
  B = '/projects/serverlife2.png',
  C = '/projects/profesdemo.png',
  D = '/projects/asistencias.png',
  E = '/projects/notamas.png',
  F = '/projects/fuuusion.png',
  G = '/projects/radiold1.png',
  H = '/projects/landingresto.png',
  I = '/projects/trucoimgrect.png'

export const PROJECTS = [
  {
    id: 'cognit',
    url: 'https://cognit2-0.vercel.app',
    stack: 'React + Vite.js + Tailwind CSS + Firestore + Vercel',
    img: '/projects/cognit01.png',
    video: null,
    creds:
    {
      user: 'testprofesional1@gmail.com',
      pass: '123456'
    },
    tech: ['React', 'Vite', 'Tailwind CSS', 'Firebase']
  },
  {
    id: 'profes',
    url: 'https://profesv2.netlify.app',
    stack: 'PERN + Tailwind CSS + Supabase',
    img: C,
    video: null,
    creds:
    {
      user: 'profe@profes.app',
      pass: '1234'
    },
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Supabase']
  },
  {
    id: 'tasks',
    url: 'https://mvpgestortareas.netlify.app/',
    stack: 'PERN + RENAPER infra',
    img: A,
    video: null,
    creds: { user: 'prueba@gmail.com', pass: '123456' },
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Scrum', 'Kanban', 'Tailwind CSS', 'Docker', 'Git', 'GitHub', 'REST APIs', 'Postman']
  },
  {
    id: 'pixel',
    url: 'https://proyserverlife.netlify.app',
    stack: 'PERN + Python + Docker',
    img: B,
    video: null,
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Python', 'insomnia']
  },
  {
    id: 'attendance',
    url: 'https://attendancemvp2.netlify.app',
    stack: 'Jamstack: Spreadsheet + PERN + GDE Admin',
    img: D,
    video: null,
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL']
  },
  {
    id: 'notes',
    url: 'https://test-nota.netlify.app/',
    stack: 'Vite.js PWA + Firebase',
    img: E,
    video: null,
    tech: ['Vite', 'Firebase', 'JavaScript ES6+', 'CSS3', 'Git', 'GitHub']
  },
  {
    id: 'pdf',
    url: 'https://pdfuuusion.netlify.app',
    stack: 'Vite.js + localStorage optimization',
    img: F,
    video: null,
    tech: ['Vite', 'JavaScript ES6+']
  },
  {
    id: 'radio',
    url: 'https://radiold2.netlify.app/',
    stack: 'JavaScript PWA + Firebase',
    img: G,
    video: null,
    tech: ['JavaScript ES6+', 'Firebase', 'CSS3', 'Git', 'GitHub', 'REST APIs', 'Postman']
  },
  {
    id: 'resto',
    url: 'https://landing-gastronomia.vercel.app/',
    stack: 'HTML + CSS + JS + Material UI + Supabase',
    img: H,
    video: null,
    tech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Material-UI', 'Supabase']
  },
  {
    id: 'truco',
    url: 'https://contadortruconuevo.netlify.app',
    stack: 'Vite.js PWA',
    img: I,
    video: null,
    tech: ['Vite', 'JavaScript ES6+']
  },
];

export const STACK = ['JavaScript ES6+', 'TypeScript', 'React', 'Node.js', 'Express', 'Next.js', 'PHP', 'Laravel', 'Java', 'Spring Boot 3',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Material-UI', 'Bootstrap', 'Vite', 'PostgreSQL', 'MySQL', 'SQLite', 'Firebase', 'Supabase', 'Docker',
  'Git', 'GitHub', 'REST APIs', 'Postman', 'Scrum', 'Kanban', 'CI/CD'];

// Las que me gustaria meter: 'MongoDB', 'Nest.js'

// Where a technology appears in the timeline (index in the "timeline" array of the i18n files). Only what the CV states.
export const EXP = {
  'JavaScript ES6+': [1, 2],
  TypeScript: [1],
  PHP: [1],
  Laravel: [1],
  PostgreSQL: [1],
  'Tailwind CSS': [1, 2],
  Docker: [1],
  React: [2],
  Vite: [2],
  Firebase: [2],
  Java: [3],
  'Spring Boot 3': [3],
  'SQLite': [3],
  'CI/CD': [1],
  'REST APIs': [1, 2, 3],
  'Bootstrap': [1],
  'Next.js': [1]
};