import React, { useState, useEffect, useMemo } from 'react'
import { Clock, Calendar, Sun, Moon } from 'lucide-react'
import classes from '../data/classes'

const TimetableDisplay = () => {
  // Состояние для выбранной смены ('morning' или 'afternoon')
  const [currentShift, setCurrentShift] = useState('morning') 
  
  const [currentStartIndex, setCurrentStartIndex] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // 1. ФИЛЬТРАЦИЯ: Получаем классы только для выбранной смены
  const filteredClasses = useMemo(() => {
    return classes.filter(c => c.shift === currentShift)
  }, [currentShift])

  // Сбрасываем страницу на первую при смене фильтра (утро/день)
  useEffect(() => {
    setCurrentStartIndex(0)
  }, [currentShift])

  // Авто-ротация страниц (теперь используем filteredClasses.length)
  useEffect(() => {
    if (filteredClasses.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentStartIndex((prev) => (prev + 6) % filteredClasses.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [filteredClasses.length])

  // Обновление времени
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  // Получаем 6 видимых классов из ОТФИЛЬТРОВАННОГО списка
  const visibleCount = 6
  const visibleClasses = useMemo(() => {
    if (filteredClasses.length === 0) return []
    return Array.from({ length: visibleCount }).map((_, i) =>
      filteredClasses[(currentStartIndex + i) % filteredClasses.length]
    )
  }, [filteredClasses, currentStartIndex])

  const totalPages = Math.ceil(filteredClasses.length / visibleCount) || 1
  const currentPage = Math.floor(currentStartIndex / visibleCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl border border-white/20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Сабақ кестесі</h1>
            
            {/* КНОПКИ ПЕРЕКЛЮЧЕНИЯ СМЕН */}
            <div className="flex bg-blue-950/50 p-1 rounded-xl w-fit border border-white/10">
              <button
                onClick={() => setCurrentShift('morning')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  currentShift === 'afternoon' 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                Күндіз (2 смена)
              </button>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-3 text-white mb-1">
              <Clock className="w-6 h-6" />
              <span className="text-2xl font-bold">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center justify-end gap-3 text-blue-200">
              <Calendar className="w-5 h-5" />
              <span className="text-sm md:text-base">{formatDate(currentTime)}</span>
            </div>
            <p className="text-sm text-blue-300 mt-2">
              Стр. {currentPage + 1} из {totalPages}
            </p>
          </div>
        </div>

        {/* Day selection buttons */}
        <div className="flex gap-2 flex-wrap mt-4 border-t border-white/10 pt-4">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setCurrentDay(index)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm md:text-lg transition-all ${
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
            // Защита от undefined, если данные меняются на лету
            if (!cls) return null;
            
            const schedule = cls.timetable[days[currentDay]] || []
            
            return (
              <div
                key={`${cls.name}-${idx}`}
                className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/10 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Класс {cls.name}</h2>
                    <p className="text-sm text-blue-200">{days[currentDay]}</p>
                  </div>
                  <div className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded">
                   {schedule.length} Сабақ
                  </div>
                </div>

                <div className="space-y-3">
                  {schedule.length === 0 ? (
                    <p className="text-blue-200 italic p-2">Бұл күнде оқу кестесі жоқ.</p>
                  ) : (
                    schedule.map((lesson, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="min-w-[86px] bg-blue-600/80 group-hover:bg-blue-600 text-white rounded-lg px-2 py-2 font-bold text-sm text-center shadow-sm transition-colors border border-blue-400/30">
                          {lesson.time}
                        </div>
                        <div className="flex-1">
                          <div className="text-lg text-white font-semibold leading-tight">{lesson.subject}</div>
                          {lesson.teacher && <div className="text-sm text-blue-200">{lesson.teacher}</div>}
                          {lesson.room && <div className="text-xs text-white/60 mt-0.5">Каб. {lesson.room}</div>}
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
        <div className="text-center text-white text-xl mt-10 opacity-70">
          Таңдалған сменаға сабақ кестесі жоқ.
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
                ? 'w-8 bg-white' 
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