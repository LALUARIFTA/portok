import { supabase } from './supabase.js'

// ===== UTILS =====
const showPage = (pageName) => {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'))
  document.getElementById(`page${capitalize(pageName)}`).classList.add('active')
  const link = document.querySelector(`[data-page="${pageName}"]`)
  if (link) link.classList.add('active')
  document.getElementById('pageTitle').textContent = capitalize(pageName)
}

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
window.closeModal = id => document.getElementById(id).classList.remove('active')

const escapeHTML = str => {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// ===== CUSTOM ALERTS =====
window.showCustomAlert = function (type, message) {
  const container = document.getElementById('alertContainer');
  if (!container) return;

  const alertDiv = document.createElement('div');
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

  alertDiv.offsetHeight; // Reflow
  alertDiv.classList.remove('translate-x-full', 'opacity-0');

  setTimeout(() => {
    alertDiv.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}

// ===== AUTH =====
async function initAuth() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      document.getElementById('loginScreen').style.display = 'none'
      document.getElementById('adminDashboard').style.display = 'flex'
      document.getElementById('adminUserInfo').textContent = session.user.email
      initDashboard()
    } else {
      document.getElementById('loginScreen').style.display = 'flex'
      document.getElementById('adminDashboard').style.display = 'none'
    }
  })
}

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault()
  const email = e.target[0].value
  const password = e.target[1].value
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) showCustomAlert('error', error.message)
})

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut()
  location.reload()
})

// ===== DASHBOARD & NAV =====
function initDashboard() {
  initSidebar()
  loadStats()
  loadProjects()
  loadArticles()
  loadProfile()
  loadMessages()
  loadChatbot()
  loadCertificates()
  loadResume()
  loadTestimonials()
}

function initSidebar() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => showPage(link.dataset.page))
  })
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open')
  })
}

async function loadStats() {
  const { count: pCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
  const { count: aCount } = await supabase.from('articles').select('*', { count: 'exact', head: true })
  const { count: mCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })
  document.getElementById('dashTotalProjects').textContent = pCount || 0
  document.getElementById('dashTotalArticles').textContent = aCount || 0
  document.getElementById('dashTotalMessages').textContent = mCount || 0
}

// ===== PROJECTS =====
async function loadProjects() {
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  const tbody = document.getElementById('projectsTableBody')
  tbody.innerHTML = data.map(p => `
    <tr>
      <td>${escapeHTML(p.title)}</td>
      <td>${escapeHTML(p.category)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="editProject('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('projects', '${p.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('')
}

document.getElementById('addProjectBtn').addEventListener('click', () => {
  document.getElementById('projectForm').reset()
  document.getElementById('projectId').value = ''
  document.getElementById('projectModal').classList.add('active')
})

document.getElementById('projectForm').addEventListener('submit', async e => {
  e.preventDefault()
  const btn = e.target.querySelector('button[type="submit"]')
  const originalBtnText = btn.innerHTML

  const id = document.getElementById('projectId').value
  const file = document.getElementById('projectThumbFile').files[0]
  let thumbUrl = document.getElementById('projectThumbnail').value

  try {
    btn.disabled = true
    btn.innerHTML = '<span>Menyimpan...</span>'

    // Handle File Upload
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `projects/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        showCustomAlert('error', 'Gagal upload thumbnail: ' + uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath)

      thumbUrl = urlData.publicUrl
    }

    const payload = {
      title: document.getElementById('projectTitle').value,
      category: document.getElementById('projectCategory').value,
      year: document.getElementById('projectYear').value,
      thumbnail: thumbUrl,
      description: document.getElementById('projectDesc').value,
      case_study: document.getElementById('projectCaseStudy').value,
      tech_stack: document.getElementById('projectTech').value,
      url: document.getElementById('projectUrl').value,
    }

    if (id) await supabase.from('projects').update(payload).eq('id', id)
    else await supabase.from('projects').insert(payload)

    document.getElementById('projectThumbFile').value = '' // Clear file input
    closeModal('projectModal')
    loadProjects()
    showCustomAlert('success', 'Project berhasil disimpan!')
  } catch (err) {
    console.error(err)
    showCustomAlert('error', 'Terjadi kesalahan saat menyimpan project.')
  } finally {
    btn.disabled = false
    btn.innerHTML = originalBtnText
  }
})

