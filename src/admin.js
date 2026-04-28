import { supabase } from './supabase.js'

let analyticsChart = null
let projectsChart = null
let articleEditor = null

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

async function logActivity(action) {
  try {
    await supabase.from('activity_log').insert([{ action }])
    if (document.getElementById('activityLogBody')) loadActivityLog()
  } catch (err) { console.warn('Activity log failed - table might not exist') }
}

async function loadActivityLog() {
  const tbody = document.getElementById('activityLogBody')
  if (!tbody) return
  try {
    const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(8)
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada aktivitas.</td></tr>'
      return
    }
    tbody.innerHTML = data.map(l => `
      <tr>
        <td style="font-size:0.85rem; font-weight:500;">${escapeHTML(l.action)}</td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${new Date(l.created_at).toLocaleTimeString('id-ID')} - ${new Date(l.created_at).toLocaleDateString('id-ID')}</td>
      </tr>
    `).join('')
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.75rem;">Gagal memuat log. Buat tabel "activity_log" di Supabase.</td></tr>'
  }
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
  initEditors()
  loadStats()
  loadRecentMessages()
  loadActivityLog()
  loadProjects()
  loadArticles()
  loadProfile()
  loadMessages()
  loadChatbot()
  loadCertificates()
  loadResume()
  loadTestimonials()
  initSortable()
  loadMedia()
  initAI()
}

function initEditors() {
  const el = document.getElementById('articleContent')
  if (el && !articleEditor) {
    articleEditor = new EasyMDE({
      element: el,
      spellChecker: false,
      autosave: {
        enabled: true,
        uniqueId: "articleContentSave",
        delay: 1000,
      },
      placeholder: "Tulis konten artikel Anda di sini (Markdown didukung)...",
      status: ["lines", "words", "cursor"],
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
      },
      maxHeight: "400px",
      theme: "dark" // EasyMDE is light by default, but we can style it via CSS
    });
  }
}

function initSidebar() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => showPage(link.dataset.page))
  })
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open')
  })
}

function initSortable() {
  const expBody = document.getElementById('experienceTableBody');
  const eduBody = document.getElementById('educationTableBody');
  
  if (expBody) {
    new Sortable(expBody, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: () => {
        document.getElementById('saveExpOrderBtn').style.display = 'block';
      }
    });
  }

  if (eduBody) {
    new Sortable(eduBody, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: () => {
        document.getElementById('saveEduOrderBtn').style.display = 'block';
      }
    });
  }

  document.getElementById('saveExpOrderBtn')?.addEventListener('click', () => saveOrder('experience'));
  document.getElementById('saveEduOrderBtn')?.addEventListener('click', () => saveOrder('education'));
}

