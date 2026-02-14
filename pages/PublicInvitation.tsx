import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { api } from '../services/mockApi';
import { Event, Guest, RSVPStatus, Wish } from '../types';
import {
  MapPin, Calendar, Heart, CheckCircle, XCircle, Send,
  Music, Volume2, VolumeX, Clock, Gift, Camera, BookOpen,
  ChevronDown, MessageCircle, Star, Instagram, Share2, Info, Sparkles, Cake, GraduationCap, PartyPopper
} from 'lucide-react';

const MUSIC_OPTIONS = {
  wedding: [
    { id: 'romantic', name: 'Romantic Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'classic', name: 'Classical Strings', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
  ],
  birthday: [
    { id: 'happy', name: 'Birthday Joy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'pop', name: 'Upbeat Party', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
  ],
  graduation: [
    { id: 'triumph', name: 'Triumphant March', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 'inspiring', name: 'New Beginnings', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
  ],
  party: [
    { id: 'dance', name: 'Dance Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 'chill', name: 'Lounge Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' }
  ]
};

const PetalEffect = ({ theme, type }: { theme: string, type: string }) => {
  const getParticle = (i: number) => {
    if (type === 'birthday') return i % 2 === 0 ? '🎈' : '✨';
    if (type === 'party') return i % 2 === 0 ? '🎉' : '✨';
    if (type === 'graduation') return i % 2 === 0 ? '🎓' : '✨';

    switch (theme) {
      case 'nature': return i % 2 === 0 ? '🍃' : '🌿';
      case 'luxury': return i % 2 === 0 ? '✨' : '💎';
      case 'vintage': return i % 2 === 0 ? '🍂' : '📜';
      case 'royal': return i % 2 === 0 ? '👑' : '✨';
      case 'minimalist': return i % 2 === 0 ? '⚪' : '⚫';
      case 'romantic': return i % 2 === 0 ? '❤' : '🌸';
      case 'ethereal': return i % 2 === 0 ? '✨' : '🌸';
      default: return i % 2 === 0 ? '🌸' : '✨';
    }
  };

  const getParticleColor = () => {
    switch (theme) {
      case 'luxury': return 'text-amber-200/40';
      case 'nature': return 'text-emerald-200/40';
      case 'royal': return 'text-purple-200/40';
      case 'minimalist': return 'text-gray-200/40';
      case 'vintage': return 'text-orange-200/40';
      case 'ethereal': return 'text-amber-100/30';
      default: return 'text-pink-200/40';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            x: ['0vw', `${(Math.random() - 0.5) * 20}vw`],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * -20,
            ease: "linear"
          }}
          className={`fixed pointer-events-none ${getParticleColor()}`}
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 10}px`
          }}
        >
          {getParticle(i)}
        </motion.div>
      ))}
    </div>
  );
};

export const PublicInvitation: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<{ event: Event; guest: Guest } | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpened, setIsOpened] = useState(false);

  // Music State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState({ id: 'none', name: 'Loading...', url: '' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Form State
  const [wishMessage, setWishMessage] = useState('');
  const [sendingWish, setSendingWish] = useState(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Scroll Progress
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (slug) loadInvitation(slug);
  }, [slug]);

  useEffect(() => {
    if (data?.event) {
      const type = data.event.event_type || 'wedding';
      const options = MUSIC_OPTIONS[type as keyof typeof MUSIC_OPTIONS];
      setCurrentMusic(options[0]);
    }
  }, [data]);

  useEffect(() => {
    if (data?.event.event_date) {
      const timer = setInterval(() => {
        // Combine date and time for accurate countdown
        const dateTimeString = data.event.event_time
          ? `${data.event.event_date}T${data.event.event_time}`
          : data.event.event_date;
        const target = new Date(dateTimeString).getTime();
        const now = new Date().getTime();
        const difference = target - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data]);

  const loadInvitation = async (uniqueSlug: string) => {
    try {
      const result = await api.guests.getBySlug(uniqueSlug);
      if (result) {
        setData(result);
        const wishData = await api.wishes.listByEvent(result.event.id);
        setWishes(wishData);
      } else {
        setError('Invitation not found.');
      }
    } catch (e) {
      setError('Error loading invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpened(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed', e));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeMusic = (music: any) => {
    setCurrentMusic(music);
    setIsPlaying(true);
  };

  const handleRSVP = async (status: RSVPStatus) => {
    if (!slug || !data) return;
    const prevStatus = data.guest.status_rsvp;
    setData({ ...data, guest: { ...data.guest, status_rsvp: status } });
    try {
      await api.guests.updateRSVP(slug, status);
    } catch (e) {
      setData({ ...data, guest: { ...data.guest, status_rsvp: prevStatus } });
      alert('Failed to update RSVP');
    }
  };

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !wishMessage.trim()) return;
    setSendingWish(true);
    try {
      await api.wishes.create(data.guest.id, wishMessage);
      setWishMessage('');
      const updatedWishes = await api.wishes.listByEvent(data.event.id);
      setWishes(updatedWishes);
    } finally {
      setSendingWish(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <Heart className="w-12 h-12 text-pink-500 fill-current" />
      </motion.div>
      <p className="mt-4 font-serif text-gray-400 uppercase tracking-[0.2em] text-xs">Loading Experience...</p>
    </div>
  );

  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-serif">{error}</div>;

  const { event, guest } = data;
  const eventType = event.event_type || 'wedding';

  const categoryContent = {
    wedding: {
      title: 'The Wedding Of',
      quote: '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri..."',
      quoteSource: 'Ar-Rum: 21',
      inviteText: 'Dear Beloved Guest,',
      mainIcon: <Heart className="w-20 h-20 mx-auto text-pink-400 fill-white/20" />,
      envelopeImg: 'https://images.unsplash.com/photo-1550005814-0ca3ca142f6c?q=80&w=2070&auto=format&fit=crop',
      heroImg: event.hero_image || 'https://images.unsplash.com/photo-1550005814-0ca3ca142f6c?q=80&w=2070&auto=format&fit=crop',
      countdownText: 'Menuju Hari Bahagia',
    },
    birthday: {
      title: 'Birthday Celebration',
      quote: '"Count your life by smiles, not tears. Count your age by friends, not years."',
      quoteSource: 'Joyful Moments',
      inviteText: 'Hey there, Rockstar!',
      mainIcon: <Cake className="w-20 h-20 mx-auto text-amber-400 fill-white/20" />,
      envelopeImg: 'https://images.unsplash.com/photo-1530103862676-fa8c9d34b3b7?q=80&w=2070&auto=format&fit=crop',
      heroImg: event.hero_image || 'https://images.unsplash.com/photo-1530103862676-fa8c9d34b3b7?q=80&w=2070&auto=format&fit=crop',
      countdownText: 'Counting Down to the Party',
    },
    graduation: {
      title: 'Graduation Day',
      quote: '"The beautiful thing about learning is that no one can take it away from you."',
      quoteSource: 'B.B. King',
      inviteText: 'Congratulations Graduate!',
      mainIcon: <GraduationCap className="w-20 h-20 mx-auto text-blue-400 fill-white/20" />,
      envelopeImg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
      heroImg: event.hero_image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
      countdownText: 'The Big Day Approaches',
    },
    party: {
      title: 'Party Time',
      quote: '"Life is a party, dress like it!"',
      quoteSource: 'Audrey Hepburn',
      inviteText: 'You are Invited!',
      mainIcon: <PartyPopper className="w-20 h-20 mx-auto text-purple-400 fill-white/20" />,
      envelopeImg: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
      heroImg: event.hero_image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
      countdownText: 'Party Countdown',
    }
  };

  const themes = {
    modern: { bg: 'bg-slate-50', accent: 'text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700', card: 'border-indigo-100', gradient: 'from-indigo-600 to-blue-500', font: 'font-sans', overlay: 'bg-indigo-900/60' },
    classic: { bg: 'bg-stone-50', accent: 'text-amber-700', btn: 'bg-amber-700 hover:bg-amber-800', card: 'border-amber-200', gradient: 'from-amber-700 to-yellow-600', font: 'font-serif', overlay: 'bg-stone-900/60' },
    romantic: { bg: 'bg-rose-50', accent: 'text-rose-500', btn: 'bg-rose-500 hover:bg-rose-600', card: 'border-rose-200', gradient: 'from-rose-500 to-pink-400', font: 'font-serif', overlay: 'bg-rose-900/60' },
    luxury: { bg: 'bg-[#0a0f1e]', accent: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600 text-slate-950', card: 'border-amber-900/40 bg-slate-900/60 text-slate-200', gradient: 'from-amber-600 to-amber-200', font: 'font-serif', overlay: 'bg-black/70' },
    nature: { bg: 'bg-emerald-50', accent: 'text-emerald-700', btn: 'bg-emerald-700 hover:bg-emerald-800', card: 'border-emerald-200', gradient: 'from-emerald-700 to-teal-500', font: 'font-sans', overlay: 'bg-emerald-950/60' },
    vintage: { bg: 'bg-[#f4ead5]', accent: 'text-[#8b4513]', btn: 'bg-[#8b4513] hover:bg-[#a0522d]', card: 'border-[#d2b48c] bg-[#faf3e0]', gradient: 'from-[#8b4513] to-[#d2b48c]', font: 'font-serif', overlay: 'bg-[#5c2e0a]/60' },
    minimalist: { bg: 'bg-white', accent: 'text-zinc-900', btn: 'bg-zinc-900 hover:bg-zinc-800', card: 'border-zinc-200', gradient: 'from-zinc-900 to-zinc-600', font: 'font-sans', overlay: 'bg-zinc-900/60' },
    royal: { bg: 'bg-purple-50', accent: 'text-purple-700', btn: 'bg-purple-700 hover:bg-purple-800', card: 'border-purple-200', gradient: 'from-purple-700 to-fuchsia-500', font: 'font-serif', overlay: 'bg-purple-950/60' },
    ethereal: { bg: 'ethereal-gradient', accent: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700', card: 'border-amber-100', gradient: 'from-amber-600 to-yellow-500', font: 'font-serif', overlay: 'bg-stone-100/40' }
  };

  const t = themes[event.theme_slug as keyof typeof themes] || themes.modern;
  const content = categoryContent[eventType as keyof typeof categoryContent];

  const galleryImages = (event.gallery_images && event.gallery_images.length > 0)
    ? event.gallery_images
    : [1, 2, 3, 4, 5, 6, 7, 8].map(i => `https://picsum.photos/seed/${i + 300}/800/800`);

  return (
    <div className={`min-h-screen ${t.bg} ${t.font} relative overflow-x-hidden selection:bg-amber-100`}>
      <audio ref={audioRef} src={currentMusic.url} loop autoPlay={false} />

      {/* Progress Bar */}
      <motion.div className={`fixed top-0 left-0 right-0 h-1 z-[101] bg-gradient-to-r ${t.gradient}`} style={{ scaleX: scrollYProgress, transformOrigin: '0%' }} />

      {/* Music Player */}
      {isOpened && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
          <AnimatePresence>
            {isPlaying && (
              <motion.div initial={{ opacity: 0, x: -20, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.8 }} className="glass-panel p-4 rounded-3xl shadow-2xl mb-2 min-w-[200px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Music className="w-3 h-3" /> Playlist Collection
                </p>
                <div className="flex flex-col gap-1.5">
                  {(MUSIC_OPTIONS[eventType as keyof typeof MUSIC_OPTIONS] || []).map((m: any) => (
                    <button key={m.id} onClick={() => changeMusic(m)} className={`text-[11px] text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${currentMusic.id === m.id ? 'bg-white shadow-md ' + t.accent : 'text-gray-500 hover:bg-white/50'}`}>
                      <span>{m.name}</span>
                      {currentMusic.id === m.id && <Sparkles className="w-3 h-3 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.1 }} onClick={toggleMusic} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl glass-panel border-2 ${t.card}`}>
            {isPlaying ? <Volume2 className={`w-6 h-6 ${t.accent}`} /> : <VolumeX className="w-6 h-6 text-gray-400" />}
          </motion.button>
        </div>
      )}

      {/* Opening Envelope */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div exit={{ opacity: 0, y: -1000 }} transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url("${content.envelopeImg}")` }} />
            <div className={`absolute inset-0 ${t.overlay} backdrop-blur-[2px]`}></div>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative text-center text-white px-8 max-w-2xl">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                {content.mainIcon}
              </motion.div>
              <span className="uppercase text-xs mb-4 block font-bold tracking-[0.3em] text-pink-200 mt-6">{content.title}</span>
              <h2 className="text-5xl font-bold mb-6 font-serif">{event.event_name}</h2>
              <p className="text-xl opacity-90 mb-2 italic">Special Invitation for:</p>
              <h3 className="text-3xl font-bold mb-12 gold-gradient">{guest.guest_name}</h3>
              <button onClick={handleOpen} className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all bg-white/10 border border-white/30 rounded-full hover:bg-white hover:text-black focus:outline-none backdrop-blur-md">
                <BookOpen className="w-5 h-5 mr-3" />
                <span className="uppercase tracking-widest text-sm">Buka Undangan</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PetalEffect theme={event.theme_slug} type={eventType} />

      <main className="max-w-4xl mx-auto relative z-10">

        {/* Section 1: Hero Visual */}
        {event.theme_slug === 'ethereal' ? (
          <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <img src="https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2070&auto=format&fit=crop" alt="Architecture" className="w-full h-full object-cover grayscale opacity-20" />
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} className="relative z-10 text-center px-6 max-w-lg">
              <div className="mb-12 relative flex flex-col items-center">
                <div className="w-full max-w-[300px] aspect-[3/4] border-[16px] border-[#ede0d4] rounded-t-full shadow-2xl overflow-hidden relative mb-8">
                  <img src={content.heroImg} className="w-full h-full object-cover" alt="Hero" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#ede0d4] to-transparent"></div>
                </div>
                <span className="text-xs uppercase tracking-[0.5em] text-gray-400 mb-4 font-bold">{content.title}</span>
                <h1 className="text-6xl md:text-7xl font-ethereal ethereal-text-gold leading-tight">
                  {event.event_name.split('&').map((n, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="block text-2xl font-serif text-gray-400 my-2">&</span>}
                      <span className="block">{n.trim()}</span>
                    </React.Fragment>
                  ))}
                </h1>
              </div>
              <p className="text-lg text-gray-500 italic font-serif leading-relaxed mt-12 bg-white/30 backdrop-blur-sm p-4 rounded-2xl">{content.quote.split('\n')[0]}</p>
              <div className="mt-20"><ChevronDown className="w-8 h-8 text-amber-500 mx-auto animate-bounce" /></div>
            </motion.div>
          </section>
        ) : (
          <section className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mb-12 relative">
              <div className="absolute -inset-10 border border-indigo-200/30 rounded-full animate-slow-spin"></div>
              <img src={content.heroImg} alt="Hero" className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-8 border-white shadow-2xl relative z-10 mx-auto" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h1 className="text-5xl md:text-8xl font-bold mb-6 font-serif leading-tight">
                {event.event_name.split('&').map((name, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className={`block text-3xl md:text-5xl my-4 italic ${t.accent}`}>&</span>}
                    <span className="block gold-gradient">{name.trim()}</span>
                  </React.Fragment>
                ))}
              </h1>
              <p className="text-lg text-gray-400 max-w-lg mx-auto mb-16 italic">{content.quote.split('\n')[0]}</p>
              <div className="flex flex-col items-center gap-2 opacity-50"><ChevronDown className={`w-6 h-6 ${t.accent} animate-bounce`} /></div>
            </motion.div>
          </section>
        )}

        {/* Section 2: Quotes */}
        <section className="py-32 px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <Info className={`w-10 h-10 mx-auto mb-8 ${t.accent} opacity-40`} />
            <p className={`text-xl md:text-2xl leading-relaxed text-gray-600 font-serif mb-8 italic ${event.theme_slug === 'ethereal' ? 'font-script' : ''}`}>{content.quote}</p>
            <p className={`font-bold uppercase tracking-widest text-xs ${t.accent}`}>— {content.quoteSource}</p>
          </motion.div>
        </section>

        {/* Section 3: Countdown */}
        <section className="py-24 px-6">
          <div className={`luxury-shadow rounded-[3rem] p-12 glass-panel text-center border-2 border-white/50 ${event.theme_slug === 'ethereal' ? 'ethereal-gradient' : ''}`}>
            <Clock className={`w-12 h-12 mx-auto mb-8 ${t.accent}`} />
            <hgroup><h3 className="text-3xl font-bold mb-12 text-gray-800 uppercase tracking-[0.2em] text-sm">{content.countdownText}</h3></hgroup>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {[{ label: 'Hari', value: timeLeft.days }, { label: 'Jam', value: timeLeft.hours }, { label: 'Menit', value: timeLeft.minutes }, { label: 'Detik', value: timeLeft.seconds }].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-5xl font-bold text-gray-900 mb-2 ${event.theme_slug === 'ethereal' ? 'ethereal-text-gold font-serif' : 'font-serif'}`}>{String(item.value).padStart(2, '0')}</span>
                  <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${t.accent}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Details */}
        <section className="py-32 px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className={`glass-panel rounded-[3rem] p-12 shadow-2xl relative ${event.theme_slug === 'ethereal' ? 'bg-[#fcf8f3]' : ''}`}>
              <div className={`w-16 h-16 rounded-3xl ${t.bg} flex items-center justify-center mb-10 shadow-lg`}><Calendar className={`w-8 h-8 ${t.accent}`} /></div>
              <h4 className="text-3xl font-bold mb-6 font-serif uppercase tracking-wider">Acara Utama</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4"><Clock className="w-5 h-5 text-gray-400 mt-1" /><div><p className="font-bold text-gray-800">Waktu</p><p className="text-gray-500">{event.event_time || '00:00'} WIB</p></div></div>
                <div className="flex items-start gap-4"><Calendar className="w-5 h-5 text-gray-400 mt-1" /><div><p className="font-bold text-gray-800">Tanggal</p><p className="text-gray-500">{new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div>
              </div>
            </div>
            <div className={`glass-panel rounded-[3rem] p-12 shadow-2xl relative ${event.theme_slug === 'ethereal' ? 'bg-[#fcf8f3]' : ''}`}>
              <div className={`w-16 h-16 rounded-3xl ${t.bg} flex items-center justify-center mb-10 shadow-lg`}><MapPin className={`w-8 h-8 ${t.accent}`} /></div>
              <h4 className="text-3xl font-bold mb-6 font-serif uppercase tracking-wider">Lokasi</h4>
              <div className="space-y-6">
                <div><p className="font-bold text-gray-800 block mb-1">Alamat</p><p className="text-gray-500 leading-relaxed capitalize">{event.location_name}</p></div>
                <a href={event.google_maps_url} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-bold shadow-xl transition-all ${t.btn}`}><MapPin className="w-5 h-5" /> Maps</a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Gallery - Masonry Layout */}
        <section className="py-32 px-6">
          <div className="text-center mb-20">
            <Camera className={`w-12 h-12 mx-auto mb-6 ${t.accent} opacity-30`} />
            <h3 className="text-4xl md:text-5xl font-bold mb-4 font-serif">Momen Kebahagiaan</h3>
            <p className="text-sm text-gray-400">{galleryImages.length} Foto</p>
          </div>
          <div className="columns-2 md:columns-3 gap-6 space-y-6">
            {galleryImages.map((img, i) => (
              <div key={i} className="break-inside-avoid glass-panel p-2 rounded-[2rem] shadow-xl border border-white">
                <img src={img} className={`w-full h-auto rounded-[1.5rem] object-cover ${i % 3 === 0 ? 'aspect-video' : 'aspect-square'}`} alt="Gallery" />
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: RSVP */}
        <section id="rsvp" className="py-32 px-6 text-center">
          <div className={`luxury-shadow rounded-[4rem] p-12 md:p-20 relative overflow-hidden bg-white border-2 ${t.card}`}>
            <CheckCircle className={`w-16 h-16 mx-auto mb-8 ${t.accent}`} />
            <h3 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Konfirmasi Kehadiran</h3>
            <p className="text-gray-500 max-w-lg mx-auto mb-16 text-lg">Konfirmasi kehadiran Anda sangat berarti bagi kami.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-xl mx-auto">
              <button
                onClick={() => handleRSVP(RSVPStatus.HADIR)}
                className={`flex-1 py-6 px-10 rounded-[2rem] border-2 font-bold transition-all flex items-center gap-4 ${guest.status_rsvp === RSVPStatus.HADIR ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:border-green-300'}`}
              >
                <CheckCircle className="w-6 h-6" /> Hadir
              </button>
              <button
                onClick={() => {
                  handleRSVP(RSVPStatus.TIDAK_HADIR);
                  // Optional: scroll to gift or wishes if they can't attend
                  const giftSection = document.getElementById('gift');
                  if (giftSection) giftSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex-1 py-6 px-10 rounded-[2rem] border-2 font-bold transition-all flex items-center gap-4 ${guest.status_rsvp === RSVPStatus.TIDAK_HADIR ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700 hover:border-rose-300'}`}
              >
                <XCircle className="w-6 h-6" /> Berhalangan
              </button>
            </div>
          </div>
        </section>

        {/* Section 7: Gift/Digital Envelope */}
        {(event.bri_account_number || event.shopeepay_number) && (
          <section id="gift" className="py-32 px-6 text-center">
            <div className={`luxury-shadow rounded-[4rem] p-12 md:p-20 relative overflow-hidden bg-white border-2 ${t.card}`}>
              <Gift className={`w-16 h-16 mx-auto mb-8 ${t.accent}`} />
              <h3 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Berikan Hadiah</h3>

              {guest.status_rsvp === RSVPStatus.TIDAK_HADIR && (
                <div className="bg-rose-50 text-rose-700 px-6 py-4 rounded-2xl mb-8 font-medium">
                  Meskipun Anda berhalangan hadir, Anda tetap dapat mengirimkan kado/hadiah melalui rekening di bawah ini. Terima kasih atas perhatiannya! 💝
                </div>
              )}

              <p className="text-gray-500 max-w-lg mx-auto mb-16 text-lg">
                Doa restu Anda adalah hadiah terindah bagi kami. Namun jika Anda ingin memberikan hadiah,
                kami menyediakan amplop digital berikut:
              </p>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* BRI Account */}
                {event.bri_account_number && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-8 text-left">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">BRI</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-blue-900">Bank BRI</h4>
                        <p className="text-sm text-blue-700">Transfer Bank</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-blue-700 font-medium uppercase tracking-wider">Nomor Rekening</label>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 bg-white rounded-xl px-4 py-3 font-mono text-lg font-bold text-blue-900">
                            {event.bri_account_number}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(event.bri_account_number!);
                              alert('✅ Nomor rekening BRI berhasil disalin!');
                            }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                          >
                            Salin
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-blue-700 font-medium uppercase tracking-wider">Atas Nama</label>
                        <div className="bg-white rounded-xl px-4 py-3 mt-2 font-semibold text-blue-900">
                          {event.bri_account_name}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ShopeePay Account */}
                {event.shopeepay_number && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-3xl p-8 text-left">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SP</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-orange-900">ShopeePay</h4>
                        <p className="text-sm text-orange-700">E-Wallet</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-orange-700 font-medium uppercase tracking-wider">Nomor Telepon</label>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 bg-white rounded-xl px-4 py-3 font-mono text-lg font-bold text-orange-900">
                            {event.shopeepay_number}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(event.shopeepay_number!);
                              alert('✅ Nomor ShopeePay berhasil disalin!');
                            }}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all"
                          >
                            Salin
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-orange-700 font-medium uppercase tracking-wider">Atas Nama</label>
                        <div className="bg-white rounded-xl px-4 py-3 mt-2 font-semibold text-orange-900">
                          {event.shopeepay_name}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-sm mt-10 italic">
                💝 Terima kasih atas perhatian dan kehadirannya
              </p>
            </div>
          </section>
        )}

        {/* Section 8: Wishes & Prayers */}
        <section id="wishes" className="py-32 px-6">
          <div className="text-center mb-20">
            <MessageCircle className={`w-12 h-12 mx-auto mb-6 ${t.accent} opacity-30`} />
            <h3 className="text-4xl md:text-5xl font-bold mb-4 font-serif">Ucapan & Doa</h3>
            <p className="text-lg text-gray-500">Berikan ucapan selamat dan doa restu Anda</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className={`glass-panel rounded-[3rem] p-8 md:p-12 shadow-2xl border-2 mb-12 ${t.card}`}>
              <form onSubmit={handleSendWish} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pesan Ucapan</label>
                  <textarea
                    required
                    rows={4}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Tuliskan ucapan dan doa restu Anda di sini..."
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-300 focus:ring-0 transition-all resize-none italic"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingWish || !wishMessage.trim()}
                  className={`w-full py-5 rounded-2xl text-white font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${t.btn} disabled:opacity-50`}
                >
                  <Send className="w-5 h-5" />
                  {sendingWish ? 'Mengirim...' : 'Kirim Ucapan'}
                </button>
              </form>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {wishes.length === 0 ? (
                <div className="text-center py-12 opacity-50 italic">Belum ada ucapan. Jadilah yang pertama!</div>
              ) : (
                wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-50"
                  >
                    <p className="text-gray-700 text-lg leading-relaxed mb-4 italic">"{wish.message}"</p>
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center font-bold ${t.accent}`}>
                          {wish.guest_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{wish.guest_name}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(wish.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        <footer className="py-20 text-center opacity-40 px-6 mt-20">
          <p className="font-serif text-2xl italic text-gray-400 mb-2">Thank You</p>
          <h4 className={`text-4xl font-bold font-serif ${event.theme_slug === 'ethereal' ? 'ethereal-text-gold' : 'gold-gradient'}`}>{event.event_name}</h4>
        </footer>
      </main>
    </div>
  );
};