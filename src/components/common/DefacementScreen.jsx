import React from 'react';

const DefacementScreen = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black text-green-400"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.9)), url("/ash.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: '"Courier New", monospace',
      }}
    >
      <style>
        {`
          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-1px, 1px); }
            40% { transform: translate(-1px, -1px); }
            60% { transform: translate(1px, 1px); }
            80% { transform: translate(1px, -1px); }
            100% { transform: translate(0); }
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,140,0.08),transparent_60%)]" />

      <div className="relative mx-4 w-full max-w-4xl border border-green-500/50 bg-black/60 p-6 shadow-[0_0_40px_rgba(0,255,140,0.2)] sm:p-10">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-green-500 sm:text-sm">
          System Breach Detected
        </p>

        <h1
          className="text-3xl font-bold uppercase leading-tight text-green-300 sm:text-5xl"
          style={{ animation: 'glitch 0.2s infinite' }}
        >
          Website Defaced
        </h1>

        <p className="mt-4 text-sm text-green-300/90 sm:text-base">
          Access point compromised. All activity is monitored.
        </p>

        <div className="mt-8 space-y-2 text-xs text-green-500 sm:text-sm">
          <p>{'>'} Initializing terminal...</p>
          <p>{'>'} Upload complete: Russel Rome Soriano</p>
          <p>{'>'} Theme mode: black-ops + cyber shell</p>
          <p>{'>'} Status: online</p>
        </div>

        <p className="mt-8 text-sm text-green-300 sm:text-base">
          Hacked by <span className="font-bold text-green-200">xH4rU_NoZoM1x</span>
          <span className="ml-1 inline-block" style={{ animation: 'blink 0.9s step-end infinite' }}>
            _
          </span>
        </p>
      </div>
    </div>
  );
};

export default DefacementScreen;