async function saveOrder(table) {
  const tbody = document.getElementById(`${table}TableBody`);
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const btn = document.getElementById(`save${table === 'experience' ? 'Exp' : 'Edu'}OrderBtn`);
  
  const originalBtnText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Saving...';

  try {
    const updates = rows.map((row, index) => ({
      id: row.dataset.id,
      sort_order: index
    }));

    // Update each item (Supabase doesn't support bulk update with different values easily without a RPC)
    for (const item of updates) {
      await supabase.from(table).update({ sort_order: item.sort_order }).eq('id', item.id);
    }

    showCustomAlert('success', `Urutan ${table} berhasil disimpan!`);
    btn.style.display = 'none';
    logActivity(`Mengubah urutan ${table}`);
  } catch (err) {
    console.error(err);
    showCustomAlert('error', 'Gagal menyimpan urutan. Pastikan kolom "sort_order" sudah ada di database.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalBtnText;
  }
}

async function loadStats() {
  try {
    const { count: pCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    const { count: aCount } = await supabase.from('articles').select('*', { count: 'exact', head: true })
    const { count: mCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })
    
    // Analytics (Try catch because table might not exist yet)
    let vCount = 0, cCount = 0
    try {
      const { count: views } = await supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_name', 'page_view')
      const { count: clicks } = await supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_name', 'cv_click')
      vCount = views || 0
      cCount = clicks || 0
    } catch (e) { console.warn('Analytics table not found') }

    document.getElementById('dashTotalProjects').textContent = pCount || 0
    document.getElementById('dashTotalArticles').textContent = aCount || 0
    document.getElementById('dashTotalMessages').textContent = mCount || 0
    document.getElementById('dashTotalViews').textContent = vCount
    document.getElementById('dashCvClicks').textContent = cCount

    initAnalyticsChart()
  } catch (err) { console.error('Stats error:', err) }
}

async function loadRecentMessages() {
  const body = document.getElementById('dashRecentMessagesBody')
  if (!body) return

  try {
    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    if (!msgs || msgs.length === 0) {
      body.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada pesan.</td></tr>'
      return
    }

    body.innerHTML = msgs.map(m => `
      <tr>
        <td>
          <div style="font-weight:700;">${escapeHTML(m.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(m.email)}</div>
        </td>
        <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHTML(m.message || '')}
        </td>
        <td style="font-size:0.8rem; color:var(--text-muted);">
          ${new Date(m.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </td>
      </tr>
    `).join('')
  } catch (err) {
    console.error('Recent messages error:', err)
    body.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:var(--accent);">Gagal memuat pesan.</td></tr>'
  }
}

async function initAnalyticsChart() {
  const visitorCtx = document.getElementById('analyticsChart')?.getContext('2d')
  const projectCtx = document.getElementById('projectsChart')?.getContext('2d')
  
  if (!visitorCtx || !projectCtx) return

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setHours(0,0,0,0)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  try {
    // 1. Visitor Chart Logic
    const { data: views } = await supabase
      .from('analytics')
      .select('created_at')
      .eq('event_name', 'page_view')
      .gte('created_at', sevenDaysAgo.toISOString())

    const visitorLabels = []
    const visitorCounts = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
      
      const count = views ? views.filter(v => v.created_at.startsWith(dateStr)).length : 0
      
      visitorLabels.push(label)
      visitorCounts.push(count)
    }

    if (analyticsChart) analyticsChart.destroy()
    analyticsChart = new Chart(visitorCtx, {
      type: 'line',
      data: {
        labels: visitorLabels,
        datasets: [{
          label: 'Kunjungan Halaman',
          data: visitorCounts,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            ticks: { stepSize: 1, color: '#94a3b8' } 
          },
          x: { 
            grid: { display: false }, 
            ticks: { color: '#94a3b8' } 
          }
        }
      }
    })

    // 2. Projects Popularity Chart Logic
    const { data: projectViews } = await supabase
      .from('analytics')
      .select('event_data')
      .eq('event_name', 'project_view')

    const { data: allProjects } = await supabase.from('projects').select('id, title')
    const projectMap = {}
    if (allProjects) {
      allProjects.forEach(p => projectMap[p.id] = p.title)
    }

    const projectCounts = {}
    if (projectViews) {
      projectViews.forEach(v => {
        const id = v.event_data?.id
        if (id) {
          const name = projectMap[id] || `Project ${id.substring(0, 5)}...`
          projectCounts[name] = (projectCounts[name] || 0) + 1
        }
      })
    }

    const sortedProjects = Object.entries(projectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const projectLabels = sortedProjects.map(p => p[0])
    const projectData = sortedProjects.map(p => p[1])

    if (projectsChart) projectsChart.destroy()
    projectsChart = new Chart(projectCtx, {
      type: 'bar',
      data: {
        labels: projectLabels,
        datasets: [{
          label: 'Jumlah Klik',
          data: projectData,
          backgroundColor: '#a855f7',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bar
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            ticks: { stepSize: 1, color: '#94a3b8' } 
          },
          y: { 
            grid: { display: false }, 
            ticks: { color: '#94a3b8' } 
          }
        }
      }
    })

  } catch (err) {
    console.warn('Analytics logic error:', err)
  }
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
    logActivity(`Menyimpan project: ${payload.title}`)
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
  if (articleEditor) articleEditor.value('')
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
      content: articleEditor ? articleEditor.value() : document.getElementById('articleContent').value,
      category: document.getElementById('articleCategory').value,
      published: document.getElementById('articlePublished').checked,
    }

    if (id) await supabase.from('articles').update(payload).eq('id', id)
    else await supabase.from('articles').insert(payload)

    document.getElementById('articleThumbFile').value = '' // Clear file input
    logActivity(`Menyimpan artikel: ${payload.title}`)
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
  if (articleEditor) articleEditor.value(a.content || '')
  else document.getElementById('articleContent').value = a.content
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
    logActivity(`Memperbarui profile`)
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
  const { data: exp } = await supabase.from('experience').select('*').order('sort_order', { ascending: true })
  const { data: edu } = await supabase.from('education').select('*').order('sort_order', { ascending: true })

  const expTbody = document.getElementById('experienceTableBody')
  if (expTbody) {
    expTbody.innerHTML = (exp || []).map(e => `
      <tr data-id="${e.id}">
        <td class="drag-handle" style="cursor:grab; color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg></td>
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
      <tr data-id="${e.id}">
        <td class="drag-handle" style="cursor:grab; color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg></td>
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

// ===== MEDIA LIBRARY =====
async function loadMedia() {
  const grid = document.getElementById('mediaGrid');
  const loader = document.getElementById('mediaLoader');
  if (!grid) return;

  grid.innerHTML = '';
  loader.style.display = 'block';

  try {
    const folders = ['', 'projects', 'articles', 'certificates', 'cv'];
    let allFiles = [];

    for (const folder of folders) {
      const { data, error } = await supabase.storage.from('portfolio').list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' }
      });

      if (error) throw error;
      
      if (data) {
        data.filter(f => f.name !== '.emptyFolderPlaceholder').forEach(f => {
          const path = folder ? `${folder}/${f.name}` : f.name;
          const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);
          allFiles.push({ ...f, path, url: urlData.publicUrl, folder });
        });
      }
    }

    loader.style.display = 'none';
    if (allFiles.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Belum ada media diunggah.</div>';
      return;
    }

    grid.innerHTML = allFiles.map(f => `
      <div class="media-card" 
           onclick="openMediaPreview('${f.url}', '${f.name}', '${f.path}', '${f.metadata?.mimetype}')"
           style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; position: relative; transition: var(--transition); cursor: pointer;">
        <div style="height: 140px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
          ${f.metadata?.mimetype?.startsWith('image/') 
            ? `<img src="${f.url}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="font-size: 2rem;">📄</div>`
          }
        </div>
        <div style="padding: 10px;">
          <div style="font-size: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px;" title="${f.name}">${f.name}</div>
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-outline btn-sm" style="flex: 1; padding: 4px;" onclick="event.stopPropagation(); copyToClipboard('${f.url}')">Link</button>
            <button class="btn btn-danger btn-sm" style="flex: 0 0 32px; padding: 4px;" onclick="event.stopPropagation(); deleteMedia('${f.path}')">🗑️</button>
          </div>
        </div>
        <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); font-size: 10px; padding: 2px 5px; border-radius: 4px; color: #fff;">${f.folder || 'root'}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load media error:', err);
    loader.textContent = 'Gagal memuat media.';
  }
}

