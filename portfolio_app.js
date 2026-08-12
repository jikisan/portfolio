class PortfolioApp {
  constructor() {
    this.config = null;
    this.projects = null;
    this.experienceData = null;
  }

  async init() {
    try {
      console.log('PortfolioApp.init() started');
      
      // Load all configuration files
      console.log('Loading configurations...');
      await this.loadConfigurations();
      console.log('Configurations loaded successfully');
      
      // Render all sections
      console.log('Rendering header...');
      this.renderHeader();
      
      console.log('Rendering about...');
      this.renderAbout();
      
      console.log('Rendering skills...');
      this.renderSkills();

      console.log('Rendering tools...');
      this.renderTools();

      console.log('Rendering projects...');
      this.renderProjects();
      
      console.log('Rendering experiences...');
      this.renderExperiences();
      
      console.log('Rendering certificates...');
      this.renderCertificates();
      
      console.log('Rendering contact...');
      this.renderContact();
      
      console.log('Portfolio loaded successfully!');
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  }

  async loadConfigurations() {
    try {
      const [configResponse, projectsResponse, experienceResponse] = await Promise.all([
        fetch('./data/portfolio_config.json'),
        fetch('./data/projects_data.json'),
        fetch('./data/experience_data.json')
      ]);

      if (!configResponse.ok || !projectsResponse.ok || !experienceResponse.ok) {
        throw new Error('Failed to fetch one or more configuration files');
      }

      this.config = await configResponse.json();
      this.projects = await projectsResponse.json();
      this.experienceData = await experienceResponse.json();
      
      console.log('Data loaded successfully:', {
        config: this.config,
        projects: this.projects,
        experience: this.experienceData
      });
    } catch (error) {
      console.error('Error loading configurations:', error);
      throw error;
    }
  }

  renderHeader() {
    try {
      const { personal, navigation } = this.config;
      
      // Update header information
      const avatarImg = document.querySelector('.image.avatar img');
      const nameElement = document.querySelector('h1 strong');
      const titleElement = document.querySelector('h3');
      
      if (avatarImg) avatarImg.src = personal.avatar;
      if (avatarImg) avatarImg.alt = personal.name;
      if (nameElement) nameElement.textContent = personal.name;
      if (titleElement) titleElement.textContent = personal.title;
      
      // Update social links
      const socialLinks = document.querySelectorAll('.icons li a');
      if (socialLinks[0]) socialLinks[0].href = personal.social.github;
      if (socialLinks[1]) socialLinks[1].href = personal.social.linkedin;
      if (socialLinks[2]) socialLinks[2].href = `mailto:${personal.email}`;
      
      // Update navigation
      const menuLinks = document.getElementById('menu-links');
      if (menuLinks) {
        menuLinks.innerHTML = navigation.map(nav => 
          `<a href="${nav.href}">${nav.text}</a>`
        ).join('');
      }
    } catch (error) {
      console.error('Error rendering header:', error);
    }
  }

  renderAbout() {
    try {
      const aboutHeader = document.querySelector('#about');
      if (!aboutHeader) {
        console.warn('About header not found');
        return;
      }

      const aboutSection = aboutHeader.closest('section');
      if (!aboutSection) {
        console.warn('About section not found');
        return;
      }

      const aboutParagraph = aboutSection.querySelector('p');
      const downloadButton = aboutSection.querySelector('#download-resume-btn');

      if (aboutParagraph) aboutParagraph.textContent = this.config.about.description;

      // Set up download button to generate PDF dynamically
      if (downloadButton) {
        downloadButton.addEventListener('click', async (e) => {
          e.preventDefault();
          console.log('Download resume button clicked');

          // Show loading state
          const originalText = downloadButton.innerHTML;
          downloadButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>Generating...';
          downloadButton.style.pointerEvents = 'none';

          try {
            // Generate PDF
            await window.resumeGenerator.generatePDF();
          } catch (error) {
            console.error('Error generating resume:', error);
            alert('Failed to generate resume. Please try again.');
          } finally {
            // Restore button state
            downloadButton.innerHTML = originalText;
            downloadButton.style.pointerEvents = 'auto';
          }
        });
      }
    } catch (error) {
      console.error('Error rendering about section:', error);
    }
  }

  renderSkills() {
    try {
      const skillsHeader = document.querySelector('#skills');
      if (!skillsHeader) {
        console.warn('Skills header not found');
        return;
      }
      
      const skillsSection = skillsHeader.closest('section');
      if (!skillsSection) {
        console.warn('Skills section not found');
        return;
      }
      
      const chipGroup = skillsSection.querySelector('#chipGroup');
      if (!chipGroup) {
        console.warn('Skills chip group not found');
        return;
      }
      
      chipGroup.innerHTML = this.config.skills.map(skill =>
        `<span class="chip ${skill.class}"><i class="${skill.icon}"></i>${skill.name}</span>`
      ).join('');
    } catch (error) {
      console.error('Error rendering skills:', error);
    }
  }

  renderTools() {
    try {
      const toolsChipGroup = document.querySelector('#toolsChipGroup');
      if (!toolsChipGroup) {
        console.warn('Tools chip group not found');
        return;
      }

      if (!this.config.tools) {
        console.warn('No tools in config');
        return;
      }

      toolsChipGroup.innerHTML = this.config.tools.map(tool =>
        `<span class="chip ${tool.class}"><i class="${tool.icon}"></i>${tool.name}</span>`
      ).join('');
    } catch (error) {
      console.error('Error rendering tools:', error);
    }
  }

  renderProjectTypeIcons(type) {
    const iconMap = {
      Web: { icon: 'fa-solid fa-globe', color: '#49bf9d' },
      Android: { icon: 'fa-brands fa-android', color: '#3ddc84' },
      iOS: { icon: 'fa-brands fa-apple', color: '#a6a6a6' },
      Windows: { icon: 'fa-brands fa-windows', color: '#00a4ef' }
    };
    return (type || [])
      .map(t => iconMap[t] ? `<i class="${iconMap[t].icon} project-type-icon" style="color: ${iconMap[t].color}" title="${t}"></i>` : '')
      .join('');
  }

  renderProjectTechnologies(technologies) {
    if (!technologies) return '';

    if (Array.isArray(technologies)) {
      return `<ul>${technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`;
    }

    const groups = [
      ['frontend', 'Frontend'],
      ['backend', 'Backend'],
      ['other', 'Other']
    ];

    return groups
      .filter(([key]) => Array.isArray(technologies[key]) && technologies[key].length > 0)
      .map(([key, label]) => `
        <p class="tech-group-label">${label}</p>
        <ul>
          ${technologies[key].map(tech => `<li>${tech}</li>`).join('')}
        </ul>
      `)
      .join('');
  }

  renderProjectLinks(link) {
    if (!link) return '';

    const storeBtn = (href, variant, icon, smallText, bigText) => `
      <a href="${href}" class="store-btn ${variant}" target="_blank" rel="noopener noreferrer">
        <i class="${icon}"></i>
        <span class="store-meta">
<!--          <span class="small">${smallText}</span>-->
          <span class="big">${bigText}</span>
        </span>
      </a>
    `;

    if (typeof link === 'string') {
      return link
        ? `<div class="project-links"><a href="${link}" class="button small project-view-btn" target="_blank" rel="noopener noreferrer">View</a></div>`
        : '';
    }

    const parts = [];
    if (link.android) parts.push(storeBtn(link.android, 'android', 'fab fa-google-play', 'GET IT ON', 'Google Play'));
    if (link.ios) parts.push(storeBtn(link.ios, 'ios', 'fab fa-app-store-ios', 'Download on the', 'App Store'));
    if (link.web) parts.push(storeBtn(link.web, 'web', 'fas fa-globe', 'Visit', 'Website'));
    if (!parts.length) return '';
    return `<div class="project-links">${parts.join('')}</div>`;
  }

  renderProjects() {
    try {
      console.log('renderProjects called');
      console.log('this.projects:', this.projects);
      
      // Find the projects section by looking for the h2 with id="projects"
      const projectsHeader = document.querySelector('#projects');
      if (!projectsHeader) {
        console.warn('Projects header not found');
        return;
      }
      
      // Find the section containing the projects header
      const projectsSection = projectsHeader.closest('section');
      console.log('projectsSection:', projectsSection);
      
      if (!projectsSection) {
        console.warn('Projects section not found');
        return;
      }
      
      // Find the row div within the projects section
      const projectsRow = projectsSection.querySelector('.row');
      console.log('projectsRow:', projectsRow);
      
      if (!projectsRow) {
        console.warn('Projects row not found');
        return;
      }
      
      if (!this.projects || !this.projects.projects) {
        console.error('Projects data is missing or malformed:', this.projects);
        return;
      }
      
      console.log('About to render', this.projects.projects.length, 'projects');

      // Collect unique tabs from all project types
      const allTypes = new Set();
      this.projects.projects.filter(p => p.image).forEach(p => (p.type || []).forEach(t => allTypes.add(t)));
      const tabs = ['All', 'Featured', ...Array.from(allTypes).sort()];

      // Build tab bar
      const tabBar = document.createElement('div');
      tabBar.className = 'project-tabs';
      tabBar.innerHTML = tabs.map(tab =>
        `<button class="project-tab${tab === 'Featured' ? ' active' : ''}" data-tab="${tab}">${tab}</button>`
      ).join('');
      projectsRow.parentElement.insertBefore(tabBar, projectsRow);

      // Render all project cards
      const renderProjectCards = (filter) => {
        const withImage = this.projects.projects.filter(p => p.image);
        const filtered = filter === 'All'
          ? withImage
          : filter === 'Featured'
            ? withImage.filter(p => p.highlighted)
            : withImage.filter(p => (p.type || []).includes(filter));
        projectsRow.innerHTML = filtered.map(project => `
          <article class="col-6 col-12-xsmall work-item">
            <a href="${project.image}" class="image fit thumb" data-lightbox="work-item"
              data-title="${project.lightboxTitle}">
              <img src="${project.image}" alt="${project.title}" />
            </a>
            <h3>${project.title}</h3>
            <div class="project-type-icons">${this.renderProjectTypeIcons(project.type)}</div>
            <p>${project.description}</p>
            ${this.renderProjectLinks(project.link)}
            <br>
            <h3>Tech used:</h3>
            ${this.renderProjectTechnologies(project.technologies)}
          </article>
        `).join('');
      };

      renderProjectCards('Featured');

      tabBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.project-tab');
        if (!btn) return;
        tabBar.querySelectorAll('.project-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjectCards(btn.dataset.tab);
      });

      console.log('Projects HTML rendered successfully');

      // Update GitHub button
      const githubButton = projectsSection.querySelector('a.button');
      if (githubButton && this.projects.githubUrl) {
        githubButton.href = this.projects.githubUrl;
        console.log('GitHub button updated with URL:', this.projects.githubUrl);
      }
    } catch (error) {
      console.error('Error rendering projects:', error);
    }
  }

  renderExperiences() {
    try {
      const experienceHeader = document.querySelector('#experience');
      if (!experienceHeader) {
        console.warn('Experience header not found');
        return;
      }
      
      const experienceSection = experienceHeader.closest('section');
      if (!experienceSection) {
        console.warn('Experience section not found');
        return;
      }
      
      const experienceList = experienceSection.querySelector('#experience-list');
      if (!experienceList) {
        console.warn('Experience list not found');
        return;
      }
      
      experienceList.innerHTML = this.experienceData.experiences.map(exp => `
        <li class="exp-items" style="--accent-color:${exp.accentColor}">
          <div class="date">${exp.period}</div>
          <div class="title">
            <strong class="job-title">${exp.jobTitle}</strong><br>
            ${exp.company ? `<span class="company">@ ${exp.company}</span>` : ''}
          </div>
          <div class="descr">
            <ul>
              ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
          </div>
        </li>
      `).join('');
    } catch (error) {
      console.error('Error rendering experiences:', error);
    }
  }

  renderCertificates() {
    try {
      const certificatesHeader = document.querySelector('#certificates');
      if (!certificatesHeader) {
        console.warn('Certificates header not found');
        return;
      }
      
      const certificatesSection = certificatesHeader.closest('section');
      if (!certificatesSection) {
        console.warn('Certificates section not found');
        return;
      }
      
      // Remove existing certificate content (keep header)
      const existingContent = certificatesSection.querySelectorAll('h4, ul, p, a.button');
      existingContent.forEach(el => el.remove());
      
      // Add new certificates
      this.experienceData.certificates.forEach(cert => {
        const certHTML = `
          <h4>${cert.title}</h4>
          <ul>
            <i><strong>${cert.issuer}</strong></i>
            <br>Issued: <strong>${cert.issued} · ${cert.expiration}</strong>
            <br>Certification ID: 
            <a href="${cert.credentialUrl}" target="_blank">${cert.credentialId}</a>
            ${cert.skills ? `<p>Skills: <strong>${cert.skills.join(', ')}</strong></p>` : ''}
            ${cert.sourceCodeUrl ? `<a href="${cert.sourceCodeUrl}" class="button">View Source Code</a>` : ''}
          </ul>
        `;
        certificatesSection.insertAdjacentHTML('beforeend', certHTML);
      });
    } catch (error) {
      console.error('Error rendering certificates:', error);
    }
  }

  renderContact() {
    try {
      // Find the contact section by ID
      const contactSection = document.querySelector('#contact');
      if (!contactSection) {
        console.warn('Contact section not found');
        return;
      }
      
      // Find the address paragraph and email link within the labeled-icons
      const addressP = contactSection.querySelector('.labeled-icons p');
      const emailA = contactSection.querySelector('.labeled-icons a');
      
      console.log('Contact elements found:', { addressP, emailA });
      
      if (addressP) {
        addressP.textContent = this.config.personal.location;
        console.log('Address updated:', this.config.personal.location);
      }
      
      if (emailA) {
        emailA.href = `mailto:${this.config.personal.email}`;
        emailA.textContent = this.config.personal.email;
        console.log('Email updated:', this.config.personal.email);
      }
    } catch (error) {
      console.error('Error rendering contact section:', error);
    }
  }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing portfolio...');
  
  // Check if required elements exist
  const requiredElements = [
    '.image.avatar img',
    'h1 strong',
    'h3',
    '#about',
    '#skills',
    '#projects',
    '#experience',
    '#certificates'
  ];
  
  const missingElements = requiredElements.filter(selector => !document.querySelector(selector));
  if (missingElements.length > 0) {
    console.warn('Missing required elements:', missingElements);
  }
  
  const portfolio = new PortfolioApp();
  portfolio.init();
});