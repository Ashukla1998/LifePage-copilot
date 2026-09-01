'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { PhoneInput } from 'react-international-phone';
//import 'react-international-phone/style.css';
import {
  PhoneInput,
  defaultCountries,
  parseCountry,
} from 'react-international-phone';
import 'react-international-phone/style.css';
import Navbar from '../../components/Navbar';


// function LoginContent() {
//   const router = useRouter();
//   // const phoneUtil = PhoneNumberUtil();

// //   const [count, setCount] = useState<string>('');
//   const [phone, setPhone] = useState<string>('');
//   const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
//   const [showPin, setShowPin] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   // 🔹 Handle individual box typing and auto-focus next
//   const handlePinDigitChange = (index: number, value: string) => {
//     const sanitized = value.replace(/\D/g, '');
//     if (!sanitized) {
//       const updated = [...pinDigits];
//       updated[index] = '';
//       setPinDigits(updated);
//       return;
//     }

//     const digit = sanitized.slice(-1);
//     const updated = [...pinDigits];
//     updated[index] = digit;
//     setPinDigits(updated);

//     if (index < 3 && digit) {
//       pinInputRefs.current[index + 1]?.focus();
//     }
//   };

//   // 🔹 Handle Backspace navigation
//   const handlePinKeyDown = (
//     index: number,
//     e: React.KeyboardEvent<HTMLInputElement>
//   ) => {
//     if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
//       pinInputRefs.current[index - 1]?.focus();
//     }
//   };

//   // 🔹 Handle Paste
//   const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
//     if (!pastedData) return;

//     const updated = ['', '', '', ''];
//     pastedData.split('').forEach((char, i) => {
//       if (i < 4) updated[i] = char;
//     });
//     setPinDigits(updated);

//     const targetFocusIndex = Math.min(pastedData.length, 3);
//     pinInputRefs.current[targetFocusIndex]?.focus();
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setErrorMessage('');

//   const fullPin = pinDigits.join('');

//   if (!phone || phone.trim().length < 6) {
//     setErrorMessage('Please enter a valid mobile number.');
//     return;
//   }

//   if (fullPin.length !== 4) {
//     setErrorMessage('Please enter all 4 digits of your PIN.');
//     return;
//   }

//   // 🔹 Extract country code and national number
//   let detectedDialCode = '91';
//   let nationalNumber = phone.replace(/\D/g, '');

//   // Match the longest dialCode prefix from defaultCountries
//   const matchedCountry = defaultCountries
//     .map((country) => parseCountry(country))
//     .filter((c) => phone.startsWith(`+${c.dialCode}`))
//     .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];

//   if (matchedCountry) {
//     detectedDialCode = matchedCountry.dialCode; // e.g. "91"
//     nationalNumber = phone.slice(matchedCountry.dialCode.length + 1).replace(/\D/g, ''); // phone without "+91"
//   }

//   setIsLoading(true);

//   try {
//     const res = await fetch('https://www.lifepage.in/login_enccjjj', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         username: nationalNumber,
//         password: fullPin,
//         countrycode: detectedDialCode, // or `+${detectedDialCode}`
//       }),
//     });

//     const data = await res.json();

