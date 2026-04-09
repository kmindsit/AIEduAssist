import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Learn with <span className="text-gradient">AI-Powered</span> Education
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Unlock your potential with personalized learning experiences, interactive courses, and AI-driven insights tailored to your learning style.
            </p>
            <div className="flex gap-4">
              <Link to="/courses">
                <Button size="lg">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg h-96"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-white rounded-3xl mb-24">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose AIEduAssist?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Learning',
              description: 'Get personalized recommendations and adaptive learning paths powered by AI.',
            },
            {
              icon: '📚',
              title: 'Expert Content',
              description: 'Learn from industry experts with carefully curated and comprehensive course materials.',
            },
            {
              icon: '🎯',
              title: 'Interactive Quizzes',
              description: 'Test your knowledge with interactive quizzes and get detailed feedback.',
            },
            {
              icon: '📈',
              title: 'Track Progress',
              description: 'Monitor your learning journey with detailed analytics and progress tracking.',
            },
            {
              icon: '🏆',
              title: 'Certifications',
              description: 'Earn recognized certificates upon course completion.',
            },
            {
              icon: '🌍',
              title: 'Global Community',
              description: 'Connect with learners from around the world and share experiences.',
            },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Start Learning?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of learners already transforming their careers with AIEduAssist.
        </p>
        <Link to="/register">
          <Button size="lg">
            Get Started Today
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
