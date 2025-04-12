// =============================================
// Blog Post Detail Page (pages/blog/[slug].js)
// =============================================
// In Next.js, fetch 'post' data using getStaticProps/getServerSideProps based on the [slug] parameter
export function BlogPostPage({ post }) {
    // Default placeholder post if none is passed via props (for demonstration)
    const defaultPost = {
      title: "Blog Post Title Placeholder",
      author: "CareerLeap Team",
      date: new Date().toISOString(),
      category: "Category",
      featuredImage: "https://placehold.co/1200x600/E0F2FE/0E7490?text=Featured+Image",
      content: `
        <p class="lead">This is placeholder content for a blog post. In a real application, this content would be fetched dynamically based on the post's slug. It supports basic HTML formatting.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <h2>Section Heading Example</h2>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <blockquote>"This is an example blockquote. It can be used to highlight important quotes or statements within the article."</blockquote>
        <ul>
          <li>List item one: Benefits or key points.</li>
          <li>List item two: Further elaboration.</li>
          <li>List item three: Actionable takeaways.</li>
        </ul>
        <figure>
          <img src="https://placehold.co/800x400/CFFAFE/0369A1?text=In-Article+Image" alt="Placeholder Image within content" class="rounded-lg my-6"/>
          <figcaption>Optional caption for an image within the article.</figcaption>
        </figure>
        <h2>Conclusion</h2>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
      `,
      slug: 'placeholder-post'
    };
  
    const currentPost = post || defaultPost;
  
    return (
      <PageLayout fullWidth={true}> {/* Use fullWidth for potentially wider content area */}
        <div className="max-w-4xl mx-auto"> {/* Center the content */}
            <article>
              {/* Post Header */}
              <header className="mb-8 md:mb-12 text-center">
                <a href="/blog" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline mb-2 inline-block">&larr; Back to Insights</a>
                <p className="text-base text-cyan-600 dark:text-cyan-400 font-semibold tracking-wide uppercase mb-3">{currentPost.category}</p>
                <h1 className="block text-3xl leading-tight font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-6">
                  {currentPost.title}
                </h1>
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                  <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                          {/* Placeholder Avatar */}
                          <AvatarFallback>{currentPost.author.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span>By {currentPost.author}</span>
                  </div>
                  <span className="hidden sm:inline">|</span>
                  <div className="flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2" />
                      <span>{new Date(currentPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </header>
  
              {/* Featured Image */}
              {currentPost.featuredImage && (
                   <img
                      src={currentPost.featuredImage}
                      alt={`Featured image for ${currentPost.title}`}
                      className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 md:mb-12 shadow-lg"
                      onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1200x600/cccccc/ffffff?text=Image+Load+Error'; }}
                   />
              )}
  
              {/* Post Content - Use Tailwind Typography Plugin recommended */}
              <div
                className="prose prose-lg dark:prose-invert lg:prose-xl max-w-none mx-auto text-gray-700 dark:text-gray-300 prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-blockquote:border-l-cyan-500 dark:prose-blockquote:border-l-cyan-400 prose-headings:text-gray-900 dark:prose-headings:text-white"
                dangerouslySetInnerHTML={{ __html: currentPost.content }} // Ensure content is sanitized server-side or from trusted CMS
              />
  
              {/* Optional: Share Buttons, Related Posts, Author Bio */}
              <footer className="mt-12 pt-8 border-t dark:border-cyan-800 text-center">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Share this post:</h3>
                   {/* Add social share buttons here */}
                   <div className="flex justify-center space-x-4 mb-8">
                       {/* Placeholder share buttons */}
                       <Button variant="outline" size="icon" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">X</Button>
                       <Button variant="outline" size="icon" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">Li</Button>
                       <Button variant="outline" size="icon" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">Fb</Button>
                   </div>
                  <Button variant="outline" asChild className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
                      <a href="/blog"> &larr; Explore More Insights</a>
                  </Button>
              </footer>
            </article>
        </div>
      </PageLayout>
    );
  }
  
  