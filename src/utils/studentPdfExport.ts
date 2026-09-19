import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types/student';
import { getTopicInfo } from './topicHelper';

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

interface PedagogicalReport {
  levelTitle: string;
  reportSentences: string[];
}

/**
 * Generates an individualized pedagogical evaluation of a few sentences
 * based on the student's solved activities, specific learning outcomes (kazanımlar),
 * and correct/wrong counts.
 */
function generatePedagogicalReport(student: Student): PedagogicalReport {
  const total = student.totalCorrect + student.totalWrong;
  const rate = total > 0 ? Math.round((student.totalCorrect / total) * 100) : 0;

  if (total === 0) {
    return {
      levelTitle: 'Başlangıç Düzeyi',
      reportSentences: [
        `${student.name} henüz sistem üzerindeki konu ve etkinlik testlerini çözmeye başlamamıştır.`,
        `Öğrencinin kazanım ve seviye durumunun doğru tespit edilebilmesi için ${student.grade}. sınıf düzeyine uygun etkinlikleri tamamlaması önerilmektedir.`,
        `Düzenli etkinlik çözümü ile matematiksel kavramların pekişmesi ve çalışma alışkanlığı kazanması hedeflenmektedir.`
      ]
    };
  }

  // Proficiency level classification
  let levelTitle = 'Gelişmekte Olan Düzey';
  if (rate >= 90) {
    levelTitle = 'Üstün Başarı (İleri Düzey)';
  } else if (rate >= 75) {
    levelTitle = 'Yetkin Düzey (Çok İyi)';
  } else if (rate >= 50) {
    levelTitle = 'Gelişmekte Olan Düzey';
  } else {
    levelTitle = 'Desteklenmesi Gereken Düzey';
  }

  // Identify strong and weak learning competencies from solved topics
  const topicEntries = Object.entries(student.topicStats || {}).filter(
    ([_, stat]) => (stat.correct || 0) + (stat.wrong || 0) > 0
  );

  const strongTopics: string[] = [];
  const weakTopics: string[] = [];

  topicEntries.forEach(([key, stat]) => {
    const tTot = (stat.correct || 0) + (stat.wrong || 0);
    const tRate = Math.round(((stat.correct || 0) / tTot) * 100);
    const info = getTopicInfo(key, student.grade);
    const cleanTitle = info.title.length > 28 ? info.title.slice(0, 26) + '...' : info.title;

    if (tRate >= 70 && stat.correct >= 2) {
      strongTopics.push(cleanTitle);
    } else if (tRate < 60 && stat.wrong >= 1) {
      weakTopics.push(cleanTitle);
    }
  });

  const sentences: string[] = [];

  // Sentence 1: Level and general success based on correct/wrong
  sentences.push(
    `${student.name}, çözdüğü toplam ${total} soruda ${student.totalCorrect} doğru ve ${student.totalWrong} yanlış ile %${rate} başarı oranı yakalamış ve '${levelTitle}' olarak değerlendirilmiştir.`
  );

  // Sentence 2: Strengths & mastered competencies
  if (strongTopics.length > 0) {
    const listStr = strongTopics.slice(0, 3).join(', ');
    sentences.push(
      `Öğrenci özellikle "${listStr}" kazanımlarında yüksek doğruluk oranı ile üstün kavrama becerisi ortaya koymuştur.`
    );
  } else if (rate >= 70) {
    sentences.push(
      `Çözülen tüm etkinliklerde soru köklerini doğru analiz etme ve mantıksal çıkarım yapma kabiliyeti olumlu düzeydedir.`
    );
  }

  // Sentence 3: Target competencies needing support / reinforcement
  if (weakTopics.length > 0) {
    const listStr = weakTopics.slice(0, 3).join(', ');
    sentences.push(
      `Gelişime açık olan "${listStr}" konularında ise hata analizi, somut modelleme ve pekiştirici soru çözümleriyle desteklenmesi önerilmektedir.`
    );
  } else if (student.totalWrong > 0) {
    sentences.push(
      `Hatalı cevaplanan sorularda soru yönergelerine dikkat edilmesi ve acele etmeden adım adım ilerlenmesi başarıyı daha da artıracaktır.`
    );
  } else {
    sentences.push(
      `Sorularda sergilediği sıfır hata performansı takdire şayan olup üst düzey akıl yürütme ve problem çözme etkinlikleriyle öğrenme derinleştirilmelidir.`
    );
  }

  // Sentence 4: Motivation and general developmental conclusion
  if (student.gamesPlayed > 0) {
    sentences.push(
      `Tamamlanan ${student.gamesPlayed} eğitici oyun etkinliğiyle gösterdiği odaklanma ve öğrenme motivasyonunun devamı tavsiye edilir.`
    );
  } else {
    sentences.push(
      `Düzenli çalışma rutini ve ders içi aktif katılımla öğrencinin matematiksel becerilerinin daha da ilerleyeceği öngörülmektedir.`
    );
  }

  return { levelTitle, reportSentences: sentences };
}

