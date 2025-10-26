'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

export default function Home() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const homeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const introTl = gsap.timeline({
      onComplete: () => {
        console.log('Intro complete, redirecting...');
        // Redirect to how it works page
        router.push('/how-it-works');
      }
    });

    // 1. Show and fade in blobs with stagger
    introTl.add(() => {
      document.querySelectorAll('.intro-blob').forEach(blob => {
        blob.classList.add('visible');
      });
    })
    .to('.intro-blob', {
      opacity: 1,
      visibility: 'visible',
      duration: 1.5,
      ease: 'power2.out',
      stagger: 0.4
    }, 0);

    // 2. Blob pulsing animations (continuous, but limited to 2 cycles)
    gsap.to('.intro-blob-1', {
      scale: 1.05,
      opacity: 0.4,
      duration: 2,
      ease: 'sine.inOut',
      repeat: 2,
      yoyo: true
    });

    gsap.to('.intro-blob-2', {
      scale: 1.03,
      opacity: 0.6,
      duration: 1.8,
      ease: 'sine.inOut',
      repeat: 2,
      yoyo: true,
      delay: 0.5
    });

    gsap.to('.intro-blob-3', {
      scale: 1.04,
      opacity: 0.8,
      duration: 1.9,
      ease: 'sine.inOut',
      repeat: 2,
      yoyo: true,
      delay: 0.3
    });

    // 3. Show loading bar
    introTl.to('.loading-bar-container', {
      opacity: 1,
      duration: 0.5
    }, 1.2);

    introTl.to('.loading-text', {
      opacity: 1,
      duration: 0.5
    }, 1.2);

    // 4. Fill loading bar
    introTl.to('.loading-bar', {
      width: '100%',
      duration: 2,
      ease: 'power1.inOut'
    }, 1.5);

    // 5. Show title
    introTl.to('.intro-title', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, 1.8);

    // 6. Show subtitle
    introTl.to('.intro-subtitle', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, 2.3);

    // 7. Scale up title slightly
    introTl.to('.intro-title', {
      scale: 1.05,
      duration: 0.5,
      ease: 'power2.inOut'
    }, 3.5);

    // 7.5. HOLD STATE LONGER FOR DEBUGGING (10 seconds hold)
    introTl.to({}, { duration: 10 }, 4.0);

    // 8. Fade out everything
    introTl.to('.intro-overlay-content', {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        console.log('Fade out complete');
      }
    }, 14.2);

  }, [router]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          width: 100vw;
          background: #FDF4E8;
          font-family: 'Bricolage Grotesque', sans-serif;
          overflow: hidden;
        }

        .home-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: #FDF4E8;
          overflow: hidden;
        }

        /* Wavy Hair Pattern Background Image */
        .wave-patterns {
          position: absolute;
          width: 150vmax;
          height: 150vmax;
          left: 27%;
          top: 103%;
          transform: translate(-50%, -50%) rotate(10deg);
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg width='500' height='1024' viewBox='0 0 500 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M136.159 -64.5C495.422 135 532.329 334.5 246.879 534C-38.5715 733.5 -75.4781 933 136.159 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M149.069 -64.5C495.646 135 526.209 334.5 240.759 534C-44.6907 733.5 -75.2541 933 149.069 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M162.277 -64.5C496.167 135 520.387 334.5 234.937 534C-50.5129 733.5 -74.7329 933 162.277 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M175.761 -64.5C496.964 135 514.841 334.5 229.391 534C-56.0589 733.5 -73.9356 933 175.761 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M189.502 -64.5C498.019 135 509.552 334.5 224.102 534C-61.3482 733.5 -72.8815 933 189.502 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M203.482 -64.5C499.312 135 504.502 334.5 219.052 534C-66.3979 733.5 -71.5879 933 203.482 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M217.686 -64.5C500.829 135 499.676 334.5 214.226 534C-71.224 733.5 -70.0707 933 217.686 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M232.099 -64.5C502.556 135 495.059 334.5 209.609 534C-75.841 733.5 -68.3444 933 232.099 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M246.708 -64.5C504.478 135 490.638 334.5 205.188 534C-80.2623 733.5 -66.4223 933 246.708 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M261.5 -64.5C506.583 135 486.4 334.5 200.95 534C-84.4999 733.5 -64.3166 933 261.5 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M276.465 -64.5C508.862 135 482.335 334.5 196.885 534C-88.5651 733.5 -62.0384 933 276.465 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M291.592 -64.5C511.302 135 478.432 334.5 192.982 534C-92.4681 733.5 -59.5981 933 291.592 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M306.871 -64.5C513.895 135 474.681 334.5 189.231 534C-96.2186 733.5 -57.0052 933 306.871 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M322.295 -64.5C516.631 135 471.075 334.5 185.625 534C-99.8252 733.5 -54.2686 933 322.295 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M337.854 -64.5C519.504 135 467.604 334.5 182.154 534C-103.296 733.5 -51.3962 933 337.854 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M353.541 -64.5C522.504 135 464.261 334.5 178.811 534C-106.639 733.5 -48.3956 933 353.541 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M369.345 -64.5C525.622 135 461.035 334.5 175.585 534C-109.865 733.5 -45.2779 933 369.345 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M385.268 -64.5C528.858 135 457.928 334.5 172.478 534C-112.972 733.5 -42.0421 933 385.268 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M401.299 -64.5C532.202 135 454.929 334.5 169.479 534C-115.971 733.5 -38.6976 933 401.299 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M417.433 -64.5C535.65 135 452.033 334.5 166.583 534C-118.867 733.5 -35.25 933 417.433 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M433.665 -64.5C539.195 135 449.235 334.5 163.785 534C-121.665 733.5 -31.7046 933 433.665 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M449.991 -64.5C542.834 135 446.531 334.5 161.081 534C-124.369 733.5 -28.0661 933 449.991 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M466.404 -64.5C546.561 135 443.914 334.5 158.464 534C-126.986 733.5 -24.3393 933 466.404 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-position: center center;
          background-repeat: no-repeat;
          background-size: 100% 100%;
        }

        /* Organic Blob Shapes - Centered */
        .blob-shape-outer {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: blobPulse 8s ease-in-out infinite;
          z-index: 2;
        }

        .blob-shape-middle {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: blobPulse 8s ease-in-out infinite;
          animation-delay: -2s;
          z-index: 3;
        }

        .blob-shape-inner {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: blobPulse 8s ease-in-out infinite;
          animation-delay: -4s;
          z-index: 2;
        }

        @keyframes blobPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05) rotate(2deg);
          }
        }

        /* Content Area */
        .content-area {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 600px;
        }

        .curl-icon {
          width: 81px;
          height: 77px;
          margin-bottom: 30px;
        }

        .logo-text {
          color: #7d3d00;
          font-size: 48px;
          font-family: 'Caprasimo', serif;
          font-weight: 400;
          margin-bottom: 16px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tagline {
          color: #8B4500;
          font-size: 24px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 400;
          margin-bottom: 40px;
          line-height: 1.4;
        }

        .cta-button {
          display: inline-block;
          padding: 16px 40px;
          background: #643100;
          border-radius: 16px;
          color: white;
          font-size: 16px;
          font-family: 'Caprasimo', serif;
          font-weight: 400;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(100, 49, 0, 0.3);
        }

        .cta-button:hover {
          background: #7d3d00;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(100, 49, 0, 0.4);
        }

        /* Intro Screen */
        .intro-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #FDF4E8;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
        }

        .intro-overlay-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
        }

        .blob-container {
          position: absolute;
          width: 500%;
          height: 500%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
        }

        .intro-blob {
          position: absolute;
          width: 420px;
          height: 420px;
          opacity: 0;
          visibility: hidden;
          display: none;
        }
        
        .intro-blob.visible {
          display: block;
          visibility: visible;
        }

        .intro-content {
          position: relative;
          text-align: center;
          z-index: 10;
        }

        .intro-title {
          font-size: 4em;
          font-weight: 700;
          letter-spacing: -2px;
          opacity: 0;
          transform: translateY(50px);
          color: #AF5500;
          font-family: 'Caprasimo', serif;
        }

        .intro-subtitle {
          font-size: 1.1em;
          font-weight: 300;
          margin-top: 8px;
          opacity: 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #AF5500;
          font-family: 'Bricolage Grotesque', sans-serif;
        }

        .loading-bar-container {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 2px;
          background: rgba(175, 85, 0, 0.2);
          border-radius: 2px;
          overflow: hidden;
          opacity: 0;
        }

        .loading-bar {
          width: 0%;
          height: 100%;
          background: #AF5500;
          border-radius: 2px;
        }

        .loading-text {
          position: absolute;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.9em;
          letter-spacing: 2px;
          opacity: 0;
          color: #AF5500;
          font-family: 'Bricolage Grotesque', sans-serif;
        }

        .home-container {
          opacity: 0;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .content-area {
            max-width: 500px;
            padding: 0 20px;
          }
        }

        @media (max-width: 768px) {
          .wave-patterns {
            background-size: cover;
          }

          .blob-shape-outer,
          .blob-shape-middle,
          .blob-shape-inner {
            left: 50%;
            top: 50%;
          }
          
          @keyframes blobPulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
            }
            50% {
              transform: translate(-50%, -50%) scale(0.63) rotate(2deg);
            }
          }

          .content-area {
            padding: 0 20px;
            max-width: 90%;
          }

          .logo-text {
            font-size: 36px;
          }

          .tagline {
            font-size: 18px;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 28px;
          }

          .tagline {
            font-size: 16px;
          }

          .cta-button {
            font-size: 14px;
            padding: 12px 32px;
          }

          .curl-icon {
            width: 60px;
            height: 56px;
          }
        }
      `}</style>

      {/* Intro Animation Screen */}
      {showIntro && (
        <div className="intro-screen">
          <div className="intro-overlay-content">
            {/* Background Blobs (centered, stacked) */}
            <div className="blob-container">
              {/* Blob 1 - Outer */}
              <svg 
                className="intro-blob intro-blob-1"
                viewBox="0 0 620 603" 
                fill="none"
              >
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M336.327 1.48572C414.231 9.60864 473.115 66.7872 518.604 130.55C574.65 209.11 638.43 296.033 612.844 389.082C584.309 492.855 495.991 583.359 389.609 599.667C291.749 614.669 219.14 525.124 143.712 460.998C79.7729 406.64 -0.331203 353.001 0.761041 269.085C1.81384 188.2 85.2711 142.397 148.515 91.962C205.675 46.3795 263.612 -6.09616 336.327 1.48572Z" 
                  stroke="#AF5500" 
                  strokeWidth="3"
                  fill="none"
                />
              </svg>

              {/* Blob 2 - Middle */}
              <svg 
                className="intro-blob intro-blob-2"
                viewBox="0 0 604 606" 
                fill="none"
              >
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M377.17 5.77053C452.755 26.3143 501.678 92.217 536.323 162.465C579.008 249.014 627.981 345.062 587.766 432.786C542.917 530.62 441.195 605.745 333.575 604.736C234.577 603.807 177.311 503.753 113.175 428.333C58.8083 364.4 -11.6287 298.579 2.94255 215.931C16.9875 136.267 106.724 104.48 177.255 64.8706C241 29.0722 306.62 -13.4049 377.17 5.77053Z" 
                  stroke="#AF5500" 
                  strokeWidth="3"
                  fill="none"
                />
              </svg>

              {/* Blob 3 - Inner */}
              <svg 
                className="intro-blob intro-blob-3"
                viewBox="0 0 624 605" 
                fill="none"
              >
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M390.524 3.70487C463.396 17.8137 515.846 77.3794 554.759 140.765C602.232 218.935 657.832 306.799 638.118 397.175C615.532 500.107 533.028 589.582 428.839 602.686C333.506 614.635 256.959 528.525 178.009 468.089C109.669 416.261 23.8254 368.185 7.61277 286.486C-7.94113 207.589 65.6438 152.13 128.074 97.3488C184.523 47.5069 322.675 -9.48221 390.524 3.70487Z" 
                  stroke="#AF5500" 
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* Intro Content */}
            <div className="intro-content">
              <h1 className="intro-title">nywele.ai</h1>
              <p className="intro-subtitle">African Hair Care Powered by AI</p>
            </div>

            {/* Loading Bar */}
            <div className="loading-text">Loading Experience</div>
            <div className="loading-bar-container">
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={homeContainerRef} className="home-container">
        {/* Wavy Hair Patterns - Background Image */}
        <div className="wave-patterns"></div>

        {/* Organic Blob Shape - Outer */}
        <svg 
          className="blob-shape-outer"
          width="620" 
          height="603" 
          viewBox="0 0 620 603" 
              fill="none" 
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M336.327 1.48572C414.231 9.60864 473.115 66.7872 518.604 130.55C574.65 209.11 638.43 296.033 612.844 389.082C584.309 492.855 495.991 583.359 389.609 599.667C291.749 614.669 219.14 525.124 143.712 460.998C79.7729 406.64 -0.331203 353.001 0.761041 269.085C1.81384 188.2 85.2711 142.397 148.515 91.962C205.675 46.3795 263.612 -6.09616 336.327 1.48572Z" 
            stroke="#AF5500" 
            strokeWidth="1.5"
          />
        </svg>

        {/* Organic Blob Shape - Middle (Filled) */}
        <svg 
          className="blob-shape-middle"
          width="604" 
          height="606" 
          viewBox="0 0 604 606" 
          fill="none"
        >
            <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M377.17 5.77053C452.755 26.3143 501.678 92.217 536.323 162.465C579.008 249.014 627.981 345.062 587.766 432.786C542.917 530.62 441.195 605.745 333.575 604.736C234.577 603.807 177.311 503.753 113.175 428.333C58.8083 364.4 -11.6287 298.579 2.94255 215.931C16.9875 136.267 106.724 104.48 177.255 64.8706C241 29.0722 306.62 -13.4049 377.17 5.77053Z" 
            fill="#AF5500" 
            fillOpacity="0.5" 
            stroke="#AF5500" 
            strokeWidth="2"
          />
        </svg>

        {/* Organic Blob Shape - Inner */}
        <svg 
          className="blob-shape-inner"
          width="597" 
          height="607" 
          viewBox="0 0 597 607" 
          fill="none"
        >
            <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M394.019 9.67684C467.955 35.5323 512.078 104.741 541.651 177.27C578.087 266.63 620.121 365.91 573.783 450.559C522.103 544.965 415.308 612.683 308.03 604.039C209.347 596.087 159.326 492.221 100.704 412.441C51.0106 344.812 -14.5781 274.158 5.82117 192.752C25.4836 114.286 117.249 88.9462 190.413 54.4418C256.538 23.2571 325.007 -14.4565 394.019 9.67684Z" 
            stroke="#AF5500" 
            strokeWidth="4"
          />
        </svg>

        {/* Content */}
        <div className="content-area">
          {/* Curl Icon */}
          <svg 
            className="curl-icon"
            width="81" 
            height="77" 
            viewBox="0 0 81 77" 
            fill="none"
          >
            <path 
              d="M26.4168 1.50037C26.3153 1.546 18.9202 4.51235 16.9078 5.85052C14.8953 7.18868 12.4202 8.01234 10.9202 9.51236C9.42023 11.0124 8.92019 11.5124 6.92021 14.0124C4.92022 16.5124 3.29872 21.0124 2.42021 24.0124C1.54169 27.0124 1.41483 30.8501 1.54169 33.0124C1.67903 35.3533 2.35945 38.7601 4.92022 43.5124C6.74414 46.8972 11.2442 49.4796 13.8322 49.996C16.4202 50.5124 18.6592 51.5876 27.3516 51.4065C30.5874 51.3391 33.5272 50.3174 37.6659 48.861C42.8112 47.0503 45.8731 45.2287 46.7952 44.6319C49.4202 42.9329 50.6765 40.1097 51.39 37.8C51.9398 36.0201 51.1792 34.1978 50.0834 32.8321C48.2852 30.5912 43.5142 29.5747 38.9202 33.5124C35.4202 36.5124 35.0981 37.9497 33.2465 42.0648C31.0265 46.9984 30.649 50.9027 30.5387 52.7799C30.3967 55.1959 30.8062 57.0755 31.4161 58.8381C32.5781 62.1963 34.0986 64.9976 35.3568 66.8227C38.8309 71.8617 42.3911 73.0787 44.3932 73.7446C47.1911 74.6752 52.6891 73.4 57.825 71.8084C61.138 70.7816 65.6434 68.5963 68.0727 67.405C70.5019 66.2138 70.6566 65.9003 70.7175 65.5417C70.8435 64.7991 70.4997 63.933 69.9976 63.1524C69.7559 62.7767 69.3057 62.6225 68.9462 62.5451C66.9408 62.1136 64.4581 64.1761 63.6793 65.2848C62.124 67.499 65.2366 70.8731 66.8107 72.2277C69.7286 73.768 71.0565 74.011 72.9323 74.0274C74.2194 74.016 76.1871 73.9648 78.5749 73.4734" 
              stroke="#7d3d00" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>

          <h1 className="logo-text">Nywele.ai</h1>
          <p className="tagline">AI-Powered African Hair care</p>
          
          <Link href="/hair-care" className="cta-button">
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
