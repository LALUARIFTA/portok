import { supabase } from './supabase.js'
import myPhoto from './assets/me.webp'

// ===== I18N (Translations) =====
const translations = {
  id: {
    nav_home: "Beranda",
    nav_about: "Tentang",
    nav_resume: "Riwayat",
    nav_projects: "Proyek",
    nav_blog: "Blog",
    nav_contact: "Kontak",
    nav_admin: "Admin",
    hero_hi: "Hi, Saya",
    hero_role: "IT Professional",
    about_tag: "<tentang>",
    about_title: "Tentang Saya",
    cv_download: "Unduh CV",
    cv_preview: "Preview CV",
    tech_skills_title: "Kemahiran Teknis",
    skill_design_title: "Desain",
    skill_design_desc: "UI/UX, Desain Grafis",
    skill_dev_title: "Development",
    skill_dev_desc: "Full-Stack Web",
    skill_net_title: "Networking",
    skill_net_desc: "Infrastruktur Jaringan",
    skill_admin_title: "Administrasi",
    skill_admin_desc: "Manajemen Data",
    skill_support_title: "IT Support",
    skill_support_desc: "Teknis & Troubleshooting",
    skill_streamer_title: "Streamer",
    skill_streamer_desc: "Konten Kreator",
    resume_tag: "<riwayat>",
    resume_title: "Perjalanan Karir",
    resume_exp_title: "Pengalaman Kerja",
    resume_edu_title: "Pendidikan",
    linkedin_view: "Lihat di LinkedIn",
    projects_tag: "<proyek>",
    projects_title: "Karya Terbaru",
    filter_all: "Semua",
    filter_design: "Desain",
    filter_web: "Website",
    filter_network: "Network",
    filter_cert: "Sertifikat",
    load_more: "Lihat Lebih Banyak",
    testimonials_tag: "<testimoni>",
    testimonials_title: "Apa Kata Mereka",
    testimonials_desc: "Pengalaman mereka bekerja bersama saya.",
    contact_tag: "<kontak>",
    contact_title: "Hubungi Saya",
    form_name: "Nama",
    form_email: "Email",
    form_msg: "Pesan",
    form_btn: "Kirim Pesan",
    footer_nav: "Navigasi",
    footer_services: "Layanan",
    footer_others: "Lainnya"
  },
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_resume: "Resume",
    nav_projects: "Projects",
    nav_blog: "Blog",
    nav_contact: "Contact",
    nav_admin: "Admin",
    hero_hi: "Hi, I am",
    hero_role: "IT Professional",
    about_tag: "<about>",
    about_title: "About Me",
    cv_download: "Download CV",
    cv_preview: "Preview CV",
    tech_skills_title: "Technical Proficiency",
    skill_design_title: "Design",
    skill_design_desc: "UI/UX, Graphic Design",
    skill_dev_title: "Development",
    skill_dev_desc: "Full-Stack Web",
    skill_net_title: "Networking",
    skill_net_desc: "Infrastructure",
    skill_admin_title: "Administration",
    skill_admin_desc: "Data Management",
    skill_support_title: "IT Support",
    skill_support_desc: "Technical Troubleshooting",
    skill_streamer_title: "Streamer",
    skill_streamer_desc: "Content Creator",
    resume_tag: "<resume>",
    resume_title: "Career Journey",
    resume_exp_title: "Work Experience",
    resume_edu_title: "Education",
    linkedin_view: "View on LinkedIn",
    projects_tag: "<projects>",
    projects_title: "Latest Works",
    filter_all: "All",
    filter_design: "Design",
    filter_web: "Website",
    filter_network: "Network",
    filter_cert: "Certificates",
    load_more: "Load More",
    testimonials_tag: "<testimonials>",
    testimonials_title: "What They Say",
    testimonials_desc: "Their experience working with me.",
    contact_tag: "<contact>",
    contact_title: "Get In Touch",
    form_name: "Name",
    form_email: "Email",
    form_msg: "Message",
    form_btn: "Send Message",
    footer_nav: "Navigation",
    footer_services: "Services",
    footer_others: "Others"
  }
}

let currentLang = localStorage.getItem('portfolio-lang') || 'id'
let currentImages = []
let currentImageIndex = 0


// ===== UTILS =====
const escapeHTML = str => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

async function trackEvent(eventName, eventData = {}) {
  try {
    const doTrack = async () => {
      try {
        await supabase.from('analytics').insert([{ event_name: eventName, event_data: eventData }]);
      } catch (err) { /* silent fail */ }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(doTrack, { timeout: 2000 });
    } else {
      setTimeout(doTrack, 1000);
    }
  } catch (err) { /* silent fail for analytics */ }
}

