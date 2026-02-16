import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/mockApi';
import { Event, Guest, RSVPStatus, Wish } from '../types';
import { getTemplateByEventType, isSectionEnabled } from '../config/eventTemplates';
import { getQuoteByEventType } from '../config/quoteContent';
import { getThemeStyle } from '../config/themeStyles';
import {
  MapPin, Calendar, Heart, Send, Music, Volume2, VolumeX, Clock, Gift, Camera, BookOpen, ChevronDown, MessageCircle, Navigation, Share2, Copy, Check
} from 'lucide-react';

// Floating particles animation
const FloatingParticles = ({ eventType }: { eventType: string }) => {
  const getParticle = () => {
    switch (eventType) {
      case 'wedding': return ['🌸', '✨', '🍃', '🤍'];
      case 'birthday': return ['🎈', '✨', '🍰', '🎉'];
      case 'graduation': return ['🎓', '📜', '✨', '⭐'];
      case 'party': return ['🎉', '🥂', '✨', '🎵'];
      default: return ['🌸', '✨'];
    }
  };

  const particles = getParticle();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            x: ['0vw', `${(Math.random() - 0.5) * 20}vw`],
            rotate: [0, 360],
            opacity: [0, 0.6, 0.6, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * -20,
            ease: "linear"
          }}
          className="fixed"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 15 + 10}px`,
            color: eventType === 'party' ? 'rgba(255,255,255,0.3)' : 'rgba(255,192,203,0.4)'
          }}
        >
          {particles[i % particles.length]}
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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // RSVP State
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('pending');
  const [showRsvpSuccess, setShowRsvpSuccess] = useState(false);

  // Wish State
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [wishSubmitting, setWishSubmitting] = useState(false);

  // Share State
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (slug) {
      loadInvitation();
    }
  }, [slug]);

  // Countdown Timer
  useEffect(() => {
    if (!data?.event) return;

    const targetDate = new Date(`${data.event.event_date}T${data.event.event_time}`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const loadInvitation = async () => {
    try {
      const result = await api.invitations.getBySlug(slug!);
      setData(result);
      setRsvpStatus(result.guest.status_rsvp);
      const wishList = await api.wishes.listByEvent(result.event.id);
      setWishes(wishList);
    } catch (err: any) {
      setError(err.message || 'Undangan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvitation = () => {
    setIsOpened(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      setIsMusicPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleRsvp = async (status: RSVPStatus) => {
    if (!data) return;
    try {
      await api.guests.updateRSVP(slug!, status);
      setRsvpStatus(status);
      setShowRsvpSuccess(true);
      setTimeout(() => setShowRsvpSuccess(false), 3000);
    } catch (err) {
      alert('Gagal mengupdate RSVP');
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !wishName.trim() || !wishMessage.trim()) return;

    setWishSubmitting(true);
    try {
      await api.wishes.create(data.event.id, wishName.trim(), wishMessage.trim());
      setWishName('');
      setWishMessage('');
      const updatedWishes = await api.wishes.listByEvent(data.event.id);
      setWishes(updatedWishes);
    } catch (err) {
      alert('Gagal mengirim ucapan');
    } finally {
      setWishSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.event.event_name,
          text: `Anda diundang ke ${data?.event.event_name}`,
          url: url
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMaps = () => {
    if (data?.event.google_maps_url) {
      window.open(data.event.google_maps_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat undangan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50 p-4">
        <div className="text-center bg-white rounded-3xl p-8 shadow-xl max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Undangan Tidak Ditemukan</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const { event, guest } = data;

  // Get template configuration based on event type
  const template = getTemplateByEventType(event.event_type);
  const quoteContent = getQuoteByEventType(event.event_type);
  const themeStyle = getThemeStyle(event.event_type);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeStyle.bgGradient} ${themeStyle.fontMain} relative overflow-hidden`}>
      {/* Background Music */}
      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating Particles */}
      {isOpened && <FloatingParticles eventType={event.event_type} />}

      {/* Music Toggle Button */}
      {isOpened && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={toggleMusic}
          className={`fixed top-4 right-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center ${themeStyle.accentColor} hover:bg-white transition-all active:scale-95`}
        >
          {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>
      )}

      {/* Share Button */}
      {isOpened && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleShare}
          className={`fixed top-4 left-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center ${themeStyle.accentColor} hover:bg-white transition-all active:scale-95`}
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      )}

      <AnimatePresence>
        {!isOpened ? (
          // Cover Page
          <motion.div
            key="cover"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`relative w-full max-w-md h-screen ${themeStyle.bgGradient}`}>
              {/* Dynamic Decorative Elements */}
              <div className="absolute top-8 left-8 text-6xl opacity-40 animate-pulse">
                {themeStyle.iconSet === 'floral' ? '🌸' : themeStyle.iconSet === 'party' ? '🎈' : themeStyle.iconSet === 'academic' ? '🎓' : '🥂'}
              </div>
              <div className="absolute top-8 right-8 text-6xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>
                {themeStyle.iconSet === 'floral' ? '🌺' : themeStyle.iconSet === 'party' ? '🎉' : themeStyle.iconSet === 'academic' ? '📜' : '✨'}
              </div>
              <div className="absolute bottom-32 left-8 text-5xl opacity-30 animate-bounce" style={{ animationDuration: '3s' }}>
                {themeStyle.iconSet === 'floral' ? '🌼' : themeStyle.iconSet === 'party' ? '🍰' : themeStyle.iconSet === 'academic' ? '⭐' : '🎵'}
              </div>
              <div className="absolute bottom-32 right-8 text-5xl opacity-30 animate-bounce" style={{ animationDuration: '4s' }}>
                {themeStyle.iconSet === 'floral' ? '🌻' : themeStyle.iconSet === 'party' ? '🎁' : themeStyle.iconSet === 'academic' ? '🎓' : '🍸'}
              </div>

              {/* Content - Full height flex container */}
              <div className="relative h-full flex flex-col items-center justify-center px-8 py-12">
                {/* Circular Photo Frame with Floral Border */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="relative mb-8"
                >
                  {/* Floral decorations around photo */}
                  <div className="absolute -top-6 -left-6 text-5xl z-10">🌸</div>
                  <div className="absolute -top-6 -right-6 text-5xl z-10">🌺</div>
                  <div className="absolute -bottom-6 -left-6 text-5xl z-10">💐</div>
                  <div className="absolute -bottom-6 -right-6 text-5xl z-10">🌹</div>
                  <div className="absolute top-1/2 -left-8 -translate-y-1/2 text-4xl z-10">🌿</div>
                  <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-4xl z-10">🌿</div>

                  {/* Photo Circle */}
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                    {event.hero_image ? (
                      <img
                        src={event.hero_image}
                        alt="Couple"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${themeStyle.bgGradient} flex items-center justify-center`}>
                        <span className="text-6xl">
                          {themeStyle.iconSet === 'floral' ? '💑' : themeStyle.iconSet === 'party' ? '🥳' : themeStyle.iconSet === 'academic' ? '🎓' : '🥂'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Decorative arc on top */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-3xl">🌸</span>
                      <span className="text-2xl">✿</span>
                      <span className="text-3xl">🌸</span>
                    </div>
                  </div>

                  {/* Decorative arc on bottom */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-3xl">🌺</span>
                      <span className="text-2xl">❀</span>
                      <span className="text-3xl">🌺</span>
                    </div>
                  </div>
                </motion.div>

                {/* Couple Names */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mb-6 mt-8"
                >
                  {template.customContent.coverTitle && (
                    <p className={`text-xs ${themeStyle.textColor} uppercase tracking-widest mb-2 opacity-70`}>
                      {template.customContent.coverTitle}
                    </p>
                  )}
                  <h1 className={`text-5xl md:text-6xl font-bold ${themeStyle.textColor} mb-2 leading-tight ${themeStyle.fontHeading}`}>
                    {event.event_name}
                  </h1>
                </motion.div>

                {/* Date */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center gap-3 text-gray-600">
                    <span className="text-sm font-medium uppercase">
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold">|</span>
                    <span className="text-3xl font-bold">
                      {new Date(event.event_date).getDate()}
                    </span>
                    <span className="text-2xl font-bold">|</span>
                    <span className="text-sm font-medium">
                      {new Date(event.event_date).getFullYear()}
                    </span>
                  </div>
                </motion.div>

                {/* Guest Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center mb-8"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Kepada Yth.</p>
                  <p className="text-xs text-gray-500 mb-2">Bapak/Ibu/Saudara/i</p>
                  <p className="text-xl font-bold text-gray-900">{guest.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Di Tempat</p>
                </motion.div>

                {/* Open Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenInvitation}
                  className={`px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 group ${themeStyle.buttonClass}`}
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Buka Undangan
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Main Invitation Content
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10"
          >
            <div className="max-w-2xl mx-auto">
              {/* Hero Section with Integrated Floral Design */}
              <section className="relative min-h-screen flex items-center justify-center py-12">
                {event.hero_image ? (
                  <div className="absolute inset-0">
                    <img src={event.hero_image} alt="Hero" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 ${event.event_type === 'party' ? 'bg-gradient-to-b from-black/80 via-black/50 to-transparent' : 'bg-gradient-to-b from-white/90 via-white/60 to-transparent'}`}></div>
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${themeStyle.bgGradient} opacity-20`}></div>
                )}

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative text-center px-6 z-10 max-w-2xl mx-auto"
                >
                  {/* Greeting - Conditional based on event type */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                  >
                    {event.event_type === 'wedding' ? (
                      <>
                        <p className={`text-2xl ${themeStyle.fontMain} ${themeStyle.textColor} mb-2`}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                        <p className={`text-xs ${themeStyle.textColor} italic opacity-80`}>Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                      </>
                    ) : (
                      <p className={`text-2xl ${themeStyle.fontHeading} ${themeStyle.textColor} mb-4`}>{template.customContent.heroGreeting}</p>
                    )}
                  </motion.div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -left-4 text-5xl opacity-40 animate-pulse">
                    {themeStyle.iconSet === 'floral' ? '🌸' : themeStyle.iconSet === 'party' ? '✨' : themeStyle.iconSet === 'academic' ? '🎓' : '🥂'}
                  </div>
                  <div className="absolute -top-4 -right-4 text-5xl opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}>
                    {themeStyle.iconSet === 'floral' ? '🌸' : themeStyle.iconSet === 'party' ? '✨' : themeStyle.iconSet === 'academic' ? '📜' : '🥂'}
                  </div>

                  {/* Divider */}
                  <div className={`flex items-center justify-center mb-6 opacity-60`}>
                    <div className={`h-px bg-current flex-1 max-w-[100px] ${themeStyle.textColor}`}></div>
                    <span className={`px-3 ${themeStyle.accentColor}`}>
                      {themeStyle.iconSet === 'floral' ? '✿' : '✦'}
                    </span>
                    <div className={`h-px bg-current flex-1 max-w-[100px] ${themeStyle.textColor}`}></div>
                  </div>

                  {/* Intro Text - Conditional */}
                  {event.event_type === 'wedding' ? (
                    <p className={`text-sm ${themeStyle.textColor} mb-6 leading-relaxed opacity-90`}>
                      Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami
                    </p>
                  ) : (
                    <p className={`text-sm ${themeStyle.textColor} mb-6 leading-relaxed opacity-90`}>
                      Kami mengundang Anda untuk merayakan momen spesial ini bersama kami
                    </p>
                  )}

                  <p className={`text-sm ${themeStyle.textColor} mb-2 uppercase tracking-widest opacity-70`}>
                    {event.event_type === 'birthday' ? 'Birthday Celebration of' :
                      event.event_type === 'graduation' ? 'Graduation Ceremony of' :
                        event.event_type === 'party' ? 'Party of' : 'The Wedding of'}
                  </p>

                  {/* Couple/Person Names */}
                  <h1 className={`text-5xl md:text-6xl font-bold ${themeStyle.accentColor} mb-8 leading-tight ${themeStyle.fontHeading}`}>
                    {event.event_name}
                  </h1>

                  <div className="flex items-center justify-center gap-3 text-gray-700 mb-6">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  {/* Bottom Floral */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl opacity-40">🌺</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                  <ChevronDown className="w-8 h-8 text-gray-600 animate-bounce" />
                </motion.div>
              </section>

              {/* Quote/Ayat Section - Conditional based on event type */}
              {isSectionEnabled(template, 'quote') && (
                <section className={`px-4 py-16 bg-gradient-to-br ${themeStyle.bgGradient} relative overflow-hidden`}>
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto relative z-10"
                  >
                    {/* Decorative Top Quote Mark */}
                    <div className="text-center mb-6">
                      <span className="text-6xl text-purple-300 font-serif">"</span>
                    </div>

                    {/* Quote Card */}
                    <div className={`${themeStyle.cardClass} p-8`}>
                      {/* Icon */}
                      <div className="text-center mb-4">
                        <span className="text-5xl">{quoteContent.icon}</span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-center text-2xl font-bold ${themeStyle.textColor} mb-4`}>
                        {quoteContent.title}
                      </h3>

                      {/* Quote Text (Arabic for wedding, English for others) */}
                      <p className={`text-center ${event.event_type === 'wedding' ? 'text-2xl font-serif' : 'text-xl'} ${themeStyle.textColor} mb-4 leading-relaxed`} dir={event.event_type === 'wedding' ? 'rtl' : 'ltr'}>
                        {quoteContent.quote}
                      </p>

                      {/* Divider */}
                      <div className="flex items-center justify-center my-6 opacity-50">
                        <div className={`h-px bg-gradient-to-r from-transparent via-current to-transparent flex-1 ${themeStyle.textColor}`}></div>
                        <span className={`px-4 ${themeStyle.accentColor}`}>
                          {themeStyle.iconSet === 'floral' ? '❀' : '✦'}
                        </span>
                        <div className={`h-px bg-gradient-to-r from-transparent via-current to-transparent flex-1 ${themeStyle.textColor}`}></div>
                      </div>

                      {/* Translation (if exists) */}
                      {quoteContent.translation && (
                        <p className={`text-center ${themeStyle.textColor} leading-relaxed mb-4 italic opacity-80`}>
                          {quoteContent.translation}
                        </p>
                      )}

                      {/* Source (if exists) */}
                      {quoteContent.source && (
                        <p className={`text-center text-sm font-bold ${themeStyle.accentColor}`}>
                          {quoteContent.source}
                        </p>
                      )}

                      {/* Decorative Bottom Elements */}
                      <div className="flex items-center justify-center gap-2 mt-6 opacity-60">
                        <span className="">
                          {themeStyle.iconSet === 'floral' ? '✿' : themeStyle.iconSet === 'party' ? '✨' : themeStyle.iconSet === 'academic' ? '🎓' : '🥂'}
                        </span>
                        <span className="">
                          {themeStyle.iconSet === 'floral' ? '❀' : themeStyle.iconSet === 'party' ? '🎈' : themeStyle.iconSet === 'academic' ? '📜' : '🎵'}
                        </span>
                        <span className="">
                          {themeStyle.iconSet === 'floral' ? '✿' : themeStyle.iconSet === 'party' ? '✨' : themeStyle.iconSet === 'academic' ? '🎓' : '🥂'}
                        </span>
                      </div>
                    </div>

                    {/* Decorative Bottom Quote Mark */}
                    <div className="text-center mt-6">
                      <span className="text-6xl text-purple-300 font-serif">"</span>
                    </div>
                  </motion.div>
                </section>
              )}

              {/* Bride & Groom Profile Section - Conditional based on event type */}
              {isSectionEnabled(template, 'bride-groom') && (
                <section className={`px-4 py-16 bg-gradient-to-br ${themeStyle.bgGradient}`}>
                  <div className="max-w-4xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-12"
                    >
                      <h2 className={`text-3xl font-bold ${themeStyle.accentColor} mb-2 ${themeStyle.fontHeading}`}>
                        Mempelai
                      </h2>
                      <p className={`text-sm ${themeStyle.textColor} opacity-80`}>Dua jiwa yang bersatu dalam cinta</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Bride Profile */}
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                      >
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-4 right-4 text-4xl opacity-20">🌸</div>
                          <div className="absolute bottom-4 left-4 text-4xl opacity-20">💐</div>

                          {/* Photo */}
                          <div className="relative mb-6">
                            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
                              {event.hero_image ? (
                                <img
                                  src={event.hero_image}
                                  alt="Bride"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center">
                                  <span className="text-6xl">👰</span>
                                </div>
                              )}
                            </div>
                            {/* Decorative ring around photo */}
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-2xl">🌹</span>
                            </div>
                          </div>

                          {/* Name */}
                          <div className="text-center mb-4">
                            <h3 className="text-3xl font-bold text-pink-700 mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
                              {event.event_name.split('&')[1]?.trim() || '[Nama Mempelai Wanita]'}
                            </h3>
                            <p className="text-sm text-gray-600 italic">Putri dari:</p>
                          </div>

                          {/* Parents */}
                          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 mb-4">
                            <div className="text-center space-y-1">
                              <p className="text-sm font-bold text-gray-800">Bapak [Nama Ayah Mempelai Wanita]</p>
                              <p className="text-xs text-gray-600">&</p>
                              <p className="text-sm font-bold text-gray-800">Ibu [Nama Ibu Mempelai Wanita]</p>
                            </div>
                          </div>

                          {/* Social Media / Instagram */}
                          <div className="text-center">
                            <a
                              href="https://instagram.com/username"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                              @username_bride
                            </a>
                          </div>
                        </div>
                      </motion.div>

                      {/* Groom Profile */}
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                      >
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-4 right-4 text-4xl opacity-20">🎩</div>
                          <div className="absolute bottom-4 left-4 text-4xl opacity-20">👔</div>

                          {/* Photo */}
                          <div className="relative mb-6">
                            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                              {event.hero_image ? (
                                <img
                                  src={event.hero_image}
                                  alt="Groom"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                                  <span className="text-6xl">👰</span>
                                </div>
                              )}
                            </div>
                            {/* Decorative ring around photo */}
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-2xl">💍</span>
                            </div>
                          </div>

                          {/* Name */}
                          <div className="text-center mb-4">
                            <h3 className="text-3xl font-bold text-blue-700 mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
                              {event.event_name.split('&')[0]?.trim() || '[Nama Mempelai Pria]'}
                            </h3>
                            <p className="text-sm text-gray-600 italic">Putra dari:</p>
                          </div>

                          {/* Parents */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4">
                            <div className="text-center space-y-1">
                              <p className="text-sm font-bold text-gray-800">Bapak [Nama Ayah Mempelai Pria]</p>
                              <p className="text-xs text-gray-600">&</p>
                              <p className="text-sm font-bold text-gray-800">Ibu [Nama Ibu Mempelai Pria]</p>
                            </div>
                          </div>

                          {/* Social Media / Instagram */}
                          <div className="text-center">
                            <a
                              href="https://instagram.com/username"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                              @username_groom
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Decorative Divider */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="mt-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent flex-1 max-w-[100px]"></div>
                        <span className="text-4xl">💕</span>
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent flex-1 max-w-[100px]"></div>
                      </div>
                    </motion.div>
                  </div>
                </section>
              )}

              {/* Love Story Section - Conditional based on event type */}
              {isSectionEnabled(template, 'love-story') && (
                <section className={`px-4 py-16 bg-gradient-to-br ${themeStyle.bgGradient} relative overflow-hidden`}>
                  {/* Decorative Background */}
                  <div className="absolute top-10 right-10 text-8xl opacity-10">💕</div>
                  <div className="absolute bottom-10 left-10 text-8xl opacity-10">💑</div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto relative z-10"
                  >
                    {/* Header */}
                    <div className="text-center mb-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4"
                      >
                        <div className={`w-16 h-16 bg-gradient-to-br ${themeStyle.bgGradient} rounded-full flex items-center justify-center mx-auto shadow-lg border border-white`}>
                          <span className="text-3xl">💝</span>
                        </div>
                      </motion.div>
                      <h2 className={`text-4xl font-bold ${themeStyle.accentColor} mb-3 ${themeStyle.fontHeading}`}>
                        Cerita Cinta Kami
                      </h2>
                      <p className={`text-sm ${themeStyle.textColor} italic opacity-80`}>Perjalanan indah menuju pelaminan</p>
                    </div>

                    {/* Timeline Stories */}
                    <div className="space-y-8">
                      {/* Story 1 - Pertemuan Pertama */}
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                      >
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-xl">🌟</span>
                            </div>
                            <div className="w-1 h-full bg-gradient-to-b from-pink-300 to-transparent mt-2"></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
                            <h3 className="text-xl font-bold text-pink-700 mb-2">Pertemuan Pertama</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Takdir mempertemukan kami di <strong>[tempat pertemuan, misal: kampus/kantor/acara]</strong>.
                              Saat pertama kali bertemu, kami tidak pernah menyangka bahwa pertemuan sederhana itu
                              akan menjadi awal dari cerita cinta yang indah. Senyuman pertama, sapaan hangat,
                              dan percakapan ringan menjadi kenangan yang tak terlupakan.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Story 2 - Perjalanan Bersama */}
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                      >
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-xl">🚀</span>
                            </div>
                            <div className="w-1 h-full bg-gradient-to-b from-pink-300 to-transparent mt-2"></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
                            <h3 className="text-xl font-bold text-pink-700 mb-2">Perjalanan Bersama</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Setiap hari adalah petualangan baru bersama. Kami melewati suka dan duka,
                              saling menguatkan dalam setiap tantangan: <strong>[sebutkan tantangan atau momen berkesan]</strong>.
                              Waktu mengajarkan kami arti kesabaran, pengertian, dan kepercayaan.
                              Hingga kami sadar, kami tidak bisa membayangkan masa depan tanpa satu sama lain.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Story 3 - Menuju Pelaminan */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="relative"
                      >
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-xl">💍</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
                            <h3 className="text-xl font-bold text-pink-700 mb-2">Menuju Pelaminan</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Dengan restu orang tua dan keyakinan hati, kami memutuskan untuk mengikat janji suci.
                              Hari ini, kami melangkah lembaran baru, menyatukan impian kami dalam ikatan pernikahan.
                              Terima kasih telah menjadi bagian dari hari bahagia kami.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Closing Quote */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-12 bg-pink-100/50 p-6 rounded-3xl"
                      >
                        <p className="text-lg font-serif italic text-gray-800 leading-relaxed">
                          "Cinta sejati bukan tentang menemukan orang yang sempurna,
                          tetapi tentang melihat kesempurnaan dalam ketidaksempurnaan bersama."
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <span className="text-2xl">💕</span>
                          <span className="text-2xl">✨</span>
                          <span className="text-2xl">💕</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </section>
              )}


              {/* Event Details & Countdown - The Core (Position 6) */}
              <section className="px-4 py-12">
                <div className={`${themeStyle.cardClass} p-6`}>
                  {/* Countdown Timer - Moved here */}
                  <div className={`text-center mb-8 pb-8 border-b border-gray-200/50`}>
                    <Clock className={`w-8 h-8 ${themeStyle.accentColor} mx-auto mb-2`} />
                    <h2 className={`text-2xl font-bold ${themeStyle.textColor} ${themeStyle.fontMain}`}>
                      {template.customContent.countdownLabel || 'Menghitung Hari'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 mb-6">
                      {event.event_type === 'wedding'
                        ? 'Waktu terus berjalan menuju hari bahagia kami'
                        : 'Counting down the days to the special moment'}
                    </p>

                    <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                      {[
                        { label: 'Hari', value: timeLeft.days },
                        { label: 'Jam', value: timeLeft.hours },
                        { label: 'Menit', value: timeLeft.minutes },
                        { label: 'Detik', value: timeLeft.seconds }
                      ].map((item, i) => (
                        <div key={i} className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-2xl p-4 border border-pink-100">
                          <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wider">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="text-center mb-6">
                    <Calendar className={`w-8 h-8 ${themeStyle.accentColor} mx-auto mb-2`} />
                    <h2 className={`text-2xl font-bold ${themeStyle.textColor} ${themeStyle.fontMain}`}>
                      {template.customContent.eventDetailsTitle || 'Waktu & Tempat Acara'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Schedule - Conditional Layout */}
                    {event.event_type === 'wedding' ? (
                      /* Wedding Schedule (Akad & Resepsi) */
                      <div className="grid grid-cols-2 gap-3">
                        {/* Akad */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                          <div className="text-center">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Akad Nikah</p>
                            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">{event.event_time}</p>
                            <p className="text-xs text-gray-600 mt-1">WIB</p>
                          </div>
                        </div>

                        {/* Resepsi */}
                        <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200">
                          <div className="text-center">
                            <p className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-2">Resepsi</p>
                            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {(() => {
                                const [hours, minutes] = event.event_time.split(':');
                                const resepsiHours = (parseInt(hours) + 2) % 24;
                                return `${resepsiHours.toString().padStart(2, '0')}:${minutes}`;
                              })()}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">WIB</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Other Events Schedule (Single Block) */
                      <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200">
                        <div className="text-center">
                          <p className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-2">
                            {template.customContent.eventDetailsTitle || 'Acara Utama'}
                          </p>
                          <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{event.event_time}</p>
                          <p className="text-sm text-gray-600">Waktu Indonesia Barat (WIB)</p>
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tanggal</p>
                        <p className="font-bold text-gray-900">{new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-violet-50 rounded-2xl">
                      <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lokasi</p>
                        <p className="font-bold text-gray-900">{event.location_name}</p>
                        {event.google_maps_url && (
                          <button
                            onClick={openGoogleMaps}
                            className="mt-2 inline-flex items-center gap-2 text-sm text-violet-600 font-bold hover:text-violet-700"
                          >
                            <Navigation className="w-4 h-4" />
                            Buka Peta
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Gallery */}
              {event.gallery_images && event.gallery_images.length > 0 && (
                <section className="px-4 py-12 bg-white/50 backdrop-blur-sm">
                  <div className="text-center mb-6">
                    <Camera className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Galeri Momen Kami</h2>
                    <p className="text-sm text-gray-600 mt-2">Setiap momen adalah kenangan indah yang kami ciptakan bersama</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {event.gallery_images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="aspect-square rounded-2xl overflow-hidden shadow-lg"
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* RSVP Section */}
              <section className="px-4 py-12">
                <div className={`${themeStyle.cardClass} p-6`}>
                  <div className="text-center mb-6">
                    <Heart className={`w-8 h-8 ${themeStyle.accentColor} mx-auto mb-2`} />
                    <h2 className={`text-2xl font-bold ${themeStyle.textColor} ${themeStyle.fontMain}`}>Konfirmasi Kehadiran</h2>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {event.event_type === 'wedding'
                        ? 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.'
                        : 'Kami sangat mengharapkan kehadiran Anda untuk memeriahkan acara ini.'}
                    </p>
                    <p className="text-sm text-gray-700 mt-3 font-medium">Mohon konfirmasi kehadiran Anda:</p>
                  </div>

                  {showRsvpSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-center"
                    >
                      <p className="text-green-700 font-medium">✓ Terima kasih atas konfirmasi Anda! Kami sangat menantikan kehadiran Anda.</p>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRsvp(RSVPStatus.HADIR)}
                      className={`py-4 rounded-2xl font-bold transition-all ${rsvpStatus === RSVPStatus.HADIR
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      ✓ Hadir
                    </button>
                    <button
                      onClick={() => handleRsvp(RSVPStatus.TIDAK_HADIR)}
                      className={`py-4 rounded-2xl font-bold transition-all ${rsvpStatus === RSVPStatus.TIDAK_HADIR
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      ✗ Tidak Hadir
                    </button>
                  </div>
                </div>
              </section>

              {/* Wishes / Guest Book */}
              <section className={`px-4 py-12 bg-white/50 backdrop-blur-sm`}>
                <div className={`${themeStyle.cardClass} p-6`}>
                  <div className="text-center mb-6">
                    <BookOpen className={`w-8 h-8 ${themeStyle.accentColor} mx-auto mb-2`} />
                    <h2 className={`text-2xl font-bold ${themeStyle.textColor} ${themeStyle.fontMain}`}>Ucapan & Doa</h2>
                    <p className="text-sm text-gray-600 mt-2">Berikan ucapan & doa restu untuk kami</p>
                  </div>

                  {/* Wish Form */}
                  <form onSubmit={handleSubmitWish} className="mb-6 space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-2xl outline-none transition-all"
                      required
                    />
                    <textarea
                      placeholder="Tulis ucapan dan doa untuk kami..."
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-2xl outline-none resize-none transition-all"
                      required
                    />
                    <button
                      type="submit"
                      disabled={wishSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-pink-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {wishSubmitting ? 'Mengirim...' : 'Kirim Ucapan'}
                    </button>
                  </form>

                  {/* Wishes List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {wishes.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada ucapan</p>
                    ) : (
                      wishes.map((wish) => (
                        <motion.div
                          key={wish.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-gradient-to-r from-pink-50 to-violet-50 rounded-2xl border border-pink-100"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {wish.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 mb-1">{wish.name}</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{wish.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* Gift Section */}
              <section className="px-4 py-12">
                <div className={`${themeStyle.cardClass} p-6`}>
                  <div className="text-center mb-6">
                    <Gift className={`w-8 h-8 ${themeStyle.accentColor} mx-auto mb-2`} />
                    <h2 className={`text-2xl font-bold ${themeStyle.textColor} ${themeStyle.fontMain}`}>
                      {template.customContent.giftSectionTitle || 'Amplop Digital'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {event.event_type === 'wedding'
                        ? 'Doa Restu Anda merupakan karunia yang sangat berarti bagi kami.'
                        : 'Kehadiran Anda adalah kado terindah bagi kami.'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">Namun jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless melalui:</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">BANK BRI</p>
                    <p className="font-mono font-bold text-lg text-gray-900 mb-1">1234567890</p>
                    <p className="text-sm text-gray-600">a.n. {event.event_name.split('&')[0]?.trim() || event.event_name.split(' ')[0]}</p>
                    <button
                      onClick={copyToClipboard}
                      className="mt-4 w-full py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Tersalin!' : 'Salin Nomor'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="px-4 py-12 text-center">
                <div className="mb-6">
                  <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-600 italic leading-relaxed">
                    {event.event_type === 'wedding'
                      ? 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.'
                      : 'Terima kasih atas kehadiran dan partisipasi Anda dalam acara ini.'}
                  </p>
                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {event.event_type === 'wedding'
                      ? 'Atas kehadiran serta doa restu dari Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.'
                      : 'Kami sangat menghargai waktu yang Anda luangkan untuk bersama kami.'}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {event.event_type === 'wedding' && (
                    <p className="text-sm text-gray-700 mb-2 italic">Mohon do'a restu agar pernikahan kami menjadi keluarga yang sakinah, mawaddah, warahmah.</p>
                  )}
                  <p className="font-serif font-bold text-gray-900 mb-1 mt-4">{event.event_name}</p>
                  <p className="text-xs text-gray-500">Beserta Keluarga</p>
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bagikan Undangan</h3>
              <p className="text-sm text-gray-600 mb-4">Bagikan undangan ini kepada keluarga dan teman</p>
              <div className="space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                  <span className="font-medium text-gray-900">{copied ? 'Link Tersalin!' : 'Salin Link'}</span>
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Bagikan via WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};