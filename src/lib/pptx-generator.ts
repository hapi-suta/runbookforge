import pptxgen from 'pptxgenjs';

// Professional color palette matching reference presentation
export const colors = {
  navy: "1e3a5f",
  teal: "0d9488",
  light: "f8fafc",
  slate: "1e293b",
  muted: "64748b",
  lightMuted: "94a3b8",
  success: "10b981",
  successBg: "d1fae5",
  successDark: "065f46",
  warning: "f59e0b",
  warningBg: "fef3c7",
  warningDark: "92400e",
  danger: "ef4444",
  dangerBg: "fee2e2",
  dangerDark: "991b1b",
  blue: "3b82f6",
  blueBg: "dbeafe",
  blueDark: "1e40af",
  purple: "8b5cf6",
  purpleBg: "ede9fe",
  white: "ffffff",
  border: "e2e8f0"
};

// Slide data interfaces
export interface SlideData {
  title: string;
  layout: 'title' | 'agenda' | 'content' | 'two-column' | 'comparison' | 'three-column' | 
          'problems' | 'takeaways' | 'questions' | 'table' | 'architecture' | 'monitoring' |
          'operations' | 'pain-points';
  subtitle?: string;
  content?: string;
  leftColumn?: { title: string; items: { title: string; description?: string }[] };
  rightColumn?: { title: string; items: { title: string; description?: string }[] };
  columns?: { title: string; color?: string; items: string[] }[];
  items?: { title: string; description?: string; type?: 'success' | 'warning' | 'danger' | 'info' }[];
  problems?: { problem: string; solution: string }[];
  operations?: { title: string; description: string; command?: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  keyInsight?: { title: string; content: string };
  speakerNotes?: string;
  footer?: string;
}

export interface PresentationData {
  title: string;
  subtitle?: string;
  author?: string;
  organization?: string;
  slides: SlideData[];
}

export function generatePPTX(data: PresentationData): pptxgen {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = data.title;
  pptx.author = data.author || 'RunbookForge';
  pptx.subject = data.subtitle || '';
  
  data.slides.forEach((slideData) => {
    const slide = pptx.addSlide();
    
    switch (slideData.layout) {
      case 'title':
        createTitleSlide(slide, slideData, data);
        break;
      case 'agenda':
        createAgendaSlide(slide, slideData);
        break;
      case 'pain-points':
        createPainPointsSlide(slide, slideData);
        break;
      case 'two-column':
        createTwoColumnSlide(slide, slideData);
        break;
      case 'comparison':
        createComparisonSlide(slide, slideData);
        break;
      case 'three-column':
        createThreeColumnSlide(slide, slideData);
        break;
      case 'table':
        createTableSlide(slide, slideData);
        break;
      case 'problems':
        createProblemsSlide(slide, slideData);
        break;
      case 'operations':
        createOperationsSlide(slide, slideData);
        break;
      case 'takeaways':
        createTakeawaysSlide(slide, slideData);
        break;
      case 'questions':
        createQuestionsSlide(slide, slideData, data);
        break;
      default:
        createContentSlide(slide, slideData);
    }
    
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  });
  
  return pptx;
}

// ============================================
// TITLE SLIDE - Navy background with centered content
// ============================================
function createTitleSlide(slide: pptxgen.Slide, data: SlideData, pres: PresentationData) {
  slide.background = { color: colors.navy };
  
  // Accent line above title
  slide.addShape('rect', {
    x: 4.2, y: 2.2, w: 1.25, h: 0.05, fill: { color: colors.teal }
  });
  
  // Main title
  slide.addText(data.title, {
    x: 0.5, y: 2.4, w: 9, h: 0.8,
    fontSize: 44, fontFace: 'Arial', bold: true, color: colors.white, align: 'center'
  });
  
  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.5, y: 3.2, w: 9, h: 0.5,
      fontSize: 22, fontFace: 'Arial', color: colors.teal, align: 'center'
    });
  }
  
  // Topic list
  if (data.content) {
    slide.addText(data.content, {
      x: 0.5, y: 4.0, w: 9, h: 0.3,
      fontSize: 12, fontFace: 'Arial', color: colors.lightMuted, align: 'center'
    });
  }
  
  // Footer - organization (RunbookForge)
  slide.addText('RunbookForge', {
    x: 0.4, y: 5.0, w: 3, h: 0.2, fontSize: 11, bold: true, color: colors.lightMuted
  });
  // Footer - tagline (a SUTA company)
  slide.addText('a SUTA company', {
    x: 0.4, y: 5.2, w: 3, h: 0.15, fontSize: 8, color: colors.muted
  });
  
  // Footer - subtitle on right
  if (pres.subtitle) {
    slide.addText(pres.subtitle, {
      x: 6.6, y: 5.1, w: 3, h: 0.25, fontSize: 11, color: colors.muted, align: 'right'
    });
  }
}

