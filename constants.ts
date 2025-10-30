import type { Stream } from './types';

export const ADMIN_EMAIL = 'admin@zainy.com';
export const ADMIN_PASSWORD = '123456';

// NOTE: These are placeholder video URLs. Replace with your actual stream embed URLs.
export const STREAMS: Stream[] = [
  {
    id: 1,
    title: 'ICC T20 World Cup Final',
    channelName: 'Sky Sports Cricket',
    url: 'https://www.youtube.com/embed/live_stream?channel=UC20_32VbS1_4qTzG8T7b4Ow&autoplay=1&mute=1',
    isLive: true,
    streamType: 'youtube',
    thumbnailUrl: 'https://img.cricketworld.com/images/f-074462/t20-world-cup-trophy.jpg',
  },
  {
    id: 2,
    title: 'The Ashes: 2nd Test, Day 3',
    channelName: 'Willow TV',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    isLive: false,
    streamType: 'youtube',
    thumbnailUrl: 'https://www.thepeninsulaqatar.com/uploads/2023/06/17/post_main_cover_image/1686976964_51.jpg',
  },
  {
    id: 3,
    title: 'Pakistan Super League: Eliminator',
    channelName: 'PSL Official',
    url: 'https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1',
    isLive: false,
    streamType: 'youtube',
    thumbnailUrl: 'https://i.ytimg.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
  },
  {
    id: 4,
    title: 'Indian Premier League: Classic Highlights',
    channelName: 'Star Sports',
    url: 'https://www.youtube.com/embed/93HwORfixA4?autoplay=1&mute=1',
    isLive: false,
    streamType: 'youtube',
    thumbnailUrl: 'https://images.daznservices.com/di/library/sporting_news/4b/31/ipl-trophy-2023_132dnpst0llp315r5n4ybtdfan.jpg?t=1536445558',
  },
  {
    id: 5,
    title: 'Big Buck Bunny (M3U8 Test)',
    channelName: 'Demo Channel',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isLive: true,
    streamType: 'm3u8',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/1200px-Big_buck_bunny_poster_big.jpg',
  }
];
