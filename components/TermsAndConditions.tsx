  // components/TermsAndConditions.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors">
          &larr; Back to Home
        </Link>
        
        <div className="bg-slate-800/50 rounded-lg p-8 backdrop-blur-sm border border-purple-500/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Terms & Conditions
            </h1>
            <p className="text-slate-400">Last Updated: November 2025</p>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-6">
            {/* Welcome Section */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                Welcome to <strong>Animebing</strong>, accessible at <strong>https://animabing.pages.dev</strong>.
              </p>
              <p className="text-slate-300 mt-4 text-lg leading-relaxed">
                By accessing or using our website, you agree to be bound by these Terms & Conditions.
              </p>
            </section>

            {/* 1. Acceptance of Terms */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300">
                If you do not agree with any part of the Terms, please discontinue the use of the website immediately.
              </p>
            </section>

            {/* 2. Use License */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p className="text-slate-300 mb-4">
                You are granted a limited, non-transferable, non-commercial license to access and view the content on Animebing for personal use only.
              </p>
              <p className="text-slate-300 font-semibold mb-2">You agree not to:</p>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4">
                <li>Copy, modify, or distribute content for commercial use</li>
                <li>Attempt to interfere with website functionality or security</li>
                <li>Use automated tools (bots/scrapers) without permission</li>
              </ul>
            </section>

            {/* 3. User Responsibilities */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
              <ul className="text-slate-300 list-disc list-inside space-y-2 ml-4">
                <li>You must be 13 years or older to use our website.</li>
                <li>You are responsible for the security of your account and device.</li>
                <li>You agree not to upload or transmit malicious or harmful content.</li>
              </ul>
            </section>

            {/* 4. Content Disclaimer */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-yellow-500">
              <h2 className="text-2xl font-bold text-white mb-4">4. Content Disclaimer</h2>
              <p className="text-slate-300 mb-4">
                Animebing does not host or upload any video files directly.
                All video content is provided by third-party services publicly available on the internet.
              </p>
              <p className="text-slate-300">
                If any copyrighted material is found, rights holders may contact us for immediate removal.
              </p>
            </section>

            {/* 5. Google AdSense & Advertising */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-green-500">
              <h2 className="text-2xl font-bold text-white mb-4">5. Google AdSense & Advertising</h2>
              <p className="text-slate-300 mb-4">
                This website uses Google AdSense for monetization.
                Google may collect anonymized data to provide tailored ads.
              </p>
              <div className="bg-slate-600/30 rounded-lg p-4">
                <p className="text-slate-300 mb-2">
                  Users can manage ad preferences here:
                </p>
                <a href="https://www.google.com/settings/ads" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-purple-400 hover:text-purple-300 transition-colors">
                  https://www.google.com/settings/ads
                </a>
              </div>
            </section>

            {/* 6. Limitations of Liability */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">6. Limitations of Liability</h2>
              <p className="text-slate-300">
                Animebing shall not be held liable for any damages resulting from use or inability to access content, 
                including loss of data or business interruption.
              </p>
            </section>

            {/* 7. External Links */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">7. External Links</h2>
              <p className="text-slate-300">
                We may include links to third-party websites.
                Animebing does not control or endorse external content and is not responsible for any third-party actions or policies.
              </p>
            </section>

            {/* 8. Copyright Violations / DMCA */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-red-500">
              <h2 className="text-2xl font-bold text-white mb-4">8. Copyright Violations / DMCA</h2>
              <p className="text-slate-300 mb-4">
                If you believe any content infringes your copyright:
              </p>
              <div className="bg-slate-600/30 rounded-lg p-4">
                <p className="text-slate-300 flex items-center gap-2 mb-2">
                  <span className="text-red-400">📧</span>
                  Email us at: 
                  <a href="mailto:animebingofficial@gmail.com" 
                     className="text-purple-400 hover:text-purple-300 transition-colors ml-1">
                    animebingofficial@gmail.com
                  </a>
                </p>
                <p className="text-slate-300 text-sm">
                  Include proper proof and URLs — we will act promptly.
                </p>
              </div>
            </section>

            {/* 9. Modifications */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">9. Modifications</h2>
              <p className="text-slate-300">
                We may update these Terms at any time.
                Continued use of the website means acceptance of updated terms.
              </p>
            </section>

            {/* 10. Governing Law */}
            <section className="bg-slate-700/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
              <p className="text-slate-300">
                These Terms are governed under the laws of India.
                Users agree to submit to the exclusive jurisdiction of Indian courts.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-700/30 rounded-lg p-6 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <div className="bg-slate-600/30 rounded-lg p-4">
                <p className="text-slate-300">
                  For any questions regarding these Terms & Conditions, please contact us at:
                </p>
                <a href="mailto:animebingofficial@gmail.com" 
                   className="text-purple-400 hover:text-purple-300 transition-colors mt-2 inline-block">
                  animebingofficial@gmail.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
