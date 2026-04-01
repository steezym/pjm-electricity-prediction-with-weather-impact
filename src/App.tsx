import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Terminal, 
  Database, 
  Cpu, 
  BarChart3, 
  ChevronRight, 
  Github, 
  Linkedin, 
  ExternalLink,
  Info,
  Zap,
  Thermometer,
  Calendar,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Dummy Data Generation ---
const generateData = () => {
  const data = [];
  const now = new Date('2024-01-01T00:00:00');
  
  for (let i = 0; i < 168; i++) { // 1 week of hourly data
    const time = new Date(now.getTime() + i * 3600000);
    const hour = time.getHours();
    const day = time.getDay();
    
    // Base consumption: higher during day, lower at night
    const base = 30000 + Math.sin((hour - 6) * Math.PI / 12) * 5000;
    
    // Temperature: higher in afternoon, lower at night
    const temp = 20 + Math.sin((hour - 10) * Math.PI / 12) * 10 + (Math.random() * 2);
    
    // Correlation: higher temp = higher consumption (AC load)
    const tempEffect = (temp - 20) * 200;
    
    // Weekend effect: lower consumption
    const weekendEffect = (day === 0 || day === 6) ? -2000 : 0;
    
    const actual = base + tempEffect + weekendEffect + (Math.random() * 1000);
    const predicted = actual + (Math.random() - 0.5) * 1500; // Simulate model prediction
    
    data.push({
      timestamp: time.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      actual: Math.round(actual),
      predicted: Math.round(predicted),
      temp: Math.round(temp * 10) / 10,
      hour,
      day
    });
  }
  return data;
};

const featureImportance = [
  { name: 'Hour', value: 45 },
  { name: 'Temperature', value: 30 },
  { name: 'Lag_24h', value: 15 },
  { name: 'DayOfWeek', value: 7 },
  { name: 'Rolling_24h', value: 3 },
];

// --- Components ---

const CodeBlock = ({ code, language = 'python' }: { code: string, language?: string }) => (
  <div className="rounded-lg overflow-hidden border border-zinc-800 my-4 shadow-2xl">
    <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
      </div>
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{language}</span>
    </div>
    <SyntaxHighlighter 
      language={language} 
      style={vscDarkPlus}
      customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem', background: '#09090b' }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
);

const Section = ({ title, icon: Icon, children, id }: { title: string, icon: any, children: React.ReactNode, id: string }) => (
  <motion.section 
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-20"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
        <Icon size={24} />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-zinc-100">{title}</h2>
    </div>
    <div className="space-y-6 text-zinc-400 leading-relaxed">
      {children}
    </div>
  </motion.section>
);