// ============================================
// AGENDA SLIDE - Two column numbered list
// ============================================
function createAgendaSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  const leftItems = data.leftColumn?.items || [];
  const rightItems = data.rightColumn?.items || [];
  
  // Left column items with teal circles
  leftItems.forEach((item, i) => {
    // Numbered circle
    slide.addShape('ellipse', {
      x: 0.5, y: 1.3 + i * 0.7, w: 0.4, h: 0.4, fill: { color: colors.teal }
    });
    slide.addText(String(i + 1), {
      x: 0.5, y: 1.3 + i * 0.7, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, color: colors.white, align: 'center', valign: 'middle'
    });
    // Item text
    slide.addText(item.title, {
      x: 1.1, y: 1.35 + i * 0.7, w: 4, h: 0.35,
      fontSize: 14, color: colors.slate, fontFace: 'Arial'
    });
  });
  
  // Right column items with orange circles
  rightItems.forEach((item, i) => {
    slide.addShape('ellipse', {
      x: 5.2, y: 1.3 + i * 0.7, w: 0.4, h: 0.4, fill: { color: colors.warning }
    });
    slide.addText(String(leftItems.length + i + 1), {
      x: 5.2, y: 1.3 + i * 0.7, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, color: colors.white, align: 'center', valign: 'middle'
    });
    slide.addText(item.title, {
      x: 5.8, y: 1.35 + i * 0.7, w: 4, h: 0.35,
      fontSize: 14, color: colors.slate, fontFace: 'Arial'
    });
  });
}

// ============================================
// PAIN POINTS SLIDE - Red warning cards
// ============================================
function createPainPointsSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  const items = data.items || [];
  
  items.forEach((item, i) => {
    // Red background card
    slide.addShape('rect', {
      x: 0.5, y: 1.1 + i * 0.8, w: 9, h: 0.7,
      fill: { color: colors.dangerBg }, line: { color: colors.danger, pt: 0 }
    });
    // Left accent border
    slide.addShape('rect', {
      x: 0.5, y: 1.1 + i * 0.8, w: 0.05, h: 0.7, fill: { color: colors.danger }
    });
    // Title
    slide.addText(item.title, {
      x: 0.7, y: 1.15 + i * 0.8, w: 8, h: 0.3,
      fontSize: 13, bold: true, color: colors.dangerDark
    });
    // Description
    if (item.description) {
      slide.addText(item.description, {
        x: 0.7, y: 1.4 + i * 0.8, w: 8, h: 0.25,
        fontSize: 11, color: "7f1d1d"
      });
    }
  });
}

