import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types/student';

// In-memory cache for fonts to avoid re-fetching
let cachedRegularBase64: string | null = null;
let cachedBoldBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Fallback character transliteration in case external TTF fails to load
export function cleanTurkishForStandardFont(text: string): string {
  return text
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I');
}

async function loadFonts(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedRegularBase64) {
      const res = await fetch('/fonts/LiberationSans-Regular.ttf');
      if (res.ok) {
        const buf = await res.arrayBuffer();
        cachedRegularBase64 = arrayBufferToBase64(buf);
      }
    }

    if (!cachedBoldBase64) {
      const res = await fetch('/fonts/LiberationSans-Bold.ttf');
      if (res.ok) {
        const buf = await res.arrayBuffer();
        cachedBoldBase64 = arrayBufferToBase64(buf);
      }
    }

    if (cachedRegularBase64) {
      doc.addFileToVFS('LiberationSans-Regular.ttf', cachedRegularBase64);
      doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
    }
    if (cachedBoldBase64) {
      doc.addFileToVFS('LiberationSans-Bold.ttf', cachedBoldBase64);
      doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');
    }

    return Boolean(cachedRegularBase64);
  } catch (err) {
    console.warn('PDF custom font could not be loaded, using fallback font', err);
    return false;
  }
}

export async function exportStudentsToPDF(
  students: Student[],
  gradeTab: number | 'ALL'
): Promise<void> {
  // Sort students alphabetically by name
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const fontLoaded = await loadFonts(doc);
  const fontName = fontLoaded ? 'LiberationSans' : 'helvetica';

  // Calculate high-level class summary
  const totalStudents = sortedStudents.length;
  const totalCorrect = sortedStudents.reduce((sum, s) => sum + s.totalCorrect, 0);
  const totalWrong = sortedStudents.reduce((sum, s) => sum + s.totalWrong, 0);
  const totalQuestions = totalCorrect + totalWrong;
  const averageRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalGames = sortedStudents.reduce((sum, s) => sum + s.gamesPlayed, 0);

  const gradeTitle = gradeTab === 'ALL'
    ? 'TÜM SINIFLAR (1, 2, 3 ve 4. Sınıf)'
    : `${gradeTab}. SINIF`;

  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const titleText = fontLoaded
    ? `ÖĞRENCİ BAŞARI VE İSTATİSTİK RAPORU`
    : cleanTurkishForStandardFont('ÖĞRENCİ BAŞARI VE İSTATİSTİK RAPORU');

  const subTitleText = fontLoaded
    ? `${gradeTitle} DÜZEYİ MATEMATİK DERSİ ETKİNLİK SONUÇLARI`
    : cleanTurkishForStandardFont(`${gradeTitle} DÜZEYİ MATEMATİK DERSİ ETKİNLİK SONUÇLARI`);

  // PAGE DECORATION & HEADER
  // Top Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 28, 'F');

  // Decorative accent line
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 28, 210, 2, 'F');

  doc.setFont(fontName, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, 14, 13);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(subTitleText, 14, 21);

  // Date and Time on right side
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`${dateStr} | ${timeStr}`, 196, 21, { align: 'right' });

  // SUMMARY CARDS (Top Overview Metric Boxes)
  const boxY = 36;
  const boxHeight = 16;
  const boxWidth = 34;
  const gap = 3;
  let startX = 14;

  interface MetricCard {
    label: string;
    val: string;
    bgColor: [number, number, number];
    textColor: [number, number, number];
  }

  const metrics: MetricCard[] = [
    { label: 'Öğrenci Sayısı', val: `${totalStudents}`, bgColor: [241, 245, 249], textColor: [15, 23, 42] },
    { label: 'Toplam Soru', val: `${totalQuestions}`, bgColor: [238, 242, 255], textColor: [67, 56, 202] },
    { label: 'Toplam Doğru', val: `${totalCorrect}`, bgColor: [236, 253, 245], textColor: [5, 150, 105] },
    { label: 'Toplam Yanlış', val: `${totalWrong}`, bgColor: [255, 241, 242], textColor: [225, 29, 72] },
    { label: 'Ort. Başarı', val: `%${averageRate}`, bgColor: [254, 243, 199], textColor: [180, 83, 9] }
  ];

  metrics.forEach(m => {
    doc.setFillColor(...m.bgColor);
    doc.roundedRect(startX, boxY, boxWidth, boxHeight, 2, 2, 'F');

    // Label
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const lbl = fontLoaded ? m.label : cleanTurkishForStandardFont(m.label);
    doc.text(lbl, startX + boxWidth / 2, boxY + 5.5, { align: 'center' });

    // Value
    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...m.textColor);
    doc.text(m.val, startX + boxWidth / 2, boxY + 12.5, { align: 'center' });

    startX += boxWidth + gap;
  });

  // TABLE DATA GENERATION
  const tableHeaders = [
    '#',
    'Sınıf / Şube',
    'Öğrenci Adı',
    'Doğru',
    'Yanlış',
    'Toplam',
    'Başarı (%)',
    'Oyun / Gal.',
    'Değerlendirme'
  ];

  const tableBody = sortedStudents.map((s, index) => {
    const total = s.totalCorrect + s.totalWrong;
    const rate = total > 0 ? Math.round((s.totalCorrect / total) * 100) : 0;
    
    let evaluation = 'Başlamadı';
    if (total > 0) {
      if (rate >= 90) evaluation = 'Üstün Başarı';
      else if (rate >= 75) evaluation = 'Çok İyi';
      else if (rate >= 50) evaluation = 'Gelişiyor';
      else evaluation = 'Desteklenmeli';
    }

    const branch = s.className ? s.className : `${s.grade}. Sınıf`;
    const cleanName = fontLoaded ? s.name : cleanTurkishForStandardFont(s.name);
    const cleanBranch = fontLoaded ? branch : cleanTurkishForStandardFont(branch);
    const cleanEval = fontLoaded ? evaluation : cleanTurkishForStandardFont(evaluation);

    return [
      `${index + 1}`,
      cleanBranch,
      cleanName,
      `${s.totalCorrect}`,
      `${s.totalWrong}`,
      `${total}`,
      total > 0 ? `%${rate}` : '-',
      `${s.gamesPlayed} / ${s.gamesWon}`,
      cleanEval
    ];
  });

  const finalHeaders = fontLoaded
    ? tableHeaders
    : tableHeaders.map(h => cleanTurkishForStandardFont(h));

  // RENDER TABLE WITH AUTOTABLE
  autoTable(doc, {
    startY: 57,
    head: [finalHeaders],
    body: tableBody.length > 0 ? tableBody : [[
      '-',
      '-',
      fontLoaded ? 'Kayıtlı öğrenci bulunamadı' : 'Kayitli ogrenci bulunamadi',
      '0',
      '0',
      '0',
      '-',
      '-',
      '-'
    ]],
    styles: {
      font: fontName,
      fontSize: 8.5,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [67, 56, 202], // Indigo 700
      textColor: [255, 255, 255],
      fontSize: 8.5,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 24 },
      2: { halign: 'left', fontStyle: 'bold', cellWidth: 42 },
      3: { halign: 'center', textColor: [5, 150, 105], fontStyle: 'bold', cellWidth: 16 },
      4: { halign: 'center', textColor: [225, 29, 72], fontStyle: 'bold', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      7: { halign: 'center', cellWidth: 20 },
      8: { halign: 'center', cellWidth: 26 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate 400

      // Left footer
      const leftNote = fontLoaded
        ? 'İlkokul Matematik Öğrenci Başarı ve Kazanım Takip Sistemi'
        : cleanTurkishForStandardFont('İlkokul Matematik Öğrenci Başarı ve Kazanım Takip Sistemi');
      doc.text(leftNote, 14, 290);

      // Right footer page number
      doc.text(`Sayfa ${currentPage} / ${pageCount}`, 196, 290, { align: 'right' });
      
      // Bottom thin border
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 286, 196, 286);
    }
  });

  // SAVE FILE
  const fileSuffix = gradeTab === 'ALL' ? 'tum_siniflar' : `${gradeTab}_sinif`;
  const dateFileFormat = new Date().toLocaleDateString('tr-TR').replace(/\./g, '_');
  const fileName = `ogrenci_istatistikleri_${fileSuffix}_${dateFileFormat}.pdf`;

  doc.save(fileName);
}
