import { PageLayout } from ".";
// =============================================
// Placeholder Policy Page Component (Used for Privacy, Terms, Cookies)
// =============================================
function PlaceholderPolicyPage({ title, lastUpdated, icon: Icon }) {
    return (
     <PageLayout title={title}>
        <div className="prose prose-lg dark:prose-invert max-w-4xl lg:prose-xl mx-auto text-gray-600 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-cyan-600 dark:prose-a:text-cyan-400">
            {Icon && <Icon className="h-10 w-10 text-cyan-500 dark:text-cyan-400 mb-4" />}
            <p><em>Last Updated: {lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
            <p><strong>This is placeholder content for the {title}. Please replace this section with your actual, legally compliant policy details. Consult with a legal professional to ensure accuracy and completeness.</strong></p>
            <h2>1. Introduction</h2>
            <p>[Your Introduction Here - Explain the purpose of this policy.]</p>
            <h2>2. Definitions</h2>
            <p>[Define key terms used throughout the policy, e.g., "Personal Data", "User", "Service".]</p>
            <h2>3. Information We Collect</h2>
            <p>[Detail the types of information collected, e.g., personal identification information (name, email), usage data, cookies, data provided by users.]</p>
             <h3>3.1 Information You Provide</h3>
             <p>[Details...]</p>
             <h3>3.2 Information Collected Automatically</h3>
             <p>[Details...]</p>
            <h2>4. How We Use Your Information</h2>
            <p>[Explain the purposes for collecting and using the information, e.g., to provide and maintain the service, notify about changes, allow participation in interactive features, provide customer support, gather analysis, monitor usage, detect technical issues, fulfill other purposes.]</p>
             {/* Add more sections specific to the policy type (e.g., Data Sharing, Cookies, User Rights for Privacy; Rules of Conduct for Terms) */}
             {title === 'Privacy Policy' && (
                <>
                    <h2>5. Data Sharing and Disclosure</h2>
                    <p>[Explain circumstances under which data might be shared, e.g., with service providers, for legal reasons, business transfers.]</p>
                    <h2>6. Data Security</h2>
                    <p>[Describe security measures taken.]</p>
                    <h2>7. Your Data Protection Rights</h2>
                    <p>[Outline user rights, e.g., access, rectification, erasure, restriction, objection, data portability, right to withdraw consent, right to complain to authority.]</p>
                </>
             )}
             {title === 'Terms of Service' && (
                 <>
                    <h2>5. User Accounts</h2>
                    <p>[Rules regarding account creation, responsibility, termination.]</p>
                    <h2>6. Prohibited Conduct</h2>
                    <p>[List activities not allowed on the platform.]</p>
                    <h2>7. Intellectual Property</h2>
                    <p>[Clarify ownership of platform content and user-generated content.]</p>
                    <h2>8. Disclaimers and Limitation of Liability</h2>
                    <p>[Standard legal disclaimers.]</p>
                    <h2>9. Governing Law and Dispute Resolution</h2>
                    <p>[Specify jurisdiction and how disputes will be handled.]</p>
                 </>
             )}
             {title === 'Cookie Policy' && (
                 <>
                    <h2>5. What Are Cookies?</h2>
                    <p>[Explanation of cookies, pixels, etc.]</p>
                    <h2>6. How We Use Cookies</h2>
                    <p>[Detail the types of cookies used (e.g., essential, performance, functional, targeting) and their purposes.]</p>
                    <h2>7. Your Choices Regarding Cookies</h2>
                    <p>[Explain how users can manage cookie preferences (e.g., browser settings, consent tool).]</p>
                 </>
             )}
            <h2>Changes to This {title}</h2>
            <p>[Explain how policy updates will be communicated.]</p>
            <h2>Contact Us</h2>
            <p>If you have any questions about this {title}, please <a href="/contact">contact us</a> at [Your Contact Email/Link].</p>
        </div>
     </PageLayout>
    );
}

// =============================================
// Specific Policy Pages (using the placeholder)
// =============================================
export function PrivacyPolicyPage() { return <PlaceholderPolicyPage title="Privacy Policy" icon={ShieldCheck} />; }
export function TermsOfServicePage() { return <PlaceholderPolicyPage title="Terms of Service" icon={FileText} />; }
export function CookiePolicyPage() { return <PlaceholderPolicyPage title="Cookie Policy" icon={CookieIconPlaceholder} />; } // Replace with actual icon if available

// Placeholder for Cookie Icon if not in lucide-react
const CookieIconPlaceholder = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2a10 10 0 1 0 10 10 10.011 10.011 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
    <circle cx="8" cy="8" r="1"/>
    <circle cx="12" cy="13" r="1"/>
    <circle cx="16" cy="9" r="1"/>
    <circle cx="15" cy="16" r="1"/>
    <circle cx="9" cy="14" r="1"/>
  </svg>
);