// ============================================
// CONTENT SLIDE - Standard content with colored cards
// ============================================
function createContentSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  const items = data.items || [];
  
  items.forEach((item, i) => {
    const bgColor = item.type === 'success' ? colors.successBg :
                    item.type === 'warning' ? colors.warningBg :
                    item.type === 'danger' ? colors.dangerBg :
                    colors.blueBg;
    const accentColor = item.type === 'success' ? colors.success :
                        item.type === 'warning' ? colors.warning :
                        item.type === 'danger' ? colors.danger :
                        colors.blue;
    const textColor = item.type === 'success' ? colors.successDark :
                      item.type === 'warning' ? colors.warningDark :
                      item.type === 'danger' ? colors.dangerDark :
                      colors.slate;
    
    // Card background
    slide.addShape('rect', {
      x: 0.5, y: 1.1 + i * 0.8, w: 9, h: 0.7,
      fill: { color: bgColor }, line: { color: bgColor }
    });
    // Left accent
    slide.addShape('rect', {
      x: 0.5, y: 1.1 + i * 0.8, w: 0.05, h: 0.7, fill: { color: accentColor }
    });
    // Title
    slide.addText(item.title, {
      x: 0.7, y: 1.15 + i * 0.8, w: 8, h: 0.3,
      fontSize: 13, bold: true, color: textColor
    });
    // Description
    if (item.description) {
      slide.addText(item.description, {
        x: 0.7, y: 1.4 + i * 0.8, w: 8, h: 0.25,
        fontSize: 11, color: textColor
      });
    }
  });
  
  // Key insight box
  if (data.keyInsight) {
    slide.addShape('rect', {
      x: 0.5, y: 4.2, w: 9, h: 0.65, fill: { color: colors.navy }
    });
    slide.addText(data.keyInsight.title, {
      x: 0.65, y: 4.25, w: 2, h: 0.25, fontSize: 10, bold: true, color: colors.teal
    });
    slide.addText(data.keyInsight.content, {
      x: 0.65, y: 4.5, w: 8.5, h: 0.3, fontSize: 10, color: colors.light
    });
  }
}

// ============================================
// TWO-COLUMN SLIDE - Benefits vs Considerations
// ============================================
function createTwoColumnSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  // Left column header
  if (data.leftColumn?.title) {
    slide.addText(data.leftColumn.title.toUpperCase(), {
      x: 0.5, y: 1.0, w: 4, h: 0.3, fontSize: 13, bold: true, color: colors.success
    });
  }
  
  // Left items (green success style)
  data.leftColumn?.items.forEach((item, i) => {
    slide.addShape('rect', {
      x: 0.5, y: 1.35 + i * 0.72, w: 4.3, h: 0.65,
      fill: { color: colors.successBg }, line: { color: colors.successBg }
    });
    slide.addText('✓', {
      x: 0.6, y: 1.4 + i * 0.72, w: 0.3, h: 0.3, fontSize: 14, color: colors.success
    });
    slide.addText(item.title, {
      x: 0.95, y: 1.4 + i * 0.72, w: 3.5, h: 0.25, fontSize: 11, bold: true, color: colors.successDark
    });
    if (item.description) {
      slide.addText(item.description, {
        x: 0.95, y: 1.62 + i * 0.72, w: 3.5, h: 0.25, fontSize: 10, color: "047857"
      });
    }
  });
  
  // Right column header
  if (data.rightColumn?.title) {
    slide.addText(data.rightColumn.title.toUpperCase(), {
      x: 5.2, y: 1.0, w: 4, h: 0.3, fontSize: 13, bold: true, color: colors.warning
    });
  }
  
  // Right items (orange warning style)
  data.rightColumn?.items.forEach((item, i) => {
    slide.addShape('rect', {
      x: 5.2, y: 1.35 + i * 0.72, w: 4.3, h: 0.65,
      fill: { color: colors.warningBg }, line: { color: colors.warningBg }
    });
    slide.addText('!', {
      x: 5.3, y: 1.4 + i * 0.72, w: 0.3, h: 0.3, fontSize: 14, bold: true, color: colors.warning
    });
    slide.addText(item.title, {
      x: 5.65, y: 1.4 + i * 0.72, w: 3.5, h: 0.25, fontSize: 11, bold: true, color: colors.warningDark
    });
    if (item.description) {
      slide.addText(item.description, {
        x: 5.65, y: 1.62 + i * 0.72, w: 3.5, h: 0.25, fontSize: 10, color: "78350f"
      });
    }
  });
  
  // Key insight box
  if (data.keyInsight) {
    slide.addShape('rect', {
      x: 5.2, y: 3.7, w: 4.3, h: 0.9, fill: { color: colors.navy }
    });
    slide.addText('KEY INSIGHT', {
      x: 5.35, y: 3.8, w: 4, h: 0.25, fontSize: 10, bold: true, color: colors.teal
    });
    slide.addText(data.keyInsight.content, {
      x: 5.35, y: 4.05, w: 4, h: 0.45, fontSize: 10, color: colors.light
    });
  }
}

