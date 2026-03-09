import { useEffect } from "react";

const Documentation = () => {
  useEffect(() => {
    document.title = "WeGive110 Clubhouse — Technical Documentation";
  }, []);

  return (
    <div className="bg-white text-gray-900 min-h-screen p-8 max-w-4xl mx-auto print:p-4" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Cover */}
      <div className="text-center mb-16 pt-12 print:pt-4 print:mb-8">
        <h1 className="text-4xl font-bold mb-2">WeGive110 Clubhouse</h1>
        <p className="text-xl text-gray-600 mb-1">Technical Documentation & App Overview</p>
        <p className="text-sm text-gray-400">Generated March 9, 2026</p>
        <p className="text-sm text-gray-400 mt-1">Published URL: wegive110clubhouse.lovable.app</p>
        <hr className="mt-8 border-gray-300" />
      </div>

      {/* Table of Contents */}
      <section className="mb-12 print:mb-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Table of Contents</h2>
        <ol className="list-decimal ml-6 space-y-1 text-blue-700">
          <li>App Overview</li>
          <li>Technology Stack</li>
          <li>Key Screens & Features</li>
          <li>Routing & Navigation</li>
          <li>Component Architecture</li>
          <li>Data Models (Database Schema)</li>
          <li>Authentication & Authorization</li>
          <li>API Integrations (Edge Functions)</li>
          <li>Security (RLS Policies)</li>
          <li>PWA & Deployment</li>
        </ol>
      </section>

      {/* 1. App Overview */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">1. App Overview</h2>
        <p className="mb-3 leading-relaxed">
          <strong>WeGive110 Clubhouse</strong> is a full-stack web application designed for baseball teams and athletes. It provides a centralized platform for training management, team coordination, player development tracking, and community engagement.
        </p>
        <p className="leading-relaxed">
          The app serves three primary user roles: <strong>Coaches</strong> (team management, content administration), <strong>Players</strong> (training, progress tracking, goal setting), and <strong>Parents</strong> (visibility into player progress). A <strong>Super Admin</strong> role manages platform-wide content and users.
        </p>
      </section>

      {/* 2. Technology Stack */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">2. Technology Stack</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead><tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Layer</th>
            <th className="border border-gray-300 p-2 text-left">Technology</th>
          </tr></thead>
          <tbody>
            <tr><td className="border border-gray-300 p-2">Frontend Framework</td><td className="border border-gray-300 p-2">React 18 + TypeScript</td></tr>
            <tr><td className="border border-gray-300 p-2">Build Tool</td><td className="border border-gray-300 p-2">Vite 5</td></tr>
            <tr><td className="border border-gray-300 p-2">Styling</td><td className="border border-gray-300 p-2">Tailwind CSS 3 + shadcn/ui</td></tr>
            <tr><td className="border border-gray-300 p-2">Routing</td><td className="border border-gray-300 p-2">React Router DOM v6</td></tr>
            <tr><td className="border border-gray-300 p-2">State / Data Fetching</td><td className="border border-gray-300 p-2">TanStack React Query v5</td></tr>
            <tr><td className="border border-gray-300 p-2">Forms</td><td className="border border-gray-300 p-2">React Hook Form + Zod validation</td></tr>
            <tr><td className="border border-gray-300 p-2">Backend / Database</td><td className="border border-gray-300 p-2">Supabase (PostgreSQL, Auth, Edge Functions, Storage)</td></tr>
            <tr><td className="border border-gray-300 p-2">Charts</td><td className="border border-gray-300 p-2">Recharts</td></tr>
            <tr><td className="border border-gray-300 p-2">Drag & Drop</td><td className="border border-gray-300 p-2">@dnd-kit</td></tr>
            <tr><td className="border border-gray-300 p-2">PWA</td><td className="border border-gray-300 p-2">vite-plugin-pwa</td></tr>
            <tr><td className="border border-gray-300 p-2">Hosting</td><td className="border border-gray-300 p-2">Lovable Cloud</td></tr>
          </tbody>
        </table>
      </section>

      {/* 3. Key Screens & Features */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">3. Key Screens & Features</h2>

        <h3 className="text-lg font-semibold mt-4 mb-2">Landing Page (/landing)</h3>
        <p className="mb-2 leading-relaxed">Public marketing page with hero section, feature highlights (Teams, Workouts, Videos, Playbook), and sign-up/sign-in CTAs.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Dashboard (/ — authenticated)</h3>
        <p className="mb-2 leading-relaxed">Personalized home screen showing: Hero banner, Player Progress Dashboard (streak display, progress rings), Resource cards linking to Workouts, Schedule, Videos, and Return &amp; Report, and a Motivational section.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Drive 5 (/drive5)</h3>
        <p className="mb-2 leading-relaxed">Daily accountability system with 5 training categories. Players set goals, create custom tasks per category, and check in daily. Features streak tracking, weekly progress charts, team leaderboards, and weekly report generation.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Progress (/progress)</h3>
        <p className="mb-2 leading-relaxed">Visual dashboard showing training streaks, completion rates, progress rings, and team-wide progress views for coaches.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Workouts (/workouts)</h3>
        <p className="mb-2 leading-relaxed">Categorized workout library with embedded YouTube videos. Categories include strength, speed, conditioning, etc. Players can favorite workouts, and video watch time is tracked.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Videos (/videos)</h3>
        <p className="mb-2 leading-relaxed">Curated video library organized by categories (e.g., Mindset, Hitting, Pitching). Each video links to YouTube with metadata (title, description, duration).</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Playbook (/playbook)</h3>
        <p className="mb-2 leading-relaxed">Multi-journey educational content system. Each journey contains ordered chapters with key takeaways, readings, and interactive exercises. Players submit exercise responses that coaches can review.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Schedule (/schedule)</h3>
        <p className="mb-2 leading-relaxed">Team calendar showing games, practices, team meetings, workouts, and off days. Supports file attachments and opponent tracking for games.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Practices (/practices)</h3>
        <p className="mb-2 leading-relaxed">Detailed practice plans with drills, coaching points, phase breakdowns, and duration tracking. Supports templates for reuse. Calendar and list views available.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Community / Clubhouse (/community)</h3>
        <p className="mb-2 leading-relaxed">Social feed where players and coaches can create posts, comment (with nested replies), like content, and mention other users. Badge system for recognition.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Teams (/teams/:teamId)</h3>
        <p className="mb-2 leading-relaxed">Full team management: roster, depth chart (baseball field view), team schedule, team-specific posts, playbook/video/workout content assignment, and invite system (email invitations with tokens).</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Return & Report (/return-report)</h3>
        <p className="mb-2 leading-relaxed">Team meeting recordings and Google Meet integration for live sessions. Coaches manage recordings; players access the archive.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Profile (/profile)</h3>
        <p className="mb-2 leading-relaxed">User profile management with display name, avatar, bio, and earned badges display.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Admin Panel (/admin)</h3>
        <p className="mb-2 leading-relaxed">Super admin dashboard with: user management, role management, activity logs viewer, and content management for all sections (workouts, videos, playbook, schedule, practices, badges, return report settings).</p>
      </section>

      {/* 4. Routing */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">4. Routing & Navigation</h2>
        <p className="mb-3 leading-relaxed">The app uses React Router v6 with protected routes. Unauthenticated users are redirected to /landing. Authenticated users see the Dashboard at /.</p>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead><tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Route</th>
            <th className="border border-gray-300 p-2 text-left">Page</th>
            <th className="border border-gray-300 p-2 text-left">Auth</th>
          </tr></thead>
          <tbody>
            {[
              ["/", "Dashboard (Index)", "Yes"],
              ["/landing", "Landing Page", "No"],
              ["/auth", "Sign In / Sign Up", "No"],
              ["/workouts", "Workouts Library", "Yes"],
              ["/workouts/admin", "Workouts Admin", "Yes (Admin)"],
              ["/videos", "Video Library", "Yes"],
              ["/videos/admin", "Videos Admin", "Yes (Admin)"],
              ["/playbook", "Playbook Journeys", "Yes"],
              ["/playbook/admin", "Playbook Admin", "Yes (Admin)"],
              ["/schedule", "Schedule Calendar", "Yes"],
              ["/schedule/admin", "Schedule Admin", "Yes (Admin)"],
              ["/practices", "Practice Plans", "Yes"],
              ["/practices/admin", "Practices Admin", "Yes (Admin)"],
              ["/return-report", "Return & Report", "Yes"],
              ["/return-report/admin", "Return Report Admin", "Yes (Admin)"],
              ["/community", "Community Feed", "Yes"],
              ["/community/badges", "Badges Admin", "Yes (Admin)"],
              ["/teams/:teamId", "Team Page", "Yes"],
              ["/teams/:teamId/admin", "Team Admin", "Yes (Coach)"],
              ["/teams/:teamId/settings", "Team Settings", "Yes (Coach)"],
              ["/teams/join", "Join Team", "No"],
              ["/profile", "User Profile", "Yes"],
              ["/progress", "Progress Dashboard", "Yes"],
              ["/drive5", "Drive 5", "Yes"],
              ["/admin", "Super Admin Panel", "No*"],
            ].map(([route, page, auth]) => (
              <tr key={route}><td className="border border-gray-300 p-1 font-mono text-xs">{route}</td><td className="border border-gray-300 p-1">{page}</td><td className="border border-gray-300 p-1">{auth}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-1">*Admin page has its own login gate via AdminLogin component.</p>
      </section>

      {/* 5. Component Architecture */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">5. Component Architecture</h2>
        <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto border border-gray-200 leading-relaxed">{`src/
├── components/
│   ├── ui/                    # shadcn/ui primitives (60+ components)
│   ├── admin/                 # Admin panel components
│   │   ├── AdminDashboard     # Main admin layout with tabs
│   │   ├── VideoManager       # CRUD for videos
│   │   ├── WorkoutManager     # CRUD for workouts
│   │   ├── ScheduleManager    # CRUD for schedule events
│   │   ├── RecordingsManager  # CRUD for recordings
│   │   ├── TeamManagement     # User/team management
│   │   ├── RoleManager        # Role assignment
│   │   ├── BadgesManager      # Badge CRUD
│   │   └── ActivityLogsManager# User activity viewer
│   ├── auth/                  # ForcePasswordChange
│   ├── community/             # Posts, Comments, Badges, Mentions
│   ├── drive5/                # Drive5 dashboard, goals, tasks, charts
│   ├── revive5/               # Revive5 (temporarily disabled)
│   ├── navigation/            # CoachAdminDropdown, MobileCoachTeams
│   ├── practices/             # Practice plans, drills, calendar
│   ├── progress/              # Progress rings, streaks, team view
│   ├── teams/                 # Roster, depth chart, invites, schedule
│   ├── Navigation.tsx         # Main app navigation bar
│   ├── HeroSection.tsx        # Dashboard hero
│   ├── Footer.tsx             # App footer
│   └── ProtectedRoute.tsx     # Auth guard wrapper
├── hooks/
│   ├── useAuth.tsx            # Auth context + role management
│   ├── useTeams.tsx           # Team CRUD operations
│   ├── useDrive5.tsx          # Drive5 data & check-ins
│   ├── usePlaybook.tsx        # Playbook data fetching
│   ├── usePractices.tsx       # Practice plan management
│   ├── usePlayerProgress.tsx  # Progress tracking
│   ├── useCoachTeams.tsx      # Coach team list
│   ├── useDepthChart.tsx      # Depth chart management
│   ├── useVideoWatchTime.tsx  # Video engagement tracking
│   ├── useWorkoutFavorites.tsx# Workout favorites
│   └── useActivityTracker.tsx # Page visit logging
├── pages/                     # Route-level page components
├── types/                     # TypeScript type definitions
├── data/                      # Static data (legacy, mostly DB-driven now)
└── integrations/supabase/     # Auto-generated Supabase client & types`}</pre>
      </section>

      {/* 6. Data Models */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">6. Data Models (Database Schema)</h2>
        <p className="mb-3 leading-relaxed">The app uses 35+ PostgreSQL tables via Supabase. Key entities:</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Core Tables</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead><tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Table</th>
            <th className="border border-gray-300 p-2 text-left">Purpose</th>
            <th className="border border-gray-300 p-2 text-left">Key Columns</th>
          </tr></thead>
          <tbody>
            {[
              ["profiles", "User profiles", "user_id, display_name, avatar_url, bio, posts_count, force_password_change"],
              ["user_roles", "Role-based access", "user_id, role (enum: super_admin, admin, coach, player, parent, user)"],
              ["teams", "Team entities", "name, description, age_group, season, invite_code, created_by"],
              ["team_members", "Team membership", "team_id, user_id, role, player_name, position, status"],
              ["team_member_players", "Parent→player mapping", "team_member_id, player_name, position, player_number"],
              ["team_invitations", "Email invites", "team_id, email, invite_type, token, expires_at"],
            ].map(([table, purpose, cols]) => (
              <tr key={table}><td className="border border-gray-300 p-1 font-mono text-xs">{table}</td><td className="border border-gray-300 p-1">{purpose}</td><td className="border border-gray-300 p-1 text-xs">{cols}</td></tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mt-4 mb-2">Content Tables</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead><tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Table</th>
            <th className="border border-gray-300 p-2 text-left">Purpose</th>
          </tr></thead>
          <tbody>
            {[
              ["workout_categories / workouts", "Categorized workout videos"],
              ["video_categories / videos", "Categorized training videos"],
              ["journeys / chapters", "Playbook educational content"],
              ["exercise_responses", "Player exercise submissions"],
              ["schedule_events", "Global schedule calendar"],
              ["team_events", "Team-specific events"],
              ["practices / practice_drills", "Practice plans with drill breakdowns"],
              ["practice_templates", "Reusable practice templates"],
              ["return_report_recordings", "Meeting recordings"],
              ["return_report_settings", "Google Meet configuration"],
            ].map(([table, purpose]) => (
              <tr key={table}><td className="border border-gray-300 p-1 font-mono text-xs">{table}</td><td className="border border-gray-300 p-1">{purpose}</td></tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mt-4 mb-2">Engagement & Tracking Tables</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead><tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Table</th>
            <th className="border border-gray-300 p-2 text-left">Purpose</th>
          </tr></thead>
          <tbody>
            {[
              ["drive5_categories / player_goals / goal_tasks / daily_checkins / task_completions", "Drive 5 accountability system"],
              ["player_streaks", "Training streak tracking"],
              ["training_logs", "Manual training log entries"],
              ["video_watch_sessions", "Video engagement tracking"],
              ["workout_favorites", "Saved workouts"],
              ["user_activity_logs", "Page visit analytics"],
              ["posts / post_likes / post_comments / comment_likes", "Community feed"],
              ["team_posts / team_post_likes / team_post_comments", "Team-specific social feed"],
              ["badges / user_badges", "Achievement badge system"],
              ["depth_chart", "Baseball position depth chart"],
              ["admin_permissions", "Granular admin permissions"],
            ].map(([table, purpose]) => (
              <tr key={table}><td className="border border-gray-300 p-1 font-mono text-xs">{table}</td><td className="border border-gray-300 p-1">{purpose}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 7. Auth */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">7. Authentication & Authorization</h2>
        <ul className="list-disc ml-6 space-y-2 leading-relaxed">
          <li><strong>Auth Provider:</strong> Supabase Auth (email/password)</li>
          <li><strong>Role System:</strong> PostgreSQL enum <code className="bg-gray-100 px-1 rounded text-xs">app_role</code> with values: super_admin, admin, coach, player, parent, user. Stored in <code className="bg-gray-100 px-1 rounded text-xs">user_roles</code> table (separate from profiles for security).</li>
          <li><strong>Role Checking:</strong> Database function <code className="bg-gray-100 px-1 rounded text-xs">has_role(user_id, role)</code> (SECURITY DEFINER) prevents RLS recursion.</li>
          <li><strong>Helper Functions:</strong> <code className="bg-gray-100 px-1 rounded text-xs">is_super_admin()</code>, <code className="bg-gray-100 px-1 rounded text-xs">is_team_coach(team_id)</code>, <code className="bg-gray-100 px-1 rounded text-xs">is_team_member(team_id)</code></li>
          <li><strong>Force Password Change:</strong> Admins can set temporary passwords; users are forced to change on next login via <code className="bg-gray-100 px-1 rounded text-xs">profiles.force_password_change</code>.</li>
          <li><strong>Protected Routes:</strong> <code className="bg-gray-100 px-1 rounded text-xs">ProtectedRoute</code> wrapper redirects unauthenticated users to /auth.</li>
        </ul>
      </section>

      {/* 8. Edge Functions */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">8. API Integrations (Edge Functions)</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead><tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Function</th>
            <th className="border border-gray-300 p-2 text-left">Purpose</th>
            <th className="border border-gray-300 p-2 text-left">JWT Verify</th>
          </tr></thead>
          <tbody>
            <tr><td className="border border-gray-300 p-1 font-mono text-xs">admin-api</td><td className="border border-gray-300 p-1">Admin operations (user management, role updates, password resets)</td><td className="border border-gray-300 p-1">No (internal auth check)</td></tr>
            <tr><td className="border border-gray-300 p-1 font-mono text-xs">teams-api</td><td className="border border-gray-300 p-1">Team operations (create, manage members, handle invites)</td><td className="border border-gray-300 p-1">No (internal auth check)</td></tr>
            <tr><td className="border border-gray-300 p-1 font-mono text-xs">create-team-member</td><td className="border border-gray-300 p-1">Create team member records during invite acceptance</td><td className="border border-gray-300 p-1">No</td></tr>
            <tr><td className="border border-gray-300 p-1 font-mono text-xs">send-team-invite</td><td className="border border-gray-300 p-1">Send email invitations to join teams</td><td className="border border-gray-300 p-1">No</td></tr>
            <tr><td className="border border-gray-300 p-1 font-mono text-xs">drive5-reports</td><td className="border border-gray-300 p-1">Generate weekly Drive 5 progress reports</td><td className="border border-gray-300 p-1">No</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">All edge functions implement strict input validation and sanitize error responses to prevent leaking internal details.</p>
      </section>

      {/* 9. Security */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">9. Security (Row-Level Security)</h2>
        <p className="mb-3 leading-relaxed">Every table has RLS enabled with restrictive policies. Key patterns:</p>
        <ul className="list-disc ml-6 space-y-2 leading-relaxed">
          <li><strong>User-owned data:</strong> Users can only CRUD their own records (checkins, goals, posts, streaks).</li>
          <li><strong>Team data:</strong> Team members can view; coaches can manage. Uses <code className="bg-gray-100 px-1 rounded text-xs">is_team_member()</code> and <code className="bg-gray-100 px-1 rounded text-xs">is_team_coach()</code> functions.</li>
          <li><strong>Public content:</strong> Published workouts, videos, chapters, and badges are viewable by all authenticated users.</li>
          <li><strong>Admin content:</strong> Super admins have ALL access via <code className="bg-gray-100 px-1 rounded text-xs">is_super_admin()</code> check.</li>
          <li><strong>Parent visibility:</strong> Parents can view their players' goals, checkins, and streaks via team membership check.</li>
          <li><strong>Public view:</strong> <code className="bg-gray-100 px-1 rounded text-xs">profiles_public</code> view exposes only non-sensitive profile data for community features.</li>
        </ul>
      </section>

      {/* 10. PWA */}
      <section className="mb-10 print:mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b pb-2">10. PWA & Deployment</h2>
        <ul className="list-disc ml-6 space-y-2 leading-relaxed">
          <li><strong>PWA:</strong> Service worker via vite-plugin-pwa with 192x192 and 512x512 icons. Installable on mobile devices.</li>
          <li><strong>Deployment:</strong> Frontend hosted on Lovable Cloud. Backend (database, auth, edge functions, storage) on Supabase infrastructure.</li>
          <li><strong>Frontend updates:</strong> Deployed via Lovable publish button.</li>
          <li><strong>Backend updates:</strong> Edge functions and database migrations deploy automatically.</li>
        </ul>
      </section>

      {/* Print button */}
      <div className="text-center py-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Save as PDF (Print)
        </button>
        <p className="text-sm text-gray-500 mt-2">Use your browser's "Save as PDF" option in the print dialog.</p>
      </div>
    </div>
  );
};

export default Documentation;
