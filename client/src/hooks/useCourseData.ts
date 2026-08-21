import { useState, useEffect, useCallback, useRef } from "react";

/**
 * In-memory cache for course JSON data.
 * Persists across component mounts/unmounts within the same session.
 * Avoids re-fetching when navigating between chapters of the same course.
 */
const courseCache = new Map<string, { lessons: any[]; exercises: any[]; sections: any[] }>();
const pendingFetches = new Map<string, Promise<any>>();


async function fetchCourseData(courseId: string): Promise<{ lessons: any[]; exercises: any[]; sections: any[] }> {
  // Deduplicate concurrent fetches for the same courseId
  if (pendingFetches.has(courseId)) {
    return pendingFetches.get(courseId)!;
  }

  const promise = fetch(`/data/courses/${courseId}.json`, {
    // Les JSON de cours sont mis à jour indépendamment du bundle JavaScript.
    // La revalidation explicite évite qu’un apprenant voie un ancien cours après
    // une publication tout en conservant le cache mémoire de la session.
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Course ${courseId} not found`);
      return res.json();
    })
    .then((data) => {
      const result = {
        lessons: normalizeCourseBlocks(data).lessons || [],
        exercises: data.exercises || [],
        sections: data.sections || [],
      };
      courseCache.set(courseId, result);
      pendingFetches.delete(courseId);
      return result;
    })
    .catch((err) => {
      pendingFetches.delete(courseId);
      throw err;
    });

  pendingFetches.set(courseId, promise);
  return promise;
}

/**
 * Prefetch a course in the background (non-blocking).
 * Used to preload the next course in the certification path.
 */
export function prefetchCourse(courseId: string): void {
  if (courseCache.has(courseId) || pendingFetches.has(courseId)) return;
  fetchCourseData(courseId).catch(() => {
    // Silently ignore prefetch failures
  });
}

/**
 * Hook to load course data with caching and prefetching.
 * Returns cached data instantly if available, otherwise fetches.
 */
export function useCourseData(courseId: string | undefined) {
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [courseExercises, setCourseExercises] = useState<any[]>([]);
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first — instant render
    const cached = courseCache.get(courseId);
    if (cached) {
      setCourseLessons(cached.lessons);
      setCourseExercises(cached.exercises);
      setCourseSections(cached.sections);
      setLoading(false);
      setError(null);
      return;
    }

    // Fetch from network
    let settled = false;
    setLoading(true);
    setError(null);
    const slowLoadTimer = window.setTimeout(() => {
      if (!settled && mountedRef.current) {
        setError("slow");
      }
    }, 12000);
    fetchCourseData(courseId)
      .then((data) => {
        settled = true;
        window.clearTimeout(slowLoadTimer);
        if (!mountedRef.current) return;
        setCourseLessons(data.lessons);
        setCourseExercises(data.exercises);
        setCourseSections(data.sections);
        setLoading(false);
        setError(null);
      })
      .catch(() => {
        settled = true;
        window.clearTimeout(slowLoadTimer);
        if (!mountedRef.current) return;
        setCourseLessons([]);
        setCourseExercises([]);
        setCourseSections([]);
        setLoading(false);
        setError("failed");
      });
    return () => window.clearTimeout(slowLoadTimer);
  }, [courseId, retryVersion]);

  const invalidateCache = useCallback((id?: string) => {
    if (id) {
      courseCache.delete(id);
    } else {
      courseCache.clear();
    }
  }, []);

  const retry = useCallback(() => {
    if (courseId) courseCache.delete(courseId);
    setRetryVersion((version) => version + 1);
  }, [courseId]);

  return {
    courseLessons,
    courseExercises,
    courseSections,
    loading,
    error,
    retry,
    invalidateCache,
  };
}

/**
 * Get cache stats for debugging
 */
export function getCourseDataCacheStats() {
  return {
    cachedCourses: courseCache.size,
    pendingFetches: pendingFetches.size,
    cachedIds: Array.from(courseCache.keys()),
  };
}
import { normalizeCourseBlocks } from "@shared/courseBlockNormalization";
