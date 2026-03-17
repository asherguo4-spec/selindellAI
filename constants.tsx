
import { CreationStyle } from './types';

export const CREATION_STYLES: CreationStyle[] = [
  {
    id: 'cute',
    name: '萌趣Q版',
    description: 'Q萌趣版',
    promptSuffix: 'in a cute chibi toy style, high quality vinyl toy, soft lighting, vibrant colors, 3d render, pop mart style',
    imageUrl: '/style_q.jpg'
  },
  {
    id: 'cyber',
    name: '赛博朋克',
    description: '赛博朋克',
    promptSuffix: 'in a cyberpunk neon style, futuristic action figure, intricate glowing details, night lighting, cinematic 4k, transparent parts',
    imageUrl: '/style_cyber.jpg'
  },
  {
    id: 'mecha',
    name: '机甲未来',
    description: '机甲风',
    promptSuffix: 'as a highly detailed robotic mecha suit, metallic textures, hydraulic parts, armored plating, sci-fi aesthetic, Gundam inspiration',
    imageUrl: '/style_mecha.jpg'
  },
  {
    id: 'retro',
    name: '中华复古',
    description: '中式复古',
    promptSuffix: 'in a traditional Chinese masterpiece style, classical architecture elements, oriental fantasy action figure, high detail porcelain texture, ancient warrior',
    imageUrl: '/style_retro.jpg'
  },
  {
    id: 'pixel',
    name: '马赛克像素',
    description: '乐高像素',
    promptSuffix: 'made of LEGO bricks, pixel art 3d blocks style, voxel art figure, colorful construction blocks, bricklink style',
    imageUrl: '/style_pixel.jpg'
  }
];