/**
 * Generates a dedicated, 1-page A4 Individual Student Report.
 * Formatted cleanly so it strictly fits within a single A4 page without overflowing.
 */
function generateIndividualStudentReport(
  doc: jsPDF,
  student: Student,
  gradeTab: number | 'ALL',
  fontLoaded: boolean,
  fontName: string
) {
  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const branchText = student.className ? student.className : `${student.grade}. Sınıf`;

  // 1. TOP HEADER BANNER (y: 0 to 22mm)
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 22, 'F');

  // Decorative Indigo Accent Line
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 22, 210, 1.5, 'F');

  const mainTitle = fontLoaded
    ? 'BİREYSEL ÖĞRENCİ GELİŞİM VE KAZANIM DEĞERLENDİRME RAPORU'
    : cleanTurkishForStandardFont('BİREYSEL ÖĞRENCİ GELİŞİM VE KAZANIM DEĞERLENDİRME RAPORU');
  doc.setFont(fontName, 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(mainTitle, 14, 11);

  const subTitle = fontLoaded
    ? `Öğrenci: ${student.name}   |   Sınıf: ${branchText}   |   Matematik ve Bilişsel Etkinlikler`
    : cleanTurkishForStandardFont(`Öğrenci: ${student.name}   |   Sınıf: ${branchText}   |   Matematik ve Bilişsel Etkinlikler`);
  doc.setFont(fontName, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(subTitle, 14, 18);

  // Date on top-right
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`${dateStr} | ${timeStr}`, 196, 18, { align: 'right' });

  // 2. MINI METRIC CARDS (y: 27 to 40mm)
  const totalQuestions = student.totalCorrect + student.totalWrong;
  const overallSuccessRate = totalQuestions > 0 ? Math.round((student.totalCorrect / totalQuestions) * 100) : 0;

  const boxY = 27;
  const boxHeight = 13.5;
  const boxWidth = 34;
  const gap = 3;
  let startX = 14;

  const metrics = [
    { label: 'Toplam Soru', val: `${totalQuestions}`, bgColor: [241, 245, 249], textColor: [15, 23, 42] },
    { label: 'Toplam Doğru', val: `${student.totalCorrect}`, bgColor: [236, 253, 245], textColor: [5, 150, 105] },
    { label: 'Toplam Yanlış', val: `${student.totalWrong}`, bgColor: [255, 241, 242], textColor: [225, 29, 72] },
    { label: 'Başarı Oranı', val: `%${overallSuccessRate}`, bgColor: [238, 242, 255], textColor: [67, 56, 202] },
    { label: 'Oyun / Galibiyet', val: `${student.gamesPlayed} / ${student.gamesWon}`, bgColor: [254, 243, 199], textColor: [180, 83, 9] }
  ];

  metrics.forEach(m => {
    doc.setFillColor(m.bgColor[0], m.bgColor[1], m.bgColor[2]);
    doc.roundedRect(startX, boxY, boxWidth, boxHeight, 1.8, 1.8, 'F');

    // Label
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const lbl = fontLoaded ? m.label : cleanTurkishForStandardFont(m.label);
    doc.text(lbl, startX + boxWidth / 2, boxY + 4.5, { align: 'center' });

    // Value
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(m.textColor[0], m.textColor[1], m.textColor[2]);
    doc.text(m.val, startX + boxWidth / 2, boxY + 10.5, { align: 'center' });

    startX += boxWidth + gap;
  });

  // 3. SEVİYE VE PEDAGOJİK KAZANIM RAPORU KUTUSU (y: 43.5 to 73.5mm)
  const reportY = 43.5;
  const reportWidth = 182;
  const reportData = generatePedagogicalReport(student);
  const fullReportText = reportData.reportSentences.join(' ');
  const cleanReportText = fontLoaded ? fullReportText : cleanTurkishForStandardFont(fullReportText);

  // Wrap text cleanly to fit card width (170mm text area)
  const wrappedLines = doc.splitTextToSize(cleanReportText, 172);
  const lineSpacing = 3.9;
  const textBlockHeight = wrappedLines.length * lineSpacing;
  const cardHeight = Math.max(28, 11 + textBlockHeight + 3);

  // Background Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(14, reportY, reportWidth, cardHeight, 2, 2, 'FD');

  // Left Accent Bar (Indigo 600)
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(14, reportY, 3, cardHeight, 1, 1, 'F');

  // Report Title & Level Badge
  doc.setFont(fontName, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const repHeader = fontLoaded
    ? 'Pedagojik Seviye ve Kazanım Değerlendirme Raporu'
    : cleanTurkishForStandardFont('Pedagojik Seviye ve Kazanım Değerlendirme Raporu');
  doc.text(repHeader, 20, reportY + 5.5);

  // Level Badge on right of card header
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(140, reportY + 2, 53, 5, 1, 1, 'FD');
  doc.setFont(fontName, 'bold');
  doc.setFontSize(7);
  doc.setTextColor(67, 56, 202);
  const badgeText = fontLoaded
    ? `Düzey: ${reportData.levelTitle}`
    : cleanTurkishForStandardFont(`Düzey: ${reportData.levelTitle}`);
  doc.text(badgeText, 166.5, reportY + 5.5, { align: 'center' });

  // Render wrapped report sentences
  doc.setFont(fontName, 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85); // Slate-700
  doc.text(wrappedLines, 20, reportY + 11.5, { lineHeightFactor: 1.35 });

  // 4. ÇÖZÜLEN ETKİNLİK VE KAZANIM DAĞILIM TABLOSU
  const tableStartY = reportY + cardHeight + 4.5;

  // Section heading
  doc.setFont(fontName, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const tableTitle = fontLoaded
    ? 'Çözülen Etkinlik ve Kazanım Dağılımı'
    : cleanTurkishForStandardFont('Çözülen Etkinlik ve Kazanım Dağılımı');
  doc.text(tableTitle, 14, tableStartY);

  // Prepare table rows from topic stats
  const topicEntries = Object.entries(student.topicStats || {}).filter(
    ([_, stat]) => (stat.correct || 0) + (stat.wrong || 0) > 0
  );

  // Sort topics by total questions answered descending
  topicEntries.sort((a, b) => {
    const totA = (a[1].correct || 0) + (a[1].wrong || 0);
    const totB = (b[1].correct || 0) + (b[1].wrong || 0);
    return totB - totA;
  });

  const topicHeaders = ['#', 'Kazanım / Etkinlik Adı', 'Doğru', 'Yanlış', 'Toplam', 'Başarı (%)', 'Kazanım Düzeyi'];

  let topicBody: string[][] = [];

  if (topicEntries.length > 0) {
    // To strictly guarantee a single A4 page, limit table rows to 18 most active topics
    const maxTopicsToShow = 18;
    const displayedTopics = topicEntries.slice(0, maxTopicsToShow);

    topicBody = displayedTopics.map(([tKey, stat], idx) => {
      const tInfo = getTopicInfo(tKey, student.grade);
      const c = stat.correct || 0;
      const w = stat.wrong || 0;
      const tot = c + w;
      const rate = tot > 0 ? Math.round((c / tot) * 100) : 0;

      let status = 'Gelişiyor';
      if (rate >= 90) status = 'Üstün Başarı';
      else if (rate >= 75) status = 'Kazanıldı (İyi)';
      else if (rate >= 50) status = 'Gelişiyor';
      else status = 'Pekiştirilmeli';

      const cleanTitle = fontLoaded ? tInfo.title : cleanTurkishForStandardFont(tInfo.title);
      const cleanStatus = fontLoaded ? status : cleanTurkishForStandardFont(status);

      return [
        `${idx + 1}`,
        cleanTitle,
        `${c}`,
        `${w}`,
        `${tot}`,
        `%${rate}`,
        cleanStatus
      ];
    });

    // If there were additional topics beyond maxTopicsToShow, add a summary row
    if (topicEntries.length > maxTopicsToShow) {
      const remainder = topicEntries.slice(maxTopicsToShow);
      const remCorrect = remainder.reduce((sum, [_, s]) => sum + (s.correct || 0), 0);
      const remWrong = remainder.reduce((sum, [_, s]) => sum + (s.wrong || 0), 0);
      const remTot = remCorrect + remWrong;
      const remRate = remTot > 0 ? Math.round((remCorrect / remTot) * 100) : 0;
      topicBody.push([
        '+',
        fontLoaded ? `Diğer ${remainder.length} Etkinlik (Özet)` : `Diger ${remainder.length} Etkinlik (Ozet)`,
        `${remCorrect}`,
        `${remWrong}`,
        `${remTot}`,
        `%${remRate}`,
        fontLoaded ? 'Özet' : 'Ozet'
      ]);
    }
  } else {
    topicBody = [[
      '-',
      fontLoaded ? 'Henüz çözülmüş soru veya etkinlik kaydı bulunmuyor.' : 'Henuz cozulmus soru veya etkinlik kaydi bulunmuyor.',
      '0',
      '0',
      '0',
      '-',
      fontLoaded ? 'Başlamadı' : 'Baslamadi'
    ]];
  }

  const finalHeaders = fontLoaded
    ? topicHeaders
    : topicHeaders.map(h => cleanTurkishForStandardFont(h));

  // Render Table with autoTable (compact layout strictly within 1 page)
  autoTable(doc, {
    startY: tableStartY + 2.5,
    head: [finalHeaders],
    body: topicBody,
    styles: {
      font: fontName,
      fontSize: 7.5,
      cellPadding: 1.4,
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    headStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [67, 56, 202], // Indigo-700
      textColor: [255, 255, 255],
      fontSize: 7.8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
      2: { halign: 'center', textColor: [5, 150, 105], fontStyle: 'bold', cellWidth: 16 },
      3: { halign: 'center', textColor: [225, 29, 72], fontStyle: 'bold', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 38 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 24 }
  });

  const lastAutoTable = (doc as any).lastAutoTable;
  const tableEndY = lastAutoTable ? lastAutoTable.finalY : 200;

  // 5. OFFICIAL SIGNATURES BLOCK (Placed below table, before footer)
  // Ensure signature Y is placed gracefully on the single page
  const signY = Math.min(Math.max(tableEndY + 7, 244), 260);

  doc.setFont(fontName, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  // Left: Sınıf / Branş Öğretmeni
  const tTeacher = fontLoaded ? 'Sınıf / Branş Öğretmeni' : cleanTurkishForStandardFont('Sınıf / Branş Öğretmeni');
  doc.text(tTeacher, 25, signY);
  doc.setFont(fontName, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(fontLoaded ? 'İmza: _______________________' : 'Imza: _______________________', 25, signY + 6);

  // Right: Okul Rehberlik / Yönetim
  doc.setFont(fontName, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const tAdmin = fontLoaded ? 'Okul Yönetimi / Rehberlik Servisi' : cleanTurkishForStandardFont('Okul Yönetimi / Rehberlik Servisi');
  doc.text(tAdmin, 130, signY);
  doc.setFont(fontName, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(fontLoaded ? 'İmza / Mühür: ________________' : 'Imza / Muhur: ________________', 130, signY + 6);

  // 6. BOTTOM FOOTER (strictly on Page 1 at y = 286-290mm)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(14, 284, 196, 284);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);

  const footerLeft = fontLoaded
    ? 'İlkokul Matematik ve Bilişsel Etkinlik Takip Sistemi • Bireysel Değerlendirme Raporu'
    : cleanTurkishForStandardFont('İlkokul Matematik ve Bilişsel Etkinlik Takip Sistemi • Bireysel Değerlendirme Raporu');
  doc.text(footerLeft, 14, 288.5);

  doc.text('Sayfa 1 / 1', 196, 288.5, { align: 'right' });
}

/**
 * Generates the class-wide roster PDF report when multiple students are exported.
 */
function generateClassRosterReport(
  doc: jsPDF,
  sortedStudents: Student[],
  gradeTab: number | 'ALL',
  fontLoaded: boolean,
  fontName: string
) {
  const totalStudents = sortedStudents.length;
  const totalCorrect = sortedStudents.reduce((sum, s) => sum + s.totalCorrect, 0);
  const totalWrong = sortedStudents.reduce((sum, s) => sum + s.totalWrong, 0);
  const totalQuestions = totalCorrect + totalWrong;
  const averageRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

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

  const metrics = [
    { label: 'Öğrenci Sayısı', val: `${totalStudents}`, bgColor: [241, 245, 249], textColor: [15, 23, 42] },
    { label: 'Toplam Soru', val: `${totalQuestions}`, bgColor: [238, 242, 255], textColor: [67, 56, 202] },
    { label: 'Toplam Doğru', val: `${totalCorrect}`, bgColor: [236, 253, 245], textColor: [5, 150, 105] },
    { label: 'Toplam Yanlış', val: `${totalWrong}`, bgColor: [255, 241, 242], textColor: [225, 29, 72] },
    { label: 'Ort. Başarı', val: `%${averageRate}`, bgColor: [254, 243, 199], textColor: [180, 83, 9] }
  ];

  metrics.forEach(m => {
    doc.setFillColor(m.bgColor[0], m.bgColor[1], m.bgColor[2]);
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
    doc.setTextColor(m.textColor[0], m.textColor[1], m.textColor[2]);
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
      fillColor: [248, 250, 252]
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      const leftNote = fontLoaded
        ? 'İlkokul Matematik Öğrenci Başarı ve Kazanım Takip Sistemi'
        : cleanTurkishForStandardFont('İlkokul Matematik Öğrenci Başarı ve Kazanım Takip Sistemi');
      doc.text(leftNote, 14, 290);

      doc.text(`Sayfa ${currentPage} / ${pageCount}`, 196, 290, { align: 'right' });
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 286, 196, 286);
    }
  });
}

/**
 * Main export function for PDF generation.
 * Handles both individual student reports (dedicated 1-page A4 format)
 * and full-class roster reports.
 */
export async function exportStudentsToPDF(
  students: Student[],
  gradeTab: number | 'ALL'
): Promise<void> {
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const fontLoaded = await loadFonts(doc);
  const fontName = fontLoaded ? 'LiberationSans' : 'helvetica';

  if (sortedStudents.length === 1) {
    // Dedicated Single A4 Individual Student Report with dynamic Kazanım & Seviye evaluation
    generateIndividualStudentReport(doc, sortedStudents[0], gradeTab, fontLoaded, fontName);
  } else {
    // Class Roster Overview Report
    generateClassRosterReport(doc, sortedStudents, gradeTab, fontLoaded, fontName);
  }

  // SAVE FILE
  const fileSuffix = sortedStudents.length === 1
    ? `${sortedStudents[0].name.toLowerCase().replace(/\s+/g, '_')}_seviye_raporu`
    : (gradeTab === 'ALL' ? 'tum_siniflar' : `${gradeTab}_sinif`);
  const dateFileFormat = new Date().toLocaleDateString('tr-TR').replace(/\./g, '_');
  const fileName = `ogrenci_raporu_${fileSuffix}_${dateFileFormat}.pdf`;

  doc.save(fileName);
}

/**
 * Direct shortcut to export an individual student's 1-page report
 */
export async function exportIndividualStudentPDF(student: Student): Promise<void> {
  await exportStudentsToPDF([student], student.grade);
}
