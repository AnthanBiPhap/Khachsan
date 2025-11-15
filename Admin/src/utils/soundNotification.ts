// Global audio context để tái sử dụng và tránh tạo mới nhiều lần
let globalAudioContext: AudioContext | null = null;
let audioUnlocked = false; // Flag để biết audio đã được unlock chưa

/**
 * Unlock audio context bằng cách tạo một silent sound
 * Cách này giúp "unlock" audio context ngay cả khi chưa có user interaction
 */
const unlockAudio = async () => {
  if (audioUnlocked) return;
  
  try {
    // Tạo một silent audio buffer để unlock audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }
    
    // Tạo một silent sound rất ngắn (0.001s) để unlock audio
    const buffer = globalAudioContext.createBuffer(1, 1, 22050);
    const source = globalAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(globalAudioContext.destination);
    source.start(0);
    
    // Resume audio context nếu bị suspended
    if (globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }
    
    audioUnlocked = true;
    console.log('✅ Audio context đã được unlock');
  } catch (error) {
    console.warn('⚠️ Không thể unlock audio context:', error);
  }
};

/**
 * Khởi tạo audio context (cần gọi khi có user interaction)
 */
export const initAudioContext = () => {
  if (!globalAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioContext = new AudioContextClass();
      console.log('✅ Audio context đã được khởi tạo');
      
      // Thử unlock audio context ngay
      unlockAudio().catch(() => {
        // Nếu không unlock được, vẫn tiếp tục - sẽ thử lại khi phát âm thanh
      });
    }
  } else {
    // Nếu đã có context, thử unlock nếu chưa unlock
    unlockAudio().catch(() => {});
  }
  return globalAudioContext;
};

/**
 * Phát âm thanh thông báo khi có message mới
 */
export const playNotificationSound = async () => {
  try {
    // Sử dụng global audio context hoặc tạo mới
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    
    if (!AudioContextClass) {
      console.warn('⚠️ Web Audio API không được hỗ trợ');
      return;
    }

    // Sử dụng global context nếu có, nếu không tạo mới
    let audioContext = globalAudioContext;
    if (!audioContext) {
      audioContext = new AudioContextClass();
      globalAudioContext = audioContext;
    }
    
    // Thử unlock audio context nếu chưa unlock
    if (!audioUnlocked) {
      await unlockAudio();
    }
    
    // Resume audio context nếu bị suspended (do browser policy)
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log('✅ Audio context đã được resume');
        audioUnlocked = true;
      } catch (resumeError) {
        console.warn('⚠️ Không thể resume audio context (cần user interaction):', resumeError);
        // Vẫn tiếp tục thử phát âm thanh - một số browser vẫn cho phép
      }
    }
    
    // Tạo 2 oscillator để tạo âm thanh phong phú hơn
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Kết nối oscillator với gain node và output
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Cấu hình âm thanh (tần số, loại sóng, volume)
    oscillator1.frequency.value = 800; // Tần số 800Hz
    oscillator2.frequency.value = 1000; // Tần số 1000Hz
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    // Volume và fade out
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Volume 50%
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4); // Fade out trong 0.4s
    
    // Phát âm thanh
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.4);
    oscillator2.stop(audioContext.currentTime + 0.4);
    
    console.log('🔔 Đã phát âm thanh thông báo');
  } catch (error) {
    console.error('❌ Error playing notification sound:', error);
    // Fallback: Sử dụng HTML5 Audio nếu có file audio
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      await audio.play().catch((err) => {
        console.error('❌ Error playing audio file:', err);
      });
    } catch (audioError) {
      console.error('❌ Error with audio fallback:', audioError);
    }
  }
};

/**
 * Phát âm thanh thông báo với tùy chọn volume
 */
export const playNotificationSoundWithVolume = (volume: number = 0.3) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

