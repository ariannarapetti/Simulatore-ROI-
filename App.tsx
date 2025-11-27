import React, { useState, useMemo } from 'react';
import { Calculator, PhoneMissed, UserX, CalendarX, Euro, TrendingUp, Info, ChevronRight, BarChart3, CalendarRange, Sparkles } from 'lucide-react';

// --- Types ---
interface SimulationState {
  incomingCalls: number;
  missedCallRate: number;
  retryRate: number;
  conversionRate: number;
  avgPrice: number;
}

// --- Constants ---
const WORKING_DAYS_PER_MONTH = 24;

// --- Components ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(value);
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  onChange: (val: number) => void;
  description?: string;
}

const SliderControl: React.FC<SliderProps> = ({ label, value, min, max, unit = '', step = 1, onChange, description }) => {
  // Calculate percentage for the slider fill background
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-8 last:mb-0 group">
      <div className="flex justify-between items-end mb-3">
        <label className="font-medium text-white text-sm flex items-center gap-2">
          {label}
          {description && (
            <div className="relative flex items-center group/tooltip">
               <Info size={14} className="text-gaia-grey hover:text-gaia-yellow transition-colors cursor-help" />
               <div className="absolute left-0 bottom-full mb-2 w-56 bg-neutral-900 border border-gaia-yellow/30 text-gray-300 text-xs p-3 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-xl backdrop-blur-xl pointer-events-none">
                 {description}
               </div>
            </div>
          )}
        </label>
        <div className="bg-gaia-yellow/10 border border-gaia-yellow/20 px-3 py-1 rounded text-gaia-yellow font-bold font-mono text-lg min-w-[4rem] text-right shadow-[0_0_10px_rgba(244,231,0,0.05)]">
          {value}{unit}
        </div>
      </div>
      <div className="relative w-full h-1.5 rounded-lg bg-neutral-800">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #f4e700 0%, #f4e700 ${percentage}%, #333333 ${percentage}%, #333333 100%)`
          }}
          className="absolute w-full h-full rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 z-10"
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-gaia-grey mt-2 font-medium">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

