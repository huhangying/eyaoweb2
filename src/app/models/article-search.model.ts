export interface ArticleSearch {
  _id?: string;
  hid?: number;
  name?: string; // page section name
  cat?: string; // 类别
  title?: string;
  title_image?: string; // wx: http://mmbiz.qpic.cn/mmbiz_jpg/JM5hl86vEIzzfVY8gpLBvKQiaYAAazCO9Gbl0maVG2KpqnqQeia7o2qzQFU6tHUat71WNgRc5YZzxyNKHH8kgo2Q/0?wx_fmt=jpeg
  targetUrl?: string; // wx: http://mp.weixin.qq.com/s?__biz=MzIxNTMzNTM0MA==&mid=100000079&idx=1&sn=c5bef41ef4665408aaee381238df549f#rd
  keywords?: string; // separated by |
  author?: string; // wx
  digest?: string; // wx
  update_time?: number; // wx, in second
  updatedAt?: Date;
  createdAt?: Date;
}


export interface WxMaterial {
  total_count: number;
  item_count: number;
  item: WxMaterialItem[];
}

export interface WxMaterialItem {
  media_id: string;
  content: {
    news_item: WxMaterialNewsItem[];
  };
  update_time: number;
}

export interface WxMaterialNewsItem {
  // title: string;
  // thumb_media_id: string; // THUMB_MEDIA_ID,
  // show_cover_pic: boolean; // SHOW_COVER_PIC(0 / 1),
  // author: string;
  // digest: string;
  // content: string;
  // url: string;
  // content_source_url: string;

  title: string;
  author: string;
  digest: string;
  content: string;
  content_source_url?: string;
  thumb_media_id: string;
  show_cover_pic: number;
  url: string;
  thumb_url: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
}