//     if (data.success === 1 || data.status === true) {
//       if (data.userid) sessionStorage.setItem('lp_userid', data.userid);
//       if (data.token) sessionStorage.setItem('lp_token', data.token);
//       // router.push('/');
//       alert('Login successful! Redirecting to home page...');
//     } else {
//       setErrorMessage(data.message || 'Invalid mobile number or PIN.');
//     }
//   } catch (err) {
//     console.error('Login error:', err);
//     setErrorMessage('Network error. Please try again.');
//   } finally {
//     setIsLoading(false);
//   }
// };
function LoginContent() {
  const router = useRouter();

  const [phone, setPhone] = useState<string>('');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 🔹 Handle individual digit input and auto-focus next box
  const handlePinDigitChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '');
    if (!sanitized) {
      const updated = [...pinDigits];
      updated[index] = '';
      setPinDigits(updated);
      return;
    }

    const digit = sanitized.slice(-1);
    const updated = [...pinDigits];
    updated[index] = digit;
    setPinDigits(updated);

    if (index < 3 && digit) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  // 🔹 Handle Backspace navigation
  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  // 🔹 Handle Paste (e.g. pasting "1234")
  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const updated = ['', '', '', ''];
    pastedData.split('').forEach((char, i) => {
      if (i < 4) updated[i] = char;
    });
    setPinDigits(updated);

    const targetFocusIndex = Math.min(pastedData.length, 3);
    pinInputRefs.current[targetFocusIndex]?.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const fullPin = pinDigits.join('');

    // 🔹 Extract country code (e.g. "+91") and mobile number
    let detectedCountryCode = '+91';
    let nationalNumber = phone.replace(/\D/g, '');

    const matchedCountry = defaultCountries
      .map((country) => parseCountry(country))
      .filter((c) => phone.startsWith(`+${c.dialCode}`))
      .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];

    if (matchedCountry) {
      detectedCountryCode = `+${matchedCountry.dialCode}`;
      nationalNumber = phone.slice(matchedCountry.dialCode.length + 1).replace(/\D/g, '');
    }

    if (!nationalNumber || nationalNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    if (fullPin.length !== 4) {
      setErrorMessage('Please enter all 4 digits of your PIN.');
      return;
    }

    

    setIsLoading(true);

    try {
      // 🔹 Calls the exact working endpoint
      const res = await fetch('https://www.lifepage.in/login_enccjjj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include', // Captures session cookies ('secret')
        body: JSON.stringify({
          username: nationalNumber,
          password: fullPin,
          countrycode: detectedCountryCode,
        }),
      });

      const data = await res.json();

      if (data.success === 1) {
        if (data.data) {
          sessionStorage.setItem('user_data', JSON.stringify(data.data));
          if (data.data.memberid || data.data.userid) {
            sessionStorage.setItem('lp_userid', String(data.data.memberid || data.data.userid));
          }
        }
        // router.push('/');
        alert('Login successful! Redirecting to home page...');
      } else {
        setErrorMessage(data.message || 'Login failed! Please check your credentials.');
      }
    } catch (err: unknown) {
      console.error('Login API error:', err);
      setErrorMessage('Error connecting to API. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen h-dvh w-full bg-gray-50 flex flex-col overflow-hidden">
      {/* 🔹 Sticky Top Navbar */}
      <Navbar />

      {/* 🔹 Scrollable Content Area */}
      <main className="flex-1 w-full overflow-y-auto px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-[420px] bg-[#ffc000] border-2 border-black rounded-lg p-5 sm:p-7 text-center shadow-lg box-border my-auto">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-5 sm:mb-6">
            <Image
              src="/icon.png"
              alt="Logo"
              width={120}
              height={35}
              priority
              className="h-8 w-auto mb-2"
            />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              Welcome Back!
            </h2>
            <p className="text-xs text-gray-800 mt-1 font-medium">
              Sign in with your mobile number and 4-digit PIN
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 rounded-sm border border-red-700 bg-red-100 p-2 text-xs font-semibold text-red-800 text-center">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            {/* International Phone Input */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">
                Mobile Number
              </label>
              <div className="phone-input-custom">
                <PhoneInput
                  defaultCountry="in"
                  value={phone}
                  onChange={(phoneValue) => setPhone(phoneValue)}
                  className="w-full flex"
                  inputClassName="!w-full !rounded-r-sm !border !border-black/30 !bg-white !p-2.5 !text-xs sm:!text-sm !text-gray-900 !shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] !outline-none focus:!border-blue-600 !transition !h-[38px]"
                  countrySelectorStyleProps={{
                    buttonClassName:
                      '!rounded-l-sm !border !border-r-0 !border-black/30 !bg-white !px-2.5 !h-[38px] !shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]',
                  }}
                />
              </div>
            </div>

            {/* 4-Box PIN Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-900">
                  4-Digit PIN
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPin((prev) => !prev)}
                    className="text-[11px] font-bold text-gray-800 hover:text-black transition"
                  >
                    {showPin ? 'HIDE' : 'SHOW'}
                  </button>
                  <Link
                    href="/forgot-pin"
                    className="text-[11px] font-semibold text-gray-800 hover:text-black hover:underline"
                  >
                    Forgot PIN?
                  </Link>
                </div>
              </div>

              {/* 4 Separate Pin Digit Boxes */}
              <div className="flex justify-center gap-2.5 sm:gap-3">
                {pinDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      pinInputRefs.current[index] = el;
                    }}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    onPaste={handlePinPaste}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-sm border-2 border-black/30 bg-white text-center text-base sm:text-lg font-bold text-gray-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] outline-none focus:border-blue-600 transition"
                  />
                ))}
              </div>
            </div>

            {/* Compact Centered Submit Button */}
            <div className="flex justify-center mt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-[60%] inline-flex items-center justify-center gap-2 rounded bg-[#2196f3] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1e88e5] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-5">
            <hr className="border-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-[#ffc000] px-2.5 text-[11px] font-bold text-gray-700">
                OR
              </span>
            </div>
          </div>

          {/* Compact Centered Explore Button & Links */}
          <div className="flex flex-col items-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-[60%] inline-flex items-center justify-center gap-2 rounded bg-[#363636] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-black active:scale-[0.98]"
            >
              Explore Without Account
            </Link>

            <p className="text-xs text-gray-800 font-medium mt-1">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .react-international-phone-country-selector-dropdown {
          z-index: 9999 !important;
          color: #111827;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen font-sans">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}