import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholderValue = value =>
  /^(?:\*+|your[-_ ]|placeholder|replace[-_ ]?me)|\.{3}/i.test(value.trim());
console.log("SUPABASE URL =", supabaseUrl);
console.log("SUPABASE KEY =", supabaseAnonKey?.substring(0,30));

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  !supabaseUrl.toLowerCase().includes('placeholder') &&
  !isPlaceholderValue(supabaseUrl) &&
  !isPlaceholderValue(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL migration schema for Supabase:
 * 
 * -- 1. Profiles Table
 * create table if not exists profiles (
 *   id text primary key,
 *   name text not null,
 *   email text unique not null,
 *   university text not null,
 *   cohort text,
 *   niche text,
 *   bio text,
 *   skills text[],
 *   availability text,
 *   github text,
 *   linkedin text,
 *   rating numeric default 5.0,
 *   verified boolean default true,
 *   completed_projects int default 0,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- 2. Projects Table
 * create table if not exists projects (
 *   id text primary key,
 *   title text not null,
 *   category text not null,
 *   owner_id text not null,
 *   owner_name text not null,
 *   owner_university text,
 *   description text not null,
 *   required_skills text[],
 *   open_spots int default 2,
 *   total_spots int default 4,
 *   members text[],
 *   deadline text,
 *   status text default 'Recruiting Collaborators',
 *   architecture text,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- 3. Requests Table
 * create table if not exists requests (
 *   id text primary key,
 *   project_id text not null,
 *   project_title text not null,
 *   from_user_id text not null,
 *   from_user_name text not null,
 *   from_user_niche text,
 *   to_user_id text not null,
 *   message text,
 *   status text default 'pending',
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 */
