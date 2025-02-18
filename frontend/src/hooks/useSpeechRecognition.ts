import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  let recognition: any = null;

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => setError(event.error);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
    };

    // Add speech end detection
    recognition.onspeechend = () => {
      recognition.stop();
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    setError(null);
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    recognition.stop();
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(''),
  };
};