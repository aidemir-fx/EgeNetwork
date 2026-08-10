import { Menu, useMediaState, usePlaybackRateOptions, useVideoQualityOptions } from '@vidstack/react';
import { Check, ChevronDown } from 'lucide-react';

export function SpeedMenu() {
	const options = usePlaybackRateOptions({ rates: SPEED_RATES });
	const currentLabel = options.find((option) => option.selected)?.label ?? '1×';

	if (options.disabled) {
		return <DisabledMenuButton label={currentLabel} title='Скорость недоступна' />;
	}

	return (
		<Menu.Root>
			<Menu.Button
				className='menuButton'
				aria-label='Скорость воспроизведения'
				title='Скорость воспроизведения'
			>
				<span className='menuButtonLabel'>{currentLabel}</span>
				<ChevronDown className='menuChevron' size={14} aria-hidden='true' />
			</Menu.Button>
			<Menu.Content className='playerMenu' placement='top end'>
				<div className='playerMenuTitle'>Скорость</div>
				<Menu.RadioGroup className='playerMenuList' value={options.selectedValue}>
					{options.map(({ label, value, select }) => (
						<Menu.Radio
							className='playerMenuOption'
							key={value}
							value={value}
							onSelect={select}
						>
							<Check className='playerMenuCheck' size={14} aria-hidden='true' />
							<span className='playerMenuOptionLabel'>{label}</span>
						</Menu.Radio>
					))}
				</Menu.RadioGroup>
			</Menu.Content>
		</Menu.Root>
	);
}

export function QualityMenu() {
	const canSetQuality = useMediaState('canSetQuality');
	const qualities = useMediaState('qualities');
	const options = useVideoQualityOptions({ auto: 'Авто', sort: 'descending' });
	const currentHeight = options.selectedQuality?.height;
	const currentLabel =
		options.selectedValue !== 'auto' && currentHeight
			? `${currentHeight}p`
			: currentHeight
				? `Авто ${currentHeight}p`
				: 'Авто';
	const hasMenu = canSetQuality && qualities.length > 1 && !options.disabled;

	if (!hasMenu) {
		return (
			<DisabledMenuButton
				label={currentLabel}
				title='Качество определяется автоматически'
			/>
		);
	}

	return (
		<Menu.Root>
			<Menu.Button
				className='menuButton'
				aria-label='Выбрать качество видео'
				title='Качество видео'
			>
				<span className='menuButtonLabel'>{currentLabel}</span>
				<ChevronDown className='menuChevron' size={14} aria-hidden='true' />
			</Menu.Button>
			<Menu.Content className='playerMenu' placement='top end'>
				<div className='playerMenuTitle'>Качество</div>
				<Menu.RadioGroup className='playerMenuList' value={options.selectedValue}>
					{options.map(({ label, value, bitrateText, select }) => (
						<Menu.Radio
							className='playerMenuOption'
							key={value}
							value={value}
							onSelect={select}
						>
							<Check className='playerMenuCheck' size={14} aria-hidden='true' />
							<span className='playerMenuOptionLabel'>{label}</span>
							{bitrateText && <span className='playerMenuHint'>{bitrateText}</span>}
						</Menu.Radio>
					))}
				</Menu.RadioGroup>
			</Menu.Content>
		</Menu.Root>
	);
}

interface DisabledMenuButtonProps {
	label: string;
	title: string;
}

function DisabledMenuButton({ label, title }: DisabledMenuButtonProps) {
	return (
		<button
			type='button'
			className='menuButton menuButtonDisabled'
			aria-label={title}
			title={title}
			disabled
		>
			<span className='menuButtonLabel'>{label}</span>
		</button>
	);
}

const SPEED_RATES = [
	{ label: '0.5×', rate: 0.5 },
	{ label: '0.75×', rate: 0.75 },
	{ label: '1×', rate: 1 },
	{ label: '1.25×', rate: 1.25 },
	{ label: '1.5×', rate: 1.5 },
	{ label: '1.75×', rate: 1.75 },
	{ label: '2×', rate: 2 },
];