window.copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    showCustomAlert('success', 'URL disalin ke clipboard!');
  });
}

window.deleteMedia = async (path) => {
  if (confirm('Hapus media ini secara permanen?')) {
    const { error } = await supabase.storage.from('portfolio').remove([path]);
    if (error) showCustomAlert('error', 'Gagal menghapus: ' + error.message);
    else {
      showCustomAlert('success', 'Media dihapus!');
      closeModal('mediaPreviewModal');
      loadMedia();
    }
  }
}

window.openMediaPreview = (url, name, path, mimeType) => {
  const modal = document.getElementById('mediaPreviewModal');
  const title = document.getElementById('previewTitle');
  const content = document.getElementById('previewContent');
  const copyBtn = document.getElementById('previewCopyBtn');
  const deleteBtn = document.getElementById('previewDeleteBtn');

  title.textContent = name;
  
  if (mimeType && mimeType.startsWith('image/')) {
    content.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 100%; border-radius: var(--radius-sm);">`;
  } else if (mimeType === 'application/pdf') {
    content.innerHTML = `<iframe src="${url}" style="width: 100%; height: 60vh; border: none;"></iframe>`;
  } else {
    content.innerHTML = `<div style="padding: 40px; background: var(--bg-secondary); border-radius: var(--radius-sm);">Pratinjau tidak tersedia untuk jenis file ini.<br><a href="${url}" target="_blank" style="color: var(--accent);">Buka di tab baru</a></div>`;
  }

  copyBtn.onclick = () => copyToClipboard(url);
  deleteBtn.onclick = () => deleteMedia(path);

  modal.classList.add('active');
}

