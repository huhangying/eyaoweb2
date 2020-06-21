export interface ArticlePage {
  _id?: string;
  name?: string; // page section name
  doctor: string; // id
  cat?: string; // article cat id
  title?: string;
  title_image?: string;
  content?: string;
  createdAt?: Date;
}
