import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, HeartPulse, MapPin, Menu, Phone, Search, ShieldCheck, Stethoscope, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const facadeImage = '/assets/hospital-facade.png';
const interiorImage = '/assets/hospital-interior.png';
const logoImage = '/assets/jain-neuromax-logo.png';
const hospitalPhoneHref = 'tel:+916307099300';
const hospitalPhoneLabel = '+91 63070 99300';

const queryClient = new QueryClient();

type Doctor = {
  slug: string;
  name: string;
  specialty: string;
  qualifications: string[];
  designation?: string;
  image?: string;
  panelImage?: string;
  bio?: string;
  experience?: string;
  training?: string;
};

const doctors: Doctor[] = [
  { slug: 'navneet-kala', name: 'Dr. Navneet Kala', specialty: 'Neurosurgery', designation: 'Consultant Neurosurgeon', qualifications: ['MBBS', 'MS General Surgery', 'MCh Neurosurgery'], image: '/assets/dr-navneet-kala.png', panelImage: '/assets/dr-navneet-kala-panel.jpg', bio: 'Dr. Navneet Kala is a Consultant Neurosurgeon in Gorakhpur with MBBS, MS (General Surgery) and MCh (Neurosurgery) qualifications.', experience: '23+ years of experience in neurosurgery.', training: 'Trained at SMS Medical College, Jaipur and KGMU, Lucknow.' },
  { slug: 'madhuri-jain', name: 'Dr. Madhuri Jain', specialty: 'Dentistry', qualifications: ['BDS', 'Qualification requires hospital confirmation'] },
  { slug: 'subhankit-aarya', name: 'Dr. Subhankit Aarya', specialty: 'General Medicine', qualifications: ['MD Medicine'] },
  { slug: 'naveen-singh', name: 'Dr. Naveen Singh', specialty: 'Pediatrics', qualifications: ['MD Pediatrics'] },
  { slug: 'shoolpani-mishra', name: 'Dr. Shoolpani Mishra', specialty: 'Gastroenterology', qualifications: ['MBBS', 'MD Medicine', 'DM Gastroenterology'] },
  { slug: 'kunal-singh', name: 'Dr. Kunal Singh', specialty: 'Cardiology', qualifications: ['DM Cardiology'] },
  { slug: 'rishab-tripathi', name: 'Dr. Rishab Tripathi', specialty: 'Orthopaedics', designation: 'Orthopedic Surgeon', qualifications: ['MBBS', 'DNB'], image: '/assets/dr-rishab-tripathi.png', panelImage: '/assets/dr-rishab-tripathi-panel.jpg', bio: 'Dr. Rishab Tripathi is an Orthopedic Surgeon with MBBS and DNB qualifications.' },
  { slug: 'essar-khan', name: 'Dr. Essar Khan', specialty: 'Nephrology', designation: 'Nephrologist', qualifications: ['MBBS', 'MD', 'DM Nephrology'], image: '/assets/dr-essar-khan.png', panelImage: '/assets/dr-essar-khan-panel.jpg', bio: 'Dr. Essar Khan is a Nephrologist with MBBS, MD and DM (Nephrology) qualifications.', experience: 'Also identified as a Senior Consultant in Nephrology in Gorakhpur medical listings.' },
  { slug: 'thakur-prashant-singh', name: 'Dr. Thakur Prashant Singh', specialty: 'Gastroenterology', designation: 'Gastroenterologist', qualifications: ['MBBS', 'MD Medicine', 'DM Gastroenterology'], image: '/assets/dr-thakur-prashant-singh.png', panelImage: '/assets/dr-thakur-prashant-singh-panel.jpg', bio: 'Dr. Thakur Prashant Singh is a gastroenterologist with MBBS, MD (Medicine) and DM (Gastroenterology) qualifications.' },
  { slug: 'ravi-prakash-mishra', name: 'Dr. Ravi Prakash Mishra', specialty: 'Urology', qualifications: ['MBBS', 'DNB General Surgery', 'MNAMS', 'MCh Urology'] },
  { slug: 'durgesh-tripathi', name: 'Dr. Durgesh Tripathi', specialty: 'General & Laparoscopic Surgery', qualifications: ['MBBS', 'MS General Surgery'] },
  { slug: 'avishesh-singh', name: 'Dr. Avishesh Singh', specialty: 'Cardiology', qualifications: ['MBBS', 'MD Medicine', 'DM Cardiology'] },
  { slug: 'shivam-pandey', name: 'Dr. Shivam Pandey', specialty: 'Pulmonology', qualifications: ['MD Chest'] },
  { slug: 'anamika-modi', name: 'Dr. Anamika Modi', specialty: 'Obstetrics & Gynaecology', qualifications: ['MBBS', 'DGO'] },
  { slug: 'nitya-nand', name: 'Dr. Nitya Nand', specialty: 'Plastic & Reconstructive Surgery', qualifications: ['MBBS', 'MS General Surgery', 'MCh Plastic Surgery'] },
  { slug: 'ankit-modi', name: 'Dr. Ankit Modi', specialty: 'Urology', qualifications: ['MBBS', 'MS General Surgery', 'MCh Urology', 'FMAS'] },
  { slug: 'vijay-kumar', name: 'Dr. Vijay Kumar', specialty: 'Resident Medical Officer', designation: 'Resident Medical Officer (RMO)', qualifications: ['MBBS'], image: '/assets/dr-vijay-kumar.png', panelImage: '/assets/dr-vijay-kumar-panel.jpg', bio: 'Dr. Vijay Kumar is a Resident Medical Officer (RMO) at Jain Neuro Super Speciality Clinic, Gorakhpur, responsible for coordinating day-to-day patient care, monitoring admitted patients, assisting consultants, and supporting the clinical team in the hospital.' },
];

