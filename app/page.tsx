'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';

// Custom loader with stroke animation
const LoaderSVG = () => (
  <div className="text-center animate-fade-in">
    <svg 
      width="150" 
      height="150" 
      viewBox="0 0 81 77" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      preserveAspectRatio="xMidYMid meet"
      className="block mx-auto mb-8"
    >
      <defs>
        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path 
        className="animated-path" 
        d="M26.4966 2.48801C26.3951 2.53364 19 5.49999 16.9876 6.83816C14.9751 8.17632 12.5 8.99998 11 10.5C9.5 12 8.99996 12.5 6.99998 15C4.99999 17.5 3.37849 22 2.49998 25C1.62146 28 1.4946 31.8377 1.62146 34C1.7588 36.3409 2.43922 39.7477 4.99999 44.5C6.82391 47.8848 11.324 50.4672 13.912 50.9836C16.5 51.5 18.739 52.5752 27.4314 52.3941C30.6672 52.3267 33.607 51.305 37.7457 49.8486C42.891 48.0379 45.9529 46.2163 46.875 45.6195C49.5 43.9205 50.7563 41.0973 51.4698 38.7876C52.0196 37.0077 51.259 35.1854 50.1632 33.8197C48.365 31.5788 43.594 30.5623 39 34.5C35.5 37.5 35.1779 38.9373 33.3263 43.0524C31.1063 47.986 30.7288 51.8903 30.6185 53.7675C30.4765 56.1835 30.886 58.0631 31.4959 59.8257C32.6579 63.1839 34.1784 65.9852 35.4366 67.8103C38.9107 72.8493 42.4709 74.0663 44.473 74.7322C47.2709 75.6628 52.7689 74.3876 57.9048 72.796C61.2178 71.7692 65.7232 69.5839 68.1525 68.3926C70.5817 67.2014 70.7364 66.8879 70.7973 66.5293C70.9233 65.7867 70.5795 64.9206 70.0774 64.14C69.8357 63.7643 69.3855 63.6101 69.026 63.5327C67.0206 63.1012 64.5379 65.1637 63.7591 66.2724C62.2038 68.4866 65.3164 71.8607 66.8905 73.2153C69.8084 74.7556 71.1363 74.9986 73.0121 75.015C74.2992 75.0036 76.2669 74.9524 78.6547 74.461"
      />
    </svg>
    <h2 className="text-3xl font-normal" style={{ color: '#c22a9f' }}>
      Curating your hair care routine
    </h2>
  </div>
);