document.getElementById('mediaUploadInput')?.addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  showCustomAlert('info', `Mengunggah ${files.length} file...`);
  
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`; // Put all admin uploads in an 'uploads' folder

    const { error } = await supabase.storage.from('portfolio').upload(filePath, file);
    if (error) {
      showCustomAlert('error', `Gagal upload ${file.name}: ${error.message}`);
    }
  }

  showCustomAlert('success', 'Semua file berhasil diunggah!');
  loadMedia();
  e.target.value = ''; // Reset input
});

// ===== AI ASSISTANT =====
function initAI() {
  const btn = document.getElementById('aiAssistantBtn');
  const menu = document.getElementById('aiOptionsMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });

  document.querySelectorAll('.ai-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const task = opt.dataset.task;
      handleAIAction(task);
    });
  });
}

async function handleAIAction(task) {
  if (!articleEditor) return;
  const originalText = articleEditor.value().trim();
  if (!originalText) {
    showCustomAlert('warning', 'Tuliskan sesuatu terlebih dahulu agar AI bisa membantu.');
    return;
  }

  showCustomAlert('info', 'AI sedang memproses teks Anda...');
  
  let prompt = "";
  switch(task) {
    case 'improve':
      prompt = "Perbaiki tata bahasa dan ejaan teks berikut tanpa mengubah maknanya. Pastikan hasilnya tetap dalam format Markdown.";
      break;
    case 'professional':
      prompt = "Ubah teks berikut agar terdengar lebih profesional, elegan, dan meyakinkan untuk audiens portofolio IT. Tetap gunakan format Markdown.";
      break;
    case 'shorten':
      prompt = "Ringkas teks berikut agar lebih padat dan to-the-point namun tetap informatif. Gunakan format Markdown.";
      break;
    case 'translate':
      prompt = "Jika teks berikut berbahasa Indonesia, terjemahkan ke Bahasa Inggris yang profesional. Jika berbahasa Inggris, terjemahkan ke Bahasa Indonesia yang baik dan benar. Tetap gunakan format Markdown.";
      break;
  }

  try {
    const response = await fetch("/api/ai/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemma-3n-e2b-it",
        messages: [
          { role: "system", content: "Kamu adalah asisten penulis profesional. Bantu pengguna memperbaiki teks mereka untuk portofolio. Kembalikan HANYA teks hasilnya saja dalam format Markdown." },
          { role: "user", content: `${prompt}\n\nTEKS:\n${originalText}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error('AI API Error');
    const data = await response.json();
    const result = data.choices[0].message.content;

    if (result) {
      articleEditor.value(result);
      showCustomAlert('success', 'Teks berhasil diperbarui oleh AI!');
    }
  } catch (err) {
    console.error('AI Error:', err);
    showCustomAlert('error', 'Gagal menghubungi AI. Pastikan koneksi internet stabil.');
  }
}

// ===== INIT =====
initAuth()
