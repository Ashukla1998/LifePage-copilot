'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface CertificatePayload {
  sessionid?: string;
  career_name?: string;
}

interface CertificateData {
  deegree_name?: string[];
  top_college_india?: string[];
  top_college_abroad?: string[];
}

function CertificateContent() {
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || 'Career Seeker';
  const career = searchParams.get('career') || '';
  const score = searchParams.get('score') || '';
  const image = searchParams.get('image') || 'https://www.lifepage.in/support/choices.jpg';
  const profileid = searchParams.get('profileid') || '';
  const fieldOfStudy = searchParams.get('fieldOfStudy') || '';

  const [degree, setDegree] = useState<string>('');
  const [indiaColleges, setIndiaColleges] = useState<string[]>([]);
  const [abroadColleges, setAbroadColleges] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const displayName = name !== 'Career Seeker' && name.trim().length > 0
    ? `${name} has`
    : 'You have';

  useEffect(() => {
    async function fetchCertificate() {
      setLoading(true);
      const payload: CertificatePayload = {};
      if (profileid) {
        payload.sessionid = profileid;
      } else {
        payload.career_name = fieldOfStudy;
      }

      try {
        const res = await fetch('https://www.lifepage.in/n/api/GenerateCertificate', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.success === 1) {
          const certificateData: CertificateData = Array.isArray(result.data) ? result.data[0] : result.data;
          setDegree(certificateData.deegree_name?.[0] || '');
          setIndiaColleges(certificateData.top_college_india || []);
          setAbroadColleges(certificateData.top_college_abroad || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificate();
  }, [profileid, fieldOfStudy]);

  // 🔹 FIXED: Modified toolchain to invoke html2canvas-pro to dynamically flatten Tailwind v4 oklch rulesets
  const downloadCertificate = () => {
    import('html2canvas-pro').then(({ default: html2canvasPro }) => {
      const element = document.getElementById('certificate');
      if (!element) return;

      html2canvasPro(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'Career-Certificate.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  return (
    <div className="m-0 p-[15px] bg-white font-sans box-border">
      <button 
        onClick={downloadCertificate}
        className="my-[15px] mx-auto block bg-[#2196f3] text-white border-none py-3 px-6 cursor-pointer font-semibold shadow-sm rounded-lg hover:opacity-90 transition"
      >
        Download Summary
      </button>

      {/* 🔹 Core assessment container frame - explicitly fallback styling elements added to root nodes */}
      <div 
        id="certificate" 
        className="w-full max-w-[900px] min-h-[650px] my-0 mx-auto bg-white relative overflow-hidden shadow-2xl rounded-[20px] p-10 box-border text-center"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="relative z-[2]">
          
          <div 
            className="w-[220px] h-[220px] rounded-full overflow-hidden relative border border-[#323232] mx-auto mb-4 shadow-sm"
            style={{ backgroundColor: '#e5e7eb' }}
          >
            <img src={image} alt="Profile Avatar" className="w-full h-full object-cover" />
            <div 
              className="rounded-lg absolute bottom-0 left-1/2 -translate-x-1/2 w-[213px] h-[51px] flex flex-col justify-between items-center py-1 text-white z-10"
              style={{ backgroundColor: '#363636' }}
            >
              <span className="text-[10px] text-[#E46C09] font-semibold mt-1">www.lifepage.in/ai</span>
              <div className="w-[136px] h-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <span className="text-[12px] font-medium mb-1">{name} {score}</span>
            </div>
          </div>

          <div className="text-gray-500 font-medium text-base sm:text-lg md:text-xl mt-[15px]">{displayName} decided to get into</div>
          <div className="text-xl text-[#E46C09] font-semibold mt-[15px]">{career || 'Chosen Path'}</div>
          <div className="text-gray-500 font-medium text-base sm:text-lg md:text-xl mt-[15px]">To achieve this, you need to pursue</div>
          <div className="text-xl text-[#E46C09] font-semibold mt-[15px]">{loading ? 'Analyzing degrees...' : degree || 'Recommended Specialization'}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] mt-10">
            <div className="border-2 border-[#E46C09] rounded-[15px] p-5 text-left bg-gray-50/50" style={{ borderColor: '#E46C09' }}>
              <h2 className="text-center text-[#E46C09] font-bold text-lg mb-4" style={{ color: '#E46C09' }}>Top Colleges in India</h2>
              {loading ? <p className="text-center text-sm text-gray-400">Loading institutions...</p> : (
                <ol className="m-0 pl-6 list-decimal">
                  {indiaColleges.map((college, idx) => <li key={idx} className="mb-3 text-[16px] text-gray-700 font-medium leading-[1.5]">{college}</li>)}
                </ol>
              )}
            </div>

            <div className="border-2 border-[#E46C09] rounded-[15px] p-5 text-left bg-gray-50/50" style={{ borderColor: '#E46C09' }}>
              <h2 className="text-center text-[#E46C09] font-bold text-lg mb-4" style={{ color: '#E46C09' }}>Top Colleges Abroad</h2>
              {loading ? <p className="text-center text-sm text-gray-400">Loading institutions...</p> : (
                <ol className="m-0 pl-6 list-decimal">
                  {abroadColleges.map((college, idx) => <li key={idx} className="mb-3 text-[16px] text-gray-700 font-medium leading-[1.5]">{college}</li>)}
                </ol>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CareerCertificate() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-sans text-gray-500 font-semibold animate-pulse">Generating your Summary...</div>}>
      <CertificateContent />
    </Suspense>
  );
}