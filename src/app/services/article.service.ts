import { Injectable } from '@angular/core';
import { ApiService } from '../my-core/service/api.service';
import { ArticleCat } from '../models/education/article-cat.model';
import { ArticleTemplate } from '../models/education/article-template.model';


@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(
    private api: ApiService,
  ) { }

  // Article Category
  getCatsByDepartmentId(department: string) {
    return this.api.get<ArticleCat[]>(`articlecats/department/${department}`);
  }

  getCatById(id: string) {
    return this.api.get<ArticleCat>(`articlecat/${id}`);
  }

  updateCat(data: ArticleCat) {
    return this.api.patch<ArticleCat>('articlecat/' + data._id, data);
  }

  createCat(data: ArticleCat) {
    return this.api.post<ArticleCat>('articlecat', data);
  }

  deleteCatById(id: string) {
    return this.api.delete<ArticleCat>('articlecat/' + id);
  }

  // Article Template
  getTemplatesByCatId(cat: string) {
    return this.api.get<ArticleTemplate[]>(`templates/cat/${cat}`);
  }

  updateTemplate(data: ArticleTemplate) {
    return this.api.patch<ArticleTemplate>('template/' + data._id, data);
  }

  createTemplate(data: ArticleTemplate) {
    return this.api.post<ArticleTemplate>('template', data);
  }

  deleteTemplateById(id: string) {
    return this.api.delete<ArticleTemplate>('template/' + id);
  }
}
