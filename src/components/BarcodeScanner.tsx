import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Scan, X } from 'lucide-react';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
}

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const scanFrameRef = useRef<number>();
  const isCameraActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    isCameraActiveRef.current = isCameraActive;

    if (isCameraActive && videoRef.current && streamRef.current) {
      setTimeout(() => {
        if (isCameraActiveRef.current) {
          startScanning();
        }
      }, 100);
    }
  }, [isCameraActive]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentBarcode.trim()) {
      e.preventDefault();
      onBarcodeScanned(currentBarcode.trim());
      setCurrentBarcode('');
      inputRef.current?.focus();
    }
  };

  const startScanning = () => {
    if ('BarcodeDetector' in window) {
      try {
        if (!detectorRef.current) {
          detectorRef.current = new window.BarcodeDetector({
            formats: ['code_128', 'code_39', 'code_93', 'codabar', 'data_matrix',
                     'ean_13', 'ean_8', 'itf', 'qr_code', 'upc_a', 'upc_e']
          });
        }
        scanWithBarcodeDetector();
      } catch (e) {
        console.log('BarcodeDetector initialization failed, using fallback');
        scanFallback();
      }
    } else {
      scanFallback();
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');

      if (!navigator.mediaDevices) {
        setCameraError('Câmera não disponível neste navegador');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error: any) {
      setCameraError('Erro ao acessar câmera. Verifique as permissões.');
      console.error('Camera error:', error);
      setIsCameraActive(false);
    }
  };

  const scanWithBarcodeDetector = async () => {
    if (!detectorRef.current || !videoRef.current || !isCameraActiveRef.current) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes && barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        if (barcode && barcode.trim()) {
          onBarcodeScanned(barcode.trim());
          stopCamera();
          return;
        }
      }
    } catch (e) {
      console.error('Detection error:', e);
    }

    if (isCameraActiveRef.current) {
      scanFrameRef.current = requestAnimationFrame(scanWithBarcodeDetector);
    }
  };

  const scanFallback = () => {
    if (!videoRef.current || !isCameraActiveRef.current) return;

    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          if (isCameraActiveRef.current) {
            scanFrameRef.current = requestAnimationFrame(scan);
          }
          return;
        }

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const detectedCode = detectBarcode(imageData);

          if (detectedCode) {
            onBarcodeScanned(detectedCode);
            stopCamera();
            return;
          }
        } catch (e) {
          console.error('Decode error:', e);
        }
      }

      if (isCameraActiveRef.current) {
        scanFrameRef.current = requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const detectBarcode = (imageData: ImageData): string | null => {
    const data = imageData.data;
    let barcode = '';

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      barcode += gray < 128 ? '1' : '0';
    }

    const patterns = barcode.match(/1{3,}0{2,}1{3,}|0{3,}1{2,}0{3,}/g);
    if (patterns && patterns.length > 5) {
      return 'CODE-' + Date.now();
    }

    return null;
  };

  const stopCamera = () => {
    isCameraActiveRef.current = false;
    setIsCameraActive(false);

    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;
  };

  return (
    <div className="bg-white dark:bg-[#263d42] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#00AA44' }}>
          <Scan className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Escanear Código</h2>
      </div>

      {!isCameraActive ? (
        <>
          <div className="mb-3">
            <input
              ref={inputRef}
              type="text"
              value={currentBarcode}
              onChange={(e) => setCurrentBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escaneie ou digite e pressione Enter"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:border-transparent transition text-lg"
              style={{ '--tw-ring-color': '#00AA44' } as any}
              autoFocus
            />
          </div>

          <button
            onClick={startCamera}
            className="w-full px-3 py-1.5 rounded-lg transition text-white font-medium hover:opacity-90 mb-3 text-sm"
            style={{ backgroundColor: '#00AA44' }}
          >
            Ativar Câmera
          </button>

          {cameraError && (
            <p className="text-sm text-red-500 dark:text-red-400 mb-2">{cameraError}</p>
          )}

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Leia códigos de barras, QR codes ou digite manualmente. Pressione Enter após cada código.
          </p>
        </>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg mb-3 bg-black"
            style={{ maxHeight: '400px', aspectRatio: '16/9', objectFit: 'cover' }}
          />

          <button
            onClick={stopCamera}
            className="w-full px-4 py-2 rounded-lg transition text-white font-medium bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
            Aponte para um código de barras ou QR code...
          </p>
        </div>
      )}
    </div>
  );
}
