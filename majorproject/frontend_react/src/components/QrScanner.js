import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

const QrScanner = ({ passData }) => {
  const [data, setData] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRequestRef = useRef(null);
  const html5ScannerRef = useRef(null);

  // Send scanned data to parent
  useEffect(() => {
    if (data) passData(data);
  }, [data, passData]);

  useEffect(() => {
    let detector;

    const stopScanner = () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
        frameRequestRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (html5ScannerRef.current) {
        html5ScannerRef.current.clear().catch(() => {});
        html5ScannerRef.current = null;
      }
      setIsScanning(false);
    };

    const scanFrame = async () => {
      if (!videoRef.current || !detector) {
        return;
      }

      if (videoRef.current.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
        frameRequestRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const decodedText = barcodes[0].rawValue;
          console.log('QR Code scanned successfully:', decodedText);
          setData(decodedText);
          stopScanner();
          return;
        }
      } catch (detectErr) {
        console.warn('Barcode detection error:', detectErr);
      }

      frameRequestRef.current = requestAnimationFrame(scanFrame);
    };

    const tryNativeFormats = async () => {
      if (!('BarcodeDetector' in window)) {
        return false;
      }

      try {
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
        if (!supportedFormats.includes('qr_code')) {
          return false;
        }

        detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        console.log('Starting native barcode scanner...');
        setMode('native');
        setError('');
        setIsScanning(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;

        if (!videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return false;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        frameRequestRef.current = requestAnimationFrame(scanFrame);
        return true;
      } catch (err) {
        console.warn('Native BarcodeDetector failed, will fallback:', err);
        stopScanner();
        return false;
      }
    };

    const startHtml5Fallback = async () => {
      try {
        setMode('html5');
        setIsScanning(true);
        setError('');

        // eslint-disable-next-line camelcase
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        const scanner = new Html5QrcodeScanner(
          'html5-fallback-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          false
        );

        html5ScannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            console.log('QR Code scanned via html5-qrcode:', decodedText);
            setData(decodedText);
            stopScanner();
          },
          (errMessage) => {
            // Swallow frame-by-frame warnings
            if (typeof errMessage !== 'string' || !errMessage.includes('NotFoundException')) {
              console.warn('html5-qrcode warning:', errMessage);
            }
          }
        );
      } catch (err) {
        console.error('Failed to start html5-qrcode fallback:', err);
        setError(`Camera fallback unavailable: ${err.message}. Please use manual entry below.`);
        setIsScanning(false);
      }
    };

    const startScanner = async () => {
      const nativeWorked = await tryNativeFormats();
      if (!nativeWorked) {
        await startHtml5Fallback();
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      console.log('Manual input submitted:', manualInput);
      setData(manualInput.trim());
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {isScanning && !data && null}

      {/* Video container for BarcodeDetector */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          minHeight: mode === 'html5' ? 0 : '300px',
          borderRadius: '8px',
          marginBottom: mode === 'html5' ? 0 : '16px',
          display: mode === 'html5' ? 'none' : 'block'
        }}
        playsInline
        muted
      />

      {/* Container only used when html5-qrcode fallback is active */}
      <div
        id="html5-fallback-container"
        style={{ width: '100%', minHeight: mode === 'html5' ? '300px' : 0, marginBottom: '16px', display: mode === 'html5' ? 'block' : 'none' }}
      />

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          OR ENTER SERIAL NUMBER
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Serial Number"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
        />
        <Button variant="contained" onClick={handleManualSubmit} size="small">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default QrScanner;
