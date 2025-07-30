CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT CHECK (role IN ('candidate','company')) DEFAULT 'candidate',
  verified      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT now()
);

CREATE TABLE jobs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID REFERENCES users(id),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  remote      BOOLEAN DEFAULT FALSE,
  salary_min  INTEGER,
  salary_max  INTEGER,
  vip_until   TIMESTAMP,
  created_at  TIMESTAMP DEFAULT now()
);

CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stage       TEXT CHECK (stage IN ('Applied','Phone','Onsite','Offer')) DEFAULT 'Applied',
  video_url   TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE messages (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id TEXT NOT NULL,
  from_id   UUID REFERENCES users(id),
  body      TEXT NOT NULL,
  sent      TIMESTAMP DEFAULT now()
);

CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  rating     SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP DEFAULT now()
);