// ============================================
// COMPARISON SLIDE - Before/After or Problem/Solution columns
// ============================================
function createComparisonSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  // Left column (challenges/before)
  if (data.leftColumn) {
    slide.addShape('rect', {
      x: 0.4, y: 1.05, w: 4.5, h: 0.45, fill: { color: colors.danger }
    });
    slide.addText(data.leftColumn.title.toUpperCase(), {
      x: 0.4, y: 1.05, w: 4.5, h: 0.45,
      fontSize: 12, bold: true, color: colors.white, align: 'center', valign: 'middle'
    });
    
    data.leftColumn.items.forEach((item, i) => {
      slide.addShape('rect', {
        x: 0.4, y: 1.55 + i * 0.65, w: 4.5, h: 0.6,
        fill: { color: colors.white }, line: { color: colors.border }
      });
      slide.addText('✗ ' + item.title, {
        x: 0.5, y: 1.6 + i * 0.65, w: 4.3, h: 0.5, fontSize: 10, color: colors.danger
      });
    });
  }
  
  // Right column (solutions/after)
  if (data.rightColumn) {
    slide.addShape('rect', {
      x: 5.1, y: 1.05, w: 4.5, h: 0.45, fill: { color: colors.success }
    });
    slide.addText(data.rightColumn.title.toUpperCase(), {
      x: 5.1, y: 1.05, w: 4.5, h: 0.45,
      fontSize: 12, bold: true, color: colors.white, align: 'center', valign: 'middle'
    });
    
    data.rightColumn.items.forEach((item, i) => {
      slide.addShape('rect', {
        x: 5.1, y: 1.55 + i * 0.65, w: 4.5, h: 0.6,
        fill: { color: colors.white }, line: { color: colors.border }
      });
      slide.addText('✓ ' + item.title, {
        x: 5.2, y: 1.6 + i * 0.65, w: 4.3, h: 0.5, fontSize: 10, color: colors.success
      });
    });
  }
}

// ============================================
// THREE-COLUMN SLIDE - Category columns
// ============================================
function createThreeColumnSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  const colColors = [colors.navy, colors.teal, colors.purple];
  
  data.columns?.forEach((col, i) => {
    const x = 0.4 + i * 3.15;
    const colColor = col.color || colColors[i % colColors.length];
    
    // Column header
    slide.addShape('rect', {
      x: x, y: 1.05, w: 3.0, h: 0.45, fill: { color: colColor }
    });
    slide.addText(col.title.toUpperCase(), {
      x: x, y: 1.05, w: 3.0, h: 0.45,
      fontSize: 10, bold: true, color: colors.white, align: 'center', valign: 'middle'
    });
    
    // Content box
    slide.addShape('rect', {
      x: x, y: 1.5, w: 3.0, h: 2.4,
      fill: { color: colors.white }, line: { color: colors.border }
    });
    
    // Items
    col.items.forEach((item, j) => {
      slide.addText('✓ ' + item, {
        x: x + 0.1, y: 1.6 + j * 0.55, w: 2.8, h: 0.5, fontSize: 9, color: colors.success
      });
    });
  });
  
  // Bottom callout
  if (data.keyInsight) {
    slide.addShape('rect', {
      x: 0.4, y: 4.1, w: 9.2, h: 0.45, fill: { color: colors.navy }
    });
    slide.addText(data.keyInsight.title + '    ' + data.keyInsight.content, {
      x: 0.6, y: 4.1, w: 9, h: 0.45, fontSize: 11, color: colors.light, valign: 'middle'
    });
  }
}

