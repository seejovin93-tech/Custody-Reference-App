import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, ArrowRight, Heart, Delete, Plus, RefreshCcw, ChevronLeft, KeyRound, Check, Smartphone, Sparkles, Copy, FileText, AlertTriangle, Hash, Wallet, ScanFace, Lock } from 'lucide-react';
import { Button } from './Button';

interface LoginProps {
  onLogin: (isDuress: boolean) => void;
}

// Extracted to avoid re-render issues
const PinDot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div className={`w-4 h-4 rounded-full border-2 border-pastel-border transition-all duration-200 ${
    filled ? 'bg-pastel-text scale-110' : 'bg-gray-200'
  }`} />
);

const DICTIONARY = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu", "atom", "bamboo", "cave", "dune", "eagle", "fame", "gate", "hawk", "icon", "jazz", "kite", "laser", "moon", "neon", "ocean", "pixel", "quest", "radio", "star", "token", "ultra", "vault", "wave", "zero"];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Flow: 'checking' -> 'welcome' (new user) OR 'login' (existing)
  // Sub-flows for welcome: 'generation' (create ID) -> 'face-scan' -> 'seed-phrase' -> 'register' (set pin) -> 'confirm-pin' -> Complete
  const [view, setView] = useState<'checking' | 'welcome' | 'register' | 'confirm-pin' | 'generation' | 'face-scan' | 'seed-phrase' | 'recover' | 'login'>('checking');
  
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState(''); // Store first pin for confirmation
  const [error, setError] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newAccountId, setNewAccountId] = useState('');
  const [copied, setCopied] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedCopied, setSeedCopied] = useState(false);
  
  // Face Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanInstruction, setScanInstruction] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [motionDetected, setMotionDetected] = useState(false);
  
  // Camera & Motion Detection Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastFrameRef = useRef<Uint8ClampedArray | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. AUTO-DETECT: Check for existing user on mount
  useEffect(() => {
    const checkVaultStatus = () => {
        const hasVault = localStorage.getItem('mimi_vault_exists');
        
        // Simulating hardware "boot up" time
        setTimeout(() => {
            if (hasVault) {
                // CASE: EXISTING USER -> Go straight to PIN
                setView('login');
            } else {
                // CASE: NEW USER -> Go to Register/Recover selection
                setView('welcome');
            }
        }, 800);
    };

    checkVaultStatus();
  }, []);

  // Cleanup stream on unmount or view change
  const stopCamera = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
      }
      setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Motion Detection Loop
  const startMotionDetection = useCallback(() => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Reset
      lastFrameRef.current = null;

      const scanLoop = () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
              // Draw small frame for performance
              ctx.drawImage(videoRef.current, 0, 0, 32, 32);
              const frame = ctx.getImageData(0, 0, 32, 32);
              const data = frame.data;
              
              if (lastFrameRef.current) {
                  let diff = 0;
                  // Sample pixels to detect change
                  for(let i = 0; i < data.length; i += 16) {
                      diff += Math.abs(data[i] - lastFrameRef.current[i]);
                  }
                  
                  // Threshold for meaningful movement (head rotation)
                  // Using a higher threshold so slight jitter doesn't trigger it, 
                  // requiring actual head movement.
                  if (diff > 800) { 
                      setMotionDetected(true);
                      setScanProgress(prev => {
                         // Cap at 100
                         if (prev >= 100) return 100;
                         // Increment progress based on motion
                         return prev + 1.2; 
                      });
                  } else {
                      setMotionDetected(false);
                  }
              }
              
              // Store current frame for next comparison
              lastFrameRef.current = new Uint8ClampedArray(data);
          }
          
          animationFrameRef.current = requestAnimationFrame(scanLoop);
      };
      
      scanLoop();
  }, []);

  // Watch for completion
  useEffect(() => {
      if (scanProgress >= 100 && !scanComplete) {
          setScanComplete(true);
          setScanInstruction('Face ID Enrolled');
          stopCamera();
      } else if (scanProgress > 0 && scanProgress < 100) {
          if (motionDetected) {
            setScanInstruction('Scanning...');
          } else {
            setScanInstruction('Move head in a circle');
          }
      }
  }, [scanProgress, scanComplete, stopCamera, motionDetected]);


  // Handle PIN Logic
  useEffect(() => {
    if (pin.length === 4) {
      setLoading(true);
      setError('');
      
      const timer = setTimeout(() => {
        if (view === 'register') {
            // REGISTRATION STEP 1: Capture first PIN
            setFirstPin(pin);
            setPin('');
            setLoading(false);
            setView('confirm-pin');
        } else if (view === 'confirm-pin') {
            // REGISTRATION STEP 2: Confirm PIN
            if (pin === firstPin) {
                // Success - Finalize Account Creation
                localStorage.setItem('mimi_vault_exists', 'true');
                onLogin(false); 
            } else {
                // Mismatch
                setError('PINs do not match');
                setTimeout(() => {
                   setPin('');
                   setFirstPin('');
                   setError('');
                   setView('register');
                   setLoading(false);
                }, 1000);
            }
        } else if (view === 'login') {
            // LOGIN MODE
            if (pin === '1234') { // TRACK A
               onLogin(false);
            } else if (pin === '8888') { // TRACK B (Duress)
               onLogin(true);
            } else {
               setError('Decryption Failed');
               setLoading(false);
               setPin('');
            }
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [pin, onLogin, view, firstPin]);

  const handlePadClick = (val: string) => {
    if (loading) return;
    setError('');
    
    if (val === 'C') {
      setPin('');
      return;
    }
    
    if (val === 'back') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const handleRecovery = () => {
      if (!recoveryInput) return;
      setLoading(true);
      setTimeout(() => {
          localStorage.setItem('mimi_vault_exists', 'true');
          onLogin(false);
      }, 1500);
  };

  // --- Helpers ---
  const generateRandomId = () => {
      return Array.from({ length: 3 }, () => 
            Math.floor(1000 + Math.random() * 9000).toString()
      ).join(' ');
  };

  const generateRandomSeed = () => {
      return Array.from({length: 12}, () => DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)]);
  };

  const handleSwissSetup = () => {
    setLoading(true);
    setTimeout(() => {
        const id = generateRandomId();
        setNewAccountId(id);
        localStorage.setItem('mimi_vault_id', id);
        setLoading(false);
        setView('generation');
    }, 1500);
  };

  const handleProceedToFaceScan = () => {
      setView('face-scan');
  };

  const handleStartScan = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 640 }
            } 
        });
        
        streamRef.current = mediaStream;
        
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }

        setIsScanning(true);
        setScanProgress(0);
        setScanInstruction('Position face in frame');
        
      } catch (err) {
        console.error("Camera access denied:", err);
        setScanInstruction("Camera access needed for enrollment.");
      }
  };

  const handleProceedToSeed = () => {
      const phrase = generateRandomSeed();
      setSeedPhrase(phrase);
      setView('seed-phrase');
  };

  const handleTraditionalSetup = () => {
      setLoading(true);
      setTimeout(() => {
          const id = generateRandomId();
          setNewAccountId(id);
          localStorage.setItem('mimi_vault_id', id);

          const phrase = generateRandomSeed();
          setSeedPhrase(phrase);
          
          setLoading(false);
          setView('seed-phrase');
      }, 1500);
  };

  const handleProceedToPin = () => {
      setView('register');
  };

  const copyToClipboard = () => {
     if (newAccountId) {
         navigator.clipboard.writeText(newAccountId);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
     }
  };

  const copySeedToClipboard = () => {
      navigator.clipboard.writeText(seedPhrase.join(' '));
      setSeedCopied(true);
      setTimeout(() => setSeedCopied(false), 2000);
  };

  // Keyboard support for PIN views
  useEffect(() => {
    if (view !== 'login' && view !== 'register' && view !== 'confirm-pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key >= '0' && e.key <= '9') {
        handlePadClick(e.key);
      } else if (e.key === 'Backspace') {
        handlePadClick('back');
      } else if (e.key === 'Escape') {
        handlePadClick('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, loading, view]);

  const numBtnClass = "w-16 h-16 rounded-full bg-white border-2 border-pastel-border text-xl font-bold text-pastel-text shadow-pixel-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center";
  const actionBtnClass = "w-16 h-16 rounded-full border-2 border-pastel-border text-sm font-bold shadow-pixel-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center";

  // --- RENDER VIEWS ---

  if (view === 'checking') {
      return (
        <div className="min-h-screen bg-pastel-bg flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <Shield className="w-12 h-12 text-pastel-text mb-4" />
                <p className="font-pixel text-sm text-gray-400">Booting Secure Enclave...</p>
            </div>
        </div>
      );
  }

  if (view === 'welcome') {
      return (
        <div className="min-h-screen bg-pastel-bg md:flex md:items-center md:justify-center md:p-6 font-mono">
            <div className="w-full md:max-w-md bg-white md:border-2 border-pastel-border md:rounded-2xl md:shadow-pixel p-6 md:p-8 relative overflow-hidden h-screen md:h-auto flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-pastel-yellow border-2 border-pastel-border rounded-2xl mb-4 shadow-pixel transform -rotate-2">
                        <Shield className="w-10 h-10 text-pastel-text" strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl text-pastel-text mb-2 font-pixel">Mimi Vault</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Select setup method</p>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={handleTraditionalSetup}
                        disabled={loading}
                        className="w-full group relative bg-white border-2 border-pastel-border rounded-xl p-4 shadow-pixel hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-pixel-sm transition-all text-left flex items-center justify-between disabled:opacity-50"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-pastel-blue rounded-full border-2 border-pastel-border flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6 text-pastel-text" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-pastel-text font-pixel text-sm">Traditional Wallet</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Seed Phrase + PIN</p>
                            </div>
                        </div>
                        {loading ? <div className="w-5 h-5 border-2 border-pastel-text border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5 text-pastel-text opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" strokeWidth={3} />}
                    </button>

                    <button 
                        onClick={handleSwissSetup}
                        disabled={loading}
                        className="w-full group relative bg-pastel-purple border-2 border-pastel-border rounded-xl p-4 shadow-pixel hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-pixel-sm transition-all text-left flex items-center justify-between disabled:opacity-50"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-full border-2 border-pastel-border flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Hash className="w-6 h-6 text-pastel-text" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-pastel-text font-pixel text-sm">Swiss Numbered</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">12-Digit ID + Face + PIN</p>
                            </div>
                        </div>
                        {loading ? <div className="w-5 h-5 border-2 border-pastel-text border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5 text-pastel-text opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" strokeWidth={3} />}
                    </button>

                    <div className="pt-4 flex items-center justify-center">
                        <button 
                            onClick={() => setView('recover')}
                            className="text-xs font-bold text-gray-400 hover:text-pastel-text transition-colors flex items-center gap-2 group"
                        >
                            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            Recover Existing Vault
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (view === 'generation') {
      return (
          <div className="min-h-screen bg-pastel-bg md:flex md:items-center md:justify-center md:p-6 font-mono">
            <div className="w-full md:max-w-md bg-white md:border-2 border-pastel-border md:rounded-2xl md:shadow-pixel p-6 md:p-8 relative overflow-hidden h-screen md:h-auto flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-16 h-16 bg-pastel-green border-2 border-pastel-border rounded-full mb-4 shadow-pixel-sm">
                        <Sparkles className="w-8 h-8 text-pastel-text" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-bold text-pastel-text font-pixel">
                        Vault Created
                    </h2>
                    <p className="text-xs text-gray-500 font-bold mt-1">
                        Save your unique identity.
                    </p>
                </div>

                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="relative group cursor-pointer" onClick={copyToClipboard}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-pastel-purple to-pastel-blue rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                        <div className="relative bg-white border-2 border-pastel-border rounded-xl p-6 text-center shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-pixel">Your Account ID</p>
                            <p className="text-2xl font-bold text-pastel-text font-mono tracking-wider">{newAccountId}</p>
                            <div className="absolute top-2 right-2">
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-300" />}
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-100 rounded-xl p-3 flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 font-bold leading-relaxed">
                            Please write this number down. You will need it to recover your vault if you lose access to this device.
                        </p>
                    </div>

                    <Button 
                        onClick={handleProceedToFaceScan}
                        className="w-full h-14 !bg-pastel-text !text-white"
                        icon={<ArrowRight className="w-4 h-4" />}
                    >
                        CONTINUE TO SECURITY
                    </Button>
                </div>
            </div>
          </div>
      );
  }

  if (view === 'face-scan') {
      const TICK_COUNT = 40;
      
      return (
          <div className="min-h-screen bg-pastel-bg md:flex md:items-center md:justify-center md:p-6 font-mono">
            <div className="w-full md:max-w-md bg-white md:border-2 border-pastel-border md:rounded-2xl md:shadow-pixel p-6 md:p-8 relative overflow-hidden h-screen md:h-auto flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Hidden Canvas for Motion Detection */}
                <canvas ref={canvasRef} className="hidden" width={32} height={32}></canvas>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pastel-pink border-2 border-pastel-border rounded-full mb-4 shadow-pixel-sm">
                        <ScanFace className="w-8 h-8 text-pastel-text" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-bold text-pastel-text font-pixel">Biometric Enrollment</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">Scan to enable Face + PIN recovery</p>
                </div>

                <div className="space-y-8 flex flex-col items-center">
                    
                    {/* FaceID Style Ring */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* Ticks */}
                        {Array.from({ length: TICK_COUNT }).map((_, i) => {
                            const rotation = i * (360 / TICK_COUNT);
                            // Determine if tick is active
                            const isLit = (i / TICK_COUNT) * 100 < scanProgress;
                            
                            return (
                                <div 
                                    key={i}
                                    className={`absolute rounded-full transition-all duration-300 ${
                                        isLit 
                                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] w-1.5 h-4' 
                                        : 'bg-gray-200 w-1 h-2'
                                    }`}
                                    style={{
                                        transform: `rotate(${rotation}deg) translateY(-115px)`,
                                    }}
                                />
                            );
                        })}

                        {/* Circular Viewport */}
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-[0px_4px_12px_rgba(0,0,0,0.1)] bg-gray-100 relative z-10 flex items-center justify-center mask-image-circle">
                            {isScanning ? (
                                <>
                                    <video 
                                        ref={videoRef}
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        onPlay={startMotionDetection}
                                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                                    />
                                    {/* Scan Line Overlay - Only when moving */}
                                    {motionDetected && !scanComplete && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent z-20 animate-pulse"></div>
                                    )}
                                </>
                            ) : scanComplete ? (
                                <div className="bg-green-500 w-full h-full flex items-center justify-center animate-in zoom-in duration-300">
                                     <Check className="w-24 h-24 text-white" strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="bg-gray-50 w-full h-full flex items-center justify-center">
                                     <ScanFace className="w-24 h-24 text-gray-300 opacity-50" strokeWidth={1} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full text-center min-h-[60px]">
                        {isScanning || scanComplete ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <p className={`font-pixel text-lg mb-1 transition-all ${scanComplete ? 'text-green-600' : 'text-pastel-text'}`}>
                                    {scanInstruction}
                                </p>
                                {!scanComplete && (
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                        {Math.round(scanProgress)}% Captured
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-3 flex items-start gap-3 text-left">
                                    <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
                                            Biometrics are locally encrypted. No face data ever leaves this device.
                                        </p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleStartScan}
                                    className="w-full h-14"
                                    icon={<ScanFace className="w-4 h-4" />}
                                >
                                    START FACE SCAN
                                </Button>
                            </div>
                        )}

                        {scanComplete && (
                             <div className="mt-4 animate-in slide-in-from-bottom-2 delay-300">
                                <Button 
                                    onClick={handleProceedToSeed}
                                    className="w-full h-14 !bg-pastel-text !text-white"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                >
                                    GENERATE SEED PHRASE
                                </Button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
      );
  }

  if (view === 'seed-phrase') {
      return (
        <div className="min-h-screen bg-pastel-bg md:flex md:items-center md:justify-center md:p-6 font-mono">
            <div className="w-full md:max-w-md bg-white md:border-2 border-pastel-border md:rounded-2xl md:shadow-pixel p-6 md:p-8 relative overflow-hidden h-screen md:h-auto flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pastel-blue border-2 border-pastel-border rounded-full mb-4 shadow-pixel-sm">
                        <FileText className="w-8 h-8 text-pastel-text" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-bold text-pastel-text font-pixel">Secret Phrase</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">This is your master key.</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                    {seedPhrase.map((word, index) => (
                        <div key={index} className="bg-gray-50 border-2 border-pastel-border rounded-lg p-2 flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400 font-pixel">{index + 1}.</span>
                            <span className="text-xs font-bold text-pastel-text">{word}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                     <button 
                        onClick={copySeedToClipboard}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold text-xs uppercase hover:border-pastel-border hover:text-pastel-text hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                        {seedCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {seedCopied ? "COPIED TO CLIPBOARD" : "COPY PHRASE"}
                    </button>

                    <div className="bg-red-50 border-2 border-red-100 rounded-xl p-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-800 font-bold leading-relaxed">
                            WARNING: If you lose this phrase, you lose your funds forever. We cannot recover it for you.
                        </p>
                    </div>

                    <Button 
                        onClick={handleProceedToPin}
                        className="w-full h-14 !bg-pastel-text !text-white"
                        icon={<ArrowRight className="w-4 h-4" />}
                    >
                        I HAVE SAVED IT
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  if (view === 'recover') {
      return (
          <div className="min-h-screen bg-pastel-bg md:flex md:items-center md:justify-center md:p-6 font-mono">
            <div className="w-full md:max-w-md bg-white md:border-2 border-pastel-border md:rounded-2xl md:shadow-pixel p-6 md:p-8 relative overflow-hidden h-screen md:h-auto flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setView('welcome')} className="absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-pastel-text" strokeWidth={3} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pastel-blue border-2 border-pastel-border rounded-full mb-4 shadow-pixel-sm">
                        <KeyRound className="w-8 h-8 text-pastel-text" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-bold text-pastel-text font-pixel">Import Vault</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">Enter your recovery ID</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-pastel-text uppercase font-pixel ml-1">Account Number</label>
                        <textarea 
                            value={recoveryInput}
                            onChange={(e) => setRecoveryInput(e.target.value)}
                            className="w-full h-32 p-4 bg-gray-50 border-2 border-pastel-border rounded-xl text-sm font-mono font-bold text-pastel-text focus:outline-none focus:bg-white focus:shadow-pixel-sm transition-all resize-none placeholder-gray-300"
                            placeholder="Enter your 12-digit recovery account number..."
                        />
                    </div>

                    <Button 
                        onClick={handleRecovery}
                        isLoading={loading}
                        disabled={!recoveryInput || loading}
                        className="w-full h-12"
                        icon={<ArrowRight className="w-4 h-4" />}
                    >
                        RECOVER VAULT
                    </Button>
                </div>
            </div>
          </div>
      );
  }

  const getTitle = () => {
      if (view === 'register') return 'Set New PIN';
      if (view === 'confirm-pin') return 'Confirm PIN';
      return 'Vault Locked';
  }

  const getSubtitle = () => {
      if (view === 'register') return 'Register a new Pin';
      if (view === 'confirm-pin') return 'Confirm your pin again';
      return 'Enter 4-digit PIN';
  }

  return (
    <div className="min-h-screen bg-pastel-bg md:flex md:items-center md:justify-center md:p-6 font-mono">
      <div className="w-full md:max-w-md bg-white md:border-2 border-pastel-border md:rounded-2xl md:shadow-pixel p-6 md:p-8 relative overflow-hidden h-screen md:h-auto flex flex-col justify-center animate-in zoom-in-95 duration-300">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pastel-yellow rounded-full border-2 border-pastel-border"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-pastel-blue rounded-full border-2 border-pastel-border"></div>

        <div className="relative text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pastel-pink border-2 border-pastel-border rounded-xl mb-4 shadow-pixel-sm transform -rotate-3">
            <Shield className="w-8 h-8 text-pastel-text" strokeWidth={2} />
          </div>
          <h1 className="text-2xl text-pastel-text mb-1 font-pixel">
             {getTitle()}
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
             {getSubtitle()}
          </p>
        </div>

        <div className="relative z-10 max-w-[280px] mx-auto">
            
            <div className="bg-gray-50 border-2 border-pastel-border rounded-xl p-4 mb-8 flex items-center justify-center space-x-4 shadow-inner h-16">
               {[0, 1, 2, 3].map(i => (
                  <PinDot key={i} filled={pin.length > i} />
               ))}
            </div>

            {error && (
               <div className="absolute w-full top-16 text-center left-0">
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-200 animate-pulse">{error}</span>
               </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8 place-items-center">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePadClick(num.toString())}
                    disabled={loading}
                    className={numBtnClass}
                  >
                    {num}
                  </button>
               ))}
               <button
                  onClick={() => handlePadClick('C')}
                  disabled={loading}
                  className={`${actionBtnClass} bg-red-100 text-red-500 active:bg-red-200`}
               >
                  CLR
               </button>
               <button
                  onClick={() => handlePadClick('0')}
                  disabled={loading}
                  className={numBtnClass}
               >
                  0
               </button>
               <button
                  onClick={() => handlePadClick('back')}
                  disabled={loading}
                  className={`${actionBtnClass} bg-gray-100 text-pastel-text active:bg-gray-200`}
               >
                  <Delete className="w-5 h-5" />
               </button>
            </div>

            <Button 
                onClick={() => {}} 
                className="w-full h-12 !bg-pastel-text !text-white" 
                isLoading={loading}
                disabled={pin.length < 4}
                icon={!loading && <ArrowRight className="w-4 h-4" />}
            >
                {(view === 'register' || view === 'confirm-pin') ? 'NEXT' : 'UNLOCK'}
            </Button>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-pastel-border text-center">
           <p className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-2">
              <Heart className="w-3 h-3 text-pastel-pink fill-current" />
              Secured by Heimdall
           </p>
           {view === 'login' && (
               <button 
                  onClick={() => {
                      if (window.confirm("Factory Reset Device? This will clear local data.")) {
                          localStorage.removeItem('mimi_vault_exists');
                          localStorage.removeItem('mimi_vault_id');
                          window.location.reload();
                      }
                  }} 
                  className="mt-4 text-[9px] text-gray-300 hover:text-red-300 underline"
               >
                   [FACTORY RESET]
               </button>
           )}
        </div>
      </div>
    </div>
  );
};