import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Print, Loader, AlertCircle } from 'lucide-react';
import aiTutoringService from '../services/aiTutoringService';
import courseService from '../services/courseService';
import Button from '../components/Button';
import Card from '../components/Card';

export default function StudyGuidesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studyGuides, setStudyGuides] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingGuides, setGeneratingGuides] = useState({});
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0].id);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const generateStudyGuide = async (courseId) => {
    try {
      setGeneratingGuides(prev => ({ ...prev, [courseId]: true }));
      setError(null);
      const guide = await aiTutoringService.generateStudyGuide(courseId);
      setStudyGuides(prev => ({
        ...prev,
        [courseId]: {
          content: guide.content,
          generatedAt: guide.generatedAt
        }
      }));
    } catch (err) {
      setError('Failed to generate study guide');
    } finally {
      setGeneratingGuides(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleCopyGuide = (courseId) => {
    const guide = studyGuides[courseId];
    if (guide) {
      navigator.clipboard.writeText(guide.content);
      setCopiedId(courseId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Guides</h1>
        <p className="text-gray-600 mb-8">Generate AI-powered study guides for your courses</p>

        {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded"><AlertCircle className="inline mr-2" />{error}</div>}

        <Card className="mb-8 p-6">
          <div className="flex gap-3 mb-6">
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
              {courses.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
            <Button onClick={() => generateStudyGuide(selectedCourse)} disabled={!selectedCourse || generatingGuides[selectedCourse]}>
              {generatingGuides[selectedCourse] ? <>< Loader className="animate-spin mr-2" />Generating</> : <>Generate Guide</>}
            </Button>
          </div>
        </Card>

        <div className="grid gap-6">
          {courses.map(course => (
            studyGuides[course.id] ? (
              <Card key={course.id}>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">{course.title}</h2>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded mb-4 whitespace-pre-wrap text-sm">
                    {studyGuides[course.id].content}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopyGuide(course.id)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                      <Copy className="inline mr-2" size={16} />{copiedId === course.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </Card>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}
