import { supabase } from './supabase.js'

// ===== UTILS =====
const escapeHTML = str => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// ===== THEME TOGGLE =====
function initTheme() {
  const themeToggle = document.getElementById('themeToggle')
  const body = document.body
  const icon = document.getElementById('themeIcon')

  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark'
  body.setAttribute('data-theme', savedTheme)
  updateThemeIcon(savedTheme)

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme')
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    body.setAttribute('data-theme', newTheme)
    localStorage.setItem('portfolio-theme', newTheme)
    updateThemeIcon(newTheme)
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

  window.addEventListener('scroll', () => {
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
  })

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

// ===== HERO CODE ANIMATION =====
const codeLines = [
  '<span style="color:#c084fc">const</span> <span style="color:#38bdf8">ayek</span> = {',
  '  <span style="color:#22c55e">name</span>: <span style="color:#eab308">"Ayek"</span>,',
  '  <span style="color:#22c55e">role</span>: <span style="color:#eab308">"IT Professional"</span>,',
  '  <span style="color:#22c55e">status</span>: <span style="color:#eab308">"Open for Work"</span>,',
  '  <span style="color:#22c55e">expertise</span>: [<span style="color:#eab308">"Web"</span>, <span style="color:#eab308">"Design"</span>, <span style="color:#eab308">"Net"</span>]',
  '};'
]

function typeCode() {
  const el = document.getElementById('codeBody')
  if (!el) return
  let lineIdx = 0, charIdx = 0, html = ''

  function tick() {
    if (lineIdx >= codeLines.length) return
    const plain = codeLines[lineIdx].replace(/<[^>]*>/g, '')
    charIdx++

    if (charIdx > plain.length) {
      html += codeLines[lineIdx] + '\n'
      lineIdx++; charIdx = 0
      el.innerHTML = html + '<span class="terminal-cursor">_</span>'
      setTimeout(tick, 200)
    } else {
      const partial = buildPartial(codeLines[lineIdx], charIdx)
      el.innerHTML = html + partial + '<span class="terminal-cursor">_</span>'
      setTimeout(tick, 50)
    }
  }
  tick()
}

function buildPartial(tagged, len) {
  let plain = 0, result = '', inTag = false
  for (let i = 0; i < tagged.length && plain < len; i++) {
    if (tagged[i] === '<') { inTag = true; result += '<'; continue }
    if (inTag) { result += tagged[i]; if (tagged[i] === '>') inTag = false; continue }
    result += tagged[i]; plain++
  }
  return result
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
    help: () => 'Available commands: <span style="color:var(--accent-light)">whoami</span>, <span style="color:var(--accent-light)">projects</span>, <span style="color:var(--accent-light)">skills</span>, <span style="color:var(--accent-light)">clear</span>, <span style="color:var(--accent-light)">contact</span>',
    whoami: () => document.getElementById('termWhoami')?.innerHTML || 'ayek — IT Professional',
    skills: () => 'Frontend: <span style="color:#eab308">HTML, CSS, JS, React</span>\nBackend: <span style="color:#eab308">Node.js, Supabase</span>\nTools: <span style="color:#eab308">Git, Vite, Linux</span>',
    projects: () => `Total projects: <span style="color:var(--accent-light)">${allProjects.length}</span>. Type <span style="color:#eab308">"ls projects"</span> to see list.`,
    'ls projects': () => allProjects.slice(0, 5).map(p => `- ${p.title}`).join('\n') + (allProjects.length > 5 ? '\n...and more.' : ''),
    clear: () => { history.innerHTML = ''; return '' },
    contact: () => 'Email: <span style="color:#eab308">ayek@example.com</span>\nWhatsApp: <span style="color:#eab308">+62 8xx-xxxx-xxxx</span>',
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const fullCmd = input.value.trim()
      const cmd = fullCmd.toLowerCase()

      if (cmd === 'clear') {
        commands.clear()
      } else if (cmd) {
        let response = commands[cmd] ? commands[cmd]() : null

        // If not a system command, check chatbot keywords
        if (!response) {
          for (const [key, value] of Object.entries(chatbotResponses)) {
            if (cmd.includes(key)) {
              response = value
              break
            }
          }
        }

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

// ===== PROJECTS & MODAL =====
let allProjects = []

async function loadProjects() {
  const grid = document.getElementById('projectsGrid')
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

    if (grid) {
      renderProjects(allProjects)
      updateStats()
    }
  } catch (err) { console.error(err) }
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid')
  if (!grid) return
  grid.innerHTML = projects.map((p, i) => `
    <div class="project-card reveal" style="animation-delay:${i * 0.1}s" onclick="window.openProjectDetail('${p.id}')">
      <div class="project-thumb">
        <img src="${p.thumbnail || 'https://via.placeholder.com/400x300'}" alt="Thumbnail for ${p.title}" loading="lazy">
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
  document.getElementById('pmHero').innerHTML = `<img src="${p.thumbnail}" alt="Hero image for ${p.title}" loading="lazy">`

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
}

const pmCloseBtn = document.getElementById('pmClose')
if (pmCloseBtn) {
  pmCloseBtn.addEventListener('click', () => {
    document.getElementById('projectDetailModal').classList.remove('active')
    document.body.style.overflow = ''
  })
}

// ===== BLOG =====
async function loadArticles() {
  const grid = document.getElementById('blogGrid')
  if (!grid) return

  try {
    const { data } = await supabase.from('articles').select('*').eq('published', true).order('created_at', { ascending: false })
    if (!data || data.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column: 1/-1;">Belum ada artikel.</p>'
      return
    }
    grid.innerHTML = data.map(a => `
      <div class="article-card reveal">
        <div class="article-thumb"><img src="${a.thumbnail || 'https://via.placeholder.com/400x250'}" alt="Thumbnail for ${a.title}" loading="lazy"></div>
        <div class="article-info">
          <span class="article-date">${new Date(a.created_at).toLocaleDateString('id-ID')}</span>
          <h4>${a.title}</h4>
          <a href="#" class="project-link" aria-label="Baca selengkapnya tentang ${a.title}">Baca Selengkapnya →</a>
        </div>
      </div>
    `).join('')
    if (typeof initReveal === 'function') initReveal()
  } catch (err) { console.error(err) }
}

// ===== PROFILE & CONTENT =====
async function loadDynamicContent() {
  try {
    const { data: p } = await supabase.from('profile').select('*').single()
    if (p) {
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
      }

      // Socials
      const socials = document.getElementById('footerSocials')
      if (socials) {
        let html = ''
        if (p.github) html += `<a href="${p.github}" target="_blank">GitHub</a>`
        if (p.linkedin) html += `<a href="${p.linkedin}" target="_blank">LinkedIn</a>`
        if (p.instagram) html += `<a href="${p.instagram}" target="_blank">Instagram</a>`
        socials.innerHTML = html
      }
    }

    // Experience/Education
    const { data: exp } = await supabase.from('experience').select('*').order('created_at', { ascending: false })
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
    const filtered = filter === 'all' ? allProjects : allProjects.filter(p => p.category === filter)
    renderProjects(filtered)
  })
}

// ===== CHATBOT =====
let chatbotResponses = {}

async function initChatbot() {
  const toggle = document.getElementById('chatbotToggle')
  const windowEl = document.getElementById('chatbotWindow')
  const close = document.getElementById('chatbotClose')
  const form = document.getElementById('chatbotForm')
  const input = document.getElementById('chatbotInput')
  const messages = document.getElementById('chatbotMessages')

  toggle?.addEventListener('click', () => {
    windowEl.classList.toggle('active')
  })

  close?.addEventListener('click', () => {
    windowEl.classList.remove('active')
  })

  // Fetch keywords from database
  try {
    const { data } = await supabase.from('chatbot_keywords').select('keyword, response')
    if (data) {
      data.forEach(item => {
        // Handle multiple keywords separated by commas
        const keywords = item.keyword.split(',').map(k => k.trim().toLowerCase())
        keywords.forEach(k => {
          if (k) chatbotResponses[k] = item.response
        })
      })
    }
  } catch (err) {
    console.error('Failed to load chatbot keywords:', err)
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return

    // Add user message
    messages.innerHTML += `<div class="msg-user">${text}</div>`
    input.value = ''
    messages.scrollTop = messages.scrollHeight

    // Add typing indicator simulation
    setTimeout(() => {
      let reply = 'Maaf, saya belum mengerti. Silakan coba kata kunci lain atau hubungi saya langsung.'

      const lowerText = text.toLowerCase()
      for (const [key, value] of Object.entries(chatbotResponses)) {
        if (lowerText.includes(key)) {
          reply = value
          break
        }
      }

      messages.innerHTML += `<div class="msg-bot">${reply}</div>`
      messages.scrollTop = messages.scrollHeight
    }, 600)
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

    const btn = form.querySelector('button[type="submit"]')
    const originalBtnText = btn.innerHTML

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

      alert('Pesan berhasil dikirim! Terima kasih.')
      form.reset()
    } catch (err) {
      console.error(err)
      alert('Gagal mengirim pesan. Silakan coba lagi nanti.')
    } finally {
      btn.disabled = false
      btn.innerHTML = originalBtnText
    }
  })
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme()
  initNav()
  initReveal()
  typeCode()
  initFilters()
  loadProjects()
  loadArticles()
  loadDynamicContent()
  initChatbot()
  initContact()
  initTerminal()
})