// ============================================
// TABLE SLIDE - Comparison table
// ============================================
function createTableSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  if (data.tableData) {
    const rows: pptxgen.TableRow[] = [];
    
    // Header row
    if (data.tableData.headers) {
      rows.push(data.tableData.headers.map((h, i) => ({
        text: h,
        options: {
          bold: true,
          fill: { color: i === 0 ? colors.light : colors.navy },
          color: i === 0 ? colors.slate : colors.white
        }
      })));
    }
    
    // Data rows
    data.tableData.rows.forEach(row => {
      rows.push(row.map((cell) => {
        const isRecommended = cell.toLowerCase().includes('✓') || cell.toLowerCase().includes('yes');
        const isNotRecommended = cell.toLowerCase().includes('✗') || cell.toLowerCase().includes('no');
        return {
          text: cell,
          options: {
            color: isRecommended ? colors.success : isNotRecommended ? colors.danger : colors.slate,
            bold: isRecommended
          }
        };
      }));
    });
    
    slide.addTable(rows, {
      x: 0.3, y: 1.0, w: 9.4, h: 2.8,
      fontSize: 10, fontFace: 'Arial',
      align: 'center', valign: 'middle',
      border: { pt: 0.5, color: colors.border }
    });
  }
}

// ============================================
// PROBLEMS SLIDE - Problem → Solution layout
// ============================================
function createProblemsSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  data.problems?.forEach((item, i) => {
    // Problem box
    slide.addShape('rect', {
      x: 0.4, y: 1.05 + i * 0.78, w: 3.8, h: 0.7, fill: { color: colors.dangerBg }
    });
    slide.addText('PROBLEM', {
      x: 0.5, y: 1.08 + i * 0.78, w: 1, h: 0.2, fontSize: 8, bold: true, color: colors.danger
    });
    slide.addText(item.problem, {
      x: 0.5, y: 1.3 + i * 0.78, w: 3.6, h: 0.35, fontSize: 10, bold: true, color: colors.dangerDark
    });
    
    // Arrow
    slide.addText('→', {
      x: 4.3, y: 1.2 + i * 0.78, w: 0.4, h: 0.4, fontSize: 18, color: colors.muted, align: 'center'
    });
    
    // Solution box
    slide.addShape('rect', {
      x: 4.8, y: 1.05 + i * 0.78, w: 4.8, h: 0.7, fill: { color: colors.successBg }
    });
    slide.addText('SOLUTION', {
      x: 4.9, y: 1.08 + i * 0.78, w: 1, h: 0.2, fontSize: 8, bold: true, color: colors.success
    });
    slide.addText(item.solution, {
      x: 4.9, y: 1.3 + i * 0.78, w: 4.6, h: 0.35, fontSize: 10, color: colors.successDark
    });
  });
}

// ============================================
// OPERATIONS SLIDE - Day-2 operations with commands
// ============================================
function createOperationsSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.light };
  addHeaderBar(slide, data.title);
  
  data.operations?.forEach((op, i) => {
    // Card container
    slide.addShape('rect', {
      x: 0.4, y: 1.05 + i * 0.78, w: 9.2, h: 0.7,
      fill: { color: colors.white }, line: { color: colors.border }
    });
    
    // Title
    slide.addText(op.title, {
      x: 0.55, y: 1.1 + i * 0.78, w: 2.5, h: 0.25, fontSize: 11, bold: true, color: colors.navy
    });
    
    // Description
    slide.addText(op.description, {
      x: 0.55, y: 1.35 + i * 0.78, w: 3.5, h: 0.25, fontSize: 9, color: colors.muted
    });
    
    // Command box
    if (op.command) {
      slide.addShape('rect', {
        x: 4.2, y: 1.12 + i * 0.78, w: 5.2, h: 0.5, fill: { color: "f1f5f9" }
      });
      slide.addText(op.command, {
        x: 4.3, y: 1.12 + i * 0.78, w: 5, h: 0.5,
        fontSize: 7, fontFace: 'Courier New', color: "475569", valign: 'middle'
      });
    }
  });
}

