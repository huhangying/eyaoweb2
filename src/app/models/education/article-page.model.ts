export interface ArticlePage {
  _id?: string;
  name?: string; // page section name
  doctor: string; // id
  doctor_name?: string;
  cat?: string; // article cat id
  title?: string;
  title_image?: string;
  content?: string;
  createdAt?: Date;
}
