with open('src/components/Dedektif5N1KGame.tsx', 'r') as f:
    text = f.read()

header_start = text.find('      {/* Dedektif Header Removed */}\n')
header_end = text.find('</header>\n\n') + len('</header>\n\n')

# Remove the header
text = text[:header_start] + text[header_end:]

# Now replace the playerMode === 1 section inside <main>
old_main_start = text.find('        {/* Story & Questions Area: 1, 2, or 3 columns */}\n        <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${')

new_single_mode = """        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentQ = questions[sPlayer.questionIndex % questions.length];
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              <div className="flex-1 w-full max-w-xl lg:max-w-2xl flex flex-col justify-center min-h-0 z-10 shrink">
                <div className="flex-1 flex flex-col p-2 sm:p-3 bg-[#0b1328] border-2 border-blue-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(59,130,246,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                  {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                    <div className="flex items-center gap-1.5 min-w-0 h-full">
                      {sStudent ? (
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${sStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                          title={`Aktif Öğrenci: ${sStudent.name}`}
                        >
                          {sStudent.avatar}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-blue-400 text-blue-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                          1
                        </div>
                      )}
                      <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-4 border-l-blue-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center min-w-0">
                          <span className="font-black text-xs text-blue-200 uppercase tracking-wide truncate">
                            {sStudent ? sStudent.name : '1. GRUP'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                            • 5N1K Dedektifi
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_31.png" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.questionIndex + 1}/5
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: 100% OPAQUE SOLID QUESTION CONTAINER */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <div className="relative flex-1 rounded-2xl sm:rounded-3xl bg-[#060a14] border-2 border-slate-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.08)] p-2.5 sm:p-3.5 flex flex-col justify-between overflow-hidden min-h-0 w-full">
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

                      {/* Vaka Metni */}
                      <div className="relative z-10 bg-black/60 border border-indigo-400/40 rounded-xl p-2 sm:p-2.5 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 mb-0.5">
                          <span>🔍</span>
                          <span className="uppercase tracking-wider">{currentQ.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-100 font-semibold line-clamp-3">
                          "{currentQ.story}"
                        </p>
                      </div>

                      {/* Soru Rozeti & Cümlesi */}
                      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-1 text-center">
                        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase shadow-sm shrink-0">
                          {currentQ.qTypeLabel}
                        </span>
                        <h3 className="text-sm sm:text-base md:text-lg font-black text-amber-200 leading-snug drop-shadow-sm">
                          {currentQ.question}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM: ŞIKLAR (2x2 GRID) */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full shrink-0 mt-1">
                    {currentQ.options.map((opt, oIdx) => {
                      const isChosen = sPlayer.selectedOption === opt;
                      const isRight = opt === currentQ.correctAnswer;
                      let btnStyle = "border-2 border-blue-500/35 bg-gradient-to-b from-[#18263e] via-[#131f33] to-[#0d1626] hover:from-[#1e304f] hover:via-[#17273f] hover:to-[#101c2f] hover:border-blue-400/70 text-blue-50 shadow-md";

                      if (sPlayer.showFeedback) {
                        if (isRight) {
                          btnStyle = 'ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 text-white shadow-md scale-102';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 text-white shadow-md';
                        } else {
                          btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={sPlayer.showFeedback}
                          onClick={() => handleOptionClick(0, opt)}
                          className={`fast-quiz-btn relative flex items-center justify-between px-3 py-2 min-h-[46px] sm:min-h-[52px] rounded-2xl border-2 transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                          <span className="relative text-xs sm:text-sm md:text-base font-black truncate max-w-full text-left">
                            {opt}
                          </span>
                          {sPlayer.showFeedback && isRight && (
                            <CheckCircle2 size={16} className="text-emerald-300 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          );
        })() : (
        <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${"""

assert old_main_start != -1, 'Main start not found'
text = text[:old_main_start] + new_single_mode + text[old_main_start + len('        {/* Story & Questions Area: 1, 2, or 3 columns */}\n        <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${'):]

# Also close the ternary expression after </main>
closing_idx = text.rfind('        </div>\n      </main>')
assert closing_idx != -1, 'Closing div not found'
text = text[:closing_idx] + '        </div>\n        )}\n      </main>' + text[closing_idx + len('        </div>\n      </main>'):]

with open('src/components/Dedektif5N1KGame.tsx', 'w') as f:
    f.write(text)
print('Dedektif updated successfully!')
