import urllib.parse
import psycopg2
import os
from dotenv import load_dotenv

# Load credentials from backend/.env if available
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(env_path)

raw_password = os.getenv('SUPABASE_DB_PASSWORD')
if not raw_password:
    raise ValueError('SUPABASE_DB_PASSWORD not found in .env')
password = urllib.parse.quote(raw_password, safe='')
ref = 'pnbxyubafwfqaclwcsya'
host = 'aws-0-eu-west-1.pooler.supabase.com'
conn_str = f'postgresql://postgres.{ref}:{password}@{host}:6543/postgres?sslmode=require'

migrations = [
    '01_schema.sql',
    '02_training_programs.sql',
    '03_onboarding.sql',
    '04_grammar_and_faculty.sql',
]

print(f'Connecting to Supabase PostgreSQL at {host}...')
conn = psycopg2.connect(conn_str)
conn.autocommit = True
cur = conn.cursor()

for m in migrations:
    m_path = os.path.join(os.path.dirname(__file__), m)
    if os.path.exists(m_path):
        print(f'Running {m}...')
        with open(m_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        cur.execute(sql)
        print(f'Finished {m} successfully!')

print('\n--- Tables in public schema ---')
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
""")
tables = cur.fetchall()
print('Tables in public schema:', [t[0] for t in tables])

print('\n--- Columns in users table ---')
cur.execute("""
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position;
""")
for col in cur.fetchall():
    print(f'  {col[0]}: {col[1]} (default: {col[2]})')

print('\n--- Columns in logs table ---')
cur.execute("""
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'logs' 
    ORDER BY ordinal_position;
""")
for col in cur.fetchall():
    print(f'  {col[0]}: {col[1]} (default: {col[2]})')

cur.close()
conn.close()
print('\nMigration complete and verified!')