window.editProject = async id => {
  const { data: p } = await supabase.from('projects').select('*').eq('id', id).single()
  document.getElementById('projectId').value = p.id
  document.getElementById('projectTitle').value = p.title
  document.getElementById('projectCategory').value = p.category
  document.getElementById('projectYear').value = p.year
  document.getElementById('projectThumbnail').value = p.thumbnail
  document.getElementById('projectDesc').value = p.description
  document.getElementById('projectCaseStudy').value = p.case_study || ''
  document.getElementById('projectTech').value = p.tech_stack
  document.getElementById('projectUrl').value = p.url
  document.getElementById('projectModal').classList.add('active')
}

// ===== ARTICLES =====
async function loadArticles() {
  const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
  const tbody = document.getElementById('articlesTableBody')
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${a.title}</td>
      <td>${a.published ? '✅ Published' : '⏳ Draft'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="editArticle('${a.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('articles', '${a.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('')
}

document.getElementById('addArticleBtn').addEventListener('click', () => {
  document.getElementById('articleForm').reset()
  document.getElementById('articleId').value = ''
  document.getElementById('articleModal').classList.add('active')
})

document.getElementById('articleForm').addEventListener('submit', async e => {
  e.preventDefault()
  const id = document.getElementById('articleId').value
  const btn = e.target.querySelector('button[type="submit"]')
  const originalBtnText = btn.innerHTML

  try {
    btn.disabled = true
    btn.innerHTML = '<span>Menyimpan...</span>'

    let thumbUrl = document.getElementById('articleThumb').value
    const fileInput = document.getElementById('articleThumbFile')

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `articles/${fileName}`

      const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath)
      thumbUrl = urlData.publicUrl
    }

    const payload = {
      title: document.getElementById('articleTitle').value,
      slug: document.getElementById('articleSlug').value,
      thumbnail: thumbUrl,
      content: document.getElementById('articleContent').value,
      category: document.getElementById('articleCategory').value,
      published: document.getElementById('articlePublished').checked,
    }

    if (id) await supabase.from('articles').update(payload).eq('id', id)
    else await supabase.from('articles').insert(payload)

    document.getElementById('articleThumbFile').value = '' // Clear file input
    closeModal('articleModal')
    loadArticles()
    showCustomAlert('success', 'Artikel berhasil disimpan!')
  } catch (err) {
    console.error(err)
    showCustomAlert('error', 'Terjadi kesalahan saat menyimpan artikel.')
  } finally {
    btn.disabled = false
    btn.innerHTML = originalBtnText
  }
})

window.editArticle = async id => {
  const { data: a } = await supabase.from('articles').select('*').eq('id', id).single()
  document.getElementById('articleId').value = a.id
  document.getElementById('articleTitle').value = a.title
  document.getElementById('articleSlug').value = a.slug
  document.getElementById('articleThumb').value = a.thumbnail
  document.getElementById('articleContent').value = a.content
  document.getElementById('articleCategory').value = a.category
  document.getElementById('articlePublished').checked = a.published
  document.getElementById('articleModal').classList.add('active')
}

// ===== GENERAL DELETE =====
window.deleteItem = async (table, id) => {
  if (confirm('Hapus item ini?')) {
    await supabase.from(table).delete().eq('id', id)
    if (table === 'projects') loadProjects()
    else if (table === 'articles') loadArticles()
    else if (table === 'chatbot_keywords') loadChatbot()
    else if (table === 'certificates') loadCertificates()
    else if (table === 'experience' || table === 'education') loadResume()
    else if (table === 'testimonials') loadTestimonials()
    else if (table === 'messages') loadMessages()
  }
}

