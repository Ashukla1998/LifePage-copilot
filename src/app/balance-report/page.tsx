'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  referenceId: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-90812',
    date: '2026-09-14 14:30',
    description: 'Wallet Top-Up via UPI',
    type: 'credit',
    amount: 1500,
    status: 'Completed',
    referenceId: 'UPI-88492019',
  },
  {
    id: 'TXN-90744',
    date: '2026-09-12 11:15',
    description: 'Career Advisory Session (1 hr)',
    type: 'debit',
    amount: 600,
    status: 'Completed',
    referenceId: 'ADV-40291',
  },
  {
    id: 'TXN-90610',
    date: '2026-09-08 09:45',
    description: 'AI Assessment Report Download',
    type: 'debit',
    amount: 250,
    status: 'Completed',
    referenceId: 'REP-11029',
  },
  {
    id: 'TXN-90501',
    date: '2026-09-02 18:20',
    description: 'Promotional Welcome Bonus',
    type: 'credit',
    amount: 200,
    status: 'Completed',
    referenceId: 'BONUS-NEW',
  },
  {
    id: 'TXN-90388',
    date: '2026-08-28 16:05',
    description: 'Pending Advisory Booking',
    type: 'debit',
    amount: 400,
    status: 'Pending',
    referenceId: 'ADV-39912',
  },
];

export default function BalanceReportPage() {
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currency = '₹';
  const totalBalance = 2450.0;
  const totalCredited = 1700.0;
  const totalDebited = 1250.0;

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((txn) => {
      const matchesFilter =
        filterType === 'all' ? true : txn.type === filterType;
      const matchesSearch =
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filterType, searchTerm]);

  return (
    <div className="min-h-screen w-full bg-[#181818] text-gray-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#ffc000] transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#ffc000] font-medium">Balance Report</span>
        </div>

        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Balance & Transaction Statement
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View your account balances, recent advisory credits, and payment history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Exporting balance statement as CSV...')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-600 transition flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-[#ffc000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-[#ffc000] hover:bg-[#e5ad00] text-gray-950 text-xs font-bold rounded-lg transition shadow-md"
            >
              Add Funds
            </Link>
          </div>
        </div>

        {/* Balance Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Current Balance */}
          <div className="bg-[#222222] p-5 rounded-xl border border-gray-700 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#ffc000]" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Current Available Balance
            </span>
            <div className="text-3xl font-black text-white mt-2">
              <span className="text-[#ffc000] mr-1">{currency}</span>
              {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="inline-block mt-3 text-[11px] text-green-400 bg-green-950/40 border border-green-800/60 px-2 py-0.5 rounded">
              Active Wallet
            </span>
          </div>

          {/* Total Inflow */}
          <div className="bg-[#222222] p-5 rounded-xl border border-gray-700 shadow-md">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Total Added (Credits)
            </span>
            <div className="text-3xl font-black text-green-400 mt-2">
              +{currency}{totalCredited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-3">From top-ups & bonuses</p>
          </div>

          {/* Total Outflow */}
          <div className="bg-[#222222] p-5 rounded-xl border border-gray-700 shadow-md">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Total Spent (Debits)
            </span>
            <div className="text-3xl font-black text-[#E46C09] mt-2">
              -{currency}{totalDebited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-3">Sessions & test assessments</p>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-[#222222] rounded-xl border border-gray-700 shadow-md overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-800/70 p-1 rounded-lg border border-gray-700 self-start">
              {(['all', 'credit', 'debit'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition ${
                    filterType === type
                      ? 'bg-[#ffc000] text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All Activity' : `${type}s`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181818] border border-gray-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffc000]"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] text-gray-400 uppercase font-semibold text-[11px] border-b border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Reference & Date</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-mono text-gray-200">{txn.id}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{txn.date}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-100">{txn.description}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Ref: {txn.referenceId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            txn.status === 'Completed'
                              ? 'bg-green-950/40 border-green-800/60 text-green-400'
                              : txn.status === 'Pending'
                              ? 'bg-yellow-950/40 border-yellow-800/60 text-yellow-400'
                              : 'bg-red-950/40 border-red-800/60 text-red-400'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-sm">
                        <span className={txn.type === 'credit' ? 'text-green-400' : 'text-gray-100'}>
                          {txn.type === 'credit' ? '+' : '-'}{currency}{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-500 text-sm">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}