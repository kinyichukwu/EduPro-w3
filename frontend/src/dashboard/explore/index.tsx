import { useState } from 'react';
import { Search, BookOpen, Brain, Calculator, Atom, Globe, Palette, Music, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { CourseCard } from '../components/explore';
import { mockCourses } from '../constants/explore';
import { Input } from '@/shared/components/ui';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'All', name: 'All Subjects', icon: BookOpen, color: 'bg-primary' },
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'bg-blue-500' },
    { id: 'science', name: 'Science', icon: Atom, color: 'bg-green-500' },
    { id: 'language', name: 'Languages', icon: Globe, color: 'bg-purple-500' },
    { id: 'art', name: 'Arts', icon: Palette, color: 'bg-pink-500' },
    { id: 'music', name: 'Music', icon: Music, color: 'bg-orange-500' },
    { id: 'ai', name: 'AI & Tech', icon: Brain, color: 'bg-cyan-500' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'bg-emerald-500' },
    { id: 'design', name: 'Design', icon: Palette, color: 'bg-rose-500' },
  ];

  const courseCategories = [
    { id: 'featured', name: 'Featured', icon: BookOpen, color: 'bg-primary' },
    { id: 'popular', name: 'Popular', icon: BookOpen, color: 'bg-primary' },
    { id: 'calculus', name: 'Calculus', icon: BookOpen, color: 'bg-primary' },
    { id: 'wave-mechanics', name: 'Wave Mechanics', icon: BookOpen, color: 'bg-primary' },
    { id: 'algebra', name: 'Algebra', icon: BookOpen, color: 'bg-primary' },
    { id: 'quantum-mechanics', name: 'Quantum Mechanics', icon: BookOpen, color: 'bg-primary' },
  ];

  return (
    <div className="min-h-screen bg-background max-w-screen">
      <div className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Explore & Learn</h1>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
              Discover thousands of courses, tutorials, and learning paths designed to help you master any subject with AI-powered personalization.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="What would you like to learn today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 py-4 rounded-xl bg-dark-card text-foreground border-0 focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 py-8">
        <section className="w-full mb-12 max-w-full overflow-hidden">
          <h2 className="text-2xl font-bold mb-6">Explore Categories</h2>
          <div className="p-1 flex gap-4 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link to={`/dashboard/explore/${category.id}`} key={category.id}>
                  <Button
                    key={category.id}
                    className="p-4 rounded-xl border-2 border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.03] min-w-32 sm:min-w-40 h-24 flex-col bg-none hover:bg-white/5 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">{category.name}</p>
                  </Button>
                </Link>
              );
            })}
          </div>
        </section>

        {courseCategories.map((category) => (
          <section className="mb-12" key={category.id}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <Link to={`/dashboard/explore/${category.id}`}>
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto">
              {mockCourses.map((path) => (
                <CourseCard key={path.id} course={path} className="w-80" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Explore;