function showSkeletons(containerId, count = 3) {
  const container = document.getElementById(containerId)
  if (!container) return
  let html = ''
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 70%;"></div>
      </div>
    `
  }
  container.innerHTML = html
}

// ===== CUSTOM ALERTS =====
window.showCustomAlert = function (type, message) {
  const container = document.getElementById('alertContainer');
  if (!container) return;

  const alertDiv = document.createElement('div');
  // Initial state: translated to right and invisible
  alertDiv.className = 'transform translate-x-full opacity-0 transition-all duration-300 ease-out';

  let html = '';
  switch (type) {
    case 'success':
      html = `
      <div role="alert" class="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-700 text-green-900 dark:text-green-100 p-2 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out hover:bg-green-200 dark:hover:bg-green-800 transform hover:scale-105 pointer-events-auto">
        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" class="h-5 w-5 flex-shrink-0 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path></svg>
        <p class="text-xs font-semibold">${message}</p>
      </div>`;
      break;
    case 'error':
      html = `
      <div role="alert" class="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100 p-2 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out hover:bg-red-200 dark:hover:bg-red-800 transform hover:scale-105 pointer-events-auto">
        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" class="h-5 w-5 flex-shrink-0 mr-2 text-red-600" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path></svg>
        <p class="text-xs font-semibold">${message}</p>
      </div>`;
      break;
    case 'info':
      html = `
      <div role="alert" class="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-700 text-blue-900 dark:text-blue-100 p-2 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out hover:bg-blue-200 dark:hover:bg-blue-800 transform hover:scale-105 pointer-events-auto">
        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" class="h-5 w-5 flex-shrink-0 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path></svg>
        <p class="text-xs font-semibold">${message}</p>
      </div>`;
      break;
    case 'warning':
      html = `
      <div role="alert" class="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 p-2 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out hover:bg-yellow-200 dark:hover:bg-yellow-800 transform hover:scale-105 pointer-events-auto">
        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" class="h-5 w-5 flex-shrink-0 mr-2 text-yellow-600" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path></svg>
        <p class="text-xs font-semibold">${message}</p>
      </div>`;
      break;
  }

  alertDiv.innerHTML = html;
  container.appendChild(alertDiv);

  // Trigger reflow
  alertDiv.offsetHeight;

  // Slide in
  alertDiv.classList.remove('translate-x-full', 'opacity-0');

  // Slide out and remove
  setTimeout(() => {
    alertDiv.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      alertDiv.remove();
    }, 300);
  }, 4000);
}

// ===== THEME TOGGLE =====
function initTheme() {
  const themeToggle = document.getElementById('themeToggle')
  const body = document.body

  const getPreferredTheme = () => {
    const saved = localStorage.getItem('portfolio-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }

  const currentTheme = getPreferredTheme()
  body.setAttribute('data-theme', currentTheme)
  updateThemeIcon(currentTheme)

  themeToggle?.addEventListener('click', () => {
    const theme = body.getAttribute('data-theme')
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    body.setAttribute('data-theme', newTheme)
    localStorage.setItem('portfolio-theme', newTheme)
    updateThemeIcon(newTheme)
  })

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem('portfolio-theme')) {
      const newTheme = e.matches ? 'light' : 'dark'
      body.setAttribute('data-theme', newTheme)
      updateThemeIcon(newTheme)
    }
  })
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon')
  if (theme === 'light') {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' // Moon
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' // Sun
  }
}

// ===== SCROLL REVEAL =====
function initReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left')
  if (reveals.length === 0) return

  const observerOptions = { threshold: 0.15 }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  }, observerOptions)

  reveals.forEach(el => observer.observe(el))
}

// ===== NAVIGATION =====
function initNav() {
  const navbar = document.getElementById('navbar')
  const navToggle = document.getElementById('navToggle')
  const navLinks = document.getElementById('navLinks')
  const navOverlay = document.getElementById('navOverlay')
  const links = document.querySelectorAll('.nav-link')

  if (!navbar) return

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50)

        // Active link highlight
        let current = ''
        const sections = document.querySelectorAll('section[id]')
        sections.forEach(sec => {
          const top = sec.offsetTop
          const h = sec.offsetHeight
          if (window.scrollY >= top - 200 && window.scrollY < top + h - 200) {
            current = sec.id
          }
        })

        links.forEach(link => {
          link.classList.remove('active')
          if (link.getAttribute('href').includes(current) && current !== '') {
            link.classList.add('active')
          }
        })
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true })

  const toggleMenu = () => {
    navToggle?.classList.toggle('active')
    navLinks?.classList.toggle('active')
    navOverlay?.classList.toggle('active')
    document.body.classList.toggle('no-scroll')
  }

  navToggle?.addEventListener('click', toggleMenu)
  navOverlay?.addEventListener('click', toggleMenu)
  links.forEach(link => link.addEventListener('click', () => {
    if (navLinks?.classList.contains('active')) toggleMenu()
  }))
}



// ===== INTERACTIVE TERMINAL =====
function initTerminal() {
  const terminal = document.getElementById('terminalBody')
  const input = document.getElementById('terminalInput')
  const history = document.getElementById('terminalHistory')
  const currentText = document.getElementById('terminalCurrentText')
  const cursor = document.querySelector('.terminal-cursor')

  if (!terminal || !input) return

  // Keep focus on input when clicking terminal
  terminal.addEventListener('click', () => input.focus())

  // Mirror input to visible span
  input.addEventListener('input', () => {
    currentText.textContent = input.value
  })

  const addLine = (cmd, output) => {
    const cmdLine = document.createElement('div')
    cmdLine.className = 'terminal-line'
    cmdLine.innerHTML = `<span class="terminal-prompt">$</span> ${escapeHTML(cmd)}`
    history.appendChild(cmdLine)

    if (output) {
      const outLine = document.createElement('div')
      outLine.className = 'terminal-output'
      outLine.innerHTML = output
      history.appendChild(outLine)
    }

    terminal.scrollTop = terminal.scrollHeight
  }

  const commands = {
    help: () => 'Available commands: <span style="color:var(--accent-light)">sudo</span>, <span style="color:var(--accent-light)">whoami</span>, <span style="color:var(--accent-light)">about</span>, <span style="color:var(--accent-light)">projects</span>, <span style="color:var(--accent-light)">skills</span>, <span style="color:var(--accent-light)">socials</span>, <span style="color:var(--accent-light)">contact</span>, <span style="color:var(--accent-light)">date</span>, <span style="color:var(--accent-light)">clear</span>, <span style="color:var(--text-muted); opacity: 0.5;">???</span>',
    whoami: () => 'ayek — IT Professional & Creative Developer',
    about: () => 'Saya adalah IT Professional yang berdedikasi untuk membangun pengalaman digital yang bersih dan fungsional.',
    skills: () => 'Frontend: <span style="color:#eab308">HTML, CSS, JS, React</span>\nBackend: <span style="color:#eab308">Node.js, Supabase</span>\nTools: <span style="color:#eab308">Git, Vite, Linux</span>',
    projects: () => `Sedang ingin melihat karya saya? Silakan scroll ke bawah ke bagian Portofolio untuk tampilan visual, atau ketik <span style="color:#eab308">"ls projects"</span> untuk daftar teks.`,
    'ls projects': () => allProjects.length > 0 ? allProjects.slice(0, 5).map(p => `- ${p.title}`).join('\n') + (allProjects.length > 5 ? '\n...and more.' : '') : 'Belum ada proyek yang dimuat.',
    socials: () => 'LinkedIn: <a href="https://linkedin.com/in/lalu-arif" target="_blank" style="color:var(--accent);">lalu-arif</a>\nGitHub: <a href="#" target="_blank" style="color:var(--accent);">ayek-dev</a>',
    contact: () => 'Email: <span style="color:#eab308">gawah@example.com</span> (atau gunakan form di bawah).',
    sudo: () => 'nice try, but you are not in the sudoers file. This incident will be reported. 🚨',
    'sudo rm -rf /': () => '<span style="color: red;">[ERROR] Permission denied. Don\'t try to destroy my portfolio!</span>',
    astrid: () => '<span style="color: #ec4899;">💖 Astrid terdeteksi! Pasangan dan istri tercinta Ayek. Have a great day!</span>',
    play: () => 'Loading mini-game... <br>[█░░░░░░░░░] 10%<br>[████░░░░░░] 40%<br>[█████████░] 90%<br><span style="color: red;">[FATAL ERROR] Not enough RAM to run Doom.</span>',
    matrix: () => '<span style="color: #22c55e;">Wake up, Neo...<br>The Matrix has you...<br>Follow the white rabbit. 🐇</span>',
    secret: () => '🎉 <b>Easter Egg Ditemukan!</b> Anda memang teliti. Sebagai hadiah, ini sebuah pantun untuk Anda:<br><i>Jalan-jalan ke kota tua,<br>Jangan lupa membeli kaca.<br>Website ini memang biasa,<br>Tapi dibuat sepenuh jiwa.</i>',
    date: () => new Date().toLocaleString(),
    clear: () => { history.innerHTML = ''; return '' },
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const fullCmd = input.value.trim()
      const cmd = fullCmd.toLowerCase()

      if (cmd === 'clear') {
        commands.clear()
      } else if (cmd) {
        let response = commands[cmd] ? commands[cmd]() : null



        if (!response) {
          response = `Command not found: ${escapeHTML(cmd)}. Type <span style="color:var(--accent-light)">"help"</span> for list.`
        }

        addLine(fullCmd, response)
      }

      input.value = ''
      currentText.textContent = ''
    }
  })

  // Initial focus
  input.focus()
}

// ===== GLOBALS =====
let allProjects = []
let portfolioContext = {
  profile: null,
  projects: [],
  resume: { experience: [], education: [] }
}
let currentProjectFilter = 'all'
let currentProjectPage = 1
const projectsPerPage = 6
const paginationItemsToDisplay = 5

async function loadProjects() {
  const grid = document.getElementById('projectsGrid')
  if (grid) showSkeletons('projectsGrid', 6)
  try {
    const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    const { data: certData } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })

    const formattedCerts = (certData || []).map(c => ({
      id: c.id,
      title: c.title,
      description: 'Penerbit: ' + c.issuer,
      category: 'certificate',
      year: c.year,
      thumbnail: c.image_url,
      url: c.credential_url,
      tech_stack: '',
      case_study: 'Sertifikasi resmi dari ' + c.issuer + '.'
    }))

    allProjects = [...(projData || []), ...formattedCerts]
    portfolioContext.projects = allProjects
    renderProjects()
    updateStats()
  } catch (err) { console.error(err) }
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid')
  if (!grid) return

  const filtered = currentProjectFilter === 'all' ? allProjects : allProjects.filter(p => p.category === currentProjectFilter)
  
  const startIndex = (currentProjectPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const toDisplay = filtered.slice(startIndex, endIndex)

  grid.innerHTML = toDisplay.map((p, i) => `
    <div class="project-card reveal" style="animation-delay:${(i % 6) * 0.1}s" onclick="window.openProjectDetail('${p.id}')">
      <div class="project-thumb">
        ${p.thumbnail && p.thumbnail.toLowerCase().endsWith('.pdf') ? `<div style="height:100%; display:flex; align-items:center; justify-content:center; background:var(--bg-secondary); color:var(--text-muted);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>` : `<img src="${p.thumbnail || 'https://via.placeholder.com/400x300'}" alt="Thumbnail for ${p.title}" loading="lazy" onload="this.classList.add('loaded')">`}
        <div class="project-overlay"></div>
        <span class="project-category-badge">${p.category === 'certificate' ? 'Sertifikat' : p.category}</span>
      </div>
      <div class="project-info">
        <h3>${p.title}</h3>
        <p>${p.description || ''}</p>
        <div class="project-tech">${p.tech_stack ? p.tech_stack.split(',').map(t => `<span>${t.trim()}</span>`).join('') : ''}</div>
        <span class="project-link" aria-label="Lihat detail proyek ${p.title}">${p.category === 'certificate' ? 'Lihat Sertifikat →' : 'Lihat Detail →'}</span>
      </div>
    </div>
  `).join('')

  renderPagination(filtered.length)

  initReveal() // Re-init for dynamic content
}

window.openProjectDetail = async (id) => {
  const p = allProjects.find(item => item.id === id)
  if (!p) return

  const modal = document.getElementById('projectDetailModal')
  document.getElementById('pmTitle').textContent = p.title
  document.getElementById('pmCategory').textContent = p.category === 'certificate' ? 'Sertifikat' : p.category
  document.getElementById('pmYear').textContent = p.year || '-'
  document.getElementById('pmStack').textContent = p.tech_stack || '-'
  document.getElementById('pmDescription').textContent = p.case_study || p.description || 'No detailed case study yet.'
  const isPdf = p.thumbnail && p.thumbnail.toLowerCase().endsWith('.pdf');
  document.getElementById('pmHero').innerHTML = isPdf
    ? `<iframe src="${p.thumbnail}" width="100%" height="400px" style="border:none; border-radius: 12px 12px 0 0;"></iframe>`
    : `<img src="${p.thumbnail}" alt="Hero image for ${p.title}" loading="lazy">`;

  // Gallery
  const gallery = document.getElementById('pmGallery')
  if (p.gallery && p.gallery.length > 0) {
    gallery.innerHTML = p.gallery.map(img => `<img src="${img}" alt="Gallery image for ${p.title}" loading="lazy">`).join('')
  } else {
    gallery.innerHTML = ''
  }

  // Link
  const linkArea = document.getElementById('pmLinkArea')
  if (p.url) {
    const btnText = p.category === 'certificate' ? 'Validasi Kredensial' : 'Buka Live Website'
    linkArea.innerHTML = `<a href="${p.url}" target="_blank" class="btn btn-primary">${btnText}</a>`
  } else {
    linkArea.innerHTML = ''
  }

  modal.classList.add('active')
  document.body.style.overflow = 'hidden'
  trackEvent('project_view', { id })
}

const pmCloseBtn = document.getElementById('pmClose')
if (pmCloseBtn) {
  pmCloseBtn.addEventListener('click', () => {
    document.getElementById('projectDetailModal').classList.remove('active')
    document.body.style.overflow = ''
  })
}



// ===== PROFILE & CONTENT =====
async function loadDynamicContent() {
  try {
    const { data: p } = await supabase.from('profile').select('*').single()
    if (p) {
      portfolioContext.profile = p
      const elNavName = document.getElementById('navName')
      const elHeroName = document.getElementById('heroNameText')
      const elFooterName = document.getElementById('footerName')
      const elTermWhoami = document.getElementById('termWhoami')
      const elHeroRole = document.getElementById('heroRole')
      const elHeroBio = document.getElementById('heroBioText')
      const elAboutBio = document.getElementById('aboutBioContent')
      const elEmail = document.getElementById('contactEmail')
      const elWA = document.getElementById('contactWhatsapp')
      const elLoc = document.getElementById('contactLocation')
      const elCVBtn = document.getElementById('cvDownloadBtn')
      const elCVCont = document.getElementById('cvDownloadContainer')
      const elLinkedInBtn = document.getElementById('resumeLinkedInBtn')
      const elLinkedInCont = document.getElementById('resumeLinkedInContainer')

      if (elNavName) elNavName.textContent = p.name
      if (elHeroName) elHeroName.textContent = p.name
      if (elFooterName) elFooterName.textContent = p.name
      if (elTermWhoami) elTermWhoami.textContent = `${p.name.toLowerCase()} — IT Professional`
      if (elHeroRole) elHeroRole.textContent = p.title
      if (elHeroBio) elHeroBio.textContent = p.bio
      if (elAboutBio) elAboutBio.innerHTML = `<p>${p.bio}</p>`
      if (elEmail) elEmail.textContent = p.email
      if (elWA) elWA.textContent = p.whatsapp
      if (elLoc) elLoc.textContent = p.location

      if (p.cv_url && elCVBtn && elCVCont) {
        elCVBtn.href = p.cv_url
        elCVCont.style.display = 'block'
        elCVBtn.addEventListener('click', () => trackEvent('cv_click'))
      }

      if (p.linkedin && elLinkedInBtn && elLinkedInCont) {
        elLinkedInBtn.href = p.linkedin
        elLinkedInCont.style.display = 'flex'
      }

      // Socials — styled icon buttons
      const socials = document.getElementById('footerSocials')
      if (socials) {
        const linkStyle = 'display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;border:1px solid var(--border);color:var(--text-muted);text-decoration:none;transition:all 0.2s;'
        const hoverIn = "this.style.borderColor='var(--accent)';this.style.color='var(--accent)';this.style.transform='translateY(-2px)'"
        const hoverOut = "this.style.borderColor='var(--border)';this.style.color='var(--text-muted)';this.style.transform='translateY(0)'"
        let html = ''
        if (p.email) html += `<a href="mailto:${p.email}" style="${linkStyle}" onmouseover="${hoverIn}" onmouseout="${hoverOut}" aria-label="Email"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></a>`
        if (p.github) html += `<a href="${p.github}" target="_blank" style="${linkStyle}" onmouseover="${hoverIn}" onmouseout="${hoverOut}" aria-label="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></a>`
        if (p.linkedin) html += `<a href="${p.linkedin}" target="_blank" style="${linkStyle}" onmouseover="${hoverIn}" onmouseout="${hoverOut}" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg></a>`
        if (p.instagram) html += `<a href="${p.instagram}" target="_blank" style="${linkStyle}" onmouseover="${hoverIn}" onmouseout="${hoverOut}" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>`
        if (p.whatsapp) {
          const waNum = p.whatsapp.replace(/\D/g, '')
          html += `<a href="https://wa.me/${waNum}" target="_blank" style="${linkStyle}" onmouseover="${hoverIn}" onmouseout="${hoverOut}" aria-label="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>`
        }
        socials.innerHTML = html
      }
    }

    // Experience/Education
    const { data: exp } = await supabase.from('experience').select('*').order('created_at', { ascending: false })
    portfolioContext.resume.experience = exp || []
    const elExp = document.getElementById('experienceList')
    if (elExp && exp) {
      elExp.innerHTML = exp.map(e => `
        <div class="timeline-item">
          <h4>${e.role}</h4>
          <div class="tl-org">${e.company}</div>
          <span class="tl-date">${e.duration}</span>
          <p>${e.description || ''}</p>
        </div>
      `).join('')
    }

    const { data: edu } = await supabase.from('education').select('*').order('created_at', { ascending: false })
    portfolioContext.resume.education = edu || []
    const elEdu = document.getElementById('educationList')
    if (elEdu && edu) {
      elEdu.innerHTML = edu.map(e => `
        <div class="timeline-item">
          <h4>${e.degree}</h4>
          <div class="tl-org">${e.institution}</div>
          <span class="tl-date">${e.year}</span>
        </div>
      `).join('')
    }

    // Testimonials
    const { data: testi } = await supabase.from('testimonials').select('*')
    const testiSection = document.getElementById('testimonials')

    if (testiSection && testi && testi.length > 0) {
      testiSection.style.display = 'block'
      const track = document.getElementById('testiTrack')
      if (track) {
        // Ensure seamless horizontal scroll by repeating items
        let baseSet = [...testi]
        while (baseSet.length < 4) { // Minimum items to fill a screen width
          baseSet = [...baseSet, ...testi]
        }
        const displayData = [...baseSet, ...baseSet]

        track.innerHTML = displayData.map(t => `
          <div class="testi-card">
            <p>"${escapeHTML(t.content)}"</p>
            <div class="testi-user">
              <div class="testi-user-info">
                <h5>${escapeHTML(t.client_name)}</h5>
                <span>${escapeHTML(t.client_role || 'Client')}</span>
              </div>
            </div>
          </div>
        `).join('')
      }
    }
  } catch (err) { console.error(err) }
}

