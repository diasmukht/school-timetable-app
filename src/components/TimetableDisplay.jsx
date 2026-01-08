import React, { useState, useEffect, useMemo } from 'react'
import { Clock, Calendar, Sun, Moon, Loader2 } from 'lucide-react'

const DATA_URL = 'https://api.npoint.io/6bc04583502766e44c7a';

const TimetableDisplay = () => {

  const [classes, setClasses] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

 
  const [currentShift, setCurrentShift] = useState('morning') 
  const [currentStartIndex, setCurrentStartIndex] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await fetch(`${DATA_URL}?t=${new Date().getTime()}`);
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные расписания');
        }

        const data = await response.json();
        setClasses(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const filteredClasses = useMemo(() => {
    return classes.filter(c => c.shift === currentShift)
  }, [currentShift, classes])

  
  useEffect(() => {
    setCurrentStartIndex(0)
  }, [currentShift])

 
  useEffect(() => {
    if (filteredClasses.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentStartIndex((prev) => (prev + 6) % filteredClasses.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [filteredClasses.length])


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


  const visibleCount = 6
  const visibleClasses = useMemo(() => {
    if (filteredClasses.length === 0) return []
    return Array.from({ length: visibleCount }).map((_, i) =>
      filteredClasses[(currentStartIndex + i) % filteredClasses.length]
    )
  }, [filteredClasses, currentStartIndex])

  const totalPages = Math.ceil(filteredClasses.length / visibleCount) || 1
  const currentPage = Math.floor(currentStartIndex / visibleCount)



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
         <div className="text-white text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-300" />
            <p className="text-xl font-medium">Кесте жүктелуде...</p>
         </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
         <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white text-center border border-red-400/30">
            <p className="text-xl font-bold mb-2 text-red-300">Қате!</p>
            <p>{error}</p>
            <p className="text-sm mt-4 text-white/50">Интернетті тексеріп, қайта кіріңіз</p>
         </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4 md:p-8">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl border border-white/20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Сабақ кестесі</h1>
            
            {/* КНОПКИ ПЕРЕКЛЮЧЕНИЯ СМЕН */}
            <div className="flex bg-blue-950/50 p-1 rounded-xl w-fit border border-white/10">
              <button
                onClick={() => setCurrentShift('morning')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm md:text-base ${
                  currentShift === 'morning' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                Таңертең (1 смена)
              </button>
              <button
                onClick={() => setCurrentShift('afternoon')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm md:text-base ${
                  currentShift === 'afternoon' 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                Күндіз (2 смена)
              </button>
            </div>
          </div>

          <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-end md:items-end">
            <div className="flex items-center gap-3 text-white mb-1">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xl md:text-2xl font-bold">{formatTime(currentTime)}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-blue-200">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base capitalize">{formatDate(currentTime)}</span>
              </div>
              <p className="text-xs md:text-sm text-blue-300 mt-2 hidden md:block">
                Стр. {currentPage + 1} из {totalPages}
              </p>
            </div>
          </div>
        </div>

        {/* Day selection buttons */}
        <div className="flex gap-2 flex-wrap mt-4 border-t border-white/10 pt-4 justify-center md:justify-start">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setCurrentDay(index)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-xs md:text-lg transition-all ${
                currentDay === index
                  ? 'bg-white text-blue-900 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of classes */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {visibleClasses.map((cls, idx) => {
          
            if (!cls) return null;
            
            const schedule = cls.timetable[days[currentDay]] || []
            
            return (
              <div
                key={`${cls.name}-${idx}`}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/10 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 text-blue-200 font-bold w-10 h-10 rounded-full flex items-center justify-center border border-blue-400/30">
                         {cls.name.replace(/\D/g, '')}
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white uppercase">{cls.name}</h2>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-blue-900 bg-white/90 px-2 py-1 rounded">
                   {schedule.length} сабақ
                  </div>
                </div>

                <div className="space-y-2">
                  {schedule.length === 0 ? (
                    <p className="text-blue-200 italic p-4 text-center text-sm">Бұл күнде сабақ жоқ.</p>
                  ) : (
                    schedule.map((lesson, i) => (
                      <div key={i} className="flex items-start gap-3 group bg-black/20 p-2 rounded-lg">
                        <div className="min-w-[70px] bg-blue-600/80 group-hover:bg-blue-500 text-white rounded-md py-1 px-1 font-mono text-xs md:text-sm text-center shadow-sm transition-colors border border-blue-400/30 flex items-center justify-center h-full">
                          {lesson.time}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm md:text-base text-white font-semibold leading-tight break-words">{lesson.subject}</div>
                          {lesson.teacher && <div className="text-xs text-blue-200 mt-0.5 truncate">{lesson.teacher}</div>}
                          {lesson.room && <div className="text-[10px] text-white/50 mt-0.5">Каб. {lesson.room}</div>}
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
        <div className="flex flex-col items-center justify-center mt-20 opacity-70">
          <div className="bg-white/10 p-6 rounded-full mb-4">
             <Sun className="w-12 h-12 text-yellow-300" />
          </div>
          <div className="text-center text-white text-xl font-medium">
             Таңдалған сменаға сабақ кестесі жоқ
          </div>
        </div>
      )}

      {/* Pagination dots */}
      <div className="flex justify-center items-center gap-3 pb-8">
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <button
            key={pageIndex}
            onClick={() => setCurrentStartIndex(pageIndex * visibleCount)}
            className={`h-3 rounded-full transition-all ${
              pageIndex === currentPage 
                ? 'w-8 bg-white shadow-lg' 
                : 'w-3 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to page ${pageIndex + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TimetableDisplay