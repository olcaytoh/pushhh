// Tam ekrandan çıkmadan kayıtlı/son PDF'leri ve bağlı klasörlerdeki PDF'leri açan akıllı tahta uyumlu pencere
import React, { useCallback, useEffect, useState } from 'react';
import type { FileSystemFileHandleLike } from '../types/pdf';
import {
  deleteLibraryPdf,
  deleteLinkedFolder,
  listLibraryPdfs,
  listLinkedFolders,
  loadLibraryPdf,
  pickAndSavePdfFolder,
  readDirectoryPdfs,
  supportsDirectoryPicker,
  type DirectoryPdfItem,
  type FileSystemDirectoryHandleLike,
  type LinkedFolderRecord,
  type StoredPdfMeta,
} from '../utils/pdfLibrary';
import {
  ChevronLeftIcon,
  CloseIcon,
  FolderOpenIcon,
  PdfDocIcon,
  TrashIcon,
} from './Icons';

export interface PdfPickerModalProps {
  isOpen: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onOpenLoadedFile: (file: File, handle: FileSystemFileHandleLike | null) => Promise<void>;
  onOpenNativePicker: () => void;
  onBeforeNativeDialog: () => void;
  onAfterNativeDialog: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatShortDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export const PdfPickerModal: React.FC<PdfPickerModalProps> = ({
  isOpen,
  isFullscreen,
  onClose,
  onOpenLoadedFile,
  onOpenNativePicker,
  onBeforeNativeDialog,
  onAfterNativeDialog,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'folders'>('recent');
  const [recentPdfs, setRecentPdfs] = useState<StoredPdfMeta[]>([]);
  const [linkedFolders, setLinkedFolders] = useState<LinkedFolderRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Klasör gezinme durumu
  const [activeFolderRecord, setActiveFolderRecord] = useState<LinkedFolderRecord | null>(null);
  const [dirStack, setDirStack] = useState<FileSystemDirectoryHandleLike[]>([]);
  const [subfolders, setSubfolders] = useState<FileSystemDirectoryHandleLike[]>([]);
  const [folderPdfs, setFolderPdfs] = useState<DirectoryPdfItem[]>([]);
  const [dirStatus, setDirStatus] = useState<'idle' | 'loading' | 'ok' | 'permission-required' | 'error'>('idle');
  const [isDragOver, setIsDragOver] = useState(false);

  const canLinkFolder = supportsDirectoryPicker();

  const openDirectory = useCallback(
    async (
      handle: FileSystemDirectoryHandleLike,
      nextStack: FileSystemDirectoryHandleLike[],
      requestPerm: boolean,
    ) => {
      setDirStatus('loading');
      setStatusMessage(null);
      const res = await readDirectoryPdfs(handle, requestPerm);
      if (res.status === 'ok') {
        setDirStack(nextStack);
        setSubfolders(res.subfolders);
        setFolderPdfs(res.pdfFiles);
        setDirStatus('ok');
      } else if (res.status === 'permission-required') {
        setDirStack(nextStack);
        setSubfolders([]);
        setFolderPdfs([]);
        setDirStatus('permission-required');
      } else {
        setDirStack(nextStack);
        setSubfolders([]);
        setFolderPdfs([]);
        setDirStatus('error');
        setStatusMessage('Klasör içeriği okunamadı. İzin verilmemiş veya klasör taşınmış olabilir.');
      }
    },
    [],
  );

  const refreshLibrary = useCallback(async () => {
    setIsLoadingList(true);
    setStatusMessage(null);
    const [pdfs, folders] = await Promise.all([listLibraryPdfs(), listLinkedFolders()]);
    setRecentPdfs(pdfs);
    setLinkedFolders(folders);

    if (folders.length > 0 && pdfs.length === 0) {
      setActiveTab('folders');
    }
    if (folders.length > 0) {
      const first = folders[0];
      setActiveFolderRecord((prev) => {
        const stillExists = prev ? folders.find((f) => f.id === prev.id) : null;
        return stillExists || first;
      });
    } else {
      setActiveFolderRecord(null);
      setDirStack([]);
      setSubfolders([]);
      setFolderPdfs([]);
      setDirStatus('idle');
    }
    setIsLoadingList(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery('');
    setOpeningId(null);
    setIsDragOver(false);
    void refreshLibrary();
  }, [isOpen, refreshLibrary]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'folders' || !activeFolderRecord) return;
    void openDirectory(activeFolderRecord.handle, [activeFolderRecord.handle], false);
  }, [isOpen, activeTab, activeFolderRecord, openDirectory]);

  if (!isOpen) return null;

  const handleOpenRecent = async (item: StoredPdfMeta) => {
    setOpeningId(item.id);
    setStatusMessage(null);
    try {
      const loaded = await loadLibraryPdf(item.id);
      if (!loaded) {
        setStatusMessage('Bu PDF kaydı bulunamadı.');
        setOpeningId(null);
        return;
      }
      onClose();
      await onOpenLoadedFile(loaded.file, loaded.handle);
    } catch {
      setStatusMessage('PDF açılırken bir hata oluştu.');
    } finally {
      setOpeningId(null);
    }
  };

  const handleDeleteRecent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteLibraryPdf(id);
    setRecentPdfs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLinkFolder = async () => {
    setStatusMessage(null);
    onBeforeNativeDialog();
    const res = await pickAndSavePdfFolder();
    onAfterNativeDialog();

    if (res.status === 'added') {
      const folders = await listLinkedFolders();
      setLinkedFolders(folders);
      setActiveFolderRecord(res.folder);
      setActiveTab('folders');
      await openDirectory(res.folder.handle, [res.folder.handle], true);
      return;
    }

    if (res.status === 'blocked') {
      setStatusMessage(
        'Önizleme çerçevesinde klasör bağlama kısıtlıdır; uygulamayı yeni sekmede açtığınızda klasör bağlayabilirsiniz.',
      );
    } else if (res.status === 'unsupported') {
      setStatusMessage('Bu tarayıcı klasör bağlamayı desteklemiyor. Son PDF’ler listesini kullanabilirsiniz.');
    }
  };

  const handleRemoveFolder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteLinkedFolder(id);
    const updated = linkedFolders.filter((f) => f.id !== id);
    setLinkedFolders(updated);
    if (activeFolderRecord?.id === id) {
      setActiveFolderRecord(updated[0] || null);
      if (!updated[0]) {
        setDirStack([]);
        setSubfolders([]);
        setFolderPdfs([]);
        setDirStatus('idle');
      }
    }
  };

