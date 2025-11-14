/**
 * Payment Methods Page
 * Manage payment cards and methods
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import ClientSidebar from '../components/ClientSidebar';
import { 
  CreditCard,
  Plus,
  Trash2,
  Check,
  Wallet,
  Shield
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const { userProfile } = useAuth();
  const [showAddCard, setShowAddCard] = useState(false);
  
  // Mock payment methods - in real app, fetch from database
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      exp_month: 12,
      exp_year: 2025,
      isDefault: true,
    },
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would call Stripe/payment API
    const last4 = newCard.cardNumber.slice(-4);
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4,
      brand: 'Visa', // Would be detected from card number
      exp_month: parseInt(newCard.expMonth),
      exp_year: parseInt(newCard.expYear),
      isDefault: paymentMethods.length === 0,
    };
    
    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({
      cardNumber: '',
      cardName: '',
      expMonth: '',
      expYear: '',
      cvv: '',
    });
    setShowAddCard(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  const getCardIcon = (_brand: string) => {
    return <CreditCard className="text-gray-600" size={24} />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar userProfile={userProfile} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment cards and billing information</p>
          </div>

          {/* Wallet Integration */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Wallet size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Web3 Wallet Connected</h3>
                <p className="text-purple-100 text-sm">
                  {userProfile?.wallet_address 
                    ? `${userProfile.wallet_address.substring(0, 6)}...${userProfile.wallet_address.substring(38)}`
                    : 'No wallet connected'}
                </p>
              </div>
              <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                {userProfile?.wallet_address ? 'Disconnect' : 'Connect Wallet'}
              </button>
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Saved Cards</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your credit and debit cards</p>
              </div>
              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Card
              </button>
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={16}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={newCard.cardName}
                      onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exp. Month
                      </label>
                      <input
                        type="text"
                        placeholder="MM"
                        value={newCard.expMonth}
                        onChange={(e) => setNewCard({...newCard, expMonth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        maxLength={2}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exp. Year
                      </label>
                      <input
                        type="text"
                        placeholder="YYYY"
                        value={newCard.expYear}
                        onChange={(e) => setNewCard({...newCard, expYear: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        maxLength={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Cards List */}
            <div className="divide-y divide-gray-200">
              {paymentMethods.length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-6">Add a credit or debit card to get started</p>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} />
                    Add Your First Card
                  </button>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Card Icon */}
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getCardIcon(method.brand)}
                      </div>

                      {/* Card Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {method.brand} •••• {method.last4}
                          </h3>
                          {method.isDefault && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <Check size={12} />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(method.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove card"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Payments</h3>
                <p className="text-sm text-gray-600">
                  Your payment information is encrypted and securely stored. We never share your financial details with freelancers. All transactions are protected by industry-standard security measures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