// ===== CHATBOT KEYWORDS =====
async function loadChatbot() {
  const { data } = await supabase.from('chatbot_keywords').select('*').order('created_at', { ascending: false })
  const tbody = document.getElementById('chatbotTableBody')
  if (!tbody) return
  tbody.innerHTML = data.map(k => `
    <tr>
      <td>${k.keyword}</td>
      <td>${k.response.substring(0, 50)}...</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="editKeyword('${k.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('chatbot_keywords', '${k.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('')
}

document.getElementById('addKeywordBtn')?.addEventListener('click', () => {
  document.getElementById('chatbotForm').reset()
  document.getElementById('keywordId').value = ''
  document.getElementById('chatbotModal').classList.add('active')
})

document.getElementById('chatbotForm')?.addEventListener('submit', async e => {
  e.preventDefault()
  const id = document.getElementById('keywordId').value
  const payload = {
    keyword: document.getElementById('botKeyword').value,
    response: document.getElementById('botResponse').value,
  }

  if (id) await supabase.from('chatbot_keywords').update(payload).eq('id', id)
  else await supabase.from('chatbot_keywords').insert(payload)

  closeModal('chatbotModal')
  loadChatbot()
})

window.editKeyword = async id => {
  const { data: k } = await supabase.from('chatbot_keywords').select('*').eq('id', id).single()
  document.getElementById('keywordId').value = k.id
  document.getElementById('botKeyword').value = k.keyword
  document.getElementById('botResponse').value = k.response
  document.getElementById('chatbotModal').classList.add('active')
}

// ===== CERTIFICATES =====
async function loadCertificates() {
  const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })
  const tbody = document.getElementById('certificatesTableBody')
  if (!tbody) return
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.title}</td>
      <td>${c.issuer}</td>
      <td>${c.year || '-'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="editCertificate('${c.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('certificates', '${c.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('')
}

document.getElementById('addCertificateBtn')?.addEventListener('click', () => {
  document.getElementById('certificateForm').reset()
  document.getElementById('certificateId').value = ''
  document.getElementById('certificateModal').classList.add('active')
})

document.getElementById('certificateForm')?.addEventListener('submit', async e => {
  e.preventDefault()
  const btn = e.target.querySelector('button[type="submit"]')
  const originalBtnText = btn.innerHTML

  const id = document.getElementById('certificateId').value
  const file = document.getElementById('certFile').files[0]
  let imageUrl = document.getElementById('certImage').value

  try {
    btn.disabled = true
    btn.innerHTML = '<span>Mengunggah...</span>'

    // Handle File Upload
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `certificates/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        showCustomAlert('error', 'Gagal upload file: ' + uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath)

      imageUrl = urlData.publicUrl
    }

    const payload = {
      title: document.getElementById('certTitle').value,
      issuer: document.getElementById('certIssuer').value,
      year: document.getElementById('certYear').value,
      image_url: imageUrl,
      credential_url: document.getElementById('certCredential').value,
    }

    if (id) await supabase.from('certificates').update(payload).eq('id', id)
    else await supabase.from('certificates').insert(payload)

    document.getElementById('certFile').value = '' // Clear file input
    closeModal('certificateModal')
    loadCertificates()
    showCustomAlert('success', 'Sertifikat berhasil disimpan!')
  } catch (err) {
    console.error(err)
    showCustomAlert('error', 'Terjadi kesalahan.')
  } finally {
    btn.disabled = false
    btn.innerHTML = originalBtnText
  }
})

window.editCertificate = async id => {
  const { data: c } = await supabase.from('certificates').select('*').eq('id', id).single()
  document.getElementById('certificateId').value = c.id
  document.getElementById('certTitle').value = c.title
  document.getElementById('certIssuer').value = c.issuer
  document.getElementById('certYear').value = c.year || ''
  document.getElementById('certImage').value = c.image_url || ''
  document.getElementById('certCredential').value = c.credential_url || ''
  document.getElementById('certificateModal').classList.add('active')
}