function updateStats() {
  const sProj = document.getElementById('statProjects')
  const sDes = document.getElementById('statDesigns')
  const sNet = document.getElementById('statNetworks')

  if (sProj) sProj.textContent = allProjects.filter(p => p.category === 'web').length
  if (sDes) sDes.textContent = allProjects.filter(p => p.category === 'design').length
  if (sNet) sNet.textContent = allProjects.filter(p => p.category === 'network').length
}

function initFilters() {
  document.getElementById('projectFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn')
    if (!btn) return
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    const filter = btn.dataset.filter
    currentProjectFilter = filter
    currentProjectPage = 1
    renderProjects()
  })
}

// ===== BLOG ARTICLES =====
async function loadArticles() {
  const grid = document.getElementById('blogGrid')
  if (grid) showSkeletons('blogGrid', 3)
  if (!grid) return

  const loader = document.getElementById('blogLoader')
  const empty = document.getElementById('blogEmpty')

  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    // Hide loader
    if (loader) loader.style.display = 'none'

    if (error) throw error

    if (!articles || articles.length === 0) {
      if (empty) empty.style.display = 'block'
      return
    }

    grid.innerHTML = articles.map(a => `
      <div class="blog-card-item">
        ${a.image_url || a.thumbnail ? `<div style="overflow:hidden;"><img src="${a.image_url || a.thumbnail}" alt="${escapeHTML(a.title)}" loading="lazy"></div>` : `<div style="height:200px;background:linear-gradient(135deg,var(--bg-secondary),var(--accent-glow));display:flex;align-items:center;justify-content:center;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.5" opacity="0.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>`}
        <div class="blog-card-body">
          <div class="blog-card-meta">
            ${a.category ? `<span class="blog-card-tag">${escapeHTML(a.category)}</span>` : ''}
            <span class="blog-card-date">${new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h3 class="blog-card-title">${escapeHTML(a.title)}</h3>
          <p class="blog-card-excerpt">${escapeHTML(a.excerpt || a.content?.substring(0, 150) || '')}</p>
          <a href="/article.html?id=${a.id}" class="blog-card-read">Baca Selengkapnya <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></a>
        </div>
      </div>
    `).join('')
  } catch (err) {
    console.error('Error loading articles:', err)
    if (loader) loader.style.display = 'none'
    if (empty) empty.style.display = 'block'
  }
}

// ===== SINGLE ARTICLE =====
async function loadSingleArticle() {
  const wrapper = document.getElementById('articleContentWrapper')
  const loader = document.getElementById('articleLoader')
  const errorEl = document.getElementById('articleError')

  if (!wrapper || !loader || !errorEl) return // Not on the article page

  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')

  if (!id) {
    loader.style.display = 'none'
    errorEl.style.display = 'block'
    return
  }

  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    loader.style.display = 'none'

    if (error || !article) {
      errorEl.style.display = 'block'
      return
    }

    // Render Content
    document.title = `${escapeHTML(article.title)} — Ayek Portfolio`
    document.getElementById('articleTitle').textContent = article.title
    document.getElementById('articleDate').textContent = new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    if (article.category) {
      const catEl = document.getElementById('articleCategory')
      catEl.textContent = article.category
      catEl.style.display = 'inline-block'
    }

    const imgUrl = article.image_url || article.thumbnail
    if (imgUrl) {
      const imgEl = document.getElementById('articleImage')
      imgEl.src = imgUrl
      imgEl.alt = article.title
      imgEl.style.display = 'block'
    }

    // Convert markdown to HTML if marked is available, else use basic formatting
    const bodyEl = document.getElementById('articleBody')
    if (typeof marked !== 'undefined') {
      bodyEl.innerHTML = marked.parse(article.content)
    } else {
      bodyEl.innerHTML = article.content.split('\n').map(p => `<p>${escapeHTML(p)}</p>`).join('')
    }

    wrapper.style.display = 'block'

  } catch (err) {
    console.error('Error loading article:', err)
    loader.style.display = 'none'
    errorEl.style.display = 'block'
  }
}

// ===== CHATBOT (DeepSeek AI) =====
async function initChatbot() {
  const toggle = document.getElementById('chatbotToggle')
  const windowEl = document.getElementById('chatbotWindow')
  const close = document.getElementById('chatbotClose')
  const form = document.getElementById('chatbotForm')
  const input = document.getElementById('chatbotInput')
  const messages = document.getElementById('chatbotMessages')

  toggle?.addEventListener('click', () => windowEl.classList.toggle('active'))
  close?.addEventListener('click', () => windowEl.classList.remove('active'))

  // Proxy lokal (Vite) atau Proxy Produksi (Cloudflare Pages Functions)
  const NVIDIA_API_URL = "/api/ai/chat/completions";

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return

    // Add user message
    messages.innerHTML += `<div class="msg-user">${text}</div>`
    input.value = ''
    messages.scrollTop = messages.scrollHeight

    // Add typing container
    const botMsgId = 'bot-' + Date.now()
    messages.innerHTML += `
      <div class="msg-bot" id="${botMsgId}">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`
    messages.scrollTop = messages.scrollHeight
    const botMsgEl = document.getElementById(botMsgId)

    try {
      const systemPrompt = `Kamu adalah asisten AI profesional untuk portofolio Lalu Arif (Ayek). 
      Gunakan data berikut untuk menjawab pertanyaan:
      - Nama: ${portfolioContext.profile?.name || 'Ayek'}
      - Title: ${portfolioContext.profile?.title || ''}
      - Bio: ${portfolioContext.profile?.bio || ''}
      - Lokasi: ${portfolioContext.profile?.location || ''}
      - Project: ${portfolioContext.projects.map(p => p.title).join(', ')}
      - Pengalaman: ${portfolioContext.resume.experience.map(e => e.role + ' di ' + e.company).join(', ')}
      - Pendidikan: ${portfolioContext.resume.education.map(e => e.degree + ' - ' + e.institution).join(', ')}
      - Pasangan: sudah punya ia bernama astrid.
      - Menikah: sudah menikah dengan astrid.
      Aturan:
      1. Jawab dengan ramah, profesional, dan gunakan Bahasa Indonesia.
      2. Jika ditanya tentang kontak, berikan email: ${portfolioContext.profile?.email || ''} atau WhatsApp: ${portfolioContext.profile?.whatsapp || ''}.
      3. Jangan menjawab hal di luar portofolio jika tidak relevan.
      4. Jawablah dengan singkat dan padat.`

      const response = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization dihandle secara aman oleh Server/Proxy (Vite/Cloudflare)
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          model: "google/gemma-3n-e2b-it",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          max_tokens: 1024,
          temperature: 0.20,
          top_p: 0.70,
          stream: true
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'API Error')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""
      botMsgEl.innerHTML = "" // Clear typing dots

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '[DONE]') break
            try {
              const data = JSON.parse(dataStr)
              const content = data.choices[0].delta.content || ""
              if (content) {
                fullContent += content
                botMsgEl.innerHTML = escapeHTML(fullContent).replace(/\n/g, '<br>')
                messages.scrollTop = messages.scrollHeight
              }
            } catch (e) { }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      botMsgEl.textContent = 'Maaf, terjadi gangguan pada koneksi AI saya. Silakan coba lagi nanti.'
    }
  })
}



// ===== CONTACT FORM =====
function initContact() {
  const form = document.getElementById('contactForm')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Honeypot check
    const honeypot = document.getElementById('contactHoneypot').value
    if (honeypot) {
      console.warn('Bot detected via honeypot')
      return // Silently ignore bot submissions
    }

    // Turnstile check
    const turnstileResponse = form.querySelector('[name="cf-turnstile-response"]')?.value
    if (!turnstileResponse) {
      showCustomAlert('warning', 'Harap selesaikan verifikasi keamanan (CAPTCHA).')
      return
    }

    const btn = form.querySelector('button[type="submit"]')
    const originalBtnText = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = '<span>Mengirim...</span>'

    const name = document.getElementById('contactName').value
    const email = document.getElementById('contactFormEmail').value
    const message = document.getElementById('contactMessage').value

    try {
      btn.disabled = true
      btn.innerHTML = '<span>Mengirim...</span>'

      const { error } = await supabase.from('messages').insert([{
        name: escapeHTML(name),
        email: escapeHTML(email),
        message: escapeHTML(message)
      }])

      if (error) throw error

      showCustomAlert('success', 'Success - Pesan berhasil dikirim! Terima kasih.')

      // EmailJS Notification (Dynamically loaded to save performance)
      try {
        const emailjs = (await import('@emailjs/browser')).default;
        emailjs.init("YOUR_PUBLIC_KEY");
        emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
          from_name: name,
          from_email: email,
          message: message,
          to_name: "Ayek",
        }).catch(err => console.error('EmailJS error:', err));
      } catch (err) {
        console.error('Failed to load EmailJS:', err);
      }

      form.reset()
    } catch (err) {
      console.error(err)
      showCustomAlert('error', 'Error - Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      btn.disabled = false
      btn.innerHTML = originalBtnText
    }
  })
}

// ===== SCROLL PROGRESS & BACK TO TOP =====
function initScrollFeatures() {
  const progressBar = document.getElementById('scrollProgress')

  let ticking = false;
  window.addEventListener('scroll', () => {
    // Progress bar
    if (progressBar && !ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0
        progressBar.style.transform = `scaleX(${scrollPercent})`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true })
}

// ===== HERO TYPING ANIMATION =====
function initHeroTyping() {
  const roleEl = document.getElementById('heroRole')
  if (!roleEl) return

  const roles = ['Web Developer', 'UI/UX Designer', 'Network Engineer', 'IT Professional']
  let roleIndex = 0
  let charIndex = 0
  let isDeleting = false
  let typingSpeed = 100

  function type() {
    const current = roles[roleIndex]

    if (isDeleting) {
      roleEl.textContent = current.substring(0, charIndex - 1)
      charIndex--
      typingSpeed = 50
    } else {
      roleEl.textContent = current.substring(0, charIndex + 1)
      charIndex++
      typingSpeed = 100
    }

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 2000 // Pause at end
      isDeleting = true
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      roleIndex = (roleIndex + 1) % roles.length
      typingSpeed = 400 // Pause before next word
    }

    setTimeout(type, typingSpeed)
  }

  // Start after a short delay
  setTimeout(type, 1500)
}

// ===== DYNAMIC YEAR =====
function initYear() {
  const el = document.getElementById('currentYear')
  if (el) el.textContent = new Date().getFullYear()
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Load ThreeJS dynamically
  import('./three-bg.js').then(({ initThreeJSBackground }) => {
    initThreeJSBackground('#hero, .section');
  }).catch(err => console.error("Failed to load ThreeJS:", err));

  initTheme()
  initNav()
  initReveal()
  initFilters()
  loadProjects()
  loadArticles()
  loadSingleArticle()
  loadDynamicContent()
  initChatbot()
  initContact()
  initTerminal()
  initScrollFeatures()
  initHeroTyping()
  initYear()
  initI18n()
  initLightbox()

  initScrambleEffects()
  initPerspectiveMarquee()
  trackEvent('page_view', { path: window.location.pathname })

  // Initialize Career Game (pass data after it loads)

  initPixelArt()
})

function initPixelArt() {
  const container = document.getElementById('pixelArtContainer');
  if (!container) return;

  container.style.opacity = '0';
  container.style.transition = 'opacity 1.5s ease-in-out';

  import('./pixel-art.js').then(({ PixelatedCanvas }) => {
    new PixelatedCanvas({
      src: myPhoto,
      container: container,
      width: 1600,
      height: 2000,
      cellSize: 5,
      dotScale: 0.9,
      shape: "square",
      backgroundColor: "transparent",
      dropoutStrength: 0.3,
      interactive: true,
      distortionStrength: 5,
      distortionRadius: 120,
      distortionMode: "swirl",
      followSpeed: 0.15,
      jitterStrength: 2,
      jitterSpeed: 2,
      sampleAverage: true,
      tintStrength: 0
    });

    // Fade in after a short delay to allow sampling to start
    setTimeout(() => {
      container.style.opacity = '1';
    }, 500);
  }).catch(err => console.error("Failed to load PixelArt:", err));
}




function initI18n() {
  const btn = document.getElementById('langToggle')
  const display = document.getElementById('langDisplay')

  if (btn && display) {
    display.textContent = currentLang.toUpperCase()

    btn.addEventListener('click', () => {
      currentLang = currentLang === 'id' ? 'en' : 'id'
      localStorage.setItem('portfolio-lang', currentLang)
      display.textContent = currentLang.toUpperCase()
      applyTranslations()
    })
  }

  applyTranslations()
}

// ===== TEXT SCRAMBLE EFFECT =====
class TextScramble {
  constructor(el, options = {}) {
    this.el = el;
    this.options = {
      duration: options.duration || 0.8,
      speed: options.speed || 0.04,
      characterSet: options.characterSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      ...options
    };
    this.isAnimating = false;
  }

  async scramble() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Simpan teks asli dari atribut data-text (untuk i18n) atau textContent
    const originalText = this.el.getAttribute('data-scramble-text') || this.el.innerText;
    const steps = this.options.duration / this.options.speed;
    let step = 0;

    const interval = setInterval(() => {
      let scrambled = '';
      const progress = step / steps;

      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ' || originalText[i] === '\n') {
          scrambled += originalText[i];
          continue;
        }

        if (progress * originalText.length > i) {
          scrambled += originalText[i];
        } else {
          scrambled += this.options.characterSet[Math.floor(Math.random() * this.options.characterSet.length)];
        }
      }

      this.el.innerText = scrambled;
      step++;

      if (step > steps) {
        clearInterval(interval);
        this.el.innerText = originalText;
        this.isAnimating = false;
        if (this.options.onScrambleComplete) this.options.onScrambleComplete();
      }
    }, this.options.speed * 1000);
  }
}

function initScrambleEffects() {
  // 1. Hero Name Effect
  const nameEl = document.getElementById('heroNameText');
  if (nameEl) {
    const ts = new TextScramble(nameEl);
    nameEl.style.cursor = 'pointer';
    nameEl.addEventListener('mouseenter', () => ts.scramble());
    setTimeout(() => ts.scramble(), 1500); // Auto start
  }

  // 2. Section Titles Effect on Scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const title = entry.target;
        if (!title.hasAttribute('data-scrambled')) {
          const ts = new TextScramble(title);
          ts.scramble();
          title.setAttribute('data-scrambled', 'true');
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-title').forEach(title => {
    // Simpan teks asli agar aman saat ganti bahasa
    title.setAttribute('data-scramble-text', title.innerText);
    observer.observe(title);

    // Juga tambahkan hover effect
    const ts = new TextScramble(title);
    title.addEventListener('mouseenter', () => ts.scramble());
  });
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    if (translations[currentLang][key]) {
      el.innerText = translations[currentLang][key]
      // Update data-scramble-text if it exists
      if (el.hasAttribute('data-scramble-text')) {
        el.setAttribute('data-scramble-text', el.innerText)
      }
    }
  })
}

function initLightbox() {
  const lb = document.getElementById('lightbox')
  const lbImg = document.getElementById('lightboxImg')
  const lbCaption = document.getElementById('lightboxCaption')
  const lbClose = document.getElementById('lightboxClose')
  const lbPrev = document.getElementById('lightboxPrev')
  const lbNext = document.getElementById('lightboxNext')

  if (!lb) return

  const openLightbox = (imgSrc, caption, group = []) => {
    lbImg.src = imgSrc
    lbCaption.textContent = caption || ''
    lb.classList.add('active')
    document.body.style.overflow = 'hidden'

    currentImages = group
    currentImageIndex = group.indexOf(imgSrc)

    if (group.length > 1) {
      lbPrev.style.display = 'flex'
      lbNext.style.display = 'flex'
    } else {
      lbPrev.style.display = 'none'
      lbNext.style.display = 'none'
    }
  }

  const closeLightbox = () => {
    lb.classList.remove('active')
    document.body.style.overflow = ''
  }

  lbClose?.addEventListener('click', closeLightbox)
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox()
  })

  const navigate = (dir) => {
    if (currentImages.length === 0) return
    currentImageIndex += dir
    if (currentImageIndex < 0) currentImageIndex = currentImages.length - 1
    if (currentImageIndex >= currentImages.length) currentImageIndex = 0
    lbImg.src = currentImages[currentImageIndex]
  }

  lbPrev?.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); })
  lbNext?.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); })

  document.addEventListener('click', (e) => {
    const target = e.target

    if (target.parentElement && target.parentElement.id === 'pmGallery' && target.tagName === 'IMG') {
      const allImgs = Array.from(document.querySelectorAll('#pmGallery img')).map(img => img.src)
      openLightbox(target.src, '', allImgs)
    }

    if (target.parentElement && target.parentElement.id === 'pmHero' && target.tagName === 'IMG') {
      openLightbox(target.src, document.getElementById('pmTitle')?.textContent)
    }
  })

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') navigate(-1)
    if (e.key === 'ArrowRight') navigate(1)
  })
}

// ===== PERSPECTIVE MARQUEE LOGIC =====
function initPerspectiveMarquee() {
  const container = document.getElementById('perspectiveMarquee');
  if (!container) return;

  const items = ["React", "Figma", "Cisco", "Node.js", "UI/UX", "MikroTik", "Python", "Linux"];
  const fontSize = window.innerWidth < 768 ? 48 : 84;
  const pixelsPerFrame = 2;
  const speed = 1;
  const itemPadding = fontSize * 0.9;
  
  // Approximate item width (60% of font size is average char width)
  const approxItemWidth = items.reduce(
    (acc, item) => acc + item.length * fontSize * 0.6 + itemPadding,
    0,
  );

  // Setup HTML
  container.innerHTML = `
    <div class="marquee-content">
      <div class="marquee-track" id="marqueeTrack"></div>
    </div>
  `;

  const track = document.getElementById('marqueeTrack');
  const renderedItems = [...items, ...items, ...items];
  
  renderedItems.forEach((item, i) => {
    const span = document.createElement('span');
    span.className = 'marquee-item';
    span.textContent = item;
    span.style.fontSize = `${fontSize}px`;
    span.style.paddingRight = `${itemPadding}px`;
    track.appendChild(span);
  });

  const spans = track.querySelectorAll('.marquee-item');
  let frame = 0;

  function animate() {
    frame += speed;
    const offset = -((frame * pixelsPerFrame) % approxItemWidth);
    track.style.transform = `translateX(${offset}px)`;

    const containerWidth = container.clientWidth;
    const halfWidth = containerWidth / 2;

    spans.forEach((span, i) => {
      // Approximate center of each item
      const itemCenter = i * (approxItemWidth / items.length) + (approxItemWidth / items.length / 2) + offset;
      const norm = (itemCenter - halfWidth) / halfWidth;
      const distance = Math.min(1, Math.abs(norm));
      
      const blurPx = distance * 6;
      const opacity = 1 - distance * 0.4;
      
      span.style.filter = `blur(${blurPx}px)`;
      span.style.opacity = opacity;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// ===== PAGINATION LOGIC =====
function renderPagination(totalItems) {
  const container = document.getElementById('paginationContainer');
  const content = document.getElementById('paginationContent');
  if (!container || !content) return;

  const totalPages = Math.ceil(totalItems / projectsPerPage);
  
  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';
  content.innerHTML = '';

  const showLeftEllipsis = currentProjectPage - 1 > paginationItemsToDisplay / 2;
  const showRightEllipsis = totalPages - currentProjectPage + 1 > paginationItemsToDisplay / 2;

  let pages = [];
  if (totalPages <= paginationItemsToDisplay) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const halfDisplay = Math.floor(paginationItemsToDisplay / 2);
    let start = currentProjectPage - halfDisplay;
    let end = currentProjectPage + halfDisplay;

    start = Math.max(1, start);
    end = Math.min(totalPages, end);

    if (start === 1) end = paginationItemsToDisplay;
    if (end === totalPages) start = totalPages - paginationItemsToDisplay + 1;

    if (showLeftEllipsis) start++;
    if (showRightEllipsis) end--;

    pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Previous Button
  const prevLi = document.createElement('li');
  prevLi.className = 'pagination-item';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-link';
  prevBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>';
  prevBtn.disabled = currentProjectPage === 1;
  prevBtn.onclick = () => {
    currentProjectPage = Math.max(currentProjectPage - 1, 1);
    renderProjects();
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  };
  prevLi.appendChild(prevBtn);
  content.appendChild(prevLi);

  // Left Ellipsis
  if (showLeftEllipsis) {
    const firstLi = document.createElement('li');
    firstLi.className = 'pagination-item';
    firstLi.innerHTML = `<button class="pagination-link" onclick="window.goToPage(1)">1</button>`;
    content.appendChild(firstLi);
    
    const elLi = document.createElement('li');
    elLi.className = 'pagination-item';
    elLi.innerHTML = `<span class="pagination-ellipsis"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span>`;
    content.appendChild(elLi);
  }

  // Page Numbers
  pages.forEach(page => {
    const li = document.createElement('li');
    li.className = 'pagination-item';
    const btn = document.createElement('button');
    btn.className = `pagination-link ${currentProjectPage === page ? 'active' : ''}`;
    btn.textContent = page;
    btn.onclick = () => {
      currentProjectPage = page;
      renderProjects();
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    };
    li.appendChild(btn);
    content.appendChild(li);
  });

  // Right Ellipsis
  if (showRightEllipsis) {
    const elLi = document.createElement('li');
    elLi.className = 'pagination-item';
    elLi.innerHTML = `<span class="pagination-ellipsis"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span>`;
    content.appendChild(elLi);
    
    const lastLi = document.createElement('li');
    lastLi.className = 'pagination-item';
    lastLi.innerHTML = `<button class="pagination-link" onclick="window.goToPage(${totalPages})">${totalPages}</button>`;
    content.appendChild(lastLi);
  }

  // Next Button
  const nextLi = document.createElement('li');
  nextLi.className = 'pagination-item';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-link';
  nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
  nextBtn.disabled = currentProjectPage === totalPages;
  nextBtn.onclick = () => {
    currentProjectPage = Math.min(currentProjectPage + 1, totalPages);
    renderProjects();
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  };
  nextLi.appendChild(nextBtn);
  content.appendChild(nextLi);
}

window.goToPage = (page) => {
  currentProjectPage = page;
  renderProjects();
  document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
};



