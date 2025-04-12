import { PageLayout } from ".";
// =============================================
// Blog Index Page (pages/blog.js)
// =============================================
export function BlogIndexPage() {
    // Placeholder blog post data - fetch from API/CMS in real app
    const posts = [
      { id: 1, title: "Mastering Skills for Career Advancement", excerpt: "Explore actionable steps to develop essential skills that can set you apart in the competitive job market. Gain insights into effective learning strategies.", date: "2023-02-15", category: "Skill Development", slug: "mastering-skills", image: "https://placehold.co/600x400/E0F2FE/0E7490?text=Skills" },
      { id: 2, title: "Overcoming Imposter Syndrome: Strategies for Success", excerpt: "Identify strategies to combat feelings of self-doubt and build the confidence necessary to take bold steps in your career. Learn how to embrace your value.", date: "2023-02-20", category: "Mindset", slug: "overcoming-imposter-syndrome", image: "https://placehold.co/600x400/FEF9C3/713F12?text=Confidence" },
      { id: 3, title: "Building a Supportive Professional Network", excerpt: "Discover the importance of mentorship and community in your career development. Learn how to leverage connections and resources effectively.", date: "2023-02-25", category: "Networking", slug: "building-supportive-network", image: "https://placehold.co/600x400/ECFCCB/365314?text=Network" },
      { id: 4, title: "AI in Career Planning: Hype vs. Reality", excerpt: "How can artificial intelligence genuinely help you map out your future? We explore the practical applications and limitations.", date: "2023-03-05", category: "Technology", slug: "ai-in-career-planning", image: "https://placehold.co/600x400/CFFAFE/0369A1?text=AI" },
      { id: 5, title: "Negotiating Your Salary Like a Pro", excerpt: "Tips and techniques to confidently research, prepare, and negotiate for the compensation you deserve in your next role.", date: "2023-03-10", category: "Career Growth", slug: "negotiating-salary", image: "https://placehold.co/600x400/E9D5FF/581C87?text=Salary" },
       { id: 6, title: "The Power of Personalized Learning Plans", excerpt: "Why a one-size-fits-all approach doesn't work for skill development and how tailored plans accelerate growth.", date: "2023-03-15", category: "Learning", slug: "personalized-learning", image: "https://placehold.co/600x400/D1FAE5/065F46?text=Learning" },
    ];
  
    const [searchTerm, setSearchTerm] = useState('');
    // Add state for category filtering if needed
    // const [selectedCategory, setSelectedCategory] = useState('All');
  
    const filteredPosts = posts.filter(post =>
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) // &&
      // (selectedCategory === 'All' || post.category === selectedCategory)
    );
  
    // const categories = ['All', ...new Set(posts.map(p => p.category))];
  
    return (
      <PageLayout title="CareerLeap Insights" description="Articles, tips, and resources to empower your professional journey.">
         {/* Search & Filter Bar */}
        <div className="mb-12 max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder="Search articles by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
           {/* Optional: Category Filter Dropdown */}
           {/* <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] dark:bg-cyan-800 dark:border-cyan-700 dark:text-white">
                  <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="dark:bg-cyan-900 dark:border-cyan-700">
                  {categories.map(cat => <SelectItem key={cat} value={cat} className="dark:text-white dark:focus:bg-cyan-800">{cat}</SelectItem>)}
              </SelectContent>
           </Select> */}
        </div>
  
        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.length > 0 ? filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-cyan-900/50 dark:border-cyan-800 flex flex-col group">
               <a href={`/blog/${post.slug}`} className="block overflow-hidden">
                  <img
                      src={post.image}
                      alt={`Image for ${post.title}`}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      // Add onerror for fallback
                      onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Error'; }}
                  />
               </a>
              <CardContent className="p-6 flex-grow flex flex-col">
                <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mb-2">{post.category}</p>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow text-sm">{post.excerpt}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t dark:border-cyan-800">
                   <span className="inline-flex items-center">
                      <CalendarDays className="inline-block h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                   </span>
                   <a href={`/blog/${post.slug}`} className="inline-flex items-center text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
                      Read More <ArrowRight className="ml-1 h-3 w-3"/>
                  </a>
                </div>
              </CardContent>
            </Card>
          )) : (
               <p className="md:col-span-2 lg:col-span-3 text-center text-gray-500 dark:text-gray-400 py-16">
                  No articles found matching your criteria. Try broadening your search.
               </p>
          )}
        </div>
         {/* Optional: Add Pagination component here if needed */}
      </PageLayout>
    );
  }
  
  