interface ResultCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  isHighlighted?: boolean;
  annualValue?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, icon, subtitle, isHighlighted = false, annualValue }) => {
  if (isHighlighted) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gaia-yellow text-gaia-black shadow-[0_0_50px_rgba(244,231,0,0.2)] border border-gaia-yellow transition-all duration-300 hover:shadow-[0_0_70px_rgba(244,231,0,0.3)] h-full flex flex-col justify-center">
        <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none scale-150 rotate-12">
          {icon}
        </div>
        <div className="relative z-10 text-center sm:text-left h-full flex flex-col">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-6 text-gaia-black/70">
            <div className="p-2 bg-black/10 rounded-lg backdrop-blur-sm">
              {icon}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
              {title}
            </h3>
          </div>
          
          <div className="flex flex-col gap-1 mb-auto">
            <span className="text-lg font-medium opacity-80">Genera fino a</span>
            <div className="text-5xl sm:text-7xl font-black tracking-tighter mb-2 scale-100 origin-left">
              {value}
            </div>
            <span className="text-xl font-medium opacity-80">al mese in più</span>
          </div>

          {annualValue && (
            <div className="mt-8 mb-6 p-4 bg-black/5 border border-black/5 rounded-xl flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-black/10 rounded-lg text-black/70">
                    <CalendarRange size={20} />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70">Annual Impact</span>
              </div>
              <span className="text-2xl font-black tracking-tight">{annualValue}</span>
            </div>
          )}

          {subtitle && (
            <div className="pt-6 border-t border-black/10 mt-auto">
              <p className="text-sm font-medium text-gaia-black/80 leading-relaxed max-w-lg">
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl p-6 bg-gaia-yellow/5 border border-gaia-yellow/10 backdrop-blur-md hover:bg-gaia-yellow/10 hover:border-gaia-yellow/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gaia-grey group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="text-gaia-yellow opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-2 tracking-tight">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-gaia-grey leading-tight group-hover:text-gray-400 transition-colors">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  // State
  const [callsPerDay, setCallsPerDay] = useState(100);
  const [missedRate, setMissedRate] = useState(50);
  const [retryRate, setRetryRate] = useState(75);
  const [conversionRate, setConversionRate] = useState(50);
  const [avgPrice, setAvgPrice] = useState(500);

  // Calculations
  const results = useMemo(() => {
    const dailyMissedCalls = callsPerDay * (missedRate / 100);
    const lostCustomersRate = 1 - (retryRate / 100);
    const dailyLostCustomers = dailyMissedCalls * lostCustomersRate;
    const dailyLostAppointments = dailyLostCustomers * (conversionRate / 100);
    const dailyLostRevenue = dailyLostAppointments * avgPrice;
    const monthlyLostRevenue = dailyLostRevenue * WORKING_DAYS_PER_MONTH;
    const annualLostRevenue = monthlyLostRevenue * 12;

    return {
      dailyMissedCalls,
      dailyLostCustomers,
      dailyLostAppointments,
      dailyLostRevenue,
      monthlyLostRevenue,
      annualLostRevenue
    };
  }, [callsPerDay, missedRate, retryRate, conversionRate, avgPrice]);

  return (
    <div className="min-h-screen bg-gaia-black font-sans selection:bg-gaia-yellow selection:text-gaia-black pb-12 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-gaia-black/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-gaia-yellow w-8 h-8 fill-gaia-yellow/20" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                Gaia Automotive
              </h1>
              <span className="text-gaia-yellow text-xs font-medium uppercase tracking-widest mt-0.5 opacity-90">
                Simulatore ROI Service
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gaia-grey uppercase tracking-widest font-semibold border border-white/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            System Online
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input Card */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <div className="bg-[#222] border border-white/5 rounded-3xl p-6 sm:p-8 flex-grow shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gaia-yellow/50 to-transparent opacity-50"></div>
              
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <div className="p-2.5 bg-gaia-yellow/10 rounded-xl text-gaia-yellow border border-gaia-yellow/10">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Parametri variabili</h2>
                  <p className="text-xs text-gaia-grey uppercase tracking-wide mt-0.5">Configurazione Scenario</p>
                </div>
              </div>

              <div className="flex-grow space-y-3">
                <SliderControl 
                  label="Chiamate entranti / giorno" 
                  value={callsPerDay} 
                  min={20} 
                  max={1000} 
                  onChange={setCallsPerDay}
                />

                <SliderControl 
                  label="% Chiamate perse" 
                  description="Percentuale di chiamate a cui il service non risponde."
                  value={missedRate} 
                  min={10} 
                  max={90} 
                  unit="%" 
                  onChange={setMissedRate}
                />

                <SliderControl 
                  label="% Clienti che ritentano" 
                  description="Clienti che richiamano se trovano occupato. Il resto va dalla concorrenza."
                  value={retryRate} 
                  min={10} 
                  max={90} 
                  unit="%" 
                  onChange={setRetryRate}
                />

                <SliderControl 
                  label="% Conversione appuntamento" 
                  description="Percentuale di chiamate risposte che diventano prenotazioni."
                  value={conversionRate} 
                  min={10} 
                  max={90} 
                  unit="%" 
                  onChange={setConversionRate}
                />

                <SliderControl 
                  label="Prezzo medio servizi" 
                  value={avgPrice} 
                  min={100} 
                  max={1500} 
                  step={50}
                  unit="€" 
                  onChange={setAvgPrice}
                />
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-gaia-grey uppercase tracking-wider font-medium">
                <span className="flex items-center gap-1.5">
                  <Info size={12} />
                  Calcolo su {WORKING_DAYS_PER_MONTH}gg lavorativi
                </span>
                <span className="opacity-50">v1.2.0</span>
              </div>
            </div>
          </div>

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Header for Results */}
            <div className="flex items-center gap-3 pb-2 px-1">
              <div className="p-2 bg-gaia-yellow rounded-lg text-gaia-black">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analisi Performance</h2>
                <p className="text-sm text-gaia-grey">Impatto stimato dell'adozione di Gaia AI</p>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ResultCard 
                title="Chiamate perse"
                value={formatNumber(results.dailyMissedCalls)}
                icon={<PhoneMissed size={20} />}
                subtitle="Volume giornaliero gestibile."
              />
              
              <ResultCard 
                title="Clienti Persi"
                value={formatNumber(results.dailyLostCustomers)}
                icon={<UserX size={20} />}
                subtitle={`Churn rate giornaliero.`}
              />
              
              <ResultCard 
                title="Appuntamenti"
                value={formatNumber(results.dailyLostAppointments)}
                icon={<CalendarX size={20} />}
                subtitle="Prenotazioni perse/giorno."
              />

              <ResultCard 
                title="Mancato incasso"
                value={formatCurrency(results.dailyLostRevenue)}
                icon={<Euro size={20} />}
                subtitle="Perdita giornaliera."
              />
            </div>

            {/* Main ROI Card */}
            <div className="flex-grow min-h-[300px]">
              <ResultCard 
                title="Potenziale recupero mensile"
                value={formatCurrency(results.monthlyLostRevenue)}
                annualValue={formatCurrency(results.annualLostRevenue)}
                icon={<TrendingUp size={64} />}
                subtitle="Questo valore rappresenta il fatturato addizionale che il tuo service sta attualmente lasciando sul tavolo a causa delle chiamate perse. Gaia recupera il 100% di questo valore rispondendo immediatamente."
                isHighlighted={true}
              />
            </div>

            {/* Context Footer */}
            <div className="flex items-center justify-between text-xs text-gaia-grey/50 px-2 uppercase tracking-widest">
              <div>Gaia Automotive AI Simulator</div>
              <div>Generated {new Date().toLocaleDateString()}</div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;