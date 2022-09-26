import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { io, Socket } from 'socket.io-client';
import styles from 'styles/Home.module.css';

const W_RADIUS = 3;
const S_RADIUS = 2;

const WOLF_COLOR = '#FF0000';
const LAMB_COLOR = '#0000FF';

type Position = {
	x: number,
	y: number,
};

type Data = {
	wolfPosition: Position | null,
	sheepPositions: Position[],
	lastFrame: number,
	eatenLambs: number,
}

const initialData = {
	wolfPosition: null,
	sheepPositions: [],
	lastFrame: 0,
	targetIndex: -1,
	eatenLambs: 0,
};

const HomePage: NextPage = () => {
	const [pageLoaded, setPageLoaded] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef(null);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [simRunning, setSimRunning] = useState(false);

	let data: Data = initialData;

	useEffect(() => {
		setPageLoaded(true);
	}, []);

	/* eslint-disable react-hooks/exhaustive-deps */
	useEffect(() => {
		if (pageLoaded) {
			const soc = io('http://localhost:3100', {
				path: '/wolf-simulation',
			});
			soc.on('connect', () => {
				setSocket(soc);

				soc.on('next-simulation-frame', (res) => {
					data = {
						wolfPosition: res.wolf,
						sheepPositions: res.sheep,
						lastFrame: res.frame,
						eatenLambs: res.eatenLambs,
					};
					setSimRunning(!res.isLastFrame);
				});
			});

			soc.on('disconnect', () => {
				setSocket(null);
				data = initialData;
			});

			const canvas: any = canvasRef.current;
			canvas.width = 640;
			canvas.height = 640;
			const context: any = canvas.getContext('2d');
			let frameCount = 0;
			let animationFrameId: number;
			const dpi = window.devicePixelRatio;
			// const newRadius = radius * dpi;

			const styleHeight = +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2);
			const styleWidth = +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);
			canvas.setAttribute('height', styleHeight * dpi);
			canvas.setAttribute('width', styleWidth * dpi);

			const render = () => {
				frameCount += 1;
				draw(context);
				animationFrameId = window.requestAnimationFrame(render);
			};
			render();

			return () => {
				window.cancelAnimationFrame(animationFrameId);
			};
		}
		return () => {};
	}, [pageLoaded]);

	const handleStart = () => {
		if (socket) {
			setSimRunning(true);
			socket.emit('start-simulation', '');
		}
	};

	const draw = (ctx: any) => {
		const { sheepPositions, wolfPosition, eatenLambs } = data;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		const dpi = window.devicePixelRatio;
		const wolfRadius = W_RADIUS * dpi;
		const sheepRadius = S_RADIUS * dpi;

		if (sheepPositions.length) {
			ctx.fillStyle = LAMB_COLOR;
			for (let i = 0; i < sheepPositions.length; i += 1) {
				const { x, y } = sheepPositions[i];
				ctx.beginPath();
				ctx.arc(x * dpi,
					y * dpi,
					sheepRadius,
					0,
					Math.PI * 2,
					true);
				ctx.fill();
			}
		}
		if (wolfPosition) {
			ctx.fillStyle = WOLF_COLOR;
			ctx.beginPath();
			ctx.arc(wolfPosition.x * dpi,
				wolfPosition.y * dpi,
				(wolfRadius + eatenLambs * 0.5) * dpi,
				0,
				Math.PI * 2,
				true);
			ctx.fill();
		}
	};

	return (
		<div className={styles.root}>
			<div className={styles.canvasContainer} ref={rootRef}>
				<canvas ref={canvasRef} />
			</div>
			<button
				type='button'
				onClick={handleStart}
				disabled={!socket || simRunning}
			>
				Start
			</button>
		</div>
	);
};

export default HomePage;
