import React from 'react';
import { ShieldCheck, Heart, Sparkles, GraduationCap, Users, Home, Award } from 'lucide-react';

export default function AboutView() {
  return (
    <div id="about-section" className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Area */}
        <div className="text-center mb-12">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 rounded-full">
            Our Mission
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Empowering Talent, Cultivating Connections
          </h1>
          <p className="mt-4 text-lg text-slate-650 max-w-2xl mx-auto">
            Talent Hive is a purpose-driven digital marketplace built to connect local clients and startups with skilled freelance specialists, vocational students, homemakers, and individuals with physical disabilities.
          </p>
        </div>

        {/* Visual Bento Story Board */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 mb-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Why Talent Hive Exists
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Modern freelance marketplaces often favor commercial agencies and volume-centric bidding, leaving out talented individuals in our immediate communities. Talent Hive was designed with diversity, flexibility, and equity at the core. We believe structural boundaries—such as physical mobility constraints or parenting schedules—should never restrict economic participation.
            </p>
          </div>

          <div className="border-t border-slate-100 my-6" />

          {/* Demographic Pillars Grid */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider text-center">
              Our Five Essential Demographics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-4">
                <div className="p-3 bg-blue-600 rounded-lg text-white shrink-0 self-start">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Freelance Developers</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Senior and intermediate technical pioneers delivering custom custom application features, database integrations, and DevOps hosting.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-4">
                <div className="p-3 bg-indigo-600 rounded-lg text-white shrink-0 self-start">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Students & Scholars</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Talented university and vocational students working around academic hours to provide digital illustration, design support, and copywriting.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-xl bg-pink-50/50 border border-pink-100 flex gap-4">
                <div className="p-3 bg-pink-600 rounded-lg text-white shrink-0 self-start">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Homemakers & Housewives</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Meticulous stay-at-home culinary artists, tailoring experts, and custom organic designers balancing home life with flexible business.
                  </p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex gap-4">
                <div className="p-3 bg-emerald-600 rounded-lg text-white shrink-0 self-start">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Disabled Individuals</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Invaluable virtual specialists focused on cloud databases, transcription, CRM cleaning, and client support from secure home desks.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 5 - Central Large Banner */}
            <div className="mt-6 p-5 rounded-xl bg-amber-50/50 border border-amber-100 flex gap-4">
              <div className="p-3 bg-amber-600 rounded-lg text-white shrink-0 self-start">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Local Startups & Micro-agencies</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Agile corporate pods and local collaborative agencies setting up cloud architectures, complex IT networks, and hardware deployment help.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Guarantees & Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-xl border border-slate-50 shadow-xs">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800">Verified Craft</h4>
            <p className="text-xs text-slate-500 mt-2">
              Every worker's portfolio, biography, and payment routing coordinates are checked for community authenticity.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-50 shadow-xs">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800">Empowerment Pricing</h4>
            <p className="text-xs text-slate-500 mt-2">
              Fair hourly rates with crystal clear upfront material costs. No surprise fees or contract kickbacks.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-50 shadow-xs">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800">Secure Appointments</h4>
            <p className="text-xs text-slate-500 mt-2">
              Dynamic booking requests with quick acceptance cycles, synchronized calendar blocks, and custom worker feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
