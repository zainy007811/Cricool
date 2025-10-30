export interface Stream {
  id: number;
  title: string;
  channelName: string;
  url: string;
  isLive: boolean;
  streamType: 'youtube' | 'm3u8';
  thumbnailUrl: string;
}
