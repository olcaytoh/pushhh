export interface SchoolSettings {
  schoolName: string;
  teacherName: string;
  className: string;
  reportStartDate: string;
  logoPath: string;
}

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'Çayırova Akçakoca İlkokulu',
  teacherName: 'Mustafa HAYAT',
  className: '2-C',
  reportStartDate: '01.09.2026',
  logoPath: '/cayirova-akcakoca-logo.png'
};

export const SCHOOL_SETTINGS_STORAGE_KEY = 'schoolReportSettings_v1';

export function loadSchoolSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(SCHOOL_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SCHOOL_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SchoolSettings>;
    return {
      ...DEFAULT_SCHOOL_SETTINGS,
      ...parsed,
      schoolName: String(parsed.schoolName ?? DEFAULT_SCHOOL_SETTINGS.schoolName),
      teacherName: String(parsed.teacherName ?? DEFAULT_SCHOOL_SETTINGS.teacherName),
      className: String(parsed.className ?? DEFAULT_SCHOOL_SETTINGS.className),
      reportStartDate: String(parsed.reportStartDate ?? DEFAULT_SCHOOL_SETTINGS.reportStartDate),
      logoPath: String(parsed.logoPath ?? DEFAULT_SCHOOL_SETTINGS.logoPath)
    };
  } catch {
    return DEFAULT_SCHOOL_SETTINGS;
  }
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  localStorage.setItem(SCHOOL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}