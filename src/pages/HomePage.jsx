import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Network, 
  ChevronRight, 
  Zap, 
  Search, 
  Users, 
  Shield, 
  Sparkles, 
  Braces, 
  ArrowRight, 
  CheckCircle2, 
  FolderPlus,
  Database,
  Cloud,
  Layers,
  GraduationCap,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Shadcn UI Components
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardTitle, CardDescription, CardContent } from '../components/ui/card';

export default function HomePage({ onOpenAuth, onOpenCreateProject }) {
  const { currentUser, isSupabaseConfigured } = useAuth();

  return (
    <div className="w-full overflow-hidden">
      {/* Top Announcement Bar */}
      <div className="pt-24 pb-2 px-4 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Gen Capstone Matching Platform</span>
          <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">•</span>
          <span className="hidden sm:inline font-normal text-zinc-600 dark:text-zinc-300">
            {isSupabaseConfigured ? '⚡ Connected to Supabase Backend' : '📦 Powered by React + Vite & Supabase Ready'}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-20 text-center max-w-6xl mx-auto">
        {/* Glow backdrop element */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 md:w-[600px] h-72 sm:h-96 md:h-[600px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading leading-tight mb-6">
          Assemble Your Dream <br className="hidden sm:inline" />
          <span className="text-gradient">Capstone & Research Team</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 mb-10 leading-relaxed">
          Stop leaving team formation to chance. Algorithmic peer matching driven by Cosine Similarity, Jaccard Index, and graph relationship modeling to eliminate academic skill gaps.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          {currentUser ? (
            <>
              <Button asChild size="lg" variant="gradient" className="w-full sm:w-auto">
                <Link to="/teammates">
                  Find Teammates <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button onClick={onOpenCreateProject} size="lg" variant="outline" className="w-full sm:w-auto">
                <FolderPlus className="w-4 h-4 mr-2" /> Post a Project
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => onOpenAuth('signup')} size="lg" variant="gradient" className="w-full sm:w-auto">
                Create Student Profile <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/projects">
                  Explore Projects
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 text-center py-5">
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">+40%</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Completion Boost</div>
            </CardContent>
          </Card>
          
          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 text-center py-5">
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">Cosine+Jaccard</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Dual Algorithm Match</div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 text-center py-5">
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">Graph DB</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Entity Traversal</div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 text-center py-5">
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">Supabase</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Realtime Backend</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* University Cohorts Supported */}
      <section className="border-y border-zinc-200/80 dark:border-zinc-800/80 py-8 bg-zinc-100/50 dark:bg-zinc-950/40">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
            Designed for capstone cohorts & research labs across academic institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-sm sm:text-base font-semibold text-zinc-600 dark:text-zinc-400">
            <span>Stanford University</span>
            <span>•</span>
            <span>MIT Informatics</span>
            <span>•</span>
            <span>Carnegie Mellon</span>
            <span>•</span>
            <span>UC Berkeley</span>
            <span>•</span>
            <span>KTH Royal Institute</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3">
            Simple 3-Step Workflow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
            How CollabForge Works
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm sm:text-base">
            From initial student registration to complete capstone delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl mb-4 font-heading">
              1
            </div>
            <CardTitle className="text-xl mb-2">Build Student Profile</CardTitle>
            <CardDescription className="text-sm">
              Showcase your technical niche, programming languages, past portfolio links, weekly availability, and academic cohort goals.
            </CardDescription>
          </Card>

          <Card className="p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl mb-4 font-heading">
              2
            </div>
            <CardTitle className="text-xl mb-2">Algorithmic Discovery</CardTitle>
            <CardDescription className="text-sm">
              Our Cosine Similarity and Jaccard Index matchmaker calculates pairwise compatibility across all student profiles and project rosters.
            </CardDescription>
          </Card>

          <Card className="p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xl mb-4 font-heading">
              3
            </div>
            <CardTitle className="text-xl mb-2">Real-Time Team Formation</CardTitle>
            <CardDescription className="text-sm">
              Send instant collaboration requests, track applications in your dashboard, and start building with zero skill gaps.
            </CardDescription>
          </Card>
        </div>
      </section>

      {/* Modern Stack & Architecture Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-3">
            Robust Technical Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
            Production-Ready Architecture
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm sm:text-base">
            Designed to scale from small collegiate cohorts to university-wide research ecosystems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-1">React + Vite</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Ultra-fast HMR and reactive SPA frontend built with modern Vite tooling and React 19.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-1">Tailwind + Shadcn</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Accessible, responsive design system featuring Tailwind CSS v4 and polished Shadcn UI primitives.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-1">Supabase Backend</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Scalable PostgreSQL database with Row-Level Security, Auth, and Real-Time WebSocket channels.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-1">Vercel Hosting</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Global Edge CDN distribution with instantaneous deployments and zero-config SPA rewrites.
            </p>
          </Card>
        </div>
      </section>

      {/* High-Impact Final Call to Action */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 text-center border border-indigo-500/30 bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-pink-900/30 backdrop-blur-3xl overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <Badge variant="gradient" className="mb-4">
              Join Academic Cohort 2026
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-heading mb-4">
              Ready to Form Your Capstone Team?
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
              Create your verified student profile in under 60 seconds. Our algorithm will match you with complementary peers immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Button asChild size="lg" variant="gradient">
                  <Link to="/teammates">
                    Explore Compatible Teammates <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => onOpenAuth('signup')} size="lg" variant="gradient">
                  Sign Up & Build Profile <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button asChild size="lg" variant="secondary">
                <Link to="/projects">
                  Browse Active Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
