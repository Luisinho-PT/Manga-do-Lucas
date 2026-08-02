export type MediaItem = {
  type: 'image' | 'video';
  src: string;
  caption: string;
};

export type SpeechBalloon = {
  text: string;
  sound: string;
};

type CharacterData = {
  media: MediaItem[];
  balloons: SpeechBalloon[];
};

export type CharacterSummary = { nome: string; imagem: string };
export type Character = CharacterSummary & CharacterData;

const CHARACTER_DATA: Record<string, CharacterData> = {
  lucas: {
    media: [
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177336/lucas_video_c7adrh.mp4', caption: 'Arco de treinamento do Lucas' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177356/lucas_video2_mrqgtu.mp4', caption: 'Dirigindo meu Bergentruck' },
    ],
    balloons: [],
  },
  luis: {
    media: [
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177335/luis_video_fygszy.mp4', caption: 'A lore do meu personagem level 1' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177325/luis_video2_ytbdx4.mp4', caption: 'Quando a esperança acaba, uma outra pode lhe iluminar' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177337/luis_video4_w6dyyx.mp4', caption: 'Calma Calabreso' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177365/luis_video3_hfuvky.mp4', caption: 'My Compass Curiosity' },
    ],
    balloons: [
      { text: 'That sword was supposed to pierce MY HEART! MINE!', sound: '/audio/luis/fala1.wav' },
      { text: '"How foolish... HOW FOOLISH"', sound: '/audio/luis/fala2.wav' },
      { text: 'HARPOONERS.. FIRE!!!', sound: '/audio/luis/fala3.wav' },
      { text: 'As long as I kill YOU! I WILL HAVE NOTHING MORE TO WISH FOR IN MY LIFE!', sound: '/audio/luis/fala4.wav' },
      { text: "Can't you see? They're all dead and it's all YOUR fault. You could've saved them and yet you did NOTHING.", sound: '/audio/luis/fala5.wav' },
    ],
  },
  licas: {
    media: [
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177322/licas_video_mh53ys.mp4', caption: 'PLIM PLIM PLON' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177332/licas_video2_littau.mp4', caption: 'Ele é o mais honrado' },
      { type: 'image', src: 'https://res.cloudinary.com/manga-do-lucas/image/upload/v1756177382/prova_oupyi0.png', caption: 'Que prova?' },
    ],
    balloons: [],
  },
  guido: {
    media: [
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177344/guido_video_o5sfev.mp4', caption: 'Alguém pare esse aura farmer' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177323/guido_video2_crzqoj.mp4', caption: 'Alguém pare esse aura farmer' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177327/guido_video3_pyhkjz.mp4', caption: 'Alguém pare esse aura farmer' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177324/guido_video4_hmfmhc.mp4', caption: 'Alguém pare esse aura farmer' },
    ],
    balloons: [],
  },
  ness: {
    media: [
      { type: 'image', src: 'https://res.cloudinary.com/manga-do-lucas/image/upload/v1756177381/ness_imagem_wll3hg.png', caption: 'This is Peak.' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177326/ness_video2_bwrb26.mp4', caption: 'Driving my Car after the Eclipse' },
      { type: 'video', src: 'https://res.cloudinary.com/manga-do-lucas/video/upload/v1756177347/ness_video_vcuvix.mp4', caption: 'É MÁFIA, É MÁFIA' },
    ],
    balloons: [],
  },
  karma: { media: [], balloons: [] },
  edward: { media: [], balloons: [] },
  berimbau: { media: [], balloons: [] },
  dot: { media: [], balloons: [] },
  exist: { media: [], balloons: [] },
  machiel: { media: [], balloons: [] },
  agug: { media: [], balloons: [] },
};

const CharacterService = {
  getCharacters(): CharacterSummary[] {
    return Object.keys(CHARACTER_DATA)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((nome) => ({ nome, imagem: `/img/${nome}/${nome}.png` }));
  },

  getCharacter(name: string): Character | null {
    const slug = name.trim().toLowerCase();
    const character = CHARACTER_DATA[slug];
    return character ? { nome: slug, imagem: `/img/${slug}/${slug}.png`, ...character } : null;
  },
};

export default CharacterService;
