class MusicPlayer {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.currentCard = null;
        
        this.initializeElements();
        this.bindEvents();
        this.setupAudioEvents();
    }
    
    initializeElements() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.volumeControl = document.getElementById('volumeControl');
        this.currentTitle = document.getElementById('current-title');
        this.musicCards = document.querySelectorAll('.music-card');
        this.audioElements = document.querySelectorAll('audio');
    }
    
    bindEvents() {
        // Event listeners para las tarjetas de música
        this.musicCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const audioId = card.getAttribute('data-audio');
                this.selectSong(audioId, card);
            });
        });
        
        // Control de reproducción/pausa
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // Control de progreso
        this.progressBar.addEventListener('input', () => {
            this.seekTo();
        });
        
        // Control de volumen
        this.volumeControl.addEventListener('input', () => {
            this.changeVolume();
        });
    }
    
    setupAudioEvents() {
        this.audioElements.forEach(audio => {
            audio.addEventListener('timeupdate', () => {
                this.updateProgress();
            });
            
            audio.addEventListener('ended', () => {
                this.onSongEnd();
            });
            
            audio.addEventListener('loadedmetadata', () => {
                this.updateTimeDisplay();
            });
        });
    }
    
    selectSong(audioId, card) {
        // Pausar audio actual si existe
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        // Remover clase active de tarjeta anterior
        if (this.currentCard) {
            this.currentCard.classList.remove('active');
        }
        
        // Establecer nuevo audio y tarjeta
        this.currentAudio = document.getElementById(audioId);
        this.currentCard = card;
        
        // Añadir clase active a la nueva tarjeta
        this.currentCard.classList.add('active');
        
        // Actualizar título
        const title = card.querySelector('h3').textContent;
        this.currentTitle.textContent = title;
        
        // Configurar volumen
        this.currentAudio.volume = this.volumeControl.value;
        
        // Reproducir automáticamente
        this.play();
    }
    
    togglePlayPause() {
        if (!this.currentAudio) {
            this.showMessage('Selecciona una canción primero');
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        if (!this.currentAudio) return;
        
        this.currentAudio.play().then(() => {
            this.isPlaying = true;
            this.playPauseBtn.textContent = '⏸️';
            this.animatePlayButton();
        }).catch(error => {
            console.error('Error al reproducir:', error);
            this.showMessage('Error: Verifica que el archivo de audio exista en la carpeta "audios"');
        });
    }
    
    pause() {
        if (!this.currentAudio) return;
        
        this.currentAudio.pause();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️';
    }
    
    seekTo() {
        if (!this.currentAudio) return;
        
        const duration = this.currentAudio.duration;
        const seekTime = (this.progressBar.value / 100) * duration;
        this.currentAudio.currentTime = seekTime;
    }
    
    changeVolume() {
        if (this.currentAudio) {
            this.currentAudio.volume = this.volumeControl.value;
        }
        
        // Actualizar todos los audios para el próximo
        this.audioElements.forEach(audio => {
            audio.volume = this.volumeControl.value;
        });
    }
    
    updateProgress() {
        if (!this.currentAudio) return;
        
        const duration = this.currentAudio.duration;
        const currentTime = this.currentAudio.currentTime;
        
        if (duration) {
            const progress = (currentTime / duration) * 100;
            this.progressBar.value = progress;
            this.updateTimeDisplay();
        }
    }
    
    updateTimeDisplay() {
        if (!this.currentAudio) return;
        
        const currentTime = this.formatTime(this.currentAudio.currentTime);
        const duration = this.formatTime(this.currentAudio.duration);
        this.timeDisplay.textContent = `${currentTime} / ${duration}`;
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    onSongEnd() {
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️';
        this.progressBar.value = 0;
        
        // Opcional: reproducir siguiente canción
        this.playNext();
    }
    
    playNext() {
        const cards = Array.from(this.musicCards);
        const currentIndex = cards.indexOf(this.currentCard);
        const nextIndex = (currentIndex + 1) % cards.length;
        const nextCard = cards[nextIndex];
        const nextAudioId = nextCard.getAttribute('data-audio');
        
        setTimeout(() => {
            this.selectSong(nextAudioId, nextCard);
        }, 1000);
    }
    
    animatePlayButton() {
        this.playPauseBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.playPauseBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    showMessage(message) {
        // Crear elemento de mensaje temporal
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 3000);
    }
}

// Inicializar el reproductor cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
    
    // Añadir efectos visuales adicionales
    addVisualEffects();
});

function addVisualEffects() {
    // Efecto de parallax suave en el scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('header');
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    });
    
    // Efecto de partículas en el fondo (opcional)
    createParticles();
}

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    // Añadir animación CSS para las partículas
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
}