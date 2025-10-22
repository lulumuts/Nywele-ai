// app/components/QuoteEditor.tsx - Braider quote editor with new pricing structure

'use client';

import { useState } from 'react';
import { JobSpec } from '@/lib/specs';
import { Save, DollarSign, AlertCircle, CheckCircle, ShoppingBag, Scissors, Package } from 'lucide-react';

interface Quote {
  extensionPacks: number;
  extensionCostPerPack: number;
  laborHours: number;
  laborRatePerHour: number;
  stylingProducts: { item: string; cost: number; include: boolean }[];
  notes: string;
  total_kes: number;
}

interface QuoteEditorProps {
  spec: JobSpec;
  customerBudget?: string; // e.g., "KES 5,000-8,000"
  onSubmit: (quote: Quote) => void;
  existingQuote?: Quote;
}

export default function QuoteEditor({
  spec,
  customerBudget,
  onSubmit,
  existingQuote,
}: QuoteEditorProps) {
  // Validate spec
  if (!spec || !spec.hair_extensions || !spec.labor || !spec.styling_products) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="text-red-600" size={24} />
          <h3 className="text-lg font-bold text-red-800">Invalid Job Specification</h3>
        </div>
        <p className="text-red-700">
          Unable to load job details. Please try again or contact support.
        </p>
      </div>
    );
  }

  // Parse customer budget range
  const parseBudgetRange = (budgetStr?: string): { min: number; max: number } | null => {
    if (!budgetStr) return null;
    const match = budgetStr.match(/(\d+(?:,\d+)*)\s*-\s*(\d+(?:,\d+)*)/);
    if (match) {
      return {
        min: parseInt(match[1].replace(/,/g, '')),
        max: parseInt(match[2].replace(/,/g, '')),
      };
    }
    return null;
  };

  const budgetRange = parseBudgetRange(customerBudget);

  // Initialize state
  const [extensionPacks, setExtensionPacks] = useState(
    existingQuote?.extensionPacks || spec.hair_extensions?.quantity_min || 0
  );
  const [extensionCostPerPack, setExtensionCostPerPack] = useState(
    existingQuote?.extensionCostPerPack || spec.hair_extensions.cost_per_pack_kes
  );
  const [laborHours, setLaborHours] = useState(
    existingQuote?.laborHours || spec.time_min_hours
  );
  const [laborRatePerHour, setLaborRatePerHour] = useState(
    existingQuote?.laborRatePerHour || spec.labor.base_rate_per_hour_kes
  );
  const [stylingProducts, setStylingProducts] = useState(
    existingQuote?.stylingProducts ||
      spec.styling_products.map((p) => ({
        item: p.item,
        cost: p.cost_kes,
        include: !p.optional, // Include non-optional by default
      }))
  );
  const [notes, setNotes] = useState(existingQuote?.notes || '');

  // Calculate totals
  const extensionsTotal = extensionPacks * extensionCostPerPack;
  const laborTotal = laborHours * laborRatePerHour;
  const stylingProductsTotal = stylingProducts
    .filter((p) => p.include)
    .reduce((sum, p) => sum + p.cost, 0);
  const grandTotal = extensionsTotal + laborTotal + stylingProductsTotal;

  // Check if within budget
  const isWithinBudget = budgetRange
    ? grandTotal >= budgetRange.min && grandTotal <= budgetRange.max
    : null;

  const toggleStylingProduct = (index: number) => {
    const updated = [...stylingProducts];
    updated[index].include = !updated[index].include;
    setStylingProducts(updated);
  };

  const handleSubmitQuote = () => {
    const quote: Quote = {
      extensionPacks,
      extensionCostPerPack,
      laborHours,
      laborRatePerHour,
      stylingProducts,
      notes,
      total_kes: grandTotal,
    };
    onSubmit(quote);
  };

  return (
    <div className="space-y-6">
      {/* Customer Budget Banner */}
      {budgetRange && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-green-800">Customer Budget</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">{customerBudget}</p>
          <p className="text-sm text-green-700">
            Try to stay within this range. If you need to go higher, explain why in the notes.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Create Your Quote</h3>

        {/* Hair Extensions */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="text-purple-600" size={20} />
            <h4 className="font-bold text-gray-800">Hair Extensions</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Packs
              </label>
              <input
                type="number"
                value={extensionPacks}
                onChange={(e) => setExtensionPacks(parseInt(e.target.value) || 0)}
                min={spec.hair_extensions.quantity_min}
                max={spec.hair_extensions.quantity_max}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: {spec.hair_extensions.quantity_min}-{spec.hair_extensions.quantity_max} packs
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Per Pack (KES)
              </label>
              <input
                type="number"
                value={extensionCostPerPack}
                onChange={(e) => setExtensionCostPerPack(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typical: KES {spec.hair_extensions.cost_per_pack_kes.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-purple-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Extensions Subtotal:</p>
              <p className="text-xl font-bold text-purple-600">
                KES {extensionsTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Labor Cost */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="text-blue-600" size={20} />
            <h4 className="font-bold text-gray-800">Labor Cost</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                step="0.5"
                min={spec.time_min_hours}
                max={spec.time_max_hours}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typical: {spec.time_min_hours}-{spec.time_max_hours} hours
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Rate (KES/hour)
              </label>
              <input
                type="number"
                value={laborRatePerHour}
                onChange={(e) => setLaborRatePerHour(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Suggested: KES {spec.labor.base_rate_per_hour_kes.toLocaleString()}/hour
              </p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Labor Subtotal:</p>
              <p className="text-xl font-bold text-blue-600">
                KES {laborTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Styling Products */}
        {stylingProducts.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-gray-600" size={20} />
              <h4 className="font-bold text-gray-800">Styling Products</h4>
            </div>
            
            <div className="space-y-2 mb-3">
              {stylingProducts.map((product, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={product.include}
                      onChange={() => toggleStylingProduct(idx)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {product.item}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    KES {product.cost.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Products Subtotal:</p>
                <p className="text-lg font-bold text-gray-800">
                  KES {stylingProductsTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes to Customer (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special notes, recommendations, or explanations about your pricing..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Grand Total */}
        <div className={`p-6 rounded-xl mb-4 ${
          isWithinBudget === true
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : isWithinBudget === false
            ? 'bg-gradient-to-r from-orange-500 to-red-500'
            : 'bg-gradient-to-r from-purple-600 to-pink-600'
        }`}>
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isWithinBudget === true && <CheckCircle size={24} />}
                {isWithinBudget === false && <AlertCircle size={24} />}
                <span className="font-bold text-lg">Total Quote</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  KES {grandTotal.toLocaleString()}
                </p>
                <p className="text-xs opacity-90 mt-1">
                  Extensions + Labor + Products
                </p>
              </div>
            </div>
            
            {isWithinBudget !== null && (
              <div className="pt-3 border-t border-white/30 mt-3">
                <p className="text-sm">
                  {isWithinBudget
                    ? '✓ Within customer budget'
                    : '⚠ Above customer budget - explain in notes'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitQuote}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Save size={24} />
          Submit Quote to Customer
        </button>
      </div>
    </div>
  );
}
