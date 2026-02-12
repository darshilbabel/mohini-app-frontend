import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/plugins/record";


function useVoiceRecord() {
  const recordRef = useRef(null);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const ws = WaveSurfer.create({
      ...default_wave_surfer_config,
      container: "#hiddenContainer",
    });
    recordRef.current = ws.registerPlugin(RecordPlugin.create());
    recordRef.current.on("record-end", (blob) => {
      let reader = new FileReader();
      const recordedUrl = URL.createObjectURL(blob);
      reader.onloadend = () => {
        setRecordings((prev) => [
          ...prev,
          { result: reader.result, recordedUrl, id: Date.now() },
        ]);
      };

      reader.readAsDataURL(blob);
    });
    return () => {
      ws.destroy();
    };
  }, []);

  const isRecording = !!recordRef.current?.isRecording();

  return {
    recordRef,
    recordings,
    setRecordings,
    isRecording,
    HiddenRecorder: () => {
      return <div id="hiddenContainer" className="hidden" />;
    },
  };
}

export default useVoiceRecord;

export const default_wave_surfer_config = {
  waveColor: "rgba(149, 152, 152, 1)",
  progressColor: "rgba(100, 100, 100, 1)",
  barWidth: 5,
  barGap: 5,
  barRadius: 10,
  cursorWidth: 0,
};
