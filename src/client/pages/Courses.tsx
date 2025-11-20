import React, { useEffect, useState } from 'react';

interface Course {
  id: number;
  title: string;
  imageSrc: string;
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from API
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Choose a course</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                // Navigate to learn page
                window.location.href = '/learn';
              }}
            >
              <img
                src={course.imageSrc}
                alt={course.title}
                className="w-24 h-24 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-center">{course.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
