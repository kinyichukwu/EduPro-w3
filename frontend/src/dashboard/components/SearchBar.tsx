import { Button , TooltipContent} from '@/shared/components/ui';
import { TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Tooltip } from '@/shared/components/ui';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { cn } from '@/shared/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([
    'Quiz 1',
    'Quiz 2',
    'Quiz 3',
    'Quiz 4',
    'Quiz 5',
    'Quiz 6',
    'flashcard 1',
    'flashcard 2',
    'flashcard 3',
    'flashcard 4',
    'flashcard 5',
    'flashcard 6',
  ]);
  const [isMobileSearch, setIsMobileSearch] = useState(false)
  
  const searchRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResults([]);

    // Simulate API call delay
    setTimeout(() => {
      // Fake result based on query
      setResults([
        `${searchQuery} result 1`,
        `${searchQuery} result 2`,
        `${searchQuery} result 3`,
        `${searchQuery} result 4`,
        `${searchQuery} result 5`,
        `${searchQuery} result 6`,
        `${searchQuery} result 7`,
        `${searchQuery} result 8`,
        `${searchQuery} result 9`,
        `${searchQuery} result 10`,
      ]);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleClose = () => {
    setIsOpen(false);
    setIsMobileSearch(false);
    setSearchQuery('');
  }

  useScrollLock(isOpen, searchRef, handleClose, searchInputRef)

  return (
    <div className="relative md:w-full max-w-md ml-auto md:mx-auto">
      <div className='md:hidden'>
        {!isMobileSearch ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-dark-accent/50 text-dark-muted hover:text-turbo-indigo"
                onClick={() => {
                  setIsMobileSearch(true);
                  setIsOpen(true);
                }}
              >
                <span className="sr-only">Search</span>
                <Search size={17} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative !h-[38px] bg-white/10 rounded-l-none"
            onClick={() => {
              setIsMobileSearch(false);
              setSearchQuery('');
            }}
          >
            <span className="sr-only">Close</span>
            <X size={17} />
          </Button>
        )} 
        {isMobileSearch && (
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search everything... docs, quizzes, flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setIsOpen(true)}
            className="absolute top-0 right-10 w-56 sm:w-96 rounded-l-lg text-sm backdrop-blur-2xl border border-white/10 py-2 p-3 pr-10 text-white focus:border-turbo-indigo/50 focus:outline-none focus:ring-turbo-indigo/50 placeholder:text-dark-muted/70"
            style={{
              backgroundColor: "rgba(21, 25, 37, 0.85)",
            }}
          />
        )}
      </div>

      <div className="flex-1 max-w-xl px-4 hidden md:block relative">
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-dark-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search everything... docs, quizzes, flashcards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => setIsOpen(true)}
          className="w-full rounded-lg text-sm border border-white/10 bg-dark-accent/30 py-2 pl-10 pr-4 text-white focus:border-turbo-indigo/50 focus:outline-none focus:ring-1 focus:ring-turbo-indigo/50 placeholder:text-dark-muted/70"
        />
      </div>

      {isOpen && (
        <div
          ref={searchRef}
          className={cn(
            "fixed md:absolute top-14 md:top-12 left-0 right-0 mx-auto px-2 w-full max-w-md rounded-md overflow-hidden",
          )}
        >
          <div
            className="glass-card backdrop-blur-2xl rounded-md"
            style={{
              backgroundColor: "rgba(21, 25, 37, 1)",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "5px 0 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            {loading && (
              <div className="p-3 flex justify-center">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="max-h-[300px] overflow-y-auto rounded shadow p-1.5 text-left">
                {results.map((res, index) => (
                  <li key={index} className="py-1.5 px-2 rounded hover:bg-white/10">
                    {res}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