export default function App() {
  const data = useMemo(() => generateData(), []);
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'data', label: 'Data Prep', icon: Database },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'modeling', label: 'Modeling', icon: Cpu },
    { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-orange-500/30">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-900 p-6 hidden lg:flex flex-col z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">EnergyMetrics</span>
        </div>

        <div className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === item.id && "text-orange-500")} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 p-8 lg:p-12 max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <header className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Energy Forecasting Project
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-6 leading-[0.9]"
          >
            HOURLY ENERGY <br />
            <span className="text-orange-500">FORECASTING.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl leading-relaxed"
          >
            Memprediksi konsumsi energi listrik PJM East menggunakan XGBoost dengan integrasi fitur cuaca dan teknik time-series tingkat lanjut.
          </motion.p>
        </header>

        {/* Overview Section */}
        <Section title="Project Overview" icon={Info} id="overview">
          <p>
            Proyek ini bertujuan untuk membangun model prediktif yang akurat untuk konsumsi energi listrik per jam. 
            Dalam industri energi, forecasting yang akurat sangat krusial untuk manajemen beban (load management) 
            dan optimasi biaya operasional. Kita akan menggunakan dataset PJM East dan menambahkan variabel 
            eksternal berupa suhu untuk meningkatkan performa model.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { label: 'Algorithm', value: 'XGBoost Regressor', icon: Cpu },
              { label: 'Validation', value: 'TimeSeriesSplit', icon: Calendar },
              { label: 'Key Feature', value: 'Weather Correlation', icon: Thermometer },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <stat.icon className="text-orange-500 mb-4" size={24} />
                <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Data Preparation */}
        <Section title="Data Preparation" icon={Database} id="data">
          <p>
            Langkah pertama adalah memuat dataset konsumsi energi dan mensimulasikan data suhu sintetis. 
            Kita asumsikan adanya korelasi positif antara suhu tinggi (penggunaan AC) dengan kenaikan konsumsi listrik.
          </p>
          <CodeBlock code={`import pandas as pd
import numpy as np

# Load PJM East data
df = pd.read_csv('PJME_hourly.csv', index_col=[0], parse_dates=[0])

# Simulasi data suhu (Synthetic Weather Data)
# Korelasi: Suhu naik -> Konsumsi naik (AC load)
df['temp'] = 20 + np.sin(df.index.hour * np.pi / 12) * 10 + np.random.normal(0, 2, len(df))
df['PJME_MW'] = df['PJME_MW'] + (df['temp'] - 20) * 200`} />
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 mt-8">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-500" />
              Dataset Sample (Visualized)
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 48)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={3} dot={false} name="Energy (MW)" />
                  <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        {/* Feature Engineering */}
        <Section title="Feature Engineering" icon={Zap} id="features">
          <p>
            Feature engineering adalah "jantung" dari model time-series. Kita tidak hanya menggunakan waktu mentah, 
            tapi juga mengekstrak pola musiman (jam, hari, bulan) serta fitur Lag dan Rolling Window untuk 
            menangkap dependensi temporal.
          </p>
          <CodeBlock code={`def create_features(df):
    df = df.copy()
    df['hour'] = df.index.hour
    df['dayofweek'] = df.index.dayofweek
    df['quarter'] = df.index.quarter
    df['month'] = df.index.month
    
    # Modifikasi 1: Lag Features (1h, 24h, 7d)
    df['lag_1h'] = df['PJME_MW'].shift(1)
    df['lag_24h'] = df['PJME_MW'].shift(24)
    df['lag_7d'] = df['PJME_MW'].shift(24*7)
    
    # Modifikasi 2: Rolling Window (Moving Average 24h)
    df['rolling_mean_24h'] = df['PJME_MW'].transform(lambda x: x.shift(1).rolling(window=24).mean())
    
    return df`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Clock size={20} /></div>
              <div>
                <h5 className="text-white font-bold text-sm">Lag Features</h5>
                <p className="text-xs text-zinc-500 mt-1">Menangkap korelasi antara konsumsi saat ini dengan masa lalu (kemarin atau minggu lalu).</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><BarChart3 size={20} /></div>
              <div>
                <h5 className="text-white font-bold text-sm">Rolling Window</h5>
                <p className="text-xs text-zinc-500 mt-1">Menghaluskan noise dan menangkap tren jangka pendek melalui rata-rata bergerak.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Modeling */}
        <Section title="Modeling with XGBoost" icon={Cpu} id="modeling">
          <p>
            Kita menggunakan XGBoost karena kemampuannya menangani hubungan non-linear dan interaksi fitur yang kompleks. 
            Sangat penting untuk menggunakan <strong>TimeSeriesSplit</strong> agar tidak terjadi "data leakage" 
            (model tidak boleh melihat masa depan saat training).
          </p>
          <CodeBlock code={`from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit

# Inisialisasi model
model = XGBRegressor(n_estimators=1000, early_stopping_rounds=50, 
                     learning_rate=0.01, max_depth=5)

# TimeSeriesSplit (K-Fold khusus data waktu)
tss = TimeSeriesSplit(n_splits=5)

for train_idx, val_idx in tss.split(df):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
    
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)`} />
        </Section>

        {/* Evaluation */}
        <Section title="Evaluation & Results" icon={BarChart3} id="evaluation">
          <p>
            Hasil akhir menunjukkan model mampu mengikuti pola harian dengan sangat baik. 
            Fitur "Suhu" dan "Jam" terbukti menjadi prediktor paling dominan dalam menentukan beban listrik.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Actual vs Predicted Chart */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                Actual vs Predicted (Test Set)
              </h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.slice(100, 168)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={3} dot={false} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#52525b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance Chart */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                Feature Importance
              </h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {featureImportance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#27272a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden">
            <Zap className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64 rotate-12" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Key Takeaways for Interview</h3>
              <ul className="space-y-3 opacity-90">
                <li className="flex items-start gap-3">
                  <ChevronRight size={20} className="mt-1 shrink-0" />
                  <span><strong>Domain Knowledge:</strong> Mengintegrasikan data cuaca secara sintetis membuktikan pemahaman bahwa faktor eksternal sangat mempengaruhi beban listrik.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span><strong>Methodology:</strong> Penggunaan TimeSeriesSplit memastikan evaluasi model yang realistis dan mencegah bias "look-ahead".</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={20} className="mt-1 shrink-0" />
                  <span><strong>Optimization:</strong> Feature engineering dengan Lag dan Rolling Window adalah kunci untuk menangkap pola musiman yang kompleks.</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

      </main>
    </div>
  );
}
