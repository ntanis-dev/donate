import { Heart, Copy, Check, ExternalLink, QrCode, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import QRCodeLib from 'qrcode';

interface CryptoAddress {
  name: string;
  symbol: string;
  address: string;
  network?: string;
}

function App() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ symbol: string; name: string; address: string; network?: string } | null>(null);
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isBarClosing, setIsBarClosing] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isBarMounted, setIsBarMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [idlePosition, setIdlePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.005;
      const x = window.innerWidth / 2 + Math.sin(time) * 300;
      const y = window.innerHeight / 2 + Math.cos(time * 0.7) * 200;
      setIdlePosition({ x, y });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && showThankYou) {
        setIsBarMounted(false);
        setTimeout(() => {
          setIsBarMounted(true);
        }, 10);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showThankYou]);

  const cryptoAddresses: CryptoAddress[] = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      address: '34NTWFNAXVjC11em83ZTTcPE5zbAkWty12',
      network: 'Bitcoin'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0x312011c0545e94f5a8af441718931b2a3b772c92',
      network: 'ERC-20'
    },
    {
      name: 'USDC',
      symbol: 'USDC',
      address: '0x73bb6671dba4211724cea39e4b084dae8e9fdf73',
      network: 'ERC-20'
    },
    {
      name: 'USDT',
      symbol: 'USDT',
      address: 'TUgDMTZEMb2JRMbfZxVv5oqiKMXY3K8aYi',
      network: 'TRC-20'
    }
  ];

  useEffect(() => {
    const generateQRCodes = async () => {
      const qrCodes: Record<string, string> = {};
      for (const crypto of cryptoAddresses) {
        try {
          const dataUrl = await QRCodeLib.toDataURL(crypto.address, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          qrCodes[crypto.symbol] = dataUrl;
        } catch (err) {
          console.error(`Failed to generate QR for ${crypto.symbol}:`, err);
        }
      }
      setQrDataUrls(qrCodes);
    };

    generateQRCodes();
  }, []);

  const copyToClipboard = async (address: string, symbol: string) => {
    if (isAnimating) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(symbol);
      if (!showThankYou) {
        setIsAnimating(true);
        setShowThankYou(true);
        setIsBarMounted(false);
        setTimeout(() => {
          setIsBarMounted(true);
          setIsAnimating(false);
        }, 10);
      }
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLinkClick = () => {
    if (isAnimating) return;
    if (!showThankYou) {
      setIsAnimating(true);
      setShowThankYou(true);
      setIsBarMounted(false);
      setTimeout(() => {
        setIsBarMounted(true);
        setIsAnimating(false);
      }, 10);
    }
  };

  const handleQrOpen = (crypto: CryptoAddress) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setQrModal({ symbol: crypto.symbol, name: crypto.name, address: crypto.address, network: crypto.network });
    setIsModalMounted(false);
    setTimeout(() => setIsModalMounted(true), 10);

    if (!showThankYou) {
      setShowThankYou(true);
      setIsBarMounted(false);
      setTimeout(() => {
        setIsBarMounted(true);
        setIsAnimating(false);
      }, 10);
    } else {
      setIsAnimating(false);
    }
  };

  const handleCloseModal = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsModalClosing(true);
    setTimeout(() => {
      setQrModal(null);
      setIsModalClosing(false);
      setIsAnimating(false);
    }, 500);
  };

  const handleCloseBar = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsBarClosing(true);
    setTimeout(() => {
      setShowThankYou(false);
      setIsBarClosing(false);
      setIsAnimating(false);
    }, 500);
  };

  const activeX = idlePosition.x;
  const activeY = idlePosition.y;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-700"
      style={{
        background: `radial-gradient(circle at ${activeX}px ${activeY}px, rgb(30, 41, 59), rgb(15, 23, 42), rgb(2, 6, 23))`
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(600px circle at ${activeX}px ${activeY}px, rgba(245, 158, 11, 0.15), transparent 80%)`
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl relative z-10">
        <div className="donation-box bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 px-4 sm:px-6 py-6 sm:py-8 text-center border-b border-amber-500">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/30 rounded-full mb-3">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
            </div>
            <h1 className="text-xl sm:text-2xl text-white mb-2">@ntanis-dev</h1>
            <p className="text-white/90 text-xs sm:text-sm max-w-2xl italic mx-auto">
              If you've found my work helpful, any contribution is greatly appreciated.<br className="hidden sm:inline"/><span className="sm:hidden"> </span>There's absolutely no obligation, all of my public <a
                href="https://github.com/ntanis-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
              >GitHub</a> projects are free to use.
            </p>
          </div>

          <div className="px-4 sm:px-6 py-5 sm:py-6">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-3">Fiat</h2>

                <a
                  href="https://revolut.me/gkarantanis"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg px-4 sm:px-5 py-3 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 group mb-3"
                >
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm sm:text-base font-semibold">Revolut</span>
                      </div>
                      <div className="text-white/80 text-xs">
                        Revolut • Debit / Credit Card 
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </a>

                <a
                  href="https://www.tipeeestream.com/ntanis/donation"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="block bg-orange-500/10 rounded-lg px-4 sm:px-5 py-3 border border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/15 transition-all group"
                >
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm sm:text-base font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">TipeeeStream</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Debit / Credit Card • Sofort • Giropay • PaysafeCard • iDEAL • Apple Pay • Google Pay
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0 text-slate-300" />
                  </div>
                </a>
              </div>

              <div className="border-t border-slate-800 pt-5 sm:pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-3">
                  Cryptocurrency
                </h2>
                <div className="space-y-2">
                  {cryptoAddresses.map((crypto) => (
                    <div key={crypto.symbol} className="space-y-2">
                      <div
                        className="bg-slate-800/50 rounded-lg px-3 sm:px-5 py-3 hover:bg-slate-800 transition-colors border border-slate-700/50"
                      >
                      <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded w-14 text-center inline-block">
                              {crypto.symbol}
                            </span>
                            {crypto.network && (
                              <span className="text-xs text-slate-400">
                                  {crypto.network}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => copyToClipboard(crypto.address, crypto.symbol)}
                            className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            {copiedAddress === crypto.symbol ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-orange-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleQrOpen(crypto)}
                            className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-orange-400" />
                          </button>
                        </div>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-xs mb-3">
                Thank you for considering supporting my work.<br className="hidden sm:inline"/><span className="sm:hidden"> </span>Every contribution helps keep these projects alive and thriving.
              </p>
              <a
                href="https://github.com/ntanis-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors"
              >
                <span className="text-xs font-medium">GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>


      {showThankYou && (
        <div
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out ${
            isBarClosing ? 'opacity-0 -translate-y-full' : isBarMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
          }`}
        >
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 shadow-2xl">
            <div className="container mx-auto flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 relative">
              <p className="text-white text-xs sm:text-sm font-medium text-center">
                Thank you so much for your generosity!
              </p>
              <button
                onClick={handleCloseBar}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 absolute right-4 sm:right-6"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {qrModal && (
        <div
          className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-500 ease-out ${
            isModalClosing ? 'opacity-0' : isModalMounted ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-slate-900 rounded-xl sm:rounded-2xl p-5 sm:p-6 max-w-sm w-full border border-slate-700 shadow-2xl transition-all duration-500 ease-out ${
              isModalClosing ? 'scale-95 opacity-0' : isModalMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">{qrModal.symbol}</h3>
                {qrModal.network && (
                  <p className="text-xs text-slate-400 mt-0.5">{qrModal.network}</p>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg mb-4">
              {qrDataUrls[qrModal.symbol] ? (
                <img
                  src={qrDataUrls[qrModal.symbol]}
                  alt={`QR code for ${qrModal.name}`}
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-slate-400">
                  Generating QR code...
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center break-all font-mono select-text">
              {qrModal.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
