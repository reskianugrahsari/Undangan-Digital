# Cover Page Design - Floral Frame Reference

## New Cover Page Structure:

```tsx
<div className="relative w-full max-w-md h-screen">
  {/* Background with subtle pattern */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-pink-50"></div>
  
  {/* Decorative floral corners */}
  <div className="absolute top-8 left-8 text-6xl opacity-40">🌸</div>
  <div className="absolute top-8 right-8 text-6xl opacity-40">🌺</div>
  <div className="absolute bottom-32 left-8 text-5xl opacity-30">🌼</div>
  <div className="absolute bottom-32 right-8 text-5xl opacity-30">🌻</div>

  {/* Content */}
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
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <span className="text-6xl">💑</span>
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
      <h1 className="text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
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
      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
    >
      <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
      Buka Undangan
      <ChevronDown className="w-5 h-5 animate-bounce" />
    </motion.button>
  </div>
</div>
```

## Features:
1. **Circular Photo Frame** - 264x264px with white border
2. **Floral Decorations** - Flowers around the photo (🌸🌺💐🌹🌿)
3. **Elegant Name** - Great Vibes font
4. **Date Format** - FEB | 24 | 2024 style
5. **Guest Info** - Centered below date
6. **Gradient Background** - Blue to Pink
7. **Smooth Animations** - Scale, rotate, fade effects
