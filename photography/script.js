const { useEffect, useState } = React;

const icon = (name, size = 18, extra = '') => <i data-lucide={name} width={size} height={size} className={extra} aria-hidden="true" />;
const links = ['Movies', 'TV Series', "Editor's Pick", 'Interviews', 'User Reviews'];

function GlassButton({ children, className = '', ...props }) {
  return <button className={`liquid-glass inline-flex items-center justify-center gap-2 rounded-full text-sm text-white transition duration-300 hover:bg-white/10 ${className}`} {...props}>{children}</button>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { lucide.createIcons(); }, [menuOpen]);
  return <div className="relative isolate flex min-h-screen overflow-hidden bg-black">
    <video className="video-bg" autoPlay muted loop playsInline aria-hidden="true">
      <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4" type="video/mp4" />
    </video>
    <div className="blur-overlay" />
    <div className="relative z-10 flex min-h-screen w-full flex-col">
      <nav className="relative z-50 flex items-center justify-between px-4 py-4 sm:px-6 md:px-12 md:py-6">
        <a href="#" className="animate-blur-fade-up text-xl font-semibold tracking-[-.08em] md:text-2xl" style={{animationDelay:'0ms'}}>PHOTOGRAPHY</a>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link,index) => <a key={link} href="#" className="animate-blur-fade-up text-sm text-white/90 transition-colors hover:text-gray-300" style={{animationDelay:`${100 + index * 50}ms`}}>{link}</a>)}
        </div>
        <div className="flex items-center gap-3">
          <GlassButton className="animate-blur-fade-up hidden px-4 py-2 sm:inline-flex md:px-6" style={{animationDelay:'350ms'}}>Search {icon('search')}</GlassButton>
          <GlassButton aria-label="Profile" className="animate-blur-fade-up hidden h-10 w-10 sm:inline-flex" style={{animationDelay:'400ms'}}>{icon('user')}</GlassButton>
          <GlassButton aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="animate-blur-fade-up h-10 w-10 lg:hidden" style={{animationDelay:'350ms'}}>
            <span className={`absolute transition-all duration-500 ease-out ${menuOpen ? 'rotate-180 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>{icon('menu')}</span>
            <span className={`absolute transition-all duration-500 ease-out ${menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-50 opacity-0'}`}>{icon('x')}</span>
          </GlassButton>
        </div>
      </nav>

      <div className={`mobile-open absolute top-[72px] z-40 w-full border-y border-gray-800 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-out lg:hidden ${menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'}`}>
        {links.map((link,index) => <a key={link} href="#" className="mobile-link block rounded-lg px-3 py-3 text-sm text-white transition-colors hover:bg-gray-800/50" style={{transitionDelay: menuOpen ? `${index * 50}ms` : '0ms'}}>{link}</a>)}
        <div className="mt-2 flex gap-3 border-t border-gray-800 pt-3 sm:hidden">
          <GlassButton className="flex-1 px-4 py-2.5">Search {icon('search')}</GlassButton>
          <GlassButton aria-label="Profile" className="h-10 w-10">{icon('user')}</GlassButton>
        </div>
      </div>

      <main className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8 sm:px-6 md:px-12 md:pb-16">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="animate-blur-fade-up mb-6 flex flex-wrap items-center gap-3 text-xs sm:mb-8 sm:gap-6 sm:text-sm" style={{animationDelay:'300ms'}}>
              <span className="flex items-center gap-2">{icon('star',16,'fill-white sm:h-5 sm:w-5')} <b className="font-medium">8.7/10 IMDB</b></span>
              <span className="flex items-center gap-2">{icon('clock',16)} 132 min</span>
              <span className="flex items-center gap-2">{icon('calendar-days',16)} April, 2025</span>
            </div>
            <h1 className="animate-blur-fade-up mb-4 max-w-5xl text-3xl font-normal leading-[.96] tracking-[-.04em] sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl" style={{animationDelay:'400ms'}}>Step Through. Work Smarter.</h1>
            <p className="animate-blur-fade-up mb-6 max-w-2xl text-base text-gray-400 sm:text-lg md:mb-12 md:text-xl" style={{animationDelay:'500ms'}}>A voyage through forgotten realms, where past and future intertwine.</p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button className="animate-blur-fade-up inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 sm:px-8 sm:py-3" style={{animationDelay:'600ms'}}>Watch Now {icon('play',18,'fill-black')}</button>
              <GlassButton className="animate-blur-fade-up px-6 py-2.5 font-medium sm:px-8 sm:py-3" style={{animationDelay:'700ms'}}>Learn More</GlassButton>
            </div>
          </div>
          <div className="flex gap-3 md:w-auto">
            <GlassButton className="animate-blur-fade-up px-4 py-2.5 sm:px-6 sm:py-3" style={{animationDelay:'800ms'}}>{icon('chevron-left')} Previous</GlassButton>
            <GlassButton className="animate-blur-fade-up px-4 py-2.5 sm:px-6 sm:py-3" style={{animationDelay:'900ms'}}>Next {icon('chevron-right')}</GlassButton>
          </div>
        </div>
      </main>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