// ===== PROFILE =====
async function loadProfile() {
  const { data: p } = await supabase.from('profile').select('*').single()
  if (p) {
    document.getElementById('profileName').value = p.name
    document.getElementById('profileTitle').value = p.title
    document.getElementById('profileBio').value = p.bio
    document.getElementById('profileEmail').value = p.email
    document.getElementById('profileWhatsapp').value = p.whatsapp
    document.getElementById('profileGithub').value = p.github
    document.getElementById('profileLinkedin').value = p.linkedin
    document.getElementById('profileCvUrl').value = p.cv_url
  }
}

document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault()
  const btn = e.target.querySelector('button[type="submit"]')
  const originalBtnText = btn.innerHTML

  try {
    btn.disabled = true
    btn.innerHTML = '<span>Menyimpan...</span>'

    let cvUrl = document.getElementById('profileCvUrl').value
    const fileInput = document.getElementById('profileCvFile')

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `cv/${fileName}`

      const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath)
      cvUrl = urlData.publicUrl
    }

    const payload = {
      name: document.getElementById('profileName').value,
      title: document.getElementById('profileTitle').value,
      bio: document.getElementById('profileBio').value,
      email: document.getElementById('profileEmail').value,
      whatsapp: document.getElementById('profileWhatsapp').value,
      github: document.getElementById('profileGithub').value,
      linkedin: document.getElementById('profileLinkedin').value,
      cv_url: cvUrl,
    }
    const { data: existing } = await supabase.from('profile').select('id').maybeSingle()
    if (existing) await supabase.from('profile').update(payload).eq('id', existing.id)
    else await supabase.from('profile').insert(payload)

    document.getElementById('profileCvFile').value = ''
    document.getElementById('profileCvUrl').value = cvUrl
    showCustomAlert('success', 'Profile disimpan!')
  } catch (err) {
    console.error(err)
    showCustomAlert('error', 'Terjadi kesalahan saat menyimpan profile.')
  } finally {
    btn.disabled = false
    btn.innerHTML = originalBtnText
  }
})