  const handleOpenFolderPdf = async (item: DirectoryPdfItem) => {
    setOpeningId(`dir:${item.name}`);
    setStatusMessage(null);
    try {
      const file = await item.handle.getFile();
      onClose();
      await onOpenLoadedFile(file, item.handle);
    } catch {
      setStatusMessage(`"${item.name}" açılamadı.`);
    } finally {
      setOpeningId(null);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecent = normalizedQuery
    ? recentPdfs.filter((p) => p.name.toLowerCase().includes(normalizedQuery))
    : recentPdfs;
  const filteredSubfolders = normalizedQuery
    ? subfolders.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
    : subfolders;
  const filteredFolderPdfs = normalizedQuery
    ? folderPdfs.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
    : folderPdfs;

  const currentDirHandle = dirStack[dirStack.length - 1] || activeFolderRecord?.handle || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PDF Seç"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            onClose();
            void onOpenLoadedFile(file, null);
          }
        }}
        className={`bg-white rounded-2xl shadow-2xl border-2 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-800 transition-colors ${
          isDragOver ? 'border-blue-500 ring-4 ring-blue-200' : 'border-slate-200'
        }`}
      >
        {/* Başlık */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FolderOpenIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  PDF Aç
                </h2>
                {isFullscreen && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tam Ekranda Kalır
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Kayıtlı PDF&apos;lerinizden veya bağlı klasörünüzden tam ekrandan çıkmadan seçin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 inline-flex items-center justify-center cursor-pointer shrink-0"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Sekmeler + Arama */}
        <div className="px-5 pt-3.5 pb-2.5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'recent'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Son PDF&apos;ler ({recentPdfs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('folders')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'folders'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF Klasörüm ({linkedFolders.length})
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="PDF adıyla ara..."
            className="flex-1 min-h-[38px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none text-sm text-slate-800"
          />
        </div>

        {/* İçerik Listesi */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[240px]">
          {statusMessage && (
            <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
              {statusMessage}
            </div>
          )}

          {activeTab === 'recent' && (
            <>
              {isLoadingList ? (
                <div className="py-12 text-center text-sm text-slate-400">Yükleniyor...</div>
              ) : filteredRecent.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <PdfDocIcon className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {searchQuery.trim()
                      ? 'Aramanızla eşleşen kayıtlı PDF bulunamadı.'
                      : 'Henüz kayıtlı PDF yok.'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Aşağıdan bir PDF açtığınızda burada otomatik kaydedilir; bir sonraki seferde
                    tam ekrandan hiç çıkmadan tek dokunuşla açabilirsiniz.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredRecent.map((item) => {
                    const isOpening = openingId === item.id;
                    return (
                      <li key={item.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => void handleOpenRecent(item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              void handleOpenRecent(item);
                            }
                          }}
                          className="w-full min-h-[54px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                            <PdfDocIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                              {item.numPages ? <span>{item.numPages} sayfa</span> : null}
                              {item.sizeBytes > 0 ? <span>· {formatFileSize(item.sizeBytes)}</span> : null}
                              <span>· {formatShortDate(item.updatedAt)}</span>
                            </div>
                          </div>
                          {isOpening ? (
                            <span className="text-xs font-bold text-blue-600 px-2">Açılıyor...</span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => void handleDeleteRecent(e, item.id)}
                              title="Listeden kaldır"
                              aria-label="Listeden kaldır"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer shrink-0"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {activeTab === 'folders' && (
            <div className="space-y-3">
              {/* Bağlı klasör sekmeleri + yeni klasör bağla */}
              <div className="flex items-center gap-2 flex-wrap">
                {linkedFolders.map((folder) => {
                  const isActive = activeFolderRecord?.id === folder.id;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setActiveFolderRecord(folder)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveFolderRecord(folder);
                        }
                      }}
                      className={`min-h-[38px] pl-3 pr-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <FolderOpenIcon className="w-4 h-4 shrink-0" />
                      <span className="max-w-[160px] truncate">{folder.name}</span>
                      <button
                        type="button"
                        onClick={(e) => void handleRemoveFolder(e, folder.id)}
                        title="Klasör bağlantısını kaldır"
                        aria-label="Klasör bağlantısını kaldır"
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center cursor-pointer ${
                          isActive ? 'hover:bg-blue-500 text-blue-100' : 'hover:bg-slate-200 text-slate-400'
                        }`}
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {canLinkFolder && (
                  <button
                    type="button"
                    onClick={() => void handleLinkFolder()}
                    className="min-h-[38px] px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpenIcon className="w-4 h-4" />
                    <span>+ PDF Klasörü Bağla</span>
                  </button>
                )}
              </div>

              {linkedFolders.length === 0 ? (
                <div className="py-9 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FolderOpenIcon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Ders PDF Klasörünüzü Bir Kez Bağlayın
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Masaüstü veya ders notları klasörünüzü bir kere seçtiğinizde, içindeki tüm
                      PDF&apos;leri tam ekrandan hiç çıkmadan buradan açabilirsiniz.
                    </p>
                  </div>
                  {canLinkFolder ? (
                    <button
                      type="button"
                      onClick={() => void handleLinkFolder()}
                      className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <FolderOpenIcon className="w-4 h-4" />
                      <span>PDF Klasörü Seç ve Bağla</span>
                    </button>
                  ) : (
                    <p className="text-xs text-amber-700 font-medium">
                      Bu tarayıcıda klasör bağlama desteklenmiyor; &quot;Son PDF&apos;ler&quot;
                      sekmesini kullanabilirsiniz.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Üst klasör / konum çubuğu */}
                  {dirStack.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const prevStack = dirStack.slice(0, -1);
                          const parent = prevStack[prevStack.length - 1];
                          if (parent) {
                            void openDirectory(parent, prevStack, false);
                          }
                        }}
                        className="min-h-[34px] px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                        <span>Üst Klasör</span>
                      </button>
                      <span className="text-xs font-semibold text-slate-500 truncate">
                        {dirStack.map((d) => d.name).join(' / ')}
                      </span>
                    </div>
                  )}

                  {dirStatus === 'loading' && (
                    <div className="py-10 text-center text-sm text-slate-400">
                      Klasör okunuyor...
                    </div>
                  )}

                  {dirStatus === 'permission-required' && currentDirHandle && (
                    <div className="py-8 px-4 text-center rounded-2xl border border-amber-200 bg-amber-50/70 space-y-3">
                      <p className="text-sm font-semibold text-amber-900">
                        &quot;{currentDirHandle.name}&quot; klasörünü okumak için izin gerekiyor.
                      </p>
                      <button
                        type="button"
                        onClick={() => void openDirectory(currentDirHandle, dirStack, true)}
                        className="min-h-[40px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold cursor-pointer"
                      >
                        Klasöre İzin Ver ve Listele
                      </button>
                    </div>
                  )}

                  {dirStatus === 'ok' &&
                    filteredSubfolders.length === 0 &&
                    filteredFolderPdfs.length === 0 && (
                      <div className="py-10 text-center rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-500">
                        Bu klasörde PDF dosyası bulunamadı.
                      </div>
                    )}

                  {dirStatus === 'ok' && (
                    <ul className="space-y-1.5">
                      {filteredSubfolders.map((sub) => (
                        <li key={`sub:${sub.name}`}>
                          <button
                            type="button"
                            onClick={() =>
                              void openDirectory(sub, [...dirStack, sub], false)
                            }
                            className="w-full min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-amber-400 hover:bg-amber-50/60 transition-colors flex items-center gap-3 text-left cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <FolderOpenIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-800 truncate flex-1">
                              {sub.name}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">Klasör</span>
                          </button>
                        </li>
                      ))}

                      {filteredFolderPdfs.map((pdf) => {
                        const isOpening = openingId === `dir:${pdf.name}`;
                        return (
                          <li key={`pdf:${pdf.name}`}>
                            <button
                              type="button"
                              disabled={isOpening}
                              onClick={() => void handleOpenFolderPdf(pdf)}
                              className="w-full min-h-[50px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center gap-3 text-left cursor-pointer disabled:opacity-60"
                            >
                              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                                <PdfDocIcon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-slate-900 truncate flex-1">
                                {pdf.name}
                              </span>
                              {isOpening && (
                                <span className="text-xs font-bold text-blue-600">Açılıyor...</span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alt Bar: Bilgisayardan Yeni PDF Seç */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNativePicker();
              }}
              className="min-h-[44px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <FolderOpenIcon className="w-4 h-4" />
              <span>Bilgisayardan Yeni PDF Seç</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold cursor-pointer"
            >
              Vazgeç
            </button>
          </div>

          {isFullscreen && (
            <p className="text-[11px] text-slate-500 leading-snug">
              Not: Tarayıcı güvenlik kuralı gereği &quot;Bilgisayardan Yeni PDF Seç&quot; sistem
              penceresini açarken tam ekrandan geçici olarak çıkabilir; dosya seçilince tam ekrana
              otomatik dönülür. Hiç çıkmamak için yukarıdan kayıtlı PDF&apos;leri veya bağlı
              klasörünüzü kullanabilirsiniz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
