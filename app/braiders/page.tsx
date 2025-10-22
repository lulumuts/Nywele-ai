'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Inbox, Check, X, Clock, User, DollarSign, Calendar, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { JobSpec } from '@/lib/specs';
import QuoteEditor from '@/app/components/QuoteEditor';

interface Job {
  bookingId: string;
  styleSlug: string;
  styleName: string;
  spec: JobSpec;
  customerInfo: {
    hairType?: string;
    budget?: string;
    timePreference?: string;
    requestedDate: string;
    requestedTime: string;
  };
  status: string;
  createdAt: string;
}

interface Quote {
  products: any[];
  labor_cost_kes: number;
  notes: string;
  total_kes: number;
}

export default function BraidersPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showQuoteEditor, setShowQuoteEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadJobs();
  }, []);

  const loadJobs = () => {
    const jobsInbox = JSON.parse(
      localStorage.getItem('nywele-jobs-inbox') || '[]'
    );
    
    // Filter and validate jobs to ensure they have complete specs
    const validJobs = jobsInbox.filter((j: Job) => {
      const isValid = j.spec && 
                     j.spec.hair_extensions && 
                     j.spec.labor && 
                     j.spec.styling_products;
      
      if (!isValid) {
        console.warn(`⚠️ Invalid job spec for booking ${j.bookingId}`, j);
      }
      return isValid;
    });
    
    setJobs(validJobs.filter((j: Job) => j.status === 'pending_quote'));
    setCompletedJobs(validJobs.filter((j: Job) => j.status === 'quote_submitted' || j.status === 'confirmed'));
    
    console.log(`✅ Loaded ${validJobs.length} valid jobs (${jobsInbox.length - validJobs.length} invalid)`);
  };

  const handleSubmitQuote = (quote: Quote) => {
    if (!selectedJob) return;

    // Save quote
    localStorage.setItem(
      `nywele-quote-${selectedJob.bookingId}`,
      JSON.stringify(quote)
    );

    // Update booking status
    const bookingInfo = JSON.parse(
      localStorage.getItem('nywele-latest-booking') || '{}'
    );
    if (bookingInfo.id === selectedJob.bookingId) {
      bookingInfo.quote = quote;
      bookingInfo.status = 'quote_submitted';
      localStorage.setItem('nywele-latest-booking', JSON.stringify(bookingInfo));
    }

    // Update job in inbox
    const jobsInbox = JSON.parse(
      localStorage.getItem('nywele-jobs-inbox') || '[]'
    );
    const updatedJobs = jobsInbox.map((j: Job) =>
      j.bookingId === selectedJob.bookingId
        ? { ...j, status: 'quote_submitted' }
        : j
    );
    localStorage.setItem('nywele-jobs-inbox', JSON.stringify(updatedJobs));

    // Refresh and close
    setShowQuoteEditor(false);
    setSelectedJob(null);
    loadJobs();

    alert('Quote submitted successfully!');
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowQuoteEditor(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Braider Dashboard
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!isClient ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : !showQuoteEditor ? (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-800">{jobs.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-800">{completedJobs.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-3xl font-bold text-gray-800">{jobs.length + completedJobs.length}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Inbox className="text-purple-600" size={32} />
                <h2 className="text-4xl font-bold text-gray-800">Job Inbox</h2>
              </div>
              <p className="text-lg text-gray-600">
                Review job specifications and submit your quotes
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pending ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Completed ({completedJobs.length})
              </button>
            </div>

            {/* Jobs List */}
            {activeTab === 'pending' && jobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center"
              >
                <Inbox className="text-gray-400 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Pending Jobs
                </h3>
                <p className="text-gray-600">
                  New job requests will appear here
                </p>
              </motion.div>
            ) : activeTab === 'completed' && completedJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center"
              >
                <Check className="text-gray-400 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Completed Jobs Yet
                </h3>
                <p className="text-gray-600">
                  Completed quotes will appear here
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {(activeTab === 'pending' ? jobs : completedJobs).map((job, index) => (
                  <motion.div
                    key={job.bookingId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {job.styleName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Requested:{' '}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'pending_quote' 
                          ? 'bg-yellow-100 text-yellow-700'
                          : job.status === 'quote_submitted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {job.status === 'pending_quote' && <Clock size={16} />}
                        {job.status === 'quote_submitted' && <Check size={16} />}
                        {job.status === 'confirmed' && <Check size={16} />}
                        {job.status === 'pending_quote' ? 'Pending Quote' : 
                         job.status === 'quote_submitted' ? 'Quote Submitted' :
                         'Confirmed'}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {job.customerInfo.hairType && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Hair Type</p>
                          <p className="font-semibold text-gray-800">
                            {job.customerInfo.hairType.toUpperCase()}
                          </p>
                        </div>
                      )}
                      {job.customerInfo.budget && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            <DollarSign size={12} className="text-gray-500" />
                            <p className="text-xs text-gray-500">Budget</p>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {job.customerInfo.budget}
                          </p>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar size={12} className="text-gray-500" />
                          <p className="text-xs text-gray-500">Requested Date</p>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {new Date(job.customerInfo.requestedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock size={12} className="text-gray-500" />
                          <p className="text-xs text-gray-500">Time</p>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {job.customerInfo.requestedTime}
                        </p>
                      </div>
                    </div>

                    {/* Time Preference */}
                    {job.customerInfo.timePreference && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700">
                          <strong>Customer prefers:</strong> {job.customerInfo.timePreference}
                        </p>
                      </div>
                    )}

                    {/* Customer Budget Range */}
                    {job.customerInfo.budget && (
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="text-green-600" size={20} />
                          <p className="font-bold text-green-800">
                            Customer Budget Range
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {job.customerInfo.budget}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Submit a quote within this range or explain why additional cost is needed
                        </p>
                      </div>
                    )}
                    
                    {/* Style Requirements */}
                    {job.spec && (
                      <div className="p-4 bg-purple-50 rounded-lg mb-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Time Estimate
                            </p>
                            <p className="font-semibold text-gray-800">
                              {job.spec.time_min_hours}-
                              {job.spec.time_max_hours} hours
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Hair Extensions
                            </p>
                            <p className="font-semibold text-gray-800">
                              {job.spec.hair_extensions.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {job.spec.hair_extensions.quantity_min}-{job.spec.hair_extensions.quantity_max} packs
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Complexity
                            </p>
                            <p className="font-semibold text-gray-800 capitalize">
                              {job.spec.complexity}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {job.status === 'pending_quote' ? (
                      <button
                        onClick={() => handleViewJob(job)}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Review & Submit Quote
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-center">
                        {job.status === 'quote_submitted' ? 'Quote Sent - Awaiting Customer' : 'Booking Confirmed'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Quote Editor View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowQuoteEditor(false);
                    setSelectedJob(null);
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                >
                  ← Back to Inbox
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Job Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Style:</p>
                    <p className="font-semibold text-gray-800">
                      {selectedJob?.styleName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hair Type:</p>
                    <p className="font-semibold text-gray-800">
                      {selectedJob?.customerInfo.hairType?.toUpperCase() || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Requested Date:</p>
                    <p className="font-semibold text-gray-800">
                      {selectedJob?.customerInfo.requestedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Requested Time:</p>
                    <p className="font-semibold text-gray-800">
                      {selectedJob?.customerInfo.requestedTime}
                    </p>
                  </div>
                </div>
                
                {/* Customer Budget Highlight */}
                {selectedJob?.customerInfo.budget && (
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="text-green-600" size={18} />
                      <p className="font-bold text-green-800">Customer Budget</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedJob.customerInfo.budget}
                    </p>
                  </div>
                )}
              </div>

              {selectedJob?.spec && (
                <QuoteEditor
                  spec={selectedJob.spec}
                  customerBudget={selectedJob.customerInfo.budget}
                  onSubmit={handleSubmitQuote}
                />
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}


