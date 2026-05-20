import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Fetch administrative team contact info from database assets
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/staff-public');
        const result = await res.json();
        if (res.ok) {
          setStaff(result.data || []);
        }
      } catch (err) {
        console.error('Failed to resolve system management team directories:', err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaffMembers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans scroll-smooth">
      
      {/* ================= HEADER NAVIGATION BAR ================= */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-xl text-white font-black text-lg tracking-wider shadow-md shadow-blue-500/20">L</span>
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">Lib<span className="text-blue-600">Core</span></span>
          </div>
          
          {/* Section Anchors */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="#team" className="hover:text-blue-600 transition-colors">Our Team</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact & Location</a>
          </div>

          {/* Core Gateway Call-To-Actions */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5">
              Join as Member
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <header className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent opacity-70"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 inline-block">
            Next-Gen Academic Gateway
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Your Gateway to Knowledge <br />& Professional Growth.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Access thousands of academic journals, books, and tracking assets seamlessly. Log in as a student or registered patron member to manage active item distributions.
          </p>

          {/* Responsive Entrance Gateways split card matrix layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link to="/login" className="bg-white hover:bg-slate-50 text-slate-900 p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center justify-center transition-all group hover:scale-[1.02]">
              <span className="text-xs font-bold text-blue-600 uppercase mb-1">Returning Users</span>
              <span className="font-extrabold text-base">Portal Log In →</span>
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/10 flex flex-col items-center justify-center transition-all group hover:scale-[1.02]">
              <span className="text-xs font-bold text-blue-200 uppercase mb-1">New Accounts</span>
              <span className="font-extrabold text-base">Register Membership →</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= ABOUT US SECTION ================= */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">Our Mission</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Empowering research, literacy, and community operations.</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              We provide comprehensive resource coordination networks designed to elevate educational experiences. Our architecture facilitates modern book acquisitions, real-time tracking, and low-latency item transaction logging.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center mb-4">📖</div>
              <h4 className="font-bold text-slate-900 mb-1">Diverse Cataloging</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Vast genre distributions ranging from precise engineering disciplines to abstract creative writing arts.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 font-bold rounded-xl flex items-center justify-center mb-4">⚡</div>
              <h4 className="font-bold text-slate-900 mb-1">Instant Pre-Requests</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Students can hold books remotely via authenticated request pipelines directly inside user context environments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC STAFF DIRECTORY SECTION ================= */}
      <section id="team" className="py-20 bg-slate-100/60 border-y border-slate-200/50 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">System Officials</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Support Directories</h2>
            <p className="text-sm text-slate-500 mt-2">Get in touch directly with system supervisors and physical asset management curators.</p>
          </div>

          {loadingStaff ? (
            <div className="text-center text-xs font-medium text-slate-400 py-10 animate-pulse">Synchronizing team directories...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold border text-slate-400 uppercase">
                        {member.FullName.substring(0, 2)}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                        member.Role === 'Admin' 
                          ? 'bg-purple-50 text-purple-700 border-purple-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {member.Role}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-0.5">{member.FullName}</h3>
                    <p className="text-xs text-slate-400 font-mono mb-4">System ID Reference: #{member.UserId}</p>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Contact:</span>
                      <a href={`mailto:${member.Email}`} className="text-blue-600 font-semibold hover:underline">{member.Email}</a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extension Phone:</span>
                      <span className="text-slate-800 font-medium font-mono">{member.Phone || '+1 (555) 019-283'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= CONTACT & LOCATION MAP SECTION ================= */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Text-based context fields column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">Connect With Us</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">We are located at the center of the campus quadrant.</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Have questions regarding late return policies, fine calculation disputes, or custom account setups? Use the listed channels below to reach our help desk.
              </p>
              
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="text-slate-900 font-bold">Main Headquarters Campus</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">Building B, West Wing Floor Corridor 2</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <div className="text-slate-900 font-bold">Central Control Help Line</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">+1 (555) 987-6543 / Ext 901</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Professional Social Media Link Block */}
            <div className="pt-8 border-t border-slate-200 mt-8">
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Follow Operational Networks</div>
              <div className="flex gap-3 text-xs font-bold text-slate-600">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 border rounded-lg bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors">LinkedIn</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 border rounded-lg bg-white hover:text-slate-900 hover:border-slate-400 shadow-sm transition-colors">GitHub System</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 border rounded-lg bg-white hover:text-sky-500 hover:border-sky-200 shadow-sm transition-colors">Twitter (X)</a>
              </div>
            </div>
          </div>

          {/* Embedded Interactive Map Placeholder Box Column */}
          <div className="lg:col-span-7">
            <div className="w-full h-80 lg:h-full min-h-[320px] rounded-2xl bg-slate-200 border border-slate-300 overflow-hidden relative shadow-inner group">
              {/* Substitute with a Google Maps standard `<iframe>` if desired */}
              <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply filter contrast-125 brightness-95" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl border shadow-lg">
                <div className="text-xs font-bold text-blue-600 uppercase">Operational Service Availability Hours</div>
                <div className="flex justify-between text-slate-800 text-xs font-bold mt-1.5">
                  <span>Mon — Fri Cycle:</span>
                  <span className="font-mono text-slate-500">08:00 AM — 08:00 PM</span>
                </div>
                <div className="flex justify-between text-slate-800 text-xs font-bold mt-0.5">
                  <span>Sat — Sun Windows:</span>
                  <span className="font-mono text-slate-500">10:00 AM — 04:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPACT FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-500 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} LibCore Framework Ecosystem. All Rights Reserved.</div>
          <div className="flex gap-6 font-medium">
            <span className="hover:text-white cursor-pointer">Security Ledger Compliance</span>
            <span className="hover:text-white cursor-pointer">Terms of System Fair Use</span>
          </div>
        </div>
      </footer>

    </div>
  );
}