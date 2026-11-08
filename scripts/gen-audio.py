"""Generate natural Korean audio with Supertonic-3 (Supertone, OpenRAIL-M).
pip install supertonic faster-whisper scipy  ·  needs ffmpeg
Usage: python3 scripts/gen-audio.py "새 단어" "다른 문장" ...   (adds to src/audio-map.json + public/audio/)
Each clip is transcribed with Whisper; the best of 3 takes is kept.
"""
import sys
import json,hashlib,os,subprocess,difflib,numpy as np
from scipy.signal import resample_poly
from supertonic import TTS
from faster_whisper import WhisperModel
u=sys.argv[1:]
tts=TTS(model='supertonic-3');st=tts.get_voice_style('F1')
asr=WhisperModel('small',device='cpu',compute_type='int8')
def norm(s):return ''.join(ch for ch in s if '가'<=ch<='힣')
def cer(a,b):return 1-difflib.SequenceMatcher(None,norm(a),norm(b)).ratio()
MAP=os.environ.get('AMAP','src/audio-map.json')
amap=json.load(open(MAP))
man={k:{'f':v} for k,v in amap.items()}
for t in u:
    h=hashlib.md5(t.encode()).hexdigest()[:10]
    if t in man:continue
    best=None
    for k in range(3 if len(norm(t))>1 else 1):
        wav,d=tts.synthesize(t.replace(' / ',', '),voice_style=st,lang='ko',total_steps=16,speed=0.88)
        a=np.asarray(wav).reshape(-1).astype(np.float32)
        if len(norm(t))>1:
            a16=resample_poly(a,160,441).astype(np.float32);segs,_=asr.transcribe(a16,language='ko',beam_size=3);hyp=''.join(s.text for s in segs);c=cer(t,hyp)
        else:c,hyp=0,''
        if best is None or c<best[0]:best=(c,a,hyp)
        if c<=float(os.environ.get('CER_OK','0')):break
    c,a,hyp=best
    # trim silence
    thr=0.01*np.max(np.abs(a));idx=np.where(np.abs(a)>thr)[0]
    if len(idx):a=a[max(0,idx[0]-int(.04*44100)):min(len(a),idx[-1]+int(.12*44100))]
    raw=f'/tmp/claude-0/{h}.f32';a.tofile(raw)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','f32le','-ar','44100','-ac','1','-i',raw,'-af','loudnorm=I=-16:TP=-1.5','-ar','24000','-ac','1','-b:a','48k',f'public/audio/{h}.mp3'],check=True)
    os.remove(raw)
    man[t]={'f':h,'cer':round(c,2),'hyp':hyp}
    amap[t]=h;json.dump(amap,open(MAP,'w'),ensure_ascii=False,indent=0)
    print(t,round(c,2),hyp,flush=True)
print('DONE',len(man))
