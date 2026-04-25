-- [ignoring loop detection]

-- 1. TABEL DATABASE EXISTING & BARU
-- ----------------------------------------------------------

-- Update tabel projects untuk case study
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('design', 'web', 'network')),
  year TEXT,
  thumbnail TEXT,
  url TEXT,
  tech_stack TEXT,
  case_study TEXT, -- Penjelasan detail project
  gallery TEXT[], -- Array URL gambar galeri
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambah kolom case_study dan gallery jika belum ada (Safe Alter)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- Tabel Blog / Articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Profile, Messages, Experience, Education, Testimonials (Tetap)
CREATE TABLE IF NOT EXISTS profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  title TEXT,
  bio TEXT,
  email TEXT,
  whatsapp TEXT,
  location TEXT,
  github TEXT,
  linkedin TEXT,
  instagram TEXT,
  cv_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KEAMANAN (RLS)
-- ----------------------------------------------------------
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop and Recreate Policies (Safe Mode)
DROP POLICY IF EXISTS "Public Read Projects" ON projects;
CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Projects" ON projects;
CREATE POLICY "Admin CRUD Projects" ON projects FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Articles" ON articles;
CREATE POLICY "Public Read Articles" ON articles FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admin CRUD Articles" ON articles;
CREATE POLICY "Admin CRUD Articles" ON articles FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Profile" ON profile;
CREATE POLICY "Public Read Profile" ON profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Profile" ON profile;
CREATE POLICY "Admin CRUD Profile" ON profile FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Experience" ON experience;
CREATE POLICY "Public Read Experience" ON experience FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Experience" ON experience;
CREATE POLICY "Admin CRUD Experience" ON experience FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Education" ON education;
CREATE POLICY "Public Read Education" ON education FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Education" ON education;
CREATE POLICY "Admin CRUD Education" ON education FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Testimonials" ON testimonials;
CREATE POLICY "Admin CRUD Testimonials" ON testimonials FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Insert Messages" ON messages;
CREATE POLICY "Public Insert Messages" ON messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin Read Messages" ON messages;
CREATE POLICY "Admin Read Messages" ON messages FOR SELECT TO authenticated USING (true);

-- 3. STORAGE
-- ----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admin Upload Files" ON storage.objects;
CREATE POLICY "Admin Upload Files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Admin Edit Files" ON storage.objects;
CREATE POLICY "Admin Edit Files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Admin Delete Files" ON storage.objects;
CREATE POLICY "Admin Delete Files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Public View Files" ON storage.objects;
CREATE POLICY "Public View Files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'portfolio');

-- 4. CHATBOT KATA KUNCI
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chatbot_keywords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Chatbot" ON chatbot_keywords;
CREATE POLICY "Public Read Chatbot" ON chatbot_keywords FOR SELECT USING (true);

-- 5. SERTIFIKAT (CERTIFICATES)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT,
  image_url TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Certificates" ON certificates;
CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin CRUD Certificates" ON certificates;
CREATE POLICY "Admin CRUD Certificates" ON certificates FOR ALL TO authenticated USING (true);
-- 6. ANALITIK & STATISTIK (ANALYTICS)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL, -- page_view, cv_click, project_view
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert events" ON analytics;
CREATE POLICY "Allow public insert events" ON analytics FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated view events" ON analytics;
CREATE POLICY "Allow authenticated view events" ON analytics FOR SELECT TO authenticated USING (true);

-- 7. LOG AKTIVITAS ADMIN (ACTIVITY LOG)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated view log" ON activity_log;
CREATE POLICY "Allow authenticated view log" ON activity_log FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert log" ON activity_log;
CREATE POLICY "Allow authenticated insert log" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- 8. DATABASE GRANTS (PENTING UNTUK AKSES API)
-- ----------------------------------------------------------
GRANT INSERT ON TABLE analytics TO anon;
GRANT INSERT ON TABLE analytics TO authenticated;
GRANT SELECT ON TABLE analytics TO authenticated;
GRANT SELECT ON TABLE activity_log TO authenticated;
GRANT INSERT ON TABLE activity_log TO authenticated;

-- 9. SEED DATA (OPSIONAL)
-- ----------------------------------------------------------
INSERT INTO chatbot_keywords (keyword, response) VALUES
('halo, hai, hello, hi', 'Halo! Selamat datang di portofolio saya. Ada yang bisa saya bantu hari ini?'),
('jasa, layanan, service', 'Saya melayani pembuatan Website (Frontend/Backend), Desain UI/UX, dan konfigurasi Network. Anda tertarik yang mana?'),
('harga, biaya, fee, price', 'Untuk estimasi biaya, biasanya tergantung pada kompleksitas proyek. Silakan tinggalkan pesan di menu ''Messages'' agar saya bisa memberikan penawaran terbaik.'),
('lokasi, alamat, tinggal', 'Saya berbasis di Indonesia, namun saya terbuka untuk bekerja sama secara remote dengan klien dari mana saja.'),
('kontak, wa, whatsapp, email', 'Anda bisa menghubungi saya langsung melalui WhatsApp atau Email yang tertera di bagian footer website ini.'),
('proyek, karya, hasil', 'Anda bisa melihat daftar karya terbaru saya di bagian menu ''Projects''. Di sana lengkap dengan detail teknologi yang saya gunakan.')
ON CONFLICT DO NOTHING;