// ============================================
// TAKEAWAYS SLIDE - Navy background numbered list
// ============================================
function createTakeawaysSlide(slide: pptxgen.Slide, data: SlideData) {
  slide.background = { color: colors.navy };
  
  // Title
  slide.addText(data.title, {
    x: 0.4, y: 0.4, w: 9, h: 0.6, fontSize: 32, bold: true, color: colors.white
  });
  
  // Accent line
  slide.addShape('rect', {
    x: 0.4, y: 0.95, w: 0.8, h: 0.05, fill: { color: colors.teal }
  });
  
  const items = data.items || [];
  items.forEach((item, i) => {
    // Numbered circle
    slide.addShape('ellipse', {
      x: 0.5, y: 1.35 + i * 0.65, w: 0.4, h: 0.4, fill: { color: colors.teal }
    });
    slide.addText(String(i + 1), {
      x: 0.5, y: 1.35 + i * 0.65, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, color: colors.white, align: 'center', valign: 'middle'
    });
    // Takeaway text
    slide.addText(item.title, {
      x: 1.1, y: 1.38 + i * 0.65, w: 8.4, h: 0.4, fontSize: 14, color: colors.white
    });
  });
}

// ============================================
// QUESTIONS SLIDE - Navy with centered title
// ============================================
function createQuestionsSlide(slide: pptxgen.Slide, data: SlideData, pres: PresentationData) {
  slide.background = { color: colors.navy };
  
  // Accent line
  slide.addShape('rect', {
    x: 4.2, y: 1.8, w: 1.25, h: 0.05, fill: { color: colors.teal }
  });
  
  // Questions title
  slide.addText('Questions?', {
    x: 0.5, y: 2.0, w: 9, h: 0.9, fontSize: 48, bold: true, color: colors.white, align: 'center'
  });
  
  // Subtitle
  slide.addText(data.subtitle || 'Thank you for your attention', {
    x: 0.5, y: 2.9, w: 9, h: 0.4, fontSize: 18, color: colors.lightMuted, align: 'center'
  });
  
  // Resource boxes (if items provided)
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, i) => {
      slide.addShape('rect', {
        x: 1.5 + i * 2.5, y: 3.7, w: 2.3, h: 0.8,
        fill: { color: "1a3552" }, line: { color: "334155" }
      });
      slide.addText(item.title.toUpperCase(), {
        x: 1.5 + i * 2.5, y: 3.75, w: 2.3, h: 0.3, fontSize: 10, bold: true, color: colors.teal, align: 'center'
      });
      if (item.description) {
        slide.addText(item.description, {
          x: 1.5 + i * 2.5, y: 4.05, w: 2.3, h: 0.35, fontSize: 9, color: colors.lightMuted, align: 'center'
        });
      }
    });
  }
  
  // Footer - RunbookForge branding
  slide.addText('RunbookForge', {
    x: 0.4, y: 5.0, w: 3, h: 0.2, fontSize: 11, bold: true, color: colors.lightMuted
  });
  slide.addText('a SUTA company', {
    x: 0.4, y: 5.2, w: 3, h: 0.15, fontSize: 8, color: colors.muted
  });
  
  if (pres.subtitle) {
    slide.addText(pres.subtitle, {
      x: 6.6, y: 5.1, w: 3, h: 0.25, fontSize: 11, color: colors.muted, align: 'right'
    });
  }
}

// ============================================
// HELPER: Add navy header bar
// ============================================
function addHeaderBar(slide: pptxgen.Slide, title: string) {
  slide.addShape('rect', {
    x: 0, y: 0, w: 10, h: 0.85, fill: { color: colors.navy }
  });
  slide.addText(title, {
    x: 0.4, y: 0.2, w: 9, h: 0.5, fontSize: 28, bold: true, color: colors.white
  });
}

// ============================================
// GENERATE BUFFER - For API response
// ============================================
export async function generatePPTXBuffer(data: PresentationData): Promise<Buffer> {
  const pptx = generatePPTX(data);
  const output = await pptx.write({ outputType: 'nodebuffer' });
  return output as Buffer;
}
