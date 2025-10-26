// app/components/SpecSummary.tsx - Display job spec with clear pricing breakdown

import { JobSpec } from '@/lib/specs';
import { Clock, DollarSign, Package, Scissors, ShoppingBag, TrendingUp } from 'lucide-react';

interface SpecSummaryProps {
  spec: JobSpec;
  showTitle?: boolean;
}

export default function SpecSummary({ spec, showTitle = true }: SpecSummaryProps) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'rgba(206, 147, 95, 0.15)', border: '2px solid #CE935F' }}>
      {showTitle && (
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#643100' }}>
          <Package style={{ color: '#914600' }} size={24} />
          Job Specification
        </h3>
      )}

      {/* Time Estimate */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: '#FFFBF5' }}>
        <div className="flex items-center gap-2 mb-1">
          <Clock style={{ color: '#914600' }} size={18} />
          <p className="font-semibold" style={{ color: '#643100' }}>Time Estimate</p>
        </div>
        <p className="ml-6" style={{ color: '#914600' }}>
          {spec.time_min_hours}-{spec.time_max_hours} hours
        </p>
      </div>

      {/* Hair Extensions (Main Cost) */}
      {spec.hair_extensions.quantity_max > 0 && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: '#FFFBF5', border: '2px solid #CE935F' }}>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag style={{ color: '#914600' }} size={20} />
            <h4 className="font-bold" style={{ color: '#643100' }}>Hair Extensions</h4>
          </div>
          <div className="space-y-2 pl-7">
            <p style={{ color: '#914600' }}>
              <span className="font-medium">Type:</span> {spec.hair_extensions.type}
            </p>
            <p style={{ color: '#914600' }}>
              <span className="font-medium">Quantity:</span> {spec.hair_extensions.quantity_min}-
              {spec.hair_extensions.quantity_max} packs
            </p>
            <p style={{ color: '#914600' }}>
              <span className="font-medium">Cost per pack:</span> KES{' '}
              {spec.hair_extensions.cost_per_pack_kes.toLocaleString()}
            </p>
            <div className="pt-2 mt-2 border-t" style={{ borderColor: '#E5D4C1' }}>
              <p className="text-lg font-bold" style={{ color: '#914600' }}>
                KES {spec.total_extensions_min_kes.toLocaleString()} -{' '}
                {spec.total_extensions_max_kes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Labor Cost */}
      <div className="mb-4 p-4 rounded-lg" style={{ background: '#FFFBF5', border: '2px solid #CE935F' }}>
        <div className="flex items-center gap-2 mb-3">
          <Scissors style={{ color: '#914600' }} size={20} />
          <h4 className="font-bold" style={{ color: '#643100' }}>Labor Cost</h4>
        </div>
        <div className="space-y-2 pl-7">
          <p style={{ color: '#914600' }}>
            <span className="font-medium">Base rate:</span> KES{' '}
            {spec.labor.base_rate_per_hour_kes.toLocaleString()}/hour
          </p>
          <p style={{ color: '#914600' }}>
            <span className="font-medium">Time:</span> {spec.time_min_hours}-{spec.time_max_hours} hours
          </p>
          <div className="pt-2 mt-2 border-t" style={{ borderColor: '#E5D4C1' }}>
            <p className="text-lg font-bold" style={{ color: '#914600' }}>
              KES {spec.total_labor_min_kes.toLocaleString()} -{' '}
              {spec.total_labor_max_kes.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Styling Products */}
      {spec.styling_products.length > 0 && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: '#FFFBF5' }}>
          <div className="flex items-center gap-2 mb-3">
            <Package style={{ color: '#914600' }} size={18} />
            <h4 className="font-semibold" style={{ color: '#643100' }}>Styling Products</h4>
          </div>
          <div className="space-y-2 pl-7">
            {spec.styling_products.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <p className="text-sm" style={{ color: '#914600' }}>
                  {product.item} {product.optional && '(optional)'}
                </p>
                <p className="text-sm font-medium" style={{ color: '#643100' }}>
                  KES {product.cost_kes.toLocaleString()}
                </p>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t" style={{ borderColor: '#E5D4C1' }}>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium" style={{ color: '#914600' }}>Subtotal:</p>
                <p className="font-semibold" style={{ color: '#643100' }}>
                  KES {spec.total_styling_products_kes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #643100 0%, #914600 100%)', color: 'white' }}>
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
            <p className="text-xs mt-1" style={{ opacity: 0.9 }}>
              {spec.hair_extensions.quantity_max > 0 && 'Extensions + '}Labor + Products
            </p>
          </div>
        </div>
      </div>

      {/* Hair Requirements */}
      <div className="mt-4 p-3 rounded-lg" style={{ background: '#FFFBF5' }}>
        <p className="text-sm" style={{ color: '#914600' }}>
          <span className="font-semibold">Min. Hair Length:</span>{' '}
          {spec.hair_requirements.min_length}
        </p>
        <p className="text-sm" style={{ color: '#914600' }}>
          <span className="font-semibold">Suitable for:</span>{' '}
          {spec.hair_requirements.textures.join(', ')}
        </p>
        <p className="text-sm" style={{ color: '#914600' }}>
          <span className="font-semibold">Skill Level:</span>{' '}
          <span className="capitalize">{spec.skill_level}</span>
        </p>
      </div>
    </div>
  );
}


