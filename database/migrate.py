import urllib.parse
import psycopg2
import os
from dotenv import load_dotenv

# Load credentials from backend/.env if available
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(env_path)

password = urllib.parse.quote('Vf!QRc+uJ3Ug/CZ', safe='')
ref = 'qizadnqkqxdadmvhrhhm'
host = 'aws-0-eu-west-2.pooler.supabase.com'
conn_str = f'postgresql://postgres.{ref}:{password}@{host}:6543/postgres?sslmode=require'

schema_file = os.path.join(os.path.dirname(__file__), '01_schema.sql')
with open(schema_file, 'r', encoding='utf-8') as f:
    sql = f.read()

print(f'Connecting to Supabase PostgreSQL at {host}...')
conn = psycopg2.connect(conn_str)
conn.autocommit = True
cur = conn.cursor()

print('Running 01_schema.sql...')
cur.execute(sql)
print('Schema executed successfully!')

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
""")
tables = cur.fetchall()
print('Tables in public schema:', [t[0] for t in tables])

cur.close()
conn.close()
print('Migration complete!')
