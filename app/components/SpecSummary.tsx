// app/components/SpecSummary.tsx - Display job spec with clear pricing breakdown

import { JobSpec } from '@/lib/specs';
import { Clock, DollarSign, Package, Scissors, ShoppingBag, TrendingUp } from 'lucide-react';

interface SpecSummaryProps {
  spec: JobSpec;
  showTitle?: boolean;
}

export default function SpecSummary({ spec, showTitle = true }: SpecSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
      {showTitle && (
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-purple-600" size={24} />
          Job Specification
        </h3>
      )}

      {/* Time Estimate */}
      <div className="mb-4 p-3 bg-white rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="text-blue-600" size={18} />
          <p className="font-semibold text-gray-800">Time Estimate</p>
        </div>
        <p className="text-gray-700 ml-6">
          {spec.time_min_hours}-{spec.time_max_hours} hours
        </p>
      </div>

      {/* Hair Extensions (Main Cost) */}
      {spec.hair_extensions.quantity_max > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="text-purple-600" size={20} />
            <h4 className="font-bold text-gray-800">Hair Extensions</h4>
          </div>
          <div className="space-y-2 pl-7">
            <p className="text-gray-700">
              <span className="font-medium">Type:</span> {spec.hair_extensions.type}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Quantity:</span> {spec.hair_extensions.quantity_min}-
              {spec.hair_extensions.quantity_max} packs
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Cost per pack:</span> KES{' '}
              {spec.hair_extensions.cost_per_pack_kes.toLocaleString()}
            </p>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p className="text-lg font-bold text-purple-600">
                KES {spec.total_extensions_min_kes.toLocaleString()} -{' '}
                {spec.total_extensions_max_kes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Labor Cost */}
      <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Scissors className="text-blue-600" size={20} />
          <h4 className="font-bold text-gray-800">Labor Cost</h4>
        </div>
        <div className="space-y-2 pl-7">
          <p className="text-gray-700">
            <span className="font-medium">Base rate:</span> KES{' '}
            {spec.labor.base_rate_per_hour_kes.toLocaleString()}/hour
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Time:</span> {spec.time_min_hours}-{spec.time_max_hours} hours
          </p>
          <div className="pt-2 mt-2 border-t border-gray-200">
            <p className="text-lg font-bold text-blue-600">
              KES {spec.total_labor_min_kes.toLocaleString()} -{' '}
              {spec.total_labor_max_kes.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Styling Products */}
      {spec.styling_products.length > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Package className="text-gray-600" size={18} />
            <h4 className="font-semibold text-gray-800">Styling Products</h4>
          </div>
          <div className="space-y-2 pl-7">
            {spec.styling_products.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  {product.item} {product.optional && '(optional)'}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  KES {product.cost_kes.toLocaleString()}
                </p>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-700">Subtotal:</p>
                <p className="font-semibold text-gray-800">
                  KES {spec.total_styling_products_kes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={24} />
            <span className="font-bold text-lg">Total Estimated Cost:</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              KES {spec.grand_total_min_kes.toLocaleString()} -{' '}
              {spec.grand_total_max_kes.toLocaleString()}
            </p>
            <p className="text-xs text-purple-100 mt-1">
              {spec.hair_extensions.quantity_max > 0 && 'Extensions + '}Labor + Products
            </p>
          </div>
        </div>
      </div>

      {/* Hair Requirements */}
      <div className="mt-4 p-3 bg-white rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Min. Hair Length:</span>{' '}
          {spec.hair_requirements.min_length}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Suitable for:</span>{' '}
          {spec.hair_requirements.textures.join(', ')}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Skill Level:</span>{' '}
          <span className="capitalize">{spec.skill_level}</span>
        </p>
      </div>
    </div>
  );
}


