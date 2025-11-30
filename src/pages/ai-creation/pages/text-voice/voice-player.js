import { MdPause, MdPlayArrow } from "react-icons/md";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const useWavesurfer = (containerRef, options) => {
  const [wavesurfer, setWavesurfer] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [options, containerRef]);

  return wavesurfer;
};

const WaveSurferPlayer = (props) => {
  const containerRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const wavesurfer = useWavesurfer(containerRef, props);

  const onPlayClick = useCallback(() => {
    try {
      wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play();
    } catch (error) {
      console.error({error});
    }
  }, [wavesurfer]);

  useEffect(() => {
  try {
    if (!wavesurfer) return;

    setIsPlaying(false);

    const subscriptions = [
      wavesurfer.on("play", () => setIsPlaying(true)),
      wavesurfer.on("pause", () => setIsPlaying(false)),
    ];

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  } catch (error) {
    console.error({error});
  }
  }, [wavesurfer]);

  return (
    <>
      <div className="flex items-center justify-center rounded-full p-1 px-4">
        <button className="mx-2 text-4xl text-gray-500" onClick={onPlayClick}>
          {!isPlaying ? <MdPlayArrow /> : <MdPause />}
        </button>
        <div className="w-full">
          <div ref={containerRef} />
        </div>
      </div>
    </>
  );
};

export default memo(WaveSurferPlayer);
