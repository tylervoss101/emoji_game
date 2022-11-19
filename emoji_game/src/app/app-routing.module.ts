import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Question1Page } from './questions/question1/question1.page';
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'question1',
    redirectTo: 'question1',
    pathMatch: 'full',
  },
  {
    path: 'question2',
    redirectTo: 'question2',
    pathMatch: 'full',
  },
  {
    path: 'question1',
    loadChildren: () =>
      import('./questions/question1/question1.module').then(
        (m) => m.Question1PageModule
      ),
  },
  {
    path: 'question2',
    loadChildren: () =>
      import('./questions/question2/question2.module').then(
        (m) => m.Question2PageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
