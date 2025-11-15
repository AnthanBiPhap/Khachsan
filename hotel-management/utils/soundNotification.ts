/**
 * Phát âm thanh thông báo khi có message mới
 */
export const playNotificationSound = async () => {
  try {
    console.log('🔊 Bắt đầu phát âm thanh thông báo...');
    
    // Sử dụng Web Audio API để tạo âm thanh đơn giản
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    console.log('🔊 AudioContext state:', audioContext.state);
    
    // Resume audio context nếu bị suspended (do browser policy)
    if (audioContext.state === 'suspended') {
      console.log('🔊 Resuming audio context...');
      await audioContext.resume();
      console.log('🔊 AudioContext state after resume:', audioContext.state);
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
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime); // Volume 40%
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // Fade out trong 0.3s
    
    // Phát âm thanh
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.3);
    oscillator2.stop(audioContext.currentTime + 0.3);
    
    console.log('✅ Đã phát âm thanh thành công');
  } catch (error) {
    console.error('❌ Error playing notification sound:', error);
    // Fallback: Sử dụng HTML5 Audio nếu có file audio
    try {
      console.log('🔊 Thử fallback với HTML5 Audio...');
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      await audio.play().catch((err) => {
        console.error('❌ Error playing audio file:', err);
        // Fallback cuối cùng: Tạo beep đơn giản hơn
        console.log('🔊 Thử fallback cuối cùng với beep đơn giản...');
        try {
          const simpleContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const simpleOsc = simpleContext.createOscillator();
          const simpleGain = simpleContext.createGain();
          simpleOsc.connect(simpleGain);
          simpleGain.connect(simpleContext.destination);
          simpleOsc.frequency.value = 800;
          simpleOsc.type = 'sine';
          simpleGain.gain.setValueAtTime(0.3, simpleContext.currentTime);
          simpleGain.gain.exponentialRampToValueAtTime(0.01, simpleContext.currentTime + 0.2);
          simpleOsc.start();
          simpleOsc.stop(simpleContext.currentTime + 0.2);
          console.log('✅ Đã phát beep đơn giản thành công');
        } catch (fallbackError) {
          console.error('❌ Tất cả các cách phát âm thanh đều thất bại:', fallbackError);
        }
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
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

