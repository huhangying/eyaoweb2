import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('../app/pages/pages.module')
      .then(m => m.PagesModule),
  },
  {
    path: 'cms',
    loadChildren: () => import('../app/cms/cms.module')
      .then(m => m.CmsModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('../app/auth/auth.module')
      .then(m => m.AuthModule),
  },
  { path: '', redirectTo: 'cms', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/404' },
];

const config: ExtraOptions = {
  useHash: false,
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  // onSameUrlNavigation: 'reload',
  // enableTracing: true, // <-- debugging purposes only
};

@NgModule({
  imports: [
    RouterModule.forRoot(routes, config),
  ],
  exports: [RouterModule],

})
export class AppRoutingModule {
}