// Original coil SVG for landing page
const CoilSVG = () => (
  <svg version="1.1" viewBox="0 0 848 1008" className="w-24 h-28 mx-auto mb-2">
    <defs>
      <linearGradient id="coilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <path fill="url(#coilGradient)" opacity="1.000000" stroke="none" 
      d="
M418.117828,82.304749 
	C404.651764,81.515762 394.465210,88.399132 383.992218,94.581772 
	C359.878662,108.816994 338.972656,127.187943 318.192749,145.691010 
	C302.386749,159.765137 286.923401,174.249374 272.343567,189.581802 
	C246.035187,217.248169 223.680328,247.910080 206.158173,281.854980 
	C198.114990,297.436646 194.355682,314.717285 189.169281,331.410522 
	C182.785477,351.957855 180.235367,372.968597 179.913193,394.428802 
	C179.690659,409.252350 179.618134,424.085541 179.184708,438.900909 
	C178.281845,469.763153 186.642181,498.486420 198.455032,526.489929 
	C206.883560,546.470642 218.715195,564.327942 232.702301,580.804565 
	C234.367706,582.766418 235.674911,585.264648 238.476730,586.019226 
	C240.384613,584.573792 239.688141,582.590942 239.688858,580.873413 
	C239.698700,557.377991 239.947403,533.887573 240.881210,510.407990 
	C242.309753,474.488831 252.971863,441.984192 274.675323,412.876129 
	C295.616180,384.790833 319.419495,360.024811 349.261200,341.386047 
	C365.827026,331.039154 384.501923,326.778473 403.240692,322.748199 
	C427.770203,317.472443 452.575409,318.927429 477.379395,319.655701 
	C507.850922,320.550385 538.198303,322.332764 568.317566,327.494446 
	C582.934631,329.999481 593.243164,337.823273 600.820984,350.047424 
	C611.572327,367.390900 617.071960,386.817322 623.227539,406.008240 
	C631.604065,432.123657 629.974304,458.994843 629.717896,485.788696 
	C629.537415,504.660980 627.961670,523.328613 623.602539,541.774902 
	C617.798340,566.335815 608.503296,589.404175 594.938538,610.652039 
	C578.891174,635.788757 555.139038,651.508850 528.426941,663.075439 
	C503.086182,674.048218 476.224152,678.638550 448.784698,680.270569 
	C428.789032,681.459778 408.809113,680.913818 388.893250,679.174377 
	C364.149139,677.013245 339.782379,672.496704 315.823120,665.883850 
	C314.554565,665.533691 313.345551,664.901672 311.303162,665.429993 
	C312.162201,668.201172 313.001526,670.969116 313.877411,673.725403 
	C325.634399,710.723450 346.172882,742.794434 370.867615,772.157532 
	C386.789520,791.089294 407.589325,802.785522 432.628784,805.733826 
	C451.362793,807.939758 470.226440,808.612793 489.003113,807.494446 
	C505.027740,806.540161 520.104431,801.922424 531.853088,789.797913 
	C536.765198,784.728577 540.126648,778.922546 541.317688,771.992249 
	C542.163025,767.073975 545.570068,767.229797 549.215698,767.462219 
	C553.671387,767.746216 553.542725,770.872375 553.154053,773.965637 
	C550.737183,793.197693 538.778137,804.412292 521.606873,811.071533 
	C510.917633,815.216919 499.593323,816.665039 488.301727,816.942627 
	C461.333405,817.605530 434.335938,818.136719 407.499847,814.197388 
	C375.967682,809.568787 346.379059,799.429199 323.749146,776.445740 
	C296.003845,748.266846 273.125000,716.346619 259.508240,678.549988 
	C255.212784,666.626892 250.879181,654.752014 247.934921,642.417236 
	C247.369247,640.047424 246.505768,638.183167 244.254913,636.827881 
	C215.599762,619.575317 192.255234,596.254517 171.097549,570.827393 
	C145.984390,540.646606 130.934052,505.462006 123.311707,467.070862 
	C121.652916,458.716095 121.786186,450.169952 121.756691,441.663971 
	C121.665985,415.507629 121.288910,389.326569 124.729012,363.325684 
	C127.589836,341.703125 135.684204,321.504883 142.505615,300.970306 
	C150.082764,278.160736 163.581146,258.832031 177.570282,239.642654 
	C215.386780,187.768494 262.744202,145.687057 313.580444,107.345352 
	C333.028320,92.677368 354.748749,81.281487 378.705200,75.465942 
	C396.491638,71.148209 414.672607,71.821228 432.836578,73.318634 
	C456.962494,75.307526 479.785675,82.503700 502.552734,90.028885 
	C504.379120,90.632561 506.564209,90.957016 507.099030,93.993576 
	C501.213318,98.428444 494.401642,97.984306 487.840759,96.376236 
	C474.267242,93.049362 460.975159,88.616318 447.283478,85.711258 
	C437.821289,83.703598 428.273956,82.380119 418.117828,82.304749 
M435.981049,329.291046 
	C417.536926,332.752014 400.459503,339.300476 385.691376,351.233093 
	C364.549896,368.315552 346.615936,388.176208 330.990906,410.498444 
	C310.881897,439.226593 299.998108,470.542664 298.810730,505.582825 
	C298.336609,519.573608 298.536560,533.573303 297.803375,547.548340 
	C296.235901,577.427185 296.885406,607.156006 303.371002,636.528442 
	C303.931793,639.068298 304.766449,641.157593 307.476776,642.294373 
	C317.152008,646.352234 326.567627,651.103699 336.421295,654.647949 
	C369.508575,666.549255 403.682037,672.033325 438.882568,670.895874 
	C465.173218,670.046265 490.882324,666.636414 515.215881,655.702698 
	C537.728333,645.587280 559.584717,634.321899 575.729675,615.147095 
	C599.557922,586.847107 612.102173,553.326660 617.674805,517.128784 
	C620.829041,496.640503 619.693176,475.895020 619.689331,455.246521 
	C619.687012,442.908386 618.783630,430.654938 615.770996,418.586517 
	C610.608765,397.906891 603.283936,378.114380 591.508850,360.269409 
	C582.792969,347.060638 571.274475,336.434204 555.100037,334.426483 
	C515.877502,329.557861 476.414825,328.336761 435.981049,329.291046 
z"/>
  </svg>
);

export default function RefinedHairProfileForm() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hairType: '',
    porosity: '',
    concerns: [] as string[],
    currentStyle: '',
    desiredStyle: '',
    length: '',
    vibe: '',
    duration: '',
    goals: [] as string[], // Keep for backward compatibility with API
    durationPreference: '30 minutes', // Keep for backward compatibility
    ethnicity: 'Black Woman' // Keep for backward compatibility
  });

  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  // Scroll to top of form when step changes
  useEffect(() => {
    if (formRef.current && !showLanding) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, showLanding]);

  // Expanded hair type options with descriptions
  const hairTypes = [
    {
      code: '4c',
      name: 'Type 4C',
      description: 'Tightly coiled, Z-pattern, 75%+ shrinkage',
      visual: '🌀🌀🌀',
      isCoil: true
    },
    {
      code: '4b',
      name: 'Type 4B',
      description: 'Sharp Z-pattern coils, 70-75% shrinkage',
      visual: '🌀🌀',
      isCoil: true
    },
    {
      code: '4a',
      name: 'Type 4A',
      description: 'Defined S-curls, springy, 50-70% shrinkage',
      visual: '🌀',
      isCoil: true
    },
    {
      code: '3c',
      name: 'Type 3C',
      description: 'Tight corkscrew curls, 30-50% shrinkage',
      visual: '∼∼',
      isCoil: false
    },
    {
      code: '3b',
      name: 'Type 3B',
      description: 'Loose corkscrew curls, bouncy ringlets',
      visual: '∼',
      isCoil: false
    },
    {
      code: '3a',
      name: 'Type 3A',
      description: 'Loose spiral curls, defined wave pattern',
      visual: '~',
      isCoil: false
    }
  ];

  // Porosity options with quiz helper
  const porosityOptions = [
    {
      level: 'low',
      name: 'Low Porosity',
      description: 'Products sit on hair, water beads up',
      tip: 'Best with: Lightweight products, heat for absorption'
    },
    {
      level: 'normal',
      name: 'Normal Porosity',
      description: 'Balanced moisture, holds styles well',
      tip: 'Best with: Most products work great'
    },
    {
      level: 'high',
      name: 'High Porosity',
      description: 'Absorbs quickly, dries fast, prone to frizz',
      tip: 'Best with: Heavy sealants, protein treatments'
    },
    {
      level: 'unsure',
      name: "I'm Not Sure",
      description: "We'll recommend balanced products",
      tip: 'Tip: Drop hair in water - sinks fast = high, floats = low'
    }
  ];

  // African hair-specific concerns
  const concernOptions = [
    { id: 'dryness', label: 'Dryness & Brittle Ends', icon: '💧' },
    { id: 'shrinkage', label: 'Managing Shrinkage', icon: '📏' },
    { id: 'breakage', label: 'Breakage & Weak Strands', icon: '⚡' },
    { id: 'scalp', label: 'Scalp Health (Dryness/Itching)', icon: '🌿' },
    { id: 'edges', label: 'Thinning Edges', icon: '👑' },
    { id: 'growth', label: 'Length Retention', icon: '📈' },
    { id: 'definition', label: 'Curl Definition', icon: '✨' },
    { id: 'frizz', label: 'Frizz Control', icon: '🌪️' }
  ];

  // Categorized styles
  const styleCategories = {
    protective: {
      label: 'Protective Styles',
      subtitle: 'Low maintenance, hide natural texture',
      styles: [
        { name: 'Box Braids', duration: '6-8 weeks', maintenance: 'Low', image: '/images/styles/box-braids.jpg' },
        { name: 'Passion Twists', duration: '4-6 weeks', maintenance: 'Low', image: '/images/styles/passion-twists.jpg' },
        { name: 'Senegalese Twists', duration: '6-8 weeks', maintenance: 'Low', image: '/images/styles/senegalese-twists.jpg' },
        { name: 'Faux Locs', duration: '8-12 weeks', maintenance: 'Very Low', image: '/images/styles/faux-locs.jpg' },
        { name: 'Cornrows', duration: '2-4 weeks', maintenance: 'Low', image: '/images/styles/cornrows.jpg' },
        { name: 'Knotless Braids', duration: '4-6 weeks', maintenance: 'Low', image: '/images/styles/knotless-braids.jpg' },
        { name: 'Goddess Locs', duration: '6-8 weeks', maintenance: 'Low', image: '/images/styles/goddess-locs.jpg' }
      ]
    },
    natural: {
      label: 'Natural Styles',
      subtitle: 'Show your texture, embrace shrinkage',
      styles: [
        { name: 'Wash and Go', duration: '3-5 days', maintenance: 'Medium', image: '/images/styles/wash-and-go.jpg' },
        { name: 'Twist Out', duration: '3-7 days', maintenance: 'Low', image: '/images/styles/twist-out.jpg' },
        { name: 'Bantu Knot Out', duration: '3-5 days', maintenance: 'Medium', image: '/images/styles/bantu-knot-out.jpg' },
        { name: 'Braid Out', duration: '5-7 days', maintenance: 'Low', image: '/images/styles/braid-out.jpg' },
        { name: 'High Puff', duration: '1-2 days', maintenance: 'Low', image: '/images/styles/high-puff.jpg' },
        { name: 'Afro/TWA', duration: 'Daily', maintenance: 'High', image: '/images/styles/afro-twa.jpg' },
        { name: 'Finger Coils', duration: '1 week', maintenance: 'Medium', image: '/images/styles/finger-coils.jpg' }
      ]
    },
    lowManipulation: {
      label: 'Low Manipulation',
      subtitle: 'Minimal styling, gentle on hair',
      styles: [
        { name: 'Two-Strand Twists', duration: '1-2 weeks', maintenance: 'Low', image: '/images/styles/two-strand-twists.jpg' },
        { name: 'Bantu Knots', duration: '1 week', maintenance: 'Low', image: '/images/styles/bantu-knots.jpg' },
        { name: 'Mini Twists', duration: '2-4 weeks', maintenance: 'Very Low', image: '/images/styles/mini-twists.jpg' },
        { name: 'Flat Twists', duration: '1-2 weeks', maintenance: 'Low', image: '/images/styles/flat-twists.jpg' }
      ]
    }
  };

  // Length options with shrinkage context
  const lengthOptions = [
    { value: 'ear', label: 'Ear-Length', stretched: '2-4 inches', shrunken: 'Close-cropped when natural' },
    { value: 'chin', label: 'Chin-Length', stretched: '4-6 inches', shrunken: 'Ear-length when natural' },
    { value: 'shoulder', label: 'Shoulder-Length', stretched: '6-10 inches', shrunken: 'Chin-length when natural' },
    { value: 'bra-strap', label: 'Bra-Strap Length', stretched: '10-16 inches', shrunken: 'Shoulder-length when natural' },
    { value: 'mid-back', label: 'Mid-Back', stretched: '16-22 inches', shrunken: 'Bra-strap when natural' }
  ];

  // Culturally relevant vibes
  const vibeOptions = [
    { 
      id: 'professional', 
      name: 'Corporate Professional', 
      emoji: '💼',
      description: 'Office-ready, polished, clean aesthetic'
    },
    { 
      id: 'editorial', 
      name: 'Magazine Editorial', 
      emoji: '📸',
      description: 'Bold, fashion-forward, dramatic'
    },
    { 
      id: 'everyday', 
      name: 'Everyday Natural', 
      emoji: '☀️',
      description: 'Casual, authentic, comfortable'
    },
    { 
      id: 'celebration', 
      name: 'Special Occasion', 
      emoji: '✨',
      description: 'Weddings, events, elegant'
    },
    { 
      id: 'workout', 
      name: 'Active Lifestyle', 
      emoji: '💪',
      description: 'Gym-ready, practical, secure'
    }
  ];

  const handleConcernToggle = (concernId: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concernId)
        ? prev.concerns.filter(c => c !== concernId)
        : prev.concerns.length < 3
        ? [...prev.concerns, concernId]
        : prev.concerns
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hairType || !formData.desiredStyle || !formData.vibe) {
      alert('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      // Map concerns to goals for backward compatibility
      const mappedGoals = formData.concerns.map(concern => {
        const mapping: Record<string, string> = {
          'dryness': 'Moisture',
          'shrinkage': 'Definition',
          'breakage': 'Strength',
          'scalp': 'Repair',
          'edges': 'Growth',
          'growth': 'Growth',
          'definition': 'Definition',
          'frizz': 'Shine'
        };
        return mapping[concern] || 'Moisture';
      });

      const apiPayload = {
        ...formData,
        goals: mappedGoals.length > 0 ? mappedGoals : ['Moisture', 'Growth'],
        currentStyle: formData.desiredStyle // Use desired style as current for API
      };

      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Store results and form data in sessionStorage
        sessionStorage.setItem('recommendation', JSON.stringify(result.data));
        sessionStorage.setItem('hairType', formData.hairType);
        sessionStorage.setItem('currentStyle', formData.desiredStyle);
        sessionStorage.setItem('ethnicity', formData.ethnicity);
        sessionStorage.setItem('length', formData.length);
        sessionStorage.setItem('vibe', formData.vibe);
        sessionStorage.setItem('porosity', formData.porosity);
        sessionStorage.setItem('concerns', JSON.stringify(formData.concerns));
        router.push('/results');
      } else {
        alert('Failed to generate recommendation. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - Only show when not on landing and not loading */}
      {!showLanding && !loading && (
        <header className="backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg version="1.1" viewBox="0 0 848 1008" className="w-8 h-10">
                <defs>
                  <linearGradient id="navCoilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path fill="url(#navCoilGradient)" opacity="1.000000" stroke="none" 
                  d="
M418.117828,82.304749 
	C404.651764,81.515762 394.465210,88.399132 383.992218,94.581772 
	C359.878662,108.816994 338.972656,127.187943 318.192749,145.691010 
	C302.386749,159.765137 286.923401,174.249374 272.343567,189.581802 
	C246.035187,217.248169 223.680328,247.910080 206.158173,281.854980 
	C198.114990,297.436646 194.355682,314.717285 189.169281,331.410522 
	C182.785477,351.957855 180.235367,372.968597 179.913193,394.428802 
	C179.690659,409.252350 179.618134,424.085541 179.184708,438.900909 
	C178.281845,469.763153 186.642181,498.486420 198.455032,526.489929 
	C206.883560,546.470642 218.715195,564.327942 232.702301,580.804565 
	C234.367706,582.766418 235.674911,585.264648 238.476730,586.019226 
	C240.384613,584.573792 239.688141,582.590942 239.688858,580.873413 
	C239.698700,557.377991 239.947403,533.887573 240.881210,510.407990 
	C242.309753,474.488831 252.971863,441.984192 274.675323,412.876129 
	C295.616180,384.790833 319.419495,360.024811 349.261200,341.386047 
	C365.827026,331.039154 384.501923,326.778473 403.240692,322.748199 
	C427.770203,317.472443 452.575409,318.927429 477.379395,319.655701 
	C507.850922,320.550385 538.198303,322.332764 568.317566,327.494446 
	C582.934631,329.999481 593.243164,337.823273 600.820984,350.047424 
	C611.572327,367.390900 617.071960,386.817322 623.227539,406.008240 
	C631.604065,432.123657 629.974304,458.994843 629.717896,485.788696 
	C629.537415,504.660980 627.961670,523.328613 623.602539,541.774902 
	C617.798340,566.335815 608.503296,589.404175 594.938538,610.652039 
	C578.891174,635.788757 555.139038,651.508850 528.426941,663.075439 
	C503.086182,674.048218 476.224152,678.638550 448.784698,680.270569 
	C428.789032,681.459778 408.809113,680.913818 388.893250,679.174377 
	C364.149139,677.013245 339.782379,672.496704 315.823120,665.883850 
	C314.554565,665.533691 313.345551,664.901672 311.303162,665.429993 
	C312.162201,668.201172 313.001526,670.969116 313.877411,673.725403 
	C325.634399,710.723450 346.172882,742.794434 370.867615,772.157532 
	C386.789520,791.089294 407.589325,802.785522 432.628784,805.733826 
	C451.362793,807.939758 470.226440,808.612793 489.003113,807.494446 
	C505.027740,806.540161 520.104431,801.922424 531.853088,789.797913 
	C536.765198,784.728577 540.126648,778.922546 541.317688,771.992249 
	C542.163025,767.073975 545.570068,767.229797 549.215698,767.462219 
	C553.671387,767.746216 553.542725,770.872375 553.154053,773.965637 
	C550.737183,793.197693 538.778137,804.412292 521.606873,811.071533 
	C510.917633,815.216919 499.593323,816.665039 488.301727,816.942627 
	C461.333405,817.605530 434.335938,818.136719 407.499847,814.197388 
	C375.967682,809.568787 346.379059,799.429199 323.749146,776.445740 
	C296.003845,748.266846 273.125000,716.346619 259.508240,678.549988 
	C255.212784,666.626892 250.879181,654.752014 247.934921,642.417236 
	C247.369247,640.047424 246.505768,638.183167 244.254913,636.827881 
	C215.599762,619.575317 192.255234,596.254517 171.097549,570.827393 
	C145.984390,540.646606 130.934052,505.462006 123.311707,467.070862 
	C121.652916,458.716095 121.786186,450.169952 121.756691,441.663971 
	C121.665985,415.507629 121.288910,389.326569 124.729012,363.325684 
	C127.589836,341.703125 135.684204,321.504883 142.505615,300.970306 
	C150.082764,278.160736 163.581146,258.832031 177.570282,239.642654 
	C215.386780,187.768494 262.744202,145.687057 313.580444,107.345352 
	C333.028320,92.677368 354.748749,81.281487 378.705200,75.465942 
	C396.491638,71.148209 414.672607,71.821228 432.836578,73.318634 
	C456.962494,75.307526 479.785675,82.503700 502.552734,90.028885 
	C504.379120,90.632561 506.564209,90.957016 507.099030,93.993576 
	C501.213318,98.428444 494.401642,97.984306 487.840759,96.376236 
	C474.267242,93.049362 460.975159,88.616318 447.283478,85.711258 
	C437.821289,83.703598 428.273956,82.380119 418.117828,82.304749 
M435.981049,329.291046 
	C417.536926,332.752014 400.459503,339.300476 385.691376,351.233093 
	C364.549896,368.315552 346.615936,388.176208 330.990906,410.498444 
	C310.881897,439.226593 299.998108,470.542664 298.810730,505.582825 
	C298.336609,519.573608 298.536560,533.573303 297.803375,547.548340 
	C296.235901,577.427185 296.885406,607.156006 303.371002,636.528442 
	C303.931793,639.068298 304.766449,641.157593 307.476776,642.294373 
	C317.152008,646.352234 326.567627,651.103699 336.421295,654.647949 
	C369.508575,666.549255 403.682037,672.033325 438.882568,670.895874 
	C465.173218,670.046265 490.882324,666.636414 515.215881,655.702698 
	C537.728333,645.587280 559.584717,634.321899 575.729675,615.147095 
	C599.557922,586.847107 612.102173,553.326660 617.674805,517.128784 
	C620.829041,496.640503 619.693176,475.895020 619.689331,455.246521 
	C619.687012,442.908386 618.783630,430.654938 615.770996,418.586517 
	C610.608765,397.906891 603.283936,378.114380 591.508850,360.269409 
	C582.792969,347.060638 571.274475,336.434204 555.100037,334.426483 
	C515.877502,329.557861 476.414825,328.336761 435.981049,329.291046 
z"/>
              </svg>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nywele.ai
                </h1>
                <p className="text-gray-600 text-sm">AI-Powered African Hair Care</p>
              </div>
            </div>
            <Link 
              href="/how-it-works"
              className="font-semibold hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
              style={{ color: '#c22a9f' }}
            >
              How It Works
            </Link>
          </div>
        </header>
      )}

      <div className={showLanding || loading ? "flex items-center justify-center min-h-screen px-4" : "max-w-3xl mx-auto py-12 px-4"}>
        {showLanding ? (
          /* Landing Screen */
          <div className="p-12 text-center max-w-2xl w-full animate-fade-in">
            <CoilSVG />
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
              Nywele.ai
            </h1>
            
            <h2 className="text-4xl font-normal mb-4" style={{ color: '#c22a9f' }}>
              Get Your Hair Care Tips
            </h2>
            
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#c22a9f' }}>
              Personalized recommendations powered by AI. Discover the perfect routine, 
              products, and styles for your unique hair texture.
            </p>
            
            <div className="flex gap-8 justify-center">
              <button
                onClick={() => setShowLanding(false)}
                className="font-semibold text-lg hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
                style={{ color: '#c22a9f' }}
              >
                Get Started
              </button>
              
              <Link
                href="/how-it-works"
                className="font-semibold text-lg hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
                style={{ color: '#c22a9f' }}
              >
                How It Works
              </Link>
            </div>
          </div>
        ) : loading ? (
          /* Loading Screen with Custom Loader */
          <LoaderSVG />
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-8 animate-fade-in">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-purple-600">Step {step} of 4</span>
            <span className="text-sm text-purple-600">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-h-[65vh] overflow-y-auto animate-fade-in">
          {/* Step 1: Hair Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-[#C87726] mb-2">Your Hair Profile</h2>
                <p className="text-[#C87726]">Let's understand your beautiful texture</p>
              </div>

              {/* Hair Type */}
              <div>
                <label className="block text-lg font-bold text-[#C87726] mb-3">
                  1. Hair Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {hairTypes.map(type => (
                    <button
                      key={type.code}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hairType: type.code }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.hairType === type.code
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-[#FED9B4] hover:border-[#FED9B4]'
                      }`}
                    >
                      <div className={`text-2xl mb-1 ${formData.hairType === type.code ? 'text-[#FFEEDE]' : 'text-purple-600'}`}>{type.visual}</div>
                      <div className={`font-semibold ${formData.hairType === type.code ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{type.name}</div>
                      <div className={`text-xs mt-1 ${formData.hairType === type.code ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Porosity */}
              <div>
                <label className="block text-lg font-bold text-[#C87726] mb-1">
                  2. Hair Porosity
                </label>
                <div className="flex items-center gap-2 mb-3 text-xs text-[#C87726]">
                  <Info className="w-4 h-4" />
                  <span>How well your hair absorbs and retains moisture</span>
                </div>
                <div className="space-y-2">
                  {porosityOptions.map(option => (
                    <button
                      key={option.level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, porosity: option.level }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.porosity === option.level
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-[#FED9B4] hover:border-[#FED9B4]'
                      }`}
                    >
                      <div className={`font-semibold ${formData.porosity === option.level ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{option.name}</div>
                      <div className={`text-sm mt-1 ${formData.porosity === option.level ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{option.description}</div>
                      <div className={`text-xs mt-2 ${formData.porosity === option.level ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{option.tip}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-lg font-bold text-[#C87726] mb-3">
                  3. Current Length (Stretched)
                </label>
                <div className="space-y-2">
                  {lengthOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, length: option.value }))}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.length === option.value
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-[#FED9B4] hover:border-[#FED9B4]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-semibold ${formData.length === option.value ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{option.label}</div>
                          <div className={`text-xs ${formData.length === option.value ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{option.stretched} stretched • {option.shrunken}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Concerns */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-[#C87726] mb-2">What Are Your Goals?</h2>
                <p className="text-[#C87726]">Select up to 3 main concerns</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {concernOptions.map(concern => (
                  <button
                    key={concern.id}
                    type="button"
                    onClick={() => handleConcernToggle(concern.id)}
                    disabled={!formData.concerns.includes(concern.id) && formData.concerns.length >= 3}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.concerns.includes(concern.id)
                        ? 'border-purple-600 bg-purple-600'
                        : formData.concerns.length >= 3
                        ? 'border-[#FED9B4] opacity-50 cursor-not-allowed'
                        : 'border-[#FED9B4] hover:border-[#FED9B4]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{concern.icon}</div>
                    <div className={`font-semibold text-sm ${formData.concerns.includes(concern.id) ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{concern.label}</div>
                  </button>
                ))}
              </div>

              <div className="text-sm text-[#C87726] text-center">
                {formData.concerns.length}/3 selected
              </div>
            </div>
          )}

          {/* Step 3: Style Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-[#C87726] mb-2">Choose Your Style</h2>
                <p className="text-[#C87726]">What look are you going for?</p>
              </div>

              {Object.entries(styleCategories).map(([key, category]) => (
                <div key={key} className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#C87726]">{category.label}</h3>
                    <p className="text-sm text-[#C87726]">{category.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                    {category.styles.map(style => (
                      <button
                        key={style.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          desiredStyle: style.name,
                          duration: style.duration 
                        }))}
                        className={`aspect-square rounded-full border-2 text-center transition-all overflow-hidden relative ${
                          formData.desiredStyle === style.name
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-[#FED9B4] hover:border-[#FED9B4]'
                        }`}
                      >
                        <img
                          src={style.image}
                          alt={style.name}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-8">
                          <div className={`font-semibold text-xs ${formData.desiredStyle === style.name ? 'text-[#FFEEDE]' : 'text-white'}`}>{style.name}</div>
                          <div className={`text-[10px] mt-1 ${formData.desiredStyle === style.name ? 'text-[#FFEEDE]' : 'text-white/90'}`}>
                            {style.duration}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Vibe */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-[#C87726] mb-2">Set the Vibe</h2>
                <p className="text-[#C87726]">What's the occasion or aesthetic?</p>
              </div>

              <div className="space-y-3">
                {vibeOptions.map(vibe => (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, vibe: vibe.id }))}
                    className={`w-full p-5 rounded-lg border-2 text-left transition-all ${
                      formData.vibe === vibe.id
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-[#FED9B4] hover:border-[#FED9B4]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{vibe.emoji}</div>
                      <div>
                        <div className={`font-semibold ${formData.vibe === vibe.id ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{vibe.name}</div>
                        <div className={`text-sm mt-1 ${formData.vibe === vibe.id ? 'text-[#FFEEDE]' : 'text-[#C87726]'}`}>{vibe.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-6 py-3 text-purple-600 hover:bg-purple-50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            
            <div className="ml-auto">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!formData.hairType || !formData.porosity || !formData.length)) ||
                    (step === 2 && formData.concerns.length === 0) ||
                    (step === 3 && !formData.desiredStyle)
                  }
                  className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.vibe || loading}
                  className="px-8 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Get My Recommendations ✨'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
