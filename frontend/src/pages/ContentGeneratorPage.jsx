import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import contentGeneratorService from '../services/contentGeneratorService';
import courseService from '../services/courseService';
import Button from '../components/Button';
import Card from '../components/Card';
import ContentTypeSelector from '../components/ContentTypeSelector';
import GeneratedContentViewer from '../components/GeneratedContentViewer';

export default function ContentGeneratorPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [contentType, setContentType] = useState('outline');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleGenerateContent = async () => {
    if (!selectedCourse) return;
    try {
      setGenerating(true);
      setError(null);
      let content;
      switch (contentType) {
        case 'outline':
          content = await contentGeneratorService.generateOutline(selectedCourse);
          break;
        case 'problems':
          content = await contentGeneratorService.generateProblems(selectedCourse);
          break;
        case 'flashcards':
          content = await contentGeneratorService.generateFlashcards(selectedCourse);
          break;
        case 'summary':
          content = await contentGeneratorService.generateSummary(selectedCourse);
          break;
        default:
          throw new Error('Unknown content type');
      }
      setGeneratedContent({
        type: contentType,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      });
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const courseName = courses.find(c => c.id === selectedCourse)?.title || 'Course';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Generator</h1>
        <p className="text-gray-600 mb-8">Generate AI-powered learning materials for your courses</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Select Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  {courses.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
                </select>
              </div>
              <ContentTypeSelector value={contentType} onChange={setContentType} />
              <Button onClick={handleGenerateContent} disabled={!selectedCourse || generating} fullWidth>
                {generating ? <>Generating...</> : 'Generate Content'}
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded"><AlertCircle className="inline mr-2" />{error}</div>}
            {generatedContent ? (
              <Card>
                <GeneratedContentViewer content={generatedContent.content} title={`${contentType} - ${courseName}`} contentType={generatedContent.type} />
              </Card>
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-600">No content generated yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
