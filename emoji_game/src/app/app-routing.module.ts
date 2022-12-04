import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameOverComponent } from './components/game-over/game-over.component';
import { LevelsComponent } from './components/levels/levels.component';
import { QuestionComponent } from './components/question/question.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'question', component: QuestionComponent },
  { path: 'question/:id', component: QuestionComponent },
  { path: 'levels', component: LevelsComponent },
  { path: 'game-over', component: GameOverComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
