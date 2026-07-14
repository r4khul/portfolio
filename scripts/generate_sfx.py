import wave
import math
import struct
import random
import os

SAMPLE_RATE = 44100
SFX_DIR = "/home/rakhul/Projects/portfolio/site/public/sfx"

# Ensure output directory exists
os.makedirs(SFX_DIR, exist_ok=True)

# --- DSP Helpers ---

def lowpass(data, cutoff_freq):
    """Simple 1-pole low-pass filter."""
    dt = 1.0 / SAMPLE_RATE
    rc = 1.0 / (2 * math.pi * cutoff_freq)
    alpha = dt / (rc + dt)
    filtered = []
    prev = 0.0
    for x in data:
        y = alpha * x + (1.0 - alpha) * prev
        filtered.append(y)
        prev = y
    return filtered

def bandpass(data, low_cut, high_cut):
    """Bandpass filter implemented as the difference between two low-pass filters."""
    lp_high = lowpass(data, high_cut)
    lp_low = lowpass(data, low_cut)
    return [h - l for h, l in zip(lp_high, lp_low)]

def highpass(data, cutoff_freq):
    """Highpass filter implemented as the input minus the low-passed version."""
    lp_val = lowpass(data, cutoff_freq)
    return [x - y for x, y in zip(data, lp_val)]

def write_wav(filename, data):
    """Save 16-bit PCM mono WAV file."""
    filepath = os.path.join(SFX_DIR, filename)
    with wave.open(filepath, 'w') as wav_file:
        wav_file.setparams((1, 2, SAMPLE_RATE, len(data), 'NONE', 'not compressed'))
        for sample in data:
            # Clamp sample to 16-bit range [-32768, 32767]
            val = int(max(-32768, min(32767, sample)))
            wav_file.writeframes(struct.pack('<h', val))
    print(f"Generated: {filepath} ({len(data)} samples)")

# --- Sound Effect Synthesis ---

def make_time_skip(duration=1.5):
    """
    Ringing sound in the brain (time skip).
    Simulates a heavy thud impact followed by a lingering, high-frequency,
    detuned ringing to create a beating/dizziness effect.
    """
    num_samples = int(duration * SAMPLE_RATE)
    data = []
    
    # Impact/Thud parameters (low-freq decaying sine)
    thud_freq_start = 120.0
    thud_freq_end = 40.0
    thud_decay = 12.0
    
    # Metallic Ringing parameters (detuned to create beating/dissonance)
    ring_freq1 = 3200.0
    ring_freq2 = 3213.0  # 13Hz beating
    ring_freq3 = 4800.0  # Overtone
    ring_decay = 2.0     # Lingering decay
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        
        # Thud component
        thud_env = math.exp(-thud_decay * t)
        thud_freq = thud_freq_end + (thud_freq_start - thud_freq_end) * thud_env
        thud_val = math.sin(2 * math.pi * thud_freq * t) * thud_env * 0.45
        
        # Ringing component
        ring_env = math.exp(-ring_decay * t)
        ring1 = math.sin(2 * math.pi * ring_freq1 * t)
        ring2 = math.sin(2 * math.pi * ring_freq2 * t)
        ring3 = math.sin(2 * math.pi * ring_freq3 * t) * 0.25
        ring_val = (ring1 + ring2 + ring3) * ring_env * 0.28
        
        val = (thud_val + ring_val) * 32767
        data.append(val)
    return data

