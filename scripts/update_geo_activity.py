with open('src/components/GeometrikSekilleriBulActivity.tsx', 'r') as f:
    text = f.read()

# Make the two top bars conditional only on activePlayerMode !== 1
old_header_start = text.find('      {/* ===================================================================== */}\n      {/* 1. ÜST HEADER: SKOR, CANLAR VE MOD DETAYLARI */}\n      {/* ===================================================================== */}\n      <div className="shrink-0 w-full bg-slate-900/95')
assert old_header_start != -1, 'Header start not found'

old_game_area_start = text.find('      {/* ===================================================================== */}\n      {/* 3. OYUN ALANI (ORTA ALAN) */}\n      {/* ===================================================================== */}')
assert old_game_area_start != -1, 'Game area start not found'

header_block = text[old_header_start:old_game_area_start]
new_header_block = '      {activePlayerMode !== 1 && (\n        <>\n    ' + header_block.strip() + '\n        </>\n      )}\n\n'
text = text[:old_header_start] + new_header_block + text[old_game_area_start:]

# Now replace the activePlayerMode === 1 block inside the game area
old_single_start = text.find('        {/* =================================================================== */}\n        {/* A) 1 OYUNCU (TEK KİŞİLİK) MERKEZİ OYUN DÜZENİ */}\n        {/* =================================================================== */}\n        {activePlayerMode === 1 ? (')
assert old_single_start != -1, 'Single start not found'

old_multi_start = text.find('        ) : (\n          /* =================================================================== */\n          /* B) 2 VE 3 OYUNCU (KAPIŞMA / ŞEKLE GÖRE YARIŞMA) DÜZENİ */')
assert old_multi_start != -1, 'Multi start not found'

new_single_block = '''        {/* =================================================================== */}
        {/* A) 1 OYUNCU (TEK KİŞİLİK) MERKEZİ OYUN DÜZENİ - STANDART FORMAT */}
        {/* =================================================================== */}
        {activePlayerMode === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
            <div className="flex-1 w-full max-w-xl lg:max-w-2xl flex flex-col justify-center min-h-0 z-10 shrink">
              <div className="flex-1 flex flex-col p-2 sm:p-3 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                  <div className="flex items-center gap-1.5 min-w-0 h-full">
                    {p1Student ? (
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${p1Student.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                        title={`Aktif Öğrenci: ${p1Student.name}`}
                      >
                        {p1Student.avatar}
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-blue-400 text-blue-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                        1
                      </div>
                    )}
                    <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-4 border-l-blue-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center min-w-0">
                        <span className="font-black text-xs text-blue-200 uppercase tracking-wide truncate">
                          {p1Student ? p1Student.name : '1. GRUP'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                          • Geometrik Cisimleri Bul
                        </span>
                      </div>
                      <img src="/MENUIKON/grid_icon_24.png" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 h-full">
                    <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                      <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                        {player1Score} / {TARGET_WIN_SCORE}
                      </span>
                      <div className="flex items-center gap-1 px-1">
                        {[0, 1, 2].map((idx) => (
                          <span key={idx} className={`text-xs sm:text-sm transition-all ${idx < (MAX_MISTAKES - player1Mistakes) ? 'text-rose-500 scale-100' : 'text-slate-600 opacity-30 grayscale'}`}>
                            ❤️
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                  <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-2 sm:p-2.5 flex flex-col items-center justify-between text-center overflow-hidden min-h-0 w-full">
                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                    {/* Soru Başlığı Bandı */}
                    <div className="relative z-10 flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/70 border border-amber-400/50 shadow-sm shrink-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center p-0.5">
                        <Solid3DIcon solidType={targetSolidType} className="w-full h-full object-contain" size={20} />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wide">
                        🎯 Hangisi bir <span className="text-amber-400 underline">{targetSolidDef?.name || 'Geometrik Cisim'}</span> modelidir?
                      </span>
                    </div>

                    {/* Geri Bildirim Mesajı (varsa) */}
                    {singleFeedback.message && (
                      <div className={`relative z-10 shrink-0 px-3 py-0.5 rounded-full text-xs font-black animate-fadeIn ${
                        singleFeedback.status === 'correct' 
                          ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300' 
                          : 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-300 animate-shake'
                      }`}>
                        {singleFeedback.message}
                      </div>
                    )}

                    {/* 3x3 KARE KART (ŞIKLAR ALANI) */}
                    <div className="relative z-10 w-full max-w-[min(88vw,44vh,340px)] aspect-square bg-white rounded-2xl border-4 border-slate-900 shadow-xl overflow-hidden p-1.5 sm:p-2 my-auto">
                      <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5 w-full h-full">
                        {singleCardItems.map((item, idx) => {
                          const isSelectedCorrect = singleFeedback.status === 'correct' && singleFeedback.itemId === item.id;
                          const isSelectedWrong = singleFeedback.status === 'wrong' && singleFeedback.itemId === item.id;

                          return (
                            <button
                              key={`single-${item.id}-${idx}`}
                              onClick={() => handleSingleItemClick(item)}
                              className={`relative aspect-square rounded-xl border-2 transition-all active:scale-95 hover:scale-102 flex flex-col items-center justify-center p-1 cursor-pointer select-none group shadow-xs ${
                                isSelectedCorrect
                                  ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-400 animate-bounce z-20 shadow-xl'
                                  : isSelectedWrong
                                  ? 'bg-rose-100 border-rose-500 ring-4 ring-rose-400 animate-shake z-20'
                                  : 'bg-slate-50 hover:bg-amber-50/90 border-slate-200 hover:border-amber-400 hover:shadow-md'
                              }`}
                              title={item.name}
                            >
                              <div className="w-full flex-1 flex items-center justify-center min-h-0 pointer-events-none p-0.5">
                                {renderItemGraphic(item, "max-w-[50px] max-h-[50px]")}
                              </div>
                              <div className="w-full shrink-0 text-center px-0.5 mt-0.5">
                                <span className="block text-[8px] sm:text-[9.5px] font-black text-slate-800 uppercase tracking-tight truncate group-hover:text-amber-700">
                                  {item.name}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>'''

text = text[:old_single_start] + new_single_block + text[old_multi_start:]

with open('src/components/GeometrikSekilleriBulActivity.tsx', 'w') as f:
    f.write(text)
print('Geo activity updated successfully!')
