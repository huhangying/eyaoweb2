import { Injectable } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { ArticleCat } from '../models/education/article-cat.model';
import { ArticleTemplate } from '../models/education/article-template.model';
import { ArticlePage } from '../models/education/article-page.model';
import { ReportSearch } from '../report/models/report-search.model';
import { Observable } from 'rxjs';
import { ArticlePageUsage } from '../report/models/report-usage';


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

  getTemplatesByDepartmentId(department: string) {
    return this.api.get<ArticleTemplate[]>(`templates/department/${department}`);
  }

  // Article Page
  getPagesByCatId(catId: string) {
    return this.api.get<ArticlePage[]>(`pages/cat/${catId}`);
  }

  getPagesByDoctorAndCatId(doctor: string, catId: string) {
    return this.api.get<ArticlePage[]>(`pages/doctor/${doctor}/${catId}`);
  }

  savePage(page: ArticlePage) {
    return !page._id ?
      this.api.post<ArticlePage>('page', page) :
      this.api.patch<ArticlePage>('page/' + page._id, page);
  }


  pageSearch(search: ReportSearch) {
    return this.api.post<ArticlePageUsage[]>('pages/search', search) as Observable<ArticlePageUsage[]>;
  }
}
