import React, { useState, useEffect, useMemo } from 'react'
import { Clock, Calendar, Sun, Moon, Loader2 } from 'lucide-react'

// --- ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ С NPOINT.IO ---
const DATA_URL = 'https://api.npoint.io/ВАШ_ID_СЮДА'; 

const TimetableDisplay = () => {
  // Состояния данных
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния интерфейса
  const [currentShift, setCurrentShift] = useState('morning') 
  const [currentStartIndex, setCurrentStartIndex] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Дни для поиска в JSON
  const dataDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Дни для отображения (Казахский)
  const displayDays = ['Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі'];

  // --- ЗАГРУЗКА ДАННЫХ ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${DATA_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Не удалось загрузить данные');
        const data = await response.json();
        setClasses(data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Фильтрация
  const filteredClasses = useMemo(() => {
    return classes.filter(c => c.shift === currentShift)
  }, [currentShift, classes])

  useEffect(() => {
    setCurrentStartIndex(0)
  }, [currentShift])

  // Авто-ротация
  useEffect(() => {
    if (filteredClasses.length === 0) return
    const interval = setInterval(() => {
      setCurrentStartIndex((prev) => (prev + 6) % filteredClasses.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [filteredClasses.length])

  // Время
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('kk-KZ', {
      hour: '2-digit', minute: '2-digit', hour12: false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('kk-KZ', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  // Пагинация
  const visibleCount = 6
  const visibleClasses = useMemo(() => {
    if (filteredClasses.length === 0) return []
    return Array.from({ length: visibleCount }).map((_, i) =>
      filteredClasses[(currentStartIndex + i) % filteredClasses.length]
    )
  }, [filteredClasses, currentStartIndex])

  const totalPages = Math.ceil(filteredClasses.length / visibleCount) || 1
  const currentPage = Math.floor(currentStartIndex / visibleCount)

  // --- ЭКРАНЫ ЗАГРУЗКИ/ОШИБКИ ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
         <div className="text-white text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-300" />
            <p className="text-2xl font-medium">Кесте жүктелуде...</p>
         </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
         <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl text-white text-center border border-red-400/30">
            <p className="text-2xl font-bold mb-2 text-red-300">Қате!</p>
            <p className="text-lg">{error}</p>
         </div>
      </div>
    )
  }

  // --- ОСНОВНОЙ РЕНДЕР ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4 md:p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">Сабақ кестесі</h1>
            
            {/* Смены */}
            <div className="flex bg-blue-950/50 p-1.5 rounded-xl w-fit border border-white/10">
              <button
                onClick={() => setCurrentShift('morning')}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-bold text-base md:text-lg ${
                  currentShift === 'morning' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Sun className="w-6 h-6" />
                Таңертең
              </button>
              <button
                onClick={() => setCurrentShift('afternoon')}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-bold text-base md:text-lg ${
                  currentShift === 'afternoon' 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Moon className="w-6 h-6" />
                Күндіз
              </button>
            </div>
          </div>

          <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-end">
            <div className="flex items-center gap-4 text-white mb-1">
              <Clock className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-3xl md:text-5xl font-bold font-mono tracking-wider">{formatTime(currentTime)}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-lg md:text-xl capitalize font-medium">{formatDate(currentTime)}</span>
              </div>
              <p className="text-sm md:text-base text-blue-300 mt-2 hidden md:block opacity-80">
                Бет {currentPage + 1} / {totalPages}
              </p>
            </div>
          </div>
        </div>

        {/* КНОПКИ ДНЕЙ НЕДЕЛИ */}
        <div className="flex gap-3 flex-wrap mt-4 border-t border-white/10 pt-5 justify-center md:justify-start">
          {displayDays.map((dayName, index) => (
            <button
              key={dayName}
              onClick={() => setCurrentDay(index)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm md:text-xl transition-all ${
                currentDay === index
                  ? 'bg-white text-blue-900 shadow-lg scale-105 ring-2 ring-blue-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {dayName}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка расписания */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {visibleClasses.map((cls, idx) => {
            if (!cls) return null;
            
            const currentDayKey = dataDays[currentDay];
            const schedule = cls.timetable[currentDayKey] || [];
            
            return (
              <div
                key={`${cls.name}-${idx}`}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/10 hover:bg-white/15 transition-all flex flex-col h-full"
              >
                {/* ЗАГОЛОВОК КАРТОЧКИ */}
                <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
                  <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-wider pl-1 drop-shadow-md">
                        {cls.name} <span className="text-blue-200 text-xl md:text-2xl font-medium normal-case ml-1">сыныбы</span>
                      </h2>
                  </div>
                  <div className="text-sm font-bold text-blue-900 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                   {schedule.length} сабақ
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {schedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-blue-200/60">
                       <p className="text-lg italic">Бұл күнде сабақ жоқ</p>
                    </div>
                  ) : (
                    schedule.map((lesson, i) => (
                      <div key={i} className="flex items-center gap-4 group bg-black/20 p-3 rounded-xl border border-transparent hover:border-white/20 transition-all">
                        
                        {/* Время (УВЕЛИЧЕНО) */}
                        <div className="min-w-[100px] md:min-w-[110px] bg-blue-600 group-hover:bg-blue-500 text-white rounded-lg py-2 px-1 font-mono text-base md:text-lg font-bold text-center shadow-lg transition-colors border border-blue-400/30 flex items-center justify-center self-stretch">
                          {lesson.time}
                        </div>
                        
                        {/* Предмет и детали (УВЕЛИЧЕНО) */}
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="text-lg md:text-xl text-white font-bold leading-tight break-words drop-shadow-sm">
                            {lesson.subject}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 items-center">
                            {lesson.teacher && (
                                <span className="text-sm md:text-base text-blue-100 font-medium bg-blue-500/10 px-1.5 rounded">
                                    {lesson.teacher}
                                </span>
                            )}
                            {lesson.room && (
                                <span className="text-xs md:text-sm text-white/70 font-mono bg-white/10 px-1.5 rounded border border-white/10">
                                    Каб. {lesson.room}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 opacity-80">
          <div className="bg-white/10 p-8 rounded-full mb-6 ring-4 ring-white/5">
             <Sun className="w-16 h-16 text-yellow-300 animate-pulse" />
          </div>
          <div className="text-center text-white text-2xl font-bold">
             Таңдалған ауысымға сабақ кестесі жоқ
          </div>
        </div>
      )}

      {/* Индикаторы страниц */}
      <div className="flex justify-center items-center gap-4 pb-8 mt-4">
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <button
            key={pageIndex}
            onClick={() => setCurrentStartIndex(pageIndex * visibleCount)}
            className={`rounded-full transition-all duration-300 ${
              pageIndex === currentPage 
                ? 'w-10 h-4 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                : 'w-4 h-4 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to page ${pageIndex + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TimetableDisplay