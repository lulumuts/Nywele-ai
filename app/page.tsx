'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          width: 100vw;
          background: #FEF4E6;
          font-family: 'Arial', sans-serif;
          overflow: hidden;
        }

        .animation-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .blob {
          position: absolute;
          width: min(700px, 80vw);
          height: min(700px, 80vh);
          top: 53%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .blob-1 {
          opacity: 0.5;
          z-index: 3;
        }

        .blob-2 {
          opacity: 0.5;
          z-index: 2;
        }

        .blob-3 {
          opacity: 0.5;
          z-index: 1;
        }

        .blob path {
          animation: blobMorph 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: center;
        }

        .blob-2 path {
          animation: blobMorph 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          animation-delay: -1.5s;
        }

        .blob-3 path {
          animation: blobMorph 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          animation-delay: -3s;
        }

        @keyframes blobMorph {
          0% {
            d: path("M130,-140C165,-120,185,-75,195,-25C205,25,205,75,180,115C155,155,110,185,60,195C10,205,-40,195,-85,170C-130,145,-170,105,-185,55C-200,5,-190,-55,-160,-100C-130,-145,-80,-175,-25,-185C30,-195,95,-160,130,-140Z");
          }
          20% {
            d: path("M90,-155C130,-145,165,-110,185,-65C205,-20,210,30,190,75C170,120,135,160,90,175C45,190,0,180,-45,160C-90,140,-135,110,-160,65C-185,20,-190,-35,-170,-85C-150,-135,-110,-180,-55,-195C0,-210,50,-165,90,-155Z");
          }
          40% {
            d: path("M145,-115C175,-90,195,-45,200,5C205,55,195,110,165,145C135,180,85,195,30,195C-25,195,-80,180,-120,150C-160,120,-185,75,-190,20C-195,-35,-180,-95,-145,-135C-110,-175,-55,-195,5,-190C65,-185,115,-140,145,-115Z");
          }
          60% {
            d: path("M105,-160C145,-150,180,-115,195,-70C210,-25,205,25,185,70C165,115,130,155,85,175C40,195,-5,195,-55,175C-105,155,-160,115,-185,65C-210,15,-215,-45,-190,-95C-165,-145,-110,-185,-50,-190C10,-195,65,-170,105,-160Z");
          }
          80% {
            d: path("M135,-130C170,-105,190,-55,195,-5C200,45,190,100,160,140C130,180,80,205,25,205C-30,205,-85,180,-130,145C-175,110,-210,65,-215,10C-220,-45,-195,-105,-155,-145C-115,-185,-60,-205,0,-200C60,-195,100,-155,135,-130Z");
          }
          100% {
            d: path("M130,-140C165,-120,185,-75,195,-25C205,25,205,75,180,115C155,155,110,185,60,195C10,205,-40,195,-85,170C-130,145,-170,105,-185,55C-200,5,-190,-55,-160,-100C-130,-145,-80,-175,-25,-185C30,-195,95,-160,130,-140Z");
          }
        }

        .landing-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          text-align: center;
          color: #9E6240;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 90%;
        }

        .logo-img {
          width: clamp(60px, 10vw, 80px);
          height: clamp(60px, 10vw, 80px);
          margin: 0 0 20px 0;
        }

        .landing-content h1 {
          font-size: clamp(2rem, 6vw, 2.5em);
          margin: 0;
          padding: 0;
          width: 100%;
          font-family: "Caprasimo", serif;
        }

        .landing-content .subtitle {
          font-size: clamp(0.9rem, 2.5vw, 1.1em);
          margin: 15px 0 25px 0;
          padding: 0;
          opacity: 0.85;
          width: 100%;
          letter-spacing: 0.5px;
        }

        .landing-content .cta-button {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 24px;
          background-color: #9E6240;
          color: #FEF4E6;
          text-decoration: none;
          border-radius: 20px;
          font-size: clamp(0.85rem, 2vw, 0.95em);
          font-weight: 500;
          font-family: 'Arial', sans-serif;
          transition: all 0.3s ease;
          border: 2px solid #9E6240;
        }

        .landing-content .cta-button:hover {
          background-color: #644536;
          border-color: #644536;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(100, 69, 54, 0.3);
        }

        @media (max-width: 768px) {
          .blob {
            width: min(550px, 85vw);
            height: min(550px, 85vh);
          }
        }

        @media (max-width: 480px) {
          .blob {
            width: min(400px, 90vw);
            height: min(400px, 90vh);
          }
          
          .logo-img {
            width: 50px;
            height: 50px;
            margin-bottom: 15px;
          }
        }
      `}</style>

      <div className="animation-container">
        {/* SVG Blob 1 */}
        <svg className="blob blob-1" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path 
              d="M130,-140C165,-120,185,-75,195,-25C205,25,205,75,180,115C155,155,110,185,60,195C10,205,-40,195,-85,170C-130,145,-170,105,-185,55C-200,5,-190,-55,-160,-100C-130,-145,-80,-175,-25,-185C30,-195,95,-160,130,-140Z" 
              fill="none" 
              stroke="#9E6240" 
              strokeWidth="3" 
            />
          </g>
        </svg>

        {/* SVG Blob 2 */}
        <svg className="blob blob-2" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path 
              d="M130,-140C165,-120,185,-75,195,-25C205,25,205,75,180,115C155,155,110,185,60,195C10,205,-40,195,-85,170C-130,145,-170,105,-185,55C-200,5,-190,-55,-160,-100C-130,-145,-80,-175,-25,-185C30,-195,95,-160,130,-140Z" 
              fill="none" 
              stroke="#9E6240" 
              strokeWidth="1" 
            />
          </g>
        </svg>

        {/* SVG Blob 3 */}
        <svg className="blob blob-3" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path 
              d="M130,-140C165,-120,185,-75,195,-25C205,25,205,75,180,115C155,155,110,185,60,195C10,205,-40,195,-85,170C-130,145,-170,105,-185,55C-200,5,-190,-55,-160,-100C-130,-145,-80,-175,-25,-185C30,-195,95,-160,130,-140Z" 
              fill="none" 
              stroke="#9E6240" 
              strokeWidth="1" 
            />
          </g>
        </svg>

        {/* Content */}
        <div className="landing-content">
          <Image 
            src="/coil.svg" 
            alt="Nywele.ai Logo" 
            width={80}
            height={80}
            className="logo-img"
            priority
            unoptimized
          />
          <h1>nywele.ai</h1>
          <p className="subtitle">AI-Powered African Hair Care</p>
          <Link href="/hair-care" className="cta-button">
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