def make_footsteps(duration=1.0):
    """
    Stomps of a child running on the road.
    Generates 3 sequential foot stomps with a low thud impact
    and a bandpass-filtered noise scuff (shoe contact).
    """
    num_samples = int(duration * SAMPLE_RATE)
    # Generate white noise for scuff sounds
    noise = [random.uniform(-1, 1) for _ in range(num_samples)]
    scuff_noise = bandpass(noise, 150.0, 1000.0)
    
    # Normalize noise
    max_scuff = max(abs(x) for x in scuff_noise) if scuff_noise else 1
    scuff_noise = [x / max_scuff for x in scuff_noise]
    
    data = [0.0] * num_samples
    
    # 3 steps spaced out
    stomp_times = [0.15, 0.45, 0.75]
    for start_t in stomp_times:
        start_idx = int(start_t * SAMPLE_RATE)
        stomp_duration = int(0.20 * SAMPLE_RATE)
        for i in range(stomp_duration):
            idx = start_idx + i
            if idx >= num_samples:
                break
            t_stomp = i / SAMPLE_RATE
            
            # Low thud (70Hz sine decaying rapidly)
            thud_env = math.exp(-38.0 * t_stomp)
            thud = math.sin(2 * math.pi * 70.0 * t_stomp) * thud_env * 0.55
            
            # Scuff noise (pavement impact friction)
            scuff_env = math.exp(-28.0 * t_stomp)
            scuff = scuff_noise[idx] * scuff_env * 0.25
            
            data[idx] += (thud + scuff)
            
    # Normalize and scale to prevent clipping
    max_val = max(abs(x) for x in data) if data else 1
    if max_val > 0.95:
        data = [x / max_val * 0.95 * 32767 for x in data]
    else:
        data = [x * 32767 for x in data]
        
    return data

def make_door_open(duration=1.2):
    """
    Door opening.
    Simulates a metal latch click, followed by a squeaking hinge
    (frequency-modulated rusty sweep) and a low wood rumble.
    """
    num_samples = int(duration * SAMPLE_RATE)
    data = [0.0] * num_samples
    
    noise = [random.uniform(-1, 1) for _ in range(num_samples)]
    
    # 1. Metal click at t = 0.05s
    click_start = int(0.05 * SAMPLE_RATE)
    click_duration = int(0.04 * SAMPLE_RATE)
    for i in range(click_duration):
        idx = click_start + i
        t_click = i / SAMPLE_RATE
        click_env = math.exp(-180.0 * t_click)
        click_tone = math.sin(2 * math.pi * 1300.0 * t_click) * click_env * 0.35
        click_noise = noise[idx] * click_env * 0.2
        data[idx] += click_tone + click_noise
        
    # 2. Rusty hinge squeak (t = 0.1s to 0.9s)
    squeak_start = int(0.1 * SAMPLE_RATE)
    squeak_len = int(0.8 * SAMPLE_RATE)
    squeak_phase = 0.0
    for i in range(squeak_len):
        idx = squeak_start + i
        t_squeak = i / SAMPLE_RATE
        t_norm = i / squeak_len
        
        # Envelope: rise, sustain, decay
        if t_norm < 0.2:
            env = t_norm / 0.2
        elif t_norm > 0.7:
            env = (1.0 - t_norm) / 0.3
        else:
            env = 1.0
            
        # Add friction wobbles to the squeak amplitude
        env *= 0.14 * (1.0 + 0.3 * math.sin(2 * math.pi * 35.0 * t_squeak))
        
        # Squeak pitch starts around 680Hz, sweeps up and down, with rusty jitter
        base_freq = 680.0 + 150.0 * math.sin(math.pi * t_norm)
        jitter = 30.0 * math.sin(2 * math.pi * 26.0 * t_squeak)
        freq = base_freq + jitter
        
        # Integrate frequency to accumulate phase
        squeak_phase += 2 * math.pi * freq / SAMPLE_RATE
        data[idx] += math.sin(squeak_phase) * env
        
    # 3. Wood movement whoosh (lowpass-filtered noise)
    low_noise = lowpass(noise, 85.0)
    max_ln = max(abs(x) for x in low_noise) if low_noise else 1
    low_noise = [x / max_ln for x in low_noise]
    
    whoosh_start = int(0.1 * SAMPLE_RATE)
    whoosh_len = int(1.0 * SAMPLE_RATE)
    for i in range(whoosh_len):
        idx = whoosh_start + i
        t_norm = i / whoosh_len
        env = math.sin(math.pi * t_norm) * 0.38
        data[idx] += low_noise[idx] * env
        
    # Normalize
    max_val = max(abs(x) for x in data) if data else 1
    if max_val > 0.95:
        data = [x / max_val * 0.95 * 32767 for x in data]
    else:
        data = [x * 32767 for x in data]
        
    return data

