'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  CheckCircle,
  TrendingUp,
  Heart,
  Droplet,
  Zap,
  Star,
  Clock,
  AlertCircle,
  Lightbulb,
  Package,
  Camera,
  Upload,
  Loader,
} from 'lucide-react';
import type { HairCareProfile, HairCareRecommendation } from '@/lib/hairCare';

export default function HairCarePage() {
  const [recommendation, setRecommendation] = useState<HairCareRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hairImage, setHairImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysis, setHairAnalysis] = useState<any>(null);
  const [showUploadSection, setShowUploadSection] = useState(true);

  const handleHairPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setHairImage(base64Image);
        
        // Analyze with Vision API
        setIsAnalyzing(true);
        try {
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Image,
              imageType: 'current_hair'
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            setHairAnalysis(result.data);
            console.log('✅ Hair analysis complete:', result.data);
          } else {
            console.warn('⚠️ Analysis failed, using defaults');
            // Set default analysis if API fails
            setHairAnalysis({
              hairType: { hairType: '4c', texture: 'coily', confidence: 0.8 },
              health: { healthScore: 65, indicators: [] },
              detectedStyle: { style: 'natural', confidence: 0.5 }
            });
          }
        } catch (error) {
          console.error('❌ Analysis error:', error);
          // Set default analysis if error
          setHairAnalysis({
            hairType: { hairType: '4c', texture: 'coily', confidence: 0.8 },
            health: { healthScore: 65, indicators: [] },
            detectedStyle: { style: 'natural', confidence: 0.5 }
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRoutine = async () => {
    if (!hairAnalysis) {
      alert('Please upload a photo of your hair first!');
      return;
    }

    setLoading(true);
    try {
      // Build profile from analysis - handle nested structure from Vision API
      const profile: HairCareProfile = {
        hairAnalysis: {
          type: hairAnalysis.hairType?.hairType || hairAnalysis.hairType || '4c',
          health: hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 65,
          texture: hairAnalysis.hairType?.texture || hairAnalysis.texture || 'coily',
          density: hairAnalysis.hairType?.density || hairAnalysis.density || 'thick',
          porosity: hairAnalysis.hairType?.porosity || hairAnalysis.porosity || 'low',
          elasticity: 'medium',
          currentDamage: hairAnalysis.damage || [],
        },
        currentStyle: {
          name: hairAnalysis.detectedStyle?.style || 'Natural',
          installedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          maintenanceDue: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        },
        goals: ['growth', 'moisture', 'strength'],
        concerns: hairAnalysis.concerns || ['dryness'],
        lifestyle: {
          activity: 'moderate',
          climate: 'dry',
          budget: { min: 2000, max: 5000 },
        },
        allergies: [],
      };

      const response = await fetch('/api/hair-care-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Failed to generate routine');

      const data = await response.json();
      
      // Convert date strings to Date objects
      data.maintenanceSchedule = {
        nextTrim: new Date(data.maintenanceSchedule.nextTrim),
        nextDeepCondition: new Date(data.maintenanceSchedule.nextDeepCondition),
        nextProteinTreatment: new Date(data.maintenanceSchedule.nextProteinTreatment),
        styleRefresh: data.maintenanceSchedule.styleRefresh 
          ? new Date(data.maintenanceSchedule.styleRefresh) 
          : undefined,
      };
      
      setRecommendation(data);
      setShowUploadSection(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate routine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'essential':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'recommended':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'optional':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-purple-600" size={40} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Personalized Hair Care Routine
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered daily, weekly, and monthly care plan for healthier hair
          </p>
        </motion.div>

        {/* Photo Upload Section */}
        {showUploadSection && !recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
          >
            <div className="text-center mb-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Analyze Your Hair
              </h2>
              <p className="text-gray-600">
                Upload a clear photo of your hair for AI-powered analysis
              </p>
            </div>

            {!hairImage ? (
              <div className="max-w-md mx-auto">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 transition-all bg-purple-50 hover:bg-purple-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-3 text-purple-600" />
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleHairPhotoUpload}
                    disabled={isAnalyzing}
                  />
                </label>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Uploaded Image */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={hairImage}
                    alt="Your hair"
                    className="w-full h-64 object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader className="animate-spin w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">Analyzing your hair...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Results */}
                {hairAnalysis && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="text-green-600" />
                      Analysis Complete
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Hair Type</p>
                        <p className="text-xl font-bold text-purple-600">
                          {hairAnalysis.hairType?.hairType || hairAnalysis.hairType || '4c'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Health Score</p>
                        <p className="text-xl font-bold text-purple-600">
                          {hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 65}/100
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Texture</p>
                        <p className="text-xl font-bold text-purple-600 capitalize">
                          {hairAnalysis.hairType?.texture || hairAnalysis.texture || 'coily'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setHairImage(null);
                      setHairAnalysis(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Upload Different Photo
                  </button>
                  <button
                    onClick={generateRoutine}
                    disabled={loading || !hairAnalysis}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={20} />
                        Generating Routine...
                      </span>
                    ) : (
                      'Generate My Routine'
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Confidence Score */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">AI Confidence Score</p>
                  <p className="text-3xl font-bold text-purple-600">{recommendation.confidence}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                      style={{ width: `${recommendation.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Results */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={28} />
                <h2 className="text-2xl font-bold">Expected Results</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-purple-100 mb-2">Timeline</p>
                  <p className="text-xl font-semibold">{recommendation.expectedResults.timeline}</p>
                </div>
                <div>
                  <p className="text-purple-100 mb-2">Health Improvement</p>
                  <p className="text-xl font-semibold">
                    +{recommendation.expectedResults.metrics.healthImprovement}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-purple-100 mb-2">You can expect:</p>
                <ul className="space-y-2">
                  {recommendation.expectedResults.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Routine Tabs */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Calendar className="text-purple-600" />
                Your Routine
              </h2>

              {/* Tab Buttons */}
              <div className="flex gap-4 mb-6">
                {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                    {recommendation.personalizedRoutine[tab].length} steps)
                  </button>
                ))}
              </div>

              {/* Routine Steps */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendation.personalizedRoutine[activeTab].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {step.stepNumber}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getImportanceColor(
                          step.importance
                        )}`}
                      >
                        {step.importance}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-1">{step.action}</h3>
                    <p className="text-xs text-gray-600 mb-3">{step.frequency}</p>

                    {step.duration && (
                      <div className="flex items-center gap-2 mb-3 text-gray-600">
                        <Clock size={14} />
                        <span className="text-xs">{step.duration}</span>
                      </div>
                    )}

                    <div className="bg-white rounded-lg p-3 mb-3 flex-grow">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Why:</p>
                      <p className="text-sm text-gray-700">{step.reasoning}</p>
                    </div>

                    {step.product && (
                      <div className="flex items-start gap-2 bg-purple-50 rounded-lg p-2 mt-auto">
                        <Package className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                        <div>
                          <p className="text-xs text-purple-600 font-semibold">Product</p>
                          <p className="text-xs text-gray-700">{step.product}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Maintenance Schedule */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Calendar className="text-purple-600" />
                Maintenance Schedule
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Next Deep Condition</p>
                  <p className="text-lg font-bold text-gray-800">
                    {recommendation.maintenanceSchedule.nextDeepCondition.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-semibold mb-1">Next Protein Treatment</p>
                  <p className="text-lg font-bold text-gray-800">
                    {recommendation.maintenanceSchedule.nextProteinTreatment.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-semibold mb-1">Next Trim</p>
                  <p className="text-lg font-bold text-gray-800">
                    {recommendation.maintenanceSchedule.nextTrim.toLocaleDateString()}
                  </p>
                </div>
                {recommendation.maintenanceSchedule.styleRefresh && (
                  <div className="bg-pink-50 rounded-lg p-4">
                    <p className="text-sm text-pink-600 font-semibold mb-1">Style Refresh</p>
                    <p className="text-lg font-bold text-gray-800">
                      {recommendation.maintenanceSchedule.styleRefresh.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Products */}
            {recommendation.productRecommendations && recommendation.productRecommendations.essential.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Package className="text-purple-600" />
                  Recommended Products
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendation.productRecommendations.essential.map((product, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-purple-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{product.brand}</h3>
                          <p className="text-sm text-gray-600">{product.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">
                            {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{product.pricing.size}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-700 font-semibold mb-1">Why we recommend this:</p>
                        <p className="text-sm text-gray-700">{product.purpose}</p>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-gray-600 font-semibold">Benefits:</p>
                        <ul className="space-y-1">
                          {product.benefits.slice(0, 3).map((benefit, bidx) => (
                            <li key={bidx} className="flex items-start gap-2 text-xs text-gray-600">
                              <Star size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <p className="font-semibold mb-1">Available at:</p>
                          <p>{product.whereToBuy.join(', ')}</p>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all">
                          Buy Now
                        </button>
                      </div>

                      {product.alternatives && product.alternatives.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold mb-2">Alternatives:</p>
                          <div className="flex gap-2 flex-wrap">
                            {product.alternatives.map((alt, aidx) => (
                              <span key={aidx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                {alt.brand} - KES {alt.price}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Dos */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">Do's</h3>
                </div>
                <ul className="space-y-3">
                  {recommendation.tips.dos.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-red-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">Don'ts</h3>
                </div>
                <ul className="space-y-3">
                  {recommendation.tips.donts.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={24} />
                  <h3 className="text-xl font-bold">Pro Tips</h3>
                </div>
                <ul className="space-y-3">
                  {recommendation.tips.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Star size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to transform your hair?</h3>
              <p className="mb-6">Start your personalized routine today and see results in weeks!</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    setRecommendation(null);
                    setHairImage(null);
                    setHairAnalysis(null);
                    setShowUploadSection(true);
                  }}
                  className="px-8 py-3 bg-white bg-opacity-20 text-white rounded-xl font-semibold hover:bg-opacity-30 transition-all border-2 border-white"
                >
                  Analyze New Photo
                </button>
                <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Save My Routine
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

