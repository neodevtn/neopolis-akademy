import { useState, useRef, useEffect, useCallback } from "react";
import { PlayCircle, PauseCircle, SkipForward, SkipBack, Volume2 } from "lucide-react";

interface ProjectorSlide {
  number: number;
  title: string;
  type: string;
  script: string;
  images: { alt: string; url: string }[];
  content: string;
  contentLeft: string;
  contentRight: string;
  instructorName?: string;
  instructorTitle?: string;
  technology?: string;
}

interface ProjectorTiming {
  time: number;
  slideIndex: number;
  fragment: number;
}

interface ProjectorPlayerProps {
  mp4Url: string;
  slides: ProjectorSlide[];
  timings: ProjectorTiming[];
  duration: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function ProjectorPlayer({ mp4Url, slides, timings, duration, onPlay, onPause, onEnded }: ProjectorPlayerProps) {
  const audioRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const animRef = useRef<number>(0);

  // Compute current slide based on time
  const computeSlideIndex = useCallback((time: number) => {
    let slideIdx = 0;
    for (let i = timings.length - 1; i >= 0; i--) {
      if (time >= timings[i].time) {
        slideIdx = timings[i].slideIndex;
        break;
      }
    }
    return Math.min(slideIdx, slides.length - 1);
  }, [timings, slides.length]);

  // Update current time and slide during playback
  useEffect(() => {
    const update = () => {
      if (audioRef.current) {
        const t = audioRef.current.currentTime;
        setCurrentTime(t);
        setCurrentSlideIndex(computeSlideIndex(t));
      }
      if (isPlaying) {
        animRef.current = requestAnimationFrame(update);
      }
    };
    if (isPlaying) {
      animRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, computeSlideIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const goToSlide = (idx: number) => {
    if (!audioRef.current || idx < 0 || idx >= slides.length) return;
    // Find the timing for this slide
    const timing = timings.find(t => t.slideIndex === idx && t.fragment === -1);
    if (timing) {
      audioRef.current.currentTime = timing.time;
      setCurrentTime(timing.time);
      setCurrentSlideIndex(idx);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onPause?.();
    onEnded?.();
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
      setCurrentSlideIndex(computeSlideIndex(t));
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Slide Display Area */}
      {/* Slide Display Area — clickable overlay to toggle play/pause */}
      <div
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 min-h-[320px] flex items-center justify-center p-6 cursor-pointer group"
        onClick={togglePlay}
        role="button"
        aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePlay(); } }}
      >
        <SlideRenderer slide={currentSlide} slideNumber={currentSlideIndex + 1} totalSlides={slides.length} />
        {/* Center play/pause overlay */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {isPlaying
              ? <PauseCircle className="w-10 h-10 text-white" />
              : <PlayCircle className="w-10 h-10 text-white" />}
          </div>
        </div>
      </div>

      {/* Hidden video element (we use it for audio + the rare visual frames) */}
      <video
        ref={audioRef}
        src={mp4Url}
        preload="metadata"
        playsInline
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => { setIsPlaying(true); onPlay?.(); }}
        onPause={() => { setIsPlaying(false); onPause?.(); }}
        className="hidden"
      >
        <source src={mp4Url} type="video/mp4" />
      </video>

      {/* Controls */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={audioDuration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <span className="text-xs text-muted-foreground w-10">{formatTime(audioDuration)}</span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); goToSlide(currentSlideIndex - 1); }} aria-label="Slide précédente" className="p-1 text-muted-foreground hover:text-foreground transition-colors" disabled={currentSlideIndex === 0}>
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label={isPlaying ? "Pause" : "Lecture"} className="p-1 text-foreground hover:text-primary transition-colors">
              {isPlaying ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); goToSlide(currentSlideIndex + 1); }} aria-label="Slide suivante" className="p-1 text-muted-foreground hover:text-foreground transition-colors" disabled={currentSlideIndex >= slides.length - 1}>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Slide {currentSlideIndex + 1}/{slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Slide navigation dots */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-center gap-1.5 flex-wrap">
        {slides.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlideIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
            title={slide.title}
          />
        ))}
      </div>
    </div>
  );
}

// Clean DataCamp image URLs: remove sizing suffix like " =90" or " =50"
function cleanImageUrl(url: string): string {
  return url.replace(/\s+=\d+$/, '').trim();
}

// Slide renderer component
function SlideRenderer({ slide, slideNumber, totalSlides }: { slide: ProjectorSlide; slideNumber: number; totalSlides: number }) {
  if (slide.type === "TitleSlide") {
    return (
      <div className="text-center text-white max-w-2xl">
        {slide.technology && (
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold rounded-full bg-primary/20 text-primary-foreground border border-primary/30">
            {slide.technology}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{slide.title}</h2>
        {slide.instructorName && (
          <div className="mt-4 text-sm text-slate-300">
            <p className="font-medium">{slide.instructorName}</p>
            {slide.instructorTitle && <p className="text-slate-400">{slide.instructorTitle}</p>}
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "FinalSlide") {
    return (
      <div className="text-center text-white max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{slide.title}</h2>
        {slide.content && <p className="text-slate-300 text-lg">{slide.content}</p>}
      </div>
    );
  }

  if (slide.type === "TwoColumns") {
    return (
      <div className="w-full max-w-4xl text-white">
        {!slide.title.startsWith(" ") && <h3 className="text-xl font-bold mb-4 text-center">{slide.title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {slide.images.filter((_, i) => i < Math.ceil(slide.images.length / 2)).map((img, i) => (
              <img key={i} src={cleanImageUrl(img.url)} alt={img.alt} loading="lazy" decoding="async" className="max-h-40 object-contain rounded mx-auto" />
            ))}
            {slide.contentLeft && (
              <div className="text-sm text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.contentLeft.replace(/\n/g, '<br/>') }} />
            )}
          </div>
          <div className="space-y-3">
            {slide.images.filter((_, i) => i >= Math.ceil(slide.images.length / 2)).map((img, i) => (
              <img key={i} src={cleanImageUrl(img.url)} alt={img.alt} loading="lazy" decoding="async" className="max-h-40 object-contain rounded mx-auto" />
            ))}
            {slide.contentRight && (
              <div className="text-sm text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.contentRight.replace(/\n/g, '<br/>') }} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // FullSlide
  return (
    <div className="w-full max-w-3xl text-white">
      <h3 className="text-xl font-bold mb-4 text-center">{slide.title}</h3>
      {slide.images.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {slide.images.map((img, i) => (
            <img key={i} src={cleanImageUrl(img.url)} alt={img.alt} loading="lazy" decoding="async" className="max-h-48 object-contain rounded" />
          ))}
        </div>
      )}
      {slide.content && (
        <div className="text-sm text-slate-200 leading-relaxed text-center" dangerouslySetInnerHTML={{ __html: slide.content.replace(/\n/g, '<br/>') }} />
      )}
    </div>
  );
}
