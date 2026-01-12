import React, { useState } from 'react';
import { X, DollarSign, ShieldCheck, Building, Smartphone, Save, User, Hash, AlertTriangle, Zap } from 'lucide-react';
import { PaymentDetails } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  totalDeposited: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number, details: PaymentDetails) => void;
  isAdmin: boolean;
  adminDepositText: string;
  onUpdateAdminDepositText: (text: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ 
    isOpen, 
    onClose, 
    currentBalance, 
    totalDeposited,
    onDeposit, 
    onWithdraw, 
    isAdmin,
    adminDepositText,
    onUpdateAdminDepositText
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'ADMIN'>('DEPOSIT');
  const [amount, setAmount] = useState<string>('');
  
  // Withdrawal State
  const [withdrawMethod, setWithdrawMethod] = useState<'BANK' | 'MOBILE'>('BANK');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Admin State
  const [editDepositText, setEditDepositText] = useState(adminDepositText);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  
  // Deposit Logic
  const depositFee = numAmount * 0.20;
  const netDeposit = numAmount - depositFee;
  const isDepositValid = numAmount >= 5 && numAmount <= 1000;

  // Withdraw Logic Rules
  // 1. Min $5, Max $500
  // 2. Must have made $5 profit (Balance >= Total Deposited + 5)
  const minWithdraw = 5;
  const maxWithdraw = 500;
  const profitThreshold = 5;
  const requiredBalance = totalDeposited + profitThreshold;
  const canWithdrawProfit = currentBalance >= requiredBalance;
  
  const validateWithdraw = () => {
      if (numAmount < minWithdraw) return `Minimum withdrawal is $${minWithdraw}`;
      if (numAmount > maxWithdraw) return `Maximum withdrawal is $${maxWithdraw}`;
      if (numAmount > currentBalance) return "Insufficient funds";
      if (!canWithdrawProfit) return `You must make a profit of at least $${profitThreshold} above your total deposits ($${totalDeposited}) to cash out. Current required balance: $${requiredBalance}`;
      if (!accountName || !accountNumber || !provider) return "Please fill in all payment details";
      return "";
  };

  const handleDeposit = () => {
    if (isDepositValid) {
      setIsProcessing(true);
      // Simulate automatic processing
      setTimeout(() => {
          onDeposit(numAmount);
          setAmount('');
          setIsProcessing(false);
          onClose();
      }, 1000);
    }
  };

  const handleWithdraw = () => {
      const error = validateWithdraw();
      if (error) {
          setWithdrawError(error);
          return;
      }
      setWithdrawError('');

      setIsProcessing(true);
      // Automatic cash out on request (simulated delay)
      setTimeout(() => {
          onWithdraw(numAmount, {
              method: withdrawMethod,
              accountName,
              accountNumber,
              provider
          });
          setAmount('');
          setIsProcessing(false);
          onClose();
          alert(`Auto-Withdrawal of $${numAmount} processed successfully to ${provider}.`);
      }, 1500);
  };

  const handleUpdateAdmin = () => {
      onUpdateAdminDepositText(editDepositText);
      alert("Deposit instructions updated!");
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10">
          <X className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold brand-font text-white flex items-center gap-2">
            <DollarSign className="text-green-500" />
            WALLET
          </h2>
          <div className="flex gap-4 mt-4 text-xs font-bold tracking-widest">
             <button 
                onClick={() => setActiveTab('DEPOSIT')} 
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'DEPOSIT' ? 'border-green-500 text-white' : 'border-transparent text-gray-500'}`}
             >
                DEPOSIT
             </button>
             <button 
                onClick={() => setActiveTab('WITHDRAW')} 
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'WITHDRAW' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-500'}`}
             >
                CASHOUT
             </button>
             {isAdmin && (
                 <button 
                    onClick={() => setActiveTab('ADMIN')} 
                    className={`pb-2 border-b-2 transition-colors ${activeTab === 'ADMIN' ? 'border-red-500 text-white' : 'border-transparent text-gray-500'}`}
                 >
                    ADMIN SETTINGS
                 </button>
             )}
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div className="bg-black/50 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div>
                <div className="text-gray-400 font-bold text-xs">CURRENT BALANCE</div>
                <div className="text-2xl font-mono text-white">${currentBalance.toFixed(2)}</div>
            </div>
            <div className="text-right">
                <div className="text-gray-500 font-bold text-[10px] uppercase">Total Deposited</div>
                <div className="text-gray-300 font-mono">${totalDeposited.toFixed(2)}</div>
            </div>
          </div>

          {activeTab === 'DEPOSIT' && (
              <div className="space-y-6">
                   <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                       <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Transfer Instructions</h3>
                       <p className="text-sm text-gray-300 whitespace-pre-line">{adminDepositText}</p>
                   </div>
                   
                   <div className="flex items-start gap-2 bg-yellow-900/20 p-3 rounded border border-yellow-700/30">
                       <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                       <p className="text-[10px] text-yellow-200">
                           Dormant deposits (unused for 65 days) will expire and be transferred to the admin fund automatically.
                       </p>
                   </div>

                   <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">ENTER AMOUNT ($5 - $1000)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-500">$</span>
                            <input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white font-mono focus:border-green-500 focus:outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    
                    {numAmount > 0 && (
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between text-gray-400">
                                <span>Fee (20%)</span>
                                <span>-${depositFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-400 font-bold">
                                <span>Funds to Add</span>
                                <span>${netDeposit.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleDeposit}
                        disabled={!isDepositValid || isProcessing}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                        {isProcessing ? "PROCESSING..." : "CONFIRM DEPOSIT"}
                    </button>
              </div>
          )}

          {activeTab === 'WITHDRAW' && (
               <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-2 mb-4">
                       <button 
                         onClick={() => setWithdrawMethod('BANK')}
                         className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 ${withdrawMethod === 'BANK' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                       >
                           <Building className="w-5 h-5" /> Local Bank
                       </button>
                       <button 
                         onClick={() => setWithdrawMethod('MOBILE')}
                         className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 ${withdrawMethod === 'MOBILE' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                       >
                           <Smartphone className="w-5 h-5" /> Mobile Money
                       </button>
                   </div>

                   {!canWithdrawProfit && (
                       <div className="bg-red-900/20 border border-red-500 p-3 rounded flex items-start gap-2">
                           <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                           <div className="text-xs text-red-200">
                               <p className="font-bold mb-1">PROFIT REQUIREMENT NOT MET</p>
                               You need ${profitThreshold} profit to cash out. <br/>
                               Target Balance: ${(totalDeposited + profitThreshold).toFixed(2)}
                           </div>
                       </div>
                   )}

                   <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Account Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Account Number / Phone</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm"
                                    placeholder="0000000000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">{withdrawMethod === 'BANK' ? 'Bank Name' : 'Network Provider'}</label>
                            <input 
                                type="text" 
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg py-2 px-3 text-white text-sm"
                                placeholder={withdrawMethod === 'BANK' ? "e.g. Chase, Wells Fargo" : "e.g. M-Pesa, CashApp"}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount ($5 - $500)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg py-2 px-3 text-white text-sm font-mono text-yellow-500"
                                placeholder="0.00"
                            />
                        </div>
                        {withdrawError && (
                            <p className="text-xs text-red-500 font-bold">{withdrawError}</p>
                        )}
                   </div>

                   <button 
                        onClick={handleWithdraw}
                        disabled={isProcessing || !canWithdrawProfit}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:grayscale text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(202,138,4,0.3)]"
                    >
                        {isProcessing ? "AUTO-PROCESSING..." : "REQUEST CASHOUT"}
                    </button>
               </div>
          )}

          {activeTab === 'ADMIN' && isAdmin && (
              <div className="space-y-6">
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                      <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> ADMIN ZONE</h3>
                      <p className="text-xs text-gray-400">Edit the deposit instructions visible to all players.</p>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">Deposit Instructions / Bank Details</label>
                      <textarea 
                          value={editDepositText}
                          onChange={(e) => setEditDepositText(e.target.value)}
                          className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none text-sm font-mono"
                      />
                  </div>

                  <button 
                    onClick={handleUpdateAdmin}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                      <Save className="w-4 h-4" /> SAVE CHANGES
                  </button>
              </div>
          )}
          
        </div>
      </div>
    </div>
  );
};