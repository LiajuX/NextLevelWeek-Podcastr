import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationtoTimeString } from '../../utils/convertDurationtoTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying, 
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    clearPlayerState,
    hasNext,
    hasPrevious,
    playNext,
    playPrevious
  } = usePlayer();
  
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  const episode = episodeList[currentEpisodeIndex];
  
  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/assets/playing.svg" alt="Tocando agora"/>

        <strong>Tocando agora</strong>
      </header>
      
      { episode ? (
        <div className={styles.currentEpisode}>
          <Image 
            width={592} 
            height={592} 
            src={episode.thumbnail} 
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      ) }

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationtoTimeString(progress)}</span>
          <div className={styles.slider}>
            { episode ? (
              <Slider 
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} /> 
            ) }
          </div>
          <span>{convertDurationtoTimeString(episode?.duration ?? 0)}</span>         
        </div>

        { episode && (
          <audio 
            src={episode.url}
            ref={audioRef}
            autoPlay
            loop={isLooping}
            onEnded={handleEpisodeEnded}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        ) }

        <div className={styles.buttons}>
          <button 
            className={isShuffling ? styles.isActive : ''}
            type="button" 
            onClick={toggleShuffle} 
            disabled={!episode || episodeList.length === 1}
          >
            <img src="/assets/shuffle.svg" alt="Embaralhar"/>
          </button>

          <button 
            type="button" 
            onClick={playPrevious} 
            disabled={!episode || !hasPrevious}
          >
            <img src="/assets/play-previous.svg" alt="Tocar anterior"/>
          </button>

          <button 
            type="button" 
            className={styles.playButton} 
            disabled={!episode}
            onClick={togglePlay}
          >
            { isPlaying
              ? <img src="/assets/pause.svg" alt="Pausar"/>
              : <img src="/assets/play.svg" alt="Tocar"/>
            }
          </button>

          <button type="button" onClick={playNext} disabled={!episode || !hasNext} >
            <img src="/assets/play-next.svg" alt="Tocar próximo"/>
          </button>

          <button 
            className={isLooping ? styles.isActive : ''}
            type="button" 
            onClick={toggleLoop} 
            disabled={!episode}
          >
            <img src="/assets/repeat.svg" alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
  );
}
