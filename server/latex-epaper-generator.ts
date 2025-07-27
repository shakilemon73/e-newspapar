import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  category?: string;
  published_at?: string;
  image_url?: string;
}

interface EpaperData {
  title: string;
  date: string;
  location: string;
  slogan: string;
  articles: Article[];
}

export class LaTeXEpaperGenerator {
  private readonly tempDir = '/tmp/epaper-latex';
  private readonly outputDir = './public/generated-epapers';

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await mkdir(this.tempDir, { recursive: true });
      await mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  /**
   * Generate Bengali newspaper template with LaTeX
   */
  private generateLaTeXTemplate(data: EpaperData): string {
    const { title, date, location, slogan, articles } = data;
    
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage{newspaper}
\\usepackage{fontspec}
\\usepackage{polyglossia}
\\usepackage{graphicx}
\\usepackage{multicol}
\\usepackage{url}
\\usepackage{geometry}
\\usepackage{xcolor}

% Set up Bengali language support
\\setmainlanguage{english}
\\setotherlanguage{bengali}
\\newfontfamily{\\bengalifont}[Script=Bengali]{Kalpurush}

% Newspaper configuration
\\SetPaperName{${title}}
\\SetPaperLocation{${location}}
\\SetPaperSlogan{${slogan}}
\\SetPaperPrice{বিনামূল্যে}

% Page geometry for better newspaper layout
\\geometry{
  left=1cm,
  right=1cm,
  top=2cm,
  bottom=2cm,
  columnsep=0.8cm
}

% Custom commands for Bengali articles
\\newcommand{\\bengaliarticle}[3]{%
  \\byline{#1}{#2}%
  \\textbengali{#3}%
  \\vspace{0.5cm}%
}

\\newcommand{\\articlewithimage}[4]{%
  \\byline{#1}{#2}%
  \\includegraphics[width=\\columnwidth]{#3}%
  \\textbengali{#4}%
  \\vspace{0.5cm}%
}

\\begin{document}

% Generate newspaper header
\\maketitle

% Date and location
\\begin{center}
\\Large \\textbengali{${this.formatBengaliDate(date)}} \\\\
\\normalsize \\textbengali{${location}}
\\end{center}

\\vspace{0.5cm}

% Start multi-column layout
\\begin{multicols}{3}

${this.generateArticleContent(articles)}

\\end{multicols}

% Footer
\\vfill
\\begin{center}
\\small \\textbengali{আরও সংবাদের জন্য ভিজিট করুন: www.bengalinews.com}
\\end{center}

\\end{document}`;
  }

  /**
   * Generate article content section
   */
  private generateArticleContent(articles: Article[]): string {
    return articles.map((article, index) => {
      const title = this.escapeLaTeX(article.title || 'শিরোনাম');
      const author = this.escapeLaTeX(article.author || 'লেখক');
      const content = this.escapeLaTeX(article.content || article.excerpt || 'বিস্তারিত খবর শীঘ্রই...');

      // Add column break after every 2-3 articles for better distribution
      const columnBreak = (index > 0 && index % 2 === 0) ? '\\columnbreak\n' : '';

      if (article.image_url && index < 3) {
        // Featured articles with images (first 3 articles)
        return `${columnBreak}\\articlewithimage{${title}}{${author}}{example-image}{${content.substring(0, 300)}...}\n\n`;
      } else {
        // Regular articles without images
        return `${columnBreak}\\bengaliarticle{${title}}{${author}}{${content.substring(0, 400)}...}\n\n`;
      }
    }).join('');
  }

  /**
   * Format date in Bengali
   */
  private formatBengaliDate(dateStr: string): string {
    const date = new Date(dateStr);
    const bengaliMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    
    const day = date.getDate().toString().split('').map(d => bengaliNumbers[parseInt(d)]).join('');
    const month = bengaliMonths[date.getMonth()];
    const year = date.getFullYear().toString().split('').map(d => bengaliNumbers[parseInt(d)]).join('');
    
    return `${day} ${month}, ${year}`;
  }

  /**
   * Escape special LaTeX characters
   */
  private escapeLaTeX(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
  }

  /**
   * Generate e-paper using LaTeX
   */
  async generateEpaper(data: EpaperData): Promise<{ success: boolean; pdfPath?: string; error?: string }> {
    const sessionId = randomUUID();
    const texFileName = `epaper-${sessionId}.tex`;
    const pdfFileName = `epaper-${sessionId}.pdf`;
    const texFilePath = join(this.tempDir, texFileName);
    const tempPdfPath = join(this.tempDir, pdfFileName);
    const finalPdfPath = join(this.outputDir, pdfFileName);

    try {
      // Generate LaTeX content
      const latexContent = this.generateLaTeXTemplate(data);
      
      // Write LaTeX file
      await writeFile(texFilePath, latexContent, 'utf8');

      // Compile with XeLaTeX for Bengali support
      const compileCommand = `cd ${this.tempDir} && xelatex -interaction=nonstopmode ${texFileName}`;
      
      console.log('Compiling LaTeX document...');
      const { stdout, stderr } = await execAsync(compileCommand);
      
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(`LaTeX compilation error: ${stderr}`);
      }

      // Move PDF to output directory
      try {
        const pdfBuffer = await readFile(tempPdfPath);
        await writeFile(finalPdfPath, pdfBuffer);
        
        // Cleanup temp files
        await this.cleanup([texFilePath, tempPdfPath]);
        
        return {
          success: true,
          pdfPath: `/generated-epapers/${pdfFileName}`
        };
      } catch (moveError) {
        throw new Error(`Failed to move PDF file: ${moveError}`);
      }

    } catch (error) {
      console.error('LaTeX e-paper generation failed:', error);
      
      // Cleanup on failure
      await this.cleanup([texFilePath, tempPdfPath]);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(filePaths: string[]) {
    for (const filePath of filePaths) {
      try {
        await unlink(filePath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    // Also cleanup auxiliary LaTeX files
    try {
      const auxFiles = ['.aux', '.log', '.out', '.toc'];
      for (const ext of auxFiles) {
        const auxFile = filePaths[0]?.replace('.tex', ext);
        if (auxFile) {
          await unlink(auxFile);
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Check if LaTeX and required packages are installed
   */
  async checkLaTeXInstallation(): Promise<{ installed: boolean; missing: string[] }> {
    const missing: string[] = [];
    
    try {
      // Check XeLaTeX
      await execAsync('which xelatex');
    } catch {
      missing.push('xelatex (TeXLive distribution)');
    }

    try {
      // Check if newspaper package is available
      await execAsync('kpsewhich newspaper.sty');
    } catch {
      missing.push('newspaper LaTeX package');
    }

    try {
      // Check if polyglossia is available
      await execAsync('kpsewhich polyglossia.sty');
    } catch {
      missing.push('polyglossia LaTeX package');
    }

    return {
      installed: missing.length === 0,
      missing
    };
  }

  /**
   * Install required LaTeX packages (Ubuntu/Debian)
   */
  async installLaTeXDependencies(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Installing LaTeX dependencies...');
      
      // Install TeXLive with XeLaTeX and common packages
      const installCommand = `
        sudo apt-get update && 
        sudo apt-get install -y texlive-full texlive-xetex texlive-latex-extra &&
        sudo apt-get install -y fonts-bengali fonts-kalpurush
      `;
      
      await execAsync(installCommand);
      
      return {
        success: true,
        message: 'LaTeX dependencies installed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install dependencies: ${error}`
      };
    }
  }
}

export default LaTeXEpaperGenerator;