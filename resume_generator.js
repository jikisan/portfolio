class ResumeGenerator {
  constructor() {
    this.config = null;
    this.experienceData = null;
    this.projectsData = null;
  }

  async loadData() {
    try {
      const [configResponse, experienceResponse, projectsResponse] = await Promise.all([
        fetch('./data/portfolio_config.json'),
        fetch('./data/experience_data.json'),
        fetch('./data/projects_data.json')
      ]);

      if (!configResponse.ok || !experienceResponse.ok || !projectsResponse.ok) {
        throw new Error('Failed to fetch configuration files');
      }

      this.config = await configResponse.json();
      this.experienceData = await experienceResponse.json();
      this.projectsData = await projectsResponse.json();
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  async generatePDF() {
    try {
      // Load data if not already loaded
      if (!this.config || !this.experienceData || !this.projectsData) {
        await this.loadData();
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrap
      const addWrappedText = (text, x, y, maxWidth, fontSize, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.35); // Return height used
      };

      // Header - Name
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(this.config.personal.name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Contact Information
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const contactInfo = `${this.config.personal.location}`;
      doc.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;

      const phone = '(+63) 915-427-8296';
      const contactLine2 = `${phone} | ${this.config.personal.email} | linkedin.com/in/jkyle`;
      doc.text(contactLine2, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;

      const socialLine = 'github.com/jikisan | jikisan.github.io/portfolio/';
      doc.text(socialLine, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // PROFESSIONAL SUMMARY Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL SUMMARY', margin, yPosition);
      yPosition += 1;

      // Line under section header
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Summary content
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryHeight = addWrappedText(
        this.config.about.description,
        margin,
        yPosition,
        pageWidth - 2 * margin,
        10
      );
      yPosition += summaryHeight + 6;

      // WORK EXPERIENCE Section
      yPosition += 2; // Add gap before section
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('WORK EXPERIENCE', margin, yPosition);
      yPosition += 1;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Add each experience
      for (const exp of this.experienceData.experiences) {
        checkPageBreak(25);

        // Job Title and Date
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.jobTitle, margin, yPosition);
        doc.text(exp.period, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 5;

        // Company and Location
        if (exp.company) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(exp.company, margin, yPosition);
          // Add location if available (using Philippines as default)
          doc.text('Cebu City, Cebu, Philippines', pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 5;
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('Fiverr/Freelance', margin, yPosition);
          doc.text('Cebu City, Cebu, Philippines', pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 5;
        }

        // Achievements
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        for (const achievement of exp.achievements) {
          checkPageBreak(10);
          const bulletX = margin + 2;
          doc.text('•', bulletX, yPosition);
          const achievementHeight = addWrappedText(
            achievement,
            bulletX + 3,
            yPosition,
            pageWidth - 2 * margin - 5,
            10
          );
          yPosition += achievementHeight + 1;
        }
        yPosition += 3;
      }

      // EDUCATION Section
      yPosition += 2; // Add gap before section
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', margin, yPosition);
      yPosition += 1;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('University of Cebu - Banilad', margin, yPosition);
      doc.text('Jun 2018 - Jun 2022', pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Bachelor of Science, Information Technology', margin, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.text('• GPA: 1.7', margin + 2, yPosition);
      yPosition += 4;
      doc.text('• Achievements: Dean\'s Lister', margin + 2, yPosition);
      yPosition += 8;

      // SKILLS Section
      yPosition += 2; // Add gap before section
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', margin, yPosition);
      yPosition += 1;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = '• Mobile development using Java, Kotlin, Swift, Jetpack Compose, Kotlin and Compost multiplatform, MVVM and Clean architecture, Automation development utilizing Selenium and Java, Web development technologies including HTML, CSS, JavaScript, Work management tools such as Jira, Trello';
      const skillsHeight = addWrappedText(
        skillsText,
        margin + 2,
        yPosition,
        pageWidth - 2 * margin - 2,
        10
      );
      yPosition += skillsHeight + 8;

      // PROJECTS Section (featured only)
      const featuredProjects = (this.projectsData.projects || []).filter(p => p.highlighted);
      if (featuredProjects.length > 0) {
        yPosition += 2;
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECTS', margin, yPosition);
        yPosition += 1;
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;

        for (const proj of featuredProjects) {
          checkPageBreak(20);

          // Title + platform
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(proj.title, margin, yPosition);
          if (Array.isArray(proj.type) && proj.type.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(proj.type.join(' / '), pageWidth - margin, yPosition, { align: 'right' });
          }
          yPosition += 5;

          // Description
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const description = (proj.description || '').replace(/\s+/g, ' ').toLowerCase();
          const descFormatted = description.charAt(0).toUpperCase() + description.slice(1);
          const descHeight = addWrappedText(
            descFormatted,
            margin + 2,
            yPosition,
            pageWidth - 2 * margin - 2,
            10
          );
          yPosition += descHeight + 2;

          // Technologies as pill badges
          if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
            const pillFontSize = 8;
            const padX = 2.2;
            const padY = 1.4;
            const pillH = 4.6;
            const gapX = 1.8;
            const gapY = 1.6;
            const startX = margin + 2;
            const maxX = pageWidth - margin;
            let cx = startX;

            doc.setFontSize(pillFontSize);
            doc.setFont('helvetica', 'normal');

            for (const tech of proj.technologies) {
              const textW = doc.getTextWidth(tech);
              const pillW = textW + padX * 2;

              if (cx + pillW > maxX) {
                cx = startX;
                yPosition += pillH + gapY;
                checkPageBreak(pillH + 2);
              }

              doc.setFillColor(240, 240, 240);
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.2);
              doc.roundedRect(cx, yPosition, pillW, pillH, 1.2, 1.2, 'FD');

              doc.setTextColor(60, 60, 60);
              doc.text(tech, cx + padX, yPosition + pillH - padY);

              cx += pillW + gapX;
            }

            doc.setTextColor(0, 0, 0);
            yPosition += pillH + 4;
          } else {
            yPosition += 2;
          }
        }
        yPosition += 2;
      }

      // CERTIFICATES Section
      yPosition += 2; // Add gap before section
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATES', margin, yPosition);
      yPosition += 1;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Add certificates
      for (const cert of this.experienceData.certificates) {
        checkPageBreak(15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const certTitle = `• ${cert.title}`;
        const titleHeight = addWrappedText(
          certTitle,
          margin + 2,
          yPosition,
          pageWidth - 2 * margin - 2,
          10,
          true
        );
        yPosition += titleHeight + 1;

        doc.setFont('helvetica', 'normal');
        doc.text(`${cert.issued} - ${cert.expiration}`, margin + 4, yPosition);
        yPosition += 3.5;

        doc.text(cert.issuer, margin + 4, yPosition);
        yPosition += 3.5;

        doc.text(`Credential ID: ${cert.credentialId}`, margin + 4, yPosition);
        yPosition += 6;
      }

      // Save the PDF
      doc.save('June_Kyle_Santerna_CV.pdf');
      console.log('Resume PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate resume. Please try again.');
    }
  }
}

// Create a global instance
window.resumeGenerator = new ResumeGenerator();