const specialties = ['All specialties', ...Array.from(new Set(doctors.map((doctor) => doctor.specialty)))];
const specialtyPanels = [
  { image: '/assets/specialties-internal-neuro.webp', alt: 'Internal medicine, neurosurgery and neurology.' },
  { image: '/assets/specialties-psychiatry-pulmonology.webp', alt: 'Psychiatry and pulmonology.' },
  { image: '/assets/specialties-surgical-urology-blood-bank.webp', alt: 'Surgical services, urology and blood bank.' },
  { image: '/assets/specialties-nephrology-ophthalmology-orthopedics-pediatrics.webp', alt: 'Nephrology, ophthalmology, orthopedics and pediatrics.' },
];
const featuredDoctors = doctors.filter((doctor) => doctor.panelImage);
const initials = (name: string) => name.replace('Dr. ', '').split(' ').map((part) => part[0]).slice(0, 2).join('');

function Header() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { label: 'Our hospital', href: '/' },
    { label: 'Find a doctor', href: '/doctors' },
    { label: 'Appointments', href: '/appointment' },
  ];
  return (
    <>
      <div className="top-strip">
        <div className="site-container flex min-h-[29px] items-center justify-between">
          <span>Jain Neuromax Hospital</span>
          <span className="hidden sm:inline">Care that begins with listening</span>
        </div>
      </div>
      <header className="nav-shell">
        <div className="site-container flex min-h-[74px] items-center justify-between gap-5">
          <Link href="/" className="brand-mark" data-testid="link-home-brand" onClick={() => setMenuOpen(false)}>
            <img className="brand-logo" src={logoImage} alt="Jain Neuromax Hospital logo" />
          </Link>
          <nav className="nav-links hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                className={`text-[12px] font-semibold tracking-[.04em] no-underline transition-colors hover:text-[hsl(var(--accent))] ${location === item.href ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/appointment" className="btn btn-primary hidden min-h-[40px] text-[11px] sm:inline-flex" data-testid="link-header-book">
              <CalendarDays size={15} /> Book appointment
            </Link>
            <button type="button" className="hidden min-h-[40px] items-center gap-2 border-0 bg-transparent p-2 text-[hsl(var(--foreground))] nav-mobile-cta" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle menu" data-testid="button-mobile-menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="site-container border-t border-[hsl(var(--border))] py-3 md:hidden" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`} className="block border-b border-[hsl(var(--border))] py-4 text-sm font-semibold text-[hsl(var(--foreground))] no-underline last:border-0">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="site-container footer-grid">
        <div>
          <Link href="/" className="brand-mark" data-testid="link-footer-brand">
            <img className="brand-logo brand-logo-footer" src={logoImage} alt="Jain Neuromax Hospital logo" />
          </Link>
          <p className="mt-6 max-w-[280px]">A calm, considered place for specialist care. Start with the information you need, then take the next step when you are ready.</p>
        </div>
        <div>
          <h3>Patient access</h3>
          <Link href="/doctors" data-testid="link-footer-doctors">Find a doctor</Link>
          <Link href="/appointment" data-testid="link-footer-appointment">Book an appointment</Link>
          <a href={hospitalPhoneHref} data-testid="link-footer-call">Call hospital · {hospitalPhoneLabel}</a>
        </div>
        <div>
          <h3>At the hospital</h3>
          <p className="m-0">Visit the Jain Neuromax Hospital building for your appointment. Location details can be confirmed by the hospital team.</p>
          <span className="mt-4 block text-[11px] uppercase tracking-[.12em] text-[hsl(var(--secondary))]">Find location below</span>
        </div>
      </div>
      <div className="site-container mt-12 border-t border-[rgba(250,248,243,.16)] pt-5 text-[11px] text-[rgba(250,248,243,.45)]">
        © Jain Neuromax Hospital · Information shown is for patient navigation and is subject to hospital confirmation.
      </div>
    </footer>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="site-shell">
      <Header />
      <main>{children}</main>
      <Footer />
      <a href={hospitalPhoneHref} className="emergency-bar" aria-label={`Call Jain Neuromax Hospital at ${hospitalPhoneLabel}`} data-testid="link-emergency-contact">
        <HeartPulse size={17} /> Emergency contact · {hospitalPhoneLabel}
      </a>
      <span className="sr-only" data-testid="text-current-route">{location}</span>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <img className="hero-photo" src={facadeImage} alt="Jain Neuromax Hospital facade with its signage visible" />
        <div className="site-container hero-content">
          <div className="reveal">
            <span className="eyebrow">Specialist care, thoughtfully delivered</span>
            <h1 className="font-display text-balance">The right care starts with being heard.</h1>
            <p className="hero-copy">Jain Neuromax Hospital brings specialist consultations into a considered, welcoming setting — with clear information for the next step.</p>
            <div className="hero-actions">
              <Link href="/appointment" className="btn btn-primary" data-testid="link-hero-appointment">Book an appointment <ArrowRight size={16} /></Link>
              <Link href="/doctors" className="btn btn-outline-light" data-testid="link-hero-doctors">Find a doctor</Link>
              <a href="#location" className="btn btn-outline-light" data-testid="link-hero-location">Find location <MapPin size={15} /></a>
            </div>
          </div>
        </div>
        <div className="hero-note reveal reveal-delay-2">A specialist hospital for thoughtful decisions, careful conversations and the care that follows.</div>
      </section>

      <section className="section">
        <div className="site-container intro-grid">
          <div className="interior-frame reveal">
            <img src={interiorImage} alt="Warm wood and white-panelled waiting area inside Jain Neuromax Hospital" />
          </div>
          <div className="intro-copy reveal reveal-delay-1">
            <span className="eyebrow text-[hsl(var(--accent))]">A more considered first step</span>
            <h2 className="mt-4 font-display text-[clamp(32px,4vw,50px)] leading-[1.1] tracking-[-.04em]">Clarity before complexity.</h2>
            <p>Healthcare can ask a lot of you. Our digital front door is designed to make the first decisions simple: learn about our verified specialists, choose your route, and request a time that works for you.</p>
            <div className="detail-list">
              <div><ShieldCheck size={18} /><span><strong>Verified information</strong>Doctor qualifications are shown as supplied by the hospital.</span></div>
              <div><Stethoscope size={18} /><span><strong>Specialist-led care</strong>Explore the disciplines represented at Jain Neuromax Hospital.</span></div>
              <div><HeartPulse size={18} /><span><strong>A warmer welcome</strong>A calm, human experience from the first interaction.</span></div>
            </div>
            <Link href="/doctors" className="btn btn-outline" data-testid="link-intro-doctors">Meet the specialists <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section id="specialties" className="section section-quiet">
        <div className="site-container">
          <div className="section-heading route-heading">
            <div><span className="eyebrow text-[hsl(var(--accent))]">Specialty services</span><h2 className="font-display">Specialty care, clearly organized.</h2></div>
            <p>Browse the clinical specialties shown below, review verified doctor profiles, and submit an appointment request to the hospital team.</p>
          </div>
          <div className="specialty-showcase" aria-label="Clinical specialty image panels">
            {specialtyPanels.map((panel) => (
              <figure className="specialty-showcase-card" key={panel.image}>
                <img src={panel.image} alt={panel.alt} />
              </figure>
            ))}
          </div>
          <div className="specialty-grid">
            {specialties.slice(1, 9).map((specialty, index) => (
              <Link href={`/doctors?specialty=${encodeURIComponent(specialty)}`} key={specialty} className="specialty-card" data-testid={`link-specialty-${index}`}>
                <span className="specialty-number">0{index + 1}</span>
                <h3>{specialty}</h3>
                <p>View specialist profiles <ChevronRight size={13} className="inline" /></p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-right"><Link href="/doctors" className="btn btn-outline" data-testid="link-all-specialties">View all specialists <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="site-container doctors-strip">
          <div>
            <span className="eyebrow">Our leading panel of professionals</span>
            <h2 className="mt-4 font-display text-[clamp(32px,4vw,49px)] leading-[1.1] tracking-[-.04em]">A little more certainty for the next conversation.</h2>
            <p className="mt-5 max-w-[390px] text-[14px] leading-[1.75] text-[rgba(250,248,243,.62)]">See each verified profile, the qualifications we have on record, and what to bring to your appointment.</p>
            <Link href="/doctors" className="btn btn-primary mt-7" data-testid="link-dark-doctors">Explore the directory <ArrowRight size={15} /></Link>
          </div>
          <div className="doctor-feature-list">
            {featuredDoctors.map((doctor) => (
              <Link href={`/doctors/${doctor.slug}`} className="doctor-card doctor-card-portrait" key={doctor.slug} data-testid={`card-featured-doctor-${doctor.slug}`}>
                <img className="doctor-card-image" src={doctor.panelImage} alt="" />
                <div className="doctor-card-caption">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.designation || doctor.specialty}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="photo-band" style={{ backgroundImage: `linear-gradient(90deg, rgba(31,39,38,.78), rgba(31,39,38,.25)), url(${interiorImage})`, backgroundPosition: 'center' }}>
        <div className="site-container photo-band-inner">
          <span className="eyebrow">Your next step, made clear</span>
          <h2 className="font-display">Come in with questions. Leave with a plan.</h2>
          <Link href="/appointment" className="btn btn-light" data-testid="link-band-appointment">Request an appointment <CalendarDays size={15} /></Link>
        </div>
      </section>

      <section className="section" id="location">
        <div className="site-container location-grid">
          <img className="facade-crop" src={facadeImage} alt="Exterior of Jain Neuromax Hospital showing the entrance and signage" />
          <div className="location-box">
            <span className="eyebrow text-[hsl(var(--accent))]">Find the hospital</span>
            <h3>Jain Neuromax Hospital</h3>
            <p>The facade and entrance pictured here are the hospital’s actual building. For an exact address, directions, parking or access questions, please confirm details with the hospital team before travelling.</p>
            <div className="location-status">Location details available on confirmation</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={hospitalPhoneHref} className="btn btn-outline" data-testid="link-location-contact"><Phone size={15} /> Call hospital</a>
              <Link href="/appointment" className="btn btn-primary" data-testid="link-location-appointment">Book a visit <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function DoctorsPage() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All specialties');
  const filteredDoctors = useMemo(() => doctors.filter((doctor) => {
    const matchesQuery = `${doctor.name} ${doctor.specialty} ${doctor.qualifications.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (specialty === 'All specialties' || doctor.specialty === specialty);
  }), [query, specialty]);
  return (
    <>
      <section className="page-hero">
        <div className="site-container">
          <span className="eyebrow">The specialist directory</span>
          <h1 className="font-display">Find a doctor who fits your next step.</h1>
          <p>Explore the verified doctor information currently available for Jain Neuromax Hospital. If a detail is not yet confirmed, it is marked clearly.</p>
        </div>
      </section>
      <section className="section">
        <div className="site-container">
          <div className="directory-toolbar">
            <div className="search-field">
              <Search size={18} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, specialty or qualification" aria-label="Search doctors" data-testid="input-doctor-search" />
            </div>
            <select className="select-field" value={specialty} onChange={(event) => setSpecialty(event.target.value)} aria-label="Filter by specialty" data-testid="select-doctor-specialty">
              {specialties.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="filter-pills" aria-label="Specialty filters">
            {specialties.slice(0, 7).map((item) => <button type="button" className={`pill ${specialty === item ? 'active' : ''}`} onClick={() => setSpecialty(item)} key={item} data-testid={`button-filter-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}
          </div>
          <p className="mb-5 text-[12px] text-[hsl(var(--muted-foreground))]" data-testid="text-doctor-count">{filteredDoctors.length} specialist profiles</p>
          <div className="directory-grid">
            {filteredDoctors.length > 0 ? filteredDoctors.map((doctor) => (
              <Link href={`/doctors/${doctor.slug}`} className="directory-card" key={doctor.slug} data-testid={`card-doctor-${doctor.slug}`}>
                <div className={`avatar ${doctor.image ? 'avatar-photo' : ''}`}>
                  {doctor.image ? <img src={doctor.image} alt="" /> : initials(doctor.name)}
                </div>
                <h2>{doctor.name}</h2>
                <div className="specialty">{doctor.designation || doctor.specialty}</div>
                <div className="qualifications">{doctor.qualifications.join(' · ')}</div>
                <span className="card-link">View profile <ArrowRight size={14} /></span>
              </Link>
            )) : (
              <div className="empty-state">
                <Search className="mx-auto mb-4 text-[hsl(var(--accent))]" size={27} />
                <h2>No matching specialist</h2>
                <p>Try a different name, qualification or specialty.</p>
                <button type="button" className="btn btn-outline mt-5" onClick={() => { setQuery(''); setSpecialty('All specialties'); }} data-testid="button-clear-doctor-search">Clear search</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function DoctorDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const doctor = doctors.find((item) => item.slug === slug);
  if (!doctor) return <NotFound />;
  return (
    <>
      <section className="detail-hero">
        <div className="site-container">
          <Link href="/doctors" className="mb-9 inline-flex items-center gap-2 text-[12px] font-semibold text-[hsl(var(--muted-foreground))] no-underline hover:text-[hsl(var(--accent))]" data-testid="link-back-doctors"><ArrowRight size={15} className="rotate-180" /> Back to directory</Link>
          <div className="doctor-profile reveal">
            <div className={`profile-avatar ${doctor.image ? 'profile-photo' : ''}`} aria-hidden={doctor.image ? undefined : true}>
              {doctor.image ? <img src={doctor.image} alt={`${doctor.name} portrait`} /> : initials(doctor.name)}
            </div>
            <div>
              <span className="eyebrow text-[hsl(var(--accent))]">{doctor.specialty}</span>
              <h1 className="font-display">{doctor.name}</h1>
              <p className="m-0">{doctor.designation || 'Consultant'} · Jain Neuromax Hospital</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="site-container profile-content">
          <div>
            <span className="eyebrow text-[hsl(var(--accent))]">About this profile</span>
            <h2 className="mt-4">Information you can take into your appointment.</h2>
            <p>{doctor.bio || `This profile presents the qualification information currently verified for ${doctor.name} by the hospital brief.`} For appointment availability, consultation fees, and any detail not shown here, please contact the hospital team or include your question in an appointment request.</p>
            {doctor.experience && <p className="profile-note">{doctor.experience}</p>}
            {doctor.training && <p className="profile-note">{doctor.training}</p>}
            <Link href={`/appointment?doctor=${doctor.slug}`} className="btn btn-primary mt-5" data-testid="link-doctor-book">Request an appointment <CalendarDays size={15} /></Link>
          </div>
          <div>
            <h2>Qualifications</h2>
            <ul className="qual-list">
              {doctor.qualifications.map((qualification) => <li key={qualification}>{qualification}</li>)}
            </ul>
            <p className="mt-5 text-[11px]">Profile information is subject to hospital confirmation.</p>
          </div>
        </div>
      </section>
      <section className="section section-quiet">
        <div className="site-container action-band">
          <div><span className="eyebrow">Ready when you are</span><p>Share a preferred time and the hospital team can follow up with the next details.</p></div>
          <Link href={`/appointment?doctor=${doctor.slug}`} className="btn btn-light" data-testid="link-profile-appointment">Book with {doctor.name.replace('Dr. ', '')} <ArrowRight size={15} /></Link>
        </div>
      </section>
    </>
  );
}

type FormState = { name: string; email: string; phone: string; specialty: string; date: string; notes: string };

function AppointmentPage() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const preselectedDoctor = doctors.find((doctor) => doctor.slug === params.get('doctor'));
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', specialty: preselectedDoctor?.specialty || '', date: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const updateField = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    window.setTimeout(() => setStatus(form.email.toLowerCase().includes('error') ? 'error' : 'success'), 1100);
  };
  return (
    <>
      <section className="page-hero">
        <div className="site-container">
          <span className="eyebrow">Appointment request</span>
          <h1 className="font-display">Tell us how we can help you begin.</h1>
          <p>This is a request, not a confirmed appointment. The hospital team will need to confirm availability and any details with you.</p>
        </div>
      </section>
      <section className="section">
        <div className="site-container appointment-layout">
          <aside className="appointment-aside">
            <span className="eyebrow text-[hsl(var(--accent))]">A clear first step</span>
            <h2 className="font-display">Make room for the right conversation.</h2>
            <p>Share the basics below. You can tell us what you are looking for, request a preferred date, and leave a note for the team.</p>
            <div className="detail-list mt-8">
              <div><CalendarDays size={18} /><span><strong>Preferred date</strong>Let the team know when you would ideally like to visit.</span></div>
              <div><Clock3 size={18} /><span><strong>Follow-up from the team</strong>Your request will be reviewed before anything is confirmed.</span></div>
              <div><ShieldCheck size={18} /><span><strong>Your information</strong>Only share what is useful for this first request.</span></div>
            </div>
          </aside>
          <form className="appointment-form" onSubmit={submit} noValidate>
            {status === 'success' && <div className="form-status success" role="status" data-testid="status-appointment-success"><Check size={17} className="mr-2 inline" /> Your request has been recorded for this demo. A real hospital connection can be added here.</div>}
            {status === 'error' && <div className="form-status error" role="alert" data-testid="status-appointment-error">We could not complete this demo request. Please check your details and try again.</div>}
            <div className="form-grid">
              <div className="field"><label htmlFor="patient-name">Your name</label><input id="patient-name" required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Full name" data-testid="input-patient-name" /></div>
              <div className="field"><label htmlFor="patient-email">Email address</label><input id="patient-email" type="email" required value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" data-testid="input-patient-email" /></div>
              <div className="field"><label htmlFor="patient-phone">Phone number</label><input id="patient-phone" type="tel" required value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Your contact number" data-testid="input-patient-phone" /></div>
              <div className="field"><label htmlFor="patient-specialty">Specialty</label><select id="patient-specialty" required value={form.specialty} onChange={(event) => updateField('specialty', event.target.value)} data-testid="select-patient-specialty"><option value="">Choose a specialty</option>{specialties.slice(1).map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="field"><label htmlFor="patient-date">Preferred date</label><input id="patient-date" type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} data-testid="input-preferred-date" /></div>
              <div className="field full"><label htmlFor="patient-message">Message for the hospital team <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></label><textarea id="patient-message" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="A short note about what you need help with" data-testid="textarea-appointment-message" /></div>
            </div>
            <div className="form-submit">
              <small className="text-[hsl(var(--muted-foreground))]">No appointment is confirmed until the hospital team contacts you.</small>
              <button type="submit" className="btn btn-primary" disabled={status === 'loading'} data-testid="button-submit-appointment">{status === 'loading' ? 'Sending request…' : 'Send appointment request'} <ArrowRight size={15} /></button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Router() {
  return (
    <AppShell>
      <ErrorBoundary resetKey={useLocation()[0]}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/doctors" component={DoctorsPage} />
          <Route path="/doctors/:slug" component={DoctorDetailPage} />
          <Route path="/appointment" component={AppointmentPage} />
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;