// ===== MESSAGES =====
async function loadMessages() {
  const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
  const tbody = document.getElementById('messagesTableBody')
  if (!tbody) return

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">Belum ada pesan masuk.</td></tr>'
    return
  }

  tbody.innerHTML = data.map(m => `
    <tr>
      <td style="font-weight:600;">${m.name}</td>
      <td>${m.email}</td>
      <td style="max-width:300px; white-space:normal; font-size:0.85rem;">${m.message}</td>
      <td style="font-size:0.8rem; color:var(--text-muted);">${new Date(m.created_at).toLocaleString('id-ID')}</td>
      <td>
        <div class="table-actions">
          <a href="mailto:${m.email}?subject=Balasan dari Ayek Portfolio" class="btn btn-outline btn-sm">Balas</a>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('messages', '${m.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('')
}

// ===== RESUME (EXP & EDU) =====
async function loadResume() {
  const { data: exp } = await supabase.from('experience').select('*').order('created_at', { ascending: true })
  const { data: edu } = await supabase.from('education').select('*').order('created_at', { ascending: true })

  const expTbody = document.getElementById('experienceTableBody')
  if (expTbody) {
    expTbody.innerHTML = (exp || []).map(e => `
      <tr>
        <td>${e.role}</td>
        <td>${e.company}</td>
        <td>${e.duration || '-'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" onclick="editExperience('${e.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('experience', '${e.id}')">Hapus</button>
          </div>
        </td>
      </tr>
    `).join('')
  }

  const eduTbody = document.getElementById('educationTableBody')
  if (eduTbody) {
    eduTbody.innerHTML = (edu || []).map(e => `
      <tr>
        <td>${e.degree}</td>
        <td>${e.institution}</td>
        <td>${e.year || '-'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" onclick="editEducation('${e.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('education', '${e.id}')">Hapus</button>
          </div>
        </td>
      </tr>
    `).join('')
  }
}

document.getElementById('addExpBtn')?.addEventListener('click', () => {
  document.getElementById('experienceForm').reset()
  document.getElementById('expId').value = ''
  document.getElementById('experienceModal').classList.add('active')
})

document.getElementById('experienceForm')?.addEventListener('submit', async e => {
  e.preventDefault()
  const id = document.getElementById('expId').value
  const payload = {
    role: document.getElementById('expTitle').value,
    company: document.getElementById('expCompany').value,
    duration: document.getElementById('expYear').value,
    description: document.getElementById('expDesc').value,
  }
  if (id) await supabase.from('experience').update(payload).eq('id', id)
  else await supabase.from('experience').insert(payload)
  closeModal('experienceModal')
  loadResume()
})

window.editExperience = async id => {
  const { data: e } = await supabase.from('experience').select('*').eq('id', id).single()
  document.getElementById('expId').value = e.id
  document.getElementById('expTitle').value = e.role
  document.getElementById('expCompany').value = e.company
  document.getElementById('expYear').value = e.duration || ''
  document.getElementById('expDesc').value = e.description || ''
  document.getElementById('experienceModal').classList.add('active')
}

document.getElementById('addEduBtn')?.addEventListener('click', () => {
  document.getElementById('educationForm').reset()
  document.getElementById('eduId').value = ''
  document.getElementById('educationModal').classList.add('active')
})

document.getElementById('educationForm')?.addEventListener('submit', async e => {
  e.preventDefault()
  const id = document.getElementById('eduId').value
  const payload = {
    degree: document.getElementById('eduDegree').value,
    institution: document.getElementById('eduInstitution').value,
    year: document.getElementById('eduYear').value,
    description: document.getElementById('eduDesc').value,
  }
  if (id) await supabase.from('education').update(payload).eq('id', id)
  else await supabase.from('education').insert(payload)
  closeModal('educationModal')
  loadResume()
})

window.editEducation = async id => {
  const { data: e } = await supabase.from('education').select('*').eq('id', id).single()
  document.getElementById('eduId').value = e.id
  document.getElementById('eduDegree').value = e.degree
  document.getElementById('eduInstitution').value = e.institution
  document.getElementById('eduYear').value = e.year || ''
  document.getElementById('eduDesc').value = e.description || ''
  document.getElementById('educationModal').classList.add('active')
}

// ===== TESTIMONIALS =====
async function loadTestimonials() {
  const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  const tbody = document.getElementById('testimonialsTableBody')
  if (!tbody) return
  tbody.innerHTML = data.map(t => `
    <tr>
      <td>${t.client_name}</td>
      <td>${t.client_role || '-'}</td>
      <td>${t.content.substring(0, 50)}...</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="editTestimonial('${t.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('testimonials', '${t.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('')
}

document.getElementById('addTestiBtn')?.addEventListener('click', () => {
  document.getElementById('testimonialForm').reset()
  document.getElementById('testiId').value = ''
  document.getElementById('testimonialModal').classList.add('active')
})

document.getElementById('testimonialForm')?.addEventListener('submit', async e => {
  e.preventDefault()
  const id = document.getElementById('testiId').value
  const payload = {
    client_name: document.getElementById('testiName').value,
    client_role: document.getElementById('testiRole').value,
    content: document.getElementById('testiContent').value,
  }
  if (id) await supabase.from('testimonials').update(payload).eq('id', id)
  else await supabase.from('testimonials').insert(payload)
  closeModal('testimonialModal')
  loadTestimonials()
})

window.editTestimonial = async id => {
  const { data: t } = await supabase.from('testimonials').select('*').eq('id', id).single()
  document.getElementById('testiId').value = t.id
  document.getElementById('testiName').value = t.client_name
  document.getElementById('testiRole').value = t.client_role || ''
  document.getElementById('testiContent').value = t.content
  document.getElementById('testimonialModal').classList.add('active')
}

// ===== INIT =====
initAuth()
