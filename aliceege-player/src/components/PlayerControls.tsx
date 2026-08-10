import {
	Controls,
	FullscreenButton,
	Gesture,
	MuteButton,
	PIPButton,
	PlayButton,
	SeekButton,
	Spinner,
	Time,
	TimeSlider,
	useMediaState,
	VolumeSlider,
} from '@vidstack/react';
import {
	Maximize2,
	Minimize2,
	Pause,
	PictureInPicture2,
	Play,
	RefreshCw,
	RotateCcw,
	RotateCw,
	Volume1,
	Volume2,
	VolumeX,
} from 'lucide-react';
import { QualityMenu, SpeedMenu } from './PlayerMenus';
import { useToggleFlash } from './useToggleFlash';

interface PlayerControlsProps {
	title: string;
}

export function PlayerControls({ title }: PlayerControlsProps) {
	const paused = useMediaState('paused');
	const ended = useMediaState('ended');
	const waiting = useMediaState('waiting');
	const started = useMediaState('started');
	const canPlay = useMediaState('canPlay');
	const muted = useMediaState('muted');
	const volume = useMediaState('volume');
	const fullscreen = useMediaState('fullscreen');
	const canFullscreen = useMediaState('canFullscreen');
	const canSetVolume = useMediaState('canSetVolume');
	const pictureInPicture = useMediaState('pictureInPicture');
	const canPictureInPicture = useMediaState('canPictureInPicture');
	const controlsVisible = useMediaState('controlsVisible');
	const showSpinner = waiting && canPlay;
	const showCenterButton = paused && canPlay && !waiting;
	const isIdle = started && !paused && !controlsVisible;
	const [flash, clearFlash] = useToggleFlash(paused, canPlay);
	const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

	return (
		<>
			<div className='playerAmbient' aria-hidden='true' />
			<Gesture
				className={`playerGesture${isIdle ? ' playerGestureIdle' : ''}`}
				event='pointerup'
				action='toggle:paused'
			/>
			<Gesture
				className={`playerGesture${isIdle ? ' playerGestureIdle' : ''}`}
				event='dblpointerup'
				action='toggle:fullscreen'
			/>

			{showSpinner && (
				<div className='buffering' aria-hidden='true'>
					<Spinner.Root className='spinner' size={54}>
						<Spinner.Track className='spinnerTrack' width={6} />
						<Spinner.TrackFill className='spinnerFill' width={6} fillPercent={25} />
					</Spinner.Root>
				</div>
			)}

			{flash && (
				<div
					key={flash}
					className='tapFlash'
					aria-hidden='true'
					onAnimationEnd={clearFlash}
				>
					{flash === 'pause' ? <Pause size={27} fill='currentColor' /> : <Play size={27} fill='currentColor' />}
				</div>
			)}

			<Controls.Root className='playerTopBar'>
				<Controls.Group className='playerTitleGroup'>
					<span className='playerTitle'>{title}</span>
				</Controls.Group>
			</Controls.Root>

			<PlayButton
				className={`centerButton${showCenterButton ? ' centerButtonVisible' : ''}`}
				aria-label={ended ? 'Повторить' : 'Воспроизвести'}
				tabIndex={showCenterButton ? 0 : -1}
			>
				{ended ? (
					<RefreshCw size={30} />
				) : (
					<Play className='centerPlayIcon' size={31} fill='currentColor' />
				)}
			</PlayButton>

			<Controls.Root className='playerControls'>
				<Controls.Group className='timelineGroup'>
					<TimeSlider.Root className='timeSlider' aria-label='Позиция видео'>
						<TimeSlider.Track className='sliderTrack'>
							<TimeSlider.Progress className='sliderProgress' />
							<TimeSlider.TrackFill className='sliderFill' />
						</TimeSlider.Track>
						<TimeSlider.Preview className='sliderPreview'>
							<TimeSlider.Value className='sliderPreviewValue' />
						</TimeSlider.Preview>
						<TimeSlider.Thumb className='sliderThumb' />
					</TimeSlider.Root>
				</Controls.Group>
				<Controls.Group className='controlBar'>
					<SeekButton
						className='controlButton seekButton'
						seconds={-5}
						aria-label='Назад на 5 секунд'
						title='Назад на 5 секунд'
					>
						<RotateCcw size={19} />
					</SeekButton>
					<PlayButton
						className='controlButton controlButtonPrimary'
						aria-label={paused ? 'Воспроизвести' : 'Пауза'}
						title={paused ? 'Воспроизвести' : 'Пауза'}
					>
						{paused ? <Play size={19} fill='currentColor' /> : <Pause size={19} fill='currentColor' />}
					</PlayButton>
					<SeekButton
						className='controlButton seekButton'
						seconds={5}
						aria-label='Вперёд на 5 секунд'
						title='Вперёд на 5 секунд'
					>
						<RotateCw size={19} />
					</SeekButton>
					<div className='playerTime'>
						<Time type='current' />
						<span>/</span>
						<Time type='duration' />
					</div>
					<div className='controlSpacer' />
					{canSetVolume && (
						<div className='volumeControl'>
							<MuteButton
								className='controlButton'
								aria-label={muted ? 'Включить звук' : 'Выключить звук'}
								title={muted ? 'Включить звук' : 'Выключить звук'}
							>
								<VolumeIcon size={18} />
							</MuteButton>
							<VolumeSlider.Root className='volumeSlider' aria-label='Громкость'>
								<VolumeSlider.Track className='sliderTrack'>
									<VolumeSlider.TrackFill className='sliderFill' />
								</VolumeSlider.Track>
								<VolumeSlider.Thumb className='sliderThumb' />
							</VolumeSlider.Root>
						</div>
					)}
					<SpeedMenu />
					<QualityMenu />
					{canPictureInPicture && (
						<PIPButton
							className='controlButton secondaryControl'
							aria-label={pictureInPicture ? 'Выйти из мини-плеера' : 'Картинка в картинке'}
							title={pictureInPicture ? 'Выйти из мини-плеера' : 'Картинка в картинке'}
						>
							<PictureInPicture2 size={19} />
						</PIPButton>
					)}
					{canFullscreen && (
						<FullscreenButton
							className='controlButton'
							aria-label={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
							title={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
						>
							{fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
						</FullscreenButton>
					)}
				</Controls.Group>
			</Controls.Root>
		</>
	);
}