def make_sky_ambient(duration=1.6):
    """
    Ambient Sky / Air sound.
    A continuous soft, low-pass and band-pass filtered white noise
    resembling gentle wind/air currents.
    """
    num_samples = int(duration * SAMPLE_RATE)
    noise = [random.uniform(-1, 1) for _ in range(num_samples)]
    
    lp = lowpass(noise, 220.0)
    bp = bandpass(noise, 180.0, 480.0)
    
    data = []
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        
        # Slow modulation of wind speeds (0.4Hz and 1.1Hz)
        mod1 = 0.5 + 0.3 * math.sin(2 * math.pi * 0.4 * t)
        mod2 = 0.35 + 0.2 * math.cos(2 * math.pi * 1.1 * t)
        
        val = lp[i] * mod1 + bp[i] * mod2
        
        # Smooth fade-in/fade-out
        if t < 0.2:
            fade = t / 0.2
        elif t > (duration - 0.2):
            fade = (duration - t) / 0.2
        else:
            fade = 1.0
            
        data.append(val * fade * 0.35 * 32767)
    return data

def make_glass_shatter(duration=1.2):
    """
    Glass Shattering.
    A strong initial crunch (heavy thud + highpassed noise)
    followed by a cascade of 14 distinct high-frequency ringing shards.
    """
    num_samples = int(duration * SAMPLE_RATE)
    data = [0.0] * num_samples
    
    noise = [random.uniform(-1, 1) for _ in range(num_samples)]
    
    # 1. Main Impact crunch (high-passed noise for the sharp crack)
    hp_noise = highpass(noise, 1600.0)
    max_hp = max(abs(x) for x in hp_noise) if hp_noise else 1
    hp_noise = [x / max_hp for x in hp_noise]
    
    impact_start = int(0.05 * SAMPLE_RATE)
    impact_len = int(0.35 * SAMPLE_RATE)
    for i in range(impact_len):
        idx = impact_start + i
        t_impact = i / SAMPLE_RATE
        
        # Deep low impact thud
        thud_env = math.exp(-65.0 * t_impact)
        thud = math.sin(2 * math.pi * 85.0 * t_impact) * thud_env * 0.45
        
        # Sharp high crunch
        crunch_env = math.exp(-40.0 * t_impact)
        crunch = hp_noise[idx] * crunch_env * 0.45
        
        data[idx] += thud + crunch
        
    # 2. Ringing Shards (tinks at high frequencies with varying delays and decays)
    shards = [
        # (delay_t, freq, decay_factor, amp)
        (0.05, 3900.0, 75.0, 0.26),
        (0.07, 5300.0, 115.0, 0.18),
        (0.09, 2200.0, 40.0, 0.24),
        (0.12, 6400.0, 140.0, 0.16),
        (0.15, 4200.0, 85.0, 0.19),
        (0.19, 3200.0, 50.0, 0.15),
        (0.24, 5700.0, 100.0, 0.13),
        (0.30, 2600.0, 45.0, 0.14),
        (0.38, 4800.0, 70.0, 0.11),
        (0.46, 6100.0, 125.0, 0.08),
        (0.56, 3300.0, 55.0, 0.09),
        (0.68, 5100.0, 85.0, 0.07),
        (0.80, 6600.0, 130.0, 0.06),
        (0.92, 4000.0, 65.0, 0.05),
    ]
    
    for delay_t, freq, decay_factor, amp in shards:
        start_idx = int(delay_t * SAMPLE_RATE)
        tink_len = int(0.25 * SAMPLE_RATE)
        for i in range(tink_len):
            idx = start_idx + i
            if idx >= num_samples:
                break
            t_tink = i / SAMPLE_RATE
            tink_env = math.exp(-decay_factor * t_tink)
            tink = math.sin(2 * math.pi * freq * t_tink) * tink_env * amp
            data[idx] += tink
            
    # Normalize
    max_val = max(abs(x) for x in data) if data else 1
    if max_val > 0.95:
        data = [x / max_val * 0.95 * 32767 for x in data]
    else:
        data = [x * 32767 for x in data]
        
    return data

# --- Run Generation ---

if __name__ == "__main__":
    print("Synthesizing premium cinematic sound effects...")
    write_wav("time_skip.wav", make_time_skip())
    write_wav("footsteps.wav", make_footsteps())
    write_wav("door_open.wav", make_door_open())
    write_wav("sky_ambient.wav", make_sky_ambient())
    write_wav("glass_shatter.wav", make_glass_shatter())
    print("All SFX successfully synthesized and written to public/sfx/!")
