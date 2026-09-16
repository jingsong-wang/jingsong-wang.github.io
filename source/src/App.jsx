import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, Github, GraduationCap, Mail, Menu, X } from 'lucide-react';
import { profile, papers, education, awards, projects } from './content';

const navigation = [
  { label: 'Research', id: 'research' },
  { label: 'Background', id: 'background' },
  { label: 'Projects', id: 'projects' },
];

function ResourceLink({ href, children, className = '' }) {
  if (!href) return null;
  return <a className={`text-link ${className}`} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">{children}</a>;
}

function SectionHeading({ number, title, id }) {
  return <div className="section-heading"><span className="section-number" aria-hidden="true">{number}</span><h2 id={id}>{title}</h2><span className="section-rule" /></div>;
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 360);
      const visible = navigation.filter(({ id }) => document.getElementById(id)?.getBoundingClientRect().top <= 180);
      const atBottom = window.scrollY > 100 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      setActiveSection(atBottom ? 'projects' : visible.at(-1)?.id || '');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('reveal-ready');
      observer.observe(element);
    });
    const closeOnEscape = event => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', closeOnEscape);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="header">
        <div className="header-inner container">
          <a className="wordmark" href="#top" onClick={() => setMenuOpen(false)}>{profile.name}<span className="wordmark-dot">.</span></a>
          <button ref={menuButton} className="menu-button icon-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
          <nav id="navigation" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">
            {navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={activeSection === item.id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            {profile.cv && <ResourceLink href={profile.cv}>CV <ArrowRight className="nav-arrow" size={15} /></ResourceLink>}
          </nav>
        </div>
      </header>

      <main id="main" className="container">
        <div id="top" className="intro">
          <div className="identity">
            <h1>{profile.name}</h1>
            <p className="chinese-name" lang="zh-CN">{profile.chineseName}</p>
            <p className="role">{profile.role}<span className="separator"> / </span>{profile.field}</p>
            <p className="affiliation">{profile.affiliation}</p>
          </div>
          <div className="introduction">
            <p className="bio">{profile.introduction}</p>
            <div className="socials" aria-label="Contact and profiles">
              <ResourceLink href={profile.email ? `mailto:${profile.email}` : null}><Mail size={22} strokeWidth={1.6} /><span>Email</span></ResourceLink>
              <ResourceLink href={profile.github}><Github size={21} strokeWidth={1.6} /><span>GitHub</span></ResourceLink>
              <ResourceLink href={profile.scholar}><GraduationCap size={24} strokeWidth={1.6} /><span>Scholar</span></ResourceLink>
            </div>
          </div>
        </div>

        <section id="research" aria-labelledby="research-heading" className="section research" data-reveal>
          <SectionHeading number="01" title="Research" id="research-heading" />
          <div className="paper-list">
            {papers.map(paper => <article className="paper" key={paper.id}>
              <p className="paper-category">{paper.category}</p>
              <div className="paper-body">
                <h3>{paper.title}</h3>
                {paper.authors.length > 0 && <p className="authors">{paper.authors.map((author, index) => <span key={author}>{index > 0 && ', '}{author === profile.name ? <strong>{author}</strong> : author}</span>)}</p>}
                <p className="venue">{paper.venue}</p>
                <p className="paper-summary">{paper.summary}</p>
              </div>
              <div className="paper-links">
                <ResourceLink href={paper.paperUrl}>Paper <ArrowRight size={18} /></ResourceLink>
                <ResourceLink href={paper.pdfUrl}>PDF <ArrowRight size={18} /></ResourceLink>
                <ResourceLink href={paper.codeUrl}>Code <ArrowRight size={18} /></ResourceLink>
              </div>
            </article>)}
          </div>
        </section>

        <section id="background" aria-labelledby="background-heading" className="section background" data-reveal>
          <SectionHeading number="02" title="Background" id="background-heading" />
          <div className="background-grid">
            <div className="education">
              <h3 className="subheading">Education</h3>
              <ol className="education-list">
                {education.map(item => <li key={item.degree}>
                  <div className="education-top"><h4>{item.degree}{item.status && <span> &middot; {item.status}</span>}</h4>{item.dates && <span className="dates">{item.dates}</span>}</div>
                  <p className="institution">{item.institution}</p>
                  <p className="school">{item.school}</p>
                  <p className="location">{item.location}</p>
                </li>)}
              </ol>
            </div>
            <div className="awards">
              <h3 className="subheading">Selected Awards</h3>
              <ul className="awards-list">
                {awards.map((award, index) => <li key={index}><h4>{award.name}</h4><p><span className="award-detail">{award.detail}</span>{award.context && <span className="award-context">{award.context}</span>}</p></li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-heading" className="section projects" data-reveal>
          <SectionHeading number="03" title="Open Source" id="projects-heading" />
          {projects.map((project, index) => <article className="project" key={project.name}>
            <span className="project-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div className="project-body"><h3>{project.name}<span className="project-subtitle">{project.subtitle}</span></h3><p>{project.description}</p><p className="project-note">{project.note}</p></div>
            <div className="project-links">
              <ResourceLink href={project.websiteUrl}>Visit website <ArrowRight size={18} /></ResourceLink>
              <ResourceLink href={project.codeUrl}>GitHub <ArrowRight size={18} /></ResourceLink>
            </div>
          </article>)}
        </section>
      </main>

      <footer className="footer container"><p>{profile.name} <span aria-hidden="true">/</span> MLLM Safety</p><a href="#top">Back to top <ArrowUp size={14} /></a></footer>
      <a className={`back-top icon-button ${scrolled ? 'shown' : ''}`} href="#top" aria-label="Back to top" tabIndex={scrolled ? 0 : -1}><ArrowUp size={21} /></a>

    </>
  );
}
